import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { A as ShieldCheck, An as ArrowLeftRight, At as FileSpreadsheet, Bt as DollarSign, Gt as Clock, H as Receipt, Ht as CreditCard, Kt as ClipboardList, L as Scale, M as Settings, Mn as Activity, Mt as FileCheck, Qt as CircleMinus, Sn as Banknote, Tt as GitBranch, V as RefreshCw, Vt as Database, Z as Package, Zt as CirclePlus, _ as TrendingDown, _t as Inbox, dn as ChartColumn, dt as Layers, f as UserCheck, fn as Calendar, g as TrendingUp, gn as Building2, h as TriangleAlert, it as MapPin, j as ShieldAlert, jt as FilePenLine, kt as FileText, ln as ChartPie, m as Truck, mt as Key, o as Wallet, ot as LogOut, pt as Landmark, r as Wrench, rt as Megaphone, s as Users, st as Lock, ut as LayoutDashboard, vn as BookOpen, vt as House, wn as Award, wt as Globe, y as Ticket, yn as Bell, zt as DoorOpen } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/console-config-CLs2PqkZ.js
var import_jsx_runtime = require_jsx_runtime();
var consoleConfigs = {
	portal: {
		variant: "portal",
		consoleLabel: "Tenant Portal",
		titleFallback: "Tenant Portal",
		user: {
			initials: "TP",
			name: "Tenant User",
			meta: "Payments and maintenance self service"
		},
		navModules: [
			{
				module: "My Home",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-4 w-4" }),
				color: "text-sky-500",
				bg: "bg-sky-500/10",
				activeBg: "bg-sky-500",
				groups: [{
					group: "Home",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-3.5 w-3.5" }),
					color: "text-sky-500",
					bg: "bg-sky-500/10",
					items: [
						{
							to: "/portal",
							label: "Overview",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/portal/payments",
							label: "Payments",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/portal/documents",
							label: "Documents",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
						}
					]
				}]
			},
			{
				module: "Services",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-4 w-4" }),
				color: "text-orange-500",
				bg: "bg-orange-500/10",
				activeBg: "bg-orange-500",
				groups: [{
					group: "Requests",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-3.5 w-3.5" }),
					color: "text-orange-500",
					bg: "bg-orange-500/10",
					items: [
						{
							to: "/portal/tickets",
							label: "Maintenance Tickets",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ticket, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/portal/bookings",
							label: "Bookings",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/portal/community",
							label: "Community",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
						}
					]
				}]
			},
			{
				module: "Account",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-4 w-4" }),
				color: "text-slate-500",
				bg: "bg-slate-500/10",
				activeBg: "bg-slate-500",
				groups: [{
					group: "Account Settings",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" }),
					color: "text-slate-500",
					bg: "bg-slate-500/10",
					items: [{
						to: "/portal/settings",
						label: "Account Settings",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" })
					}]
				}]
			}
		],
		titleRules: [
			{
				match: "/portal",
				title: "Tenant Overview"
			},
			{
				match: "/portal/tickets",
				title: "Maintenance Tickets"
			},
			{
				match: "/portal/payments",
				title: "Payments"
			},
			{
				match: "/portal/documents",
				title: "Documents"
			},
			{
				match: "/portal/settings",
				title: "Account Settings"
			},
			{
				match: "/portal/bookings",
				title: "Bookings"
			},
			{
				match: "/portal/community",
				title: "Community"
			}
		]
	},
	"prop-mgr": {
		variant: "host",
		consoleLabel: "Property Manager Console",
		titleFallback: "Property Manager Console",
		user: {
			initials: "PM",
			name: "Property Manager",
			meta: "Portfolio operations and approvals"
		},
		navModules: [
			{
				module: "Portfolio",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4" }),
				color: "text-blue-500",
				bg: "bg-blue-500/10",
				activeBg: "bg-blue-500",
				groups: [{
					group: "Overview",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-3.5 w-3.5" }),
					color: "text-blue-500",
					bg: "bg-blue-500/10",
					items: [
						{
							to: "/prop-mgr",
							label: "Dashboard",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/properties",
							label: "Properties",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/units",
							label: "Units",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoorOpen, { className: "h-3.5 w-3.5" })
						}
					]
				}]
			},
			{
				module: "Leasing",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-4 w-4" }),
				color: "text-emerald-500",
				bg: "bg-emerald-500/10",
				activeBg: "bg-emerald-500",
				groups: [{
					group: "Lease Lifecycle",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-3.5 w-3.5" }),
					color: "text-emerald-500",
					bg: "bg-emerald-500/10",
					items: [
						{
							to: "/prop-mgr/leasing",
							search: { tab: "customers" },
							label: "Customer Master",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/leasing",
							search: { tab: "reservations" },
							label: "Reservations",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/leasing",
							search: { tab: "documents" },
							label: "Documents",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/leasing",
							search: { tab: "agreement" },
							label: "Agreement Terms",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/leasing",
							search: { tab: "signatures" },
							label: "Signatures",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/leasing",
							search: { tab: "keys" },
							label: "Keys & Check-In",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/leasing",
							search: { tab: "vouchers" },
							label: "Vouchers",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/leasing",
							search: { tab: "renewals" },
							label: "Renewals",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/leasing",
							search: { tab: "checkout" },
							label: "Checkout",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/leasing",
							search: { tab: "audit" },
							label: "Audit Flow",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/leases",
							label: "All Leases",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-3.5 w-3.5" })
						}
					]
				}]
			},
			{
				module: "Finance",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-4 w-4" }),
				color: "text-violet-500",
				bg: "bg-violet-500/10",
				activeBg: "bg-violet-500",
				groups: [
					{
						group: "Setup",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" }),
						color: "text-blue-500",
						bg: "bg-blue-500/10",
						items: [
							{
								to: "/prop-mgr/finance",
								search: { tab: "financial_year" },
								label: "Financial Year",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "region" },
								label: "Region",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "vendor_list" },
								label: "Vendor List",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "customer_list" },
								label: "Customer List",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "cost_center" },
								label: "Cost Center",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "budget_head" },
								label: "Budget Head & Type",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPie, { className: "h-3.5 w-3.5" })
							}
						]
					},
					{
						group: "Core Finance",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" }),
						color: "text-emerald-500",
						bg: "bg-emerald-500/10",
						items: [
							{
								to: "/prop-mgr/finance",
								search: { tab: "finance_dashboard" },
								label: "Finance Dashboard",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "posting_period" },
								label: "Posting Period",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "chart_of_accounts" },
								label: "Chart Of Account",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "journal_ledger" },
								label: "Journal Ledger",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "credit_debit_builder" },
								label: "Credit Debit Builder",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
							}
						]
					},
					{
						group: "Payments",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" }),
						color: "text-purple-500",
						bg: "bg-purple-500/10",
						items: [
							{
								to: "/prop-mgr/finance",
								search: { tab: "grn_cost_mapping" },
								label: "GRN Cost Mapping",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "payable_invoice" },
								label: "Payable Invoice",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "journal_voucher" },
								label: "Journal Voucher",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "payment_voucher" },
								label: "Payment Voucher",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "receivable_invoice" },
								label: "Receivable Invoice",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "receipt_voucher" },
								label: "Receipt Voucher",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "debit_note" },
								label: "Debit Note",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMinus, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "credit_note" },
								label: "Credit Note",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "h-3.5 w-3.5" })
							}
						]
					},
					{
						group: "Receivables",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3.5 w-3.5" }),
						color: "text-orange-500",
						bg: "bg-orange-500/10",
						items: [
							{
								to: "/prop-mgr/finance",
								search: { tab: "pdc_management" },
								label: "PDC Management",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "deposits_guarantees" },
								label: "Deposits & Guarantees",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "legal_receivables" },
								label: "Legal Receivables",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "payroll_sync" },
								label: "Payroll Sync Engine",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
							}
						]
					},
					{
						group: "Banking",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-3.5 w-3.5" }),
						color: "text-amber-500",
						bg: "bg-amber-500/10",
						items: [
							{
								to: "/prop-mgr/finance",
								search: { tab: "bank" },
								label: "Bank",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "bank_account" },
								label: "Bank Account",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "bank_clearance" },
								label: "Bank Clearance",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "bank_reconciliation" },
								label: "Bank Reconciliation",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "bank_reconciliation_statement_list" },
								label: "Reconciliation Statements",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
							}
						]
					},
					{
						group: "Finance Reports",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPie, { className: "h-3.5 w-3.5" }),
						color: "text-rose-500",
						bg: "bg-rose-500/10",
						items: [
							{
								to: "/prop-mgr/finance",
								search: { tab: "revenue_generation" },
								label: "Revenue Generation",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "trial_balance_simple" },
								label: "Trial Balance (Simple)",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "trial_balance" },
								label: "Trial Balance",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "profit_and_loss" },
								label: "Profit & Loss",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "balance_sheet" },
								label: "Balance Sheet",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "general_ledger" },
								label: "General Ledger",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "cash_flow_statement" },
								label: "Cash Flow Statement",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "cash_book" },
								label: "Cash Book",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "petty_cash_book" },
								label: "Petty Cash Book",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/finance",
								search: { tab: "cash_on_hand" },
								label: "Cash On Hand",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" })
							}
						]
					}
				]
			},
			{
				module: "Assets",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4" }),
				color: "text-amber-500",
				bg: "bg-amber-500/10",
				activeBg: "bg-amber-500",
				groups: [{
					group: "Asset Management",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" }),
					color: "text-amber-500",
					bg: "bg-amber-500/10",
					items: [
						{
							to: "/prop-mgr/assets",
							search: { tab: "registry" },
							label: "Asset Registry",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/assets",
							search: { tab: "depreciation" },
							label: "Asset Depreciation",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/assets",
							search: { tab: "allocation" },
							label: "Asset Allocation",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftRight, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/assets",
							search: { tab: "warranty" },
							label: "Asset Warranty",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/assets",
							search: { tab: "maintenance" },
							label: "Asset Maintenance",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/assets",
							search: { tab: "revaluation" },
							label: "Asset Revaluation",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/assets",
							search: { tab: "sell" },
							label: "Asset Sale",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/assets",
							search: { tab: "writeoff" },
							label: "Asset Write-off",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3.5 w-3.5" })
						}
					]
				}]
			},
			{
				module: "Procurement",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-4 w-4" }),
				color: "text-cyan-500",
				bg: "bg-cyan-500/10",
				activeBg: "bg-cyan-500",
				groups: [
					{
						group: "Procurement Operations",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-3.5 w-3.5" }),
						color: "text-cyan-500",
						bg: "bg-cyan-500/10",
						items: [
							{
								to: "/prop-mgr/procurement",
								search: { tab: "requests" },
								label: "Purchase Requests",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/procurement",
								search: { tab: "orders" },
								label: "Purchase Orders",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/procurement",
								search: { tab: "shipments" },
								label: "Shipments",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/prop-mgr/procurement",
								search: { tab: "receiving" },
								label: "GRN / Receiving",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" })
							}
						]
					},
					{
						group: "Vendor & Sourcing",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" }),
						color: "text-violet-500",
						bg: "bg-violet-500/10",
						items: [{
							to: "/prop-mgr/procurement",
							search: { tab: "rfx" },
							label: "RFX / Tenders",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
						}, {
							to: "/prop-mgr/procurement",
							search: { tab: "quotations" },
							label: "Quotations",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5" })
						}]
					},
					{
						group: "Approvals & Invoices",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" }),
						color: "text-emerald-500",
						bg: "bg-emerald-500/10",
						items: [{
							to: "/prop-mgr/procurement",
							search: { tab: "inbox" },
							label: "Approval Inbox",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "h-3.5 w-3.5" })
						}, {
							to: "/prop-mgr/procurement",
							search: { tab: "invoices" },
							label: "Payable Invoices",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" })
						}]
					},
					{
						group: "Control Tower",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-3.5 w-3.5" }),
						color: "text-rose-500",
						bg: "bg-rose-500/10",
						items: [{
							to: "/prop-mgr/procurement",
							search: { tab: "dashboard" },
							label: "Procurement Analytics",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-3.5 w-3.5" })
						}, {
							to: "/prop-mgr/procurement",
							search: { tab: "supplier_perf" },
							label: "Supplier Scorecards",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-3.5 w-3.5" })
						}]
					},
					{
						group: "Asset & Maintenance Integration",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" }),
						color: "text-amber-500",
						bg: "bg-amber-500/10",
						items: [{
							to: "/prop-mgr/procurement",
							search: { tab: "assets" },
							label: "Asset Linkage",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" })
						}, {
							to: "/prop-mgr/procurement",
							search: { tab: "maintenance" },
							label: "Maintenance Stock",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-3.5 w-3.5" })
						}]
					},
					{
						group: "Item Master",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "h-3.5 w-3.5" }),
						color: "text-indigo-500",
						bg: "bg-indigo-500/10",
						items: [{
							to: "/prop-mgr/procurement",
							search: { tab: "catalog" },
							label: "Item Catalog",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "h-3.5 w-3.5" })
						}]
					}
				]
			},
			{
				module: "Vendor Management",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-4 w-4" }),
				color: "text-violet-500",
				bg: "bg-violet-500/10",
				activeBg: "bg-violet-500",
				groups: [{
					group: "Vendor Registry",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" }),
					color: "text-violet-500",
					bg: "bg-violet-500/10",
					items: [{
						to: "/prop-mgr/vendors",
						search: { tab: "master" },
						label: "Vendor Master",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
					}]
				}, {
					group: "Financial",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" }),
					color: "text-cyan-500",
					bg: "bg-cyan-500/10",
					items: [
						{
							to: "/prop-mgr/vendors",
							search: { tab: "invoices" },
							label: "AP Invoices",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/vendors",
							search: { tab: "advances" },
							label: "Vendor Advances",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/vendors",
							search: { tab: "payments" },
							label: "Payment History",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/vendors",
							search: { tab: "performance" },
							label: "Supplier Scorecard",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3.5 w-3.5" })
						}
					]
				}]
			},
			{
				module: "Operations",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-4 w-4" }),
				color: "text-orange-500",
				bg: "bg-orange-500/10",
				activeBg: "bg-orange-500",
				groups: [{
					group: "Maintenance",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-3.5 w-3.5" }),
					color: "text-orange-500",
					bg: "bg-orange-500/10",
					items: [
						{
							to: "/prop-mgr/maintenance",
							search: { tab: "tickets" },
							label: "Service Tickets",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ticket, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/maintenance",
							search: { tab: "work_orders" },
							label: "Work Orders",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/maintenance",
							search: { tab: "ppm" },
							label: "Preventive (PPM)",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/maintenance",
							search: { tab: "technicians" },
							label: "Technicians & Teams",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/maintenance",
							search: { tab: "inventory" },
							label: "Spare Parts Inventory",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/maintenance",
							search: { tab: "vendor_jobs" },
							label: "Vendor Jobs & AP",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/prop-mgr/maintenance",
							search: { tab: "chargebacks" },
							label: "Costing & Chargebacks",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-3.5 w-3.5" })
						}
					]
				}, {
					group: "Management",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" }),
					color: "text-rose-500",
					bg: "bg-rose-500/10",
					items: [{
						to: "/prop-mgr/approvals",
						label: "Approvals",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" })
					}]
				}]
			}
		],
		titleRules: [
			{
				match: "/prop-mgr",
				title: "Operations Dashboard"
			},
			{
				match: "/prop-mgr/properties",
				title: "Properties"
			},
			{
				match: "/prop-mgr/units",
				title: "Units"
			},
			{
				match: "/prop-mgr/leasing",
				title: "Lease Lifecycle"
			},
			{
				match: "/prop-mgr/leases",
				title: "All Leases"
			},
			{
				match: "/prop-mgr/finance",
				title: "Finance"
			},
			{
				match: "/prop-mgr/assets",
				title: "Assets"
			},
			{
				match: "/prop-mgr/procurement",
				title: "Procurement"
			},
			{
				match: "/prop-mgr/vendors",
				title: "Vendor Management"
			},
			{
				match: "/prop-mgr/maintenance",
				title: "Maintenance"
			},
			{
				match: "/prop-mgr/approvals",
				title: "Approvals"
			},
			{
				match: "/prop-mgr/users",
				title: "Users"
			}
		]
	},
	admin: {
		variant: "admin",
		consoleLabel: "Staff Console",
		titleFallback: "Staff Console",
		user: {
			initials: "AD",
			name: "Admin User",
			meta: "System administration and oversight"
		},
		navModules: [
			{
				module: "Portfolio",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4" }),
				color: "text-blue-500",
				bg: "bg-blue-500/10",
				activeBg: "bg-blue-500",
				groups: [{
					group: "Overview",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-3.5 w-3.5" }),
					color: "text-blue-500",
					bg: "bg-blue-500/10",
					items: [
						{
							to: "/admin",
							label: "Dashboard",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/properties",
							label: "Properties",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/units",
							label: "Units",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoorOpen, { className: "h-3.5 w-3.5" })
						}
					]
				}]
			},
			{
				module: "Leasing",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-4 w-4" }),
				color: "text-emerald-500",
				bg: "bg-emerald-500/10",
				activeBg: "bg-emerald-500",
				groups: [{
					group: "Lease Lifecycle",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-3.5 w-3.5" }),
					color: "text-emerald-500",
					bg: "bg-emerald-500/10",
					items: [
						{
							to: "/admin/leases",
							search: { tab: "customers" },
							label: "Customer Master",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/leases",
							search: { tab: "reservations" },
							label: "Reservations",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/leases",
							search: { tab: "documents" },
							label: "Documents",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/leases",
							search: { tab: "agreement" },
							label: "Agreement Terms",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/leases",
							search: { tab: "signatures" },
							label: "Signatures",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/leases",
							search: { tab: "keys" },
							label: "Keys & Check-In",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/leases",
							search: { tab: "vouchers" },
							label: "Vouchers",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/leases",
							search: { tab: "renewals" },
							label: "Renewals",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/leases",
							search: { tab: "checkout" },
							label: "Checkout",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/leases",
							search: { tab: "audit" },
							label: "Audit Flow",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/leases",
							label: "All Leases",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
						}
					]
				}]
			},
			{
				module: "Finance",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-4 w-4" }),
				color: "text-violet-500",
				bg: "bg-violet-500/10",
				activeBg: "bg-violet-500",
				groups: [
					{
						group: "Setup",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" }),
						color: "text-blue-500",
						bg: "bg-blue-500/10",
						items: [
							{
								to: "/admin/finance",
								search: { tab: "financial_year" },
								label: "Financial Year",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "region" },
								label: "Region",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "vendor_list" },
								label: "Vendor List",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "customer_list" },
								label: "Customer List",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "cost_center" },
								label: "Cost Center",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "budget_head" },
								label: "Budget Head & Type",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPie, { className: "h-3.5 w-3.5" })
							}
						]
					},
					{
						group: "Core Finance",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" }),
						color: "text-emerald-500",
						bg: "bg-emerald-500/10",
						items: [
							{
								to: "/admin/finance",
								search: { tab: "finance_dashboard" },
								label: "Finance Dashboard",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "posting_period" },
								label: "Posting Period",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "chart_of_accounts" },
								label: "Chart Of Account",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "journal_ledger" },
								label: "Journal Ledger",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "credit_debit_builder" },
								label: "Credit Debit Builder",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
							}
						]
					},
					{
						group: "Payments",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" }),
						color: "text-purple-500",
						bg: "bg-purple-500/10",
						items: [
							{
								to: "/admin/finance",
								search: { tab: "grn_cost_mapping" },
								label: "GRN Cost Mapping",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "payable_invoice" },
								label: "Payable Invoice",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "journal_voucher" },
								label: "Journal Voucher",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "payment_voucher" },
								label: "Payment Voucher",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "receivable_invoice" },
								label: "Receivable Invoice",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "receipt_voucher" },
								label: "Receipt Voucher",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "debit_note" },
								label: "Debit Note",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMinus, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "credit_note" },
								label: "Credit Note",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "h-3.5 w-3.5" })
							}
						]
					},
					{
						group: "Receivables",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3.5 w-3.5" }),
						color: "text-orange-500",
						bg: "bg-orange-500/10",
						items: [
							{
								to: "/admin/finance",
								search: { tab: "pdc_management" },
								label: "PDC Management",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "deposits_guarantees" },
								label: "Deposits & Guarantees",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "legal_receivables" },
								label: "Legal Receivables",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "payroll_sync" },
								label: "Payroll Sync Engine",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
							}
						]
					},
					{
						group: "Banking",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-3.5 w-3.5" }),
						color: "text-amber-500",
						bg: "bg-amber-500/10",
						items: [
							{
								to: "/admin/finance",
								search: { tab: "bank" },
								label: "Bank",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "bank_account" },
								label: "Bank Account",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "bank_clearance" },
								label: "Bank Clearance",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "bank_reconciliation" },
								label: "Bank Reconciliation",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "bank_reconciliation_statement_list" },
								label: "Reconciliation Statements",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
							}
						]
					},
					{
						group: "Finance Reports",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPie, { className: "h-3.5 w-3.5" }),
						color: "text-rose-500",
						bg: "bg-rose-500/10",
						items: [
							{
								to: "/admin/finance",
								search: { tab: "trial_balance_simple" },
								label: "Trial Balance (Simple)",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "trial_balance" },
								label: "Trial Balance",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "profit_and_loss" },
								label: "Profit & Loss",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "balance_sheet" },
								label: "Balance Sheet",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "general_ledger" },
								label: "General Ledger",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "cash_flow_statement" },
								label: "Cash Flow Statement",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "cash_book" },
								label: "Cash Book",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "petty_cash_book" },
								label: "Petty Cash Book",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/finance",
								search: { tab: "cash_on_hand" },
								label: "Cash On Hand",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" })
							}
						]
					}
				]
			},
			{
				module: "Assets",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4" }),
				color: "text-amber-500",
				bg: "bg-amber-500/10",
				activeBg: "bg-amber-500",
				groups: [{
					group: "Asset Management",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" }),
					color: "text-amber-500",
					bg: "bg-amber-500/10",
					items: [
						{
							to: "/admin/assets",
							search: { tab: "registry" },
							label: "Asset Registry",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/assets",
							search: { tab: "depreciation" },
							label: "Asset Depreciation",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/assets",
							search: { tab: "allocation" },
							label: "Asset Allocation",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftRight, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/assets",
							search: { tab: "warranty" },
							label: "Asset Warranty",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/assets",
							search: { tab: "maintenance" },
							label: "Asset Maintenance",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/assets",
							search: { tab: "revaluation" },
							label: "Asset Revaluation",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/assets",
							search: { tab: "sell" },
							label: "Asset Sale",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/assets",
							search: { tab: "writeoff" },
							label: "Asset Write-off",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3.5 w-3.5" })
						}
					]
				}]
			},
			{
				module: "Procurement",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-4 w-4" }),
				color: "text-cyan-500",
				bg: "bg-cyan-500/10",
				activeBg: "bg-cyan-500",
				groups: [
					{
						group: "Procurement Operations",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-3.5 w-3.5" }),
						color: "text-cyan-500",
						bg: "bg-cyan-500/10",
						items: [
							{
								to: "/admin/procurement",
								search: { tab: "requests" },
								label: "Purchase Requests",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/procurement",
								search: { tab: "orders" },
								label: "Purchase Orders",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/procurement",
								search: { tab: "shipments" },
								label: "Shipments",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/procurement",
								search: { tab: "receiving" },
								label: "GRN / Receiving",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" })
							}
						]
					},
					{
						group: "Vendor & Sourcing",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" }),
						color: "text-violet-500",
						bg: "bg-violet-500/10",
						items: [{
							to: "/admin/procurement",
							search: { tab: "rfx" },
							label: "RFX / Tenders",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
						}, {
							to: "/admin/procurement",
							search: { tab: "quotations" },
							label: "Quotations",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5" })
						}]
					},
					{
						group: "Approvals & Invoices",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" }),
						color: "text-emerald-500",
						bg: "bg-emerald-500/10",
						items: [{
							to: "/admin/procurement",
							search: { tab: "inbox" },
							label: "Approval Inbox",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "h-3.5 w-3.5" })
						}, {
							to: "/admin/procurement",
							search: { tab: "invoices" },
							label: "Payable Invoices",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" })
						}]
					},
					{
						group: "Control Tower",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-3.5 w-3.5" }),
						color: "text-rose-500",
						bg: "bg-rose-500/10",
						items: [{
							to: "/admin/procurement",
							search: { tab: "dashboard" },
							label: "Procurement Analytics",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-3.5 w-3.5" })
						}, {
							to: "/admin/procurement",
							search: { tab: "supplier_perf" },
							label: "Supplier Scorecards",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-3.5 w-3.5" })
						}]
					},
					{
						group: "Asset & Maintenance Integration",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" }),
						color: "text-amber-500",
						bg: "bg-amber-500/10",
						items: [{
							to: "/admin/procurement",
							search: { tab: "assets" },
							label: "Asset Linkage",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" })
						}, {
							to: "/admin/procurement",
							search: { tab: "maintenance" },
							label: "Maintenance Stock",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-3.5 w-3.5" })
						}]
					},
					{
						group: "Item Master",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "h-3.5 w-3.5" }),
						color: "text-indigo-500",
						bg: "bg-indigo-500/10",
						items: [{
							to: "/admin/procurement",
							search: { tab: "catalog" },
							label: "Item Catalog",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "h-3.5 w-3.5" })
						}]
					}
				]
			},
			{
				module: "Vendor Management",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-4 w-4" }),
				color: "text-violet-500",
				bg: "bg-violet-500/10",
				activeBg: "bg-violet-500",
				groups: [{
					group: "Vendor Registry",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" }),
					color: "text-violet-500",
					bg: "bg-violet-500/10",
					items: [{
						to: "/admin/vendors",
						search: { tab: "master" },
						label: "Vendor Master",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
					}]
				}, {
					group: "Financial",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" }),
					color: "text-cyan-500",
					bg: "bg-cyan-500/10",
					items: [
						{
							to: "/admin/vendors",
							search: { tab: "invoices" },
							label: "AP Invoices",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/vendors",
							search: { tab: "payments" },
							label: "Payment History",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/vendors",
							search: { tab: "performance" },
							label: "Supplier Scorecard",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3.5 w-3.5" })
						}
					]
				}]
			},
			{
				module: "Operations",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-4 w-4" }),
				color: "text-orange-500",
				bg: "bg-orange-500/10",
				activeBg: "bg-orange-500",
				groups: [{
					group: "Maintenance",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-3.5 w-3.5" }),
					color: "text-orange-500",
					bg: "bg-orange-500/10",
					items: [
						{
							to: "/admin/maintenance",
							search: { tab: "tickets" },
							label: "Service Tickets",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ticket, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/maintenance",
							search: { tab: "work_orders" },
							label: "Work Orders",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/maintenance",
							search: { tab: "ppm" },
							label: "Preventive (PPM)",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/maintenance",
							search: { tab: "technicians" },
							label: "Technicians & Teams",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/maintenance",
							search: { tab: "inventory" },
							label: "Spare Parts Inventory",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/maintenance",
							search: { tab: "vendor_jobs" },
							label: "Vendor Jobs & AP",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/admin/maintenance",
							search: { tab: "chargebacks" },
							label: "Costing & Chargebacks",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-3.5 w-3.5" })
						}
					]
				}]
			},
			{
				module: "HRMS",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4" }),
				color: "text-teal-500",
				bg: "bg-teal-500/10",
				activeBg: "bg-teal-500",
				groups: [
					{
						group: "Core HR",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-3.5 w-3.5" }),
						color: "text-teal-500",
						bg: "bg-teal-500/10",
						items: [
							{
								to: "/admin/hrms",
								search: { tab: "dashboard" },
								label: "Dashboard",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/hrms",
								search: { tab: "employees" },
								label: "Employees",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/hrms",
								search: { tab: "organization" },
								label: "Org Masters",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5" })
							}
						]
					},
					{
						group: "Workforce & Time",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" }),
						color: "text-blue-500",
						bg: "bg-blue-500/10",
						items: [{
							to: "/admin/hrms",
							search: { tab: "attendance" },
							label: "Attendance & Shifts",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" })
						}, {
							to: "/admin/hrms",
							search: { tab: "leaves" },
							label: "Leave Management",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" })
						}]
					},
					{
						group: "Payroll & Finance",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" }),
						color: "text-emerald-500",
						bg: "bg-emerald-500/10",
						items: [{
							to: "/admin/hrms",
							search: { tab: "payroll" },
							label: "Payroll & Salary",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" })
						}, {
							to: "/admin/hrms",
							search: { tab: "expenses" },
							label: "Expenses & Claims",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" })
						}]
					},
					{
						group: "Appraisal & Lifecycle",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "h-3.5 w-3.5" }),
						color: "text-rose-500",
						bg: "bg-rose-500/10",
						items: [
							{
								to: "/admin/hrms",
								search: { tab: "performance" },
								label: "Performance / KPA",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/hrms",
								search: { tab: "exit_lifecycle" },
								label: "Exit & FNF",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/hrms",
								search: { tab: "services" },
								label: "Help Desk & Notices",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "h-3.5 w-3.5" })
							}
						]
					}
				]
			},
			{
				module: "System & Config",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-4 w-4" }),
				color: "text-blue-500",
				bg: "bg-blue-500/10",
				activeBg: "bg-blue-500",
				groups: [
					{
						group: "Asset Masters",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" }),
						color: "text-amber-500",
						bg: "bg-amber-500/10",
						items: [
							{
								to: "/admin/masters",
								search: { tab: "asset_category" },
								label: "Asset Categories",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/masters",
								search: { tab: "asset_subcategory" },
								label: "Asset Subcategories",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/masters",
								search: { tab: "asset_ownership_type" },
								label: "Ownership Types",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/masters",
								search: { tab: "asset_condition" },
								label: "Conditions",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/masters",
								search: { tab: "asset_status" },
								label: "Statuses",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" })
							}
						]
					},
					{
						group: "System Masters",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" }),
						color: "text-indigo-500",
						bg: "bg-indigo-500/10",
						items: [
							{
								to: "/admin/masters",
								search: { tab: "ticket_categories" },
								label: "Ticket Categories",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/masters",
								search: { tab: "facilities" },
								label: "Facilities",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/masters",
								search: { tab: "payment_modes" },
								label: "Payment Modes",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" })
							}
						]
					},
					{
						group: "Admin & Operations",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" }),
						color: "text-rose-500",
						bg: "bg-rose-500/10",
						items: [
							{
								to: "/admin/imports",
								label: "Excel Bulk Import",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/notifications",
								label: "Notification Center",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/audit-logs",
								search: { tab: "audit-trail" },
								label: "System Audit Trail",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" })
							},
							{
								to: "/admin/audit-logs",
								search: { tab: "engagement-analytics" },
								label: "Notification Engagement Analytics",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-3.5 w-3.5" })
							}
						]
					},
					{
						group: "Access Control",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3.5 w-3.5" }),
						color: "text-violet-500",
						bg: "bg-violet-500/10",
						items: [{
							to: "/admin/permissions",
							label: "Permissions & RBAC",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-3.5 w-3.5" })
						}]
					}
				]
			}
		],
		titleRules: [
			{
				match: "/admin",
				title: "Staff Console"
			},
			{
				match: "/admin/properties",
				title: "Properties"
			},
			{
				match: "/admin/units",
				title: "Units"
			},
			{
				match: "/admin/leasing",
				title: "Lease Lifecycle"
			},
			{
				match: "/admin/leases",
				title: "All Leases"
			},
			{
				match: "/admin/finance",
				title: "Finance"
			},
			{
				match: "/admin/assets",
				title: "Assets"
			},
			{
				match: "/admin/procurement",
				title: "Procurement"
			},
			{
				match: "/admin/vendors",
				title: "Vendor Management"
			},
			{
				match: "/admin/maintenance",
				title: "Maintenance"
			},
			{
				match: "/admin/masters",
				title: "Masters & Config"
			},
			{
				match: "/admin/users",
				title: "Users"
			},
			{
				match: "/admin/hrms",
				title: "HRMS"
			},
			{
				match: "/admin/imports",
				title: "Excel Import & Bulk Management Engine"
			},
			{
				match: "/admin/notifications",
				title: "Notification Center"
			},
			{
				match: "/admin/audit-logs",
				title: "System Audit Trail & Notification Analytics"
			},
			{
				match: "/admin/permissions",
				title: "Role Permissions & RBAC Matrix"
			}
		]
	},
	"super-admin": {
		variant: "admin",
		consoleLabel: "Super Admin Console",
		titleFallback: "Super Admin Console",
		user: {
			initials: "SA",
			name: "Super Admin",
			meta: "Platform governance and tenancy"
		},
		navModules: [
			{
				module: "Platform",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-4 w-4" }),
				color: "text-blue-500",
				bg: "bg-blue-500/10",
				activeBg: "bg-blue-500",
				groups: [{
					group: "Overview",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-3.5 w-3.5" }),
					color: "text-blue-500",
					bg: "bg-blue-500/10",
					items: [
						{
							to: "/super-admin",
							label: "Platform Overview",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/super-admin/analytics",
							label: "Platform Analytics",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/super-admin/health",
							label: "Health & Telemetry",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/super-admin/config",
							label: "Global Config",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/super-admin/alerts",
							label: "In-App & Alerts",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-3.5 w-3.5" })
						}
					]
				}]
			},
			{
				module: "Tenants",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4" }),
				color: "text-indigo-500",
				bg: "bg-indigo-500/10",
				activeBg: "bg-indigo-500",
				groups: [{
					group: "Tenant Management",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5" }),
					color: "text-indigo-500",
					bg: "bg-indigo-500/10",
					items: [
						{
							to: "/super-admin/tenants",
							label: "Tenant Management",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/super-admin/billing",
							label: "Billing & Plans",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/super-admin/invoices",
							label: "Platform Invoices",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" })
						}
					]
				}]
			},
			{
				module: "Security",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4" }),
				color: "text-rose-500",
				bg: "bg-rose-500/10",
				activeBg: "bg-rose-500",
				groups: [{
					group: "Access Control",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" }),
					color: "text-rose-500",
					bg: "bg-rose-500/10",
					items: [{
						to: "/super-admin/users",
						label: "User Management",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
					}, {
						to: "/super-admin/permissions",
						label: "Permissions & RBAC",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" })
					}]
				}, {
					group: "Governance & Audit",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" }),
					color: "text-indigo-500",
					bg: "bg-indigo-500/10",
					items: [{
						to: "/super-admin/security",
						search: { tab: "audit-trail" },
						label: "System Audit Trail",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" })
					}, {
						to: "/super-admin/security",
						search: { tab: "engagement-analytics" },
						label: "Notification Engagement Analytics",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-3.5 w-3.5" })
					}]
				}]
			}
		],
		titleRules: [
			{
				match: "/super-admin",
				title: "Platform Overview"
			},
			{
				match: "/super-admin/tenants",
				title: "Tenant Management"
			},
			{
				match: "/super-admin/users",
				title: "User Management"
			},
			{
				match: "/super-admin/permissions",
				title: "Permissions & RBAC"
			},
			{
				match: "/super-admin/billing",
				title: "Billing & Plans"
			},
			{
				match: "/super-admin/invoices",
				title: "Platform Subscription Invoices"
			},
			{
				match: "/super-admin/analytics",
				title: "Platform Analytics"
			},
			{
				match: "/super-admin/health",
				title: "Platform Health & Microservices Telemetry"
			},
			{
				match: "/super-admin/config",
				title: "Global Configuration"
			},
			{
				match: "/super-admin/alerts",
				title: "In-App & Alerts Governance"
			},
			{
				match: "/super-admin/security",
				title: "System Audit Trail & Notification Analytics"
			}
		]
	},
	leasing: {
		variant: "admin",
		consoleLabel: "Leasing Console",
		titleFallback: "Leasing Console",
		user: {
			initials: "LS",
			name: "Leasing Officer",
			meta: "Reservations and lease execution"
		},
		navModules: [{
			module: "Leasing",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-4 w-4" }),
			color: "text-emerald-500",
			bg: "bg-emerald-500/10",
			activeBg: "bg-emerald-500",
			groups: [{
				group: "Lease Lifecycle",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-3.5 w-3.5" }),
				color: "text-emerald-500",
				bg: "bg-emerald-500/10",
				items: [
					{
						to: "/leasing",
						label: "Overview",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/leasing/create",
						search: { tab: "customers" },
						label: "Customer Master",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/leasing/create",
						search: { tab: "reservations" },
						label: "Reservations",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/leasing/create",
						search: { tab: "documents" },
						label: "KYC & Documents",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/leasing/create",
						search: { tab: "agreement" },
						label: "Lease Agreement",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/leasing/create",
						search: { tab: "signatures" },
						label: "Signatures & Approval",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/leasing/create",
						search: { tab: "vouchers" },
						label: "Lease Vouchers",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/leasing/create",
						search: { tab: "audit" },
						label: "Forward to Property Manager",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitBranch, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/leasing/manage",
						label: "Manage Leases",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-3.5 w-3.5" })
					}
				]
			}]
		}],
		titleRules: [
			{
				match: "/leasing",
				title: "Leasing Overview"
			},
			{
				match: "/leasing/manage",
				title: "Manage Leases"
			},
			{
				match: "/leasing/create",
				title: "Create Lease"
			}
		]
	},
	finance: {
		variant: "admin",
		consoleLabel: "Finance Console",
		titleFallback: "Finance Operations",
		user: {
			initials: "FI",
			name: "Finance Controller",
			meta: "Financial reporting and ledger management"
		},
		navModules: [{
			module: "Finance",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-4 w-4" }),
			color: "text-violet-500",
			bg: "bg-violet-500/10",
			activeBg: "bg-violet-500",
			groups: [
				{
					group: "Setup",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" }),
					color: "text-blue-500",
					bg: "bg-blue-500/10",
					items: [
						{
							to: "/finance",
							search: { tab: "financial_year" },
							label: "Financial Year",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "region" },
							label: "Region",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "vendor_list" },
							label: "Vendor List",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "customer_list" },
							label: "Customer List",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "cost_center" },
							label: "Cost Center",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "budget_head" },
							label: "Budget Head & Type",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPie, { className: "h-3.5 w-3.5" })
						}
					]
				},
				{
					group: "Core Finance",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5" }),
					color: "text-indigo-500",
					bg: "bg-indigo-500/10",
					items: [
						{
							to: "/finance",
							search: { tab: "finance_dashboard" },
							label: "Finance Dashboard",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "posting_period" },
							label: "Posting Period",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "chart_of_accounts" },
							label: "Chart Of Account",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "journal_voucher" },
							label: "Journal Voucher",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "general_ledger" },
							label: "General Ledger",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "credit_debit_builder" },
							label: "Credit Debit Builder",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "contra_entry" },
							label: "Contra Entry",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftRight, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "credit_note" },
							label: "Credit Note",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "debit_note" },
							label: "Debit Note",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" })
						}
					]
				},
				{
					group: "Payments",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" }),
					color: "text-emerald-500",
					bg: "bg-emerald-500/10",
					items: [
						{
							to: "/finance",
							search: { tab: "financial_year" },
							label: "Financial Year",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "region" },
							label: "Region",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "vendor_list" },
							label: "Vendor List",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "customer_list" },
							label: "Customer List",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "cost_center" },
							label: "Cost Center",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "budget_head" },
							label: "Budget Head & Type",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPie, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "payable_invoice" },
							label: "Payable Invoices (AP)",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "grn_mapping" },
							label: "GRN Cost Mapping",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "payment_voucher" },
							label: "Payment Voucher",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" })
						}
					]
				},
				{
					group: "Banking",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-3.5 w-3.5" }),
					color: "text-amber-500",
					bg: "bg-amber-500/10",
					items: [
						{
							to: "/finance",
							search: { tab: "bank" },
							label: "Bank",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "bank_account" },
							label: "Bank Accounts",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "bank_clearance" },
							label: "Bank Clearance",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "bank_reconciliation" },
							label: "Bank Reconciliation",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "bank_reconciliation_statement_list" },
							label: "Reconciliation Statements",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
						}
					]
				},
				{
					group: "Receivables",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3.5 w-3.5" }),
					color: "text-cyan-500",
					bg: "bg-cyan-500/10",
					items: [
						{
							to: "/finance",
							search: { tab: "receipt_voucher" },
							label: "Receipt Voucher",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "receivable_invoice" },
							label: "Receivable Invoices (AR)",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "pdc_management" },
							label: "PDC Management",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "deposits_guarantees" },
							label: "Deposits & Guarantees",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "legal_receivables" },
							label: "Legal Receivables",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "payroll_sync" },
							label: "Payroll Sync Engine",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" })
						}
					]
				},
				{
					group: "Finance Reports",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPie, { className: "h-3.5 w-3.5" }),
					color: "text-rose-500",
					bg: "bg-rose-500/10",
					items: [
						{
							to: "/finance",
							search: { tab: "revenue_generation" },
							label: "Revenue Generation",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "trial_balance_simple" },
							label: "Trial Balance (Simple)",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "trial_balance" },
							label: "Trial Balance",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "profit_and_loss" },
							label: "Profit & Loss",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "balance_sheet" },
							label: "Balance Sheet",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "general_ledger" },
							label: "General Ledger",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "cash_flow_statement" },
							label: "Cash Flow Statement",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "cash_book" },
							label: "Cash Book",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "petty_cash_book" },
							label: "Petty Cash Book",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5" })
						},
						{
							to: "/finance",
							search: { tab: "cash_on_hand" },
							label: "Cash On Hand",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" })
						}
					]
				}
			]
		}],
		titleRules: [{
			match: "/finance",
			title: "Finance"
		}]
	},
	cashier: {
		variant: "admin",
		consoleLabel: "Cashier Console",
		titleFallback: "Cashier Console",
		user: {
			initials: "CS",
			name: "Cashier",
			meta: "Collections, receipts, and PDCs"
		},
		navModules: [{
			module: "Collections",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-4 w-4" }),
			color: "text-violet-500",
			bg: "bg-violet-500/10",
			activeBg: "bg-violet-500",
			groups: [{
				group: "Cash Desk",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" }),
				color: "text-violet-500",
				bg: "bg-violet-500/10",
				items: [
					{
						to: "/cashier",
						label: "Overview",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/cashier/receipts",
						label: "Receipts",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/cashier/pdc",
						label: "PDC Register",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/cashier",
						search: { tab: "deposits_guarantees" },
						label: "Security Deposits",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/cashier",
						search: { tab: "receipt_voucher" },
						label: "Tenant Collections",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/cashier",
						search: { tab: "receivable_invoice" },
						label: "Tenant Receivables",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/cashier",
						search: { tab: "payment_voucher" },
						label: "Payment Vouchers",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" })
					}
				]
			}]
		}],
		titleRules: [
			{
				match: "/cashier",
				title: "Cashier Overview"
			},
			{
				match: "/cashier/receipts",
				title: "Receipts"
			},
			{
				match: "/cashier/pdc",
				title: "PDC Register"
			}
		]
	},
	maintenance: {
		variant: "admin",
		consoleLabel: "Maintenance Console",
		titleFallback: "Maintenance Console",
		user: {
			initials: "MT",
			name: "Maintenance Team",
			meta: "Tickets, work orders, and inventory"
		},
		navModules: [{
			module: "Maintenance",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-4 w-4" }),
			color: "text-orange-500",
			bg: "bg-orange-500/10",
			activeBg: "bg-orange-500",
			groups: [{
				group: "Work Orders",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-3.5 w-3.5" }),
				color: "text-orange-500",
				bg: "bg-orange-500/10",
				items: [
					{
						to: "/maintenance",
						label: "Overview",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/maintenance",
						search: { tab: "tickets" },
						label: "Service Tickets",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ticket, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/maintenance",
						search: { tab: "work_orders" },
						label: "Work Orders",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/maintenance",
						search: { tab: "ppm" },
						label: "Preventive (PPM)",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/maintenance",
						search: { tab: "inventory" },
						label: "Spare Parts Inventory",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/maintenance",
						search: { tab: "vendor_jobs" },
						label: "Vendor Jobs & AP",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5" })
					},
					{
						to: "/maintenance",
						search: { tab: "chargebacks" },
						label: "Costing & Chargebacks",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-3.5 w-3.5" })
					}
				]
			}]
		}],
		titleRules: [
			{
				match: "/maintenance",
				title: "Maintenance Overview"
			},
			{
				match: "/maintenance/tickets",
				title: "Tickets"
			},
			{
				match: "/maintenance/inventory",
				title: "Inventory"
			}
		]
	}
};
var landingRoutes = {
	SUPER_ADMIN: "/super-admin",
	ADMIN: "/admin",
	HOST: "/prop-mgr",
	PROP_MGR: "/prop-mgr",
	LEASING: "/leasing",
	FINANCE: "/finance",
	CASHIER: "/cashier",
	MAINTENANCE: "/maintenance",
	TENANT: "/portal",
	GUEST: "/portal",
	SALES: "/sales/listings",
	OWNER: "/owner/statements"
};
function getConsoleConfig(key) {
	return consoleConfigs[key];
}
function resolveConsoleTitle(key, path) {
	const config = consoleConfigs[key];
	const exactMatch = config.titleRules.find((rule) => (rule.mode ?? "exact") === "exact" && rule.match === path);
	if (exactMatch) return exactMatch.title;
	return config.titleRules.find((rule) => rule.mode === "prefix" && path.startsWith(rule.match))?.title ?? config.titleFallback;
}
function getLandingRouteForRole(role) {
	return landingRoutes[role ?? "GUEST"] ?? "/portal";
}
//#endregion
export { getLandingRouteForRole as n, resolveConsoleTitle as r, getConsoleConfig as t };
