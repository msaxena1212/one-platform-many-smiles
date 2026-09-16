import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { Bt as DollarSign, G as Plus, Gt as Clock, H as Receipt, Ht as CreditCard, Rt as Download, Xt as CircleQuestionMark, Yt as CircleX, c as User, fn as Calendar, kt as FileText, mt as Key, ot as LogOut, st as Lock, vn as BookOpen, wn as Award } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DJOO1b-0.mjs";
import { t as HrmsApi } from "./hrmsService-BnUqP2Oo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/employee.portal-7Sxuu9xO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HrmsEssPortal({ currentEmployee }) {
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
		tra: 1e3,
		bank_name: "Qatar National Bank (QNB)",
		iban: "QA55QNBA00000000123456",
		status: "ACTIVE"
	};
	const [activeTab, setActiveTab] = (0, import_react.useState)("my_details");
	const [leaveTypes, setLeaveTypes] = (0, import_react.useState)([]);
	const [myLeaves, setMyLeaves] = (0, import_react.useState)([]);
	const [myAttendance, setMyAttendance] = (0, import_react.useState)([]);
	const [myPayslips, setMyPayslips] = (0, import_react.useState)([]);
	const [myExpenses, setMyExpenses] = (0, import_react.useState)([]);
	const [myLoans, setMyLoans] = (0, import_react.useState)([]);
	const [myTickets, setMyTickets] = (0, import_react.useState)([]);
	const [myCourses, setMyCourses] = (0, import_react.useState)([]);
	const [applyLeaveModal, setApplyLeaveModal] = (0, import_react.useState)(false);
	const [applyExpenseModal, setApplyExpenseModal] = (0, import_react.useState)(false);
	const [applyLoanModal, setApplyLoanModal] = (0, import_react.useState)(false);
	const [applyOvertimeModal, setApplyOvertimeModal] = (0, import_react.useState)(false);
	const [submitTicketModal, setSubmitTicketModal] = (0, import_react.useState)(false);
	const [submitResignationModal, setSubmitResignationModal] = (0, import_react.useState)(false);
	const [passwordModal, setPasswordModal] = (0, import_react.useState)(false);
	const [leaveForm, setLeaveForm] = (0, import_react.useState)({
		leave_type: "Annual Leave",
		start_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		end_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		reason: ""
	});
	const [expenseForm, setExpenseForm] = (0, import_react.useState)({
		type: "Travel Expense",
		title: "",
		amount: 150,
		date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		receipt_name: "",
		notes: ""
	});
	const [loanForm, setLoanForm] = (0, import_react.useState)({
		amount: 5e3,
		tenure_months: 6,
		reason: "Personal Emergency / Relocation"
	});
	const [overtimeForm, setOvertimeForm] = (0, import_react.useState)({
		date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		hours: 3.5,
		reason: "Month-end tenant move-in rush & inventory inspection"
	});
	const [ticketForm, setTicketForm] = (0, import_react.useState)({
		category: "HR",
		subject: "",
		description: ""
	});
	const [resignationForm, setResignationForm] = (0, import_react.useState)({
		requested_lwd: new Date(Date.now() + 720 * 60 * 60 * 1e3).toISOString().split("T")[0],
		reason: ""
	});
	const [passwords, setPasswords] = (0, import_react.useState)({
		current: "",
		new_pass: "",
		confirm: ""
	});
	(0, import_react.useEffect)(() => {
		loadEssData();
	}, []);
	const loadEssData = async () => {
		try {
			setLeaveTypes(await HrmsApi.getLeaveTypes());
			setMyLeaves([{
				id: "l-1",
				type: "Annual Leave",
				start: "2026-08-10",
				end: "2026-08-15",
				days: 5,
				status: "Approved",
				reason: "Annual family holiday"
			}, {
				id: "l-2",
				type: "Casual Leave",
				start: "2026-09-02",
				end: "2026-09-02",
				days: 1,
				status: "Pending",
				reason: "Personal bank documentation"
			}]);
			setMyAttendance([
				{
					date: "2026-09-07",
					inTime: "07:55 AM",
					outTime: "05:05 PM",
					hours: 9.1,
					status: "PRESENT",
					punchSource: "Biometric Doha HQ"
				},
				{
					date: "2026-09-06",
					inTime: "08:02 AM",
					outTime: "05:00 PM",
					hours: 8.9,
					status: "PRESENT",
					punchSource: "Face Recognition"
				},
				{
					date: "2026-09-05",
					inTime: "07:50 AM",
					outTime: "05:15 PM",
					hours: 9.4,
					status: "PRESENT",
					punchSource: "Biometric Doha HQ"
				},
				{
					date: "2026-09-04",
					inTime: "—",
					outTime: "—",
					hours: 0,
					status: "WEEK_OFF",
					punchSource: "System Schedule"
				}
			]);
			setMyPayslips([
				{
					month: "August 2026",
					basic: 8500,
					allowances: 3500,
					gross: 12e3,
					deductions: 0,
					net: 12e3,
					status: "Paid",
					paidAt: "2026-08-31"
				},
				{
					month: "July 2026",
					basic: 8500,
					allowances: 3500,
					gross: 12e3,
					deductions: 0,
					net: 12e3,
					status: "Paid",
					paidAt: "2026-07-31"
				},
				{
					month: "June 2026",
					basic: 8500,
					allowances: 3500,
					gross: 12e3,
					deductions: 0,
					net: 12e3,
					status: "Paid",
					paidAt: "2026-06-30"
				}
			]);
			setMyExpenses([{
				id: "exp-1",
				title: "Property Inspection Fuel & Parking",
				amount: 180,
				type: "Travel Expense",
				date: "2026-09-01",
				status: "Approved"
			}, {
				id: "exp-2",
				title: "Tenant Welcome Hospitality Box",
				amount: 250,
				type: "Reimbursement Expense",
				date: "2026-08-25",
				status: "Reimbursed"
			}]);
			setMyLoans([{
				id: "ln-1",
				amount: 1e4,
				emi: 1666,
				tenure: "6 Months",
				remaining: 3334,
				status: "Active",
				reason: "Annual Housing Advance"
			}]);
			setMyTickets([{
				id: "tkt-01",
				number: "TKT-892110",
				subject: "Salary Certificate for Embassy Visa",
				category: "HR Letters",
				status: "Resolved",
				date: "2026-08-20"
			}, {
				id: "tkt-02",
				number: "TKT-901423",
				subject: "Dual Monitor Setup for Leasing Desk",
				category: "IT Hardware",
				status: "In_Progress",
				date: "2026-09-02"
			}]);
			setMyCourses([
				{
					id: "c-1",
					title: "Qatar Real Estate Regulatory Law & Tenancy Standards",
					category: "Property Management",
					progress: "85%",
					status: "In Progress"
				},
				{
					id: "c-2",
					title: "Fire Safety & Facility Emergency Procedures",
					category: "Health & Safety",
					progress: "100%",
					status: "Completed"
				},
				{
					id: "c-3",
					title: "Advanced Financial Ledger Posting & AP Workflow",
					category: "ERP Training",
					progress: "40%",
					status: "In Progress"
				}
			]);
		} catch (e) {
			console.error(e);
		}
	};
	const handleApplyLeave = (e) => {
		e.preventDefault();
		setMyLeaves([{
			id: `l-${Date.now()}`,
			type: leaveForm.leave_type,
			start: leaveForm.start_date,
			end: leaveForm.end_date,
			days: 2,
			status: "Pending",
			reason: leaveForm.reason
		}, ...myLeaves]);
		toast.success("Leave application submitted to reporting manager!");
		setApplyLeaveModal(false);
	};
	const handleCancelLeave = (id) => {
		setMyLeaves(myLeaves.map((l) => l.id === id ? {
			...l,
			status: "Cancelled"
		} : l));
		toast.success("Leave application cancelled successfully");
	};
	const handleSubmitExpense = (e) => {
		e.preventDefault();
		setMyExpenses([{
			id: `exp-${Date.now()}`,
			title: expenseForm.title,
			amount: expenseForm.amount,
			type: expenseForm.type,
			date: expenseForm.date,
			status: "Pending"
		}, ...myExpenses]);
		toast.success("Expense claim submitted for review!");
		setApplyExpenseModal(false);
	};
	const handleSubmitLoan = (e) => {
		e.preventDefault();
		setMyLoans([{
			id: `ln-${Date.now()}`,
			amount: loanForm.amount,
			emi: Math.round(loanForm.amount / loanForm.tenure_months),
			tenure: `${loanForm.tenure_months} Months`,
			remaining: loanForm.amount,
			status: "Under Review",
			reason: loanForm.reason
		}, ...myLoans]);
		toast.success("Loan application registered for HR & Finance approval!");
		setApplyLoanModal(false);
	};
	const handleSubmitOvertime = (e) => {
		e.preventDefault();
		toast.success(`Overtime request of ${overtimeForm.hours} hours logged for ${overtimeForm.date}!`);
		setApplyOvertimeModal(false);
	};
	const handleSubmitTicket = (e) => {
		e.preventDefault();
		const newTkt = {
			id: `tkt-${Date.now()}`,
			number: `TKT-${Math.floor(1e5 + Math.random() * 9e5)}`,
			subject: ticketForm.subject,
			category: ticketForm.category,
			status: "Open",
			date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
		};
		setMyTickets([newTkt, ...myTickets]);
		toast.success(`Service ticket ${newTkt.number} submitted!`);
		setSubmitTicketModal(false);
	};
	const handleSubmitResignation = (e) => {
		e.preventDefault();
		toast.success("Notice submitted. Resignation workflow and notice period initiated.");
		setSubmitResignationModal(false);
	};
	const handleChangePassword = (e) => {
		e.preventDefault();
		if (passwords.new_pass !== passwords.confirm) {
			toast.error("New passwords do not match");
			return;
		}
		toast.success("Password updated successfully!");
		setPasswordModal(false);
	};
	const ESS_NAV_TABS = [
		{
			key: "my_details",
			label: "My Profile Details",
			icon: User
		},
		{
			key: "attendance",
			label: "Punch Attendance",
			icon: Clock
		},
		{
			key: "leaves",
			label: "Apply Leave",
			icon: Calendar
		},
		{
			key: "cancel_leave",
			label: "Cancel Leave",
			icon: CircleX
		},
		{
			key: "payslips",
			label: "My Payslips",
			icon: DollarSign
		},
		{
			key: "tax_declaration",
			label: "Tax Declaration",
			icon: FileText
		},
		{
			key: "expenses",
			label: "Claim Expense",
			icon: Receipt
		},
		{
			key: "loans",
			label: "Apply Loan",
			icon: CreditCard
		},
		{
			key: "appraisal",
			label: "Self Assessment",
			icon: Award
		},
		{
			key: "learning",
			label: "Learning Gallery",
			icon: BookOpen
		},
		{
			key: "helpdesk",
			label: "Help Desk",
			icon: CircleQuestionMark
		},
		{
			key: "templates",
			label: "Templates & Letters",
			icon: Download
		},
		{
			key: "resignation",
			label: "Notice & Exit",
			icon: LogOut
		},
		{
			key: "change_password",
			label: "Change Password",
			icon: Key
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 animate-in fade-in duration-300",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary text-2xl border border-primary/20",
						children: [employee.first_name[0], employee.last_name[0]]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "text-xl font-bold tracking-tight",
								children: [
									employee.first_name,
									" ",
									employee.last_name
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: "bg-emerald-600 hover:bg-emerald-700 text-xs",
								children: "Active Staff"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: [
								employee.designation,
								" • ",
								employee.department,
								" • ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono font-semibold text-primary",
									children: employee.employee_id_code
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] text-muted-foreground mt-1",
							children: [
								employee.branch,
								" • ",
								employee.entity
							]
						})
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setPasswordModal(true),
						className: "gap-1.5 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3.5 w-3.5" }), " Change Password"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => setApplyLeaveModal(true),
						className: "gap-1.5 bg-primary text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Apply Leave"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex overflow-x-auto pb-1 gap-1.5 border-b no-scrollbar",
				children: ESS_NAV_TABS.map((tab) => {
					const Icon = tab.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab(tab.key),
						className: `flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? "bg-primary text-primary-foreground shadow-xs font-semibold" : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5" }), tab.label]
					}, tab.key);
				})
			}),
			activeTab === "my_details" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base font-semibold",
						children: "Personal & Organizational Dossier"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Verified personal details, official contacts, and employment records" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg border bg-muted/20",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground block",
									children: "Full Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-semibold text-sm",
									children: [
										employee.first_name,
										" ",
										employee.last_name
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg border bg-muted/20",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground block",
									children: "Official Email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-sm",
									children: employee.email
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg border bg-muted/20",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground block",
									children: "Official Contact"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-sm",
									children: employee.mobile_number
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg border bg-muted/20",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground block",
									children: "Personal Email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-sm",
									children: employee.personal_email
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg border bg-muted/20",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground block",
									children: "Date of Joining"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-sm",
									children: employee.date_of_joining
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg border bg-muted/20",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground block",
									children: "Work Location / Branch"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-sm",
									children: employee.branch
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg border bg-muted/20",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground block",
									children: "Primary Entity"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-sm",
									children: employee.entity
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg border bg-muted/20",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground block",
										children: "Bank Account & IBAN"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-sm",
										children: employee.bank_name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block font-mono text-[10px] text-muted-foreground mt-0.5",
										children: employee.iban
									})
								]
							})
						]
					}) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base font-semibold",
						children: "Compensation Snapshot"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Monthly salary component breakdown" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-3 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between py-2 border-b",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Basic Pay:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-semibold",
									children: [employee.basic_salary.toLocaleString(), " QAR"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between py-2 border-b",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "House Rent Allowance (HRA):"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-semibold text-emerald-600",
									children: [
										"+",
										employee.hra.toLocaleString(),
										" QAR"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between py-2 border-b",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Transport Allowance (TRA):"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-semibold text-emerald-600",
									children: [
										"+",
										employee.tra.toLocaleString(),
										" QAR"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between py-3 border-t-2 border-primary/20 text-sm font-bold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Net Monthly Gross:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-primary",
									children: [(employee.basic_salary + employee.hra + employee.tra).toLocaleString(), " QAR"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "w-full text-xs gap-1.5 mt-2",
								onClick: () => setActiveTab("payslips"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-3.5 w-3.5" }), " View Detailed Payslips"]
							})
						]
					})]
				})]
			}),
			activeTab === "leaves" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-col sm:flex-row justify-between sm:items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold",
					children: "Leave Applications & Balance Quotas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Apply for annual, sick, or casual leaves and track approval stage" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setApplyLeaveModal(true),
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Apply Leave"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 rounded-xl border bg-blue-50/50 dark:bg-blue-950/20",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground block",
									children: "Annual Leave Quota"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-2xl font-bold text-blue-600 mt-1 block",
									children: "18 / 30"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-muted-foreground",
									children: "12 Days taken this cycle"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground block",
									children: "Casual & Emergency"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-2xl font-bold text-emerald-600 mt-1 block",
									children: "5 / 7"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-muted-foreground",
									children: "2 Days utilized"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 rounded-xl border bg-purple-50/50 dark:bg-purple-950/20",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground block",
									children: "Sick / Medical Leave"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-2xl font-bold text-purple-600 mt-1 block",
									children: "14 / 14"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-muted-foreground",
									children: "Fully available"
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg border overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
						className: "bg-muted/50",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Leave Type" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Duration" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Total Days" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Reason" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Actions"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: myLeaves.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-semibold text-xs",
							children: l.type
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-xs",
							children: [
								l.start,
								" to ",
								l.end
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-xs font-bold",
							children: [l.days, " Days"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs text-muted-foreground",
							children: l.reason
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: l.status === "Approved" ? "default" : l.status === "Pending" ? "outline" : "destructive",
							children: l.status
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: l.status === "Pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => handleCancelLeave(l.id),
								className: "h-7 text-xs text-rose-600 hover:text-rose-700",
								children: "Cancel Request"
							})
						})
					] }, l.id)) })] })
				})]
			})] }),
			activeTab === "attendance" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-col sm:flex-row justify-between sm:items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base font-semibold",
						children: "Attendance Log & Overtime"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Daily punch timestamps, working hours, and overtime requests" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setApplyOvertimeModal(true),
						variant: "outline",
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Request Overtime"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg border overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
						className: "bg-muted/50",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "First In Punch" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Last Out Punch" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Hours Logged" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Source / Device" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: myAttendance.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-semibold text-xs",
							children: a.date
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs text-emerald-600",
							children: a.inTime
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs text-blue-600",
							children: a.outTime
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-xs font-bold",
							children: [a.hours, "h"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs text-muted-foreground",
							children: a.punchSource
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: a.status === "PRESENT" ? "default" : "secondary",
							children: a.status
						}) })
					] }, i)) })] })
				}) })] })
			}),
			activeTab === "payslips" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base font-semibold",
				children: "Monthly Salary Pay Slips"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Disbursed payslips with breakdown and download receipt" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
					className: "bg-muted/50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Payroll Cycle" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Basic Salary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Allowances" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Gross Earnings" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Deductions" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Net Disbursed" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Payslip PDF"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: myPayslips.map((p, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-semibold text-xs",
						children: p.month
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-xs",
						children: [p.basic.toLocaleString(), " QAR"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-xs text-emerald-600",
						children: [
							"+",
							p.allowances.toLocaleString(),
							" QAR"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-xs font-semibold",
						children: [p.gross.toLocaleString(), " QAR"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-xs text-rose-600",
						children: [
							"-",
							p.deductions.toLocaleString(),
							" QAR"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-xs font-bold text-primary",
						children: [p.net.toLocaleString(), " QAR"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						className: "bg-emerald-600 hover:bg-emerald-700",
						children: p.status
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => toast.success(`Downloaded payslip for ${p.month}`),
							className: "h-7 text-xs gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3 w-3" }), " Download"]
						})
					})
				] }, idx)) })] })
			}) })] }),
			activeTab === "expenses" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-col sm:flex-row justify-between sm:items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold",
					children: "Travel & Out-of-Pocket Claims"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "File travel expenses, tenant entertainment, and official purchases" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setApplyExpenseModal(true),
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Submit Claim"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
					className: "bg-muted/50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Claim Title" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Category" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Amount" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" })
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: myExpenses.map((exp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-semibold text-xs",
						children: exp.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs text-muted-foreground",
						children: exp.type
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: exp.date
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-xs font-bold text-primary",
						children: [exp.amount, " QAR"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: exp.status === "Approved" || exp.status === "Reimbursed" ? "default" : "outline",
						children: exp.status
					}) })
				] }, exp.id)) })] })
			}) })] }),
			activeTab === "loans" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-col sm:flex-row justify-between sm:items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold",
					children: "Staff Loans & Salary Advances"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Apply for emergency advances and track EMI deduction schedules" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setApplyLoanModal(true),
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Apply for Loan"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
					className: "bg-muted/50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Principal Amount" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Monthly EMI" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Tenure" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Remaining Balance" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Purpose" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" })
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: myLoans.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "font-bold text-xs",
						children: [l.amount.toLocaleString(), " QAR"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-xs text-rose-600 font-semibold",
						children: [l.emi.toLocaleString(), " QAR/Mo"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: l.tenure
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-xs font-mono",
						children: [l.remaining.toLocaleString(), " QAR"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs text-muted-foreground",
						children: l.reason
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: l.status }) })
				] }, l.id)) })] })
			}) })] }),
			activeTab === "appraisal" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold",
					children: "Self Assessment & Annual KPA Evaluation"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Complete your personal appraisal score and peer review questions" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "space-y-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 rounded-xl border bg-card space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "font-bold text-sm",
									children: "2026 Annual Appraisal Cycle"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Self-assessment phase open until 30 Sept 2026"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "bg-emerald-600",
									children: "Active Review"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 rounded border",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground block",
												children: "Key Goal 1"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold",
												children: "Lease Renewals & Tenant Retention"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-emerald-600 text-[11px] mt-1",
												children: "Status: Exceeded Target (98%)"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 rounded border",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground block",
												children: "Key Goal 2"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold",
												children: "Move-In Inspection Turnaround"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-emerald-600 text-[11px] mt-1",
												children: "Status: On Track (<24h)"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 rounded border",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground block",
												children: "Key Goal 3"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold",
												children: "Audit & Lease Archival Compliance"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-blue-600 text-[11px] mt-1",
												children: "Status: 100% Compliant"
											})
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Employee Self-Reflection Summary"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 3,
										placeholder: "Document your key achievements, challenges solved, and development goals...",
										className: "mt-1 text-xs",
										defaultValue: "Achieved 104% of quarterly leasing target and assisted with ERP automation onboarding."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex justify-end mt-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											onClick: () => toast.success("Self assessment remarks saved!"),
											children: "Save Assessment Draft"
										})
									})
								]
							})
						]
					})
				})] })
			}),
			activeTab === "learning" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-row items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold",
					children: "Learning Gallery & Course Enrollments"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Professional real estate, ERP, and compliance training modules" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => toast.info("Browsing course catalog..."),
					children: "Browse Full Catalog"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
				children: myCourses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 rounded-xl border bg-card space-y-2 hover:border-primary/50 transition-colors",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-start",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "text-[10px]",
								children: c.category
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: c.status === "Completed" ? "default" : "secondary",
								className: "text-[10px]",
								children: c.status
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "font-bold text-xs leading-snug line-clamp-2",
							children: c.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1 pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-[10px] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Progress:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-primary",
									children: c.progress
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-full bg-muted rounded-full h-1.5 overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "bg-primary h-1.5 rounded-full",
									style: { width: c.progress }
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							className: "w-full text-xs mt-2",
							onClick: () => toast.info(`Resuming ${c.title}...`),
							children: "Resume Course"
						})
					]
				}, c.id))
			}) })] }),
			activeTab === "helpdesk" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-col sm:flex-row justify-between sm:items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold",
					children: "Service Tickets & Grievances"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Submit HR requests, letter issuances, IT queries, and workplace tickets" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setSubmitTicketModal(true),
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Log Service Ticket"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
					className: "bg-muted/50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Ticket #" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Subject" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Category" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date Logged" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" })
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: myTickets.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono font-semibold text-xs text-primary",
						children: t.number
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs font-medium",
						children: t.subject
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs text-muted-foreground",
						children: t.category
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: t.date
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: t.status === "Resolved" ? "default" : "outline",
						children: t.status
					}) })
				] }, t.id)) })] })
			}) })] }),
			activeTab === "documents" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base font-semibold",
				children: "Official HR Templates & Declaration Forms"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Download company letters, tax declarations, and signed employee forms" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
				children: [
					{
						title: "Standard Salary Certificate & Embassy NOC",
						code: "TMPL-NOC",
						type: "Word / PDF"
					},
					{
						title: "Annual Income Tax & Remittance Declaration Form",
						code: "FORM-TAX-2026",
						type: "PDF Form"
					},
					{
						title: "Company Asset & IT Equipment Clearance Handover",
						code: "FORM-ASSET-CL",
						type: "PDF Form"
					},
					{
						title: "Employee Health & Group Insurance Claim Form",
						code: "FORM-INSUR-MED",
						type: "PDF Form"
					}
				].map((doc, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 rounded-xl border bg-card flex justify-between items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "font-bold text-xs",
						children: doc.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] text-muted-foreground font-mono mt-0.5",
						children: [
							doc.code,
							" • ",
							doc.type
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => toast.success(`Downloaded ${doc.title}`),
						className: "h-8 text-xs gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Download"]
					})]
				}, idx))
			}) })] }),
			activeTab === "resignation" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-col sm:flex-row justify-between sm:items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold",
					children: "Resignation & Notice Period Portal"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Formal notice submission, handover timeline, and Full & Final gratuity tracking" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setSubmitResignationModal(true),
					variant: "destructive",
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), " Log Notice / Resignation"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 rounded-xl border bg-muted/20 space-y-2 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "font-bold text-sm",
						children: "Policy Notice Period Guidelines"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted-foreground leading-relaxed",
						children: [
							"As per your employment contract and Qatar Labor Law, your designated notice period is ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "30 Days" }),
							". Upon notice submission, the Knowledge Transfer (KT) schedule and Departmental Clearances (IT, Finance, Facility) will be initiated automatically."
						]
					})]
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: applyLeaveModal,
				onOpenChange: setApplyLeaveModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Apply for Leave" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleApplyLeave,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Leave Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: leaveForm.leave_type,
								onValueChange: (val) => setLeaveForm({
									...leaveForm,
									leave_type: val
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Annual Leave",
										children: "Annual Leave"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Casual Leave",
										children: "Casual & Emergency"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Sick Leave",
										children: "Sick / Medical Leave"
									})
								] })]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Start Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: leaveForm.start_date,
									onChange: (e) => setLeaveForm({
										...leaveForm,
										start_date: e.target.value
									})
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "End Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: leaveForm.end_date,
									onChange: (e) => setLeaveForm({
										...leaveForm,
										end_date: e.target.value
									})
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Reason for Leave *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								required: true,
								value: leaveForm.reason,
								onChange: (e) => setLeaveForm({
									...leaveForm,
									reason: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setApplyLeaveModal(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Submit Request"
							})] })
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: applyExpenseModal,
				onOpenChange: setApplyExpenseModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Submit Expense Claim" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmitExpense,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Expense Category" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: expenseForm.type,
								onValueChange: (val) => setExpenseForm({
									...expenseForm,
									type: val
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Travel Expense",
										children: "Travel & Fuel Expense"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Reimbursement Expense",
										children: "Food & Client Hospitality"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Other Expense",
										children: "Petty Purchases / Supplies"
									})
								] })]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Claim Title *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								required: true,
								placeholder: "e.g. Fuel for 4 Property Inspections",
								value: expenseForm.title,
								onChange: (e) => setExpenseForm({
									...expenseForm,
									title: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Amount (QAR) *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									required: true,
									value: expenseForm.amount,
									onChange: (e) => setExpenseForm({
										...expenseForm,
										amount: Number(e.target.value)
									})
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Expense Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: expenseForm.date,
									onChange: (e) => setExpenseForm({
										...expenseForm,
										date: e.target.value
									})
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Attach Receipt File" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "file",
								className: "text-xs"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setApplyExpenseModal(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Submit Claim"
							})] })
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: applyLoanModal,
				onOpenChange: setApplyLoanModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Apply for Salary Advance / Loan" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmitLoan,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Loan Amount (QAR) *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									required: true,
									value: loanForm.amount,
									onChange: (e) => setLoanForm({
										...loanForm,
										amount: Number(e.target.value)
									})
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tenure (Months)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 1,
									max: 24,
									value: loanForm.tenure_months,
									onChange: (e) => setLoanForm({
										...loanForm,
										tenure_months: Number(e.target.value)
									})
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded bg-muted/40 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Calculated Monthly Recovery:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-bold text-primary block mt-0.5",
									children: [Math.round(loanForm.amount / (loanForm.tenure_months || 1)).toLocaleString(), " QAR / Month"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Reason / Purpose *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								required: true,
								value: loanForm.reason,
								onChange: (e) => setLoanForm({
									...loanForm,
									reason: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setApplyLoanModal(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Submit Loan Application"
							})] })
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: applyOvertimeModal,
				onOpenChange: setApplyOvertimeModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Log Overtime Work Request" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmitOvertime,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Date of Overtime" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: overtimeForm.date,
									onChange: (e) => setOvertimeForm({
										...overtimeForm,
										date: e.target.value
									})
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Hours (e.g. 3.5)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									step: "0.5",
									value: overtimeForm.hours,
									onChange: (e) => setOvertimeForm({
										...overtimeForm,
										hours: Number(e.target.value)
									})
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Work Scope / Justification *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								required: true,
								value: overtimeForm.reason,
								onChange: (e) => setOvertimeForm({
									...overtimeForm,
									reason: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setApplyOvertimeModal(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Submit Overtime"
							})] })
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: submitTicketModal,
				onOpenChange: setSubmitTicketModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Log Help Desk / Grievance Ticket" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmitTicket,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Category" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: ticketForm.category,
								onValueChange: (val) => setTicketForm({
									...ticketForm,
									category: val
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "HR Letters",
										children: "HR & Letters"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "IT Hardware",
										children: "IT & Hardware"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Payroll Discrepancy",
										children: "Payroll & Accounts"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Workplace Ethics",
										children: "Workplace & Facility"
									})
								] })]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Subject *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								required: true,
								placeholder: "e.g. Embassy NOC Letter Request",
								value: ticketForm.subject,
								onChange: (e) => setTicketForm({
									...ticketForm,
									subject: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Details *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								required: true,
								rows: 3,
								value: ticketForm.description,
								onChange: (e) => setTicketForm({
									...ticketForm,
									description: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setSubmitTicketModal(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Submit Ticket"
							})] })
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: submitResignationModal,
				onOpenChange: setSubmitResignationModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Formal Notice & Resignation" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmitResignation,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Requested Last Working Day" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: resignationForm.requested_lwd,
								onChange: (e) => setResignationForm({
									...resignationForm,
									requested_lwd: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Reason for Separation *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								required: true,
								rows: 3,
								placeholder: "State your reason for resigning...",
								value: resignationForm.reason,
								onChange: (e) => setResignationForm({
									...resignationForm,
									reason: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setSubmitResignationModal(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "destructive",
								children: "Submit Notice"
							})] })
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: passwordModal,
				onOpenChange: setPasswordModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Change Account Password" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleChangePassword,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Current Password" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "password",
								required: true,
								value: passwords.current,
								onChange: (e) => setPasswords({
									...passwords,
									current: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "New Password" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "password",
								required: true,
								value: passwords.new_pass,
								onChange: (e) => setPasswords({
									...passwords,
									new_pass: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Confirm New Password" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "password",
								required: true,
								value: passwords.confirm,
								onChange: (e) => setPasswords({
									...passwords,
									confirm: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setPasswordModal(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Update Password"
							})] })
						]
					})]
				})
			})
		]
	});
}
function EmployeePortalPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HrmsEssPortal, {});
}
//#endregion
export { EmployeePortalPage as component };
