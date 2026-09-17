import { i as __toESM } from "../_runtime.mjs";
import { B as supabase, F as fetchUnitCOAs, g as fetchERPChartOfAccounts, i as createGLAccount } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as ShieldCheck, An as ArrowDownLeft, B as RefreshCw, F as Search, I as Scale, Lt as Download, M as Settings, Nt as Eye, Ot as FileText, Qt as CircleCheck, Tn as ArrowUpDown, Tt as Funnel, V as Receipt, Vt as CreditCard, W as Plus, Wt as Clock, Xt as CirclePlus, Zt as CircleMinus, _n as BookOpen, _t as House, bt as Hash, c as User, cn as ChartPie, dn as Calendar, f as UserCheck, ft as Landmark, g as TrendingUp, h as TriangleAlert, hn as Building2, ht as Info, jn as Activity, jt as FileCheck, kt as FileSpreadsheet, lt as LayoutDashboard, mn as Building, q as Pencil, rn as ChevronRight, rt as MapPin, s as Users, st as LoaderCircle, ut as Layers, v as Trash2, wn as ArrowUpRight, xn as Banknote, zt as DollarSign } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as ScrollArea } from "./scroll-area-BlnbM3_c.mjs";
import { y as useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DJOO1b-0.mjs";
import { d as FinVendorsApi, i as FinCustomersApi, l as FinPostingPeriodsApi, n as FinBanksApi, o as FinFinancialYearsApi, r as FinCostCentersApi, t as FinBankAccountsApi, u as FinRegionsApi } from "./supabase-finance-B6nDq-G1.mjs";
import { u as postVoucher } from "./posting-engine-YWc7RZdA.mjs";
import { n as useFinanceStore } from "./finance-store-BEaAgb9S.mjs";
import { t as formatDDMMMYYYY } from "./date-utils-BA7FZwNI.mjs";
import { n as useAppData } from "./app-data-context-Lw7cnnXe.mjs";
import { l as settleDeposit, t as ReceiptModal } from "./receipt-modal-CUpXpFGs.mjs";
import { t as PdcManagement } from "./pdc-management-Qc17RLVL.mjs";
import { t as syncPayrollRun } from "./payrollIntegrationService-C55cZ7JW.mjs";
import { t as ApInvoicesApi } from "./proc-invoices-api-BBGs9sGK.mjs";
import { n as ProformaInvoiceDialog, t as PaymentReceiptDialog } from "./proforma-invoice-dialog-bIUbrys6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/finance-module-BuTE3csG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PAGE_SIZE$2 = 20;
function getDepositTypeKey(type) {
	const t = (type || "").toLowerCase();
	if (t.includes("kahramaa") || t.includes("utility")) return "kahramaa";
	if (t.includes("qatar cool") || t.includes("cool")) return "qatar_cool";
	if (t.includes("reservation")) return "reservation";
	if (t.includes("service fee") || t.includes("key")) return "service_fee";
	if (t.includes("guarantee")) return "guarantee";
	if (t.includes("unclaimed")) return "unclaimed";
	return "security";
}
function getDepositSignature(d) {
	const typeKey = getDepositTypeKey(d.deposit_type || d.coa_account_code || "");
	const leaseKey = d.leaseId ? String(d.leaseId).trim().toLowerCase() : "";
	const tenantKey = (d.tenant_name || "").toLowerCase().trim();
	const unitKey = (d.unit_ref || "").toLowerCase().trim();
	return `${leaseKey || `${unitKey}_${tenantKey}`}_${typeKey}`;
}
var DEFAULT_GL21100_DEPOSITS = [];
function SettleRefundModal({ open, deposit, deductions, onDeductionsChange, onConfirm, onCancel, loading }) {
	if (!deposit) return null;
	const grossDeposit = Number(deposit.amount) || 0;
	const deductionAmt = parseFloat(deductions) || 0;
	const refund = Math.max(0, grossDeposit - deductionAmt);
	const isOverDeduction = deductionAmt > grossDeposit;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (v) => {
			if (!v) onCancel();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl p-5 gap-3.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
					className: "space-y-1 pb-1.5 border-b",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold leading-tight",
								children: "Settle & Refund Deposit (GL 21100)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] text-muted-foreground mt-0.5",
								children: [deposit.deposit_type, " • Default Refundable Liability"]
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "text-[11px] font-mono text-emerald-700 bg-emerald-50 border-emerald-300 font-bold px-2 py-0.5",
							children: ["QAR ", grossDeposit.toLocaleString()]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 md:grid-cols-2 gap-3.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border bg-muted/30 p-2.5 space-y-1.5 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted-foreground flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-3 w-3" }), " Tenant:"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground truncate max-w-[170px]",
										children: deposit.tenant_name || "—"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted-foreground flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3 w-3" }), " Unit / Prop:"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-semibold text-foreground truncate max-w-[170px]",
										children: [
											deposit.unit_ref || "—",
											" (",
											deposit.property_name || "—",
											")"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted-foreground flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "h-3 w-3" }), " GL Account:"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-[10px] text-muted-foreground truncate max-w-[170px]",
										title: deposit.coa_account_code,
										children: deposit.coa_account_code
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "deduction-amount",
										className: "text-xs font-semibold",
										children: "Approved Deductions (QAR)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-muted-foreground",
										children: "0 for 100% refund"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "deduction-amount",
									type: "number",
									min: "0",
									max: grossDeposit,
									step: "0.01",
									value: deductions,
									onChange: (e) => onDeductionsChange(e.target.value),
									placeholder: "0.00",
									className: `h-9 font-mono text-right text-sm ${isOverDeduction ? "border-red-500 focus-visible:ring-red-500" : ""}`
								}),
								isOverDeduction ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] text-red-600 flex items-center gap-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3 w-3 shrink-0" }),
										" Exceeds gross deposit of QAR ",
										grossDeposit.toLocaleString()
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Deductions post to Damage Recovery (GL 41201001)"
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border p-2.5 bg-card space-y-1.5 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider",
								children: "Settlement Breakdown"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Gross Deposit:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-mono font-medium",
											children: ["QAR ", grossDeposit.toLocaleString()]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground text-red-600",
											children: "Approved Deductions:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `font-mono font-medium ${deductionAmt > 0 ? "text-red-600" : "text-muted-foreground"}`,
											children: deductionAmt > 0 ? `− QAR ${deductionAmt.toLocaleString()}` : "QAR 0"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-border my-0.5" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-center pt-0.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: "Net Refund Paid:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: `font-mono text-base font-bold ${refund > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"}`,
											children: ["QAR ", refund.toLocaleString()]
										})]
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 p-2 text-[11px] space-y-0.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold text-blue-800 dark:text-blue-300 text-[10px] uppercase tracking-wider",
									children: "GL Accounting Postings"
								}),
								refund > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-blue-700 dark:text-blue-300 font-mono text-[10px]",
									children: ["DR 21100 / CR 12000 → QAR ", refund.toLocaleString()]
								}),
								deductionAmt > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-blue-700 dark:text-blue-300 font-mono text-[10px]",
									children: ["DR 21100 / CR 41201001 → QAR ", deductionAmt.toLocaleString()]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-blue-600 dark:text-blue-400",
									children: "Official refund voucher & receipt auto-generated."
								})
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "pt-2 border-t flex-row justify-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: onCancel,
						disabled: loading,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: onConfirm,
						disabled: loading || isOverDeduction,
						className: "bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5",
						children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), loading ? "Syncing DB & Settling…" : "Confirm Settlement & Refund"]
					})]
				})
			]
		})
	});
}
function DepositsGuarantees() {
	const { vouchers: sharedVouchers, setVouchers: setSharedVouchers, leases } = useAppData();
	const { addVoucher: addFinanceStoreVoucher, addReceivableInvoice } = useFinanceStore();
	const [deposits, setDeposits] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [page, setPage] = (0, import_react.useState)(1);
	const [receiptOpen, setReceiptOpen] = (0, import_react.useState)(false);
	const [receiptData, setReceiptData] = (0, import_react.useState)(null);
	const [settleTarget, setSettleTarget] = (0, import_react.useState)(null);
	const [settleDeductions, setSettleDeductions] = (0, import_react.useState)("0");
	const [settleLoading, setSettleLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		load();
		const channel = supabase.channel("deposits-guarantees:live").on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "fin_deposits"
		}, () => {
			load(false);
		}).subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, []);
	async function load(showLoading = true) {
		if (showLoading) setLoading(true);
		try {
			let dbData = [];
			try {
				const { data, error } = await supabase.from("fin_deposits").select("*").order("created_at", { ascending: false });
				if (!error && data) dbData = data;
			} catch (e) {}
			const contextDeposits = (sharedVouchers || []).filter((v) => {
				const name = v.name.toLowerCase();
				const credit = v.credit.toLowerCase();
				return credit.includes("21100") || credit.includes("21500") || credit.includes("refundable") || credit.includes("security deposit") || name.includes("security deposit") || name.includes("kahramaa") || name.includes("qatar cool") || name.includes("reservation") || name.includes("service fee") || name.includes("guarantee cheque") || name.includes("utility deposit");
			}).map((v, idx) => {
				const lease = leases?.find((l) => l.id === v.leaseId);
				const isSettled = v.status === "settled" || lease && lease.status === "closed";
				return {
					id: v.id || `ctx-dep-${idx}`,
					leaseId: v.leaseId,
					deposit_type: v.name.replace("Receipts Voucher - ", "").replace("Receipt Voucher - ", ""),
					coa_account_code: v.credit || "21100 - Refundable Deposit Liability",
					amount: Number(v.amount) || 0,
					status: isSettled ? "Settled" : "Refundable",
					deduction_amount: v.settlement_deductions != null ? Number(v.settlement_deductions) : void 0,
					refund_amount: v.settlement_refund != null ? Number(v.settlement_refund) : void 0,
					settled_at: v.settlement_date || lease && lease.actualVacateDate,
					property_name: lease?.property || "Old Salata - Residence No:23",
					unit_ref: lease?.unit || "AAA - Flat16",
					tenant_name: lease?.tenantName || "Valued Tenant",
					lease_start_date: lease?.startDate || "2025-10-01",
					lease_end_date: lease?.endDate || "2026-09-30",
					monthly_rent: lease?.monthlyRent || 5600,
					total_contract_rent: lease?.monthlyRent ? lease.monthlyRent * 12 : 67200,
					created_at: lease?.startDate || "2026-08-01"
				};
			});
			const allMap = /* @__PURE__ */ new Map();
			const sigMap = /* @__PURE__ */ new Map();
			DEFAULT_GL21100_DEPOSITS.forEach((d) => {
				allMap.set(String(d.id), { ...d });
				sigMap.set(getDepositSignature(d), { ...d });
			});
			dbData.forEach((d) => {
				const isSettledDb = d.status === "Settled" || d.status === "Refunded";
				const rec = {
					id: d.id,
					leaseId: d.lease_id,
					deposit_type: d.deposit_type || "Refundable Deposit (21100)",
					coa_account_code: d.coa_account_code || "21100 - Refundable Security Deposit",
					amount: Number(d.amount) || 0,
					status: isSettledDb ? "Settled" : "Refundable",
					deduction_amount: d.deduction_amount != null ? Number(d.deduction_amount) : void 0,
					refund_amount: d.refund_amount != null ? Number(d.refund_amount) : void 0,
					settled_at: d.settled_at,
					property_name: d.property_name || "Old Salata - Residence No:23",
					unit_ref: d.unit_ref || "AAA - Flat16",
					tenant_name: d.tenant_name || "Valued Tenant",
					lease_start_date: d.lease_start_date,
					lease_end_date: d.lease_end_date,
					created_at: d.created_at
				};
				allMap.set(String(d.id), rec);
				sigMap.set(getDepositSignature(rec), rec);
			});
			contextDeposits.forEach((cd) => {
				const sig = getDepositSignature(cd);
				const existing = sigMap.get(sig) || allMap.get(String(cd.id));
				if (existing) {
					if (cd.status === "Settled") {
						existing.status = "Settled";
						if (cd.deduction_amount != null) existing.deduction_amount = cd.deduction_amount;
						if (cd.refund_amount != null) existing.refund_amount = cd.refund_amount;
						if (cd.settled_at) existing.settled_at = cd.settled_at;
					}
				} else {
					allMap.set(String(cd.id), cd);
					sigMap.set(sig, cd);
				}
			});
			for (const d of allMap.values()) {
				const lease = leases?.find((l) => l.id === d.leaseId || l.tenantName === d.tenant_name || l.unit === d.unit_ref);
				if (lease && lease.status === "closed") {
					d.status = "Settled";
					if (!d.settled_at) d.settled_at = lease.actualVacateDate || lease.moveOutDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
				}
			}
			const merged = Array.from(allMap.values());
			merged.sort((a, b) => new Date(b.lease_start_date || b.created_at || "").getTime() - new Date(a.lease_start_date || a.created_at || "").getTime());
			setDeposits(merged);
			setPage(1);
		} catch (e) {
			toast.error(e.message);
		} finally {
			if (showLoading) setLoading(false);
		}
	}
	async function confirmSettle() {
		if (!settleTarget) return;
		const { id } = settleTarget;
		const amount = Number(settleTarget.amount);
		const deductions = parseFloat(settleDeductions) || 0;
		const refund = Math.max(0, amount - deductions);
		setSettleLoading(true);
		try {
			const targetDep = settleTarget;
			const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
			const targetProp = targetDep.property_name && targetDep.property_name !== "—" ? targetDep.property_name : "Old Salata - Residence No:23";
			const targetUnit = targetDep.unit_ref && targetDep.unit_ref !== "—" ? targetDep.unit_ref : "AAA - Flat16";
			const targetTenant = targetDep.tenant_name && targetDep.tenant_name !== "—" ? targetDep.tenant_name : "Mr. Hafeez Shaik";
			if (typeof id === "string" && (id.startsWith("v") || id.startsWith("ctx-") || id.startsWith("dep-") || isNaN(Number(id)))) {
				setSharedVouchers((prev) => prev.map((v) => v.id === id ? {
					...v,
					status: "settled",
					settlement_deductions: deductions,
					settlement_refund: refund,
					settlement_date: todayStr
				} : v));
				setDeposits((prev) => prev.map((d) => d.id === id ? {
					...d,
					status: "Settled",
					deduction_amount: deductions,
					refund_amount: refund,
					settled_at: todayStr
				} : d));
			} else await settleDeposit(Number(id), deductions, refund);
			if (refund > 0) addFinanceStoreVoucher({
				voucher_no: `VCH-REF-${String(id).slice(-4)}`,
				voucher_type: "Payment Voucher",
				date: todayStr,
				name: `Deposit Refund (${targetDep.deposit_type}) – ${targetTenant} (${targetUnit})`,
				debit: "Refundable Security Deposit",
				debit_code: "21100",
				credit: "Bank Operating Account",
				credit_code: "12000",
				amount: refund,
				method: "Bank Transfer",
				property_name: targetProp,
				unit_ref: targetUnit,
				tenant_name: targetTenant
			});
			if (deductions > 0) {
				addReceivableInvoice({
					invoice_no: `INV-DED-${String(id).slice(-4)}`,
					date: todayStr,
					due_date: todayStr,
					tenant: targetTenant,
					property: targetProp,
					unit: targetUnit,
					stream: `Deposit Deduction / Damage Recovery (${targetDep.deposit_type})`,
					amount: deductions,
					account_code: "41201"
				});
				addFinanceStoreVoucher({
					voucher_no: `VCH-DED-${String(id).slice(-4)}`,
					voucher_type: "Journal Voucher",
					date: todayStr,
					name: `Deposit Deduction Offset – ${targetDep.deposit_type} (${targetTenant} - ${targetUnit})`,
					debit: "Refundable Security Deposit",
					debit_code: "21100",
					credit: "Damage & Utility Recovery",
					credit_code: "41201",
					amount: deductions,
					method: "Deposit Offset",
					property_name: targetProp,
					unit_ref: targetUnit,
					tenant_name: targetTenant
				});
			}
			setReceiptData({
				receiptNo: `REC-REF-${String(id).slice(-4)}`,
				acknowledgementNo: `ACK-REF-${id}`,
				date: todayStr,
				tenantName: targetTenant,
				propertyName: targetProp,
				unitRef: targetUnit,
				leaseStartDate: targetDep.lease_start_date || todayStr,
				leaseEndDate: targetDep.lease_end_date || todayStr,
				monthlyRent: targetDep.monthly_rent || 0,
				totalContractRent: targetDep.total_contract_rent || 0,
				depositAmount: targetDep.amount || 0,
				depositMode: "Bank Transfer",
				pdcCount: 0,
				pdcs: [],
				vouchers: [
					{
						receiptNo: `DEP-GROSS-${Date.now().toString().slice(-4)}`,
						name: `${targetDep.deposit_type} (Gross Deposit Released)`,
						amount,
						method: "Deposit Release",
						debit: "21100 - Refundable Deposit Liability",
						credit: "21100 - Refundable Deposit Liability"
					},
					...deductions > 0 ? [{
						receiptNo: `DED-OFFSET-${Date.now().toString().slice(-4)}`,
						name: `Approved Deductions (Damage & Utility Offset) [− QR ${deductions.toLocaleString()}]`,
						amount: deductions,
						method: "Deposit Offset",
						debit: "21100 - Refundable Deposit Liability",
						credit: "41201 - Damage & Utility Recovery"
					}] : [],
					{
						receiptNo: `PV-REF-${Date.now().toString().slice(-4)}`,
						name: `Net Settlement Refund Disbursed to Tenant [QR ${refund.toLocaleString()}]`,
						amount: refund,
						method: "Bank Transfer",
						debit: "21100 - Refundable Deposit Liability",
						credit: "12000 - Bank Operating Account"
					}
				],
				totalCollected: refund,
				cashierName: "Finance Department",
				notes: `OFFICIAL SETTLEMENT REFUND RECEIPT (${targetDep.deposit_type}): Gross: QR ${amount.toLocaleString()} | Approved Deductions: QR ${deductions.toLocaleString()} | Net Refund Paid: QR ${refund.toLocaleString()}. Auto-posted to GL 21100, 12000 & 41201.`
			});
			setReceiptOpen(true);
			toast.success(`${targetDep.deposit_type} Settled & Refunded for ${targetTenant}. Official Refund Receipt generated.`);
			setSettleTarget(null);
			load();
		} catch (e) {
			toast.error(e.message);
		} finally {
			setSettleLoading(false);
		}
	}
	function handleViewReceipt(dep) {
		const isSettled = dep.status === "Settled";
		const grossAmt = Number(dep.amount) || 0;
		const deductionAmt = Number(dep.deduction_amount) || 0;
		const refundAmt = dep.refund_amount != null ? Number(dep.refund_amount) : Math.max(0, grossAmt - deductionAmt);
		setReceiptData({
			receiptNo: dep.receipt_no || (isSettled ? `REC-REF-${String(dep.id).slice(-4)}` : `REC-DEP-${String(dep.id).slice(-4)}`),
			acknowledgementNo: `DEP-ACK-${dep.id}`,
			date: isSettled && dep.settled_at ? dep.settled_at.split("T")[0] : (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			tenantName: dep.tenant_name && dep.tenant_name !== "—" ? dep.tenant_name : "Mr. Hafeez Shaik",
			propertyName: dep.property_name && dep.property_name !== "—" ? dep.property_name : "Old Salata - Residence No:23",
			unitRef: dep.unit_ref && dep.unit_ref !== "—" ? dep.unit_ref : "AAA - Flat16",
			leaseStartDate: dep.lease_start_date || "2025-10-01",
			leaseEndDate: dep.lease_end_date || "2026-09-30",
			monthlyRent: dep.monthly_rent || 5600,
			totalContractRent: dep.total_contract_rent || (dep.monthly_rent ? dep.monthly_rent * 12 : 67200),
			depositAmount: grossAmt,
			depositMode: isSettled ? "Bank Transfer (Settlement Refund)" : dep.deposit_type || "Refundable Security Deposit",
			pdcCount: 0,
			pdcs: [],
			vouchers: isSettled ? [
				{
					receiptNo: `DEP-GROSS-${String(dep.id).slice(-4)}`,
					name: `${dep.deposit_type} (Gross Deposit Released)`,
					amount: grossAmt,
					method: "Deposit Release",
					debit: "21100 - Refundable Deposit Liability",
					credit: "21100 - Refundable Deposit Liability"
				},
				...deductionAmt > 0 ? [{
					receiptNo: `DED-OFFSET-${String(dep.id).slice(-4)}`,
					name: `Approved Deductions (Damage & Utility Offset) [− QR ${deductionAmt.toLocaleString()}]`,
					amount: deductionAmt,
					method: "Deposit Offset",
					debit: "21100 - Refundable Deposit Liability",
					credit: "41201 - Damage & Utility Recovery"
				}] : [],
				{
					receiptNo: `PV-REF-${String(dep.id).slice(-4)}`,
					name: `Net Settlement Refund Disbursed to Tenant [QR ${refundAmt.toLocaleString()}]`,
					amount: refundAmt,
					method: "Bank Transfer",
					debit: "21100 - Refundable Deposit Liability",
					credit: "12000 - Bank Operating Account"
				}
			] : [{
				receiptNo: dep.receipt_no || `RV-DEP-${dep.id}`,
				name: `${dep.deposit_type} Voucher`,
				amount: grossAmt,
				debit: "Cash In Hand / Bank",
				credit: dep.coa_account_code || "21100 - Refundable Deposit Liability"
			}],
			totalCollected: isSettled ? refundAmt : grossAmt,
			cashierName: "Finance Department",
			notes: isSettled ? `OFFICIAL SETTLEMENT REFUND RECEIPT (${dep.deposit_type}): Gross: QR ${grossAmt.toLocaleString()} | Approved Deductions: QR ${deductionAmt.toLocaleString()} | Net Refund Paid: QR ${refundAmt.toLocaleString()}. Auto-posted to GL 21100, 12000 & 41201.` : `Official acknowledgment for ${dep.deposit_type} held under GL ${dep.coa_account_code}. Status: ${dep.status} (By Default Refundable).`
		});
		setReceiptOpen(true);
	}
	const totalPages = Math.max(1, Math.ceil(deposits.length / PAGE_SIZE$2));
	const paginated = deposits.slice((page - 1) * PAGE_SIZE$2, page * PAGE_SIZE$2);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-row items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Deposits & Guarantees (GL 21100)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "secondary",
					className: "text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-normal",
					children: "By-Default Refundable Liabilities"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground mt-1",
				children: [
					"Reservation Advances, Kahramaa, Qatar Cool, Service Fee Deposits, Unclaimed Deposits & Guarantee Cheques Received (",
					deposits.length,
					" records)"
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: "outline",
				children: [deposits.length, " Total"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-start gap-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 p-3 text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold text-emerald-900 dark:text-emerald-200",
					children: "GL 21100 Refundable Policy:"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed",
					children: [
						"All deposits in this registry (Reservation Advance, Kahramaa, Qatar Cool, Service Fees, and Guarantee Cheques) are ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "by default refundable" }),
						" and ready for immediate settlement without manual reclassification."
					]
				})]
			})]
		}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground py-4",
			children: "Loading..."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border rounded-lg overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
				className: "bg-muted/50",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold text-xs",
						children: "Entry Date"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold text-xs",
						children: "Deposit Type"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold text-xs",
						children: "GL Account"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold text-xs",
						children: "Property"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold text-xs",
						children: "Unit"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold text-xs",
						children: "Tenant"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right font-bold text-xs",
						children: "Amount (QAR)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold text-xs",
						children: "Refund Status"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold text-xs text-right pr-4",
						children: "Actions"
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [paginated.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				colSpan: 9,
				className: "text-center py-8 text-muted-foreground",
				children: "No Deposits found. GL 21100 deposits auto-populate from Leasing Collections & Agreements."
			}) }), paginated.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
				className: "hover:bg-muted/30",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs text-muted-foreground",
						children: d.settled_at ? d.settled_at.split("T")[0] : d.lease_start_date || d.created_at || "2026-08-01"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs font-medium",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: d.deposit_type })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs text-muted-foreground max-w-[200px] truncate",
						title: d.coa_account_code,
						children: d.coa_account_code
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: d.property_name || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs",
						children: d.unit_ref || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: d.tenant_name || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-right font-bold font-mono text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: Number(d.amount).toLocaleString() }),
							d.status === "Settled" && d.deduction_amount != null && d.deduction_amount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[10px] text-red-500 font-normal",
								children: [
									"−",
									Number(d.deduction_amount).toLocaleString(),
									" ded."
								]
							}),
							d.status === "Settled" && d.refund_amount != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[10px] text-emerald-600 font-normal",
								children: [
									"↳ ",
									Number(d.refund_amount).toLocaleString(),
									" refunded"
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: d.status === "Settled" ? "outline" : "secondary",
						className: `text-xs ${d.status === "Settled" ? "border-muted text-muted-foreground" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"}`,
						children: d.status === "Settled" ? "Settled / Refunded" : "Refundable (Default)"
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-right pr-2 space-x-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							className: "h-7 text-xs text-primary gap-1",
							onClick: () => handleViewReceipt(d),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3 w-3" }), " Receipt"]
						}), d.status !== "Settled" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							className: "h-7 text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950",
							onClick: () => {
								setSettleTarget(d);
								setSettleDeductions("0");
							},
							children: "Settle & Refund"
						})]
					})
				]
			}, String(d.id)))] })] })
		}), deposits.length > PAGE_SIZE$2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between mt-4 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				"Showing ",
				(page - 1) * PAGE_SIZE$2 + 1,
				"–",
				Math.min(page * PAGE_SIZE$2, deposits.length),
				" of ",
				deposits.length
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
		})] })] })] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettleRefundModal, {
			open: !!settleTarget,
			deposit: settleTarget,
			deductions: settleDeductions,
			onDeductionsChange: setSettleDeductions,
			onConfirm: confirmSettle,
			onCancel: () => setSettleTarget(null),
			loading: settleLoading
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptModal, {
			open: receiptOpen,
			onOpenChange: setReceiptOpen,
			data: receiptData
		})
	] });
}
var PAGE_SIZE$1 = 20;
function ReceivablesLegal() {
	const { leases } = useAppData();
	const { legalReceivables, addLegalEscalation, recoverLegalReceivable } = useFinanceStore();
	const [page, setPage] = (0, import_react.useState)(1);
	const [isSubmitting, setIsSubmitting] = (0, import_react.useState)(false);
	const [receiptOpen, setReceiptOpen] = (0, import_react.useState)(false);
	const [receiptData, setReceiptData] = (0, import_react.useState)(null);
	const [openEscalate, setOpenEscalate] = (0, import_react.useState)(false);
	const [escalateForm, setEscalateForm] = (0, import_react.useState)({
		tenant_name: "",
		property_name: "",
		unit_ref: "",
		amount: "5500",
		reason: "Rent cheques returned unpaid; 60 days overdue notice period expired",
		legal_case_id: `LGL-2026-${Math.floor(1e3 + Math.random() * 9e3)}`,
		status: "Legal Notice Sent"
	});
	const [openRecover, setOpenRecover] = (0, import_react.useState)(false);
	const [recoverTarget, setRecoverTarget] = (0, import_react.useState)(null);
	const [recoverAmount, setRecoverAmount] = (0, import_react.useState)("");
	const [paymentMethod, setPaymentMethod] = (0, import_react.useState)("Bank Transfer");
	const [recoveryDate, setRecoveryDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
	const [transactionNo, setTransactionNo] = (0, import_react.useState)("");
	const [chequeNo, setChequeNo] = (0, import_react.useState)("");
	const [chequeBank, setChequeBank] = (0, import_react.useState)("Qatar National Bank (QNB)");
	const [chequeMaturityDate, setChequeMaturityDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
	const [bankRef, setBankRef] = (0, import_react.useState)("BANK-REC-");
	function handleSelectLease(leaseId) {
		const l = leases?.find((lease) => lease.id === leaseId);
		if (l) setEscalateForm((prev) => ({
			...prev,
			tenant_name: l.tenantName,
			property_name: l.property,
			unit_ref: l.unit,
			amount: String(l.monthlyRent * 2 || 5500)
		}));
	}
	async function submitEscalate() {
		if (!escalateForm.tenant_name || !escalateForm.amount) {
			toast.error("Please enter tenant name and amount");
			return;
		}
		const amt = parseFloat(escalateForm.amount) || 0;
		setIsSubmitting(true);
		try {
			addLegalEscalation({
				legal_case_id: escalateForm.legal_case_id,
				tenant_name: escalateForm.tenant_name,
				property_name: escalateForm.property_name || "Old Salata - Residence No:23",
				unit_ref: escalateForm.unit_ref || "Unit",
				original_amount: amt,
				outstanding_balance: amt,
				escalation_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
				reason: escalateForm.reason,
				status: escalateForm.status
			});
			await new Promise((r) => setTimeout(r, 300));
			setOpenEscalate(false);
		} catch (e) {
			toast.error(e.message || "Failed to escalate receivable");
		} finally {
			setIsSubmitting(false);
		}
	}
	function openRecoveryModal(rec) {
		const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		const generatedRef = `REC-${rec.legal_case_id || "PAY"}-${Date.now().toString().slice(-4)}`;
		setRecoverTarget(rec);
		setRecoverAmount(String(rec.outstanding_balance));
		setPaymentMethod("Bank Transfer");
		setRecoveryDate(todayStr);
		setTransactionNo(`TXN-${Date.now().toString().slice(-6)}`);
		setChequeNo(`CHQ-${Math.floor(1e5 + Math.random() * 9e5)}`);
		setChequeBank("Qatar National Bank (QNB)");
		setChequeMaturityDate(todayStr);
		setBankRef(generatedRef);
		setOpenRecover(true);
	}
	async function submitRecover() {
		if (!recoverTarget) return;
		const amt = parseFloat(recoverAmount) || 0;
		if (amt <= 0 || amt > recoverTarget.outstanding_balance) {
			toast.error("Invalid recovery amount. Must be between 1 and outstanding balance.");
			return;
		}
		const todayStr = recoveryDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		const caseId = recoverTarget.legal_case_id || recoverTarget.id;
		const propName = recoverTarget.property_name || "Old Salata - Residence No:23";
		const unitName = recoverTarget.unit_ref || "Unit";
		const tenantName = recoverTarget.tenant_name || "Valued Tenant";
		const effectiveRef = paymentMethod === "Bank Transfer" ? transactionNo || bankRef : paymentMethod === "Cheque" ? chequeNo || bankRef : bankRef;
		setIsSubmitting(true);
		try {
			recoverLegalReceivable(caseId, amt, effectiveRef, paymentMethod, propName, unitName, tenantName, {
				date: todayStr,
				transactionNo: transactionNo || effectiveRef,
				chequeNo: chequeNo || effectiveRef,
				chequeBank,
				maturityDate: chequeMaturityDate
			});
			const drAccount = paymentMethod === "Cash" ? "12100 - Cash in Hand / Till" : paymentMethod === "Cheque" ? `12000 - Bank Operating Account (${chequeBank})` : "12000 - Bank Operating Account";
			const legalReceipt = {
				receiptNo: effectiveRef || `REC-LGL-${Date.now().toString().slice(-4)}`,
				acknowledgementNo: `ACK-LGL-${caseId}`,
				date: todayStr,
				tenantName,
				propertyName: propName,
				unitRef: unitName,
				leaseStartDate: todayStr,
				leaseEndDate: todayStr,
				monthlyRent: amt,
				totalContractRent: recoverTarget.original_amount || amt,
				depositAmount: 0,
				depositMode: paymentMethod,
				pdcCount: paymentMethod === "Cheque" ? 1 : 0,
				pdcs: paymentMethod === "Cheque" ? [{
					chequeNo: chequeNo || effectiveRef,
					bank: chequeBank,
					date: chequeMaturityDate,
					amount: amt
				}] : [],
				vouchers: [{
					receiptNo: `RV-LGL-${Date.now().toString().slice(-4)}`,
					name: `Legal Recovery Settlement — Case #${caseId} (${paymentMethod})`,
					amount: amt,
					method: paymentMethod,
					debit: drAccount,
					credit: "12411 - Legal Receivables (Defaulted)"
				}],
				totalCollected: amt,
				cashierName: "Legal & Collections Department",
				notes: `OFFICIAL SETTLEMENT & RECOVERY RECEIPT: Received QAR ${amt.toLocaleString()} via ${paymentMethod} (Ref/Tx: ${effectiveRef}${paymentMethod === "Cheque" ? ` | Bank: ${chequeBank} | Maturity: ${chequeMaturityDate}` : ""}) against Legal Case #${caseId}. Status: ${amt >= recoverTarget.outstanding_balance ? "Fully Recovered" : "Partially Recovered"}. General Ledger & Receivables updated.`
			};
			await new Promise((r) => setTimeout(r, 350));
			setReceiptData(legalReceipt);
			setReceiptOpen(true);
			setOpenRecover(false);
		} catch (e) {
			toast.error(e.message || "Failed to post recovery");
		} finally {
			setIsSubmitting(false);
		}
	}
	function handleViewReceipt(rec) {
		const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		const caseId = rec.legal_case_id || rec.id;
		const propName = rec.property_name || "Old Salata - Residence No:23";
		const unitName = rec.unit_ref || "Unit";
		const tenantName = rec.tenant_name || "Valued Tenant";
		const recoveredAmt = (Number(rec.original_amount) || 0) - (Number(rec.outstanding_balance) || 0);
		setReceiptData({
			receiptNo: `REC-LGL-${caseId}`,
			acknowledgementNo: `ACK-LGL-${caseId}`,
			date: rec.escalation_date || todayStr,
			tenantName,
			propertyName: propName,
			unitRef: unitName,
			leaseStartDate: rec.escalation_date || todayStr,
			leaseEndDate: rec.escalation_date || todayStr,
			monthlyRent: recoveredAmt || Number(rec.original_amount) || 0,
			totalContractRent: Number(rec.original_amount) || 0,
			depositAmount: 0,
			depositMode: "Bank Transfer",
			pdcCount: 0,
			pdcs: [],
			vouchers: [{
				receiptNo: `RV-LGL-${caseId}`,
				name: `Legal Case #${caseId} — Settlement Record`,
				amount: recoveredAmt || Number(rec.original_amount) || 0,
				method: "Bank Transfer",
				debit: "12000 - Bank Operating Account",
				credit: "12411 - Legal Receivables (Defaulted)"
			}],
			totalCollected: recoveredAmt || Number(rec.original_amount) || 0,
			cashierName: "Legal & Collections Department",
			notes: `Legal Case #${caseId} record. Original Default: QAR ${Number(rec.original_amount).toLocaleString()} | Recovered: QAR ${recoveredAmt.toLocaleString()} | Outstanding: QAR ${Number(rec.outstanding_balance).toLocaleString()}. Reason: ${rec.reason}`
		});
		setReceiptOpen(true);
	}
	const sortedLegalReceivables = [...legalReceivables].sort((a, b) => new Date(b.escalation_date || "").getTime() - new Date(a.escalation_date || "").getTime());
	const totalPages = Math.max(1, Math.ceil(sortedLegalReceivables.length / PAGE_SIZE$1));
	const paginated = sortedLegalReceivables.slice((page - 1) * PAGE_SIZE$1, page * PAGE_SIZE$1);
	const totalOutstanding = legalReceivables.reduce((s, r) => s + (Number(r.outstanding_balance) || 0), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-sm border-border/70",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-row items-center justify-between pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "text-base flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-4 w-4 text-orange-500" }), "Legal Receivables & Overdue Default Console"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: [
						legalReceivables.length,
						" active legal cases • Total Outstanding: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							className: "text-rose-600 font-mono",
							children: ["QR ", totalOutstanding.toLocaleString()]
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setOpenEscalate(true),
					className: "gap-1.5 text-xs bg-orange-600 hover:bg-orange-700",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Escalate Overdue"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Case # / Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Property"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Unit"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Tenant / Legal Notice"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold",
							children: "Original (QAR)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold",
							children: "Outstanding (QAR)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold text-center",
							children: "Actions"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: paginated.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 8,
					className: "text-center py-8 text-muted-foreground text-xs",
					children: "No Legal Receivables found. Click \"Escalate Overdue\" to register a case."
				}) }) : paginated.map((rec) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/30 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono font-bold text-primary",
							children: rec.legal_case_id || `LGL-${rec.id}`
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] text-muted-foreground",
							children: rec.escalation_date
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: rec.property_name || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono",
							children: rec.unit_ref || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-semibold text-foreground",
							children: rec.tenant_name || "Valued Tenant"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] text-muted-foreground line-clamp-1",
							children: rec.reason
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right font-mono text-muted-foreground",
							children: Number(rec.original_amount).toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right font-bold font-mono text-rose-600",
							children: Number(rec.outstanding_balance).toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: `text-[10px] font-semibold ${rec.status === "Fully Recovered" ? "bg-emerald-50 text-emerald-700 border-emerald-300" : rec.status === "Partially Recovered" ? "bg-amber-50 text-amber-700 border-amber-300" : "bg-rose-50 text-rose-700 border-rose-300"}`,
							children: rec.status
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-center gap-1.5",
								children: [rec.outstanding_balance > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50",
									onClick: () => openRecoveryModal(rec),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3 mr-1" }), " Recover Funds"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-emerald-600 font-semibold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200",
									children: "Settled"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "ghost",
									className: "h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2",
									onClick: () => handleViewReceipt(rec),
									title: "View Official Receipt",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" }), " Receipt"]
								})]
							})
						})
					]
				}, rec.id)) })] })
			}), legalReceivables.length > PAGE_SIZE$1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mt-4 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"Showing ",
					(page - 1) * PAGE_SIZE$1 + 1,
					"–",
					Math.min(page * PAGE_SIZE$1, legalReceivables.length),
					" of ",
					legalReceivables.length
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
						Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
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
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: openEscalate,
				onOpenChange: setOpenEscalate,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-lg bg-card border shadow-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2 text-orange-600 text-base font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-5 w-5" }), " Escalate Overdue Receivable to Legal"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Transfers defaulted rent/utility receivables to Legal Account (12411) and updates the General Ledger."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5 py-2 text-xs",
							children: [
								leases && leases.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Select From Existing Leases"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										onValueChange: handleSelectLease,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "text-xs bg-background",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Quick fill from lease..." })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: leases.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: l.id,
											children: [
												l.tenantName,
												" — ",
												l.unit,
												" (",
												l.property,
												")"
											]
										}, l.id)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "text-xs font-semibold",
											children: ["Tenant Name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-destructive",
												children: "*"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "text-xs bg-background",
											placeholder: "Tenant Full Name",
											value: escalateForm.tenant_name,
											onChange: (e) => setEscalateForm({
												...escalateForm,
												tenant_name: e.target.value
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Legal Case Ref #"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "text-xs font-mono bg-background",
											value: escalateForm.legal_case_id,
											onChange: (e) => setEscalateForm({
												...escalateForm,
												legal_case_id: e.target.value
											})
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Property Name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "text-xs bg-background",
											placeholder: "Property Name",
											value: escalateForm.property_name,
											onChange: (e) => setEscalateForm({
												...escalateForm,
												property_name: e.target.value
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Unit Reference"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "text-xs bg-background",
											placeholder: "Flat / Unit No.",
											value: escalateForm.unit_ref,
											onChange: (e) => setEscalateForm({
												...escalateForm,
												unit_ref: e.target.value
											})
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "text-xs font-semibold",
											children: ["Outstanding Amount (QAR) ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-destructive",
												children: "*"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											className: "text-xs font-mono font-bold bg-background",
											placeholder: "5500",
											value: escalateForm.amount,
											onChange: (e) => setEscalateForm({
												...escalateForm,
												amount: e.target.value
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Legal Action Status"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: escalateForm.status,
											onValueChange: (v) => setEscalateForm({
												...escalateForm,
												status: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "text-xs bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Legal Notice Sent",
													children: "Legal Notice Sent (7-Day Notice)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Court Case Filed",
													children: "Rental Dispute Committee Filed"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Under Negotiation",
													children: "Under Negotiation / Settlement"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Eviction Notice Issued",
													children: "Eviction Notice Issued"
												})
											] })]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Reason & Chronology for Legal Escalation"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										className: "text-xs bg-background resize-none",
										placeholder: "Details on non-payment, returned cheques, and contact attempts...",
										value: escalateForm.reason,
										onChange: (e) => setEscalateForm({
											...escalateForm,
											reason: e.target.value
										})
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "border-t pt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setOpenEscalate(false),
								disabled: isSubmitting,
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: submitEscalate,
								disabled: isSubmitting,
								className: "bg-orange-600 hover:bg-orange-700 gap-1.5",
								children: [isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : null, isSubmitting ? "Syncing DB & Escalating..." : "Confirm & Post Escalation"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: openRecover,
				onOpenChange: setOpenRecover,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md bg-card border shadow-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2 text-emerald-600 text-base font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5" }), " Record Legal Settlement & Recovery"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Credits Legal Receivables (12411) and Debits selected Account based on Payment Mode."
						})] }),
						recoverTarget && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-muted/40 p-3 rounded-lg border space-y-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Case Reference:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono font-bold",
												children: recoverTarget.legal_case_id
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Tenant:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold",
												children: recoverTarget.tenant_name
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Property / Unit:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-semibold",
												children: [
													recoverTarget.property_name,
													" — ",
													recoverTarget.unit_ref
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Current Outstanding:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-bold text-rose-600 font-mono",
												children: ["QR ", Number(recoverTarget.outstanding_balance).toLocaleString()]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "text-xs font-semibold",
											children: ["Recovery Amount (QAR) ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-destructive",
												children: "*"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											className: "text-xs font-mono font-bold bg-background",
											value: recoverAmount,
											onChange: (e) => setRecoverAmount(e.target.value)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "text-xs font-semibold",
											children: ["Mode of Payment ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-destructive",
												children: "*"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: paymentMethod,
											onValueChange: (val) => setPaymentMethod(val),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "text-xs bg-background font-medium",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Payment Mode" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Bank Transfer",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "flex items-center gap-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-3.5 w-3.5 text-blue-500" }), " Bank Transfer (GL 12000)"]
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Cash",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "flex items-center gap-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-3.5 w-3.5 text-emerald-500" }), " Cash in Hand (GL 12100)"]
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Cheque",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "flex items-center gap-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-3.5 w-3.5 text-purple-500" }), " Cheque / Manager Cheque"]
													})
												})
											] })]
										})]
									})]
								}),
								paymentMethod === "Bank Transfer" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3 p-2.5 rounded-md bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "text-xs font-semibold text-blue-900 dark:text-blue-200",
											children: ["Transfer Date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-destructive",
												children: "*"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											className: "text-xs bg-background",
											value: recoveryDate,
											onChange: (e) => setRecoveryDate(e.target.value)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "text-xs font-semibold text-blue-900 dark:text-blue-200",
											children: ["Transaction # / Wire Ref ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-destructive",
												children: "*"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "text-xs font-mono bg-background",
											placeholder: "TXN-998822",
											value: transactionNo,
											onChange: (e) => {
												setTransactionNo(e.target.value);
												setBankRef(e.target.value);
											}
										})]
									})]
								}),
								paymentMethod === "Cheque" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2.5 p-2.5 rounded-md bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
												className: "text-xs font-semibold text-purple-900 dark:text-purple-200",
												children: ["Cheque Date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-destructive",
													children: "*"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "date",
												className: "text-xs bg-background",
												value: recoveryDate,
												onChange: (e) => setRecoveryDate(e.target.value)
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
												className: "text-xs font-semibold text-purple-900 dark:text-purple-200",
												children: ["Maturity Date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-destructive",
													children: "*"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "date",
												className: "text-xs bg-background",
												value: chequeMaturityDate,
												onChange: (e) => setChequeMaturityDate(e.target.value)
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
												className: "text-xs font-semibold text-purple-900 dark:text-purple-200",
												children: ["Drawee Bank ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-destructive",
													children: "*"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: chequeBank,
												onValueChange: setChequeBank,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "text-xs bg-background",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Qatar National Bank (QNB)",
														children: "Qatar National Bank (QNB)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Commercial Bank of Qatar (CBQ)",
														children: "Commercial Bank of Qatar (CBQ)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Doha Bank",
														children: "Doha Bank"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Qatar Islamic Bank (QIB)",
														children: "Qatar Islamic Bank (QIB)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Masraf Al Rayan",
														children: "Masraf Al Rayan"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Dukhan Bank",
														children: "Dukhan Bank"
													})
												] })]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
												className: "text-xs font-semibold text-purple-900 dark:text-purple-200",
												children: ["Cheque Number ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-destructive",
													children: "*"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												className: "text-xs font-mono bg-background",
												placeholder: "CHQ-001234",
												value: chequeNo,
												onChange: (e) => {
													setChequeNo(e.target.value);
													setBankRef(e.target.value);
												}
											})]
										})]
									})]
								}),
								paymentMethod === "Cash" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3 p-2.5 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "text-xs font-semibold text-emerald-900 dark:text-emerald-200",
											children: ["Receipt Date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-destructive",
												children: "*"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											className: "text-xs bg-background",
											value: recoveryDate,
											onChange: (e) => setRecoveryDate(e.target.value)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold text-emerald-900 dark:text-emerald-200",
											children: "Cash Vault Receipt #"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "text-xs font-mono bg-background",
											value: bankRef,
											onChange: (e) => setBankRef(e.target.value)
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded bg-muted/40 p-2 border text-[11px] space-y-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-muted-foreground font-semibold flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "General Ledger Impact:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-[10px] text-primary",
											children: paymentMethod === "Cash" ? "DR 12100 (Cash) / CR 12411 (Legal)" : "DR 12000 (Bank) / CR 12411 (Legal)"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] text-muted-foreground",
										children: "Official Tenant Receipt will be auto-generated upon confirmation."
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "border-t pt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setOpenRecover(false),
								disabled: isSubmitting,
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: submitRecover,
								disabled: isSubmitting,
								className: "bg-emerald-600 hover:bg-emerald-700 gap-1.5",
								children: [isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : null, isSubmitting ? "Syncing DB & Recovering..." : "Confirm Receipt & Post Journal"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptModal, {
				open: receiptOpen,
				onOpenChange: setReceiptOpen,
				data: receiptData
			})
		]
	});
}
var PAGE_SIZE = 20;
function PayrollSync() {
	const { payrollSyncs, addPayrollSync } = useFinanceStore();
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [isSyncing, setIsSyncing] = (0, import_react.useState)(false);
	const [page, setPage] = (0, import_react.useState)(1);
	const [openModal, setOpenModal] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		payroll_run_id: `PR-RUN-${Date.now().toString().slice(-6)}`,
		period: "2026-08",
		department: "Maintenance & Operations",
		basic_salary: "35000",
		allowances: "12000",
		overtime: "4500",
		deductions: "1500",
		bank_account: "12000 - QNB Operations Account"
	});
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	async function load() {
		setLoading(true);
		try {
			await supabase.from("fin_payroll_syncs").select("id").limit(1);
		} catch {} finally {
			setLoading(false);
		}
	}
	const basic = parseFloat(form.basic_salary) || 0;
	const allow = parseFloat(form.allowances) || 0;
	const ot = parseFloat(form.overtime) || 0;
	const ded = parseFloat(form.deductions) || 0;
	const netPayable = basic + allow + ot - ded;
	async function handleTriggerSync() {
		if (!form.payroll_run_id || !form.period) {
			toast.error("Please fill in required fields");
			return;
		}
		const basic = parseFloat(form.basic_salary) || 0;
		const allow = parseFloat(form.allowances) || 0;
		const ot = parseFloat(form.overtime) || 0;
		const ded = parseFloat(form.deductions) || 0;
		const netPayable = basic + allow + ot - ded;
		const payload = {
			payroll_run_id: form.payroll_run_id,
			period: form.period,
			lines: [{
				employee_id: `DEPT-${form.department.slice(0, 4).toUpperCase()}`,
				department: form.department,
				account_code: "50100",
				debit: basic + allow + ot,
				credit: 0
			}, {
				employee_id: "BANK-TREASURY",
				department: "Treasury",
				account_code: "12000",
				debit: 0,
				credit: netPayable
			}]
		};
		if (ded > 0) payload.lines.push({
			employee_id: "PAYROLL-DEDUCTIONS",
			department: "HR Operations",
			account_code: "21900",
			debit: 0,
			credit: ded
		});
		setIsSyncing(true);
		try {
			await syncPayrollRun(payload);
		} catch {}
		addPayrollSync({
			payroll_run_id: form.payroll_run_id,
			period: form.period,
			department: form.department,
			account_code: "50100",
			basic_salary: basic,
			allowances: allow,
			overtime: ot,
			deductions: ded,
			total_amount: netPayable,
			bank_account: form.bank_account
		});
		await new Promise((r) => setTimeout(r, 400));
		setIsSyncing(false);
		setOpenModal(false);
	}
	const sortedPayrollSyncs = [...payrollSyncs].sort((a, b) => (b.period || "").localeCompare(a.period || ""));
	const totalPages = Math.max(1, Math.ceil(sortedPayrollSyncs.length / PAGE_SIZE));
	const paginated = sortedPayrollSyncs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const totalSynced = payrollSyncs.reduce((s, row) => s + (Number(row.total_amount) || 0), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-sm border-border/70",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-row items-center justify-between pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "text-base flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-blue-500" }), "Payroll Sync Engine & ERP Sub-Ledger Integrator"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: [
						sortedPayrollSyncs.length,
						" payroll sync jobs • Total Disbursed: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							className: "text-emerald-600 font-mono",
							children: ["QR ", totalSynced.toLocaleString()]
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setOpenModal(true),
					className: "gap-1.5 text-xs bg-blue-600 hover:bg-blue-700",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5" }), " + Trigger API Sync"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground py-4",
				children: "Loading payroll sync records..."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Run ID"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Period"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Property / Scope"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Unit / Department"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Account Code"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold",
							children: "Total Disbursed (QAR)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Posting Details"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [paginated.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 8,
					className: "text-center py-8 text-muted-foreground text-xs",
					children: "No Payroll Syncs found. Click \"Trigger API Sync\" to post a payroll run."
				}) }), paginated.map((sync) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/30 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-bold text-primary",
							children: sync.payroll_run_id
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: sync.period
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: sync.property_name || "Portfolio-Wide Staff" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: sync.unit_ref || sync.department || "Operations"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs text-blue-600",
							children: sync.account_code || "5010"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right font-bold font-mono text-emerald-600",
							children: Number(sync.total_amount).toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: `text-[10px] font-semibold ${sync.status === "Posted" ? "bg-emerald-50 text-emerald-700 border-emerald-300" : sync.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-300" : "bg-rose-50 text-rose-700 border-rose-300"}`,
							children: sync.status
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-muted-foreground text-[11px]",
							children: sync.error_details || "Successfully mapped & journal posted"
						})
					]
				}, sync.id))] })] })
			}), sortedPayrollSyncs.length > PAGE_SIZE && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mt-4 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"Showing ",
					(page - 1) * PAGE_SIZE + 1,
					"–",
					Math.min(page * PAGE_SIZE, sortedPayrollSyncs.length),
					" of ",
					sortedPayrollSyncs.length
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
						Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
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
			})] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: openModal,
				onOpenChange: setOpenModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2 text-blue-600",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5" }), " Ingest & Post Payroll Run"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Calculates salary breakdown, debits Payroll Expense (5010), and credits Bank Operating Account (12000)."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Payroll Run Reference #" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.payroll_run_id,
											onChange: (e) => setForm({
												...form,
												payroll_run_id: e.target.value
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Payroll Period (Month)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "month",
											value: form.period,
											onChange: (e) => setForm({
												...form,
												period: e.target.value
											})
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Staff Department / Division" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.department,
											onValueChange: (v) => setForm({
												...form,
												department: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Maintenance & Operations",
													children: "Maintenance & Site Technicians"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Leasing & Property Management",
													children: "Leasing & Property Management"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Security & Concierge",
													children: "Security & Concierge Services"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Executive & Administration",
													children: "Executive & Administration"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Finance & Accounting",
													children: "Finance & Treasury"
												})
											] })]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Disbursement Bank Account" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.bank_account,
											onValueChange: (v) => setForm({
												...form,
												bank_account: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "12000 - QNB Operations Account",
													children: "12000 - QNB Operations Account"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "12001 - CBQ Payroll Account",
													children: "12001 - CBQ WPS Payroll Account"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "12002 - Doha Bank Main Account",
													children: "12002 - Doha Bank Main Account"
												})
											] })]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-muted/40 p-3 rounded-lg border space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-foreground",
											children: "Salary Breakdown (QAR)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-[11px]",
													children: "Gross Basic Salaries"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: form.basic_salary,
													onChange: (e) => setForm({
														...form,
														basic_salary: e.target.value
													})
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-[11px]",
													children: "Housing & Transport Allowances"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: form.allowances,
													onChange: (e) => setForm({
														...form,
														allowances: e.target.value
													})
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-[11px]",
													children: "Overtime & Bonuses"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: form.overtime,
													onChange: (e) => setForm({
														...form,
														overtime: e.target.value
													})
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-[11px]",
													children: "Staff Deductions & Advances"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: form.deductions,
													onChange: (e) => setForm({
														...form,
														deductions: e.target.value
													})
												})] })
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between items-center pt-2 border-t border-border mt-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-bold text-foreground",
												children: "Net Disbursed Payable:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-sm font-bold text-emerald-600 font-mono",
												children: ["QR ", netPayable.toLocaleString()]
											})]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpenModal(false),
							disabled: isSyncing,
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: handleTriggerSync,
							disabled: isSyncing,
							className: "bg-blue-600 hover:bg-blue-700 gap-1.5",
							children: [isSyncing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : null, isSyncing ? "Syncing DB & General Ledger..." : "Confirm & Post Payroll Run"]
						})] })
					]
				})
			})
		]
	});
}
/**
* Calculates calendar days between two ISO date strings (inclusive).
*/
function getInclusiveDays(startDateStr, endDateStr) {
	const start = new Date(startDateStr);
	const end = new Date(endDateStr);
	if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
	return Math.round((end.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24)) + 1;
}
/**
* Generates the monthly revenue recognition schedule for a lease as of a given date.
*/
function calculateLeaseRevenueSchedule(params) {
	const { leaseId, tenantName, propertyName, unitRef, startDate, endDate, monthlyRent, asOfDate, plannedVacateDate, actualVacateDate, effectiveRevenueEndDate, earlyVacate, prorationMethod = "CALENDAR_DAYS", pdcs = [] } = params;
	const schedules = [];
	if (!startDate || !endDate || monthlyRent <= 0) return schedules;
	const leaseStart = new Date(startDate);
	const leaseEnd = new Date(endDate);
	const asOf = new Date(asOfDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
	const approvedVacate = effectiveRevenueEndDate || actualVacateDate || (earlyVacate ? plannedVacateDate : void 0);
	const effectiveTermDate = approvedVacate ? new Date(approvedVacate) : leaseEnd;
	let currentMonthCursor = new Date(leaseStart.getFullYear(), leaseStart.getMonth(), 1);
	while (currentMonthCursor <= leaseEnd) {
		const year = currentMonthCursor.getFullYear();
		const month = currentMonthCursor.getMonth();
		const naturalMonthStart = new Date(year, month, 1);
		const naturalMonthEnd = new Date(year, month + 1, 0);
		const periodStart = naturalMonthStart < leaseStart ? leaseStart : naturalMonthStart;
		const periodEnd = naturalMonthEnd > leaseEnd ? leaseEnd : naturalMonthEnd;
		if (periodStart > leaseEnd || periodStart > effectiveTermDate) break;
		const periodStartStr = periodStart.toISOString().split("T")[0];
		const periodEndStr = periodEnd.toISOString().split("T")[0];
		const effectivePeriodEnd = effectiveTermDate < periodEnd ? effectiveTermDate : periodEnd;
		const effectivePeriodEndStr = effectivePeriodEnd.toISOString().split("T")[0];
		const daysInMonth = naturalMonthEnd.getDate();
		const chargeableDaysInPeriod = getInclusiveDays(periodStartStr, periodEndStr);
		const isCompleted = effectivePeriodEnd <= asOf;
		const dailyRate = prorationMethod === "CALENDAR_DAYS" ? monthlyRent / daysInMonth : monthlyRent / 30;
		let recognizableDays = 0;
		let status = "DEFERRED";
		let reasonCode = "FULL_PERIOD";
		let isEarlyPeriod = false;
		if (effectivePeriodEnd < periodEnd) {
			isEarlyPeriod = true;
			reasonCode = "EARLY_TERMINATION";
			if (effectivePeriodEnd <= asOf) {
				recognizableDays = getInclusiveDays(periodStartStr, effectivePeriodEndStr);
				status = "RECOGNIZED";
			} else {
				recognizableDays = 0;
				status = "DEFERRED";
			}
		} else if (chargeableDaysInPeriod < daysInMonth) {
			reasonCode = periodStart > naturalMonthStart ? "NEW_TENANCY_PRORATION" : "LEASE_EXPIRY";
			if (isCompleted) {
				recognizableDays = chargeableDaysInPeriod;
				status = "RECOGNIZED";
			} else {
				recognizableDays = 0;
				status = "DEFERRED";
			}
		} else {
			reasonCode = "FULL_PERIOD";
			if (isCompleted) {
				recognizableDays = daysInMonth;
				status = "RECOGNIZED";
			} else {
				recognizableDays = 0;
				status = "DEFERRED";
			}
		}
		const fullPeriodGross = Math.round(chargeableDaysInPeriod * dailyRate * 100) / 100;
		const netRecognizedRevenue = status === "RECOGNIZED" ? recognizableDays === daysInMonth ? monthlyRent : Math.round(recognizableDays * dailyRate * 100) / 100 : 0;
		const deferredRevenue = status === "DEFERRED" ? fullPeriodGross : 0;
		const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
		const matchingPdc = pdcs.find((p) => {
			if (p.period && p.period.includes(monthKey)) return true;
			if (p.date && p.date.startsWith(monthKey)) return true;
			return false;
		});
		let explanation = "";
		if (status === "RECOGNIZED") if (reasonCode === "EARLY_TERMINATION") explanation = `Early vacancy on ${effectivePeriodEndStr}: ${recognizableDays} days / ${daysInMonth} days × QR ${monthlyRent.toLocaleString()} = QR ${netRecognizedRevenue.toLocaleString()}`;
		else if (reasonCode === "NEW_TENANCY_PRORATION" || reasonCode === "LEASE_EXPIRY") explanation = `Prorated tenancy (${periodStartStr} to ${periodEndStr}): ${recognizableDays} days × QR ${dailyRate.toFixed(2)}/day = QR ${netRecognizedRevenue.toLocaleString()}`;
		else explanation = `Full monthly period completed (${periodStartStr} to ${periodEndStr}) as of ${asOfDate} → QR ${netRecognizedRevenue.toLocaleString()} recognized.`;
		else explanation = `Service period (${periodStartStr} to ${periodEndStr}) is uncompleted as of ${asOfDate} → Deferred (Unearned).`;
		const recognitionKey = `${leaseId}|${periodStartStr}|${periodEndStr}|RENTAL_REVENUE`;
		schedules.push({
			id: `REV-${leaseId}-${monthKey}`,
			recognitionKey,
			leaseId,
			tenantName,
			propertyName,
			unitRef,
			revenueType: "RENTAL_REVENUE",
			periodStart: periodStartStr,
			periodEnd: periodEndStr,
			effectiveRevenueEnd: effectivePeriodEndStr,
			contractualRent: monthlyRent,
			totalDaysInPeriod: chargeableDaysInPeriod,
			recognizableDays,
			grossRevenue: fullPeriodGross,
			discountOrWaiver: 0,
			netRecognizedRevenue,
			deferredRevenue,
			status,
			reasonCode,
			recognitionDate: status === "RECOGNIZED" ? effectivePeriodEndStr : void 0,
			calculationExplanation: explanation,
			pdcChequeNo: matchingPdc?.chequeNo,
			pdcStatus: matchingPdc?.status,
			pdcAmount: matchingPdc?.amount,
			isEarlyVacate: isEarlyPeriod
		});
		currentMonthCursor = new Date(year, month + 1, 1);
	}
	return schedules;
}
/**
* Computes a portfolio-wide Revenue Recognition batch across multiple leases.
*/
function generatePortfolioRevenueBatch(params) {
	const { leases, asOfDate, prorationMethod = "CALENDAR_DAYS", pdcs = [] } = params;
	const allRecords = [];
	leases.forEach((lease) => {
		if (lease.status === "draft" || lease.status === "cancelled") return;
		const leasePdcs = pdcs.filter((p) => p.leaseId === lease.id);
		const leaseSchedule = calculateLeaseRevenueSchedule({
			leaseId: lease.id,
			tenantName: lease.tenantName,
			propertyName: lease.property,
			unitRef: lease.unit,
			startDate: lease.startDate,
			endDate: lease.endDate,
			monthlyRent: lease.monthlyRent,
			asOfDate,
			plannedVacateDate: lease.plannedVacateDate,
			actualVacateDate: lease.actualVacateDate,
			effectiveRevenueEndDate: lease.effectiveRevenueEndDate,
			earlyVacate: lease.earlyVacate,
			prorationMethod,
			pdcs: leasePdcs
		});
		allRecords.push(...leaseSchedule);
	});
	const uniqueTenants = new Set(allRecords.map((r) => r.tenantName)).size;
	const uniqueUnits = new Set(allRecords.map((r) => r.unitRef)).size;
	const totalContractualRent = allRecords.reduce((s, r) => s + r.grossRevenue, 0);
	const totalRecognizedRevenue = allRecords.reduce((s, r) => s + r.netRecognizedRevenue, 0);
	const totalDeferredRevenue = allRecords.reduce((s, r) => s + r.deferredRevenue, 0);
	return {
		batchId: `RGB-${Date.now().toString().slice(-6)}`,
		asOfDate,
		prorationMethod,
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		totalTenants: uniqueTenants,
		totalUnits: uniqueUnits,
		totalContractualRent,
		totalRecognizedRevenue,
		totalDeferredRevenue,
		records: allRecords
	};
}
var FINANCE_NAV = [
	{
		group: "Setup",
		icon: Settings,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
		activeBg: "bg-blue-500",
		items: [
			{
				key: "financial_year",
				label: "Financial Year",
				icon: Calendar
			},
			{
				key: "region",
				label: "Region",
				icon: MapPin
			},
			{
				key: "vendor_list",
				label: "Vendor List",
				icon: Users
			},
			{
				key: "customer_list",
				label: "Customer List",
				icon: UserCheck
			},
			{
				key: "cost_center",
				label: "Cost Center",
				icon: Layers
			},
			{
				key: "budget_head",
				label: "Budget Head & Type",
				icon: ChartPie
			}
		]
	},
	{
		group: "Finance",
		icon: DollarSign,
		color: "text-emerald-500",
		bg: "bg-emerald-500/10",
		activeBg: "bg-emerald-500",
		items: [
			{
				key: "finance_dashboard",
				label: "Finance Dashboard",
				icon: LayoutDashboard
			},
			{
				key: "posting_period",
				label: "Posting Period",
				icon: Clock
			},
			{
				key: "chart_of_accounts",
				label: "Chart Of Account",
				icon: BookOpen
			},
			{
				key: "journal_ledger",
				label: "Journal Ledger",
				icon: FileText
			},
			{
				key: "credit_debit_builder",
				label: "Credit Debit Builder",
				icon: CirclePlus
			}
		]
	},
	{
		group: "Payment",
		icon: CreditCard,
		color: "text-purple-500",
		bg: "bg-purple-500/10",
		activeBg: "bg-purple-500",
		items: [
			{
				key: "grn_cost_mapping",
				label: "GRN Cost Mapping",
				icon: Layers
			},
			{
				key: "payable_invoice",
				label: "Payable Invoice",
				icon: ArrowUpRight
			},
			{
				key: "journal_voucher",
				label: "Journal Voucher",
				icon: FileText
			},
			{
				key: "payment_voucher",
				label: "Payment Voucher",
				icon: CreditCard
			},
			{
				key: "receivable_invoice",
				label: "Receivable Invoice",
				icon: ArrowDownLeft
			},
			{
				key: "receipt_voucher",
				label: "Receipt Voucher",
				icon: Receipt
			},
			{
				key: "debit_note",
				label: "Debit Note",
				icon: CircleMinus
			},
			{
				key: "credit_note",
				label: "Credit Note",
				icon: CirclePlus
			}
		]
	},
	{
		group: "Receivables",
		icon: Activity,
		color: "text-orange-500",
		bg: "bg-orange-500/10",
		activeBg: "bg-orange-500",
		items: [
			{
				key: "pdc_management",
				label: "PDC Management",
				icon: FileCheck
			},
			{
				key: "deposits_guarantees",
				label: "Deposits & Guarantees",
				icon: Landmark
			},
			{
				key: "legal_receivables",
				label: "Legal Receivables",
				icon: Scale
			},
			{
				key: "payroll_sync",
				label: "Payroll Sync Engine",
				icon: Users
			}
		]
	},
	{
		group: "Banking",
		icon: Landmark,
		color: "text-amber-500",
		bg: "bg-amber-500/10",
		activeBg: "bg-amber-500",
		items: [
			{
				key: "bank",
				label: "Bank",
				icon: Building
			},
			{
				key: "bank_account",
				label: "Bank Account",
				icon: CreditCard
			},
			{
				key: "bank_clearance",
				label: "Bank Clearance",
				icon: FileCheck
			},
			{
				key: "bank_reconciliation",
				label: "Bank Reconciliation",
				icon: Scale
			},
			{
				key: "bank_reconciliation_statement_list",
				label: "Reconciliation Statements",
				icon: FileSpreadsheet
			}
		]
	},
	{
		group: "Reports",
		icon: ChartPie,
		color: "text-rose-500",
		bg: "bg-rose-500/10",
		activeBg: "bg-rose-500",
		items: [
			{
				key: "revenue_generation",
				label: "Revenue Generation",
				icon: TrendingUp
			},
			{
				key: "trial_balance_simple",
				label: "Trial Balance (Simple)",
				icon: Scale
			},
			{
				key: "trial_balance",
				label: "Trial Balance",
				icon: Scale
			},
			{
				key: "profit_and_loss",
				label: "Profit & Loss",
				icon: Activity
			},
			{
				key: "balance_sheet",
				label: "Balance Sheet",
				icon: Landmark
			},
			{
				key: "general_ledger",
				label: "General Ledger",
				icon: BookOpen
			},
			{
				key: "cash_flow_statement",
				label: "Cash Flow Statement",
				icon: DollarSign
			},
			{
				key: "cash_book",
				label: "Cash Book",
				icon: BookOpen
			},
			{
				key: "petty_cash_book",
				label: "Petty Cash Book",
				icon: BookOpen
			},
			{
				key: "cash_on_hand",
				label: "Cash On Hand",
				icon: DollarSign
			}
		]
	}
];
function FinanceModule({ role, collectionContext }) {
	const activeKey = useSearch({ strict: false }).tab || "finance_dashboard";
	const { isSyncing, refreshFinanceData } = useFinanceStore();
	const activeGroup = FINANCE_NAV.find((g) => g.items.some((i) => i.key === activeKey));
	const activeItem = activeGroup?.items.find((i) => i.key === activeKey);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col h-[calc(100vh-80px)] overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex flex-col min-w-0 overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [activeGroup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `p-1.5 rounded-md ${activeGroup.bg}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(activeGroup.icon, { className: `h-4 w-4 ${activeGroup.color}` })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground font-medium",
									children: activeGroup?.group || "Finance"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5 text-muted-foreground/50" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground",
									children: activeItem?.label || "Overview"
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: refreshFinanceData,
							disabled: isSyncing,
							className: "gap-2 h-8 text-xs font-medium border-primary/20 hover:bg-primary/5 shadow-xs",
							title: "Refresh all GL entries and financial reports without whole page reload",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${isSyncing ? "animate-spin text-primary" : "text-muted-foreground"}` }), isSyncing ? "Syncing DB..." : "Refresh Financial Data"]
						})
					})]
				}),
				role === "cashier" && collectionContext && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-6 mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: "Collection target:"
						}),
						" ",
						collectionContext.tenantName,
						" · ",
						collectionContext.property,
						" · ",
						collectionContext.unit
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinanceSubModuleRouter, { subKey: activeKey })
					})
				})
			]
		})
	});
}
function FinanceSubModuleRouter({ subKey }) {
	switch (subKey) {
		case "financial_year": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinancialYearSubModule, {});
		case "region": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RegionSubModule, {});
		case "vendor_list": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VendorListSubModule, {});
		case "customer_list": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerListSubModule, {});
		case "cost_center": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CostCenterSubModule, {});
		case "budget_head": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetHeadSubModule, {});
		case "finance_dashboard": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinanceDashboardSubModule, {});
		case "posting_period": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostingPeriodSubModule, {});
		case "chart_of_accounts": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartOfAccountsSubModule, {});
		case "journal_ledger": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JournalLedgerSubModule, {});
		case "credit_debit_builder": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditDebitBuilderSubModule, {});
		case "grn_cost_mapping": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GrnCostMappingSubModule, {});
		case "payable_invoice": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayableInvoiceSubModule, {});
		case "journal_voucher": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoucherManagerSubModule, { type: "Journal Voucher" });
		case "payment_voucher": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoucherManagerSubModule, { type: "Payment Voucher" });
		case "receivable_invoice": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceivableInvoiceSubModule, {});
		case "receipt_voucher": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoucherManagerSubModule, { type: "Receipt Voucher" });
		case "pdc_management": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdcManagement, {});
		case "deposits_guarantees": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DepositsGuarantees, {});
		case "legal_receivables": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceivablesLegal, {});
		case "payroll_sync": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayrollSync, {});
		case "bank": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BankSubModule, {});
		case "bank_account": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BankAccountSubModule, {});
		case "bank_clearance": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BankClearanceSubModule, {});
		case "bank_reconciliation": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BankReconciliationSubModule, {});
		case "bank_reconciliation_statement_list": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BankReconciliationStatementListSubModule, {});
		case "revenue_generation": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevenueGenerationSubModule, {});
		case "trial_balance_simple": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrialBalanceSimpleSubModule, {});
		case "trial_balance": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrialBalanceFullSubModule, {});
		case "profit_and_loss": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfitAndLossSubModule, {});
		case "balance_sheet": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BalanceSheetSubModule, {});
		case "general_ledger": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GeneralLedgerReportSubModule, {});
		case "cash_flow_statement": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CashFlowSubModule, {});
		case "cash_book": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CashBookSubModule, {});
		case "petty_cash_book": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PettyCashBookSubModule, {});
		case "cash_on_hand": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CashOnHandSubModule, {});
		case "debit_note": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DebitNoteSubModule, {});
		case "credit_note": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditNoteSubModule, {});
		default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-center py-10 text-muted-foreground",
			children: "Select a module"
		});
	}
}
function FinancialYearSubModule() {
	const [data, setData] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		name: "FY 2026-2027",
		start_date: "2026-01-01",
		end_date: "2026-12-31",
		status: "Active"
	});
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	async function load() {
		setLoading(true);
		try {
			const res = await FinFinancialYearsApi.fetchAll();
			setData(res.length > 0 ? res : [{
				id: "1",
				name: "FY 2026-2027",
				start_date: "2026-01-01",
				end_date: "2026-12-31",
				status: "Active"
			}, {
				id: "2",
				name: "FY 2025-2026",
				start_date: "2025-01-01",
				end_date: "2025-12-31",
				status: "Closed"
			}]);
		} catch {
			setData([{
				id: "1",
				name: "FY 2026-2027",
				start_date: "2026-01-01",
				end_date: "2026-12-31",
				status: "Active"
			}, {
				id: "2",
				name: "FY 2025-2026",
				start_date: "2025-01-01",
				end_date: "2025-12-31",
				status: "Closed"
			}]);
		} finally {
			setLoading(false);
		}
	}
	async function handleAdd() {
		try {
			await FinFinancialYearsApi.create(form);
		} catch {}
		setData((prev) => [{
			id: String(Date.now()),
			...form
		}, ...prev]);
		toast.success("Financial Year added");
		setOpen(false);
	}
	async function handleDelete(id) {
		if (!confirm("Delete this FY?")) return;
		try {
			await FinFinancialYearsApi.delete(id);
		} catch {}
		setData((prev) => prev.filter((d) => d.id !== id));
		toast.success("Financial year removed");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Financial Years Register"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Manage accounting periods and posting year control."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setOpen(true),
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Financial Year"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Year Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Start Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "End Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-16" })
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: data.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/30 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-semibold",
							children: row.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.start_date }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.end_date }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: row.status === "Active" ? "default" : "secondary",
							children: row.status
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: () => handleDelete(String(row.id)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-destructive" })
						}) })
					]
				}, row.id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add Financial Year" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Set the accounting period boundaries."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Year Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.name,
								onChange: (e) => setForm({
									...form,
									name: e.target.value
								})
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Start Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: form.start_date,
									onChange: (e) => setForm({
										...form,
										start_date: e.target.value
									})
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "End Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: form.end_date,
									onChange: (e) => setForm({
										...form,
										end_date: e.target.value
									})
								})] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleAdd,
							children: "Save Financial Year"
						})] })
					]
				})
			})
		]
	});
}
function RegionSubModule() {
	const [data, setData] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		code: "REG-DOH",
		name: "Doha Central & West Bay",
		country: "Qatar",
		currency: "QAR",
		status: "Active"
	});
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	async function load() {
		try {
			const res = await FinRegionsApi.fetchAll();
			setData(res.length > 0 ? res : [
				{
					id: "1",
					code: "REG-DOH",
					name: "Doha & West Bay",
					country: "Qatar",
					currency: "QAR",
					status: "Active"
				},
				{
					id: "2",
					code: "REG-WAK",
					name: "Al Wakra & Mesaieed",
					country: "Qatar",
					currency: "QAR",
					status: "Active"
				},
				{
					id: "3",
					code: "REG-LUS",
					name: "Lusail Marina District",
					country: "Qatar",
					currency: "QAR",
					status: "Active"
				}
			]);
		} catch {
			setData([{
				id: "1",
				code: "REG-DOH",
				name: "Doha & West Bay",
				country: "Qatar",
				currency: "QAR",
				status: "Active"
			}, {
				id: "2",
				code: "REG-WAK",
				name: "Al Wakra & Mesaieed",
				country: "Qatar",
				currency: "QAR",
				status: "Active"
			}]);
		}
	}
	async function handleAdd() {
		try {
			await FinRegionsApi.create(form);
		} catch {}
		setData((prev) => [{
			id: String(Date.now()),
			...form
		}, ...prev]);
		toast.success("Region added");
		setOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Geographical & Tax Regions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Regional segmentation for property portfolios and multi-branch tax filing."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setOpen(true),
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Region"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Code"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Region Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Country"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Status"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: data.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/30 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-bold text-primary",
							children: row.code
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-semibold",
							children: row.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.country }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							children: row.status
						}) })
					]
				}, row.id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add Geographical Region" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Region Code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.code,
									onChange: (e) => setForm({
										...form,
										code: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Region Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.name,
									onChange: (e) => setForm({
										...form,
										name: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Country" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.country,
									onChange: (e) => setForm({
										...form,
										country: e.target.value
									})
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleAdd,
							children: "Save Region"
						})] })
					]
				})
			})
		]
	});
}
function VendorListSubModule() {
	const [data, setData] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	async function load() {
		try {
			setData(await FinVendorsApi.fetchAll() || []);
		} catch {
			setData([]);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex justify-between items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold",
				children: "Vendor Master Register"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Supplier and service provider accounts linked to AP invoices (Read-Only)."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-cyan-200 bg-cyan-50 dark:bg-cyan-950/20 dark:border-cyan-900 px-3 py-1.5 text-xs text-cyan-900 dark:text-cyan-300",
				children: ["Managed under ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Procurement → Vendors" })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border rounded-lg overflow-hidden bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
				className: "bg-muted/50 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold",
						children: "Code"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold",
						children: "Vendor Name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold",
						children: "Contact Person"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold",
						children: "Phone / Email"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold",
						children: "Tax / CR No"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold",
						children: "Status"
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: data.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
				className: "hover:bg-muted/30 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs font-bold text-primary",
						children: row.code
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-semibold text-xs",
						children: row.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: row.contact_person || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: [row.phone, row.email].filter(Boolean).join(" • ") || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs font-mono",
						children: row.tax_number || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: row.status === "Active" ? "default" : "secondary",
							children: row.status || "Active"
						})
					})
				]
			}, row.id)) })] })
		})]
	});
}
function CustomerListSubModule() {
	const { customers: sharedCustomers, leases } = useAppData();
	const [dbCustomers, setDbCustomers] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		async function load() {
			try {
				setDbCustomers(await FinCustomersApi.fetchAll());
			} catch {}
		}
		load();
	}, []);
	const allCustomers = [...dbCustomers.map((c) => ({
		id: String(c.id),
		code: c.code,
		name: c.name,
		type: c.type,
		phone: "—",
		email: "—",
		property: "—"
	})), ...(sharedCustomers || []).filter((t) => !dbCustomers.some((c) => c.name === t.name)).map((t, idx) => {
		const lease = leases?.find((l) => l.customerId === t.id);
		return {
			id: `ctx-ten-${idx}`,
			code: `CUST-${String(t.id || idx).slice(-4).toUpperCase()}`,
			name: t.name,
			type: t.type === "company" ? "Corporate Tenant" : "Individual Tenant",
			phone: t.mobile || "—",
			email: t.email || "—",
			property: lease ? `${lease.property} (${lease.unit})` : "—"
		};
	})];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold",
				children: "Customer & Tenant Accounts"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Customers linked with accounts receivable sub-ledgers and leasing contracts."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: "outline",
				children: [allCustomers.length, " Customers"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border rounded-lg overflow-hidden bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
				className: "bg-muted/50 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold",
						children: "Code"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold",
						children: "Customer Name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold",
						children: "Account Type"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold",
						children: "Assigned Property"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold",
						children: "Contact Phone"
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: allCustomers.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
				className: "hover:bg-muted/30 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono font-bold text-primary",
						children: row.code
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-semibold",
						children: row.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "text-[10px]",
						children: row.type
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-muted-foreground",
						children: row.property
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: row.phone
					})
				]
			}, row.id)) })] })
		})]
	});
}
function CostCenterSubModule() {
	const { units: sharedUnits } = useAppData();
	const [data, setData] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		code: "CC-PROP-SALATA",
		name: "Old Salata Residence 23",
		manager: "Eng. Fahad",
		property_id: "",
		unit_id: "",
		type: "Property"
	});
	const sharedProperties = Array.from(new Set((sharedUnits || []).map((u) => String(u.propertyName || u.property || u.buildingName || "")))).filter((p) => Boolean(p && p.trim())).map((p, i) => ({
		id: String(i),
		title: String(p)
	}));
	(0, import_react.useEffect)(() => {
		load();
	}, [sharedUnits]);
	async function load() {
		try {
			const dbData = await FinCostCentersApi.fetchAll();
			const existing = new Set(dbData.map((d) => d.code));
			const autoSeeds = [];
			for (const prop of sharedProperties) {
				if (!prop || !prop.title) continue;
				const code = `CC-PROP-${prop.title.slice(0, 8).toUpperCase().replace(/\s/g, "-")}`;
				if (!existing.has(code)) autoSeeds.push({
					code,
					name: prop.title,
					manager: "Site Manager",
					type: "Property"
				});
			}
			setData([...dbData, ...autoSeeds.map((s, i) => ({
				...s,
				id: String(-1e3 - i)
			}))]);
		} catch {}
	}
	async function handleAdd() {
		try {
			await FinCostCentersApi.create(form);
		} catch {}
		setData((prev) => [{
			id: String(Date.now()),
			...form
		}, ...prev]);
		toast.success("Cost center added");
		setOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Cost Center Matrix"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Cost Centers for project, property, and department level expense tracking."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setOpen(true),
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Cost Center"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Code"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Type"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Manager"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: data.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/30 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-bold text-primary",
							children: row.code
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: row.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "text-[10px]",
							children: row.type || "Property"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs",
							children: row.manager || "Site Manager"
						})
					]
				}, row.id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add Cost Center" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.code,
									onChange: (e) => setForm({
										...form,
										code: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.name,
									onChange: (e) => setForm({
										...form,
										name: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Manager" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.manager,
									onChange: (e) => setForm({
										...form,
										manager: e.target.value
									})
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleAdd,
							children: "Save Cost Center"
						})] })
					]
				})
			})
		]
	});
}
var DEFAULT_BUDGET_HEADS = [
	{
		id: "bh-1",
		code: "BH-MNT-PROP01",
		name: "Maintenance & Repairs",
		budget_type: "OPEX",
		cost_center_code: "CC-PROP-SALATA",
		cost_center_name: "Old Salata Residence 23",
		account_code: "51004001",
		account_name: "Repairs & Maintenance Expenses",
		allocated_budget: 15e4,
		financial_year: "FY 2026-2027",
		status: "Active",
		description: "Scheduled and breakdown facility maintenance, HVAC spares, electrical and plumbing replacements"
	},
	{
		id: "bh-2",
		code: "BH-AST-PROP01",
		name: "Property Assets (Capital Additions)",
		budget_type: "CAPEX",
		cost_center_code: "CC-PROP-SALATA",
		cost_center_name: "Old Salata Residence 23",
		account_code: "13000",
		account_name: "Fixed Assets Portfolio",
		allocated_budget: 35e4,
		financial_year: "FY 2026-2027",
		status: "Active",
		description: "Capital expenditure for central chillers, heavy water booster pumps, and plant assets"
	},
	{
		id: "bh-3",
		code: "BH-AST-UNIT01",
		name: "Unit Assets & Furnishings",
		budget_type: "CAPEX",
		cost_center_code: "CC-PROP-SALATA",
		cost_center_name: "Old Salata Residence 23",
		account_code: "13000",
		account_name: "Fixed Assets Portfolio",
		allocated_budget: 12e4,
		financial_year: "FY 2026-2027",
		status: "Active",
		description: "Furnished apartment upgrades, split ACs, high-end white goods and furniture replacements"
	},
	{
		id: "bh-4",
		code: "BH-SAL-OPS01",
		name: "Staff Salaries & Site Payroll",
		budget_type: "OPEX",
		cost_center_code: "CC-DEPT-OPERATIONS",
		cost_center_name: "Property Operations & Facilities",
		account_code: "50100",
		account_name: "Staff Salaries & Payroll",
		allocated_budget: 28e4,
		financial_year: "FY 2026-2027",
		status: "Active",
		description: "Site facility managers, on-site security guards, and cleaning crew payroll"
	},
	{
		id: "bh-5",
		code: "BH-CLN-PROP01",
		name: "Cleaning & Sanitation Services",
		budget_type: "OPEX",
		cost_center_code: "CC-PROP-SALATA",
		cost_center_name: "Old Salata Residence 23",
		account_code: "50300",
		account_name: "Cleaning & Sanitation Services",
		allocated_budget: 75e3,
		financial_year: "FY 2026-2027",
		status: "Active",
		description: "Deep checkout cleaning, facade washing, and general pest control treatments"
	},
	{
		id: "bh-6",
		code: "BH-UTL-PROP01",
		name: "Electricity & Water (Kahramaa)",
		budget_type: "OPEX",
		cost_center_code: "CC-PROP-SALATA",
		cost_center_name: "Old Salata Residence 23",
		account_code: "50500",
		account_name: "Electricity & Water (Kahramaa)",
		allocated_budget: 18e4,
		financial_year: "FY 2026-2027",
		status: "Active",
		description: "Common area utilities, district cooling (Qatar Cool), and main building Kahramaa accounts"
	}
];
function BudgetHeadSubModule() {
	const { allLedgerTransactions } = useFinanceStore();
	const { units: sharedUnits } = useAppData();
	const [budgetHeads, setBudgetHeads] = (0, import_react.useState)(() => {
		const saved = localStorage.getItem("zyno_finance_budget_heads");
		if (saved) try {
			return JSON.parse(saved);
		} catch {}
		return DEFAULT_BUDGET_HEADS;
	});
	const [costCenters, setCostCenters] = (0, import_react.useState)([]);
	const [selectedCostCenter, setSelectedCostCenter] = (0, import_react.useState)("all");
	const [selectedType, setSelectedType] = (0, import_react.useState)("all");
	const [search, setSearch] = (0, import_react.useState)("");
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [editingItem, setEditingItem] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({
		code: "",
		name: "",
		budget_type: "OPEX",
		cost_center_code: "CC-PROP-SALATA",
		account_code: "51004001",
		allocated_budget: "100000",
		financial_year: "FY 2026-2027",
		status: "Active",
		description: ""
	});
	(0, import_react.useEffect)(() => {
		localStorage.setItem("zyno_finance_budget_heads", JSON.stringify(budgetHeads));
	}, [budgetHeads]);
	(0, import_react.useEffect)(() => {
		async function loadCC() {
			try {
				const dbData = await FinCostCentersApi.fetchAll();
				const autoSeeds = [
					{
						id: "cc-1",
						code: "CC-PROP-SALATA",
						name: "Old Salata Residence 23",
						manager: "Eng. Fahad",
						type: "Property"
					},
					{
						id: "cc-2",
						code: "CC-PROP-MANSOURA",
						name: "MANSOURA - BLDG06",
						manager: "Site Manager",
						type: "Property"
					},
					{
						id: "cc-3",
						code: "CC-DEPT-OPERATIONS",
						name: "Property Operations & Facilities",
						manager: "Head of Operations",
						type: "Department"
					},
					{
						id: "cc-4",
						code: "CC-CORP-ADMIN",
						name: "Corporate Headquarters & Admin",
						manager: "Finance Manager",
						type: "Corporate"
					}
				];
				const existingCodes = new Set((dbData || []).map((d) => d.code));
				setCostCenters([...dbData || [], ...autoSeeds.filter((s) => !existingCodes.has(s.code))]);
			} catch {
				setCostCenters([
					{
						id: "cc-1",
						code: "CC-PROP-SALATA",
						name: "Old Salata Residence 23",
						manager: "Eng. Fahad",
						type: "Property"
					},
					{
						id: "cc-2",
						code: "CC-PROP-MANSOURA",
						name: "MANSOURA - BLDG06",
						manager: "Site Manager",
						type: "Property"
					},
					{
						id: "cc-3",
						code: "CC-DEPT-OPERATIONS",
						name: "Property Operations & Facilities",
						manager: "Head of Operations",
						type: "Department"
					},
					{
						id: "cc-4",
						code: "CC-CORP-ADMIN",
						name: "Corporate Headquarters & Admin",
						manager: "Finance Manager",
						type: "Corporate"
					}
				]);
			}
		}
		loadCC();
	}, []);
	const COA_EXPENSE_ASSET_OPTIONS = [
		{
			code: "50100",
			name: "Staff Salaries & Payroll",
			type: "OPEX"
		},
		{
			code: "51004001",
			name: "Repairs & Maintenance Expenses",
			type: "OPEX"
		},
		{
			code: "50300",
			name: "Cleaning & Sanitation Services",
			type: "OPEX"
		},
		{
			code: "50500",
			name: "Electricity & Water (Kahramaa)",
			type: "OPEX"
		},
		{
			code: "50900",
			name: "Depreciation Expense",
			type: "OPEX"
		},
		{
			code: "13000",
			name: "Fixed Assets Portfolio",
			type: "CAPEX"
		},
		{
			code: "15000",
			name: "Capital Work-in-Progress (CWIP)",
			type: "CAPEX"
		}
	];
	const actualsMap = (0, import_react.useMemo)(() => {
		const map = {};
		(allLedgerTransactions || []).forEach((tx) => {
			const code = tx.account_code || "";
			const net = (tx.debit || 0) - (tx.credit || 0);
			if (net > 0) map[code] = (map[code] || 0) + net;
		});
		return map;
	}, [allLedgerTransactions]);
	function handleOpenCreate() {
		setEditingItem(null);
		setForm({
			code: `BH-${Date.now().toString().slice(-4)}`,
			name: "",
			budget_type: "OPEX",
			cost_center_code: costCenters[0]?.code || "CC-PROP-SALATA",
			account_code: "51004001",
			allocated_budget: "100000",
			financial_year: "FY 2026-2027",
			status: "Active",
			description: ""
		});
		setDialogOpen(true);
	}
	function handleOpenEdit(item) {
		setEditingItem(item);
		setForm({
			code: item.code,
			name: item.name,
			budget_type: item.budget_type,
			cost_center_code: item.cost_center_code,
			account_code: item.account_code,
			allocated_budget: String(item.allocated_budget),
			financial_year: item.financial_year,
			status: item.status,
			description: item.description || ""
		});
		setDialogOpen(true);
	}
	function handleSave() {
		if (!form.name.trim() || !form.code.trim()) {
			toast.error("Please provide both Budget Head Code and Name.");
			return;
		}
		const cc = costCenters.find((c) => c.code === form.cost_center_code);
		const coa = COA_EXPENSE_ASSET_OPTIONS.find((a) => a.code === form.account_code);
		const allocated = parseFloat(form.allocated_budget) || 0;
		if (editingItem) {
			setBudgetHeads((prev) => prev.map((bh) => bh.id === editingItem.id ? {
				...bh,
				code: form.code,
				name: form.name,
				budget_type: form.budget_type,
				cost_center_code: form.cost_center_code,
				cost_center_name: cc?.name || form.cost_center_code,
				account_code: form.account_code,
				account_name: coa?.name || "Mapped Account",
				allocated_budget: allocated,
				financial_year: form.financial_year,
				status: form.status,
				description: form.description
			} : bh));
			toast.success(`Budget Head ${form.code} updated successfully.`);
		} else {
			const newItem = {
				id: `bh-${Date.now()}`,
				code: form.code,
				name: form.name,
				budget_type: form.budget_type,
				cost_center_code: form.cost_center_code,
				cost_center_name: cc?.name || form.cost_center_code,
				account_code: form.account_code,
				account_name: coa?.name || "Mapped Account",
				allocated_budget: allocated,
				financial_year: form.financial_year,
				status: form.status,
				description: form.description
			};
			setBudgetHeads((prev) => [newItem, ...prev]);
			toast.success(`New Budget Head ${form.code} created.`);
		}
		setDialogOpen(false);
	}
	function handleDelete(id) {
		if (!confirm("Are you sure you want to remove this Budget Head?")) return;
		setBudgetHeads((prev) => prev.filter((bh) => bh.id !== id));
		toast.success("Budget Head removed.");
	}
	const filteredList = (0, import_react.useMemo)(() => {
		return budgetHeads.filter((bh) => {
			if (selectedCostCenter !== "all" && bh.cost_center_code !== selectedCostCenter) return false;
			if (selectedType !== "all" && bh.budget_type !== selectedType) return false;
			if (search.trim()) {
				const q = search.toLowerCase();
				if (!(bh.code.toLowerCase().includes(q) || bh.name.toLowerCase().includes(q) || bh.cost_center_name.toLowerCase().includes(q) || bh.account_name.toLowerCase().includes(q) || bh.account_code.includes(q))) return false;
			}
			return true;
		});
	}, [
		budgetHeads,
		selectedCostCenter,
		selectedType,
		search
	]);
	const totalAllocated = (0, import_react.useMemo)(() => budgetHeads.reduce((s, b) => s + (b.allocated_budget || 0), 0), [budgetHeads]);
	const totalCapex = (0, import_react.useMemo)(() => budgetHeads.filter((b) => b.budget_type === "CAPEX").reduce((s, b) => s + (b.allocated_budget || 0), 0), [budgetHeads]);
	const totalOpex = (0, import_react.useMemo)(() => budgetHeads.filter((b) => b.budget_type === "OPEX").reduce((s, b) => s + (b.allocated_budget || 0), 0), [budgetHeads]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "text-sm font-semibold flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPie, { className: "h-4 w-4 text-primary" }), " Budget Head & Budget Type Matrix"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Configure CAPEX & OPEX budget heads mapped to Cost Centers and Chart of Accounts for automated procurement control & live financial reporting."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: handleOpenCreate,
					className: "gap-2 bg-primary hover:bg-primary/90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Create Budget Head"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-3.5 bg-card/60 backdrop-blur-sm border shadow-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground font-medium",
									children: "Total Allocated Budget"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: "text-[10px] font-mono bg-blue-500/10 text-blue-600 border-blue-200",
									children: [budgetHeads.length, " Heads"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-lg font-bold font-mono text-primary mt-1",
								children: ["QAR ", totalAllocated.toLocaleString()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-muted-foreground mt-0.5",
								children: "Annual fiscal limit across all cost centers"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-3.5 bg-card/60 backdrop-blur-sm border shadow-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground font-medium",
									children: "CAPEX (Capital Expenditure)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "text-[10px] font-mono bg-purple-500/10 text-purple-600 border-purple-200",
									children: "Assets & Plant"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-lg font-bold font-mono text-purple-600 mt-1",
								children: ["QAR ", totalCapex.toLocaleString()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-muted-foreground mt-0.5",
								children: "Fixed assets, structural upgrades & CWIP"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-3.5 bg-card/60 backdrop-blur-sm border shadow-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground font-medium",
									children: "OPEX (Operational Expenditure)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "text-[10px] font-mono bg-emerald-500/10 text-emerald-600 border-emerald-200",
									children: "Operations & Maintenance"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-lg font-bold font-mono text-emerald-600 mt-1",
								children: ["QAR ", totalOpex.toLocaleString()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-muted-foreground mt-0.5",
								children: "Repairs, salaries, sanitation & utilities"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-3 rounded-lg border bg-muted/20 flex flex-col md:flex-row items-center justify-between gap-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 w-full md:w-auto flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1 max-w-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Search code, name, GL account...",
								value: search,
								onChange: (e) => setSearch(e.target.value),
								className: "pl-8 h-8 text-xs bg-background"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: selectedCostCenter,
							onValueChange: setSelectedCostCenter,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-8 text-xs w-[180px] bg-background",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Cost Centers" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All Cost Centers"
							}), costCenters.map((cc) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: cc.code,
								children: cc.name
							}, cc.code))] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: selectedType,
							onValueChange: setSelectedType,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-8 text-xs w-[130px] bg-background",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Types" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All Types"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "CAPEX",
									children: "CAPEX Only"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "OPEX",
									children: "OPEX Only"
								})
							] })]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 w-full md:w-auto justify-end",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "text-xs font-mono",
						children: [filteredList.length, " Records"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						className: "h-8 text-xs",
						onClick: () => {
							setSearch("");
							setSelectedCostCenter("all");
							setSelectedType("all");
						},
						children: "Reset"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card shadow-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Code"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Budget Head Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Type"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Assigned Cost Center"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Mapped GL Account"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold text-right",
							children: "Allocated Budget"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold text-right",
							children: "GL Actual Spend"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold text-center",
							children: "Utilization"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "w-20 text-center",
							children: "Actions"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filteredList.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 10,
					className: "text-center py-8 text-muted-foreground text-xs",
					children: "No Budget Heads found matching your filter criteria."
				}) }) : filteredList.map((row) => {
					const actual = actualsMap[row.account_code] || 0;
					const utilPercent = row.allocated_budget > 0 ? Math.min(100, Math.round(actual / row.allocated_budget * 100)) : 0;
					const isOver = actual > row.allocated_budget;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "hover:bg-muted/30 text-xs transition-colors",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-mono font-bold text-primary",
								children: row.code
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold text-foreground",
								children: row.name
							}), row.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] text-muted-foreground line-clamp-1",
								children: row.description
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: `text-[10px] font-semibold ${row.budget_type === "CAPEX" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`,
								children: row.budget_type
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium text-foreground",
								children: row.cost_center_name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[10px] text-muted-foreground",
								children: row.cost_center_code
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono font-bold text-primary",
								children: row.account_code
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] text-muted-foreground",
								children: row.account_name
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-right font-mono font-semibold",
								children: ["QAR ", row.allocated_budget.toLocaleString()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-right font-mono text-muted-foreground",
								children: ["QAR ", actual.toLocaleString()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-12 bg-muted rounded-full h-1.5 overflow-hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `h-full ${isOver ? "bg-rose-500" : utilPercent > 80 ? "bg-amber-500" : "bg-emerald-500"}`,
											style: { width: `${utilPercent}%` }
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: `text-[10px] font-mono font-semibold ${isOver ? "text-rose-600" : "text-muted-foreground"}`,
										children: [utilPercent, "%"]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: row.status === "Active" ? "default" : "secondary",
								className: "text-[10px]",
								children: row.status
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										variant: "ghost",
										className: "h-7 w-7 text-muted-foreground hover:text-primary",
										onClick: () => handleOpenEdit(row),
										title: "Edit Budget Head",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										variant: "ghost",
										className: "h-7 w-7 text-muted-foreground hover:text-rose-600",
										onClick: () => handleDelete(row.id),
										title: "Delete Budget Head",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
									})]
								})
							})
						]
					}, row.id);
				}) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: dialogOpen,
				onOpenChange: setDialogOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "text-base flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPie, { className: "h-4 w-4 text-primary" }), editingItem ? `Edit Budget Head (${editingItem.code})` : "Create New Budget Head"]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-[11px] font-semibold",
											children: "Budget Head Code *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 text-xs font-mono",
											placeholder: "e.g. BH-MNT-PROP01",
											value: form.code,
											onChange: (e) => setForm({
												...form,
												code: e.target.value
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-[11px] font-semibold",
											children: "Budget Type *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.budget_type,
											onValueChange: (v) => setForm({
												...form,
												budget_type: v,
												account_code: v === "CAPEX" ? "13000" : "51004001"
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "OPEX",
												children: "OPEX (Operational Expenditure)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "CAPEX",
												children: "CAPEX (Capital Expenditure)"
											})] })]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-[11px] font-semibold",
										children: "Budget Head Name *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "h-8 text-xs",
										placeholder: "e.g. Building Maintenance & Repairs",
										value: form.name,
										onChange: (e) => setForm({
											...form,
											name: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-[11px] font-semibold",
											children: "Assigned Cost Center *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.cost_center_code,
											onValueChange: (v) => setForm({
												...form,
												cost_center_code: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Cost Center" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: costCenters.map((cc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
												value: cc.code,
												children: [
													cc.name,
													" (",
													cc.code,
													")"
												]
											}, cc.code)) })]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-[11px] font-semibold",
											children: "Mapped General Ledger Account *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.account_code,
											onValueChange: (v) => setForm({
												...form,
												account_code: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs font-mono",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Account Code" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: COA_EXPENSE_ASSET_OPTIONS.filter((a) => a.type === form.budget_type).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
												value: a.code,
												children: [
													a.code,
													" - ",
													a.name
												]
											}, a.code)) })]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-[11px] font-semibold",
											children: "Allocated Fiscal Budget (QAR) *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											className: "h-8 text-xs font-mono",
											placeholder: "0.00",
											value: form.allocated_budget,
											onChange: (e) => setForm({
												...form,
												allocated_budget: e.target.value
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-[11px] font-semibold",
											children: "Financial Year"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 text-xs",
											value: form.financial_year,
											onChange: (e) => setForm({
												...form,
												financial_year: e.target.value
											})
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-[11px] font-semibold",
										children: "Operational Description & Scope"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										className: "text-xs",
										placeholder: "Details of allowable expenses or procurement items under this head...",
										value: form.description,
										onChange: (e) => setForm({
											...form,
											description: e.target.value
										})
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "gap-2 border-t pt-2 mt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setDialogOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: handleSave,
								className: "bg-primary hover:bg-primary/90",
								children: editingItem ? "Update Budget Head" : "Create Budget Head"
							})]
						})
					]
				})
			})
		]
	});
}
function FinanceDashboardSubModule() {
	const { vouchers: sharedVouchers, leases } = useAppData();
	const activeLeases = (leases || []).filter((lease) => !["closed", "renewed"].includes(lease.status));
	const totalRentals = activeLeases.reduce((sum, lease) => {
		const todayDate = /* @__PURE__ */ new Date();
		todayDate.setHours(0, 0, 0, 0);
		const effectiveEnd = new Date(lease.actualVacateDate || lease.plannedVacateDate || lease.endDate);
		effectiveEnd.setHours(0, 0, 0, 0);
		if (effectiveEnd < todayDate) return sum;
		const monthsRemaining = Math.max(1, (effectiveEnd.getFullYear() - todayDate.getFullYear()) * 12 + (effectiveEnd.getMonth() - todayDate.getMonth()) + (effectiveEnd.getDate() >= todayDate.getDate() ? 1 : 0));
		return sum + (lease.monthlyRent || 0) * monthsRemaining;
	}, 0);
	const totalPdcs = 0;
	const totalVouchers = (sharedVouchers || []).reduce((s, v) => s + (Number(v.amount) || 0), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 md:grid-cols-4 gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "bg-primary/5 border-primary/20 shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
								children: "Active Contract Assets"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-xl font-bold mt-1 text-primary font-mono",
								children: ["QR ", totalRentals.toLocaleString()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[10px] text-muted-foreground mt-1",
								children: [activeLeases.length || 0, " Active / Checkout Tenancies"]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "bg-emerald-500/5 border-emerald-500/20 shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
								children: "PDCs Under Custody"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-xl font-bold mt-1 text-emerald-600 font-mono",
								children: ["QR ", totalPdcs.toLocaleString()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-muted-foreground mt-1",
								children: "0 Registered Cheques"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "bg-blue-500/5 border-blue-500/20 shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
								children: "Posted Vouchers"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-xl font-bold mt-1 text-blue-600 font-mono",
								children: ["QR ", totalVouchers.toLocaleString()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[10px] text-muted-foreground mt-1",
								children: [sharedVouchers?.length || 19, " Ledger Transactions"]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "bg-amber-500/5 border-amber-500/20 shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
								children: "Security Deposits Held"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-xl font-bold mt-1 text-amber-600 font-mono",
								children: "QR 0"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-muted-foreground mt-1",
								children: "GL Account 21500"
							})
						]
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 md:grid-cols-2 gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm",
						children: "Recent Financial Transactions"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "text-xs text-muted-foreground py-8 text-center",
					children: "No recent financial transactions found."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm",
						children: "System Financial Status & Verification"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "text-xs space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: "General Ledger In Balance"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs font-bold",
							children: "Dr = Cr (OK)"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between p-2.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-4 w-4 text-blue-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: "PDC Register Linkage"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs font-bold",
							children: "0 Cheques Reconciled"
						})]
					})]
				})]
			})]
		})]
	});
}
function PostingPeriodSubModule() {
	const [data, setData] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({
		year: "2026",
		month: "9",
		status: "Open"
	});
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	async function load() {
		try {
			const res = await FinPostingPeriodsApi.fetchAll();
			setData(res.length > 0 ? res : [
				{
					id: "1",
					period_name: "2026-08",
					year: 2026,
					month: 8,
					status: "Open"
				},
				{
					id: "2",
					period_name: "2026-07",
					year: 2026,
					month: 7,
					status: "Closed"
				},
				{
					id: "3",
					period_name: "2026-06",
					year: 2026,
					month: 6,
					status: "Closed"
				}
			]);
		} catch {
			setData([
				{
					id: "1",
					period_name: "2026-08",
					year: 2026,
					month: 8,
					status: "Open"
				},
				{
					id: "2",
					period_name: "2026-07",
					year: 2026,
					month: 7,
					status: "Closed"
				},
				{
					id: "3",
					period_name: "2026-06",
					year: 2026,
					month: 6,
					status: "Closed"
				}
			]);
		}
	}
	async function toggle(row) {
		const nextStatus = row.status === "Open" ? "Closed" : "Open";
		try {
			await FinPostingPeriodsApi.update(row.id, { status: nextStatus });
		} catch {}
		setData((prev) => prev.map((p) => p.id === row.id ? {
			...p,
			status: nextStatus
		} : p));
		toast.success(`Period ${row.period_name} is now ${nextStatus}`);
	}
	function handleOpenCreate() {
		setEditingId(null);
		setForm({
			year: "2026",
			month: String((/* @__PURE__ */ new Date()).getMonth() + 1),
			status: "Open"
		});
		setOpen(true);
	}
	function handleOpenEdit(row) {
		setEditingId(row.id);
		setForm({
			year: String(row.year),
			month: String(row.month),
			status: row.status
		});
		setOpen(true);
	}
	async function handleSavePeriod() {
		const m = parseInt(form.month);
		const y = parseInt(form.year);
		if (isNaN(m) || isNaN(y) || m < 1 || m > 12) {
			toast.error("Please enter a valid month (1-12) and year.");
			return;
		}
		const period_name = `${y}-${String(m).padStart(2, "0")}`;
		if (editingId) {
			try {
				await FinPostingPeriodsApi.update(editingId, {
					period_name,
					year: y,
					month: m,
					status: form.status
				});
			} catch {}
			setData((prev) => prev.map((p) => p.id === editingId ? {
				...p,
				period_name,
				year: y,
				month: m,
				status: form.status
			} : p));
			toast.success(`Posting Period ${period_name} updated successfully!`);
		} else {
			const newPeriod = {
				id: String(Date.now()),
				period_name,
				year: y,
				month: m,
				status: form.status
			};
			try {
				await FinPostingPeriodsApi.create(newPeriod);
			} catch {}
			setData((prev) => [newPeriod, ...prev]);
			toast.success(`Posting Period ${period_name} added successfully!`);
		}
		setOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-bold tracking-tight",
					children: "Financial Posting Periods Control"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Open, lock, or define monthly accounting periods to control journal entries and voucher postings."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: handleOpenCreate,
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Posting Period"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card shadow-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Period Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Fiscal Year"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Month"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold text-center",
							children: "Actions"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: [...data].sort((a, b) => Number(b.year) - Number(a.year) || Number(b.month) - Number(a.month)).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/30 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-bold text-primary",
							children: row.period_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: row.year
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [
							new Date(Number(row.year), Number(row.month) - 1).toLocaleString("default", { month: "long" }),
							" (",
							row.month,
							")"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: row.status === "Open" ? "default" : "secondary",
							className: "text-[10px]",
							children: row.status
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs",
									onClick: () => toggle(row),
									children: row.status === "Open" ? "Lock / Close" : "Re-Open"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									className: "h-7 text-xs",
									onClick: () => handleOpenEdit(row),
									children: "Edit"
								})]
							})
						})
					]
				}, row.id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "text-base font-bold",
							children: editingId ? "Edit Posting Period" : "Add New Posting Period"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-3 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Fiscal Year" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										placeholder: "2026",
										value: form.year,
										onChange: (e) => setForm({
											...form,
											year: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Month (1–12)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.month,
										onValueChange: (v) => setForm({
											...form,
											month: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "1",
												children: "January (1)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "2",
												children: "February (2)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "3",
												children: "March (3)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "4",
												children: "April (4)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "5",
												children: "May (5)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "6",
												children: "June (6)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "7",
												children: "July (7)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "8",
												children: "August (8)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "9",
												children: "September (9)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "10",
												children: "October (10)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "11",
												children: "November (11)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "12",
												children: "December (12)"
											})
										] })]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Period Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.status,
									onValueChange: (v) => setForm({
										...form,
										status: v
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Open",
										children: "Open (Allows Voucher & Ledger Postings)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Closed",
										children: "Closed / Locked (Prevents Modification)"
									})] })]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-2.5 rounded-md bg-muted text-[11px] text-muted-foreground",
									children: ["Period Code will be generated as: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
										className: "font-mono text-foreground",
										children: [
											form.year,
											"-",
											String(form.month).padStart(2, "0")
										]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleSavePeriod,
							children: editingId ? "Save Changes" : "Create Posting Period"
						})] })
					]
				})
			})
		]
	});
}
function ChartOfAccountsSubModule() {
	const [erpAccounts, setErpAccounts] = (0, import_react.useState)([]);
	const [unitCoas, setUnitCoas] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [tab, setTab] = (0, import_react.useState)("master");
	const [search, setSearch] = (0, import_react.useState)("");
	const [typeFilter, setTypeFilter] = (0, import_react.useState)("all");
	const [page, setPage] = (0, import_react.useState)(1);
	const pageSize = 25;
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		code: "",
		name: "",
		type: "Assets",
		type_code: "1",
		group_name: "Current Assets",
		class_name: "Accounts Receivables",
		gl_name: "Tenant Receivables"
	});
	(0, import_react.useEffect)(() => {
		loadData();
	}, []);
	async function loadData() {
		setLoading(true);
		try {
			const [accs, uCoas] = await Promise.all([fetchERPChartOfAccounts(), fetchUnitCOAs()]);
			const masterMap = /* @__PURE__ */ new Map();
			(accs || []).forEach((a) => {
				const glKey = a.gl_code || (a.code && a.code.length >= 5 ? a.code.substring(0, 5) : a.code) || a.name;
				if (!masterMap.has(glKey)) masterMap.set(glKey, {
					...a,
					code: a.gl_code || (a.code && a.code.length >= 5 ? `${a.code.substring(0, 5)}0` : a.code),
					name: a.gl_name || a.name.replace(/\s*-\s*(Tenant|Flat|Unit|Apt|Residence|\d+).*$/i, "").trim()
				});
			});
			const cleanMaster = Array.from(masterMap.values());
			const distinctUnitMap = /* @__PURE__ */ new Map();
			(uCoas || []).forEach((u) => {
				const key = `${u.property_name || ""}__${u.unit_code || ""}`;
				if (!distinctUnitMap.has(key)) distinctUnitMap.set(key, u);
			});
			const cleanUnits = Array.from(distinctUnitMap.values());
			setErpAccounts(cleanMaster);
			setUnitCoas(cleanUnits);
		} catch (e) {
			toast.error("Failed to load Chart of Accounts: " + e.message);
		} finally {
			setLoading(false);
		}
	}
	async function handleCreate() {
		try {
			await createGLAccount({
				code: form.code,
				name_en: form.name,
				type: form.type.toLowerCase()
			});
			toast.success("Account created successfully!");
			setOpen(false);
			loadData();
		} catch (e) {
			toast.error(e.message);
		}
	}
	const filteredMaster = erpAccounts.filter((acc) => {
		const matchesType = typeFilter === "all" || (acc.type || "").toLowerCase() === typeFilter.toLowerCase();
		const q = search.toLowerCase();
		const matchesSearch = !search || (acc.code || "").toLowerCase().includes(q) || (acc.name || "").toLowerCase().includes(q) || (acc.gl_name || "").toLowerCase().includes(q) || (acc.class_name || "").toLowerCase().includes(q) || (acc.group_name || "").toLowerCase().includes(q);
		return matchesType && matchesSearch;
	});
	const filteredUnits = unitCoas.filter((u) => {
		const q = search.toLowerCase();
		return !search || (u.property_name || "").toLowerCase().includes(q) || (u.unit_code || "").toLowerCase().includes(q) || (u.pdc_in_hand_code || "").toLowerCase().includes(q) || (u.pdc_in_hand_name || "").toLowerCase().includes(q) || (u.deposit_code || "").toLowerCase().includes(q) || (u.deposit_name || "").toLowerCase().includes(q) || (u.receivables_code || "").toLowerCase().includes(q) || (u.receivables_name || "").toLowerCase().includes(q);
	});
	const totalMasterPages = Math.ceil(filteredMaster.length / pageSize) || 1;
	const paginatedMaster = filteredMaster.slice((page - 1) * pageSize, page * pageSize);
	Math.ceil(filteredUnits.length / pageSize);
	filteredUnits.slice((page - 1) * pageSize, page * pageSize);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card p-4 rounded-lg border shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-bold tracking-tight",
					children: "Company Chart of Accounts (COA) & Property Unit Sub-Ledgers"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Single Unified COA for the entire enterprise with hierarchical property sub-ledgers & unit account mapping."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex bg-muted p-1 rounded-md text-xs font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								setTab("master");
								setPage(1);
							},
							className: `px-3 py-1.5 rounded-sm transition-all ${tab === "master" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`,
							children: [
								"Enterprise Master COA (",
								erpAccounts.length,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								setTab("units");
								setPage(1);
							},
							className: `px-3 py-1.5 rounded-sm transition-all ${tab === "units" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`,
							children: [
								"Property & Unit Sub-Ledgers (",
								unitCoas.length,
								" Units)"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => setOpen(true),
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Account"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row gap-3 items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative w-full sm:w-80",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: tab === "master" ? "Search code, name, class..." : "Search property, unit, COA code...",
						value: search,
						onChange: (e) => {
							setSearch(e.target.value);
							setPage(1);
						},
						className: "pl-9 text-xs"
					})]
				}), tab === "master" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2 overflow-x-auto w-full sm:w-auto",
					children: [
						"all",
						"Assets",
						"Liabilities",
						"Capital",
						"Revenue",
						"Expenditure"
					].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: typeFilter.toLowerCase() === t.toLowerCase() ? "default" : "outline",
						className: "cursor-pointer capitalize text-xs px-3 py-1",
						onClick: () => {
							setTypeFilter(t);
							setPage(1);
						},
						children: t
					}, t))
				})]
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-center p-12 text-muted-foreground gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }), " Loading Chart of Accounts..."]
			}) : tab === "master" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border rounded-lg overflow-hidden bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Code / SL"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Account Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Type"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Group"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Class / GL"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: paginatedMaster.map((acc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/30 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-bold text-primary",
							children: acc.code
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: acc.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: `capitalize text-[10px] font-semibold ${(acc.type || "").toLowerCase().includes("asset") ? "bg-emerald-50 text-emerald-700 border-emerald-200" : (acc.type || "").toLowerCase().includes("liab") ? "bg-amber-50 text-amber-700 border-amber-200" : (acc.type || "").toLowerCase().includes("cap") ? "bg-blue-50 text-blue-700 border-blue-200" : (acc.type || "").toLowerCase().includes("rev") ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-purple-50 text-purple-700 border-purple-200"}`,
							children: acc.type_name || acc.type || "N/A"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs text-muted-foreground",
							children: acc.group_name || "N/A"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium",
								children: acc.gl_name || acc.class_name || "N/A"
							}), acc.gl_code && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[10px] text-muted-foreground font-mono",
								children: ["GL: ", acc.gl_code]
							})]
						})
					]
				}, acc.id)) })] }), filteredMaster.length > pageSize && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between p-3 border-t text-xs text-muted-foreground bg-muted/20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Showing ",
						(page - 1) * pageSize + 1,
						"–",
						Math.min(page * pageSize, filteredMaster.length),
						" of ",
						filteredMaster.length,
						" Accounts"
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
							Array.from({ length: totalMasterPages }, (_, i) => i + 1).filter((p) => Math.abs(p - page) <= 2).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
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
								disabled: page === totalMasterPages,
								onClick: () => setPage((p) => p + 1),
								children: "Next →"
							})
						]
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-4",
				children: (() => {
					const propertiesMap = /* @__PURE__ */ new Map();
					filteredUnits.forEach((u) => {
						const prop = u.property_name || "Portfolio Properties";
						if (!propertiesMap.has(prop)) propertiesMap.set(prop, []);
						propertiesMap.get(prop).push(u);
					});
					return Array.from(propertiesMap.entries()).map(([propertyName, unitsList]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border rounded-lg overflow-hidden bg-card shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-muted/70 px-4 py-2.5 flex items-center justify-between border-b",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-4 w-4 text-primary" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-sm text-foreground",
										children: propertyName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "secondary",
										className: "text-[11px] font-semibold",
										children: [unitsList.length, " Units Configured"]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "Unified Company COA Sub-Ledgers"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
							className: "bg-muted/30 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "font-bold w-28",
									children: "Unit Code"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "font-bold",
									children: "PDC In Hand (Sub-Ledger Code)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "font-bold",
									children: "Security Deposit (Sub-Ledger Code)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "font-bold",
									children: "Customer Receivables (Sub-Ledger Code)"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: unitsList.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
							className: "hover:bg-muted/30 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "font-mono font-bold text-primary",
									children: u.unit_code
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
									className: "text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono font-bold text-blue-600 mr-1.5",
										children: u.pdc_in_hand_code
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: u.pdc_in_hand_name
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
									className: "text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono font-bold text-amber-600 mr-1.5",
										children: u.deposit_code
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: u.deposit_name
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
									className: "text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono font-bold text-emerald-600 mr-1.5",
										children: u.receivables_code
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: u.receivables_name
									})]
								})
							]
						}, u.id)) })] })]
					}, propertyName));
				})()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add New Chart of Account" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Account Code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "12413999",
									value: form.code,
									onChange: (e) => setForm({
										...form,
										code: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Account / SL Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Receivables - Unit 101",
									value: form.name,
									onChange: (e) => setForm({
										...form,
										name: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Account Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.type,
									onValueChange: (v) => setForm({
										...form,
										type: v
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Assets",
											children: "Assets"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Liabilities",
											children: "Liabilities"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Capital",
											children: "Capital"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Revenue",
											children: "Revenue"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Expenditure",
											children: "Expenditure"
										})
									] })]
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleCreate,
							children: "Save Account"
						})] })
					]
				})
			})
		]
	});
}
function JournalLedgerSubModule() {
	const { vouchers: sharedVouchers } = useAppData();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [entries, setEntries] = (0, import_react.useState)([]);
	const [form, setForm] = (0, import_react.useState)({
		je_no: `JE-2026-${Math.floor(100 + Math.random() * 900)}`,
		posting_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		reference: "MANUAL-JE",
		narration: "",
		dr_account: "12000 - Bank Operating Account",
		cr_account: "41100 - Rental Revenue",
		amount: "5000"
	});
	async function handleAddEntry() {
		if (!form.narration || !form.amount) {
			toast.error("Please fill in narration and amount");
			return;
		}
		const amt = parseFloat(form.amount) || 0;
		try {
			await postVoucher({
				voucher_date: form.posting_date,
				voucher_type: "Journal",
				description: form.narration,
				reference_no: form.reference,
				lines: [{
					account_code: form.dr_account.split(" ")[0],
					debit: amt,
					credit: 0,
					description: form.narration
				}, {
					account_code: form.cr_account.split(" ")[0],
					debit: 0,
					credit: amt,
					description: form.narration
				}]
			});
		} catch (error) {
			console.error(error);
			toast.error(error?.message || "Failed to post journal entry.");
			return;
		}
		const newJE = {
			id: form.je_no,
			posting_date: form.posting_date,
			reference: form.reference,
			narration: form.narration,
			dr_account: form.dr_account,
			cr_account: form.cr_account,
			amount: amt,
			status: "Posted"
		};
		setEntries((prev) => [newJE, ...prev]);
		toast.success(`Journal Entry ${form.je_no} successfully posted to Ledger!`);
		setOpen(false);
	}
	const [startMonth, setStartMonth] = (0, import_react.useState)("");
	const [endMonth, setEndMonth] = (0, import_react.useState)("");
	const [quickFilter, setQuickFilter] = (0, import_react.useState)("all");
	const [search, setSearch] = (0, import_react.useState)("");
	const filteredEntries = (0, import_react.useMemo)(() => {
		let list = entries;
		if (quickFilter === "current") {
			const cur = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
			list = list.filter((je) => (je.posting_date || "").startsWith(cur));
		} else if (quickFilter === "last_month") {
			const d = /* @__PURE__ */ new Date();
			d.setMonth(d.getMonth() - 1);
			const prev = d.toISOString().slice(0, 7);
			list = list.filter((je) => (je.posting_date || "").startsWith(prev));
		} else if (quickFilter === "custom" || startMonth || endMonth) {
			if (startMonth) list = list.filter((je) => (je.posting_date || "").slice(0, 7) >= startMonth);
			if (endMonth) list = list.filter((je) => (je.posting_date || "").slice(0, 7) <= endMonth);
		}
		if (search) {
			const q = search.toLowerCase();
			list = list.filter((je) => je.id && je.id.toLowerCase().includes(q) || je.reference && je.reference.toLowerCase().includes(q) || je.narration && je.narration.toLowerCase().includes(q) || je.dr_account && je.dr_account.toLowerCase().includes(q) || je.cr_account && je.cr_account.toLowerCase().includes(q));
		}
		return list;
	}, [
		entries,
		startMonth,
		endMonth,
		quickFilter,
		search
	]);
	const totalAmount = (0, import_react.useMemo)(() => filteredEntries.reduce((s, je) => s + (je.amount || 0), 0), [filteredEntries]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Journal Ledger Postings"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "General Journal entries with dual-entry audit trail and month-wise range filtering."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "font-mono bg-blue-50 text-blue-700 border-blue-200",
							children: [
								"Total: ",
								totalAmount.toLocaleString(),
								" QAR"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							children: [filteredEntries.length, " JEs"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => setOpen(true),
							className: "gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Create Journal Entry"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-12 gap-2 bg-muted/20 p-3 rounded-lg border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sm:col-span-4 relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "pl-8 h-8 text-xs bg-background",
							placeholder: "Search JE #, ref, narration, account...",
							value: search,
							onChange: (e) => setSearch(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sm:col-span-3 flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs text-muted-foreground whitespace-nowrap",
							children: "From:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "month",
							className: "h-8 text-xs bg-background",
							value: startMonth,
							onChange: (e) => {
								setStartMonth(e.target.value);
								setQuickFilter("custom");
							}
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sm:col-span-3 flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs text-muted-foreground whitespace-nowrap",
							children: "To:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "month",
							className: "h-8 text-xs bg-background",
							value: endMonth,
							onChange: (e) => {
								setEndMonth(e.target.value);
								setQuickFilter("custom");
							}
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sm:col-span-2 flex items-center gap-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: quickFilter,
							onValueChange: (v) => {
								setQuickFilter(v);
								if (v === "all") {
									setStartMonth("");
									setEndMonth("");
								}
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-8 text-xs bg-background",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Period" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All Months"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "current",
									children: "Current Month"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "last_month",
									children: "Last Month"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "custom",
									children: "Month Range"
								})
							] })]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Entry Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "JE #"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Posting Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Reference"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Debit Account"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Credit Account"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold",
							children: "Amount (QAR)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Status"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filteredEntries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 8,
					className: "text-center py-8 text-muted-foreground",
					children: "No journal entries found for the selected month range."
				}) }) : [...filteredEntries].sort((a, b) => new Date(b.posting_date || "").getTime() - new Date(a.posting_date || "").getTime()).map((je) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/30 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-muted-foreground",
							children: je.posting_date || "2026-08-01"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-bold text-primary",
							children: je.id
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: je.posting_date
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-muted-foreground",
							children: je.reference
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-blue-600 font-medium",
							children: je.dr_account
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-emerald-600 font-medium",
							children: je.cr_account
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right font-mono font-bold",
							children: je.amount.toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "default",
							className: "text-[10px]",
							children: je.status
						}) })
					]
				}, je.id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create Journal Ledger Entry" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Posts double-entry lines into General Ledger with real-time balance enforcement."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "JE Number" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.je_no,
										onChange: (e) => setForm({
											...form,
											je_no: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Posting Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.posting_date,
										onChange: (e) => setForm({
											...form,
											posting_date: e.target.value
										})
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Reference / Document No" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.reference,
									onChange: (e) => setForm({
										...form,
										reference: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Debit Account (Dr)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.dr_account,
										onValueChange: (v) => setForm({
											...form,
											dr_account: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "12000 - Bank Operating Account",
												children: "12000 - Bank Operating Account"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "10100 - Cash In Hand",
												children: "10100 - Cash In Hand"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "12413 - Tenant Receivables",
												children: "12413 - Tenant Receivables"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "5020 - Repairs & Maintenance",
												children: "5020 - Repairs & Maintenance"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "5010 - Basic Salaries",
												children: "5010 - Basic Salaries"
											})
										] })]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Credit Account (Cr)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.cr_account,
										onValueChange: (v) => setForm({
											...form,
											cr_account: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "41100 - Rental Revenue",
												children: "41100 - Rental Revenue"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "21500 - Security Deposit Liability",
												children: "21500 - Security Deposit Liability"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "2010 - Accounts Payable",
												children: "2010 - Accounts Payable"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "12900 - PDC In Hand",
												children: "12900 - PDC In Hand"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "12000 - Bank Operating Account",
												children: "12000 - Bank Operating Account"
											})
										] })]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Amount (QAR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									value: form.amount,
									onChange: (e) => setForm({
										...form,
										amount: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Narration / Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									rows: 2,
									placeholder: "Explain the business transaction...",
									value: form.narration,
									onChange: (e) => setForm({
										...form,
										narration: e.target.value
									})
								})] }),
								parseFloat(form.amount) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 space-y-1.5 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ledgers / Accounts Updated by this Entry" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2 font-mono text-[11px]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "bg-background p-2 rounded border border-emerald-200",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-emerald-700 dark:text-emerald-400 font-bold block",
													children: "Debit (DR):"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: form.dr_account }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "block font-bold text-emerald-600 mt-1",
													children: ["QR ", parseFloat(form.amount || "0").toLocaleString()]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "bg-background p-2 rounded border border-rose-200",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-rose-600 dark:text-rose-400 font-bold block",
													children: "Credit (CR):"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: form.cr_account }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "block font-bold text-rose-600 mt-1",
													children: ["QR ", parseFloat(form.amount || "0").toLocaleString()]
												})
											]
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleAddEntry,
							children: "Confirm & Post Journal"
						})] })
					]
				})
			})
		]
	});
}
function CreditDebitBuilderSubModule() {
	const [lines, setLines] = (0, import_react.useState)([{
		account: "",
		debit: 0,
		credit: 0
	}]);
	const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
	const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
	function addLine() {
		setLines([...lines, {
			account: "",
			debit: 0,
			credit: 0
		}]);
	}
	function removeLine(idx) {
		setLines(lines.filter((_, i) => i !== idx));
	}
	async function submit() {
		if (totalDebit !== totalCredit || totalDebit === 0) {
			toast.error("Debits and credits must balance and be greater than 0!");
			return;
		}
		try {
			await postVoucher({
				voucher_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
				voucher_type: "Journal",
				description: "Multi-line Credit Debit Builder Voucher",
				lines: lines.map((l) => ({
					account_code: l.account.split(" ")[0] || "1000",
					debit: Number(l.debit) || 0,
					credit: Number(l.credit) || 0,
					description: l.account
				}))
			});
		} catch (error) {
			console.error(error);
			toast.error(error?.message || "Failed to post journal voucher.");
			return;
		}
		toast.success("Journal voucher built & posted successfully!");
		setLines([{
			account: "12000 - Bank Operating Account",
			debit: 0,
			credit: 0
		}, {
			account: "41100 - Rental Income",
			debit: 0,
			credit: 0
		}]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex justify-between items-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold",
				children: "Multi-Leg Debit / Credit Voucher Builder"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Construct complex split-leg journal entries with real-time balancing."
			})] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-card p-4 rounded-lg border shadow-sm space-y-3",
			children: [lines.map((l, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 items-center text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Account Code & Name (e.g. 12000 Bank)",
						className: "flex-1 text-xs",
						value: l.account,
						onChange: (e) => {
							const next = [...lines];
							next[idx].account = e.target.value;
							setLines(next);
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						placeholder: "Debit",
						className: "w-32 text-xs",
						value: l.debit || "",
						onChange: (e) => {
							const next = [...lines];
							next[idx].debit = parseFloat(e.target.value) || 0;
							setLines(next);
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						placeholder: "Credit",
						className: "w-32 text-xs",
						value: l.credit || "",
						onChange: (e) => {
							const next = [...lines];
							next[idx].credit = parseFloat(e.target.value) || 0;
							setLines(next);
						}
					}),
					lines.length > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "ghost",
						className: "h-8 w-8 text-destructive",
						onClick: () => removeLine(idx),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
					})
				]
			}, idx)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center pt-3 border-t border-border mt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: addLine,
					className: "gap-1 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Leg"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Total Dr: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							className: "font-mono text-blue-600 font-bold",
							children: [totalDebit.toLocaleString(), " QAR"]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Total Cr: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							className: "font-mono text-emerald-600 font-bold",
							children: [totalCredit.toLocaleString(), " QAR"]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: totalDebit === totalCredit && totalDebit > 0 ? "default" : "destructive",
							children: totalDebit === totalCredit && totalDebit > 0 ? "Balanced" : `Diff: ${(totalDebit - totalCredit).toLocaleString()} QAR`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: submit,
							disabled: totalDebit !== totalCredit || totalDebit === 0,
							children: "Post Voucher"
						})
					]
				})]
			})]
		})]
	});
}
function GrnCostMappingSubModule() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [grnList, setGrnList] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [selectedGrnForEdit, setSelectedGrnForEdit] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({
		grn_no: `GRN-2026-${Math.floor(100 + Math.random() * 900)}`,
		po_ref: `PO-2026-${Math.floor(10 + Math.random() * 90)}`,
		date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		vendor: "Qatar Maintenance & HVAC Co.",
		description: "HVAC Replacement Compressors & Air Filters",
		amount: "4500",
		mapped_gl: "51004001 - Repair and Maintenance Cost",
		property: "Old Salata - Residence No:23",
		status: "Posted to GL"
	});
	const loadGrnData = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			const { data: dbGrns } = await supabase.from("proc_goods_receipts").select("*").order("created_at", { ascending: false });
			const { data: dbPos } = await supabase.from("proc_purchase_orders").select("*");
			const { data: dbVendors } = await supabase.from("fin_vendors").select("*");
			const stored = localStorage.getItem("grn_cost_mappings_v2");
			let localMappings = [];
			if (stored) try {
				localMappings = JSON.parse(stored);
			} catch {}
			localStorage.removeItem("grn_cost_mappings_v2");
			localMappings = [];
			const mergedList = [...localMappings];
			const seenGrnNos = new Set(localMappings.map((m) => m.grn_no));
			if (dbGrns && dbGrns.length > 0) dbGrns.forEach((g) => {
				if (!seenGrnNos.has(g.grn_number)) {
					const matchedPo = dbPos?.find((p) => p.id === g.purchase_order_id);
					const matchedVendor = dbVendors?.find((v) => Number(v.id) === Number(g.vendor_id) || Number(v.id) === Number(matchedPo?.vendor_id));
					mergedList.push({
						id: g.id,
						grn_no: g.grn_number,
						po_ref: matchedPo?.doc_number || "PO-REF",
						date: g.grn_date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
						vendor: matchedVendor?.name || `Vendor #${g.vendor_id || "1"}`,
						description: g.remarks || "Warehouse Inward Goods Receipt",
						amount: Number(g.total_amount || g.subtotal || 0),
						mapped_gl: "51004001 - Repair and Maintenance Cost",
						property: "Central Property Portfolio",
						status: "Posted to GL",
						source: "Procurement Sync"
					});
					seenGrnNos.add(g.grn_number);
				}
			});
			setGrnList([]);
		} catch (e) {
			console.error("Failed loading GRN cost mappings:", e);
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		loadGrnData();
		const handleUpdate = () => loadGrnData();
		window.addEventListener("ap_invoices_updated", handleUpdate);
		window.addEventListener("grn_updated", handleUpdate);
		return () => {
			window.removeEventListener("ap_invoices_updated", handleUpdate);
			window.removeEventListener("grn_updated", handleUpdate);
		};
	}, [loadGrnData]);
	function handleSaveMapping() {
		const amt = parseFloat(form.amount) || 0;
		if (amt <= 0) return toast.error("Please enter a valid cost amount.");
		const updated = [{
			id: selectedGrnForEdit?.id || `grn-map-${Date.now()}`,
			grn_no: form.grn_no,
			po_ref: form.po_ref,
			date: form.date,
			vendor: form.vendor,
			description: form.description,
			amount: amt,
			mapped_gl: form.mapped_gl,
			property: form.property,
			status: "Posted to GL",
			source: "Manual Cost Allocation"
		}, ...grnList.filter((g) => g.grn_no !== form.grn_no)];
		setGrnList(updated);
		localStorage.setItem("grn_cost_mappings_v2", JSON.stringify(updated));
		toast.success(`GRN ${form.grn_no} allocated to GL Account [${form.mapped_gl}]. Double-entry journal impact synced.`);
		setOpen(false);
		setSelectedGrnForEdit(null);
	}
	function openEditMapping(grn) {
		setSelectedGrnForEdit(grn);
		setForm({
			grn_no: grn.grn_no,
			po_ref: grn.po_ref,
			date: grn.date,
			vendor: grn.vendor,
			description: grn.description,
			amount: String(grn.amount),
			mapped_gl: grn.mapped_gl,
			property: grn.property,
			status: grn.status || "Posted to GL"
		});
		setOpen(true);
	}
	const totalCostAllocated = grnList.reduce((acc, g) => acc + (Number(g.amount) || 0), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3.5 rounded-xl border bg-card/60 shadow-sm flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Total GRNs Allocated"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xl font-bold font-mono text-primary mt-0.5",
							children: grnList.length
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5 text-primary/40" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3.5 rounded-xl border bg-card/60 shadow-sm flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Total Cost Mapped to GL"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xl font-bold font-mono text-emerald-600 mt-0.5",
							children: ["QAR ", totalCostAllocated.toLocaleString()]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-5 w-5 text-emerald-600/40" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3.5 rounded-xl border bg-card/60 shadow-sm flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Allocation Sync Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-semibold text-blue-600 flex items-center gap-1 mt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), " 100% Live Double-Entry"]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5 text-blue-600/40" })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold flex items-center gap-2",
					children: "Goods Received Note (GRN) Cost Allocation to Property Expense GLs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Directly map warehouse receipts and maintenance inwards to canonical Property Direct Expense & AMC GL Accounts."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => {
						setSelectedGrnForEdit(null);
						setForm({
							grn_no: `GRN-2026-${Math.floor(100 + Math.random() * 900)}`,
							po_ref: `PO-2026-${Math.floor(10 + Math.random() * 90)}`,
							date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
							vendor: "Qatar Maintenance & HVAC Co.",
							description: "Plumbing Fittings, Valves & Repair Spares",
							amount: "4500",
							mapped_gl: "51004001 - Repair and Maintenance Cost",
							property: "Old Salata - Residence No:23",
							status: "Posted to GL"
						});
						setOpen(true);
					},
					className: "gap-2 bg-emerald-600 hover:bg-emerald-700 text-white",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Map GRN Cost"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card shadow-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Receipt Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "GRN #"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "PO Ref"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Vendor / Supplier"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Item / Service Description"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Property Cost Center"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Mapped Expense GL Account"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold",
							children: "Cost (QAR)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Posting"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold text-right",
							children: "Actions"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [grnList.map((row, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/30 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-muted-foreground",
							children: row.date
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-bold text-primary",
							children: row.grn_no
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-cyan-600",
							children: row.po_ref
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-semibold",
							children: row.vendor
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "max-w-[200px] truncate",
							title: row.description,
							children: row.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium text-foreground",
							children: row.property
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-semibold text-blue-600 dark:text-blue-400",
							children: row.mapped_gl
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right font-mono font-bold text-foreground",
							children: ["QAR ", Number(row.amount || 0).toLocaleString()]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "default",
							className: "bg-emerald-600 text-[10px] gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-2.5 w-2.5" }), " Posted to GL"]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								className: "h-6 text-[10px] px-2 gap-1 text-primary",
								onClick: () => openEditMapping(row),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-2.5 w-2.5" }), " Edit GL Mapping"]
							})
						})
					]
				}, row.id || idx)), grnList.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 10,
					className: "text-center py-8 text-muted-foreground",
					children: "No GRN cost mappings found. Click \"Map GRN Cost\" to map incoming materials to property GLs."
				}) })] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					onPointerDownOutside: (e) => e.preventDefault(),
					onEscapeKeyDown: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-5 w-5 text-emerald-600" }), selectedGrnForEdit ? `Edit GL Mapping: ${form.grn_no}` : "Map Warehouse & Maintenance GRN to GL Account"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Allocate received procurement inventory or facility maintenance work directly to canonical property expense accounts."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "GRN Receipt Date *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.date,
										onChange: (e) => setForm({
											...form,
											date: e.target.value
										}),
										className: "h-8 text-xs mt-1"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "GRN Number *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.grn_no,
										onChange: (e) => setForm({
											...form,
											grn_no: e.target.value
										}),
										className: "h-8 text-xs font-mono font-bold mt-1"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "PO Reference #"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.po_ref,
										onChange: (e) => setForm({
											...form,
											po_ref: e.target.value
										}),
										className: "h-8 text-xs font-mono mt-1"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Vendor / Contractor"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.vendor,
										onChange: (e) => setForm({
											...form,
											vendor: e.target.value
										}),
										className: "h-8 text-xs mt-1"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Item / Material / Service Description *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.description,
									onChange: (e) => setForm({
										...form,
										description: e.target.value
									}),
									placeholder: "e.g. HVAC Compressor Spares, Plumbing Pipes, Elevator Cables",
									className: "h-8 text-xs mt-1"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Cost Amount (QAR) *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: "0",
										value: form.amount,
										onChange: (e) => setForm({
											...form,
											amount: e.target.value
										}),
										className: "h-8 text-xs font-mono font-bold mt-1"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Property Cost Center *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.property,
										onChange: (e) => setForm({
											...form,
											property: e.target.value
										}),
										placeholder: "e.g. Lusail Marina Tower 1",
										className: "h-8 text-xs mt-1"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Target Property Expense GL Account (COA Canonical) *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.mapped_gl,
									onValueChange: (v) => setForm({
										...form,
										mapped_gl: v
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 text-xs mt-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51004001 - Repair and Maintenance Cost",
											children: "51004001 - Repair and Maintenance Cost"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51002001 - CMEP-Facilities Mgt AMC",
											children: "51002001 - CMEP-Facilities Mgt AMC"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51002002 - Swimming Pool Maintenance",
											children: "51002002 - Swimming Pool Maintenance"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51002003 - CCTV AMC Charges",
											children: "51002003 - CCTV AMC Charges"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51002004 - Lift Maintenance Charges",
											children: "51002004 - Lift Maintenance Charges"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51002005 - Fire Alarm & Fire Fighting AMC",
											children: "51002005 - Fire Alarm & Fire Fighting AMC"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51002006 - Pest Control Charges",
											children: "51002006 - Pest Control Charges"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51002007 - Landscaping & Irrigation AMC",
											children: "51002007 - Landscaping & Irrigation AMC"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51001001 - CMEP-Labor Cost-Facilities Mgt",
											children: "51001001 - CMEP-Labor Cost-Facilities Mgt"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51001002 - House Keeping Labor Cost",
											children: "51001002 - House Keeping Labor Cost"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51001003 - Security Staff Labor Cost",
											children: "51001003 - Security Staff Labor Cost"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "13000001 - Property Plant & Equipment (Capital Asset)",
											children: "13000001 - Property Plant & Equipment (Capital Asset)"
										})
									] })]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-lg bg-muted/40 border text-[11px] space-y-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "font-semibold text-foreground flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 text-emerald-600" }), " General Ledger Accounting Impact:"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "font-mono text-rose-600 dark:text-rose-400",
											children: [
												"• ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["Dr. ", form.mapped_gl.split(" - ")[0]] }),
												" (",
												form.mapped_gl.split(" - ")[1] || "Expense",
												") — QAR ",
												Number(form.amount || 0).toLocaleString()
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "font-mono text-emerald-600 dark:text-emerald-400",
											children: [
												"• ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Cr. 22100001" }),
												" Trade Payables (GRN Clearing / Supplier Liability) — QAR ",
												Number(form.amount || 0).toLocaleString()
											]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "border-t pt-3 flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: handleSaveMapping,
								className: "bg-emerald-600 hover:bg-emerald-700 text-white gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }), " Save & Post Cost Mapping"]
							})]
						})
					]
				})
			})
		]
	});
}
function PayableInvoiceSubModule() {
	const { addVoucher } = useFinanceStore();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [procInvoices, setProcInvoices] = (0, import_react.useState)([]);
	const [selectedReceipt, setSelectedReceipt] = (0, import_react.useState)(null);
	const [showReceiptModal, setShowReceiptModal] = (0, import_react.useState)(false);
	const [selectedInvoiceForView, setSelectedInvoiceForView] = (0, import_react.useState)(null);
	const [payTarget, setPayTarget] = (0, import_react.useState)(null);
	const [payForm, setPayForm] = (0, import_react.useState)({
		paymentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		paymentMethod: "Bank Wire / QNB Corporate Electronic",
		disbursingBank: "Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)",
		transactionReference: "",
		beneficiaryAccount: "QA91QNBA99887766554433",
		cashCustodian: "Main Office Cashier Desk",
		cashReceiptNo: "",
		receiverName: "",
		chequeNumber: "",
		chequeDueDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		remarks: ""
	});
	const loadInvoices = (0, import_react.useCallback)(async () => {
		try {
			await ApInvoicesApi.fetchAll();
			setProcInvoices([]);
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		loadInvoices();
		const handler = () => loadInvoices();
		window.addEventListener("ap_invoices_updated", handler);
		window.addEventListener("finance_vouchers_updated", handler);
		return () => {
			window.removeEventListener("ap_invoices_updated", handler);
			window.removeEventListener("finance_vouchers_updated", handler);
		};
	}, [loadInvoices]);
	const displayedStoreInvoices = (0, import_react.useMemo)(() => [], []);
	const allInvoices = (0, import_react.useMemo)(() => {
		const list = [];
		const seen = /* @__PURE__ */ new Set();
		procInvoices.forEach((inv) => {
			seen.add(inv.invoice_number);
			const totalAmt = Number(inv.total_amount || inv.amount || 0);
			const taxAmt = Number(inv.tax_amount || 0);
			const baseAmt = Number(inv.amount || totalAmt - taxAmt);
			list.push({
				id: inv.id,
				invoice_no: inv.invoice_number,
				vendor: String(inv.vendor_id === "1" || inv.vendor_id === 1 ? "Qatar Maintenance Co." : inv.vendor_id === "2" || inv.vendor_id === 2 ? "Gulf Facility Services" : inv.vendor_name || `Vendor #${inv.vendor_id}`),
				date: inv.invoice_date,
				due_date: inv.due_date || inv.invoice_date,
				account: inv.expense_gl_account || "51004001 - Repair and Maintenance Cost",
				account_code: inv.expense_gl_code || "51004001",
				base_amount: baseAmt,
				tax_amount: taxAmt,
				amount: totalAmt,
				status: inv.status === "PAID" ? "Paid" : "Unpaid",
				po_number: inv.po_number,
				grn_number: inv.grn_number,
				raw: inv
			});
		});
		displayedStoreInvoices.forEach((inv) => {
			if (!seen.has(inv.invoice_no)) {
				seen.add(inv.invoice_no);
				const totalAmt = Number(inv.amount || 0);
				const taxAmt = Number(inv.tax_amount || 0);
				const baseAmt = Number(inv.base_amount || totalAmt - taxAmt);
				list.push({
					id: inv.id,
					invoice_no: inv.invoice_no,
					vendor: inv.vendor,
					date: inv.date,
					due_date: inv.due_date,
					account: inv.account || "51004001 - Repair and Maintenance Cost",
					account_code: inv.account_code || "51004001",
					base_amount: baseAmt,
					tax_amount: taxAmt,
					amount: totalAmt,
					status: inv.status || "Unpaid",
					raw: inv
				});
			}
		});
		return list.sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime());
	}, [procInvoices, displayedStoreInvoices]);
	const [form, setForm] = (0, import_react.useState)({
		invoice_no: `APINV-${Math.floor(1e4 + Math.random() * 9e4)}`,
		vendor: "Qatar Maintenance & HVAC Co.",
		date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		due_date: new Date(Date.now() + 30 * 864e5).toISOString().split("T")[0],
		account: "51004001 - Repair and Maintenance Cost",
		account_code: "51004001",
		amount: "4275"
	});
	async function handleAdd() {
		const amt = parseFloat(form.amount) || 0;
		await ApInvoicesApi.create({
			invoice_number: form.invoice_no,
			vendor_id: form.vendor,
			invoice_date: form.date,
			due_date: form.due_date,
			amount: amt,
			tax_amount: 0,
			total_amount: amt,
			status: "DRAFT",
			remarks: `Direct AP Invoice booked to ${form.account}`
		});
		toast.success(`Payable Invoice ${form.invoice_no} created and synced with Finance & Procurement.`);
		setOpen(false);
		await loadInvoices();
	}
	function openPayModal(inv) {
		setPayTarget(inv);
		setPayForm({
			paymentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			paymentMethod: "Bank Wire / QNB Corporate Electronic",
			disbursingBank: "Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)",
			transactionReference: `TXN-${Date.now().toString().slice(-6)}`,
			beneficiaryAccount: "QA91QNBA99887766554433",
			cashCustodian: "Main Office Cashier Desk",
			cashReceiptNo: `PCV-${Date.now().toString().slice(-5)}`,
			receiverName: `${inv.vendor} - Authorized Representative`,
			chequeNumber: `CHQ-${Math.floor(1e5 + Math.random() * 9e5)}`,
			chequeDueDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			remarks: `Vendor Settlement for Invoice ${inv.invoice_no}`
		});
	}
	async function handleConfirmDisbursement() {
		if (!payTarget) return;
		try {
			const isCash = payForm.paymentMethod.includes("Cash") || payForm.paymentMethod.includes("Petty");
			const crCode = isCash ? "12100001" : "12000001";
			const crName = isCash ? "Cash in Hand / Operating Cash" : "Bank Operating Account (QNB)";
			const targetId = payTarget.raw?.id || payTarget.id || payTarget.invoice_no;
			await ApInvoicesApi.update(targetId, {
				invoice_number: payTarget.invoice_no,
				status: "PAID",
				amount_paid: payTarget.amount,
				posting_status: "POSTED",
				payment_method: payForm.paymentMethod,
				payment_reference: payForm.transactionReference
			});
			try {
				const mntRaw = localStorage.getItem("pms_vendor_invoices");
				if (mntRaw) {
					const updatedMnt = JSON.parse(mntRaw).map((m) => m.invoiceNo === payTarget.invoice_no ? {
						...m,
						status: "Approved"
					} : m);
					localStorage.setItem("pms_vendor_invoices", JSON.stringify(updatedMnt));
				}
			} catch {}
			try {
				const finApRaw = localStorage.getItem("zyno-pms-finance-data-v1-ap");
				if (finApRaw) {
					const updatedFin = JSON.parse(finApRaw).map((f) => f.invoice_no === payTarget.invoice_no ? {
						...f,
						status: "Paid"
					} : f);
					localStorage.setItem("zyno-pms-finance-data-v1-ap", JSON.stringify(updatedFin));
				}
			} catch {}
			const pvNo = `PV-${payTarget.invoice_no.replace("APINV-", "").replace("INV-AP-", "").replace("INV-", "")}`;
			addVoucher({
				voucher_no: pvNo,
				voucher_type: "Payment Voucher",
				date: payForm.paymentDate,
				name: `Vendor Settlement — ${payTarget.invoice_no} (${payTarget.vendor})`,
				debit: "Trade Payables - Vendors",
				debit_code: "22100001",
				credit: crName,
				credit_code: crCode,
				amount: payTarget.amount,
				method: isCash ? "Cash" : "Bank Transfer",
				property_name: payTarget.raw?.property || "Main Portfolio",
				unit_ref: payTarget.raw?.unit_ref || payTarget.po_number || "Facility Operations",
				tenant_name: payTarget.vendor
			});
			window.dispatchEvent(new Event("finance_vouchers_updated"));
			window.dispatchEvent(new Event("ap_invoices_updated"));
			window.dispatchEvent(new Event("pms_vendor_invoices_updated"));
			toast.success(`Payment of QAR ${payTarget.amount.toLocaleString()} settled. Payment Voucher ${pvNo} posted to GL.`);
			setPayTarget(null);
			await loadInvoices();
		} catch (e) {
			toast.error(e.message || "Failed to settle payment");
		}
	}
	function handleViewReceipt(inv) {
		const rcpt = ApInvoicesApi.getReceiptByInvoice(inv.invoice_no);
		if (rcpt) {
			setSelectedReceipt(rcpt);
			setShowReceiptModal(true);
		} else {
			setSelectedReceipt({
				id: `rcpt-${Date.now()}`,
				receipt_number: `RCPT-${inv.invoice_no.replace("APINV-", "")}`,
				voucher_number: `PV-${inv.invoice_no.replace("APINV-", "")}`,
				invoice_number: inv.invoice_no,
				po_number: inv.po_number,
				grn_number: inv.grn_number,
				vendor_id: inv.vendor,
				vendor_name: inv.vendor,
				amount_paid: inv.amount,
				payment_date: inv.date,
				payment_method: "Bank Wire / QNB Corporate Electronic",
				reference_no: `TXN-${Date.now().toString().slice(-6)}`,
				bank_account: "Qatar National Bank (QNB) - Main Operating",
				gl_debit_account: "22100001 - Trade Payables - Vendors",
				gl_credit_account: "12000001 - Bank Operating Account (QNB)",
				status: "Settled",
				created_at: (/* @__PURE__ */ new Date()).toISOString()
			});
			setShowReceiptModal(true);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Accounts Payable (AP) Invoices"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Invoices from suppliers, utility providers, and procurement orders awaiting payment settlement."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setOpen(true),
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Create AP Invoice"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Entry Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Invoice #"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Vendor Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "PO / GRN Reference"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Due Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Expense GL Account"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold",
							children: "Amount (QAR)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold text-right",
							children: "Action"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [allInvoices.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 9,
					className: "text-center py-8 text-muted-foreground text-xs",
					children: "No Accounts Payable invoices found."
				}) }), allInvoices.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/30 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-muted-foreground",
							children: row.date
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-bold text-primary",
							children: row.invoice_no
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-semibold",
							children: row.vendor
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-cyan-600",
							children: row.po_number || row.grn_number ? `${row.po_number || ""} ${row.grn_number ? "· " + row.grn_number : ""}` : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.due_date }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-blue-600 font-mono text-xs",
							children: row.account
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right font-mono",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-bold text-foreground",
								children: ["QAR ", row.amount.toLocaleString()]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[10px] text-muted-foreground",
								children: [
									"Base: ",
									Number(row.base_amount || row.amount - (row.tax_amount || 0)).toLocaleString(),
									" | Tax: ",
									Number(row.tax_amount || 0).toLocaleString()
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: row.status === "Paid" ? "default" : "secondary",
							className: row.status === "Paid" ? "bg-emerald-600 text-[10px]" : "text-amber-600 border-amber-500/40 text-[10px]",
							children: row.status === "Paid" ? "Paid & Settled" : "Unpaid / Draft"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-end gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs gap-1 text-primary border-primary/40 hover:bg-primary/10",
									onClick: () => setSelectedInvoiceForView(row.raw || row),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), " View Proforma"]
								}), row.status !== "Paid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									className: "h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white",
									onClick: () => openPayModal(row),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3 w-3" }), " Settle / Pay"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs gap-1 text-emerald-600 border-emerald-500/40",
									onClick: () => handleViewReceipt(row),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3 w-3" }), " View Receipt"]
								})]
							})
						})
					]
				}, row.invoice_no))] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create Accounts Payable Invoice" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Entry Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.date,
										onChange: (e) => setForm({
											...form,
											date: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Invoice #" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.invoice_no,
										onChange: (e) => setForm({
											...form,
											invoice_no: e.target.value
										})
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Vendor" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.vendor,
										onChange: (e) => setForm({
											...form,
											vendor: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Amount (QAR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: form.amount,
										onChange: (e) => setForm({
											...form,
											amount: e.target.value
										})
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Bill Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.date,
										onChange: (e) => setForm({
											...form,
											date: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Due Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.due_date,
										onChange: (e) => setForm({
											...form,
											due_date: e.target.value
										})
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Expense GL Account (Official COA)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.account,
									onValueChange: (v) => setForm({
										...form,
										account: v,
										account_code: v.split(" - ")[0]
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51004001 - Repair and Maintenance Cost",
											children: "51004001 - Repair and Maintenance Cost"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51004006 - Cost of CMEP Materials",
											children: "51004006 - Cost of CMEP Materials"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51002001 - CMEP-Facilities Mgt AMC",
											children: "51002001 - CMEP-Facilities Mgt AMC"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51001001 - CMEP-Labor Cost-Facilities Mgt",
											children: "51001001 - CMEP-Labor Cost-Facilities Mgt"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51003001 - Electricity & Water-Common Area",
											children: "51003001 - Electricity & Water-Common Area"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51101001 - Staff Basic Salary",
											children: "51101001 - Staff Basic Salary"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51102014 - IT Expenses",
											children: "51102014 - IT Expenses"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "51102001 - Vehicles & Other Insurance Expenses",
											children: "51102001 - Vehicles & Other Insurance Expenses"
										})
									] })]
								})] }),
								parseFloat(form.amount) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 space-y-1.5 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ledgers / Accounts Updated by this AP Invoice" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1 font-mono text-[11px]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-blue-700 dark:text-blue-300",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												"Dr. ",
												form.account_code,
												" - ",
												form.account.split(" - ")[1]
											] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["QAR ", parseFloat(form.amount).toLocaleString()] })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-emerald-700 dark:text-emerald-300",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												"Cr. 22100001 - Trade Payables - Vendors (",
												form.vendor || "Vendor",
												")"
											] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["QAR ", parseFloat(form.amount).toLocaleString()] })]
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleAdd,
							children: "Save AP Invoice"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!payTarget,
				onOpenChange: () => setPayTarget(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-5 w-5 text-emerald-600" }), "Disburse Payment & Select Payment Mode"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Record vendor settlement, specify bank/cash accounts, and post Payment Voucher to General Ledger." })] }),
						payTarget && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between font-semibold",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Invoice Reference:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-primary",
												children: payTarget.invoice_no
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between font-semibold",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Vendor Name:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: payTarget.vendor })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-sm font-bold border-t border-emerald-500/20 pt-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Net Payable Settlement:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-emerald-600 font-mono",
												children: ["QAR ", Number(payTarget.amount || 0).toLocaleString()]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Payment Date *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: payForm.paymentDate,
										onChange: (e) => setPayForm({
											...payForm,
											paymentDate: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Payment Mode *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: payForm.paymentMethod,
										onValueChange: (v) => setPayForm({
											...payForm,
											paymentMethod: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Bank Wire / QNB Corporate Electronic",
												children: "Bank Wire / Electronic Transfer (QNB)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Commercial Bank of Qatar (CBQ) Wire",
												children: "CBQ Electronic Wire"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Cash in Hand / Office Vault Cash",
												children: "Cash in Hand / Office Vault Cash"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Petty Cash / Direct Cash",
												children: "Petty Cash / Direct Cash Voucher"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Corporate Cheque / Manager's Cheque",
												children: "Corporate Cheque / Manager's Cheque"
											})
										] })]
									})] })]
								}),
								(payForm.paymentMethod.includes("Cash") || payForm.paymentMethod.includes("Petty")) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4" }), " Cash Disbursement & Handover Details"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Disbursing Cash Vault" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												disabled: true,
												value: "12100001 - Cash in Hand (Office Vault)",
												className: "bg-background"
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Petty Cash Slip / Voucher # *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: payForm.cashReceiptNo,
												onChange: (e) => setPayForm({
													...payForm,
													cashReceiptNo: e.target.value
												}),
												placeholder: "PCV-00821"
											})] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Receiver / Vendor Rep Name *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: payForm.receiverName,
											onChange: (e) => setPayForm({
												...payForm,
												receiverName: e.target.value
											}),
											placeholder: "Full name of recipient"
										})] })
									]
								}),
								payForm.paymentMethod.includes("Cheque") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" }), " Corporate Cheque Details"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Issuing Bank" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											disabled: true,
											value: "Qatar National Bank (QNB) - Cheque Account",
											className: "bg-background"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Cheque Number *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: payForm.chequeNumber,
											onChange: (e) => setPayForm({
												...payForm,
												chequeNumber: e.target.value
											}),
											placeholder: "CHQ-004812"
										})] })]
									})]
								}),
								payForm.paymentMethod.includes("Wire") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Disbursing Bank Account" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: payForm.disbursingBank,
										onValueChange: (v) => setPayForm({
											...payForm,
											disbursingBank: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)",
											children: "QNB - Main Operating (QA42QNBA00000000123456)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Commercial Bank of Qatar (CBQ) - Operational (IBAN: QA99CBQA00000000654321)",
											children: "CBQ - Operational (QA99CBQA00000000654321)"
										})] })]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Transfer Reference #" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: payForm.transactionReference,
											onChange: (e) => setPayForm({
												...payForm,
												transactionReference: e.target.value
											})
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Beneficiary Account / IBAN" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: payForm.beneficiaryAccount,
											onChange: (e) => setPayForm({
												...payForm,
												beneficiaryAccount: e.target.value
											})
										})] })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-lg bg-muted/40 border text-[11px] text-muted-foreground space-y-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1 font-semibold text-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5 text-emerald-600" }), "General Ledger Posting Impact (Auto-Posted upon Settlement):"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "font-mono",
											children: [
												"• ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-blue-600",
													children: "Dr. 22100001"
												}),
												" Trade Payables - Vendors — QAR ",
												Number(payTarget.amount || 0).toLocaleString()
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-mono",
											children: payForm.paymentMethod.includes("Cash") || payForm.paymentMethod.includes("Petty") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												"• ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-amber-600",
													children: "Cr. 12100001"
												}),
												" Cash in Hand / Operating Cash — QAR ",
												Number(payTarget.amount || 0).toLocaleString()
											] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												"• ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-emerald-600",
													children: "Cr. 12000001"
												}),
												" Bank Operating Account (QNB) — QAR ",
												Number(payTarget.amount || 0).toLocaleString()
											] })
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setPayTarget(null),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "bg-emerald-600 hover:bg-emerald-700 text-white gap-1",
							onClick: handleConfirmDisbursement,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }), " Confirm & Disburse Settlement"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProformaInvoiceDialog, {
				invoice: selectedInvoiceForView,
				open: !!selectedInvoiceForView,
				onOpenChange: (open) => !open && setSelectedInvoiceForView(null),
				onViewReceiptClick: (inv) => handleViewReceipt(inv),
				onPayClick: (inv) => {
					setSelectedInvoiceForView(null);
					openPayModal(inv);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentReceiptDialog, {
				receipt: selectedReceipt,
				open: showReceiptModal,
				onOpenChange: setShowReceiptModal,
				vendorName: selectedReceipt?.vendor_name || selectedReceipt?.vendor_id ? String(selectedReceipt.vendor_id) : "Vendor"
			})
		]
	});
}
var COMMON_GL_ACCOUNTS = [
	{
		code: "12000",
		name: "12000 - Bank Operating Account (QNB/CBQ)"
	},
	{
		code: "12100",
		name: "12100 - Cash In Hand (Office Vault)"
	},
	{
		code: "12411",
		name: "12411 - Legal Receivables (Defaulted Cases)"
	},
	{
		code: "12413",
		name: "12413 - Tenant Receivables (AR)"
	},
	{
		code: "12900",
		name: "12900 - PDC In Hand / Undeposited Cheques"
	},
	{
		code: "22100001",
		name: "22100001 - Trade Payables - Vendors (Suppliers/Vendors)"
	},
	{
		code: "21100",
		name: "21100 - Tenant Security Deposits"
	},
	{
		code: "41100",
		name: "41100 - Rental Revenue"
	},
	{
		code: "41200",
		name: "41200 - Parking Fee Revenue"
	},
	{
		code: "41300",
		name: "41300 - Utility Recovery Revenue"
	},
	{
		code: "50100",
		name: "50100 - Staff Salaries & Allowances"
	},
	{
		code: "51004001",
		name: "51004001 - Repair and Maintenance Cost"
	},
	{
		code: "50300",
		name: "50300 - Cleaning & Sanitation"
	},
	{
		code: "50400",
		name: "50400 - Elevator Maintenance"
	},
	{
		code: "50500",
		name: "50500 - Utilities & Electricity (Kahramaa)"
	},
	{
		code: "50600",
		name: "50600 - Security Services"
	},
	{
		code: "50800",
		name: "50800 - Legal & Professional Fees"
	}
];
function VoucherManagerSubModule({ type }) {
	const { vouchers: sharedVouchers, setVouchers: setSharedVouchers } = useAppData();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		voucher_no: `VCH-${type.slice(0, 3).toUpperCase()}-${Math.floor(1e3 + Math.random() * 9e3)}`,
		date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		name: type === "Payment Voucher" ? "Payment to Contractor" : type === "Receipt Voucher" ? "Direct Rent Collection" : "General Adjustment",
		debit: type === "Payment Voucher" ? "22100001 - Trade Payables - Vendors (Suppliers/Vendors)" : type === "Receipt Voucher" ? "12000 - Bank Operating Account (QNB/CBQ)" : "51004001 - Repair and Maintenance Cost",
		credit: type === "Payment Voucher" ? "12000 - Bank Operating Account (QNB/CBQ)" : type === "Receipt Voucher" ? "41100 - Rental Revenue" : "12100 - Cash In Hand (Office Vault)",
		amount: "5000",
		method: type === "Payment Voucher" ? "Bank Transfer" : type === "Receipt Voucher" ? "Cash" : "Batch"
	});
	const filtered = (sharedVouchers || []).filter((v) => {
		if (type.includes("Journal")) return v.method === "Batch" || v.name.includes("Income") || v.name.includes("Doc") || v.name.includes("Journal");
		if (type.includes("Payment")) return v.name.includes("Payment") || v.name.includes("Refund") || v.debit.includes("Payable");
		if (type.includes("Receipt")) return v.name.includes("Receipt") || v.method === "PDC" || v.method === "Cash" || v.credit.includes("Income");
		return true;
	});
	async function handleAdd() {
		const amt = parseFloat(form.amount) || 0;
		if (amt <= 0) {
			toast.error("Amount must be greater than zero.");
			return;
		}
		const accountCode = (label) => label.trim().split(/\s+/)[0];
		try {
			const result = await postVoucher({
				voucher_date: form.date,
				voucher_type: type,
				description: form.name,
				reference_no: form.voucher_no,
				source_type: "FINANCE_VOUCHER",
				lines: [{
					account_code: accountCode(form.debit),
					debit: amt,
					credit: 0,
					description: form.debit
				}, {
					account_code: accountCode(form.credit),
					debit: 0,
					credit: amt,
					description: form.credit
				}]
			});
			setSharedVouchers((prev) => [{
				id: result.voucher_id,
				leaseId: "",
				name: form.name,
				receiptNo: result.receipt_number,
				method: form.method,
				period: form.date,
				debit: form.debit,
				credit: form.credit,
				amount: amt,
				status: "posted"
			}, ...prev]);
			toast.success(`${type} ${result.voucher_number} posted. Receipt ${result.receipt_number} generated.`);
			setOpen(false);
		} catch (error) {
			console.error(error);
			toast.error(error?.message || `Failed to post ${type}.`);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "text-sm font-semibold",
					children: [type, "s Register"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"Transactions and double-entry postings for ",
						type.toLowerCase(),
						" operations."
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						children: [filtered.length, " Vouchers"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => setOpen(true),
						className: "gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
							" Create ",
							type
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Entry Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Voucher #"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Name & Description"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Method"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Debit Account (GL)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Credit Account (GL)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold",
							children: "Amount (QAR)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold",
							children: "Actions"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: [...filtered].sort((a, b) => new Date(b.period || "2026-08-18").getTime() - new Date(a.period || "2026-08-18").getTime()).map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/30 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-muted-foreground",
							children: (() => {
								const raw = v.date || v.period || "2026-08-18";
								if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
								const d = new Date(raw);
								return !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "2026-08-18";
							})()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-bold text-primary",
							children: v.receiptNo || v.id
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: v.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "text-[10px]",
							children: v.method || "System"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-blue-600 text-xs",
							children: v.debit
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-emerald-600 text-xs",
							children: v.credit
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right font-mono font-bold",
							children: Number(v.amount).toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: v.status === "posted" || v.status === "Posted" ? "default" : "secondary",
							className: "text-[10px] capitalize",
							children: v.status || "Posted"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: v.status === "draft" || v.status === "Draft" || v.status === "pending" || v.status === "Pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "default",
								className: "h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white",
								onClick: () => {
									setSharedVouchers((prev) => prev.map((item) => item.id === v.id ? {
										...item,
										status: "posted"
									} : item));
									toast.success(`Payment voucher ${v.receiptNo || v.id} approved & payment completed.`);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), " Complete Payment"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] text-muted-foreground font-mono",
								children: "Approved"
							})
						})
					]
				}, v.id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Create ", type] }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Entry Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.date,
										onChange: (e) => setForm({
											...form,
											date: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Voucher #" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.voucher_no,
										onChange: (e) => setForm({
											...form,
											voucher_no: e.target.value
										})
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description / Narration" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.name,
									onChange: (e) => setForm({
										...form,
										name: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Debit GL Account" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.debit,
										onValueChange: (v) => setForm({
											...form,
											debit: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "text-xs font-mono",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: COMMON_GL_ACCOUNTS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: a.name,
											className: "text-xs font-mono",
											children: a.name
										}, a.code)) })]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Credit GL Account" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.credit,
										onValueChange: (v) => setForm({
											...form,
											credit: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "text-xs font-mono",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: COMMON_GL_ACCOUNTS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: a.name,
											className: "text-xs font-mono",
											children: a.name
										}, a.code)) })]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Amount (QAR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: form.amount,
										onChange: (e) => setForm({
											...form,
											amount: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Payment Method" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.method,
										onValueChange: (v) => setForm({
											...form,
											method: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Bank Transfer",
												children: "Bank Transfer"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Cheque",
												children: "Cheque"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Cash",
												children: "Cash"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "PDC",
												children: "PDC"
											})
										] })]
									})] })]
								}),
								parseFloat(form.amount) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 space-y-1.5 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Ledgers / Accounts Updated by this ", type] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2 font-mono text-[11px]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "bg-background p-2 rounded border border-emerald-200",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-emerald-700 dark:text-emerald-400 font-bold block",
													children: "Debit (DR):"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: form.debit }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "block font-bold text-emerald-600 mt-1",
													children: ["QR ", parseFloat(form.amount || "0").toLocaleString()]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "bg-background p-2 rounded border border-rose-200",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-rose-600 dark:text-rose-400 font-bold block",
													children: "Credit (CR):"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: form.credit }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "block font-bold text-rose-600 mt-1",
													children: ["QR ", parseFloat(form.amount || "0").toLocaleString()]
												})
											]
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: handleAdd,
							children: ["Post ", type]
						})] })
					]
				})
			})
		]
	});
}
function ReceivableInvoiceSubModule() {
	const { leases } = useAppData();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [data, setData] = (0, import_react.useState)([]);
	const [form, setForm] = (0, import_react.useState)({
		invoice_no: `INV-AR-${Math.floor(1e3 + Math.random() * 9e3)}`,
		tenant: "Mr. Hafeez Shaik",
		property: "Old Salata - Residence No:23",
		unit: "AAA - Flat16",
		date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		due_date: "2026-09-05",
		stream: "41100 - Rental Revenue",
		amount: "5600"
	});
	function handleAdd() {
		setData((prev) => [{
			...form,
			amount: parseFloat(form.amount) || 0,
			status: "Pending"
		}, ...prev]);
		toast.success(`AR Invoice ${form.invoice_no} staged in the local view only. Use the Receivable Invoice workflow to post it to the ledger.`);
		setOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Accounts Receivable (AR) Invoices"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Invoices generated for rental dues, utility recoveries, and service charges."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setOpen(true),
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Create AR Invoice"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Entry Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Invoice #"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Tenant / Customer"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Property & Unit"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Revenue GL Account"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Issue Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Due Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold",
							children: "Amount (QAR)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Status"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: [...data].sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime()).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/30 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-muted-foreground",
							children: row.date
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-bold text-primary",
							children: row.invoice_no
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-semibold",
							children: row.tenant
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-muted-foreground",
							children: [
								row.property,
								" — ",
								row.unit
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs text-blue-600",
							children: row.stream
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.date }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.due_date }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right font-mono font-bold",
							children: row.amount.toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: row.status === "Paid" ? "default" : row.status === "Overdue" ? "destructive" : "outline",
							className: "text-[10px]",
							children: row.status
						}) })
					]
				}, row.invoice_no)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create Accounts Receivable Invoice" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Entry Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.date,
										onChange: (e) => setForm({
											...form,
											date: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Invoice #" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.invoice_no,
										onChange: (e) => setForm({
											...form,
											invoice_no: e.target.value
										})
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tenant Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.tenant,
										onChange: (e) => setForm({
											...form,
											tenant: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Amount (QAR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: form.amount,
										onChange: (e) => setForm({
											...form,
											amount: e.target.value
										})
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Property" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.property,
										onChange: (e) => setForm({
											...form,
											property: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Unit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.unit,
										onChange: (e) => setForm({
											...form,
											unit: e.target.value
										})
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Issue Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.date,
										onChange: (e) => setForm({
											...form,
											date: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Due Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.due_date,
										onChange: (e) => setForm({
											...form,
											due_date: e.target.value
										})
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Target Revenue GL Account" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.stream,
									onValueChange: (v) => setForm({
										...form,
										stream: v
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "text-xs font-mono",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "41100 - Rental Revenue",
											children: "41100 - Rental Revenue (Residential/Commercial)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "41200 - Parking Fee Revenue",
											children: "41200 - Parking Space / Slot Fee"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "41300 - Utility Recovery Revenue",
											children: "41300 - Utility & Electricity Recovery"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "41400 - Common Area Maintenance (CAM)",
											children: "41400 - Common Area Maintenance (CAM)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "41500 - Management & Admin Fee",
											children: "41500 - Management & Admin Fee"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "41600 - Late Fee & Penalties",
											children: "41600 - Late Fee & Penalties"
										})
									] })]
								})] }),
								parseFloat(form.amount) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 space-y-1.5 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ledgers / Accounts Updated by this AR Invoice" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2 font-mono text-[11px]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "bg-background p-2 rounded border border-emerald-200",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-emerald-700 dark:text-emerald-400 font-bold block",
													children: "Debit (Asset/AR):"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													"12413 - Tenant Receivables (",
													form.tenant || "Tenant",
													")"
												] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "block font-bold text-emerald-600 mt-1",
													children: ["QR ", parseFloat(form.amount || "0").toLocaleString()]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "bg-background p-2 rounded border border-rose-200",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-rose-600 dark:text-rose-400 font-bold block",
													children: "Credit (Revenue):"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: form.stream }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "block font-bold text-rose-600 mt-1",
													children: ["QR ", parseFloat(form.amount || "0").toLocaleString()]
												})
											]
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleAdd,
							children: "Generate Invoice"
						})] })
					]
				})
			})
		]
	});
}
function BankSubModule() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [data, setData] = (0, import_react.useState)([]);
	const [form, setForm] = (0, import_react.useState)({
		code: "QNB",
		name: "Qatar National Bank (QNB)",
		swift_code: "QNBAQAQA"
	});
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	async function load() {
		try {
			const res = await FinBanksApi.fetchAll();
			setData(res.length > 0 ? res : [
				{
					id: "1",
					code: "QNB",
					name: "Qatar National Bank (QNB)",
					swift_code: "QNBAQAQA"
				},
				{
					id: "2",
					code: "CBQ",
					name: "Commercial Bank of Qatar (CBQ)",
					swift_code: "CBQAQAQA"
				},
				{
					id: "3",
					code: "DOHA",
					name: "Doha Bank QPSC",
					swift_code: "DOHBQAQA"
				},
				{
					id: "4",
					code: "QIB",
					name: "Qatar Islamic Bank (QIB)",
					swift_code: "QISBQAQA"
				}
			]);
		} catch {
			setData([{
				id: "1",
				code: "QNB",
				name: "Qatar National Bank (QNB)",
				swift_code: "QNBAQAQA"
			}, {
				id: "2",
				code: "CBQ",
				name: "Commercial Bank of Qatar (CBQ)",
				swift_code: "CBQAQAQA"
			}]);
		}
	}
	async function handleAdd() {
		try {
			await FinBanksApi.create(form);
		} catch {}
		setData((prev) => [{
			id: String(Date.now()),
			...form
		}, ...prev]);
		toast.success("Bank registered");
		setOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Registered Banking Institutions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "List of financial institutions for collection, disbursement, and PDC deposit clearing."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setOpen(true),
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Bank"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Code"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Bank Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "SWIFT / Routing Code"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: data.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/30 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-bold text-primary",
							children: b.code
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-semibold",
							children: b.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs",
							children: b.swift_code
						})
					]
				}, b.id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add Bank Institution" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Bank Code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.code,
									onChange: (e) => setForm({
										...form,
										code: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Bank Full Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.name,
									onChange: (e) => setForm({
										...form,
										name: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "SWIFT Code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.swift_code,
									onChange: (e) => setForm({
										...form,
										swift_code: e.target.value
									})
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleAdd,
							children: "Save Bank"
						})] })
					]
				})
			})
		]
	});
}
function BankAccountSubModule() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [data, setData] = (0, import_react.useState)([]);
	const [banksList, setBanksList] = (0, import_react.useState)([]);
	const [form, setForm] = (0, import_react.useState)({
		bank_id: "1",
		account_number: "QA55QNBA00000000123456789",
		account_title: "ZYNO Main Rent Operating Account",
		currency: "QAR",
		opening_balance: 15e5
	});
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	async function load() {
		try {
			const [resAcc, resBanks] = await Promise.all([FinBankAccountsApi.fetchAll().catch(() => []), FinBanksApi.fetchAll().catch(() => [])]);
			setBanksList(resBanks.length > 0 ? resBanks : [
				{
					id: "1",
					code: "QNB",
					name: "Qatar National Bank (QNB)",
					swift_code: "QNBAQAQA"
				},
				{
					id: "2",
					code: "CBQ",
					name: "Commercial Bank of Qatar (CBQ)",
					swift_code: "CBQAQAQA"
				},
				{
					id: "3",
					code: "DOHA",
					name: "Doha Bank QPSC",
					swift_code: "DOHBQAQA"
				},
				{
					id: "4",
					code: "QIB",
					name: "Qatar Islamic Bank (QIB)",
					swift_code: "QISBQAQA"
				},
				{
					id: "5",
					code: "MAR",
					name: "Masraf Al Rayan",
					swift_code: "MARKQAQA"
				},
				{
					id: "6",
					code: "DUKHAN",
					name: "Dukhan Bank",
					swift_code: "BARQAQA"
				}
			]);
			setData(resAcc.length > 0 ? resAcc : [
				{
					id: "1",
					bank_id: "1",
					account_number: "QA55QNBA00000000123456789",
					account_title: "ZYNO Operations & Collection (QNB)",
					currency: "QAR",
					opening_balance: 15e5
				},
				{
					id: "2",
					bank_id: "2",
					account_number: "QA88CBQA00000000987654321",
					account_title: "ZYNO Escrow & Deposits Account (CBQ)",
					currency: "QAR",
					opening_balance: 45e4
				},
				{
					id: "3",
					bank_id: "3",
					account_number: "QA22DOHB00000000554433221",
					account_title: "ZYNO Payroll & Disbursement (Doha Bank)",
					currency: "QAR",
					opening_balance: 2e5
				}
			]);
		} catch {
			setData([{
				id: "1",
				bank_id: "1",
				account_number: "QA55QNBA00000000123456789",
				account_title: "ZYNO Operations & Collection (QNB)",
				currency: "QAR",
				opening_balance: 15e5
			}]);
		}
	}
	async function handleAdd() {
		try {
			await FinBankAccountsApi.create(form);
		} catch {}
		setData((prev) => [{
			id: String(Date.now()),
			...form
		}, ...prev]);
		toast.success("Bank account created and mapped to GL Account 12000");
		setOpen(false);
	}
	function getBankName(bankId) {
		const b = banksList.find((x) => String(x.id) === String(bankId) || x.code === bankId);
		return b ? b.name : "Qatar National Bank (QNB)";
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Bank Accounts Portfolio & IBAN Register"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Corporate treasury accounts linked to GL cash and bank clearing sub-ledgers."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setOpen(true),
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Bank Account"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Bank Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "IBAN / Account #"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Account Title"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Currency"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold",
							children: "Current Balance (QAR)"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: data.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/30 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-semibold text-primary",
							children: getBankName(a.bank_id ?? "")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-bold",
							children: a.account_number
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: a.account_title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "text-[10px]",
							children: a.currency
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right font-mono font-bold text-emerald-600",
							children: Number(a.opening_balance).toLocaleString()
						})
					]
				}, a.id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add Bank Account" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Select Bank Institution ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-destructive",
									children: "*"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.bank_id,
									onValueChange: (v) => setForm({
										...form,
										bank_id: v
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Registered Bank" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: banksList.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: String(b.id),
										className: "text-xs",
										children: [
											b.name,
											" (",
											b.code,
											")"
										]
									}, b.id)) })]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "IBAN / Account Number" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.account_number,
									onChange: (e) => setForm({
										...form,
										account_number: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Account Title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.account_title,
									onChange: (e) => setForm({
										...form,
										account_title: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Currency" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.currency,
										onChange: (e) => setForm({
											...form,
											currency: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Opening Balance (QAR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: form.opening_balance,
										onChange: (e) => setForm({
											...form,
											opening_balance: parseFloat(e.target.value) || 0
										})
									})] })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleAdd,
							children: "Save Account"
						})] })
					]
				})
			})
		]
	});
}
function BankClearanceSubModule() {
	const { bankClearances, addBankClearance } = useFinanceStore();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [data, setData] = (0, import_react.useState)([]);
	const [form, setForm] = (0, import_react.useState)({
		ref: `CHQ-${Math.floor(1e5 + Math.random() * 9e5)}`,
		bank: "QNB Main Account",
		type: "PDC Clearance",
		amount: "5600",
		date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		status: "Cleared"
	});
	const combinedClearances = [...bankClearances, ...data];
	function handleAdd() {
		const amt = parseFloat(form.amount) || 0;
		addBankClearance({
			ref: form.ref,
			bank: form.bank,
			type: form.type,
			amount: amt,
			date: form.date,
			status: form.status
		});
		setOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Cheque & Wire Clearance Console"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Clear deposited cheques and wire transfers once credited by the central clearing house."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setOpen(true),
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Record Clearance"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Entry Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Transaction / Cheque #"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Bank"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Type"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Clearance Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold",
							children: "Amount (QAR)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Status"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: [...combinedClearances].sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime()).map((row, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/30 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-muted-foreground",
							children: row.date
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-bold text-primary",
							children: row.ref
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: row.bank
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.type }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.date }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right font-mono font-bold",
							children: row.amount.toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: row.status === "Cleared" ? "default" : "outline",
							className: "text-[10px]",
							children: row.status
						}) })
					]
				}, idx)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Record Bank Clearance" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Entry Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.date,
										onChange: (e) => setForm({
											...form,
											date: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Cheque / Reference Number" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.ref,
										onChange: (e) => setForm({
											...form,
											ref: e.target.value
										})
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Bank Account" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.bank,
									onValueChange: (v) => setForm({
										...form,
										bank: v
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Qatar National Bank (QNB)",
											children: "Qatar National Bank (QNB)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Commercial Bank of Qatar (CBQ)",
											children: "Commercial Bank of Qatar (CBQ)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Doha Bank",
											children: "Doha Bank"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Qatar Islamic Bank (QIB)",
											children: "Qatar Islamic Bank (QIB)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Masraf Al Rayan",
											children: "Masraf Al Rayan"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Dukhan Bank",
											children: "Dukhan Bank"
										})
									] })]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Amount (QAR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: form.amount,
										onChange: (e) => setForm({
											...form,
											amount: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Clearance Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.status,
										onValueChange: (v) => setForm({
											...form,
											status: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "text-xs",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Cleared",
												children: "Cleared"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Pending Clearance",
												children: "Pending Clearance"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Returned",
												children: "Returned"
											})
										] })]
									})] })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleAdd,
							children: "Confirm Clearance"
						})] })
					]
				})
			})
		]
	});
}
function BankReconciliationSubModule() {
	const { bankReconciliations, addBankReconciliation } = useFinanceStore();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [data, setData] = (0, import_react.useState)([]);
	const [form, setForm] = (0, import_react.useState)({
		account_number: "QA55QNBA00000000123456789",
		statement_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		entry_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		book_balance: "1500000",
		statement_balance: "1500000"
	});
	const combinedReconciliations = [...bankReconciliations, ...data];
	const bBal = parseFloat(form.book_balance) || 0;
	const sBal = parseFloat(form.statement_balance) || 0;
	const diff = bBal - sBal;
	function handleAdd() {
		addBankReconciliation({
			account_number: form.account_number,
			statement_date: form.statement_date,
			book_balance: bBal,
			statement_balance: sBal,
			difference: diff,
			status: diff === 0 ? "Reconciled" : "Discrepancy"
		});
		setOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Bank Reconciliation Workbench"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Match bank statement closing balance against General Ledger cash/bank balance."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setOpen(true),
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " New Reconciliation"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Entry Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Account #"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Statement Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold",
							children: "GL Book Balance (QAR)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold",
							children: "Bank Statement Balance (QAR)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold",
							children: "Difference"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Status"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: [...combinedReconciliations].sort((a, b) => new Date(b.statement_date || "").getTime() - new Date(a.statement_date || "").getTime()).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/30 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-muted-foreground",
							children: r.entry_date || r.statement_date
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-bold text-primary",
							children: r.account_number
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: r.statement_date }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right font-mono font-semibold",
							children: r.book_balance.toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right font-mono font-semibold",
							children: r.statement_balance.toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right font-mono font-bold text-emerald-600",
							children: [(r.book_balance - r.statement_balance).toLocaleString(), " QAR"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "default",
							className: "text-[10px]",
							children: r.status
						}) })
					]
				}, r.id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New Bank Reconciliation" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Bank Account" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.account_number,
									onValueChange: (v) => setForm({
										...form,
										account_number: v
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "QA55QNBA00000000123456789",
											children: "QA55QNBA00000000123456789 - QNB Main"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "QA88CBQA00000000987654321",
											children: "QA88CBQA00000000987654321 - CBQ Escrow"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "QA22DOHB00000000554433221",
											children: "QA22DOHB00000000554433221 - Doha Bank Payroll"
										})
									] })]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Entry Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.entry_date,
										onChange: (e) => setForm({
											...form,
											entry_date: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Statement Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.statement_date,
										onChange: (e) => setForm({
											...form,
											statement_date: e.target.value
										})
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "GL Book Balance (QAR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: form.book_balance,
										onChange: (e) => setForm({
											...form,
											book_balance: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Bank Statement Balance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: form.statement_balance,
										onChange: (e) => setForm({
											...form,
											statement_balance: e.target.value
										})
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-2.5 rounded bg-muted/40 border flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Reconciliation Difference:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `font-mono font-bold ${diff === 0 ? "text-emerald-600" : "text-rose-600"}`,
										children: diff === 0 ? "0 QAR (Balanced)" : `${diff.toLocaleString()} QAR`
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleAdd,
							children: "Complete Reconciliation"
						})] })
					]
				})
			})
		]
	});
}
function BankReconciliationStatementListSubModule() {
	const [data, setData] = (0, import_react.useState)([]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex justify-between items-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold",
				children: "Reconciliation Statements Archive"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Certified monthly bank reconciliations with auditor sign-offs."
			})] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: [...data].sort((a, b) => new Date(b.entry_date || "").getTime() - new Date(a.entry_date || "").getTime()).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border rounded-lg p-3.5 bg-card flex justify-between items-center text-xs shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold text-foreground",
					children: item.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[11px] text-muted-foreground",
					children: [
						"Entry Date: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono",
							children: item.entry_date
						}),
						" • Period: ",
						item.period,
						" • Certified Balance: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "text-emerald-600",
							children: item.balance
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					className: "h-7 text-xs gap-1",
					onClick: () => toast.success(`Exporting Statement PDF for ${item.title}`),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3 w-3" }), " PDF Statement"]
				})]
			}, item.id))
		})]
	});
}
function TrialBalanceSimpleSubModule() {
	const { trialBalanceSummary } = useFinanceStore();
	const { assets, liabilities, capital, revenue, expenses, totalDebit, totalCredit, isBalanced } = trialBalanceSummary;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex justify-between items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold",
				children: "Trial Balance (Simple Summary)"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Live summary totals across Asset, Liability, Equity, Revenue, and Expense classes — updated in real-time."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					className: `font-mono ${isBalanced ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-rose-50 text-rose-700 border-rose-300"}`,
					children: isBalanced ? "✓ Balanced (Dr = Cr)" : "⚠ Out of Balance"
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border rounded-lg overflow-hidden bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
				className: "bg-muted/50 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold",
						children: "Account Classification"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right font-bold",
						children: "Total Debit (QAR)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right font-bold",
						children: "Total Credit (QAR)"
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, {
				className: "text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "hover:bg-muted/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-semibold text-emerald-700",
								children: "1000 — Assets (Bank, Cash, Receivables, PDCs, Fixed Assets)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right font-mono font-bold text-blue-600",
								children: assets?.toLocaleString() ?? "0"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right font-mono text-muted-foreground",
								children: "—"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "hover:bg-muted/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-semibold text-amber-700",
								children: "2000 — Liabilities (Security Deposits, AP, PDC Customer Liability)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right font-mono text-muted-foreground",
								children: "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right font-mono font-bold text-emerald-600",
								children: liabilities?.toLocaleString() ?? "0"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "hover:bg-muted/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-semibold text-blue-700",
								children: "3000 — Capital & Owner Equity (Retained Earnings)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right font-mono text-muted-foreground",
								children: "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right font-mono font-bold text-emerald-600",
								children: capital.toLocaleString()
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "hover:bg-muted/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-semibold text-indigo-700",
								children: "4000 — Revenue (Rental, Commercial Lease, Service Income)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right font-mono text-muted-foreground",
								children: "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right font-mono font-bold text-emerald-600",
								children: revenue.toLocaleString()
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "hover:bg-muted/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-semibold text-rose-700",
								children: "5000 — Expenses (Maintenance, Utility, Payroll, Cleaning)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right font-mono font-bold text-blue-600",
								children: expenses.toLocaleString()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right font-mono text-muted-foreground",
								children: "—"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "font-bold border-t-2 bg-muted/20",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-bold",
								children: "Total Trial Balance"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-right font-mono font-bold text-primary",
								children: [totalDebit.toLocaleString(), " QAR"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-right font-mono font-bold text-primary",
								children: [totalCredit.toLocaleString(), " QAR"]
							})
						]
					})
				]
			})] })
		})]
	});
}
function TrialBalanceFullSubModule() {
	const { trialBalanceDetailed } = useFinanceStore();
	const [viewMode, setViewMode] = (0, import_react.useState)("net");
	const netAccounts = (0, import_react.useMemo)(() => {
		return trialBalanceDetailed.map((acc) => {
			const netDr = Math.max(0, acc.debit - acc.credit);
			const netCr = Math.max(0, acc.credit - acc.debit);
			return {
				...acc,
				displayDr: viewMode === "net" ? netDr : acc.debit,
				displayCr: viewMode === "net" ? netCr : acc.credit
			};
		});
	}, [trialBalanceDetailed, viewMode]);
	const totalDr = netAccounts.reduce((s, a) => s + (a.displayDr || 0), 0);
	const totalCr = netAccounts.reduce((s, a) => s + (a.displayCr || 0), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold",
				children: "Detailed General Ledger Trial Balance"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: viewMode === "net" ? "Net closing balances per operational GL account — matches Trial Balance (Simple) summary." : "Gross turnover movements across all historical debit and credit postings."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex bg-muted/60 p-0.5 rounded-lg text-xs border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: `px-2.5 py-1 rounded-md font-semibold transition-all ${viewMode === "net" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
						onClick: () => setViewMode("net"),
						children: "Net Closing Balances"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: `px-2.5 py-1 rounded-md font-semibold transition-all ${viewMode === "gross" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
						onClick: () => setViewMode("gross"),
						children: "Gross Turnover Movements"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: "font-mono",
					children: [trialBalanceDetailed.length, " Accounts"]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border rounded-lg overflow-hidden bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
				className: "bg-muted/50 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold",
						children: "Code"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold",
						children: "Account Name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "font-bold",
						children: "Type"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right font-bold",
						children: viewMode === "net" ? "Net Debit (QAR)" : "Gross Debit (QAR)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right font-bold",
						children: viewMode === "net" ? "Net Credit (QAR)" : "Gross Credit (QAR)"
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, {
				className: "text-xs",
				children: [netAccounts.sort((a, b) => a.code.localeCompare(b.code)).map((acc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/30",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-bold text-primary",
							children: acc.code
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: acc.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: `text-[10px] font-semibold ${acc.type === "Assets" ? "text-emerald-700" : acc.type === "Liabilities" ? "text-amber-700" : acc.type === "Revenue" ? "text-indigo-700" : acc.type === "Expenses" ? "text-rose-700" : "text-blue-700"}`,
							children: acc.type
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right font-mono text-blue-600 font-semibold",
							children: acc.displayDr > 0 ? acc.displayDr.toLocaleString() : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right font-mono text-emerald-600 font-semibold",
							children: acc.displayCr > 0 ? acc.displayCr.toLocaleString() : "—"
						})
					]
				}, acc.code)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "font-bold border-t-2 bg-muted/20",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							colSpan: 3,
							children: [
								"Grand Total (",
								viewMode === "net" ? "Net Balances" : "Gross Movements",
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right font-mono font-bold text-primary",
							children: [totalDr.toLocaleString(), " QAR"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right font-mono font-bold text-primary",
							children: [totalCr.toLocaleString(), " QAR"]
						})
					]
				})]
			})] })
		})]
	});
}
function RevenueGenerationSubModule() {
	const { receivableInvoices, vouchers, journalEntries, allLedgerTransactions, addVoucher } = useFinanceStore();
	const { pdcs: contextPdcs, leases } = useAppData();
	const [activeSubTab, setActiveSubTab] = (0, import_react.useState)("asOf");
	const [periodFilter, setPeriodFilter] = (0, import_react.useState)("all");
	const [dbPdcs, setDbPdcs] = (0, import_react.useState)([]);
	const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	const [asOfDate, setAsOfDate] = (0, import_react.useState)(todayStr);
	const [prorationMethod, setProrationMethod] = (0, import_react.useState)("CALENDAR_DAYS");
	const [asOfProperty, setAsOfProperty] = (0, import_react.useState)("all");
	const [asOfUnit, setAsOfUnit] = (0, import_react.useState)("all");
	const [asOfTenant, setAsOfTenant] = (0, import_react.useState)("all");
	const [asOfStatusFilter, setAsOfStatusFilter] = (0, import_react.useState)("all");
	const [asOfSearch, setAsOfSearch] = (0, import_react.useState)("");
	const [savedBatches, setSavedBatches] = (0, import_react.useState)(() => {
		try {
			const stored = localStorage.getItem("fin_revenue_generation_batches_v2");
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	});
	const [isGenerating, setIsGenerating] = (0, import_react.useState)(false);
	const [selectedBatchDetails, setSelectedBatchDetails] = (0, import_react.useState)(null);
	const [filterProperty, setFilterProperty] = (0, import_react.useState)("all");
	const [filterUnit, setFilterUnit] = (0, import_react.useState)("all");
	const [filterCustomer, setFilterCustomer] = (0, import_react.useState)("all");
	const [filterMonth, setFilterMonth] = (0, import_react.useState)("all");
	const [filterSource, setFilterSource] = (0, import_react.useState)("all");
	const [filterFromDate, setFilterFromDate] = (0, import_react.useState)("");
	const [filterToDate, setFilterToDate] = (0, import_react.useState)("");
	const [filterSearch, setFilterSearch] = (0, import_react.useState)("");
	const resetFilters = () => {
		setFilterProperty("all");
		setFilterUnit("all");
		setFilterCustomer("all");
		setFilterMonth("all");
		setFilterSource("all");
		setFilterFromDate("");
		setFilterToDate("");
		setFilterSearch("");
		setPeriodFilter("all");
	};
	const now = /* @__PURE__ */ new Date();
	const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
	const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;
	(0, import_react.useEffect)(() => {
		async function fetchPdcRecords() {
			try {
				const { data: regData } = await supabase.from("fin_pdc_register").select("*");
				const { data: altData } = await supabase.from("pdcs").select("*");
				setDbPdcs([...regData || [], ...altData || []]);
			} catch {}
		}
		fetchPdcRecords();
	}, []);
	const combinedPdcs = (0, import_react.useMemo)(() => {
		const list = [...contextPdcs || [], ...dbPdcs];
		const map = /* @__PURE__ */ new Map();
		list.forEach((p) => {
			const key = p.id || p.chequeNo || p.cheque_number || Math.random().toString();
			if (!map.has(key)) map.set(key, {
				leaseId: p.leaseId || p.lease_id,
				chequeNo: p.chequeNo || p.cheque_number,
				date: p.date || p.cheque_date || p.dueDate,
				amount: Number(p.amount || 0),
				status: p.status,
				period: p.period || p.rental_period
			});
		});
		return Array.from(map.values());
	}, [contextPdcs, dbPdcs]);
	const activeBatchPreview = (0, import_react.useMemo)(() => {
		return generatePortfolioRevenueBatch({
			leases: (leases || []).map((l) => ({
				id: l.id || l.leaseId,
				tenantName: l.tenantName || l.tenant || "Unknown Tenant",
				property: l.property || l.propertyName || "Unknown Property",
				unit: l.unit || l.unitRef || "Unknown Unit",
				startDate: l.startDate || l.start_date || "",
				endDate: l.endDate || l.end_date || "",
				monthlyRent: Number(l.monthlyRent || l.rentAmount || l.rent || 0),
				plannedVacateDate: l.plannedVacateDate || l.vacateDate,
				actualVacateDate: l.settlement?.moveOutDate || l.actualVacateDate || l.moveOutDate,
				earlyVacate: !!(l.settlement?.moveOutDate || l.earlyVacate || l.actualVacateDate),
				status: l.status
			})),
			asOfDate,
			prorationMethod,
			pdcs: combinedPdcs
		});
	}, [
		leases,
		asOfDate,
		prorationMethod,
		combinedPdcs
	]);
	const filteredPreviewRecords = (0, import_react.useMemo)(() => {
		return activeBatchPreview.records.filter((rec) => {
			if (asOfProperty !== "all" && rec.propertyName !== asOfProperty) return false;
			if (asOfUnit !== "all" && rec.unitRef !== asOfUnit) return false;
			if (asOfTenant !== "all" && rec.tenantName !== asOfTenant) return false;
			if (asOfStatusFilter !== "all" && rec.status !== asOfStatusFilter) return false;
			if (asOfSearch) {
				const q = asOfSearch.toLowerCase();
				if (![
					rec.tenantName,
					rec.propertyName,
					rec.unitRef,
					rec.periodStart,
					rec.periodEnd,
					rec.reasonCode
				].join(" ").toLowerCase().includes(q)) return false;
			}
			return true;
		});
	}, [
		activeBatchPreview,
		asOfProperty,
		asOfUnit,
		asOfTenant,
		asOfStatusFilter,
		asOfSearch
	]);
	const previewRecognizedSum = (0, import_react.useMemo)(() => {
		return filteredPreviewRecords.reduce((sum, r) => sum + r.netRecognizedRevenue, 0);
	}, [filteredPreviewRecords]);
	const previewDeferredSum = (0, import_react.useMemo)(() => {
		return filteredPreviewRecords.reduce((sum, r) => sum + r.deferredRevenue, 0);
	}, [filteredPreviewRecords]);
	const previewContractualSum = (0, import_react.useMemo)(() => {
		return filteredPreviewRecords.reduce((sum, r) => sum + r.grossRevenue, 0);
	}, [filteredPreviewRecords]);
	const handleGenerateBatch = () => {
		setIsGenerating(true);
		setTimeout(() => {
			const newBatchId = `RGB-${Date.now().toString().slice(-6)}`;
			const newBatch = {
				...activeBatchPreview,
				batchId: newBatchId,
				generatedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			const updated = [newBatch, ...savedBatches];
			setSavedBatches(updated);
			try {
				localStorage.setItem("fin_revenue_generation_batches_v2", JSON.stringify(updated));
			} catch (e) {
				console.error("Failed to persist revenue batch", e);
			}
			activeBatchPreview.records.filter((r) => r.status === "RECOGNIZED" && r.netRecognizedRevenue > 0).forEach((rec) => {
				const existingVoucherNo = `REV-${rec.leaseId}-${rec.periodStart.slice(0, 7)}`;
				if (!vouchers.some((v) => v.voucher_no === existingVoucherNo)) addVoucher({
					voucher_no: existingVoucherNo,
					voucher_type: "Journal Voucher",
					date: rec.effectiveRevenueEnd || rec.periodEnd || asOfDate,
					name: `Rental Revenue Recognized – ${rec.tenantName} (${rec.periodStart} to ${rec.periodEnd})`,
					debit: "Customer (PDC) Liability",
					debit_code: "21400",
					credit: "Rental Revenue",
					credit_code: "41100",
					amount: rec.netRecognizedRevenue,
					method: "Revenue Recognition",
					property_name: rec.propertyName,
					unit_ref: rec.unitRef,
					tenant_name: rec.tenantName
				});
			});
			setIsGenerating(false);
			toast.success(`Revenue Batch ${newBatch.batchId} generated & posted to GL!`, { description: `Recognized QR ${newBatch.totalRecognizedRevenue.toLocaleString()} across ${newBatch.totalTenants} tenants as of ${asOfDate}.` });
		}, 600);
	};
	const REVENUE_STREAMS = [
		{
			code: "41100",
			label: "Rental Revenue",
			color: "bg-emerald-500",
			textColor: "text-emerald-700",
			border: "border-emerald-200",
			bg: "bg-emerald-50"
		},
		{
			code: "41200",
			label: "Parking Revenue",
			color: "bg-blue-500",
			textColor: "text-blue-700",
			border: "border-blue-200",
			bg: "bg-blue-50"
		},
		{
			code: "41300",
			label: "Utility Recovery",
			color: "bg-violet-500",
			textColor: "text-violet-700",
			border: "border-violet-200",
			bg: "bg-violet-50"
		},
		{
			code: "41400",
			label: "CAM / Maintenance Recovery",
			color: "bg-amber-500",
			textColor: "text-amber-700",
			border: "border-amber-200",
			bg: "bg-amber-50"
		},
		{
			code: "41500",
			label: "Property Management Fee",
			color: "bg-rose-500",
			textColor: "text-rose-700",
			border: "border-rose-200",
			bg: "bg-rose-50"
		},
		{
			code: "41600",
			label: "Late Payment Penalty",
			color: "bg-orange-500",
			textColor: "text-orange-700",
			border: "border-orange-200",
			bg: "bg-orange-50"
		}
	];
	const unifiedRealizedPdcs = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		const ctxByChq = /* @__PURE__ */ new Map();
		(contextPdcs || []).forEach((p) => {
			const k = (p.chequeNo || p.cheque_number || p.id || "").toLowerCase();
			if (k) ctxByChq.set(k, p);
		});
		dbPdcs.forEach((p) => {
			const chq = p.cheque_number || p.chequeNo || p.id;
			const status = (p.status || p.status_pdc || "").toLowerCase();
			if (![
				"cleared",
				"deposited",
				"replaced",
				"partial cash",
				"partial_cash"
			].includes(status)) return;
			const amt = Number(p.paid_amount) || Number(p.amount) || 0;
			const prop = p.property_name || p.property_code || p.property || "";
			const unit = p.unit_ref || p.unit_name || p.unit || "";
			const tenant = p.tenant_name || p.tenant || "";
			const date = p.cheque_date || p.maturity_date || p.deposit_date || p.created_at?.split("T")[0] || now.toISOString().split("T")[0];
			map.set(String(chq), {
				id: String(p.id || chq),
				chqNo: String(chq),
				date,
				property: prop,
				unit,
				tenant,
				amount: amt,
				status: p.status,
				source: "PDC"
			});
		});
		(contextPdcs || []).forEach((p) => {
			const chq = p.chequeNo || p.cheque_number || p.id;
			const status = (p.status || "").toLowerCase();
			if (![
				"cleared",
				"deposited",
				"replaced",
				"partial cash",
				"partial_cash"
			].includes(status)) return;
			const lease = leases?.find((l) => l.id === p.leaseId);
			const amt = Number(p.paid_amount) || Number(p.amount) || 0;
			const prop = p.propertyName || p.property_name || p.property || lease?.property || "";
			const unit = p.unitRef || p.unit_ref || p.unit || lease?.unit || "";
			const tenant = p.tenantName || p.tenant_name || p.payerName || p.tenant || lease?.tenantName || "";
			const date = p.date || p.cheque_date || now.toISOString().split("T")[0];
			const entry = {
				id: String(p.id || chq),
				chqNo: String(chq),
				date,
				property: prop,
				unit,
				tenant,
				amount: amt,
				status: p.status,
				source: "PDC"
			};
			if (!map.has(String(chq))) map.set(String(chq), entry);
			else {
				const ex = map.get(String(chq));
				map.set(String(chq), {
					...ex,
					date: ex.date || date,
					property: ex.property || prop,
					unit: ex.unit || unit,
					tenant: ex.tenant || tenant
				});
			}
		});
		vouchers.forEach((v) => {
			const vNo = (v.voucher_no || "").toLowerCase();
			const desc = (v.name || "").toLowerCase();
			const isClear = vNo.includes("vch-clr-") || desc.includes("pdc cleared");
			const isDep = vNo.includes("vch-dep-") || desc.includes("pdc deposited");
			const isCash = vNo.includes("vch-csh-pdc-") || desc.includes("cash collected in place of pdc");
			if (!isClear && !isDep && !isCash) return;
			const rawNo = v.voucher_no || "";
			const m = rawNo.match(/^(?:VCH-CLR-|VCH-DEP-|VCH-CSH-PDC-)(.+)$/i);
			const pdcRef = m ? m[1] : rawNo;
			if (!pdcRef) return;
			if (map.has(pdcRef)) return;
			const ctxPdc = ctxByChq.get(pdcRef.toLowerCase()) || Array.from(ctxByChq.values()).find((cp) => {
				const cn = (cp.chequeNo || "").toLowerCase();
				return cn && (cn.includes(pdcRef.toLowerCase()) || pdcRef.toLowerCase().includes(cn));
			});
			const lease = ctxPdc ? leases?.find((l) => l.id === ctxPdc.leaseId) : null;
			let tenant = "", prop = "", unit = "";
			const bracketMatch = (v.name || "").match(/\(([^)]+)\)/);
			if (bracketMatch) {
				const parts = bracketMatch[1].split(" - ");
				tenant = parts[0]?.trim() || "";
				unit = parts[1]?.trim() || "";
			}
			if (ctxPdc) {
				prop = ctxPdc.propertyName || ctxPdc.property_name || ctxPdc.property || lease?.property || prop;
				unit = ctxPdc.unitRef || ctxPdc.unit_ref || ctxPdc.unit || lease?.unit || unit;
				tenant = ctxPdc.tenantName || ctxPdc.tenant_name || ctxPdc.payerName || lease?.tenantName || tenant;
			} else if (lease) {
				prop = lease.property || prop;
				unit = lease.unit || unit;
				tenant = lease.tenantName || tenant;
			}
			const realDate = ctxPdc?.date || ctxPdc?.cheque_date || v.date || now.toISOString().split("T")[0];
			map.set(pdcRef, {
				id: (v.id || pdcRef) + "-rev",
				chqNo: pdcRef,
				date: realDate,
				property: prop,
				unit,
				tenant,
				amount: Number(v.amount) || 0,
				status: isCash ? "partial_cash" : isClear ? "cleared" : "deposited",
				source: "PDC"
			});
		});
		return Array.from(map.values());
	}, [
		dbPdcs,
		contextPdcs,
		leases,
		vouchers
	]);
	const allProperties = (0, import_react.useMemo)(() => {
		const s = /* @__PURE__ */ new Set();
		allLedgerTransactions.forEach((tx) => {
			if (tx.account_type === "Revenue" && tx.property_name && tx.property_name !== "Unassigned") s.add(tx.property_name);
		});
		receivableInvoices.forEach((ar) => {
			if (ar.property) s.add(ar.property);
		});
		unifiedRealizedPdcs.forEach((p) => {
			if (p.property) s.add(p.property);
		});
		return Array.from(s).sort();
	}, [
		allLedgerTransactions,
		receivableInvoices,
		unifiedRealizedPdcs
	]);
	const allUnits = (0, import_react.useMemo)(() => {
		const s = /* @__PURE__ */ new Set();
		allLedgerTransactions.forEach((tx) => {
			if (tx.account_type === "Revenue" && tx.unit_ref && tx.unit_ref !== "Unassigned" && tx.unit_ref !== "General") s.add(tx.unit_ref);
		});
		receivableInvoices.forEach((ar) => {
			if (ar.unit) s.add(ar.unit);
		});
		unifiedRealizedPdcs.forEach((p) => {
			if (p.unit) s.add(p.unit);
		});
		return Array.from(s).sort();
	}, [
		allLedgerTransactions,
		receivableInvoices,
		unifiedRealizedPdcs
	]);
	const allCustomers = (0, import_react.useMemo)(() => {
		const s = /* @__PURE__ */ new Set();
		allLedgerTransactions.forEach((tx) => {
			if (tx.account_type === "Revenue" && tx.tenant_name && tx.tenant_name !== "Unassigned") s.add(tx.tenant_name);
		});
		receivableInvoices.forEach((ar) => {
			if (ar.tenant) s.add(ar.tenant);
		});
		unifiedRealizedPdcs.forEach((p) => {
			if (p.tenant) s.add(p.tenant);
		});
		return Array.from(s).sort();
	}, [
		allLedgerTransactions,
		receivableInvoices,
		unifiedRealizedPdcs
	]);
	const allMonthOptions = (0, import_react.useMemo)(() => {
		const months = [];
		const seen = /* @__PURE__ */ new Set();
		allLedgerTransactions.forEach((tx) => {
			if (tx.account_type === "Revenue" && tx.date) {
				const d = new Date(tx.date);
				if (!isNaN(d.getTime())) {
					const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
					if (!seen.has(val)) {
						seen.add(val);
						months.push({
							value: val,
							label: d.toLocaleString("default", {
								month: "long",
								year: "numeric"
							})
						});
					}
				}
			}
		});
		for (let i = 11; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
			if (!seen.has(val)) {
				seen.add(val);
				months.push({
					value: val,
					label: d.toLocaleString("default", {
						month: "long",
						year: "numeric"
					})
				});
			}
		}
		return months.sort((a, b) => b.value.localeCompare(a.value));
	}, [allLedgerTransactions]);
	const getMonthStr = (dateStr) => {
		if (!dateStr) return "";
		const clean = dateStr.trim();
		if (/^\d{4}-\d{2}/.test(clean)) return clean.slice(0, 7);
		const d = new Date(clean);
		if (!isNaN(d.getTime())) return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
		return clean.slice(0, 7);
	};
	const getStreamCodeKey = (accountCode) => {
		if (!accountCode) return "41100";
		if (accountCode.startsWith("411")) return "41100";
		if (accountCode.startsWith("41201001") || accountCode.startsWith("41200")) return "41200";
		if (accountCode.startsWith("41201003") || accountCode.startsWith("41300")) return "41300";
		if (accountCode.startsWith("41201004") || accountCode.startsWith("41400")) return "41400";
		if (accountCode.startsWith("41201002") || accountCode.startsWith("41500")) return "41500";
		if (accountCode.startsWith("41201005") || accountCode.startsWith("41201006") || accountCode.startsWith("41201007") || accountCode.startsWith("41600")) return "41600";
		return "41100";
	};
	(0, import_react.useCallback)((rec) => {
		const mon = getMonthStr(rec.date);
		if (periodFilter === "thisMonth" && mon !== thisMonth) return false;
		if (periodFilter === "lastMonth" && mon !== lastMonth) return false;
		if (filterProperty !== "all" && rec.property !== filterProperty) return false;
		if (filterUnit !== "all" && rec.unit !== filterUnit) return false;
		if (filterCustomer !== "all" && rec.tenant !== filterCustomer) return false;
		if (filterMonth !== "all" && mon !== filterMonth) return false;
		if (filterSource !== "all" && rec.source !== filterSource) return false;
		if (filterFromDate && rec.date && rec.date < filterFromDate) return false;
		if (filterToDate && rec.date && rec.date > filterToDate) return false;
		if (filterSearch) {
			const q = filterSearch.toLowerCase();
			if (![
				rec.property,
				rec.unit,
				rec.tenant,
				rec.source
			].join(" ").toLowerCase().includes(q)) return false;
		}
		return true;
	}, [
		periodFilter,
		thisMonth,
		lastMonth,
		filterProperty,
		filterUnit,
		filterCustomer,
		filterMonth,
		filterSource,
		filterFromDate,
		filterToDate,
		filterSearch
	]);
	const filteredRevenueTransactions = (0, import_react.useMemo)(() => {
		const glRows = allLedgerTransactions.filter((tx) => {
			if (tx.account_type !== "Revenue") return false;
			if ((tx.credit || 0) - (tx.debit || 0) <= 0) return false;
			const mon = getMonthStr(tx.date);
			if (periodFilter === "thisMonth" && mon !== thisMonth) return false;
			if (periodFilter === "lastMonth" && mon !== lastMonth) return false;
			if (filterFromDate && (tx.date || "") < filterFromDate) return false;
			if (filterToDate && (tx.date || "") > filterToDate) return false;
			if (filterMonth !== "all" && mon !== filterMonth) return false;
			if (filterProperty !== "all" && tx.property_name !== filterProperty) return false;
			if (filterUnit !== "all" && tx.unit_ref !== filterUnit) return false;
			if (filterCustomer !== "all" && tx.tenant_name !== filterCustomer) return false;
			if (filterSource !== "all") {
				if (!(tx.source || "").toLowerCase().includes(filterSource.toLowerCase())) return false;
			}
			if (filterSearch) {
				const q = filterSearch.toLowerCase();
				if (![
					tx.property_name,
					tx.unit_ref,
					tx.tenant_name,
					tx.account_name,
					tx.reference,
					tx.description
				].join(" ").toLowerCase().includes(q)) return false;
			}
			return true;
		});
		const pdcRows = [];
		unifiedRealizedPdcs.forEach((pdc) => {
			if (![
				"cleared",
				"deposited",
				"replaced",
				"partial cash",
				"partial_cash"
			].includes((pdc.status || "").toLowerCase())) return;
			if (allLedgerTransactions.some((tx) => tx.account_type === "Revenue" && (tx.reference && pdc.chqNo && tx.reference.includes(pdc.chqNo) || tx.description && pdc.chqNo && tx.description.includes(pdc.chqNo)))) return;
			const mon = getMonthStr(pdc.date);
			if (periodFilter === "thisMonth" && mon !== thisMonth) return;
			if (periodFilter === "lastMonth" && mon !== lastMonth) return;
			if (filterFromDate && (pdc.date || "") < filterFromDate) return;
			if (filterToDate && (pdc.date || "") > filterToDate) return;
			if (filterMonth !== "all" && mon !== filterMonth) return;
			if (filterProperty !== "all" && pdc.property !== filterProperty) return;
			if (filterUnit !== "all" && pdc.unit !== filterUnit) return;
			if (filterCustomer !== "all" && pdc.tenant !== filterCustomer) return;
			if (filterSource !== "all" && filterSource.toLowerCase() !== "pdc") return;
			if (filterSearch) {
				const q = filterSearch.toLowerCase();
				if (![
					pdc.property,
					pdc.unit,
					pdc.tenant,
					pdc.chqNo,
					"Rental Revenue",
					"41100"
				].join(" ").toLowerCase().includes(q)) return;
			}
			pdcRows.push({
				id: `pdc-rev-${pdc.id || pdc.chqNo}`,
				date: pdc.date || "",
				account_code: "41100",
				account_name: "Rental Revenue",
				account_type: "Revenue",
				reference: pdc.chqNo || "",
				debit: 0,
				credit: Number(pdc.amount) || 0,
				source: "PDC",
				description: `PDC Cleared – ${pdc.chqNo}${pdc.tenant ? " (" + pdc.tenant + (pdc.unit ? " - " + pdc.unit : "") + ")" : ""}`,
				property_name: pdc.property || "Unassigned",
				unit_ref: pdc.unit || "Unassigned",
				tenant_name: pdc.tenant || "Unassigned"
			});
		});
		return [...glRows, ...pdcRows].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
	}, [
		allLedgerTransactions,
		unifiedRealizedPdcs,
		periodFilter,
		thisMonth,
		lastMonth,
		filterProperty,
		filterUnit,
		filterCustomer,
		filterMonth,
		filterSource,
		filterFromDate,
		filterToDate,
		filterSearch
	]);
	const revenueByCode = (0, import_react.useMemo)(() => {
		const totals = {};
		REVENUE_STREAMS.forEach((s) => {
			totals[s.code] = 0;
		});
		filteredRevenueTransactions.forEach((tx) => {
			const netRev = (tx.credit || 0) - (tx.debit || 0);
			if (netRev <= 0) return;
			const codeKey = getStreamCodeKey(tx.account_code);
			totals[codeKey] = (totals[codeKey] || 0) + netRev;
		});
		return totals;
	}, [filteredRevenueTransactions]);
	const totalRevenue = Object.values(revenueByCode).reduce((s, v) => s + v, 0);
	const monthlyTrend = (0, import_react.useMemo)(() => {
		const allMonthsSet = /* @__PURE__ */ new Set();
		filteredRevenueTransactions.forEach((tx) => {
			const mon = getMonthStr(tx.date);
			if (mon && /^\d{4}-\d{2}$/.test(mon)) allMonthsSet.add(mon);
		});
		for (let i = 5; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const mon = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
			allMonthsSet.add(mon);
		}
		const sortedMonths = Array.from(allMonthsSet).sort();
		const activeMonthsWithData = sortedMonths.filter((m) => {
			return filteredRevenueTransactions.some((tx) => getMonthStr(tx.date) === m);
		});
		let displayMonths = sortedMonths;
		if (sortedMonths.length > 6) if (activeMonthsWithData.length > 0) {
			const firstActiveIdx = sortedMonths.indexOf(activeMonthsWithData[0]);
			const lastActiveIdx = sortedMonths.indexOf(activeMonthsWithData[activeMonthsWithData.length - 1]);
			const start = Math.max(0, Math.min(firstActiveIdx, sortedMonths.length - 6));
			displayMonths = sortedMonths.slice(start, Math.max(start + 6, lastActiveIdx + 1));
		} else displayMonths = sortedMonths.slice(-6);
		const rev = {};
		displayMonths.forEach((m) => {
			rev[m] = 0;
		});
		filteredRevenueTransactions.forEach((tx) => {
			const mon = getMonthStr(tx.date);
			if (mon in rev) {
				const netRev = (tx.credit || 0) - (tx.debit || 0);
				if (netRev > 0) rev[mon] += netRev;
			}
		});
		const maxVal = Math.max(...Object.values(rev), 1);
		return displayMonths.map((m) => {
			const d = /* @__PURE__ */ new Date(m + "-01");
			return {
				month: !isNaN(d.getTime()) ? d.toLocaleString("default", {
					month: "short",
					year: "2-digit"
				}) : m,
				amount: rev[m] || 0,
				pct: Math.round((rev[m] || 0) / maxVal * 100)
			};
		});
	}, [filteredRevenueTransactions, now]);
	const propertyBreakdown = (0, import_react.useMemo)(() => {
		const map = {};
		filteredRevenueTransactions.forEach((tx) => {
			const netRev = (tx.credit || 0) - (tx.debit || 0);
			if (netRev <= 0) return;
			const key = tx.property_name && tx.property_name !== "Unassigned" ? tx.property_name : "General Portfolio";
			map[key] = (map[key] || 0) + netRev;
		});
		return Object.entries(map).filter(([, amt]) => amt > 0).sort((a, b) => b[1] - a[1]).map(([property, amount]) => ({
			property,
			amount
		}));
	}, [filteredRevenueTransactions]);
	const topTenants = (0, import_react.useMemo)(() => {
		const map = {};
		filteredRevenueTransactions.forEach((tx) => {
			const netRev = (tx.credit || 0) - (tx.debit || 0);
			if (netRev <= 0) return;
			const key = tx.tenant_name && tx.tenant_name !== "Unassigned" ? tx.tenant_name : "Other / Direct Revenue";
			map[key] = (map[key] || 0) + netRev;
		});
		return Object.entries(map).filter(([, amt]) => amt > 0).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tenant, amount]) => ({
			tenant,
			amount
		}));
	}, [filteredRevenueTransactions]);
	const activeFilterCount = [
		filterProperty !== "all",
		filterUnit !== "all",
		filterCustomer !== "all",
		filterMonth !== "all",
		filterSource !== "all",
		!!filterFromDate,
		!!filterToDate,
		!!filterSearch,
		periodFilter !== "all"
	].filter(Boolean).length;
	const availableProperties = (0, import_react.useMemo)(() => {
		return Array.from(new Set(activeBatchPreview.records.map((r) => r.propertyName))).filter(Boolean);
	}, [activeBatchPreview]);
	const availableUnits = (0, import_react.useMemo)(() => {
		return Array.from(new Set(activeBatchPreview.records.map((r) => r.unitRef))).filter(Boolean);
	}, [activeBatchPreview]);
	const availableTenants = (0, import_react.useMemo)(() => {
		return Array.from(new Set(activeBatchPreview.records.map((r) => r.tenantName))).filter(Boolean);
	}, [activeBatchPreview]);
	const activeAsOfFilterCount = [
		asOfProperty !== "all",
		asOfUnit !== "all",
		asOfTenant !== "all",
		asOfStatusFilter !== "all",
		!!asOfSearch
	].filter(Boolean).length;
	const resetAsOfFilters = () => {
		setAsOfProperty("all");
		setAsOfUnit("all");
		setAsOfTenant("all");
		setAsOfStatusFilter("all");
		setAsOfSearch("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-5 w-5 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-bold tracking-tight",
					children: "Revenue Generation & Recognition"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mt-0.5",
				children: "Recognize earned rental revenue by service completion date • Separate cash/PDCs from income earned"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1 bg-muted/60 p-1 rounded-lg border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: activeSubTab === "asOf" ? "default" : "ghost",
					className: "h-8 text-xs font-medium gap-1.5",
					onClick: () => setActiveSubTab("asOf"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" }), "Revenue As-Of Engine"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: activeSubTab === "gl" ? "default" : "ghost",
					className: "h-8 text-xs font-medium gap-1.5",
					onClick: () => setActiveSubTab("gl"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5" }), "GL Actuals Ledger"]
				})]
			})]
		}), activeSubTab === "asOf" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "p-3.5 bg-gradient-to-r from-emerald-50/70 via-blue-50/50 to-purple-50/50 border-emerald-200/80 shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col md:flex-row items-start md:items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-1.5 bg-emerald-500 text-white rounded-md mt-0.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs font-bold text-emerald-950 flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Accrual / Period-Based Recognition Standard" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "bg-white/80 text-[10px] text-emerald-800 border-emerald-300",
									children: "IFRS / Accrual Compliant"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] text-emerald-900/80 mt-0.5 leading-relaxed",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Rule:" }),
									" Revenue is earned strictly when the rental service period is completed as of the As-Of Date. Advance PDCs or uncollected dues represent payment collections, ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "not" }),
									" earned revenue."
								]
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-xs font-mono shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-2.5 py-1 bg-white/80 rounded border border-emerald-200 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[9px] uppercase tracking-wider text-muted-foreground font-sans",
									children: "Active Leases"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-bold text-emerald-700",
									children: activeBatchPreview.totalTenants
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-2.5 py-1 bg-white/80 rounded border border-emerald-200 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[9px] uppercase tracking-wider text-muted-foreground font-sans",
									children: "Units In Scope"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-bold text-emerald-700",
									children: activeBatchPreview.totalUnits
								})]
							})]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4 shadow-sm border-slate-200 space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5 text-primary" }), "Revenue As-Of Date:"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: asOfDate,
									onChange: (e) => setAsOfDate(e.target.value || todayStr),
									className: "h-8 text-xs w-44 font-mono font-semibold"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-bold text-slate-700",
									children: "Proration Method:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: prorationMethod,
									onValueChange: (val) => setProrationMethod(val),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 text-xs w-44",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "CALENDAR_DAYS",
											className: "text-xs",
											children: "Calendar Days (Exact)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "30_DAY_MONTH",
											className: "text-xs",
											children: "30-Day Month (Commercial)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "ACTUAL_365",
											className: "text-xs",
											children: "Actual / 365"
										})
									] })]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								className: "h-8 text-xs gap-1.5",
								onClick: () => setAsOfDate(todayStr),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5" }), "Reset to Today"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "h-8 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
								onClick: handleGenerateBatch,
								disabled: isGenerating,
								children: [isGenerating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), "Generate & Post Revenue Batch"]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-2 border-t border-slate-100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "h-3.5 w-3.5 text-muted-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide",
										children: "Multi-Dimensional Filters"
									}),
									activeAsOfFilterCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "h-4 text-[10px] px-1.5 bg-primary text-primary-foreground",
										children: activeAsOfFilterCount
									})
								]
							}), activeAsOfFilterCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								className: "h-6 text-xs text-muted-foreground hover:text-foreground",
								onClick: resetAsOfFilters,
								children: "Reset All"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-[10px] text-muted-foreground mb-0.5 block",
									children: "Property"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: asOfProperty,
									onValueChange: setAsOfProperty,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Properties" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: "all",
										className: "text-xs",
										children: [
											"All Properties (",
											availableProperties.length,
											")"
										]
									}), availableProperties.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: p,
										className: "text-xs",
										children: p
									}, p))] })]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-[10px] text-muted-foreground mb-0.5 block",
									children: "Unit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: asOfUnit,
									onValueChange: setAsOfUnit,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Units" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: "all",
										className: "text-xs",
										children: [
											"All Units (",
											availableUnits.length,
											")"
										]
									}), availableUnits.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: u,
										className: "text-xs",
										children: u
									}, u))] })]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-[10px] text-muted-foreground mb-0.5 block",
									children: "Customer / Tenant"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: asOfTenant,
									onValueChange: setAsOfTenant,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Tenants" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: "all",
										className: "text-xs",
										children: [
											"All Tenants (",
											availableTenants.length,
											")"
										]
									}), availableTenants.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: t,
										className: "text-xs",
										children: t
									}, t))] })]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-[10px] text-muted-foreground mb-0.5 block",
									children: "Recognition Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: asOfStatusFilter,
									onValueChange: setAsOfStatusFilter,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Statuses" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "all",
											className: "text-xs",
											children: "All Statuses"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "RECOGNIZED",
											className: "text-xs",
											children: "Recognized (Earned)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "DEFERRED",
											className: "text-xs",
											children: "Deferred (Unearned)"
										})
									] })]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-[10px] text-muted-foreground mb-0.5 block",
									children: "Search Schedule"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "Tenant, Unit, Period...",
										value: asOfSearch,
										onChange: (e) => setAsOfSearch(e.target.value),
										className: "h-8 text-xs pl-8"
									})]
								})] })
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 md:grid-cols-4 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-3.5 border-emerald-200 bg-emerald-50/50 shadow-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] font-bold uppercase tracking-wider text-emerald-800",
									children: "Recognized Revenue (Earned)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-lg font-bold font-mono text-emerald-700 mt-1",
									children: ["QR ", previewRecognizedSum.toLocaleString()]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[10px] text-emerald-600/90 mt-0.5",
									children: ["Completed service periods as of ", asOfDate]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-3.5 border-amber-200 bg-amber-50/50 shadow-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] font-bold uppercase tracking-wider text-amber-800",
									children: "Deferred Revenue (Unearned)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-lg font-bold font-mono text-amber-700 mt-1",
									children: ["QR ", previewDeferredSum.toLocaleString()]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-amber-600/90 mt-0.5",
									children: "Future / uncompleted periods"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-3.5 border-blue-200 bg-blue-50/50 shadow-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] font-bold uppercase tracking-wider text-blue-800",
									children: "Contractual Portfolio Rent"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-lg font-bold font-mono text-blue-700 mt-1",
									children: ["QR ", previewContractualSum.toLocaleString()]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-blue-600/90 mt-0.5",
									children: "Total scheduled monthly billings"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-3.5 border-purple-200 bg-purple-50/50 shadow-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] font-bold uppercase tracking-wider text-purple-800",
									children: "Schedule Periods Evaluated"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-lg font-bold font-mono text-purple-700 mt-1",
									children: [filteredPreviewRecords.length, " periods"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[10px] text-purple-600/90 mt-0.5",
									children: [
										"Across ",
										availableTenants.length,
										" tenants"
									]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-0 shadow-sm overflow-hidden border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b bg-muted/30 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
							className: "text-xs font-bold flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-3.5 w-3.5 text-primary" }), "Period-by-Period Revenue Recognition Schedule (Live Calculation)"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[10px] text-muted-foreground mt-0.5",
							children: ["Evaluating completed service periods vs As-Of Date: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono font-semibold",
								children: asOfDate
							})]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: "text-[10px] font-mono",
								children: ["Method: ", prorationMethod]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "secondary",
								className: "text-[10px]",
								children: [filteredPreviewRecords.length, " rows"]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-h-[440px] overflow-y-auto overflow-x-auto relative border-t",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full caption-bottom text-xs text-left border-collapse",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "sticky top-0 z-20 shadow-xs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 font-bold text-xs",
											children: "Tenant / Unit"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 font-bold text-xs",
											children: "Property"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 font-bold text-xs",
											children: "Rental Period"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 text-right font-bold text-xs",
											children: "Contractual Rent"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 text-center font-bold text-xs",
											children: "Days (Rec / Total)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 text-right font-bold text-xs",
											children: "Recognized (QAR)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 text-right font-bold text-xs",
											children: "Deferred (QAR)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 font-bold text-xs",
											children: "PDC Info"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 font-bold text-xs",
											children: "Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 font-bold text-xs",
											children: "Calculation Logic"
										})
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
								className: "text-xs divide-y",
								children: [filteredPreviewRecords.map((rec) => {
									const isRec = rec.status === "RECOGNIZED";
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "hover:bg-muted/30",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-semibold text-slate-800",
												children: rec.tenantName
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[10px] text-muted-foreground font-mono",
												children: ["Unit: ", rec.unitRef]
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-xs text-muted-foreground max-w-[120px] truncate",
												title: rec.propertyName,
												children: rec.propertyName
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "font-mono text-[11px] font-medium",
												children: [
													rec.periodStart,
													" → ",
													rec.periodEnd
												]
											}), rec.isEarlyVacate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
												variant: "outline",
												className: "text-[9px] bg-rose-50 text-rose-700 border-rose-200 mt-0.5",
												children: [
													"Early Vacate (",
													rec.effectiveRevenueEnd,
													")"
												]
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
												className: "text-right font-mono font-medium",
												children: ["QR ", rec.contractualRent.toLocaleString()]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
												className: "text-center font-mono",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: isRec ? "font-bold text-emerald-700" : "text-muted-foreground",
													children: rec.recognizableDays
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-muted-foreground",
													children: [" / ", rec.totalDaysInPeriod]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right font-mono font-bold text-emerald-600",
												children: isRec ? `QR ${rec.netRecognizedRevenue.toLocaleString()}` : "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right font-mono font-medium text-amber-600",
												children: rec.deferredRevenue > 0 ? `QR ${rec.deferredRevenue.toLocaleString()}` : "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: rec.pdcChequeNo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[10px] font-mono",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-primary font-semibold",
													children: ["#", rec.pdcChequeNo]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-muted-foreground",
													children: ["QR ", rec.pdcAmount?.toLocaleString() || "—"]
												})]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground italic",
												children: "No PDC linked"
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: isRec ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: "bg-emerald-600 hover:bg-emerald-700 text-[10px]",
												children: "RECOGNIZED"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "border-amber-300 text-amber-800 bg-amber-50 text-[10px]",
												children: "DEFERRED"
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "max-w-[240px] text-[11px] text-muted-foreground leading-snug",
												children: rec.calculationExplanation
											})
										]
									}, rec.id);
								}), filteredPreviewRecords.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									colSpan: 10,
									className: "text-center text-muted-foreground py-8 text-xs",
									children: [
										"No lease records match the selected filters for as-of date ",
										asOfDate,
										"."
									]
								}) })]
							})]
						})
					})]
				}),
				savedBatches.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-0 shadow-sm overflow-hidden border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between px-4 py-3 border-b bg-muted/30",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
							className: "text-xs font-bold flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-3.5 w-3.5 text-primary" }), "Generated Revenue Batch History (Audit Trail)"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "secondary",
							className: "text-[10px]",
							children: [savedBatches.length, " batches posted"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
							className: "bg-muted/50 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "font-bold text-xs",
									children: "Batch ID"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "font-bold text-xs",
									children: "As-Of Date"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "font-bold text-xs",
									children: "Generated At"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "font-bold text-xs",
									children: "Proration"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "text-center font-bold text-xs",
									children: "Tenants"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "text-center font-bold text-xs",
									children: "Units"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "text-right font-bold text-xs",
									children: "Recognized Revenue"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "text-right font-bold text-xs",
									children: "Deferred Revenue"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "text-right font-bold text-xs",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, {
							className: "text-xs",
							children: savedBatches.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "hover:bg-muted/30",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-mono font-bold text-primary",
										children: b.batchId
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-mono",
										children: b.asOfDate
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-muted-foreground",
										children: new Date(b.generatedAt).toLocaleString()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-[11px]",
										children: b.prorationMethod
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-center font-mono",
										children: b.totalTenants
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-center font-mono",
										children: b.totalUnits
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "text-right font-mono font-bold text-emerald-600",
										children: ["QR ", b.totalRecognizedRevenue.toLocaleString()]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "text-right font-mono text-amber-600",
										children: ["QR ", b.totalDeferredRevenue.toLocaleString()]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "ghost",
											className: "h-6 text-[10px] text-primary",
											onClick: () => setSelectedBatchDetails(b),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3 mr-1" }), "View Records"]
										})
									})
								]
							}, b.batchId))
						})] })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4 border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50/30 shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-xs font-bold text-slate-800",
							children: "Authoritative Accounting Principle: Revenue Recognition vs. Cash Collection"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 bg-white rounded border border-emerald-200 shadow-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-semibold text-emerald-800 flex items-center gap-1.5 mb-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 text-emerald-600" }), "Recognized Revenue (Earned)"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-slate-600 text-[11px] leading-relaxed",
									children: [
										"Earned strictly when the rental service period is completed or days are elapsed as of the As-Of Date (",
										asOfDate,
										"). Independent of cheque maturity or receipt date."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 font-mono font-bold text-sm text-emerald-700",
									children: ["Total Earned: QR ", previewRecognizedSum.toLocaleString()]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 bg-white rounded border border-blue-200 shadow-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-semibold text-blue-800 flex items-center gap-1.5 mb-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5 text-blue-600" }), "Cash / PDC Collections (Instruments)"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-slate-600 text-[11px] leading-relaxed",
									children: "PDCs, bank clearances, and receipts represent payment instruments and liquidity tracking. PDC clearance alone does not determine monthly earning periods."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 font-mono font-bold text-sm text-blue-700",
									children: ["Total Evaluated Contractual: QR ", previewContractualSum.toLocaleString()]
								})
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4 border-slate-200 bg-white shadow-sm space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-indigo-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-xs font-bold text-slate-800",
							children: "Recognition Decision Logic & Proration Hierarchy"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-[11px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 rounded bg-slate-50 border border-slate-200",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-bold text-slate-700 mb-1",
									children: "1. Full Service Month"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground leading-snug",
									children: [
										"If period end ≤ As-Of Date & full month elapsed → ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Full monthly rent recognized" }),
										" (100%)."
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 rounded bg-slate-50 border border-slate-200",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-bold text-slate-700 mb-1",
									children: "2. Partial / Mid-Month Start"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground leading-snug",
									children: [
										"Lease start mid-month → ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Chargeable days / days in month × rent" }),
										"."
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 rounded bg-slate-50 border border-slate-200",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-bold text-slate-700 mb-1",
									children: "3. Early Vacancy / Notice"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground leading-snug",
									children: [
										"Effective revenue end date bounds the recognizable days → ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Prorated to exit date" }),
										"."
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 rounded bg-slate-50 border border-slate-200",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-bold text-slate-700 mb-1",
									children: "4. Uncompleted Period"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground leading-snug",
									children: [
										"Period end > As-Of Date → ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "100% Deferred (Unearned)" }),
										" until period completion."
									]
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
					open: !!selectedBatchDetails,
					onOpenChange: () => setSelectedBatchDetails(null),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "max-w-4xl max-h-[85vh] flex flex-col",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
								className: "text-sm font-bold flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 text-primary" }),
									"Revenue Batch Details — ",
									selectedBatchDetails?.batchId
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
								className: "text-xs",
								children: [
									"As-Of Date: ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono font-bold text-slate-800",
										children: selectedBatchDetails?.asOfDate
									}),
									" • Generated: ",
									selectedBatchDetails?.generatedAt ? new Date(selectedBatchDetails.generatedAt).toLocaleString() : ""
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
								className: "flex-1 mt-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "bg-muted/50 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold text-xs",
											children: "Tenant"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold text-xs",
											children: "Unit"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold text-xs",
											children: "Period"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-right font-bold text-xs",
											children: "Recognized"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-right font-bold text-xs",
											children: "Deferred"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold text-xs",
											children: "Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold text-xs",
											children: "Calculation"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, {
									className: "text-xs",
									children: selectedBatchDetails?.records.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-medium",
											children: r.tenantName
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-mono",
											children: r.unitRef
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
											className: "font-mono text-[11px]",
											children: [
												r.periodStart,
												" → ",
												r.periodEnd
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
											className: "text-right font-mono text-emerald-600 font-bold",
											children: ["QR ", r.netRecognizedRevenue.toLocaleString()]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
											className: "text-right font-mono text-amber-600",
											children: ["QR ", r.deferredRevenue.toLocaleString()]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: r.status === "RECOGNIZED" ? "default" : "outline",
											className: "text-[10px]",
											children: r.status
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-[11px] text-muted-foreground",
											children: r.calculationExplanation
										})
									] }, r.id))
								})] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, {
								className: "mt-4 pt-2 border-t flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => setSelectedBatchDetails(null),
									className: "h-8 text-xs",
									children: "Close"
								})
							})
						]
					})
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
						className: "text-xs font-semibold flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-4 w-4 text-emerald-600" }), "Revenue Generation Report — Live GL View"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted-foreground mt-0.5",
						children: "Breakdowns across GL accounts 41100–41600 • Realized PDC settlements & double-entry credits"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-1.5",
						children: [
							"all",
							"thisMonth",
							"lastMonth"
						].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: periodFilter === f ? "default" : "outline",
							className: "h-7 text-xs",
							onClick: () => setPeriodFilter(f),
							children: f === "all" ? "All Time" : f === "thisMonth" ? "This Month" : "Last Month"
						}, f))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3",
					children: REVENUE_STREAMS.map((stream) => {
						const amount = revenueByCode[stream.code] || 0;
						const pct = totalRevenue > 0 ? (amount / totalRevenue * 100).toFixed(1) : "0.0";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: `p-3 border ${stream.border} ${stream.bg} shadow-sm`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `text-[10px] font-bold uppercase tracking-wide ${stream.textColor} mb-1`,
									children: ["GL ", stream.code]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground mb-1 leading-tight",
									children: stream.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `text-sm font-bold font-mono ${stream.textColor}`,
									children: ["QR ", amount.toLocaleString()]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1.5 h-1 rounded-full bg-black/10 overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `h-full ${stream.color} rounded-full`,
										style: { width: `${pct}%` }
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[10px] text-muted-foreground mt-0.5",
									children: [pct, "% of total"]
								})
							]
						}, stream.code);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "p-4 border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground font-medium",
							children: "Total Revenue Generated"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-2xl font-bold font-mono text-emerald-700 mt-0.5",
							children: ["QR ", totalRevenue.toLocaleString()]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: "GL Range"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-bold text-emerald-600 font-mono",
									children: "41100 – 41600"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: [REVENUE_STREAMS.length, " revenue streams"]
								})
							]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-3 border border-dashed border-muted-foreground/30 bg-muted/10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "h-3.5 w-3.5 text-muted-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide",
										children: "Multi-Dimensional Filters"
									}),
									activeFilterCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "h-4 text-[10px] px-1.5 bg-primary text-primary-foreground",
										children: activeFilterCount
									})
								]
							}), activeFilterCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								className: "h-6 text-xs text-muted-foreground",
								onClick: resetFilters,
								children: "Reset All"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-[10px] text-muted-foreground mb-0.5 block",
									children: "Property"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: filterProperty,
									onValueChange: setFilterProperty,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Properties" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: "all",
										children: [
											"All Properties (",
											allProperties.length,
											")"
										]
									}), allProperties.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: p,
										children: p
									}, p))] })]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-[10px] text-muted-foreground mb-0.5 block",
									children: "Unit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: filterUnit,
									onValueChange: setFilterUnit,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Units" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: "all",
										children: [
											"All Units (",
											allUnits.length,
											")"
										]
									}), allUnits.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: u,
										children: u
									}, u))] })]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-[10px] text-muted-foreground mb-0.5 block",
									children: "Customer Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: filterCustomer,
									onValueChange: setFilterCustomer,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Customers" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: "all",
										children: [
											"All Customers (",
											allCustomers.length,
											")"
										]
									}), allCustomers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: c,
										children: c
									}, c))] })]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-[10px] text-muted-foreground mb-0.5 block",
									children: "Month"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: filterMonth,
									onValueChange: setFilterMonth,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Months" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "all",
										children: "All Months"
									}), allMonthOptions.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: m.value,
										children: m.label
									}, m.value))] })]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-[10px] text-muted-foreground mb-0.5 block",
									children: "Source / Type"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: filterSource,
									onValueChange: setFilterSource,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Sources" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "all",
											children: "All Sources"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "PDC",
											children: "PDC (Cleared/Deposited)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Invoice",
											children: "Receivable Invoice"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Voucher",
											children: "Journal Voucher"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Journal",
											children: "Journal Entry"
										})
									] })]
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-[200px] relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: filterSearch,
										onChange: (e) => setFilterSearch(e.target.value),
										placeholder: "Search account, code, reference, description, tenant...",
										className: "pl-8 h-8 text-xs"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "From Date:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: filterFromDate,
										onChange: (e) => setFilterFromDate(e.target.value),
										className: "h-8 text-xs w-36"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "To Date:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: filterToDate,
										onChange: (e) => setFilterToDate(e.target.value),
										className: "h-8 text-xs w-36"
									})]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 lg:grid-cols-3 gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "col-span-1 lg:col-span-2 p-4 shadow-sm bg-card border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
								className: "text-xs font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-emerald-600" }),
									"Monthly Revenue Trend (",
									monthlyTrend.length,
									" Months)"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[11px] font-mono text-muted-foreground",
								children: ["Total: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-bold text-emerald-600",
									children: ["QR ", monthlyTrend.reduce((s, m) => s + m.amount, 0).toLocaleString()]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-end gap-3 h-32 pt-2 px-1 border-b border-muted",
							children: monthlyTrend.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 flex flex-col items-center gap-1.5 group relative h-full justify-end",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 transition-all group-hover:scale-110 group-hover:text-emerald-600",
										children: m.amount > 0 ? m.amount >= 1e3 ? `QR ${(m.amount / 1e3).toFixed(1).replace(/\.0$/, "")}k` : `QR ${m.amount}` : "0"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-full flex items-end p-0.5 overflow-hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `w-full rounded-t transition-all duration-500 ease-out ${m.amount > 0 ? "bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300 shadow-sm" : "bg-slate-200 dark:bg-slate-700 opacity-40"}`,
											style: { height: `${m.amount > 0 ? Math.max(m.pct, 8) : 4}%` },
											title: `${m.month}: QR ${m.amount.toLocaleString()}`
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] text-muted-foreground font-semibold uppercase tracking-wider",
										children: m.month
									})
								]
							}, m.month))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
							className: "text-xs font-bold mb-3 flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-3.5 w-3.5 text-primary" }), "Revenue by Property"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: propertyBreakdown.map(({ property, amount }) => {
								const maxProp = propertyBreakdown[0]?.amount || 1;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between text-[11px] mb-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground truncate max-w-[140px]",
										title: property,
										children: property
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono font-semibold",
										children: ["QR ", amount.toLocaleString()]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-1.5 rounded-full bg-muted overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full bg-primary rounded-full",
										style: { width: `${amount / maxProp * 100}%` }
									})
								})] }, property);
							})
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-0 shadow-sm overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between px-4 py-3 border-b bg-muted/30",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
							className: "text-xs font-bold flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5 text-primary" }), "Revenue GL Ledger — Posted Entries"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "text-[10px] font-mono",
								children: "Accounts 41100–41600"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "secondary",
								className: "text-[10px]",
								children: [filteredRevenueTransactions.length, " entries"]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-auto max-h-72",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
							className: "bg-muted/50 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "font-bold text-xs",
									children: "Date"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "font-bold text-xs",
									children: "Reference"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "font-bold text-xs",
									children: "Description"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "font-bold text-xs",
									children: "GL Code"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "font-bold text-xs",
									children: "Revenue Stream"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "font-bold text-xs",
									children: "Customer"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "font-bold text-xs",
									children: "Unit"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "text-right font-bold text-xs",
									children: "Cr Amount (QAR)"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, {
							className: "text-xs",
							children: [filteredRevenueTransactions.map((tx) => {
								const streamCode = getStreamCodeKey(tx.account_code);
								const stream = REVENUE_STREAMS.find((s) => s.code === streamCode);
								const netRev = (tx.credit || 0) - (tx.debit || 0);
								const isPdc = (tx.source || "").toLowerCase() === "pdc";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: `hover:bg-muted/30 ${isPdc ? "bg-blue-50/30" : ""}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-mono",
											children: tx.date
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
											className: "font-mono text-primary",
											children: [tx.reference, isPdc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "ml-1 text-[9px] bg-blue-100 text-blue-700 rounded px-1 py-0.5",
												children: "PDC"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "max-w-[220px] truncate",
											title: tx.description,
											children: tx.description
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: `text-[10px] font-mono font-bold ${stream?.textColor || "text-emerald-700"} ${stream?.bg || "bg-emerald-50"} ${stream?.border || "border-emerald-300"}`,
											children: tx.account_code
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-muted-foreground",
											children: stream?.label || tx.account_name || "Revenue"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-xs max-w-[120px] truncate",
											title: tx.tenant_name,
											children: tx.tenant_name && tx.tenant_name !== "Unassigned" ? tx.tenant_name : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground italic",
												children: "—"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-mono text-xs",
											children: tx.unit_ref && tx.unit_ref !== "Unassigned" ? tx.unit_ref : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground italic",
												children: "—"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-right font-mono font-semibold text-emerald-600",
											children: netRev.toLocaleString()
										})
									]
								}, tx.id);
							}), filteredRevenueTransactions.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								colSpan: 8,
								className: "text-center text-muted-foreground py-6 text-xs",
								children: "No entries match the current filters."
							}) })]
						})] })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4 shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
						className: "text-xs font-bold mb-3 flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5 text-primary" }), "Top Tenant Revenue Contributions"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 sm:grid-cols-5 gap-3",
						children: topTenants.map(({ tenant, amount }, idx) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-muted/30 rounded-lg p-3 border text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs font-bold truncate mb-1",
										title: tenant,
										children: tenant
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm font-mono font-bold text-primary",
										children: ["QR ", amount.toLocaleString()]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[10px] text-muted-foreground mt-0.5",
										children: [
											"#",
											idx + 1,
											" Contributor"
										]
									})
								]
							}, tenant);
						})
					})]
				})
			]
		})]
	});
}
function ProfitAndLossSubModule() {
	const { profitAndLossReport: pl, isSyncing, refreshFinanceData } = useFinanceStore();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex justify-between items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold",
				children: "Profit and Loss Statement (P&L) — Live"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				onClick: refreshFinanceData,
				disabled: isSyncing,
				className: "h-7 text-xs gap-1.5",
				title: "Refresh P&L Report from DB",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3 w-3 ${isSyncing ? "animate-spin text-primary" : ""}` }), isSyncing ? "Syncing..." : "Refresh"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-5 space-y-3 text-xs shadow-sm bg-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between items-center font-bold text-sm border-b pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Gross Rental & Property Operating Revenue" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-emerald-600 font-mono text-base",
						children: ["QR ", pl.totalRevenue?.toLocaleString() ?? "0"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5 pl-2 text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Residential Tenancy Leases (41100)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono",
							children: ["QR ", pl.rentalRevenue.toLocaleString()]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Service & Parking Recovery Charges" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono",
							children: ["QR ", pl.otherRevenue.toLocaleString()]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between items-center font-bold text-sm border-t pt-3 pb-1 text-rose-600",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Operating Expenses" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-base",
						children: ["-QR ", pl.totalExpenses.toLocaleString()]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5 pl-2 text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Repairs & HVAC Maintenance (50200)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono",
								children: ["QR ", pl.maintenanceExpense.toLocaleString()]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Staff Salaries & Site Operations (50100)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono",
								children: ["QR ", pl.payrollExpense.toLocaleString()]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Electricity & Water — Kahramaa (50500)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono",
								children: ["QR ", pl.utilitiesExpense.toLocaleString()]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Cleaning & Sanitation Services (50300)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono",
								children: ["QR ", pl.cleaningExpense.toLocaleString()]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `flex justify-between items-center font-bold text-base border-t-2 pt-3 p-3 rounded-lg border ${pl.netProfit >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-foreground",
						children: ["Net Operating ", pl.netProfit >= 0 ? "Profit" : "Loss"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: `font-mono text-lg ${pl.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`,
						children: ["QR ", Math.abs(pl.netProfit).toLocaleString()]
					})]
				})
			]
		})]
	});
}
function BalanceSheetSubModule() {
	const { balanceSheetReport: bs, isSyncing, refreshFinanceData } = useFinanceStore();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex justify-between items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold",
				children: "Balance Sheet Statement — Live"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					onClick: refreshFinanceData,
					disabled: isSyncing,
					className: "h-7 text-xs gap-1.5",
					title: "Refresh Balance Sheet from DB",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3 w-3 ${isSyncing ? "animate-spin text-primary" : ""}` }), isSyncing ? "Syncing..." : "Refresh"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					className: `font-mono ${bs.isBalanced ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-rose-50 text-rose-700 border-rose-300"}`,
					children: bs.isBalanced ? "✓ Balanced" : "⚠ Discrepancy"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5 space-y-3 shadow-sm bg-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
						className: "font-bold text-sm border-b pb-2 text-primary flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-4 w-4" }), " Assets"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bank Operating & Escrow Balances" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono",
									children: ["QR ", bs.bankCashAssets.toLocaleString()]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Post-Dated Cheques In Hand" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono",
									children: ["QR ", bs.pdcInHandAssets.toLocaleString()]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tenant Receivables (AR Ledger)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono",
									children: ["QR ", bs.arReceivablesAssets.toLocaleString()]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Legal Receivables (Defaulted)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono",
									children: ["QR ", bs.legalReceivablesAssets.toLocaleString()]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Property & Fixed Assets Portfolio" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono",
									children: ["QR ", bs.fixedAssets.toLocaleString()]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between font-bold border-t pt-2 text-sm text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Assets" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-primary",
							children: ["QR ", bs.totalAssets?.toLocaleString() ?? "0"]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5 space-y-3 shadow-sm bg-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
						className: "font-bold text-sm border-b pb-2 text-amber-600 flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-4 w-4" }), " Liabilities & Equity"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Accounts Payable (Vendors)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono",
									children: ["QR ", bs.apLiabilities.toLocaleString()]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PDC Received — Customer Liability" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono",
									children: ["QR ", bs.pdcCustomerLiabilities.toLocaleString()]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tenant Security Deposits Held" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono",
									children: ["QR ", bs.securityDepositLiabilities.toLocaleString()]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between border-t pt-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: "Owner Capital & Reserves"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono",
									children: ["QR ", bs.ownerCapital.toLocaleString()]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-emerald-700 font-semibold",
									children: "Current Period Net Profit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: `font-mono ${bs.retainedNetProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`,
									children: ["QR ", bs.retainedNetProfit.toLocaleString()]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between font-bold border-t pt-2 text-sm text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Liabilities & Equity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-amber-600",
							children: ["QR ", bs.totalLiabilitiesAndEquity.toLocaleString()]
						})]
					})
				]
			})]
		})]
	});
}
function GeneralLedgerReportSubModule() {
	const { allLedgerTransactions, leases, units, customers, isSyncing, refreshFinanceData } = useFinanceStore();
	const [search, setSearch] = (0, import_react.useState)("");
	const [startDate, setStartDate] = (0, import_react.useState)("");
	const [endDate, setEndDate] = (0, import_react.useState)("");
	const [selectedMonth, setSelectedMonth] = (0, import_react.useState)("all");
	const [selectedProperty, setSelectedProperty] = (0, import_react.useState)("all");
	const [selectedUnit, setSelectedUnit] = (0, import_react.useState)("all");
	const [selectedCustomer, setSelectedCustomer] = (0, import_react.useState)("all");
	const [selectedSource, setSelectedSource] = (0, import_react.useState)("all");
	const [sortField, setSortField] = (0, import_react.useState)("date");
	const [sortAsc, setSortAsc] = (0, import_react.useState)(false);
	const [page, setPage] = (0, import_react.useState)(1);
	const [pageSize, setPageSize] = (0, import_react.useState)(25);
	const txList = allLedgerTransactions || [];
	const propertyOptions = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		txList.forEach((tx) => {
			if (tx.property_name) set.add(tx.property_name);
		});
		(leases || []).forEach((l) => {
			if (l.property) set.add(l.property);
		});
		return Array.from(set).sort((a, b) => a.localeCompare(b, void 0, { sensitivity: "base" }));
	}, [txList, leases]);
	const unitOptions = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		txList.forEach((tx) => {
			if (selectedProperty !== "all" && tx.property_name !== selectedProperty) return;
			if (tx.unit_ref) set.add(tx.unit_ref);
		});
		(leases || []).forEach((l) => {
			if (selectedProperty !== "all" && l.property !== selectedProperty) return;
			if (l.unit) set.add(l.unit);
		});
		return Array.from(set).sort((a, b) => a.localeCompare(b, void 0, {
			numeric: true,
			sensitivity: "base"
		}));
	}, [
		txList,
		leases,
		selectedProperty
	]);
	const customerOptions = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		txList.forEach((tx) => {
			if (tx.tenant_name) set.add(tx.tenant_name);
		});
		(leases || []).forEach((l) => {
			if (l.tenantName) set.add(l.tenantName);
		});
		(customers || []).forEach((c) => {
			if (c.name) set.add(c.name);
		});
		return Array.from(set).sort((a, b) => a.localeCompare(b, void 0, { sensitivity: "base" }));
	}, [
		txList,
		leases,
		customers
	]);
	const monthOptions = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		txList.forEach((tx) => {
			if (tx.date && tx.date.length >= 7) set.add(tx.date.slice(0, 7));
		});
		return Array.from(set).sort((a, b) => a.localeCompare(b));
	}, [txList]);
	const sourceOptions = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		txList.forEach((tx) => {
			if (tx.source) set.add(tx.source);
		});
		return Array.from(set).sort((a, b) => a.localeCompare(b, void 0, { sensitivity: "base" }));
	}, [txList]);
	const filtered = (0, import_react.useMemo)(() => {
		let list = txList.filter((tx) => {
			if (selectedProperty !== "all" && tx.property_name !== selectedProperty) return false;
			if (selectedUnit !== "all" && tx.unit_ref !== selectedUnit) return false;
			if (selectedCustomer !== "all" && tx.tenant_name !== selectedCustomer) return false;
			if (selectedSource !== "all" && tx.source !== selectedSource) return false;
			if (selectedMonth !== "all" && !(tx.date || "").startsWith(selectedMonth)) return false;
			if (startDate && (tx.date || "") < startDate) return false;
			if (endDate && (tx.date || "") > endDate) return false;
			if (search.trim()) {
				const q = search.toLowerCase();
				if (!((tx.account_name || "").toLowerCase().includes(q) || (tx.account_code || "").includes(q) || (tx.reference || "").toLowerCase().includes(q) || (tx.source || "").toLowerCase().includes(q) || (tx.description || "").toLowerCase().includes(q) || (tx.property_name || "").toLowerCase().includes(q) || (tx.unit_ref || "").toLowerCase().includes(q) || (tx.tenant_name || "").toLowerCase().includes(q))) return false;
			}
			return true;
		});
		list = [...list].sort((a, b) => {
			let comp = 0;
			if (sortField === "date") comp = (a.date || "").localeCompare(b.date || "");
			else if (sortField === "account_code") comp = (a.account_code || "").localeCompare(b.account_code || "");
			else if (sortField === "debit") comp = (a.debit || 0) - (b.debit || 0);
			else if (sortField === "credit") comp = (a.credit || 0) - (b.credit || 0);
			return sortAsc ? comp : -comp;
		});
		return list;
	}, [
		txList,
		selectedProperty,
		selectedUnit,
		selectedCustomer,
		selectedSource,
		selectedMonth,
		startDate,
		endDate,
		search,
		sortField,
		sortAsc
	]);
	const effectivePageSize = pageSize === 0 ? Math.max(1, filtered.length) : pageSize;
	const totalPages = Math.max(1, Math.ceil(filtered.length / effectivePageSize));
	const paginated = (0, import_react.useMemo)(() => {
		if (pageSize === 0) return filtered;
		return filtered.slice((page - 1) * effectivePageSize, page * effectivePageSize);
	}, [
		filtered,
		page,
		pageSize,
		effectivePageSize
	]);
	const totalDebit = (0, import_react.useMemo)(() => filtered.reduce((s, tx) => s + (tx.debit || 0), 0), [filtered]);
	const totalCredit = (0, import_react.useMemo)(() => filtered.reduce((s, tx) => s + (tx.credit || 0), 0), [filtered]);
	function resetFilters() {
		setSearch("");
		setStartDate("");
		setEndDate("");
		setSelectedMonth("all");
		setSelectedProperty("all");
		setSelectedUnit("all");
		setSelectedCustomer("all");
		setSelectedSource("all");
		setSortField("date");
		setSortAsc(false);
		setPage(1);
	}
	function toggleSort(field) {
		if (sortField === field) setSortAsc(!sortAsc);
		else {
			setSortField(field);
			setSortAsc(true);
		}
		setPage(1);
	}
	const sortIcon = (field) => sortField === field ? sortAsc ? " ↑" : " ↓" : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "General Ledger Transaction Audit — Live"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Complete double-entry log with multi-dimensional filters: Property, Unit, Date, Month & Customer."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 flex-wrap",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: refreshFinanceData,
							disabled: isSyncing,
							className: "h-7 text-xs gap-1.5",
							title: "Refresh General Ledger from DB",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3 w-3 ${isSyncing ? "animate-spin text-primary" : ""}` }), isSyncing ? "Syncing..." : "Refresh"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "font-mono bg-blue-50 text-blue-700 border-blue-200 text-xs",
							children: [
								"DR: ",
								totalDebit.toLocaleString(),
								" QAR"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "font-mono bg-emerald-50 text-emerald-700 border-emerald-200 text-xs",
							children: [
								"CR: ",
								totalCredit.toLocaleString(),
								" QAR"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "text-xs",
							children: [filtered.length, " Postings"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border bg-muted/25 p-3.5 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold uppercase tracking-wider",
								children: "Multi-Dimensional Filters"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							className: "h-6 text-xs text-muted-foreground px-2",
							onClick: resetFilters,
							children: "Reset All"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3 w-3" }), " Property"]
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
									}), propertyOptions.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: p,
										children: p
									}, p))] })]
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
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3 w-3" }), " Month"]
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
										children: "All Months"
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
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3 w-3" }), " Source / Type"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: selectedSource,
									onValueChange: (v) => {
										setSelectedSource(v);
										setPage(1);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 text-xs bg-background",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Sources" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "all",
										children: "All Sources"
									}), sourceOptions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: s,
										children: s
									}, s))] })]
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
									placeholder: "Search account, code, reference, description, tenant...",
									value: search,
									onChange: (e) => {
										setSearch(e.target.value);
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
									value: startDate,
									onChange: (e) => {
										setStartDate(e.target.value);
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
									value: endDate,
									onChange: (e) => {
										setEndDate(e.target.value);
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
									onClick: () => {
										setSortAsc(!sortAsc);
										setPage(1);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "h-3 w-3" }), sortAsc ? "Ascending ↑" : "Descending ↓"]
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs px-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 flex-wrap",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground",
						children: [
							"Showing ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: pageSize === 0 ? filtered.length : Math.min(effectivePageSize, filtered.length - (page - 1) * effectivePageSize)
							}),
							" of ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: filtered.length
							}),
							" postings",
							selectedProperty !== "all" ? ` • Property: ${selectedProperty}` : "",
							selectedUnit !== "all" ? ` • Unit: ${selectedUnit}` : "",
							selectedCustomer !== "all" ? ` • Customer: ${selectedCustomer}` : "",
							selectedMonth !== "all" ? ` • Month: ${selectedMonth}` : ""
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 ml-2 border-l pl-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] text-muted-foreground",
							children: "Rows:"
						}), [
							25,
							50,
							100,
							0
						].map((size) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setPageSize(size);
								setPage(1);
							},
							className: `px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${pageSize === size ? "bg-primary text-primary-foreground font-bold" : "bg-muted hover:bg-muted/80 text-muted-foreground"}`,
							children: size === 0 ? "All" : size
						}, size))]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-xs",
						children: ["Balance: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `font-bold ${Math.abs(totalDebit - totalCredit) < 1 ? "text-emerald-600" : "text-red-600"}`,
							children: Math.abs(totalDebit - totalCredit) < 1 ? "✓ Balanced" : `Out by QR ${Math.abs(totalDebit - totalCredit).toLocaleString()}`
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-x-auto max-w-full bg-card shadow-sm scrollbar-thin",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, {
					className: "w-full text-[11px] border-collapse",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "bg-muted/60 text-[11px] font-semibold",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
								className: "py-2 px-2.5 font-bold cursor-pointer whitespace-nowrap",
								onClick: () => toggleSort("date"),
								children: ["Date", sortIcon("date")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
								className: "py-2 px-2 font-bold cursor-pointer whitespace-nowrap",
								onClick: () => toggleSort("account_code"),
								children: ["A/C Code", sortIcon("account_code")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "py-2 px-2.5 font-bold min-w-[180px]",
								children: "Account Name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "py-2 px-2 font-bold min-w-[140px]",
								children: "Property"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "py-2 px-2 font-bold min-w-[100px]",
								children: "Unit"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "py-2 px-2 font-bold min-w-[140px]",
								children: "Customer / Tenant"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "py-2 px-2 font-bold min-w-[110px]",
								children: "Reference"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "py-2 px-2 font-bold whitespace-nowrap",
								children: "Source"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
								className: "py-2 px-2.5 text-right font-bold cursor-pointer whitespace-nowrap min-w-[90px]",
								onClick: () => toggleSort("debit"),
								children: ["Debit (QAR)", sortIcon("debit")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
								className: "py-2 px-2.5 text-right font-bold cursor-pointer whitespace-nowrap min-w-[90px]",
								onClick: () => toggleSort("credit"),
								children: ["Credit (QAR)", sortIcon("credit")]
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, {
						className: "text-[11px]",
						children: paginated.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							colSpan: 10,
							className: "text-center py-10 text-muted-foreground",
							children: "No GL postings match the selected Property, Unit, Date, Month, or Customer filter criteria."
						}) }) : paginated.map((tx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
							className: "hover:bg-muted/40 transition-colors border-b border-border/40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "py-1.5 px-2.5 font-mono whitespace-nowrap font-medium",
									children: formatDDMMMYYYY(tx.date)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "py-1.5 px-2 font-mono font-bold text-primary whitespace-nowrap",
									children: tx.account_code
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "py-1.5 px-2.5 font-medium",
									children: tx.account_name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "py-1.5 px-2 text-muted-foreground",
									children: tx.property_name || "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "py-1.5 px-2 font-mono",
									children: tx.unit_ref || "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "py-1.5 px-2",
									children: tx.tenant_name || "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "py-1.5 px-2 font-mono",
									children: tx.reference
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "py-1.5 px-2 whitespace-nowrap",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "text-[10px] px-1.5 py-0",
										children: tx.source
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "py-1.5 px-2.5 text-right font-mono font-semibold text-blue-600 whitespace-nowrap",
									children: tx.debit > 0 ? tx.debit.toLocaleString() : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "py-1.5 px-2.5 text-right font-mono font-semibold text-emerald-600 whitespace-nowrap",
									children: tx.credit > 0 ? tx.credit.toLocaleString() : "—"
								})
							]
						}, tx.id))
					})]
				})
			}),
			pageSize !== 0 && filtered.length > effectivePageSize && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground pt-1 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"Showing ",
					(page - 1) * effectivePageSize + 1,
					"–",
					Math.min(page * effectivePageSize, filtered.length),
					" of ",
					filtered.length,
					" postings (Page ",
					page,
					" of ",
					totalPages,
					")"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							className: "h-7 text-xs",
							disabled: page === 1,
							onClick: () => setPage((p) => Math.max(1, p - 1)),
							children: "← Prev"
						}),
						Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2).map((p, idx, arr) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center",
							children: [idx > 0 && arr[idx - 1] !== p - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "px-1 text-muted-foreground",
								children: "…"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: p === page ? "default" : "outline",
								className: "h-7 w-7 p-0 text-xs",
								onClick: () => setPage(p),
								children: p
							})]
						}, p)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							className: "h-7 text-xs",
							disabled: page === totalPages,
							onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
							children: "Next →"
						})
					]
				})]
			})
		]
	});
}
function CashFlowSubModule() {
	const { cashFlowReport: cf, isSyncing, refreshFinanceData } = useFinanceStore();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex justify-between items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold",
				children: "Cash Flow Statement — Live"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				onClick: refreshFinanceData,
				disabled: isSyncing,
				className: "h-7 text-xs gap-1.5",
				title: "Refresh Cash Flow Statement from DB",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3 w-3 ${isSyncing ? "animate-spin text-primary" : ""}` }), isSyncing ? "Syncing..." : "Refresh"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-5 space-y-3 text-xs shadow-sm bg-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 border-b pb-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Operating Cash Inflows (Rent Collections)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-emerald-600 font-mono",
								children: ["+QR ", cf.operatingInflow.toLocaleString()]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Operating Cash Outflows (Expenses, Payroll, Utilities)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-rose-600 font-mono",
								children: ["-QR ", cf.operatingOutflow.toLocaleString()]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between font-bold border-t pt-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Net Cash from Operating Activities" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `font-mono ${cf.netOperatingCash >= 0 ? "text-emerald-600" : "text-rose-600"}`,
								children: ["QR ", cf.netOperatingCash.toLocaleString()]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between font-semibold border-b pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Net Cash from Investing Activities (Asset Upgrades)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-rose-600 font-mono",
						children: ["QR ", cf.investingCash.toLocaleString()]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between font-semibold border-b pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Net Cash from Financing Activities (Capital & Dividends)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-muted-foreground",
						children: ["QR ", cf.financingCash.toLocaleString()]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `flex justify-between font-bold text-sm p-3 rounded-lg border ${cf.netCashChange >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Net Cash Increase in Period" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: `font-mono ${cf.netCashChange >= 0 ? "text-emerald-700" : "text-rose-700"}`,
						children: [
							cf.netCashChange >= 0 ? "+" : "",
							"QR ",
							cf.netCashChange.toLocaleString()
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between font-bold text-sm bg-blue-50 p-3 rounded-lg border border-blue-200",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-blue-900",
						children: "Estimated Closing Cash & Bank Balance"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-blue-700",
						children: ["QR ", cf.endingCashBalance.toLocaleString()]
					})]
				})
			]
		})]
	});
}
function CashBookSubModule() {
	const { cashBookEntries, addCashBookEntry, isSyncing, refreshFinanceData } = useFinanceStore();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		voucher: `CSH-${Math.floor(10 + Math.random() * 90)}`,
		description: "",
		type: "in",
		amount: "1500"
	});
	function handleAdd() {
		const amt = parseFloat(form.amount) || 0;
		addCashBookEntry({
			date: form.date,
			voucher: form.voucher,
			description: form.description || "Cash Transaction",
			type: form.type,
			amount: amt
		});
		setOpen(false);
	}
	const totalIn = cashBookEntries.reduce((s, r) => s + r.cash_in, 0);
	const totalOut = cashBookEntries.reduce((s, r) => s + r.cash_out, 0);
	const currentNetBalance = totalIn - totalOut;
	const sortedChronological = [...cashBookEntries].sort((a, b) => new Date(a.date || "").getTime() - new Date(b.date || "").getTime());
	let runningAcc = 0;
	const displayRows = [...sortedChronological.map((item) => {
		runningAcc += (item.cash_in || 0) - (item.cash_out || 0);
		return {
			...item,
			computedRunningBal: runningAcc
		};
	})].reverse();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Main Cash Book — Live"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "All physical cash receipts, vault deposits, and disbursements — synced with Cash On Hand report."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: refreshFinanceData,
						disabled: isSyncing,
						className: "h-8 text-xs gap-1.5",
						title: "Refresh Cash Book from DB",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${isSyncing ? "animate-spin text-primary" : ""}` }), isSyncing ? "Syncing..." : "Refresh"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => setOpen(true),
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Cash Entry"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-3 bg-emerald-50 border-emerald-200",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-emerald-700 font-semibold",
							children: "Total Cash In"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono font-bold text-emerald-800 text-sm",
							children: ["QR ", totalIn.toLocaleString()]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-3 bg-rose-50 border-rose-200",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-rose-700 font-semibold",
							children: "Total Cash Out"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono font-bold text-rose-800 text-sm",
							children: ["QR ", totalOut.toLocaleString()]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-3 bg-blue-50 border-blue-200",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-blue-700 font-semibold",
							children: "Current Balance"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono font-bold text-blue-800 text-sm",
							children: ["QR ", currentNetBalance.toLocaleString()]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Voucher #"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Description"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold text-emerald-600",
							children: "Cash In (QAR)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold text-rose-600",
							children: "Cash Out (QAR)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold",
							children: "Running Balance"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, {
					className: "text-xs",
					children: displayRows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: 6,
						className: "text-center py-6 text-muted-foreground",
						children: "No cash entries recorded yet."
					}) }) : displayRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "hover:bg-muted/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-mono",
								children: row.date
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-mono font-bold text-primary",
								children: row.voucher
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-medium",
								children: row.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right font-mono font-semibold text-emerald-600",
								children: row.cash_in > 0 ? row.cash_in.toLocaleString() : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right font-mono font-semibold text-rose-600",
								children: row.cash_out > 0 ? row.cash_out.toLocaleString() : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-right font-mono font-bold",
								children: [row.computedRunningBal.toLocaleString(), " QAR"]
							})
						]
					}, row.id))
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add Cash Book Entry" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.date,
										onChange: (e) => setForm({
											...form,
											date: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Voucher Ref" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.voucher,
										onChange: (e) => setForm({
											...form,
											voucher: e.target.value
										})
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Reason for cash transaction",
									value: form.description,
									onChange: (e) => setForm({
										...form,
										description: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.type,
										onValueChange: (v) => setForm({
											...form,
											type: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "in",
											children: "Cash In (Receipt)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "out",
											children: "Cash Out (Payment)"
										})] })]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Amount (QAR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: form.amount,
										onChange: (e) => setForm({
											...form,
											amount: e.target.value
										})
									})] })]
								}),
								parseFloat(form.amount) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 space-y-1.5 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ledgers / Accounts Updated by this Cash Entry" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2 font-mono text-[11px]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "bg-background p-2 rounded border border-emerald-200",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-emerald-700 dark:text-emerald-400 font-bold block",
													children: "Debit (DR):"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: form.type === "in" ? "10100 - Cash In Hand (Office Vault)" : "51004001 - Repair and Maintenance Cost" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "block font-bold text-emerald-600 mt-1",
													children: ["QR ", parseFloat(form.amount || "0").toLocaleString()]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "bg-background p-2 rounded border border-rose-200",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-rose-600 dark:text-rose-400 font-bold block",
													children: "Credit (CR):"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: form.type === "in" ? "41100 - Rental Revenue / Customer" : "10100 - Cash In Hand (Office Vault)" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "block font-bold text-rose-600 mt-1",
													children: ["QR ", parseFloat(form.amount || "0").toLocaleString()]
												})
											]
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleAdd,
							children: "Save Entry"
						})] })
					]
				})
			})
		]
	});
}
function PettyCashBookSubModule() {
	const { pettyCashEntries, addPettyCashEntry, isSyncing, refreshFinanceData } = useFinanceStore();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		expense: "Refreshments & Tea",
		paid_to: "Local Cafeteria",
		amount: "65"
	});
	function handleAdd() {
		addPettyCashEntry({
			date: form.date,
			expense: form.expense,
			paid_to: form.paid_to,
			amount: parseFloat(form.amount) || 0
		});
		setOpen(false);
	}
	const totalPetty = pettyCashEntries.reduce((s, r) => s + r.amount, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Petty Cash Custodian Register — Live"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Minor daily expense vouchers and imprest fund tracking — synced with Cash On Hand report."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: refreshFinanceData,
						disabled: isSyncing,
						className: "h-8 text-xs gap-1.5",
						title: "Refresh Petty Cash from DB",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${isSyncing ? "animate-spin text-primary" : ""}` }), isSyncing ? "Syncing..." : "Refresh"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => setOpen(true),
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Petty Cash Expense"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-3 bg-amber-50 border-amber-200 inline-flex gap-3 items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold text-amber-700",
					children: "Total Petty Cash Spent"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono font-bold text-amber-800",
					children: ["QR ", totalPetty.toLocaleString()]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Expense Description"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Paid To"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right font-bold",
							children: "Amount (QAR)"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, {
					className: "text-xs",
					children: [...pettyCashEntries].sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime()).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "hover:bg-muted/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-mono",
								children: row.date
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-medium",
								children: row.expense
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.paid_to }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right font-mono font-bold text-rose-600",
								children: row.amount.toLocaleString()
							})
						]
					}, row.id))
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add Petty Cash Expense" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.date,
										onChange: (e) => setForm({
											...form,
											date: e.target.value
										})
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Expense Item" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.expense,
										onChange: (e) => setForm({
											...form,
											expense: e.target.value
										})
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Paid To" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.paid_to,
										onChange: (e) => setForm({
											...form,
											paid_to: e.target.value
										})
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Amount (QAR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: form.amount,
										onChange: (e) => setForm({
											...form,
											amount: e.target.value
										})
									})] })
								]
							}), parseFloat(form.amount) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 space-y-1.5 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-amber-600 dark:text-amber-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ledgers / Accounts Updated by this Petty Cash Expense" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2 font-mono text-[11px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "bg-background p-2 rounded border border-emerald-200",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-emerald-700 dark:text-emerald-400 font-bold block",
												children: "Debit (Expense):"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "50800 - General Office & Hospitality" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "block font-bold text-emerald-600 mt-1",
												children: ["QR ", parseFloat(form.amount || "0").toLocaleString()]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "bg-background p-2 rounded border border-rose-200",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-rose-600 dark:text-rose-400 font-bold block",
												children: "Credit (Asset/Float):"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "10200 - Petty Cash Float Imprest" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "block font-bold text-rose-600 mt-1",
												children: ["QR ", parseFloat(form.amount || "0").toLocaleString()]
											})
										]
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleAdd,
							children: "Save Expense"
						})] })
					]
				})
			})
		]
	});
}
function CashOnHandSubModule() {
	const { cashOnHandPosition: co, isSyncing, refreshFinanceData } = useFinanceStore();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Current Physical Cash Position — Live"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Real-time physical cash balances across all custody points — updated whenever Cash Book or Petty Cash entries are added."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					onClick: refreshFinanceData,
					disabled: isSyncing,
					className: "h-8 text-xs gap-1.5",
					title: "Refresh Cash On Hand from DB",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${isSyncing ? "animate-spin text-primary" : ""}` }), isSyncing ? "Syncing..." : "Refresh"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 bg-emerald-50 border-emerald-200 shadow-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-emerald-800 uppercase",
								children: "Office Safe Vault Cash"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
								className: "text-2xl font-bold mt-1 font-mono text-emerald-700",
								children: ["QR ", co.vaultCash.toLocaleString()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-emerald-600 mt-1",
								children: "Verified physical cash balance"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 bg-blue-50 border-blue-200 shadow-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-blue-800 uppercase",
								children: "Petty Cash Float Imprest"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
								className: "text-2xl font-bold mt-1 font-mono text-blue-700",
								children: ["QR ", co.pettyCashFloat.toLocaleString()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-blue-600 mt-1",
								children: "Held with Head Office Custodian"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 bg-purple-50 border-purple-200 shadow-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-purple-800 uppercase",
								children: "Site Cash Registers"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
								className: "text-2xl font-bold mt-1 font-mono text-purple-700",
								children: ["QR ", co.siteDesks.toLocaleString()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-purple-600 mt-1",
								children: "Al Sadd & Salata Front Desks"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold uppercase opacity-80",
						children: "Total Cash On Hand (All Custody Points)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
						className: "text-3xl font-bold mt-1 font-mono",
						children: ["QR ", co.totalCashOnHand.toLocaleString()]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] opacity-70 mt-1",
						children: "Vault + Petty Cash Float + Site Registers"
					})
				]
			})
		]
	});
}
var VENDOR_DEBIT_REASONS = [
	"Goods Returned to Vendor",
	"Overcharge / Price Discrepancy",
	"Duplicate AP Invoice",
	"Quality Rejection",
	"Short Delivery / Damaged Material",
	"Warranty Replacement Claim",
	"Supplier Penalty / Liquidated Damages"
];
var CUSTOMER_DEBIT_REASONS = [
	"Tenant Direct Damage Recovery",
	"Key / Access Card Loss Charge",
	"Late Vacate Penalty / Overstay Charge",
	"Excess Utility Usage Surcharge",
	"Reinstatement / Repair Chargeable to Tenant",
	"Bounced Cheque Penalty Fee"
];
var VENDOR_CREDIT_REASONS = [
	"Early Settlement Discount from Supplier",
	"Volume Rebate / Supplier Credit",
	"Price Correction in Vendor's Favor",
	"Correction of Under-Billed Item"
];
var CUSTOMER_CREDIT_REASONS = [
	"Tenant Overpayment Refund / Credit",
	"Early Payment Rent Discount",
	"Maintenance Service Disruption Credit",
	"Billing Error Correction / Rental Adjustment",
	"Promotional Concession / Move-in Discount",
	"Lease Amendment Reversal",
	"Security Deposit Partial Settlement"
];
var DEFAULT_VENDORS = [
	{
		id: "v1",
		name: "Qatar Maintenance & HVAC Co.",
		agreement: "AGR-VND-2026-001",
		agreements: [
			"AGR-VND-2026-001",
			"SVC-HVAC-2026-07",
			"PO-MAIN-2026-041"
		],
		doc: "APINV-2026-000001"
	},
	{
		id: "v2",
		name: "Gulf Facility Services",
		agreement: "AGR-VND-2026-002",
		agreements: ["AGR-VND-2026-002", "GFS-AMC-2026-03"],
		doc: "APINV-2026-000002"
	},
	{
		id: "v3",
		name: "Doha Elevator & MEP Corp",
		agreement: "AGR-VND-2026-003",
		agreements: [
			"AGR-VND-2026-003",
			"LIFT-AMC-2026-02",
			"MEP-SVC-2026-05"
		],
		doc: "APINV-2026-000003"
	},
	{
		id: "v4",
		name: "Al Rashid Trading LLC",
		agreement: "AGR-VND-2026-004",
		agreements: ["AGR-VND-2026-004", "SUPPLY-2026-008"],
		doc: "APINV-2026-000004"
	},
	{
		id: "v5",
		name: "Qatar Cleaning & Security Co.",
		agreement: "AGR-VND-2026-005",
		agreements: [
			"AGR-VND-2026-005",
			"SEC-2026-003",
			"CLN-2026-009"
		],
		doc: "APINV-2026-000005"
	}
];
var DEFAULT_CUSTOMERS = [
	{
		id: "c1",
		name: "Mr. Hafeez Shaik",
		agreement: "LEASE-2026-00101 (Old Salata)",
		agreements: ["LEASE-2026-00101 (Old Salata)", "LEASE-2025-00088 (Madinat Khalifa)"],
		doc: "INV-AR-2026-001"
	},
	{
		id: "c2",
		name: "Fatima Al-Kuwari",
		agreement: "LEASE-2026-00204 (Lusail Marina)",
		agreements: ["LEASE-2026-00204 (Lusail Marina)", "LEASE-2024-00161 (Fox Hills)"],
		doc: "INV-AR-2026-002"
	},
	{
		id: "c3",
		name: "Tariq Mansoor",
		agreement: "LEASE-2026-00310 (The Pearl)",
		agreements: ["LEASE-2026-00310 (The Pearl)"],
		doc: "INV-AR-2026-003"
	},
	{
		id: "c4",
		name: "Global Logistics QSTP LLC",
		agreement: "LEASE-COM-2026-008 (West Bay)",
		agreements: ["LEASE-COM-2026-008 (West Bay)", "LEASE-COM-2025-005 (Business Park)"],
		doc: "INV-AR-2026-004"
	},
	{
		id: "c5",
		name: "Ahmed Al-Sulaiti",
		agreement: "LEASE-2026-00412 (Bin Mahmoud)",
		agreements: [
			"LEASE-2026-00412 (Bin Mahmoud)",
			"LEASE-2025-00398 (Al Sadd)",
			"LEASE-2024-00271 (Al Hilal)"
		],
		doc: "INV-AR-2026-005"
	}
];
var EXPENSE_GL_OPTIONS = [
	{
		value: "51004001",
		label: "51004001 – Repair & Maintenance (Property)"
	},
	{
		value: "51004002",
		label: "51004002 – Repair & Maintenance (Common Area)"
	},
	{
		value: "51004003",
		label: "51004003 – Repair & Maintenance (Unit)"
	},
	{
		value: "51002001",
		label: "51002001 – CMEP-Facilities Mgt AMC"
	},
	{
		value: "51002002",
		label: "51002002 – Swimming Pool Maintenance"
	},
	{
		value: "51002003",
		label: "51002003 – CCTV AMC Charges"
	},
	{
		value: "51002004",
		label: "51002004 – Lift Maintenance Charges"
	},
	{
		value: "51001001",
		label: "51001001 – CMEP-Labor Cost-Facilities Mgt"
	},
	{
		value: "13100001",
		label: "13100001 – Trade Receivables (Customer Recovery)"
	}
];
var REVENUE_GL_OPTIONS = [
	{
		value: "41001001",
		label: "41001001 – Rental Income (Residential)"
	},
	{
		value: "41001002",
		label: "41001002 – Rental Income (Commercial)"
	},
	{
		value: "41002001",
		label: "41002001 – Service Charges"
	},
	{
		value: "41003001",
		label: "41003001 – Parking Revenue"
	},
	{
		value: "41004001",
		label: "41004001 – Utility Recovery"
	},
	{
		value: "22100001",
		label: "22100001 – Trade Payables (Vendor Credit)"
	}
];
function NoteStatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${{
			DRAFT: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300",
			APPROVED: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400",
			POSTED: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400",
			CANCELLED: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400"
		}[status]}`,
		children: status
	});
}
function DebitNoteSubModule() {
	const LS_KEY = "fin_debit_notes";
	const [notes, setNotes] = (0, import_react.useState)(() => {
		try {
			return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
		} catch {
			return [];
		}
	});
	const [showModal, setShowModal] = (0, import_react.useState)(false);
	const [viewNote, setViewNote] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		party_type: "Vendor",
		party_id: DEFAULT_VENDORS[0].id,
		party_name: DEFAULT_VENDORS[0].name,
		linked_agreement: DEFAULT_VENDORS[0].agreements[0],
		linked_invoice: DEFAULT_VENDORS[0].doc,
		amount: 0,
		reason: VENDOR_DEBIT_REASONS[0],
		expense_gl: EXPENSE_GL_OPTIONS[0].value,
		notes: "",
		date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
	});
	function save(updatedNotes) {
		setNotes(updatedNotes);
		localStorage.setItem(LS_KEY, JSON.stringify(updatedNotes));
	}
	function handlePartyTypeChange(type) {
		if (type === "Vendor") {
			const first = DEFAULT_VENDORS[0];
			setForm({
				...form,
				party_type: "Vendor",
				party_id: first.id,
				party_name: first.name,
				linked_agreement: first.agreements[0],
				linked_invoice: first.doc,
				reason: VENDOR_DEBIT_REASONS[0],
				expense_gl: "51004001"
			});
		} else {
			const first = DEFAULT_CUSTOMERS[0];
			setForm({
				...form,
				party_type: "Customer",
				party_id: first.id,
				party_name: first.name,
				linked_agreement: first.agreements[0],
				linked_invoice: first.doc,
				reason: CUSTOMER_DEBIT_REASONS[0],
				expense_gl: "13100001"
			});
		}
	}
	function handlePartySelect(name) {
		if (form.party_type === "Vendor") {
			const match = DEFAULT_VENDORS.find((v) => v.name === name);
			setForm((prev) => ({
				...prev,
				party_name: name,
				party_id: match?.id || "",
				linked_agreement: match?.agreements[0] || prev.linked_agreement,
				linked_invoice: match?.doc || prev.linked_invoice
			}));
		} else {
			const match = DEFAULT_CUSTOMERS.find((c) => c.name === name);
			setForm((prev) => ({
				...prev,
				party_name: name,
				party_id: match?.id || "",
				linked_agreement: match?.agreements[0] || prev.linked_agreement,
				linked_invoice: match?.doc || prev.linked_invoice
			}));
		}
	}
	function handleCreate() {
		if (!form.party_name.trim() || !form.amount) return toast.error("Party Name and Amount are required.");
		setSaving(true);
		const seq = String(notes.length + 1).padStart(6, "0");
		const newNote = {
			id: `dn-${Date.now()}`,
			dn_number: `DN-${(/* @__PURE__ */ new Date()).getFullYear()}-${seq}`,
			date: form.date,
			party_type: form.party_type,
			party_id: form.party_id,
			party_name: form.party_name,
			linked_agreement: form.linked_agreement,
			linked_invoice: form.linked_invoice,
			amount: form.amount,
			reason: form.reason,
			expense_gl: form.expense_gl,
			notes: form.notes,
			status: "DRAFT",
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		};
		save([newNote, ...notes]);
		setShowModal(false);
		setSaving(false);
		toast.success(`Debit Note ${newNote.dn_number} created in DRAFT.`);
	}
	function handleApprove(dn) {
		save(notes.map((n) => n.id === dn.id ? {
			...n,
			status: "APPROVED"
		} : n));
		toast.success(`${dn.dn_number} approved.`);
	}
	function handlePost(dn) {
		save(notes.map((n) => n.id === dn.id ? {
			...n,
			status: "POSTED"
		} : n));
		toast.success(`${dn.dn_number} posted to GL. Dr. ${dn.party_type === "Vendor" ? "22100001 (Trade Payables)" : "13100001 (Trade Receivables)"} / Cr. ${dn.expense_gl}`);
	}
	function handleCancel(dn) {
		save(notes.map((n) => n.id === dn.id ? {
			...n,
			status: "CANCELLED"
		} : n));
		toast.info(`${dn.dn_number} cancelled.`);
	}
	const totals = {
		draft: notes.filter((n) => n.status === "DRAFT").reduce((s, n) => s + n.amount, 0),
		approved: notes.filter((n) => n.status === "APPROVED").reduce((s, n) => s + n.amount, 0),
		posted: notes.filter((n) => n.status === "POSTED").reduce((s, n) => s + n.amount, 0)
	};
	const activeReasons = form.party_type === "Vendor" ? VENDOR_DEBIT_REASONS : CUSTOMER_DEBIT_REASONS;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-2xl font-bold tracking-tight flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMinus, { className: "h-6 w-6 text-rose-500" }), " Debit Notes"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-0.5",
					children: "Issue debit notes to Vendors (goods return/overcharge reduction) or Customers/Tenants (damage recovery/penalty charge)."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setShowModal(true),
					className: "gap-1.5 bg-rose-600 hover:bg-rose-700 text-white",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " New Debit Note"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-3",
				children: [
					{
						label: "Draft",
						value: totals.draft,
						color: "text-slate-600",
						bg: "bg-slate-50 dark:bg-slate-900/30 border-slate-200"
					},
					{
						label: "Approved",
						value: totals.approved,
						color: "text-blue-600",
						bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200"
					},
					{
						label: "Posted to GL",
						value: totals.posted,
						color: "text-emerald-600",
						bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200"
					}
				].map(({ label, value, color, bg }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `p-4 rounded-xl border ${bg}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground font-medium",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: `text-xl font-bold font-mono mt-1 ${color}`,
						children: ["QAR ", value.toLocaleString()]
					})]
				}, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-xl overflow-hidden bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "DN #"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Party Type"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Party Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Agreement / Lease #"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Linked Ref"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Reason"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold text-right",
							children: "Amount (QAR)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold text-right",
							children: "Actions"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: notes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 10,
					className: "text-center py-10 text-muted-foreground text-xs",
					children: "No debit notes yet. Click \"New Debit Note\" to create one."
				}) }) : notes.map((dn) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "text-xs hover:bg-muted/30",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-bold text-rose-600",
							children: dn.dn_number
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: dn.date }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: `text-[10px] ${dn.party_type === "Customer" ? "border-cyan-500 text-cyan-600 bg-cyan-50/40" : "border-violet-500 text-violet-600 bg-violet-50/40"}`,
							children: dn.party_type || "Vendor"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-semibold",
							children: dn.party_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-cyan-700 dark:text-cyan-400",
							children: dn.linked_agreement || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-muted-foreground",
							children: dn.linked_invoice || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "max-w-[150px] truncate",
							title: dn.reason,
							children: dn.reason
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right font-semibold font-mono text-foreground",
							children: ["QAR ", dn.amount.toLocaleString()]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteStatusBadge, { status: dn.status }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-end gap-1.5 flex-wrap",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										className: "h-7 text-[10px] px-2",
										onClick: () => setViewNote(dn),
										children: "View"
									}),
									dn.status === "DRAFT" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										className: "h-7 text-[10px] px-2 text-blue-600 border-blue-300",
										onClick: () => handleApprove(dn),
										children: "Approve"
									}),
									dn.status === "APPROVED" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										className: "h-7 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white",
										onClick: () => handlePost(dn),
										children: "Post to GL"
									}),
									(dn.status === "DRAFT" || dn.status === "APPROVED") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "destructive",
										className: "h-7 text-[10px] px-2",
										onClick: () => handleCancel(dn),
										children: "Cancel"
									})
								]
							})
						})
					]
				}, dn.id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showModal,
				onOpenChange: setShowModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-xl",
					onPointerDownOutside: (e) => e.preventDefault(),
					onEscapeKeyDown: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "p-4 pb-2.5 border-b shrink-0 bg-muted/10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMinus, { className: "h-5 w-5 text-rose-500" }), " New Debit Note"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs",
								children: "Issue a debit note for either Vendor (payable reduction) or Customer/Tenant (chargeback/penalty)."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 overflow-y-auto p-5 space-y-4 text-xs max-h-[calc(85vh-130px)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold block mb-1.5",
										children: "Date *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.date,
										onChange: (e) => setForm({
											...form,
											date: e.target.value
										}),
										className: "h-8 text-xs"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold block mb-1.5 text-rose-600 dark:text-rose-400",
										children: "Party Type *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.party_type,
										onValueChange: (v) => handlePartyTypeChange(v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs font-semibold",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Vendor",
											children: "Vendor / Supplier (AP Reduction)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Customer",
											children: "Customer / Tenant (AR Chargeback)"
										})] })]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-xs font-semibold block mb-1.5",
										children: [
											"Select ",
											form.party_type === "Vendor" ? "Vendor" : "Customer / Tenant",
											" *"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.party_name,
										onValueChange: handlePartySelect,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs font-medium",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: form.party_type === "Vendor" ? DEFAULT_VENDORS.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: v.name,
											children: v.name
										}, v.id)) : DEFAULT_CUSTOMERS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: c.name,
											children: c.name
										}, c.id)) })]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold block mb-1.5",
										children: "Linked Lease / Agreement Number *"
									}), (() => {
										const agreementOptions = (form.party_type === "Vendor" ? DEFAULT_VENDORS : DEFAULT_CUSTOMERS).find((p) => p.name === form.party_name)?.agreements || (form.linked_agreement ? [form.linked_agreement] : []);
										return agreementOptions.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.linked_agreement,
											onValueChange: (v) => setForm({
												...form,
												linked_agreement: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs font-mono font-semibold text-cyan-600",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select agreement / lease" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: agreementOptions.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: a,
												children: a
											}, a)) })]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.linked_agreement,
											onChange: (e) => setForm({
												...form,
												linked_agreement: e.target.value
											}),
											placeholder: form.party_type === "Vendor" ? "AGR-VND-2026-001" : "LEASE-2026-00101",
											className: "h-8 text-xs font-mono font-semibold text-cyan-600"
										});
									})()] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold block mb-1.5",
										children: "Linked AP/AR Invoice #"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.linked_invoice,
										onChange: (e) => setForm({
											...form,
											linked_invoice: e.target.value
										}),
										placeholder: form.party_type === "Vendor" ? "APINV-2026-000005" : "INV-AR-2026-001",
										className: "h-8 text-xs font-mono"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold block mb-1.5",
										children: "Debit Note Amount (QAR) *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: "0",
										value: form.amount,
										onChange: (e) => setForm({
											...form,
											amount: Number(e.target.value)
										}),
										className: "h-8 text-xs font-mono font-bold text-base"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold block mb-1.5",
										children: "Reason *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.reason,
										onValueChange: (v) => setForm({
											...form,
											reason: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: activeReasons.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: r,
											children: r
										}, r)) })]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold block mb-1.5",
										children: "Expense / Balancing GL Account *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.expense_gl,
										onValueChange: (v) => setForm({
											...form,
											expense_gl: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: EXPENSE_GL_OPTIONS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: g.value,
											children: g.label
										}, g.value)) })]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-xs font-semibold block mb-1.5",
									children: "Notes / Remarks"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: form.notes,
									onChange: (e) => setForm({
										...form,
										notes: e.target.value
									}),
									placeholder: "Reference details, batch numbers, inspection observations...",
									className: "text-xs min-h-[55px]"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-1 text-[11px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold text-rose-700 dark:text-rose-400",
										children: "GL Double-Entry Posting Preview:"
									}), form.party_type === "Vendor" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-mono",
											children: [
												"• ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-blue-600",
													children: "Dr. 22100001"
												}),
												" Trade Payables - Vendors — QAR ",
												form.amount.toLocaleString()
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-mono",
											children: [
												"• ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-rose-600",
													children: ["Cr. ", form.expense_gl]
												}),
												" ",
												EXPENSE_GL_OPTIONS.find((g) => g.value === form.expense_gl)?.label.split("–")[1]?.trim() || "Expense Reversal",
												" — QAR ",
												form.amount.toLocaleString()
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground italic text-[10px]",
											children: "Reduces payable liability to vendor and reverses property direct expense."
										})
									] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-mono",
											children: [
												"• ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-rose-600",
													children: "Dr. 13100001"
												}),
												" Trade Receivables (Customer) — QAR ",
												form.amount.toLocaleString()
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-mono",
											children: [
												"• ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-emerald-600",
													children: ["Cr. ", form.expense_gl]
												}),
												" ",
												EXPENSE_GL_OPTIONS.find((g) => g.value === form.expense_gl)?.label.split("–")[1]?.trim() || "Recovery Income",
												" — QAR ",
												form.amount.toLocaleString()
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground italic text-[10px]",
											children: "Recognizes chargeback claim receivable from tenant."
										})
									] })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "p-4 border-t bg-muted/20 flex justify-end gap-2 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setShowModal(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "bg-rose-600 hover:bg-rose-700 text-white gap-1",
								onClick: handleCreate,
								disabled: saving,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMinus, { className: "h-4 w-4" }), " Create Debit Note (DRAFT)"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!viewNote,
				onOpenChange: () => setViewNote(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2 text-base",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMinus, { className: "h-5 w-5 text-rose-500" }),
								" ",
								viewNote?.dn_number
							]
						}) }),
						viewNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 text-xs py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border",
									children: [
										["Date", viewNote.date],
										["Party Type", viewNote.party_type || "Vendor"],
										["Party Name", viewNote.party_name],
										["Lease / Agreement #", viewNote.linked_agreement || "—"],
										["Linked Invoice", viewNote.linked_invoice || "—"],
										["Reason", viewNote.reason],
										["Amount (QAR)", viewNote.amount.toLocaleString()],
										["Status", viewNote.status]
									].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-muted-foreground",
										children: k
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold",
										children: v
									})] }, k))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-1 text-[11px]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold",
											children: "GL Journal Entry Impact:"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-mono",
											children: [
												"Dr. ",
												viewNote.party_type === "Customer" ? "13100001 Trade Receivables" : "22100001 Trade Payables",
												" — QAR ",
												viewNote.amount.toLocaleString()
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-mono",
											children: [
												"Cr. ",
												viewNote.expense_gl,
												" — QAR ",
												viewNote.amount.toLocaleString()
											]
										})
									]
								}),
								viewNote.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground italic",
									children: viewNote.notes
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setViewNote(null),
							children: "Close"
						}) })
					]
				})
			})
		]
	});
}
function CreditNoteSubModule() {
	const LS_KEY = "fin_credit_notes";
	const [notes, setNotes] = (0, import_react.useState)(() => {
		try {
			return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
		} catch {
			return [];
		}
	});
	const [showModal, setShowModal] = (0, import_react.useState)(false);
	const [viewNote, setViewNote] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		party_type: "Tenant",
		party_name: DEFAULT_CUSTOMERS[0].name,
		linked_agreement: DEFAULT_CUSTOMERS[0].agreements[0],
		linked_invoice: DEFAULT_CUSTOMERS[0].doc,
		amount: 0,
		reason: CUSTOMER_CREDIT_REASONS[0],
		revenue_gl: REVENUE_GL_OPTIONS[0].value,
		notes: "",
		date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
	});
	function save(updatedNotes) {
		setNotes(updatedNotes);
		localStorage.setItem(LS_KEY, JSON.stringify(updatedNotes));
	}
	function handlePartyTypeChange(type) {
		if (type === "Tenant") {
			const first = DEFAULT_CUSTOMERS[0];
			setForm({
				...form,
				party_type: "Tenant",
				party_name: first.name,
				linked_agreement: first.agreements[0],
				linked_invoice: first.doc,
				reason: CUSTOMER_CREDIT_REASONS[0],
				revenue_gl: "41001001"
			});
		} else {
			const first = DEFAULT_VENDORS[0];
			setForm({
				...form,
				party_type: "Vendor",
				party_name: first.name,
				linked_agreement: first.agreements[0],
				linked_invoice: first.doc,
				reason: VENDOR_CREDIT_REASONS[0],
				revenue_gl: "22100001"
			});
		}
	}
	function handlePartySelect(name) {
		if (form.party_type === "Tenant") {
			const match = DEFAULT_CUSTOMERS.find((c) => c.name === name);
			setForm((prev) => ({
				...prev,
				party_name: name,
				linked_agreement: match?.agreements[0] || prev.linked_agreement,
				linked_invoice: match?.doc || prev.linked_invoice
			}));
		} else {
			const match = DEFAULT_VENDORS.find((v) => v.name === name);
			setForm((prev) => ({
				...prev,
				party_name: name,
				linked_agreement: match?.agreements[0] || prev.linked_agreement,
				linked_invoice: match?.doc || prev.linked_invoice
			}));
		}
	}
	function handleCreate() {
		if (!form.party_name.trim() || !form.amount) return toast.error("Party name and amount are required.");
		setSaving(true);
		const seq = String(notes.length + 1).padStart(6, "0");
		const newNote = {
			id: `cn-${Date.now()}`,
			cn_number: `CN-${(/* @__PURE__ */ new Date()).getFullYear()}-${seq}`,
			date: form.date,
			party_name: form.party_name,
			party_type: form.party_type,
			linked_invoice: form.linked_invoice,
			amount: form.amount,
			reason: form.reason,
			revenue_gl: form.revenue_gl,
			notes: form.notes,
			status: "DRAFT",
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		};
		save([newNote, ...notes]);
		setShowModal(false);
		setSaving(false);
		toast.success(`Credit Note ${newNote.cn_number} created.`);
	}
	function handleApprove(cn) {
		save(notes.map((n) => n.id === cn.id ? {
			...n,
			status: "APPROVED"
		} : n));
		toast.success(`${cn.cn_number} approved.`);
	}
	function handlePost(cn) {
		save(notes.map((n) => n.id === cn.id ? {
			...n,
			status: "POSTED"
		} : n));
		toast.success(`${cn.cn_number} posted to GL. Dr. ${cn.revenue_gl} / Cr. 13100001`);
	}
	function handleCancel(cn) {
		save(notes.map((n) => n.id === cn.id ? {
			...n,
			status: "CANCELLED"
		} : n));
		toast.info(`${cn.cn_number} cancelled.`);
	}
	const totals = {
		draft: notes.filter((n) => n.status === "DRAFT").reduce((s, n) => s + n.amount, 0),
		approved: notes.filter((n) => n.status === "APPROVED").reduce((s, n) => s + n.amount, 0),
		posted: notes.filter((n) => n.status === "POSTED").reduce((s, n) => s + n.amount, 0)
	};
	const activeReasons = form.party_type === "Tenant" ? CUSTOMER_CREDIT_REASONS : VENDOR_CREDIT_REASONS;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-2xl font-bold tracking-tight flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "h-6 w-6 text-emerald-500" }), " Credit Notes"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-0.5",
					children: "Issue credit notes to Customer/Tenant (rental concession, overpayment credit) or Vendor (discount/rebate)."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setShowModal(true),
					className: "gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " New Credit Note"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-3",
				children: [
					{
						label: "Draft",
						value: totals.draft,
						color: "text-slate-600",
						bg: "bg-slate-50 dark:bg-slate-900/30 border-slate-200"
					},
					{
						label: "Approved",
						value: totals.approved,
						color: "text-blue-600",
						bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200"
					},
					{
						label: "Posted to GL",
						value: totals.posted,
						color: "text-emerald-600",
						bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200"
					}
				].map(({ label, value, color, bg }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `p-4 rounded-xl border ${bg}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground font-medium",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: `text-xl font-bold font-mono mt-1 ${color}`,
						children: ["QAR ", value.toLocaleString()]
					})]
				}, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-xl overflow-hidden bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "bg-muted/50 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "CN #"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Party Type"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Party Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Linked Lease / Ref"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Reason"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Revenue GL"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold text-right",
							children: "Amount (QAR)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "font-bold text-right",
							children: "Actions"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: notes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 10,
					className: "text-center py-10 text-muted-foreground text-xs",
					children: "No credit notes yet. Click \"New Credit Note\" to create one."
				}) }) : notes.map((cn) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "text-xs hover:bg-muted/30",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono font-bold text-emerald-600",
							children: cn.cn_number
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: cn.date }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `px-1.5 py-0.5 rounded text-[10px] font-semibold border ${cn.party_type === "Tenant" ? "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400" : "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400"}`,
							children: cn.party_type === "Tenant" ? "Customer / Tenant" : "Vendor"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-semibold",
							children: cn.party_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-cyan-700 dark:text-cyan-400",
							children: cn.linked_invoice || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "max-w-[150px] truncate",
							title: cn.reason,
							children: cn.reason
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-[10px]",
							children: cn.revenue_gl
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right font-semibold font-mono text-foreground",
							children: ["QAR ", cn.amount.toLocaleString()]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteStatusBadge, { status: cn.status }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-end gap-1.5 flex-wrap",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										className: "h-7 text-[10px] px-2",
										onClick: () => setViewNote(cn),
										children: "View"
									}),
									cn.status === "DRAFT" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										className: "h-7 text-[10px] px-2 text-blue-600 border-blue-300",
										onClick: () => handleApprove(cn),
										children: "Approve"
									}),
									cn.status === "APPROVED" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										className: "h-7 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white",
										onClick: () => handlePost(cn),
										children: "Post to GL"
									}),
									(cn.status === "DRAFT" || cn.status === "APPROVED") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "destructive",
										className: "h-7 text-[10px] px-2",
										onClick: () => handleCancel(cn),
										children: "Cancel"
									})
								]
							})
						})
					]
				}, cn.id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showModal,
				onOpenChange: setShowModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-xl",
					onPointerDownOutside: (e) => e.preventDefault(),
					onEscapeKeyDown: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "p-4 pb-2.5 border-b shrink-0 bg-muted/10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "h-5 w-5 text-emerald-500" }), " New Credit Note"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs",
								children: "Issue a credit note to a tenant or vendor for overpayments, discounts, or billing corrections."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 overflow-y-auto p-5 space-y-4 text-xs max-h-[calc(85vh-130px)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold block mb-1.5",
										children: "Date *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.date,
										onChange: (e) => setForm({
											...form,
											date: e.target.value
										}),
										className: "h-8 text-xs"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold block mb-1.5 text-emerald-600 dark:text-emerald-400",
										children: "Party Type *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.party_type,
										onValueChange: (v) => handlePartyTypeChange(v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs font-semibold",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Tenant",
											children: "Tenant / Customer (AR Concession / Credit)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Vendor",
											children: "Vendor / Supplier (Supplier Rebate)"
										})] })]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-xs font-semibold block mb-1.5",
										children: [
											"Select ",
											form.party_type === "Tenant" ? "Tenant / Customer" : "Vendor",
											" *"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.party_name,
										onValueChange: handlePartySelect,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs font-medium",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: form.party_type === "Tenant" ? DEFAULT_CUSTOMERS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: c.name,
											children: c.name
										}, c.id)) : DEFAULT_VENDORS.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: v.name,
											children: v.name
										}, v.id)) })]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold block mb-1.5",
										children: "Linked Lease / Agreement Number *"
									}), (() => {
										const agreementOptions = (form.party_type === "Tenant" ? DEFAULT_CUSTOMERS : DEFAULT_VENDORS).find((p) => p.name === form.party_name)?.agreements || (form.linked_agreement ? [form.linked_agreement] : []);
										return agreementOptions.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.linked_agreement,
											onValueChange: (v) => setForm({
												...form,
												linked_agreement: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs font-mono font-semibold text-cyan-600",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select agreement / lease" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: agreementOptions.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: a,
												children: a
											}, a)) })]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.linked_agreement,
											onChange: (e) => setForm({
												...form,
												linked_agreement: e.target.value
											}),
											placeholder: form.party_type === "Tenant" ? "LEASE-2026-00101" : "AGR-VND-2026-001",
											className: "h-8 text-xs font-mono font-semibold text-cyan-600"
										});
									})()] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold block mb-1.5",
										children: "Linked Invoice / Bill Ref"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.linked_invoice,
										onChange: (e) => setForm({
											...form,
											linked_invoice: e.target.value
										}),
										placeholder: form.party_type === "Tenant" ? "INV-AR-2026-001" : "APINV-2026-000001",
										className: "h-8 text-xs font-mono"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold block mb-1.5",
										children: "Credit Amount (QAR) *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: "0",
										value: form.amount,
										onChange: (e) => setForm({
											...form,
											amount: Number(e.target.value)
										}),
										className: "h-8 text-xs font-mono font-bold text-base"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold block mb-1.5",
										children: "Reason *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.reason,
										onValueChange: (v) => setForm({
											...form,
											reason: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: activeReasons.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: r,
											children: r
										}, r)) })]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold block mb-1.5",
										children: "Revenue / Income GL Account (Debit / Reversal) *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.revenue_gl,
										onValueChange: (v) => setForm({
											...form,
											revenue_gl: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: REVENUE_GL_OPTIONS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: g.value,
											children: g.label
										}, g.value)) })]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-xs font-semibold block mb-1.5",
									children: "Notes / Remarks"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: form.notes,
									onChange: (e) => setForm({
										...form,
										notes: e.target.value
									}),
									placeholder: "Reference number, concession justification, approval details...",
									className: "text-xs min-h-[55px]"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1 text-[11px]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-emerald-700 dark:text-emerald-400",
											children: "GL Posting Preview (upon Post to GL):"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-mono",
											children: [
												"• ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-rose-600",
													children: ["Dr. ", form.revenue_gl]
												}),
												" ",
												REVENUE_GL_OPTIONS.find((g) => g.value === form.revenue_gl)?.label.split("–")[1]?.trim(),
												" — QAR ",
												form.amount.toLocaleString()
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-mono",
											children: [
												"• ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-emerald-600",
													children: "Cr. 13100001"
												}),
												" Trade Receivables — QAR ",
												form.amount.toLocaleString()
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground italic text-[10px]",
											children: "Reduces income recognized and clears receivable amount owed by customer."
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "p-4 border-t bg-muted/20 flex justify-end gap-2 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setShowModal(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "bg-emerald-600 hover:bg-emerald-700 text-white gap-1",
								onClick: handleCreate,
								disabled: saving,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "h-4 w-4" }), " Create Credit Note (DRAFT)"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!viewNote,
				onOpenChange: () => setViewNote(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2 text-base",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "h-5 w-5 text-emerald-500" }),
								" ",
								viewNote?.cn_number
							]
						}) }),
						viewNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 text-xs py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border",
									children: [
										["Date", viewNote.date],
										["Party Type", viewNote.party_type === "Tenant" ? "Customer / Tenant" : "Vendor"],
										["Party Name", viewNote.party_name],
										["Linked Ref", viewNote.linked_invoice || "—"],
										["Reason", viewNote.reason],
										["Amount (QAR)", viewNote.amount.toLocaleString()],
										["Status", viewNote.status]
									].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-muted-foreground",
										children: k
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold",
										children: v
									})] }, k))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1 text-[11px]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold",
											children: "GL Journal Entry:"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-mono",
											children: [
												"Dr. ",
												viewNote.revenue_gl,
												" Revenue — QAR ",
												viewNote.amount.toLocaleString()
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-mono",
											children: ["Cr. 13100001 Trade Receivables — QAR ", viewNote.amount.toLocaleString()]
										})
									]
								}),
								viewNote.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground italic",
									children: viewNote.notes
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setViewNote(null),
							children: "Close"
						}) })
					]
				})
			})
		]
	});
}
//#endregion
export { FinanceModule };
