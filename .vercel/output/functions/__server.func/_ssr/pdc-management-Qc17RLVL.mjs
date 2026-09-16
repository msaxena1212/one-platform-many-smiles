import { i as __toESM } from "../_runtime.mjs";
import { B as supabase } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $t as CircleCheck, En as ArrowUpDown, Et as Funnel, G as Plus, H as Receipt, I as Search, Rt as Download, Sn as Banknote, Tn as ArrowUpRight, Yt as CircleX, c as User, ct as LoaderCircle, fn as Calendar, h as TriangleAlert, hn as Building, jn as ArrowDownLeft, pt as Landmark, vt as House, z as RotateCcw } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { y as useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DJOO1b-0.mjs";
import { n as useFinanceStore } from "./finance-store-BEaAgb9S.mjs";
import { n as useAppData } from "./app-data-context-Lw7cnnXe.mjs";
import { a as collectSecurityDeposit, c as returnPdc, i as clearPdc, n as cancelPdc, o as depositPdc, r as cashDepositInPlaceOfPdc, s as receivePdc, t as ReceiptModal } from "./receipt-modal-CUpXpFGs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pdc-management-Qc17RLVL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PAGE_SIZE = 20;
function getActionConfig(action, chequeNo, tenantName, amount) {
	const fmtAmt = `QAR ${amount.toLocaleString()}`;
	if (action === "deposit") return {
		action,
		title: "Confirm PDC Bank Deposit",
		description: `You are depositing Cheque #${chequeNo} (${tenantName}) of ${fmtAmt} into the bank account.`,
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-5 w-5 text-blue-600" }),
		color: "blue",
		newStatus: "Deposited",
		newSharedStatus: "deposited",
		impacts: [{
			type: "Debit",
			account: "Bank Operating Account",
			code: "12000",
			description: "Cash received into bank"
		}, {
			type: "Credit",
			account: "PDC In Hand",
			code: "12900",
			description: "PDC cleared from holding account"
		}]
	};
	if (action === "clear") return {
		action,
		title: "Confirm PDC Bank Clearance",
		description: `You are marking Cheque #${chequeNo} (${tenantName}) of ${fmtAmt} as cleared in bank.`,
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5 text-emerald-600" }),
		color: "emerald",
		newStatus: "Cleared",
		newSharedStatus: "cleared",
		impacts: [{
			type: "Debit",
			account: "Customer(PDC) - Unit Account",
			code: "21400",
			description: "Customer PDC Liability settled"
		}, {
			type: "Credit",
			account: "Receivable - Unit Account",
			code: "12413",
			description: "Tenant Receivable offset"
		}]
	};
	if (action === "cancel") return {
		action,
		title: "Confirm PDC Cancellation",
		description: `You are cancelling Cheque #${chequeNo} (${tenantName}) of ${fmtAmt} before presentation.`,
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-5 w-5 text-rose-600" }),
		color: "red",
		newStatus: "Cancelled",
		newSharedStatus: "cancelled",
		impacts: [{
			type: "Debit",
			account: "Customer(PDC) - Unit Account",
			code: "21400",
			description: "Customer PDC liability reversed"
		}, {
			type: "Credit",
			account: "PDC In Hand",
			code: "12900",
			description: "PDC In Hand holding reversed"
		}]
	};
	return {
		action,
		title: "Confirm PDC Cheque Return / Dishonour",
		description: `You are executing Cheque Return / Bounce for Cheque #${chequeNo} (${tenantName}) of ${fmtAmt}.`,
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-5 w-5 text-red-600" }),
		color: "red",
		newStatus: "Returned",
		newSharedStatus: "bounced",
		impacts: [
			{
				type: "Debit",
				account: "PDC In Hand",
				code: "12900",
				description: "Cheque physically returned to hand (Dr 12900)"
			},
			{
				type: "Credit",
				account: "Bank Account",
				code: "12000",
				description: "Bank Account clawback on dishonour (Cr 12000)"
			},
			{
				type: "Debit",
				account: "Receivable - Unit Account",
				code: "12413",
				description: "Tenant dues restored in Unit Account (Dr 12413)"
			},
			{
				type: "Credit",
				account: "Customer(PDC) - Unit Account",
				code: "21400",
				description: "Customer(PDC) liability reversed (Cr 21400)"
			}
		]
	};
}
function GlConfirmModal({ open, config, amount, loading, cancelReason, onCancelReasonChange, onConfirm, onCancel }) {
	if (!config) return null;
	const fmtAmt = `QAR ${amount.toLocaleString()}`;
	const colorMap = {
		blue: "border-blue-200 bg-blue-50/70",
		emerald: "border-emerald-200 bg-emerald-50/70",
		red: "border-red-200 bg-red-50/70"
	};
	const badgeColorMap = {
		blue: "bg-blue-100 text-blue-800",
		emerald: "bg-emerald-100 text-emerald-800",
		red: "bg-red-100 text-red-800"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (v) => {
			if (!v) onCancel();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-[520px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2",
					children: [config.icon, config.title]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-sm text-muted-foreground mt-1",
					children: config.description
				})] }),
				config.action === "cancel" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5 py-1 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						className: "font-semibold text-xs text-foreground",
						children: ["Cancellation Reason ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-destructive",
							children: "*"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 2,
						placeholder: "e.g. Tenant replaced with online transfer, date error...",
						value: cancelReason || "",
						onChange: (e) => onCancelReasonChange?.(e.target.value),
						className: "text-xs"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `rounded-lg border p-3.5 space-y-2.5 ${colorMap[config.color] || "border-muted bg-muted/10"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3.5 w-3.5" }), "General Ledger / COA Accounts Impacted"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: config.impacts.map((impact, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2.5 bg-background/85 rounded-md px-3 py-2 border shadow-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-0.5",
										children: impact.type === "Debit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-4 w-4 text-emerald-600" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownLeft, { className: "h-4 w-4 text-amber-600" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 flex-wrap",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `text-[10px] font-bold px-1.5 py-0.5 rounded ${impact.type === "Debit" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`,
													children: impact.type
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: `text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${badgeColorMap[config.color]}`,
													children: ["GL ", impact.code]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs font-semibold",
													children: impact.account
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-muted-foreground mt-0.5",
											children: impact.description
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs font-mono font-bold tabular-nums",
										children: fmtAmt
									})
								]
							}, i))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-muted-foreground border-t border-border/50 pt-2",
							children: "Double-entry transactions will be posted simultaneously to maintain trial balance integrity and persist directly to the database."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: onCancel,
						disabled: loading,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: onConfirm,
						disabled: loading || config.action === "cancel" && !cancelReason?.trim(),
						className: config.color === "red" ? "bg-red-600 hover:bg-red-700 text-white" : config.color === "emerald" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 mr-1 animate-spin" }), " Processing…"] }) : `Confirm ${config.action === "deposit" ? "Deposit" : config.action === "clear" ? "Clear" : config.action === "cancel" ? "Cancel Cheque" : "Return"}`
					})]
				})
			]
		})
	});
}
var RECEIPT_HISTORY_STORAGE_KEY = "zyno-pdc-cash-receipts-v2";
function loadSavedReceiptHistory() {
	if (typeof window === "undefined") return {};
	try {
		const raw = localStorage.getItem(RECEIPT_HISTORY_STORAGE_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}
function saveReceiptHistory(history) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(RECEIPT_HISTORY_STORAGE_KEY, JSON.stringify(history));
	} catch {}
}
function PdcManagement() {
	const routeSearch = useSearch({ strict: false });
	const { pdcs: sharedPdcs, setPdcs: setSharedPdcs, leases, units, customers } = useAppData();
	const { addCashBookEntry, addVoucher } = useFinanceStore();
	const [pdcs, setPdcs] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [actionLoading, setActionLoading] = (0, import_react.useState)(false);
	const [page, setPage] = (0, import_react.useState)(1);
	const [receiptOpen, setReceiptOpen] = (0, import_react.useState)(false);
	const [receiptData, setReceiptData] = (0, import_react.useState)(null);
	const [receiptHistory, setReceiptHistory] = (0, import_react.useState)(loadSavedReceiptHistory);
	const [receiptHistoryOpen, setReceiptHistoryOpen] = (0, import_react.useState)(false);
	const [receiptHistoryPdc, setReceiptHistoryPdc] = (0, import_react.useState)(null);
	const [receiptHistoryIndex, setReceiptHistoryIndex] = (0, import_react.useState)(0);
	const [glConfirmOpen, setGlConfirmOpen] = (0, import_react.useState)(false);
	const [pendingActionPdc, setPendingActionPdc] = (0, import_react.useState)(null);
	const [pendingAction, setPendingAction] = (0, import_react.useState)(null);
	const [cancelReason, setCancelReason] = (0, import_react.useState)("");
	const [cashModalOpen, setCashModalOpen] = (0, import_react.useState)(false);
	const [cashStep, setCashStep] = (0, import_react.useState)(1);
	const [cashPdc, setCashPdc] = (0, import_react.useState)(null);
	const [cashAmount, setCashAmount] = (0, import_react.useState)("");
	const [cashReceiptDate, setCashReceiptDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
	const [cashNotes, setCashNotes] = (0, import_react.useState)("");
	const [cashCollectorName, setCashCollectorName] = (0, import_react.useState)("Finance Department");
	const [addPdcOpen, setAddPdcOpen] = (0, import_react.useState)(false);
	const [addPdcLoading, setAddPdcLoading] = (0, import_react.useState)(false);
	const [collectionType, setCollectionType] = (0, import_react.useState)("PDC");
	const [otherCollectionAmount, setOtherCollectionAmount] = (0, import_react.useState)("");
	const [otherCollectionDescription, setOtherCollectionDescription] = (0, import_react.useState)("");
	const [batchPdcFile, setBatchPdcFile] = (0, import_react.useState)(null);
	const [selectedLeaseId, setSelectedLeaseId] = (0, import_react.useState)("");
	const [addPdcRows, setAddPdcRows] = (0, import_react.useState)([{
		id: "1",
		chequeNo: "",
		bank: "Qatar National Bank (QNB)",
		chequeDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		period: "Rent Instalment",
		amount: "6500"
	}]);
	const [genCount, setGenCount] = (0, import_react.useState)("12");
	const [genPrefix, setGenPrefix] = (0, import_react.useState)("PDC-Flat14-");
	const [genStartNo, setGenStartNo] = (0, import_react.useState)("1");
	const [genStartDate, setGenStartDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
	(0, import_react.useEffect)(() => {
		if (routeSearch.collect === "1") setAddPdcOpen(true);
	}, [routeSearch.collect]);
	const [selectedProperty, setSelectedProperty] = (0, import_react.useState)("all");
	const [selectedUnit, setSelectedUnit] = (0, import_react.useState)("all");
	const [selectedCustomer, setSelectedCustomer] = (0, import_react.useState)("all");
	const [selectedMonth, setSelectedMonth] = (0, import_react.useState)("all");
	const [fromDate, setFromDate] = (0, import_react.useState)("");
	const [toDate, setToDate] = (0, import_react.useState)("");
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [sortField, setSortField] = (0, import_react.useState)("cheque_date");
	const [sortAsc, setSortAsc] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		load(true);
		const channel = supabase.channel("pdc-management:live").on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "fin_pdc_register"
		}, () => {
			load(false);
		}).on("postgres_changes", {
			event: "UPDATE",
			schema: "public",
			table: "pdcs"
		}, () => {
			load(false);
		}).on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "pdcs"
		}, () => {
			load(false);
		}).subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, []);
	async function load(showLoading = true) {
		if (showLoading && pdcs.length === 0) setLoading(true);
		try {
			let finRegisterData = [];
			try {
				const { data, error } = await supabase.from("fin_pdc_register").select("*").order("cheque_date", { ascending: true });
				if (!error && data) finRegisterData = data.map((p) => {
					const rawStatus = (p.status || "").trim().toLowerCase();
					const normalizedStatus = rawStatus === "deposited" ? "Deposited" : rawStatus === "cleared" ? "Cleared" : rawStatus === "bounced" || rawStatus === "returned" ? "Returned" : rawStatus === "cancelled" ? "Cancelled" : rawStatus === "replaced" ? "Replaced" : rawStatus === "partial cash" || rawStatus === "partial_cash" ? "Partial Cash" : "In Hand";
					return {
						...p,
						paid_amount: p.paid_amount != null ? Number(p.paid_amount) : void 0,
						status: normalizedStatus
					};
				});
			} catch {}
			let pdcsTableData = [];
			try {
				const { data: altData } = await supabase.from("pdcs").select("*").order("created_at", { ascending: true });
				if (altData && altData.length > 0) pdcsTableData = altData.map((p) => {
					const rawStatus = (p.status || p.status_pdc || "").trim().toLowerCase();
					const normalizedStatus = rawStatus === "deposited" ? "Deposited" : rawStatus === "cleared" ? "Cleared" : rawStatus === "bounced" || rawStatus === "returned" ? "Returned" : rawStatus === "cancelled" ? "Cancelled" : rawStatus === "replaced" ? "Replaced" : rawStatus === "partial cash" || rawStatus === "partial_cash" ? "Partial Cash" : "In Hand";
					return {
						id: p.id,
						entry_date: p.created_at ? p.created_at.split("T")[0] : "2026-08-01",
						cheque_date: p.maturity_date || p.deposit_date || (p.created_at ? p.created_at.split("T")[0] : "2026-08-01"),
						cheque_number: p.cheque_number,
						amount: Number(p.amount) || 0,
						paid_amount: p.paid_amount != null ? Number(p.paid_amount) : void 0,
						status: normalizedStatus,
						bank_name: p.bank,
						property_name: p.property_code || p.property_name || "—",
						unit_ref: p.unit_name || p.unit_ref || "—",
						tenant_name: p.tenant_name || "—",
						lease_start: p.rent_from_date || p.lease_start,
						lease_end: p.rent_to_date || p.lease_end,
						monthly_rent: Number(p.amount) || 0,
						_source: "supabase"
					};
				});
			} catch {}
			const dbDataMap = /* @__PURE__ */ new Map();
			for (const p of pdcsTableData) if (p.cheque_number) dbDataMap.set(String(p.cheque_number), p);
			for (const p of finRegisterData) {
				const key = p.cheque_number ? String(p.cheque_number) : String(p.id);
				const existing = dbDataMap.get(key);
				if (existing) {
					const isFinalStatus = (s) => s === "Cleared" || s === "Returned" || s === "Replaced" || s === "Cancelled" || s === "Partial Cash";
					let finalStatus = p.status;
					if (isFinalStatus(existing.status)) finalStatus = existing.status;
					else if (isFinalStatus(p.status)) finalStatus = p.status;
					else if (existing.status === "Deposited" || p.status === "Deposited") finalStatus = "Deposited";
					dbDataMap.set(key, {
						...existing,
						...p,
						paid_amount: p.paid_amount ?? existing.paid_amount,
						status: finalStatus
					});
				} else dbDataMap.set(key, p);
			}
			const contextPdcs = (sharedPdcs || []).map((p, idx) => {
				const lease = leases?.find((l) => l.id === p.leaseId);
				const rawStatus = (p.status || "").trim().toLowerCase();
				const normalizedStatus = rawStatus === "deposited" ? "Deposited" : rawStatus === "cleared" ? "Cleared" : rawStatus === "bounced" || rawStatus === "returned" ? "Returned" : rawStatus === "cancelled" ? "Cancelled" : rawStatus === "replaced" ? "Replaced" : rawStatus === "partial cash" || rawStatus === "partial_cash" ? "Partial Cash" : "In Hand";
				return {
					id: p.id || `ctx-pdc-${idx}`,
					leaseId: p.leaseId,
					entry_date: p.entry_date || lease?.startDate || p.date || "2026-08-01",
					cheque_date: p.date,
					cheque_number: p.chequeNo,
					amount: Number(p.amount) || 0,
					paid_amount: p.paid_amount != null ? Number(p.paid_amount) : void 0,
					status: normalizedStatus,
					bank_name: p.bank,
					property_name: p.propertyName || p.property || lease?.property || "Old Salata - Residence No:23",
					unit_ref: p.unitRef || p.unit || lease?.unit || "AAA - Flat16",
					tenant_name: p.tenantName || p.payerName || lease?.tenantName || "Valued Tenant",
					lease_start: p.tenureStart || lease?.startDate || p.date,
					lease_end: p.tenureEnd || lease?.endDate || p.date,
					monthly_rent: lease?.monthlyRent || Number(p.amount) || 0,
					_source: "context"
				};
			});
			for (const cp of contextPdcs) {
				const key = cp.cheque_number ? String(cp.cheque_number) : String(cp.id);
				const existing = dbDataMap.get(key);
				if (existing) {
					if (cp.paid_amount != null && (existing.paid_amount == null || cp.paid_amount > existing.paid_amount)) existing.paid_amount = cp.paid_amount;
					if (cp.status === "Partial Cash" || cp.status === "Replaced") existing.status = cp.status;
					dbDataMap.set(key, existing);
				} else dbDataMap.set(key, cp);
			}
			for (const p of dbDataMap.values()) {
				const lease = leases?.find((l) => l.id === p.lease_id || l.tenantName === p.tenant_name || l.unit === p.unit_ref);
				if (lease && (lease.status === "closed" || lease.earlyVacate)) {
					const vacateDate = lease.actualVacateDate || lease.moveOutDate || lease.endDate;
					if (vacateDate && p.cheque_date && new Date(p.cheque_date).getTime() > new Date(vacateDate).getTime()) {
						if (p.status === "In Hand" || p.status === "Deposited") p.status = "Returned";
					}
				}
			}
			setPdcs(Array.from(dbDataMap.values()));
		} catch (e) {
			toast.error(e.message);
		} finally {
			setLoading(false);
		}
	}
	const propertyOptions = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		pdcs.forEach((p) => {
			if (p.property_name && p.property_name !== "—") set.add(String(p.property_name).trim());
		});
		leases?.forEach((l) => {
			if (l.property) set.add(String(l.property).trim());
		});
		units?.forEach((u) => {
			const prop = u.propertyName || u.property;
			if (prop) set.add(String(prop).trim());
		});
		return Array.from(set).sort((a, b) => a.localeCompare(b, void 0, { sensitivity: "base" }));
	}, [
		pdcs,
		leases,
		units
	]);
	const unitOptions = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		pdcs.forEach((p) => {
			if (selectedProperty !== "all" && p.property_name !== selectedProperty) return;
			if (p.unit_ref && p.unit_ref !== "—") set.add(String(p.unit_ref).trim());
		});
		leases?.forEach((l) => {
			if (selectedProperty !== "all" && l.property !== selectedProperty) return;
			if (l.unit) set.add(String(l.unit).trim());
		});
		return Array.from(set).sort((a, b) => a.localeCompare(b, void 0, {
			numeric: true,
			sensitivity: "base"
		}));
	}, [
		pdcs,
		leases,
		selectedProperty
	]);
	const customerOptions = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		pdcs.forEach((p) => {
			if (p.tenant_name && p.tenant_name !== "—") set.add(String(p.tenant_name).trim());
		});
		leases?.forEach((l) => {
			if (l.tenantName) set.add(String(l.tenantName).trim());
		});
		customers?.forEach((c) => {
			if (c.name) set.add(String(c.name).trim());
		});
		return Array.from(set).sort((a, b) => a.localeCompare(b, void 0, { sensitivity: "base" }));
	}, [
		pdcs,
		leases,
		customers
	]);
	const monthOptions = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		pdcs.forEach((p) => {
			if (p.cheque_date && p.cheque_date.length >= 7) set.add(p.cheque_date.slice(0, 7));
		});
		return Array.from(set).sort((a, b) => a.localeCompare(b));
	}, [pdcs]);
	const filteredPdcs = (0, import_react.useMemo)(() => {
		return pdcs.filter((pdc) => {
			if (statusFilter !== "all") {
				if (statusFilter === "due" && pdc.status !== "In Hand" && pdc.status !== "Returned") return false;
				if (statusFilter === "posted" && pdc.status !== "Deposited" && pdc.status !== "Cleared") return false;
				if (statusFilter !== "due" && statusFilter !== "posted" && pdc.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
			}
			if (selectedProperty !== "all" && pdc.property_name !== selectedProperty) return false;
			if (selectedUnit !== "all" && pdc.unit_ref !== selectedUnit) return false;
			if (selectedCustomer !== "all" && pdc.tenant_name !== selectedCustomer) return false;
			if (selectedMonth !== "all") {
				if (!pdc.cheque_date || !pdc.cheque_date.startsWith(selectedMonth)) return false;
			}
			if (fromDate) {
				if (!pdc.cheque_date || pdc.cheque_date < fromDate) return false;
			}
			if (toDate) {
				if (!pdc.cheque_date || pdc.cheque_date > toDate) return false;
			}
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				if (!(pdc.cheque_number && String(pdc.cheque_number).toLowerCase().includes(q) || pdc.tenant_name && String(pdc.tenant_name).toLowerCase().includes(q) || pdc.property_name && String(pdc.property_name).toLowerCase().includes(q) || pdc.unit_ref && String(pdc.unit_ref).toLowerCase().includes(q) || pdc.bank_name && String(pdc.bank_name).toLowerCase().includes(q))) return false;
			}
			return true;
		}).sort((a, b) => {
			let comp = 0;
			if (sortField === "cheque_date") comp = (a.cheque_date || "").localeCompare(b.cheque_date || "");
			else if (sortField === "cheque_number") comp = String(a.cheque_number || "").localeCompare(String(b.cheque_number || ""), void 0, { numeric: true });
			else if (sortField === "tenant_name") comp = String(a.tenant_name || "").localeCompare(String(b.tenant_name || ""));
			else if (sortField === "amount") comp = (Number(a.amount) || 0) - (Number(b.amount) || 0);
			return sortAsc ? comp : -comp;
		});
	}, [
		pdcs,
		statusFilter,
		selectedProperty,
		selectedUnit,
		selectedCustomer,
		selectedMonth,
		fromDate,
		toDate,
		searchQuery,
		sortField,
		sortAsc
	]);
	const totalPages = Math.max(1, Math.ceil(filteredPdcs.length / PAGE_SIZE));
	const paginated = (0, import_react.useMemo)(() => {
		return filteredPdcs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	}, [filteredPdcs, page]);
	const totalFilteredAmount = (0, import_react.useMemo)(() => {
		return filteredPdcs.reduce((s, p) => s + (Number(p.amount) || 0), 0);
	}, [filteredPdcs]);
	function openGlConfirm(pdc, action) {
		setPendingActionPdc(pdc);
		setPendingAction(action);
		setCancelReason("");
		setGlConfirmOpen(true);
	}
	async function executeConfirmedAction() {
		if (!pendingActionPdc || !pendingAction) return;
		const pdc = pendingActionPdc;
		const action = pendingAction;
		const id = pdc.id;
		const amt = Number(pdc.amount) || 0;
		const chqNo = pdc.cheque_number || id;
		(/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		const config = getActionConfig(action, chqNo, pdc.tenant_name || "Tenant", amt);
		setPdcs((prev) => prev.map((p) => String(p.id) === String(id) || String(p.cheque_number) === String(chqNo) ? {
			...p,
			status: config.newStatus
		} : p));
		setSharedPdcs((prev) => prev.map((p) => String(p.id) === String(id) || String(p.chequeNo) === String(chqNo) ? {
			...p,
			status: config.newSharedStatus
		} : p));
		setGlConfirmOpen(false);
		setPendingActionPdc(null);
		setPendingAction(null);
		setActionLoading(true);
		try {
			if (action === "deposit") await depositPdc(id, String(chqNo));
			else if (action === "clear") await clearPdc(id, String(chqNo));
			else if (action === "cancel") await cancelPdc(id, String(chqNo), cancelReason || "Cancelled by Finance Officer");
			else await returnPdc(id, String(chqNo));
			const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
			const tenant = pdc.tenant_name || "Tenant";
			const unit = pdc.unit_ref || "Unit";
			const prop = pdc.property_name || "Property";
			if (action === "deposit") addVoucher({
				voucher_no: `VCH-DEP-${chqNo}`,
				voucher_type: "Receipt Voucher",
				date: today,
				name: `PDC Deposited to Bank – ${chqNo} (${tenant} - ${unit})`,
				debit: "Bank Operating Account",
				debit_code: "12000",
				credit: "PDC In Hand",
				credit_code: "12900",
				amount: amt,
				method: "Cheque Deposit",
				property_name: prop,
				unit_ref: unit,
				tenant_name: tenant
			});
			else if (action === "clear") {
				if ((pdc.status || "").toLowerCase() === "in hand" || (pdc.status || "") === "In Hand") addVoucher({
					voucher_no: `VCH-DEP-${chqNo}`,
					voucher_type: "Receipt Voucher",
					date: today,
					name: `PDC Deposited to Bank (auto) – ${chqNo} (${tenant} - ${unit})`,
					debit: "Bank Operating Account",
					debit_code: "12000",
					credit: "PDC In Hand",
					credit_code: "12900",
					amount: amt,
					method: "Cheque Deposit",
					property_name: prop,
					unit_ref: unit,
					tenant_name: tenant
				});
				addVoucher({
					voucher_no: `VCH-CLR-${chqNo}`,
					voucher_type: "Journal Voucher",
					date: today,
					name: `PDC Cleared – ${chqNo} (${tenant} - ${unit})`,
					debit: "Customer(PDC) - Unit Account",
					debit_code: "21400",
					credit: "Receivable - Unit Account",
					credit_code: "12413",
					amount: amt,
					method: "Cheque Clearance",
					property_name: prop,
					unit_ref: unit,
					tenant_name: tenant
				});
			} else if (action === "return") {
				addVoucher({
					voucher_no: `VCH-RET-${chqNo}`,
					voucher_type: "Journal Voucher",
					date: today,
					name: `PDC Cheque Returned / Dishonoured – ${chqNo} (${tenant} - ${unit})`,
					debit: "PDC In Hand",
					debit_code: "12900",
					credit: "Bank Operating Account",
					credit_code: "12000",
					amount: amt,
					method: "Cheque Return",
					property_name: prop,
					unit_ref: unit,
					tenant_name: tenant
				});
				addVoucher({
					voucher_no: `VCH-RET-AR-${chqNo}`,
					voucher_type: "Journal Voucher",
					date: today,
					name: `Tenant Dues Restored on Dishonour – ${chqNo} (${tenant} - ${unit})`,
					debit: "Tenant Receivables",
					debit_code: "12413",
					credit: "Customer PDC Liability",
					credit_code: "21400",
					amount: amt,
					method: "Cheque Return",
					property_name: prop,
					unit_ref: unit,
					tenant_name: tenant
				});
			} else if (action === "cancel") addVoucher({
				voucher_no: `VCH-CNL-${chqNo}`,
				voucher_type: "Journal Voucher",
				date: today,
				name: `PDC Cancelled – ${chqNo} (${tenant} - ${unit}) [${cancelReason}]`,
				debit: "Customer PDC Liability",
				debit_code: "21400",
				credit: "PDC In Hand",
				credit_code: "12900",
				amount: amt,
				method: "Cancellation",
				property_name: prop,
				unit_ref: unit,
				tenant_name: tenant
			});
			toast.success(`Cheque #${chqNo} marked as ${config.newStatus}. Database & GL updated.`);
			await new Promise((r) => setTimeout(r, 400));
		} catch (e) {
			toast.error(e.message || "Action failed. Please try again.");
		} finally {
			setActionLoading(false);
		}
	}
	function openCashModal(pdc) {
		const original = Number(pdc.amount || 0);
		const paid = Number(pdc.paid_amount || 0);
		const remaining = Math.max(0, original - paid);
		setCashPdc(pdc);
		setCashStep(1);
		setCashAmount(String(remaining > 0 ? remaining : original));
		setCashReceiptDate((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
		setCashNotes("");
		setCashCollectorName("Finance Department");
		setCashModalOpen(true);
	}
	function handleViewReceipt(pdc) {
		const chqNo = String(pdc.cheque_number || pdc.id);
		const history = receiptHistory[chqNo] || [];
		if (history.length > 0 || pdc.status === "Partial Cash" || pdc.paid_amount && pdc.paid_amount > 0) {
			setReceiptHistoryPdc(pdc);
			setReceiptHistoryIndex(Math.max(0, history.length - 1));
			setReceiptHistoryOpen(true);
			return;
		}
		setReceiptData({
			receiptNo: `REC-PDC-${chqNo}`,
			acknowledgementNo: `ACK-${chqNo}`,
			date: pdc.cheque_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			tenantName: pdc.tenant_name && pdc.tenant_name !== "—" ? pdc.tenant_name : "Valued Tenant",
			propertyName: pdc.property_name && pdc.property_name !== "—" ? pdc.property_name : "Property",
			unitRef: pdc.unit_ref && pdc.unit_ref !== "—" ? pdc.unit_ref : "Unit",
			leaseStartDate: pdc.lease_start || pdc.cheque_date,
			leaseEndDate: pdc.lease_end || pdc.cheque_date,
			monthlyRent: Number(pdc.amount) || 0,
			totalContractRent: Number(pdc.amount) || 0,
			depositAmount: 0,
			depositMode: pdc.status === "Partial Cash" ? "Partial Cash" : pdc.status === "Replaced" ? "Cash Replacement" : "Post-Dated Cheque",
			pdcCount: 1,
			pdcs: [{
				chequeNo: chqNo,
				bank: pdc.bank_name || "Bank",
				date: pdc.cheque_date,
				amount: Number(pdc.amount) || 0,
				period: `PDC Cheque #${chqNo} (${pdc.status})`,
				tenureStart: pdc.lease_start,
				tenureEnd: pdc.lease_end
			}],
			totalCollected: pdc.paid_amount != null && pdc.paid_amount > 0 ? Number(pdc.paid_amount) : Number(pdc.amount) || 0,
			cashierName: "Finance Department",
			notes: `PDC Record: Cheque #${chqNo} (${pdc.status}) for ${pdc.tenant_name || "Tenant"} - Unit ${pdc.unit_ref || "Unit"}. Amount: QAR ${Number(pdc.amount).toLocaleString()}.`
		});
		setReceiptOpen(true);
	}
	async function executeConfirmedCashReplacement() {
		if (!cashPdc) return;
		const pdc = cashPdc;
		const chqNo = pdc.cheque_number || pdc.id;
		const originalAmt = Number(pdc.amount) || 0;
		const alreadyPaid = Number(pdc.paid_amount) || 0;
		const confirmedAmt = parseFloat(cashAmount) || Math.max(0, originalAmt - alreadyPaid);
		const newPaidTotal = alreadyPaid + confirmedAmt;
		const isFullyPaid = newPaidTotal >= originalAmt - .01;
		const nextStatus = isFullyPaid ? "Replaced" : "Partial Cash";
		const receiptDate = cashReceiptDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		const remainingAfter = Math.max(0, originalAmt - newPaidTotal);
		setCashModalOpen(false);
		setActionLoading(true);
		try {
			await cashDepositInPlaceOfPdc(pdc.id, String(chqNo), confirmedAmt, cashNotes, receiptDate, cashCollectorName);
			setPdcs((prev) => prev.map((p) => String(p.id) === String(pdc.id) || String(p.cheque_number) === String(chqNo) ? {
				...p,
				status: nextStatus,
				paid_amount: newPaidTotal
			} : p));
			setSharedPdcs((prev) => prev.map((p) => String(p.id) === String(pdc.id) || String(p.chequeNo) === String(chqNo) ? {
				...p,
				status: isFullyPaid ? "replaced" : "partial_cash",
				paid_amount: newPaidTotal
			} : p));
			addCashBookEntry({
				date: receiptDate,
				voucher: `CSH-CHQ-${chqNo}`,
				description: `Cash Rent ${isFullyPaid ? "Settlement" : "Partial Payment"} (Cheque #${chqNo} - ${pdc.tenant_name || "Tenant"})`,
				type: "in",
				amount: confirmedAmt
			});
			addVoucher({
				voucher_no: `VCH-CSH-${chqNo}`,
				voucher_type: "Receipt Voucher",
				date: receiptDate,
				name: `Cash Collected in Place of PDC – ${chqNo} (${pdc.tenant_name || "Tenant"} - ${pdc.unit_ref || "Unit"})`,
				debit: "Cash In Hand",
				debit_code: "12100",
				credit: "Tenant Receivables",
				credit_code: "12413",
				amount: confirmedAmt,
				method: "Cash",
				property_name: pdc.property_name || "Property",
				unit_ref: pdc.unit_ref || "Unit",
				tenant_name: pdc.tenant_name || "Tenant"
			});
			addVoucher({
				voucher_no: `VCH-CSH-RET-${chqNo}`,
				voucher_type: "Journal Voucher",
				date: receiptDate,
				name: `PDC Cancelled / Returned on Cash Settlement – ${chqNo} (${pdc.tenant_name || "Tenant"} - ${pdc.unit_ref || "Unit"})`,
				debit: "Customer PDC Liability",
				debit_code: "21400",
				credit: "PDC In Hand",
				credit_code: "12900",
				amount: confirmedAmt,
				method: "Cash Settlement",
				property_name: pdc.property_name || "Property",
				unit_ref: pdc.unit_ref || "Unit",
				tenant_name: pdc.tenant_name || "Tenant"
			});
			addVoucher({
				voucher_no: `VCH-CSH-DEP-${chqNo}`,
				voucher_type: "Contra Voucher",
				date: receiptDate,
				name: `Bank Deposit of Replaced PDC Cash Till – ${chqNo} (${pdc.tenant_name || "Tenant"} - ${pdc.unit_ref || "Unit"})`,
				debit: "Bank Operating Account",
				debit_code: "12000",
				credit: "Cash In Hand",
				credit_code: "12100",
				amount: confirmedAmt,
				method: "Bank Deposit",
				property_name: pdc.property_name || "Property",
				unit_ref: pdc.unit_ref || "Unit",
				tenant_name: pdc.tenant_name || "Tenant"
			});
			const installmentNum = (receiptHistory[chqNo] || []).length + 1;
			const receiptNum = `CASH-${chqNo}-INS${installmentNum}`;
			const receipt = {
				receiptNo: receiptNum,
				acknowledgementNo: `ACK-CASH-${chqNo}-${installmentNum}`,
				date: receiptDate,
				tenantName: pdc.tenant_name && pdc.tenant_name !== "—" ? pdc.tenant_name : "Valued Tenant",
				propertyName: pdc.property_name && pdc.property_name !== "—" ? pdc.property_name : "Property",
				unitRef: pdc.unit_ref && pdc.unit_ref !== "—" ? pdc.unit_ref : "Unit",
				leaseStartDate: pdc.lease_start || receiptDate,
				leaseEndDate: pdc.lease_end || receiptDate,
				monthlyRent: confirmedAmt,
				totalContractRent: originalAmt,
				depositAmount: 0,
				depositMode: isFullyPaid ? installmentNum > 1 ? `Final Cash Settlement (Instalment #${installmentNum})` : "Full Cash Settlement" : `Partial Cash (Instalment #${installmentNum})`,
				pdcCount: 1,
				pdcs: [{
					chequeNo: String(chqNo),
					bank: pdc.bank_name || "Cash Replacement",
					date: pdc.cheque_date,
					amount: confirmedAmt,
					period: isFullyPaid ? `Final Cash Settlement (Instalment #${installmentNum}) of Cheque #${chqNo}` : `Cash Instalment #${installmentNum}: QAR ${confirmedAmt.toLocaleString()} (Total Paid: QAR ${newPaidTotal.toLocaleString()} / Remaining: QAR ${remainingAfter.toLocaleString()})`,
					tenureStart: pdc.lease_start || receiptDate,
					tenureEnd: pdc.lease_end || receiptDate
				}],
				totalCollected: confirmedAmt,
				cashierName: cashCollectorName || "Finance Department",
				notes: `CASH IN LIEU OF CHEQUE (Instalment #${installmentNum}): Received QAR ${confirmedAmt.toLocaleString()} in cash for Cheque #${chqNo}. Total Paid So Far: QAR ${newPaidTotal.toLocaleString()} | Remaining Balance Due: QAR ${remainingAfter.toLocaleString()}.${cashNotes ? ` Remarks: ${cashNotes}` : ""}`
			};
			setReceiptHistory((prev) => {
				const key = String(chqNo);
				const existing = prev[key] || [];
				const next = {
					...prev,
					[key]: [...existing, receipt]
				};
				saveReceiptHistory(next);
				return next;
			});
			setReceiptHistoryPdc({
				...pdc,
				status: nextStatus,
				paid_amount: newPaidTotal
			});
			setReceiptHistoryIndex(installmentNum - 1);
			setReceiptData(receipt);
			setReceiptHistoryOpen(true);
			toast.success(isFullyPaid ? `Cheque #${chqNo} fully settled in cash (QAR ${confirmedAmt.toLocaleString()}). Receipt #${receiptNum} generated.` : `Partial cash payment of QAR ${confirmedAmt.toLocaleString()} recorded for Cheque #${chqNo}. Receipt #${receiptNum} generated. Remaining due: QAR ${remainingAfter.toLocaleString()}.`);
			await new Promise((r) => setTimeout(r, 400));
		} catch (e) {
			toast.error(e.message || "Failed to process cash replacement.");
		} finally {
			setActionLoading(false);
			setCashPdc(null);
		}
	}
	function handleGeneratePdcSchedule() {
		const count = parseInt(genCount) || 12;
		const startNum = parseInt(genStartNo) || 1;
		const lease = leases.find((l) => l.id === selectedLeaseId);
		const rentAmt = String(lease?.monthlyRent || "6500");
		const defaultBank = "Qatar National Bank (QNB)";
		const maturityDateStr = genStartDate ? new Date(genStartDate).toISOString().split("T")[0] : (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		const tenurePeriodStr = `${lease?.startDate || maturityDateStr} to ${lease?.endDate || maturityDateStr}`;
		const newRows = [];
		for (let i = 0; i < count; i++) {
			const chqNum = `${genPrefix || "PDC-"}${String(startNum + i).padStart(3, "0")}`;
			newRows.push({
				id: String(i + 1),
				chequeNo: chqNum,
				bank: defaultBank,
				chequeDate: maturityDateStr,
				period: tenurePeriodStr,
				amount: rentAmt
			});
		}
		setAddPdcRows(newRows);
		toast.success(`Generated ${count} Post-Dated Cheque schedule rows.`);
	}
	async function handleAddPdc() {
		if (!selectedLeaseId) {
			toast.error("Please select a Lease / Tenant Agreement.");
			return;
		}
		const lease = leases.find((l) => l.id === selectedLeaseId);
		if (!lease) {
			toast.error("Selected lease could not be found.");
			return;
		}
		if (collectionType !== "PDC") {
			const amount = parseFloat(otherCollectionAmount);
			if (!amount || amount <= 0) {
				toast.error("Enter a valid collection amount.");
				return;
			}
			setAddPdcLoading(true);
			try {
				await collectSecurityDeposit({
					amount,
					tenant_id: lease.customerId || "00000000-0000-0000-0000-000000000003",
					property_id: lease.propertyId || "00000000-0000-0000-0000-000000000001",
					unit_id: lease.unitId || "00000000-0000-0000-0000-000000000002",
					lease_id: lease.id,
					mode: "Cash",
					depositType: collectionType === "Security Deposit" ? "SECURITY" : "SERVICE_FEE",
					ref: otherCollectionDescription.trim() || `${collectionType} collected by Cashier`,
					unit_name: lease.unit
				});
				addVoucher({
					voucher_no: `VCH-CASH-${Date.now()}`,
					voucher_type: "Receipt Voucher",
					date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
					name: `${collectionType} - ${lease.tenantName}`,
					debit: "Cash / Bank Collection",
					credit: collectionType === "Security Deposit" ? "Security Deposit Liability" : "Tenant Receivable",
					amount,
					method: "Cashier Collection",
					property_name: lease.property,
					unit_ref: lease.unit,
					tenant_name: lease.tenantName
				});
				setAddPdcOpen(false);
				setOtherCollectionAmount("");
				setOtherCollectionDescription("");
				toast.success(`${collectionType} collected for ${lease.tenantName} · ${lease.property} · ${lease.unit}.`);
			} catch (error) {
				toast.error(error.message || "Collection failed.");
			} finally {
				setAddPdcLoading(false);
			}
			return;
		}
		if (addPdcRows.length === 0) {
			toast.error("Please add at least one Cheque row.");
			return;
		}
		for (let i = 0; i < addPdcRows.length; i++) {
			const r = addPdcRows[i];
			if (!r.chequeNo || !r.chequeDate || !r.amount || parseFloat(r.amount) <= 0) {
				toast.error(`Please complete Cheque Number, Maturity Date and Amount on row #${i + 1}.`);
				return;
			}
		}
		const prop = lease?.property || "Old Salata - Residence No:23";
		const unit = lease?.unit || "Unit";
		const tenant = lease?.tenantName || "Valued Tenant";
		setAddPdcLoading(true);
		try {
			const { data: leaseRow } = await (selectedLeaseId ? String(selectedLeaseId).match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) ? supabase.from("leases").select("id, customer_id, property_id, unit_id").eq("id", String(selectedLeaseId)).maybeSingle() : supabase.from("leases").select("id, customer_id, property_id, unit_id").eq("lease_number", String(selectedLeaseId)).maybeSingle() : Promise.resolve({
				data: null,
				error: null
			}));
			const customerId = leaseRow?.customer_id || lease?.customerId || "00000000-0000-0000-0000-000000000003";
			const propertyId = leaseRow?.property_id || lease?.propertyId || "00000000-0000-0000-0000-000000000001";
			const unitId = leaseRow?.unit_id || lease?.unitId || "00000000-0000-0000-0000-000000000002";
			const dbLeaseId = leaseRow?.id || selectedLeaseId;
			let totalBatchAmt = 0;
			const receiptPdcs = [];
			const newContextPdcs = [];
			for (const row of addPdcRows) {
				const amt = parseFloat(row.amount) || 0;
				totalBatchAmt += amt;
				try {
					await receivePdc({
						cheque_number: row.chequeNo,
						cheque_date: row.chequeDate,
						amount: amt,
						tenant_id: String(customerId),
						property_id: String(propertyId),
						unit_id: String(unitId),
						unitCode: unit,
						lease_id: String(dbLeaseId)
					});
				} catch (e) {
					console.warn("[receivePdc] Notice during receive:", e?.message);
				}
				addVoucher({
					voucher_no: `VCH-PDC-REC-${row.chequeNo}`,
					voucher_type: "Journal Voucher",
					date: row.chequeDate,
					name: `PDC Collected – ${row.chequeNo} (${tenant} - ${unit})`,
					debit: "PDC In Hand",
					debit_code: "12900",
					credit: "Customer PDC Liability",
					credit_code: "21400",
					amount: amt,
					method: "PDC",
					property_name: prop,
					unit_ref: unit,
					tenant_name: tenant
				});
				receiptPdcs.push({
					chequeNo: row.chequeNo,
					bank: row.bank || "Qatar National Bank (QNB)",
					date: row.chequeDate,
					amount: amt,
					period: row.period || "Rent Instalment",
					tenureStart: row.period?.includes(" to ") ? row.period.split(" to ")[0] : row.chequeDate,
					tenureEnd: row.period?.includes(" to ") ? row.period.split(" to ")[1] : row.chequeDate
				});
				newContextPdcs.push({
					id: `pdc-${Date.now()}-${row.chequeNo}`,
					leaseId: selectedLeaseId,
					chequeNo: row.chequeNo,
					bank: row.bank || "Qatar National Bank (QNB)",
					date: row.chequeDate,
					amount: amt,
					status: "received",
					period: row.period
				});
			}
			setSharedPdcs((prev) => [...newContextPdcs, ...prev]);
			const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
			setReceiptData({
				receiptNo: `REC-PDC-BATCH-${Date.now().toString().slice(-6)}`,
				acknowledgementNo: `ACK-PDC-${addPdcRows[0]?.chequeNo || "COLLECT"}`,
				date: todayStr,
				tenantName: tenant,
				propertyName: prop,
				unitRef: unit,
				leaseStartDate: lease?.startDate || todayStr,
				leaseEndDate: lease?.endDate || todayStr,
				monthlyRent: parseFloat(addPdcRows[0]?.amount) || 0,
				totalContractRent: totalBatchAmt,
				depositAmount: 0,
				depositMode: "PDC",
				pdcCount: addPdcRows.length,
				pdcs: receiptPdcs,
				totalCollected: totalBatchAmt,
				cashierName: "Finance Department",
				notes: `PDC COLLECTION ACKNOWLEDGMENT: Received ${addPdcRows.length} Post-Dated Cheques totaling QAR ${totalBatchAmt.toLocaleString()} for ${tenant} (${prop} - ${unit}). GL Posted: DR 12900 PDC In Hand / CR 21400 Customer PDC Liability.`
			});
			setReceiptOpen(true);
			toast.success(`Successfully registered ${addPdcRows.length} Post-Dated Cheques (QAR ${totalBatchAmt.toLocaleString()}) & updated GLs!`);
			setAddPdcOpen(false);
			await new Promise((r) => setTimeout(r, 400));
			load(false);
		} catch (e) {
			toast.error(e.message || "Failed to save PDCs to database.");
		} finally {
			setAddPdcLoading(false);
		}
	}
	function handleExportCsv() {
		const headers = [
			"Entry Date",
			"Cheque Date",
			"Cheque No",
			"Bank",
			"Property",
			"Unit",
			"Customer Name",
			"Amount (QAR)",
			"Status"
		];
		const rows = filteredPdcs.map((p) => [
			p.entry_date || p.cheque_date,
			p.cheque_date,
			p.cheque_number,
			`"${p.bank_name || ""}"`,
			`"${p.property_name || ""}"`,
			`"${p.unit_ref || ""}"`,
			`"${p.tenant_name || ""}"`,
			p.amount,
			p.status
		]);
		const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `pdc_register_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success("PDC Register exported to CSV");
	}
	function resetFilters() {
		setSelectedProperty("all");
		setSelectedUnit("all");
		setSelectedCustomer("all");
		setSelectedMonth("all");
		setFromDate("");
		setToDate("");
		setSearchQuery("");
		setStatusFilter("all");
		setSortField("cheque_date");
		setSortAsc(false);
		setPage(1);
		toast.info("All PDC filters reset to default");
	}
	const glConfig = pendingActionPdc && pendingAction ? getActionConfig(pendingAction, pendingActionPdc.cheque_number || "", pendingActionPdc.tenant_name || "Tenant", Number(pendingActionPdc.amount) || 0) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-lg flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-5 w-5 text-primary" }), "PDC Register & Management"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-xs mt-1",
						children: "Track collected cheques, filter by Property, Unit, Date, Month and Customer (Ascending order), manage bank deposits, clearances, returns, and voluntary cancellations with real-time DB persistence."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 flex-wrap",
						children: [
							actionLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full animate-pulse",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin text-amber-600" }), " Syncing DB & GL..."]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								className: "h-8 text-xs gap-1.5",
								onClick: handleExportCsv,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Export CSV"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "h-8 text-xs gap-1.5",
								onClick: () => setAddPdcOpen(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Register PDC"]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border bg-muted/25 p-3.5 space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-bold uppercase tracking-wider text-foreground",
											children: "Multi-Dimensional Filter Bar (Ascending Order)"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										className: "h-6 text-xs text-muted-foreground hover:text-primary px-2",
										onClick: resetFilters,
										children: "Reset All Filters"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
												className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-3 w-3" }), " Property"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: selectedProperty,
												onValueChange: (v) => {
													setSelectedProperty(v);
													setSelectedUnit("all");
													setPage(1);
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs bg-background",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Properties" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
													value: "all",
													children: [
														"All Properties (",
														propertyOptions.length,
														")"
													]
												}), propertyOptions.map((prop) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: prop,
													children: prop
												}, prop))] })]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
												className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-3 w-3" }), " Unit"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: selectedUnit,
												onValueChange: (v) => {
													setSelectedUnit(v);
													setPage(1);
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs bg-background",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Units" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
													value: "all",
													children: [
														"All Units (",
														unitOptions.length,
														")"
													]
												}), unitOptions.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: u,
													children: u
												}, u))] })]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
												className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-3 w-3" }), " Customer Name"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: selectedCustomer,
												onValueChange: (v) => {
													setSelectedCustomer(v);
													setPage(1);
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs bg-background",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Customers" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
													value: "all",
													children: [
														"All Customers (",
														customerOptions.length,
														")"
													]
												}), customerOptions.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: c,
													children: c
												}, c))] })]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
												className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3 w-3" }), " Maturity Month"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: selectedMonth,
												onValueChange: (v) => {
													setSelectedMonth(v);
													setPage(1);
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs bg-background font-mono",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Months" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "all",
													children: "All Maturity Months"
												}), monthOptions.map((m) => {
													const [y, mm] = m.split("-");
													return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
														value: m,
														className: "font-mono text-xs",
														children: [
															new Date(Number(y), Number(mm) - 1, 1).toLocaleString("default", {
																month: "short",
																year: "numeric"
															}),
															" (",
															m,
															")"
														]
													}, m);
												})] })]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
												className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3" }), " PDC Status"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: statusFilter,
												onValueChange: (v) => {
													setStatusFilter(v);
													setPage(1);
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs bg-background",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Statuses" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
														value: "all",
														children: [
															"All Statuses (",
															pdcs.length,
															")"
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
														value: "due",
														children: [
															"Due / In Hand (",
															pdcs.filter((p) => p.status === "In Hand" || p.status === "Returned").length,
															")"
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
														value: "posted",
														children: [
															"Posted / Banking (",
															pdcs.filter((p) => p.status === "Deposited" || p.status === "Cleared").length,
															")"
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "In Hand",
														children: "In Hand"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Deposited",
														children: "Deposited to Bank"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Cleared",
														children: "Cleared"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Returned",
														children: "Returned / Bounced"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Cancelled",
														children: "Cancelled"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Replaced",
														children: "Replaced with Cash"
													})
												] })]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "sm:col-span-4 relative",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												className: "pl-8 h-8 text-xs bg-background",
												placeholder: "Search cheque #, bank, customer, property, unit...",
												value: searchQuery,
												onChange: (e) => {
													setSearchQuery(e.target.value);
													setPage(1);
												}
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "sm:col-span-3 flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px] text-muted-foreground whitespace-nowrap",
												children: "From Date:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "date",
												className: "h-8 text-xs bg-background",
												value: fromDate,
												onChange: (e) => {
													setFromDate(e.target.value);
													setPage(1);
												}
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "sm:col-span-3 flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px] text-muted-foreground whitespace-nowrap",
												children: "To Date:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "date",
												className: "h-8 text-xs bg-background",
												value: toDate,
												onChange: (e) => {
													setToDate(e.target.value);
													setPage(1);
												}
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "sm:col-span-2 flex items-center gap-1.5 justify-end",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												className: "h-8 text-xs w-full gap-1",
												onClick: () => setSortAsc(!sortAsc),
												title: "Toggle Ascending / Descending order",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "h-3 w-3" }),
													" ",
													sortAsc ? "Sort: Ascending ↑" : "Sort: Descending ↓"
												]
											})
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-xs px-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									"Showing ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-foreground",
										children: filteredPdcs.length
									}),
									" of ",
									pdcs.length,
									" cheques",
									selectedProperty !== "all" ? ` • Property: ${selectedProperty}` : "",
									selectedUnit !== "all" ? ` • Unit: ${selectedUnit}` : "",
									selectedCustomer !== "all" ? ` • Customer: ${selectedCustomer}` : "",
									selectedMonth !== "all" ? ` • Month: ${selectedMonth}` : ""
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono",
								children: ["Filtered Total: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									className: "text-emerald-600 font-bold",
									children: ["QR ", totalFilteredAmount.toLocaleString()]
								})]
							})]
						}),
						loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-center py-12 text-sm text-muted-foreground gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-primary" }), " Loading PDC register from database..."]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border rounded-lg overflow-hidden bg-card",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "bg-muted/50 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
										className: "font-bold cursor-pointer",
										onClick: () => {
											setSortField("cheque_date");
											setSortAsc(!sortAsc);
										},
										children: ["Cheque Date ", sortField === "cheque_date" && (sortAsc ? "↑" : "↓")]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
										className: "font-bold cursor-pointer",
										onClick: () => {
											setSortField("cheque_number");
											setSortAsc(!sortAsc);
										},
										children: ["Cheque No. ", sortField === "cheque_number" && (sortAsc ? "↑" : "↓")]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "font-bold",
										children: "Bank"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "font-bold",
										children: "Property"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "font-bold",
										children: "Unit"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
										className: "font-bold cursor-pointer",
										onClick: () => {
											setSortField("tenant_name");
											setSortAsc(!sortAsc);
										},
										children: ["Customer / Tenant ", sortField === "tenant_name" && (sortAsc ? "↑" : "↓")]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
										className: "text-right font-bold cursor-pointer",
										onClick: () => {
											setSortField("amount");
											setSortAsc(!sortAsc);
										},
										children: ["Amount (QAR) ", sortField === "amount" && (sortAsc ? "↑" : "↓")]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "font-bold text-center",
										children: "Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "font-bold text-center",
										children: "Actions & GL"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [paginated.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								colSpan: 9,
								className: "text-center py-10 text-muted-foreground text-xs",
								children: "No post-dated cheques match the active Property, Unit, Date, Month, or Customer filter criteria."
							}) }), paginated.map((pdc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "hover:bg-muted/30 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-mono text-xs font-semibold",
										children: pdc.cheque_date
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-mono font-bold text-xs text-primary",
										children: pdc.cheque_number
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-xs",
										children: pdc.bank_name || "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-xs",
										children: pdc.property_name || "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-xs font-mono font-medium",
										children: pdc.unit_ref || "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-xs font-medium",
										children: pdc.tenant_name || "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "text-right font-bold font-mono text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: Number(pdc.amount).toLocaleString() }), pdc.paid_amount != null && pdc.paid_amount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[10px] font-normal",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-purple-600 dark:text-purple-400",
												children: ["Paid: ", Number(pdc.paid_amount).toLocaleString()]
											}), Number(pdc.amount) - Number(pdc.paid_amount) > .01 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-amber-600 dark:text-amber-400 ml-1",
												children: ["Due: ", (Number(pdc.amount) - Number(pdc.paid_amount)).toLocaleString()]
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: pdc.status === "In Hand" ? "default" : pdc.status === "Deposited" ? "secondary" : pdc.status === "Cleared" ? "outline" : "destructive",
											className: `text-[11px] capitalize ${pdc.status === "Cleared" ? "bg-emerald-500/15 text-emerald-700 border-emerald-300 font-semibold" : pdc.status === "Returned" ? "bg-red-500/15 text-red-700 border-red-300 font-semibold" : pdc.status === "Deposited" ? "bg-blue-500/15 text-blue-700 border-blue-300 font-semibold" : pdc.status === "Cancelled" ? "bg-gray-400/20 text-gray-700 border-gray-300 font-semibold" : pdc.status === "Replaced" ? "bg-purple-500/15 text-purple-700 border-purple-300 font-semibold" : pdc.status === "Partial Cash" ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300 font-semibold" : ""}`,
											children: pdc.status
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex items-center justify-center gap-1.5 flex-wrap",
											children: (() => {
												const linkedLease = leases?.find((l) => l.id === pdc.lease_id || l.tenantName === pdc.tenant_name || l.unit === pdc.unit_ref);
												const isVacatedLease = Boolean(linkedLease && (linkedLease.status === "closed" || linkedLease.earlyVacate));
												if (pdc.status === "Returned" && isVacatedLease) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] font-medium text-muted-foreground italic px-1.5 py-0.5 rounded bg-muted/40",
													children: "Lease Vacated"
												});
												const histCount = (receiptHistory[String(pdc.cheque_number || pdc.id)] || []).length;
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: histCount > 1 || pdc.status === "Partial Cash" ? "outline" : "ghost",
														className: `h-6 text-xs gap-1 px-1.5 ${histCount > 1 ? "border-amber-400 bg-amber-50/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100" : "text-primary"}`,
														onClick: () => handleViewReceipt(pdc),
														title: "View payment receipt(s)",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3 w-3" }), histCount > 1 ? `Receipts (${histCount})` : "Receipt"]
													}),
													pdc.status === "In Hand" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														className: "h-6 text-xs px-2",
														onClick: () => openGlConfirm(pdc, "deposit"),
														children: "Deposit"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-6 text-xs px-2 border-purple-300 text-purple-700 hover:bg-purple-50",
														onClick: () => openCashModal(pdc),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-3 w-3 mr-1" }), " Cash"]
													})] }),
													pdc.status === "Partial Cash" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-6 text-xs px-2 border-purple-400 bg-purple-50/50 text-purple-700 hover:bg-purple-100",
														onClick: () => openCashModal(pdc),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-3 w-3 mr-1" }), " Pay Cash"]
													}),
													pdc.status === "Deposited" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-6 text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-2",
														onClick: () => openGlConfirm(pdc, "clear"),
														children: "Clear"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "destructive",
														className: "h-6 text-xs px-2",
														onClick: () => openGlConfirm(pdc, "return"),
														children: "Return"
													})] }),
													pdc.status === "Returned" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-6 text-xs border-blue-500 text-blue-600 hover:bg-blue-50 px-2",
														disabled: actionLoading,
														onClick: () => openGlConfirm(pdc, "deposit"),
														children: "Re-Deposit"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-6 text-xs border-purple-300 text-purple-700 hover:bg-purple-50 px-2",
														disabled: actionLoading,
														onClick: () => openCashModal(pdc),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-3 w-3 mr-1" }), " Cash"]
													})] })
												] });
											})()
										})
									})
								]
							}, pdc.id))] })] })
						}), filteredPdcs.length > PAGE_SIZE && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mt-4 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Showing ",
								(page - 1) * PAGE_SIZE + 1,
								"–",
								Math.min(page * PAGE_SIZE, filteredPdcs.length),
								" of ",
								filteredPdcs.length
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										className: "h-7",
										disabled: page === 1,
										onClick: () => setPage((p) => p - 1),
										children: "← Prev"
									}),
									Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => Math.abs(p - page) <= 2).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: p === page ? "default" : "outline",
										className: "h-7 w-7 p-0",
										onClick: () => setPage(p),
										children: p
									}, p)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										className: "h-7",
										disabled: page === totalPages,
										onClick: () => setPage((p) => p + 1),
										children: "Next →"
									})
								]
							})]
						})] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: receiptHistoryOpen,
				onOpenChange: setReceiptHistoryOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[560px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2 text-base font-bold text-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-5 w-5 text-amber-600" }),
								"Cash Payment Receipts — Cheque #",
								receiptHistoryPdc?.cheque_number
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs text-muted-foreground",
							children: "All partial cash payment receipts for this PDC. Each instalment is a separate receipt."
						})] }),
						receiptHistoryPdc && (() => {
							const history = receiptHistory[receiptHistoryPdc.cheque_number] || [];
							const current = history[receiptHistoryIndex];
							const totalPaid = history.reduce((s, r) => s + (r.totalCollected || 0), 0);
							const chequeAmt = Number(receiptHistoryPdc.amount) || 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Cheque Amount: "
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono font-bold",
												children: ["QR ", chequeAmt.toLocaleString()]
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Total Paid: "
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono font-bold text-green-600",
												children: ["QR ", totalPaid.toLocaleString()]
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Remaining: "
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: `font-mono font-bold ${chequeAmt - totalPaid > 0 ? "text-amber-600" : "text-green-600"}`,
												children: ["QR ", Math.max(0, chequeAmt - totalPaid).toLocaleString()]
											})] })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted-foreground font-semibold",
											children: [
												"Receipt ",
												receiptHistoryIndex + 1,
												" of ",
												history.length
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												className: "h-7 px-3",
												disabled: receiptHistoryIndex === 0,
												onClick: () => setReceiptHistoryIndex((i) => i - 1),
												children: "← Prev"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												className: "h-7 px-3",
												disabled: receiptHistoryIndex === history.length - 1,
												onClick: () => setReceiptHistoryIndex((i) => i + 1),
												children: "Next →"
											})]
										})]
									}),
									current && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border bg-background p-4 space-y-2.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between items-center border-b pb-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-bold text-sm",
													children: current.receiptNo
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-muted-foreground text-[11px]",
													children: current.acknowledgementNo
												})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-right",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-[11px] text-muted-foreground",
														children: "Date"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "font-mono font-bold",
														children: current.date
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Tenant: "
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: current.tenantName
													})] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Unit: "
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: current.unitRef
													})] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Property: "
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: current.propertyName
													})] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Mode: "
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: current.depositMode
													})] })
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between items-center rounded-md bg-green-50 border border-green-200 px-3 py-2 mt-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-green-800",
													children: "Amount Collected"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono font-bold text-green-700 text-sm",
													children: ["QR ", (current.totalCollected || 0).toLocaleString()]
												})]
											}),
											current.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] text-muted-foreground bg-muted/30 rounded p-2 leading-relaxed",
												children: current.notes
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "secondary",
												className: "w-full h-7 text-xs gap-1",
												onClick: () => {
													setReceiptData(current);
													setReceiptHistoryOpen(false);
													setReceiptOpen(true);
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3 w-3" }), " Open Full Receipt"]
											})
										]
									}),
									history.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-center text-muted-foreground py-6",
										children: "No receipts recorded for this PDC yet."
									})
								]
							});
						})(),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setReceiptHistoryOpen(false),
							children: "Close"
						}) })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: addPdcOpen,
				onOpenChange: setAddPdcOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[840px] max-h-[92vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2 text-base font-bold text-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-5 w-5 text-primary" }),
								" ",
								collectionType === "PDC" ? "Register Post-Dated Cheques (PDC)" : `Collect ${collectionType}`
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs text-muted-foreground",
							children: collectionType === "PDC" ? "Add post-dated cheques in full collection format, post double-entry GL, and issue an official acknowledgement receipt." : "Collect the selected tenant amount, post the double-entry finance transaction, and issue an official receipt."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5 py-1 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border bg-muted/30 p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-[11px] font-semibold",
										children: "Collection Type"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: collectionType,
										onValueChange: (value) => setCollectionType(value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "mt-1 h-8 text-xs bg-background",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "PDC",
												children: "Post-Dated Cheques (PDC)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Security Deposit",
												children: "Security Deposit"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Other Amount",
												children: "Other Amount / Service Fee"
											})
										] })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-lg border bg-muted/30 p-3 space-y-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-1 md:grid-cols-2 gap-3 items-center",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
													className: "text-[11px] font-semibold flex items-center gap-1.5",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-3.5 w-3.5 text-primary" }),
														" Lease / Tenant Agreement ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-destructive",
															children: "*"
														})
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: selectedLeaseId,
													onValueChange: (v) => {
														setSelectedLeaseId(v);
														const lease = leases.find((l) => l.id === v);
														if (lease) {
															const rentStr = String(lease.monthlyRent || 6500);
															const leaseStart = lease.startDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
															const contractTenure = `${leaseStart} to ${lease.endDate || leaseStart}`;
															setGenPrefix(`PDC-${lease.unit?.replace(/\s+/g, "") || "Flat"}-`);
															setGenStartDate(leaseStart);
															setAddPdcRows((prev) => prev.map((r) => ({
																...r,
																amount: rentStr,
																chequeDate: r.chequeDate || leaseStart,
																period: contractTenure
															})));
														}
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "h-8 text-xs bg-background",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select tenant lease agreement" })
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: leases.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
														value: l.id,
														children: [
															l.tenantName,
															" — ",
															l.unit,
															" (",
															l.property,
															") • QR ",
															l.monthlyRent?.toLocaleString(),
															"/mo"
														]
													}, l.id)) })]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 border-t pt-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-[11px] font-semibold",
														children: "Lease Start Date"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														className: "h-8 text-xs bg-background",
														type: "date",
														value: leases.find((l) => l.id === selectedLeaseId)?.startDate || "",
														readOnly: true
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-[11px] font-semibold",
														children: "Lease End Date"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														className: "h-8 text-xs bg-background",
														type: "date",
														value: leases.find((l) => l.id === selectedLeaseId)?.endDate || "",
														readOnly: true
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-3 space-y-1 border-t pt-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-[11px] font-semibold",
														children: "All PDCs File (Optional)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														className: "h-8 text-xs bg-background",
														type: "file",
														accept: ".pdf,.jpg,.jpeg,.png,.xlsx,.xls",
														onChange: (event) => setBatchPdcFile(event.target.files?.[0] || null)
													}),
													batchPdcFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "text-[10px] text-muted-foreground",
														children: ["Attached: ", batchPdcFile.name]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "border rounded-md p-2 bg-background/80 space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Quick Generator" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-normal lowercase",
														children: "auto-fill schedule"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1.5 flex-wrap",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															className: "h-7 text-[11px] w-14 font-mono text-center",
															placeholder: "Qty",
															title: "Number of cheques",
															value: genCount,
															onChange: (e) => setGenCount(e.target.value)
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															className: "h-7 text-[11px] w-28 font-mono",
															placeholder: "Prefix e.g. PDC-",
															title: "Cheque Number Prefix",
															value: genPrefix,
															onChange: (e) => setGenPrefix(e.target.value)
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "date",
															className: "h-7 text-[11px] w-32",
															title: "Start Maturity Date",
															value: genStartDate,
															onChange: (e) => setGenStartDate(e.target.value)
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															type: "button",
															size: "sm",
															variant: "secondary",
															className: "h-7 text-[11px] px-2 font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30",
															onClick: handleGeneratePdcSchedule,
															children: "⚡ Auto-Generate"
														})
													]
												})]
											})
										]
									})
								}),
								collectionType !== "PDC" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-1 md:grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px] font-semibold",
												children: "Amount (QAR) *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												min: "0",
												className: "h-8 text-xs",
												value: otherCollectionAmount,
												onChange: (e) => setOtherCollectionAmount(e.target.value)
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px] font-semibold",
												children: "Description"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												className: "h-8 text-xs",
												value: otherCollectionDescription,
												onChange: (e) => setOtherCollectionDescription(e.target.value),
												placeholder: "Collection reason"
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: "This collection will post to the tenant ledger and generate a receipt for the selected lease."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: collectionType === "PDC" ? "space-y-2" : "hidden",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-4 w-4 text-primary" }),
												"PDC Collection Schedule (",
												addPdcRows.length,
												" Cheques)"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs font-mono font-bold text-foreground",
												children: ["Total: QR ", addPdcRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0).toLocaleString()]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "button",
												size: "sm",
												variant: "outline",
												className: "h-7 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/5",
												onClick: () => {
													const nextId = String(addPdcRows.length + 1);
													const last = addPdcRows[addPdcRows.length - 1];
													const lease = leases.find((l) => l.id === selectedLeaseId);
													const defaultDate = last?.chequeDate || genStartDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
													const defaultPeriod = last?.period || (lease ? `${lease.startDate} to ${lease.endDate}` : "Rent Instalment");
													setAddPdcRows([...addPdcRows, {
														id: nextId,
														chequeNo: `${genPrefix || "PDC-"}${String(addPdcRows.length + 1).padStart(3, "0")}`,
														bank: last?.bank || "Qatar National Bank (QNB)",
														chequeDate: defaultDate,
														period: defaultPeriod,
														amount: last?.amount || String(lease?.monthlyRent || "6500")
													}]);
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), " Add Row"]
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "border rounded-lg overflow-hidden bg-background",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
											className: "w-full text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
												className: "bg-muted/60 text-muted-foreground font-semibold border-b",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "py-2 px-2.5 text-center w-10",
														children: "#"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
														className: "py-2 px-2.5 text-left w-36",
														children: ["Cheque No. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-destructive",
															children: "*"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "py-2 px-2.5 text-left",
														children: "Bank"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
														className: "py-2 px-2.5 text-left w-32",
														children: ["Maturity Date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-destructive",
															children: "*"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "py-2 px-2.5 text-left",
														children: "Period"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
														className: "py-2 px-2.5 text-right w-28",
														children: ["Amount (QAR) ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-destructive",
															children: "*"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "py-2 px-2.5 text-left w-36",
														children: "PDC File (Optional)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "py-2 px-1 text-center w-10" })
												] })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
												className: "divide-y divide-border",
												children: addPdcRows.map((row, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													className: "hover:bg-muted/20",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "py-1.5 px-2 text-center font-mono text-muted-foreground font-bold",
															children: idx + 1
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "py-1.5 px-2",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																className: "h-7 text-xs font-mono font-bold",
																placeholder: "e.g. QNB-001",
																value: row.chequeNo,
																onChange: (e) => {
																	const val = e.target.value;
																	setAddPdcRows((rows) => rows.map((r, i) => i === idx ? {
																		...r,
																		chequeNo: val
																	} : r));
																}
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
															className: "py-1.5 px-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "file",
																accept: ".pdf,.jpg,.jpeg,.png",
																className: "h-7 text-[10px] w-36",
																onChange: (e) => {
																	const file = e.target.files?.[0];
																	setAddPdcRows((rows) => rows.map((r, i) => i === idx ? {
																		...r,
																		file
																	} : r));
																}
															}), row.file && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "block max-w-36 truncate text-[9px] text-muted-foreground",
																children: row.file.name
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "py-1.5 px-2",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																className: "h-7 text-xs",
																placeholder: "Bank Name",
																value: row.bank,
																onChange: (e) => {
																	const val = e.target.value;
																	setAddPdcRows((rows) => rows.map((r, i) => i === idx ? {
																		...r,
																		bank: val
																	} : r));
																}
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "py-1.5 px-2",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "date",
																className: "h-7 text-xs font-mono",
																value: row.chequeDate,
																onChange: (e) => {
																	const val = e.target.value;
																	setAddPdcRows((rows) => rows.map((r, i) => i === idx ? {
																		...r,
																		chequeDate: val
																	} : r));
																}
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "py-1.5 px-2",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																className: "h-7 text-xs",
																placeholder: "e.g. 2026-09-02 to 2026-10-01",
																value: row.period,
																onChange: (e) => {
																	const val = e.target.value;
																	setAddPdcRows((rows) => rows.map((r, i) => i === idx ? {
																		...r,
																		period: val
																	} : r));
																}
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "py-1.5 px-2",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "number",
																step: "0.01",
																className: "h-7 text-xs font-mono font-bold text-right",
																placeholder: "6500",
																value: row.amount,
																onChange: (e) => {
																	const val = e.target.value;
																	setAddPdcRows((rows) => rows.map((r, i) => i === idx ? {
																		...r,
																		amount: val
																	} : r));
																}
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "py-1.5 px-1 text-center",
															children: addPdcRows.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																type: "button",
																size: "sm",
																variant: "ghost",
																className: "h-6 w-6 p-0 text-muted-foreground hover:text-destructive",
																onClick: () => setAddPdcRows((rows) => rows.filter((_, i) => i !== idx)),
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3.5 w-3.5" })
															})
														})
													]
												}, row.id || idx))
											})]
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-purple-200 bg-purple-50/50 p-2.5 text-xs text-purple-900 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold block",
										children: "Automatic Double-Entry Posting:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] opacity-80",
										children: "DR 12900 PDC In Hand / CR 21400 Customer PDC Liability (Posted per cheque)."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs font-mono font-bold",
											children: ["Total: QR ", addPdcRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0).toLocaleString()]
										})
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "gap-2 border-t pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setAddPdcOpen(false),
								disabled: addPdcLoading,
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "bg-purple-600 hover:bg-purple-700 text-white",
								onClick: handleAddPdc,
								disabled: addPdcLoading || !selectedLeaseId || addPdcRows.length === 0 || collectionType !== "PDC" && !otherCollectionAmount,
								children: addPdcLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 mr-1 animate-spin" }), " Posting Collection…"] }) : collectionType === "PDC" ? "Save PDCs & Issue Receipt" : "Post Collection & Issue Receipt"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: cashModalOpen,
				onOpenChange: setCashModalOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[540px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2 text-base font-bold text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-5 w-5 text-purple-600" }), "Cash Settlement in Place of Cheque"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs text-muted-foreground",
							children: cashStep === 1 ? "Step 1 of 2: Verify tenant details and enter the confirmed cash collected." : "Step 2 of 2: Review double-entry accounting impact for cash receipt & cheque cancellation."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 border-b pb-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setCashStep(1),
								className: `flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${cashStep === 1 ? "bg-purple-600 text-white shadow-sm" : "bg-muted text-muted-foreground hover:text-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "h-4 w-4 rounded-full bg-background/20 text-[10px] flex items-center justify-center font-bold",
									children: "1"
								}), "Collection Details"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									if (cashAmount && parseFloat(cashAmount) > 0) setCashStep(2);
								},
								className: `flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${cashStep === 2 ? "bg-purple-600 text-white shadow-sm" : "bg-muted text-muted-foreground hover:text-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "h-4 w-4 rounded-full bg-background/20 text-[10px] flex items-center justify-center font-bold",
									children: "2"
								}), "GL & Sub-Ledger Impact"]
							})]
						}),
						cashPdc && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5 py-1 text-xs",
							children: [cashStep === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border bg-muted/40 p-3 space-y-1.5 text-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground font-medium",
													children: "Cheque Number:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono font-bold text-primary",
													children: cashPdc.cheque_number
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground font-medium",
													children: "Customer / Tenant:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: cashPdc.tenant_name || "Valued Tenant"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground font-medium",
													children: "Property & Unit:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													cashPdc.property_name || "—",
													" • ",
													cashPdc.unit_ref || "—"
												] })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground font-medium",
													children: "Original Cheque Amount:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono font-bold text-foreground",
													children: ["QR ", Number(cashPdc.amount || 0).toLocaleString()]
												})]
											}),
											cashPdc.paid_amount != null && cashPdc.paid_amount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between text-purple-700 dark:text-purple-300",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium",
													children: "Previously Paid in Cash:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono font-bold",
													children: ["QR ", Number(cashPdc.paid_amount).toLocaleString()]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between text-amber-700 dark:text-amber-300 font-semibold border-t pt-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Remaining Balance Due:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono font-bold",
													children: ["QR ", Math.max(0, Number(cashPdc.amount || 0) - Number(cashPdc.paid_amount)).toLocaleString()]
												})]
											})] })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
												className: "text-[11px] font-semibold",
												children: ["Cash Amount Paying Now (QAR) ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-destructive",
													children: "*"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												step: "0.01",
												className: "h-8 text-xs font-mono font-bold",
												placeholder: "Enter cash amount",
												value: cashAmount,
												onChange: (e) => setCashAmount(e.target.value)
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px] font-semibold",
												children: "Settlement Date"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "date",
												className: "h-8 text-xs",
												value: cashReceiptDate,
												onChange: (e) => setCashReceiptDate(e.target.value)
											})]
										})]
									}),
									(() => {
										const original = Number(cashPdc.amount || 0);
										const alreadyPaid = Number(cashPdc.paid_amount || 0);
										const remaining = Math.max(0, original - alreadyPaid);
										const actual = parseFloat(cashAmount) || 0;
										alreadyPaid + actual;
										if (actual === remaining && remaining > 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-md border border-emerald-200 bg-emerald-50/70 p-2 text-[11px] text-emerald-800 flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-emerald-600 flex-shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												"This payment of QR ",
												actual.toLocaleString(),
												" will ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "fully settle" }),
												" the cheque (Cheque will be cancelled & closed)."
											] })]
										});
										if (actual < remaining) {
											const stillRemaining = remaining - actual;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-md border border-amber-200 bg-amber-50/70 p-2 text-[11px] text-amber-800 flex items-start gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Partial Payment:" }),
													" Paying QR ",
													actual.toLocaleString(),
													". Remaining balance of ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["QR ", stillRemaining.toLocaleString()] }),
													" will stay open for subsequent cash payments."
												] })]
											});
										}
										if (actual > remaining && remaining > 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-md border border-blue-200 bg-blue-50/70 p-2 text-[11px] text-blue-800 flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-blue-600 flex-shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												"Excess payment: QR ",
												(actual - remaining).toLocaleString(),
												" above remaining balance."
											] })]
										});
										return null;
									})(),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px] font-semibold",
												children: "Cashier / Collected By"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												className: "h-8 text-xs",
												value: cashCollectorName,
												onChange: (e) => setCashCollectorName(e.target.value)
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px] font-semibold",
												children: "Remarks / Reason"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												className: "h-8 text-xs",
												placeholder: "e.g. Cash received at counter, cheque returned",
												value: cashNotes,
												onChange: (e) => setCashNotes(e.target.value)
											})]
										})]
									})
								]
							}), cashStep === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-3 max-h-[50vh] overflow-y-auto pr-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-purple-200 bg-purple-50/40 p-3.5 space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3.5 w-3.5 text-purple-600" }), "General Ledger / Sub-Ledger (COA) Accounts Impacted"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider",
													children: "Part 1: Cash Collection at Counter"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-start gap-2.5 bg-background/95 rounded-lg px-3.5 py-2.5 border border-border/80 shadow-sm",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "mt-0.5",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-4 w-4 text-emerald-600" })
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex-1 min-w-0",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center gap-2 flex-wrap",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800",
																		children: "Debit"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200",
																		children: "GL 12100"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-xs font-semibold text-foreground",
																		children: "Cash In Hand"
																	})
																]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[11px] text-muted-foreground mt-0.5",
																children: "Physical cash collected at counter from tenant"
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "text-xs font-mono font-bold tabular-nums text-foreground",
															children: ["QAR ", (parseFloat(cashAmount) || Number(cashPdc.amount || 0)).toLocaleString()]
														})
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-start gap-2.5 bg-background/95 rounded-lg px-3.5 py-2.5 border border-border/80 shadow-sm",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "mt-0.5",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownLeft, { className: "h-4 w-4 text-amber-600" })
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex-1 min-w-0",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center gap-2 flex-wrap",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800",
																		children: "Credit"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200",
																		children: "GL 12413"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-xs font-semibold text-foreground",
																		children: "Receivable- Unit Account"
																	})
																]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[11px] text-muted-foreground mt-0.5",
																children: "Tenant unit receivable offset & settled"
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "text-xs font-mono font-bold tabular-nums text-foreground",
															children: ["QAR ", (parseFloat(cashAmount) || Number(cashPdc.amount || 0)).toLocaleString()]
														})
													]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2 pt-1 border-t border-purple-200/60",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider",
													children: "Part 2: Original Cheque Cancellation & Liability Reversal"
												}),
												(() => {
													const original = Number(cashPdc?.amount || 0);
													const actual = parseFloat(cashAmount) || original;
													const diff = original - actual;
													if (diff > .01) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "rounded-md border border-amber-200 bg-amber-50/70 p-2 text-[11px] text-amber-800 flex items-start gap-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3.5 w-3.5 mt-0.5 text-amber-600 flex-shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Partial Payment:" }),
															" QR ",
															actual.toLocaleString(),
															" collected vs QR ",
															original.toLocaleString(),
															" cheque. The PDC liability reversal (21400 / 12900) posts for the ",
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
																"cash amount only (QR ",
																actual.toLocaleString(),
																")"
															] }),
															". Outstanding balance of QR ",
															diff.toLocaleString(),
															" remains in Tenant AR (12413)."
														] })]
													});
													return null;
												})(),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-start gap-2.5 bg-background/95 rounded-lg px-3.5 py-2.5 border border-border/80 shadow-sm",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "mt-0.5",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-4 w-4 text-emerald-600" })
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex-1 min-w-0",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center gap-2 flex-wrap",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800",
																		children: "Debit"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200",
																		children: "GL 21400"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-xs font-semibold text-foreground",
																		children: "Customer(PDC)- Unit Account"
																	})
																]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[11px] text-muted-foreground mt-0.5",
																children: "Customer PDC liability reversed upon physical cheque return"
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "text-xs font-mono font-bold tabular-nums text-foreground",
															children: ["QAR ", (parseFloat(cashAmount) || Number(cashPdc?.amount || 0)).toLocaleString()]
														})
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-start gap-2.5 bg-background/95 rounded-lg px-3.5 py-2.5 border border-border/80 shadow-sm",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "mt-0.5",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownLeft, { className: "h-4 w-4 text-amber-600" })
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex-1 min-w-0",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center gap-2 flex-wrap",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800",
																		children: "Credit"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200",
																		children: "GL 12900"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-xs font-semibold text-foreground",
																		children: "PDC in hand"
																	})
																]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[11px] text-muted-foreground mt-0.5",
																children: "Physical cheque removed from holding custody"
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "text-xs font-mono font-bold tabular-nums text-foreground",
															children: ["QAR ", (parseFloat(cashAmount) || Number(cashPdc?.amount || 0)).toLocaleString()]
														})
													]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2 pt-1 border-t border-purple-200/60",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider",
													children: "Part 3: Bank Account Deposit"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-start gap-2.5 bg-background/95 rounded-lg px-3.5 py-2.5 border border-border/80 shadow-sm",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "mt-0.5",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-4 w-4 text-emerald-600" })
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex-1 min-w-0",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center gap-2 flex-wrap",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800",
																		children: "Debit"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200",
																		children: "GL 12000"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-xs font-semibold text-foreground",
																		children: "Bank Account"
																	})
																]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[11px] text-muted-foreground mt-0.5",
																children: "Cash deposited into bank operating account"
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "text-xs font-mono font-bold tabular-nums text-foreground",
															children: ["QAR ", (parseFloat(cashAmount) || Number(cashPdc.amount || 0)).toLocaleString()]
														})
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-start gap-2.5 bg-background/95 rounded-lg px-3.5 py-2.5 border border-border/80 shadow-sm",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "mt-0.5",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownLeft, { className: "h-4 w-4 text-amber-600" })
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex-1 min-w-0",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center gap-2 flex-wrap",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800",
																		children: "Credit"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200",
																		children: "GL 12100"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-xs font-semibold text-foreground",
																		children: "Cash In Hand"
																	})
																]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[11px] text-muted-foreground mt-0.5",
																children: "Counter cash till cleared upon bank deposit"
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "text-xs font-mono font-bold tabular-nums text-foreground",
															children: ["QAR ", (parseFloat(cashAmount) || Number(cashPdc.amount || 0)).toLocaleString()]
														})
													]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] text-muted-foreground border-t border-border/50 pt-2",
											children: "All 4 double-entry lines will be posted simultaneously to General Ledger & Sub-Ledgers to maintain balance integrity."
										})
									]
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "gap-2 border-t pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setCashModalOpen(false),
								disabled: actionLoading,
								children: "Cancel"
							}), cashStep === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "bg-purple-600 hover:bg-purple-700 text-white",
								onClick: () => setCashStep(2),
								disabled: !cashAmount || parseFloat(cashAmount) <= 0,
								children: "Review Accounting Impact →"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setCashStep(1),
								disabled: actionLoading,
								children: "← Back to Details"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "bg-purple-600 hover:bg-purple-700 text-white",
								onClick: executeConfirmedCashReplacement,
								disabled: actionLoading || !cashAmount || parseFloat(cashAmount) <= 0,
								children: actionLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 mr-1 animate-spin" }), " Recording Cash & GL…"] }) : "Confirm Cash & Post GL"
							})] })]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: receiptHistoryOpen,
				onOpenChange: setReceiptHistoryOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					className: "max-w-3xl max-h-[90vh] overflow-y-auto p-6",
					children: receiptHistoryPdc && (() => {
						const chq = String(receiptHistoryPdc.cheque_number || receiptHistoryPdc.id);
						const originalAmt = Number(receiptHistoryPdc.amount) || 0;
						const paidAmt = Number(receiptHistoryPdc.paid_amount) || 0;
						const remainingDue = Math.max(0, originalAmt - paidAmt);
						const list = receiptHistory[chq] || [];
						const activeReceipt = list[receiptHistoryIndex] || list[list.length - 1] || null;
						const pctPaid = Math.min(100, Math.round(paidAmt / (originalAmt || 1) * 100));
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
									className: "border-b pb-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2 flex-wrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
											className: "text-lg font-bold flex items-center gap-2 text-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-5 w-5 text-purple-600" }),
												"Cash Receipts Statement – Cheque #",
												chq
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
											className: "text-xs text-muted-foreground mt-0.5",
											children: [
												receiptHistoryPdc.tenant_name || "Tenant",
												" • ",
												receiptHistoryPdc.property_name || "Property",
												" – Unit ",
												receiptHistoryPdc.unit_ref || "Unit"
											]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: receiptHistoryPdc.status === "Replaced" || remainingDue <= .01 ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold" : "bg-amber-100 text-amber-800 border-amber-300 font-semibold",
											children: receiptHistoryPdc.status === "Replaced" || remainingDue <= .01 ? "Fully Settled" : "Partial Cash"
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-muted/40 rounded-xl p-4 border border-border/70 space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "bg-background rounded-lg p-3 border border-border/60",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[11px] font-medium text-muted-foreground",
													children: "Original Cheque Amount"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-base font-bold font-mono text-foreground mt-0.5",
													children: ["QAR ", originalAmt.toLocaleString()]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "bg-background rounded-lg p-3 border border-purple-200 dark:border-purple-900/40",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[11px] font-medium text-purple-700 dark:text-purple-400",
													children: "Total Cash Received"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-base font-bold font-mono text-purple-700 dark:text-purple-300 mt-0.5",
													children: ["QAR ", paidAmt.toLocaleString()]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "bg-background rounded-lg p-3 border border-amber-200 dark:border-amber-900/40",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[11px] font-medium text-amber-700 dark:text-amber-400",
													children: "Remaining Balance Due"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-base font-bold font-mono text-amber-700 dark:text-amber-400 mt-0.5",
													children: ["QAR ", remainingDue.toLocaleString()]
												})]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between text-[11px] font-medium mb-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted-foreground",
											children: [
												"Settlement Progress (",
												list.length,
												" Receipt",
												list.length === 1 ? "" : "s",
												" Generated)"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-mono font-bold text-foreground",
											children: [pctPaid, "%"]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-full h-2 bg-secondary rounded-full overflow-hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-full bg-gradient-to-r from-purple-600 to-emerald-500 rounded-full transition-all duration-300",
											style: { width: `${pctPaid}%` }
										})
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs font-semibold text-foreground mb-2 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"Generated Payment Receipts (",
										list.length,
										")"
									] }), remainingDue > .01 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										className: "h-7 text-xs border-purple-400 text-purple-700 hover:bg-purple-50 gap-1",
										onClick: () => {
											setReceiptHistoryOpen(false);
											openCashModal(receiptHistoryPdc);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), " Record Next Cash Instalment"]
									})]
								}), list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-center py-6 border border-dashed rounded-lg text-muted-foreground text-xs",
									children: "No standalone cash receipts generated yet for this cheque."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2",
									children: list.map((r, idx) => {
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setReceiptHistoryIndex(idx),
											className: `p-3 rounded-lg border text-left transition-all relative ${idx === receiptHistoryIndex ? "bg-purple-50/70 dark:bg-purple-950/30 border-purple-500 shadow-sm ring-1 ring-purple-500" : "bg-card hover:bg-muted/40 border-border"}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between mb-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-[11px] font-bold text-purple-700 dark:text-purple-300",
														children: ["Instalment #", idx + 1]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] font-mono text-muted-foreground",
														children: r.date
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-sm font-mono font-bold text-foreground",
													children: ["QAR ", (r.totalCollected || r.monthlyRent || 0).toLocaleString()]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[10px] text-muted-foreground truncate mt-0.5",
													children: r.receiptNo
												})
											]
										}, r.receiptNo || idx);
									})
								})] }),
								activeReceipt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border rounded-xl p-4 bg-card shadow-sm space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between border-b pb-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-xs font-bold text-foreground",
												children: ["Receipt #", activeReceipt.receiptNo]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[11px] text-muted-foreground",
												children: [
													"Issued on ",
													activeReceipt.date,
													" • Cashier: ",
													activeReceipt.cashierName || "Finance Department"
												]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center gap-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													className: "h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1",
													onClick: () => {
														setReceiptData(activeReceipt);
														setReceiptOpen(true);
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3 w-3" }), " View & Print Full Receipt"]
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "bg-muted/30 p-2.5 rounded border",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground block",
														children: "Instalment Amount"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
														className: "font-mono text-foreground text-sm",
														children: ["QAR ", (activeReceipt.totalCollected || activeReceipt.monthlyRent || 0).toLocaleString()]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "bg-muted/30 p-2.5 rounded border",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground block",
														children: "Mode"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium text-foreground",
														children: activeReceipt.depositMode
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "bg-muted/30 p-2.5 rounded border",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground block",
														children: "Tenant"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium text-foreground truncate block",
														children: activeReceipt.tenantName
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "bg-muted/30 p-2.5 rounded border",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground block",
														children: "Property / Unit"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium text-foreground",
														children: activeReceipt.unitRef
													})]
												})
											]
										}),
										activeReceipt.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] bg-muted/40 p-2.5 rounded border text-muted-foreground italic",
											children: activeReceipt.notes
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
									className: "gap-2 border-t pt-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										onClick: () => setReceiptHistoryOpen(false),
										children: "Close"
									}), remainingDue > .01 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										className: "bg-purple-600 hover:bg-purple-700 text-white gap-1",
										onClick: () => {
											setReceiptHistoryOpen(false);
											openCashModal(receiptHistoryPdc);
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-3.5 w-3.5" }),
											" Collect Remaining QAR ",
											remainingDue.toLocaleString()
										]
									})]
								})
							]
						});
					})()
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlConfirmModal, {
				open: glConfirmOpen,
				config: glConfig,
				amount: Number(pendingActionPdc?.amount) || 0,
				loading: actionLoading,
				cancelReason,
				onCancelReasonChange: setCancelReason,
				onConfirm: executeConfirmedAction,
				onCancel: () => {
					setGlConfirmOpen(false);
					setPendingActionPdc(null);
					setPendingAction(null);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptModal, {
				open: receiptOpen,
				onOpenChange: setReceiptOpen,
				data: receiptData
			})
		]
	});
}
//#endregion
export { PdcManagement as t };
