import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { G as Plus, H as Receipt, Sn as Banknote, Tn as ArrowUpRight, ct as LoaderCircle, jn as ArrowDownLeft, z as RotateCcw } from "../_libs/lucide-react.mjs";
import { n as CardContent, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { u as postVoucher } from "./posting-engine-YWc7RZdA.mjs";
import { n as useAppData } from "./app-data-context-Lw7cnnXe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/finance.journal-4JnRK05H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var VOUCHER_TYPES = [
	{
		value: "Receipt",
		label: "Receipt Voucher",
		icon: ArrowDownLeft,
		color: "text-green-600 bg-green-50"
	},
	{
		value: "Deposit",
		label: "Deposit Voucher",
		icon: Banknote,
		color: "text-blue-600 bg-blue-50"
	},
	{
		value: "Cheque Return",
		label: "Cheque Returned",
		icon: RotateCcw,
		color: "text-red-600 bg-red-50"
	},
	{
		value: "Rent Income",
		label: "Rent Income",
		icon: Receipt,
		color: "text-emerald-600 bg-emerald-50"
	},
	{
		value: "Payment",
		label: "Payment Voucher",
		icon: ArrowUpRight,
		color: "text-orange-600 bg-orange-50"
	}
];
function toVoucherType(name) {
	if (name.includes("Deposit")) return "Deposit";
	if (name.includes("Cheque Return")) return "Cheque Return";
	if (name.includes("Rent Income") || name.includes("Rental Income")) return "Rent Income";
	if (name.includes("Payment")) return "Payment";
	return "Receipt";
}
function TransactionsPage() {
	const { vouchers: sharedVouchers, setVouchers, syncing } = useAppData();
	const [activeType, setActiveType] = (0, import_react.useState)("all");
	const [showNew, setShowNew] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [expandedId, setExpandedId] = (0, import_react.useState)(null);
	const [vForm, setVForm] = (0, import_react.useState)({
		voucher_no: "",
		voucher_type: "Receipt",
		voucher_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		total_amount: 0,
		notes: ""
	});
	const [lines, setLines] = (0, import_react.useState)([{
		account_name: "",
		debit: 0,
		credit: 0
	}, {
		account_name: "",
		debit: 0,
		credit: 0
	}]);
	const vouchers = sharedVouchers.map((voucher) => ({
		id: voucher.id,
		voucher_no: voucher.receiptNo ?? voucher.id,
		voucher_type: toVoucherType(voucher.name),
		voucher_date: voucher.period?.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "",
		total_amount: voucher.amount,
		notes: `${voucher.name}${voucher.period ? ` | ${voucher.period}` : ""} | ${voucher.debit} -> ${voucher.credit}`,
		created_at: "",
		erp_journal_entries: [{
			id: `${voucher.id}-dr`,
			voucher_id: voucher.id,
			account_name: voucher.debit,
			debit: voucher.amount,
			credit: 0,
			created_at: ""
		}, {
			id: `${voucher.id}-cr`,
			voucher_id: voucher.id,
			account_name: voucher.credit,
			debit: 0,
			credit: voucher.amount,
			created_at: ""
		}]
	}));
	const filtered = activeType === "all" ? vouchers : vouchers.filter((voucher) => voucher.voucher_type === activeType);
	const totalDr = filtered.reduce((sum, voucher) => sum + (voucher.erp_journal_entries || []).reduce((acc, line) => acc + Number(line.debit || 0), 0), 0);
	const totalCr = filtered.reduce((sum, voucher) => sum + (voucher.erp_journal_entries || []).reduce((acc, line) => acc + Number(line.credit || 0), 0), 0);
	async function handleCreate() {
		if (!vForm.voucher_no || !vForm.voucher_type) return toast.error("Voucher No and Type are required");
		const drTotal = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
		const crTotal = lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
		if (Math.abs(drTotal - crTotal) > .01) return toast.error(`Journal is not balanced. Dr: ${drTotal} vs Cr: ${crTotal}`);
		setSaving(true);
		try {
			const usableLines = lines.filter((line) => line.account_name);
			if (usableLines.length === 0) throw new Error("At least one accounting line is required.");
			const result = await postVoucher({
				voucher_date: vForm.voucher_date,
				voucher_type: vForm.voucher_type,
				description: vForm.notes || `${vForm.voucher_type} Voucher`,
				reference_no: vForm.voucher_no,
				source_type: "FINANCE_JOURNAL",
				lines: usableLines.map((line) => ({
					account_code: line.account_name.split(" ")[0],
					debit: Number(line.debit) || 0,
					credit: Number(line.credit) || 0,
					description: line.account_name
				}))
			});
			const primaryDebit = usableLines.find((line) => line.debit > 0);
			const primaryCredit = usableLines.find((line) => line.credit > 0);
			setVouchers((previous) => [{
				id: result.voucher_id,
				leaseId: "",
				name: `${vForm.voucher_type} Voucher`,
				receiptNo: result.receipt_number,
				method: vForm.voucher_type === "Receipt" ? "Manual" : "Journal",
				period: vForm.voucher_date,
				debit: primaryDebit?.account_name || "Unknown Debit",
				credit: primaryCredit?.account_name || "Unknown Credit",
				amount: vForm.total_amount || drTotal,
				status: "posted"
			}, ...previous]);
			toast.success(`Voucher ${result.voucher_number} posted. Receipt ${result.receipt_number} generated.`);
			setShowNew(false);
			setVForm({
				voucher_no: "",
				voucher_type: "Receipt",
				voucher_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				total_amount: 0,
				notes: ""
			});
			setLines([{
				account_name: "",
				debit: 0,
				credit: 0
			}, {
				account_name: "",
				debit: 0,
				credit: 0
			}]);
		} catch (error) {
			toast.error("Failed: " + error.message);
		} finally {
			setSaving(false);
		}
	}
	const vTypeInfo = (type) => VOUCHER_TYPES.find((item) => item.value === type) || VOUCHER_TYPES[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold tracking-tight",
					children: "Finance Transactions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Live journal built from the shared voucher store."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setShowNew(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-2" }), "New Voucher"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 md:grid-cols-5 gap-3",
				children: VOUCHER_TYPES.map((voucherType) => {
					const count = vouchers.filter((voucher) => voucher.voucher_type === voucherType.value).length;
					const total = vouchers.filter((voucher) => voucher.voucher_type === voucherType.value).reduce((sum, voucher) => sum + Number(voucher.total_amount || 0), 0);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: `cursor-pointer transition-all border-2 ${activeType === voucherType.value ? "border-primary" : "border-border hover:border-primary/30"}`,
						onClick: () => setActiveType(activeType === voucherType.value ? "all" : voucherType.value),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `inline-flex items-center justify-center rounded-lg p-2 mb-2 ${voucherType.color}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(voucherType.icon, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs font-medium text-muted-foreground",
									children: voucherType.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-lg font-bold mt-1",
									children: count
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: ["QR ", total.toLocaleString()]
								})
							]
						})
					}, voucherType.value);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-6 px-4 py-3 bg-muted/30 rounded-xl border border-border text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Total Dr:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-semibold text-blue-600",
							children: ["QR ", totalDr.toLocaleString()]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Total Cr:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-semibold text-red-600",
							children: ["QR ", totalCr.toLocaleString()]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Balance:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `font-semibold ${Math.abs(totalDr - totalCr) < .01 ? "text-green-600" : "text-red-600"}`,
							children: Math.abs(totalDr - totalCr) < .01 ? "Balanced" : `QR ${(totalDr - totalCr).toLocaleString()} Unbalanced`
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto text-muted-foreground",
						children: [filtered.length, " vouchers shown"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "p-0",
				children: syncing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center py-12",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
				}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "py-12 text-center text-muted-foreground",
					children: "No transactions found"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y divide-border",
					children: filtered.map((voucher) => {
						const info = vTypeInfo(voucher.voucher_type);
						const isExpanded = expandedId === voucher.id;
						const entries = voucher.erp_journal_entries || [];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-4 px-5 py-4 hover:bg-muted/10 cursor-pointer transition-colors",
							onClick: () => setExpandedId(isExpanded ? null : voucher.id),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `flex items-center justify-center rounded-lg h-9 w-9 flex-shrink-0 ${info.color}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(info.icon, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-semibold text-sm",
											children: voucher.voucher_no
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs text-muted-foreground",
											children: [
												info.label,
												" - ",
												voucher.voucher_date || "Shared voucher"
											]
										}),
										voucher.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs text-muted-foreground mt-0.5 truncate",
											children: voucher.notes
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-right flex-shrink-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "font-semibold text-sm",
										children: ["QR ", Number(voucher.total_amount || 0).toLocaleString()]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground",
										children: [entries.length, " lines"]
									})]
								})
							]
						}), isExpanded && entries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "bg-muted/5 border-t border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-10 py-2 text-left text-xs text-muted-foreground font-medium",
											children: "Account Name"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-6 py-2 text-right text-xs text-muted-foreground font-medium",
											children: "Debit (QR)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-6 py-2 text-right text-xs text-muted-foreground font-medium",
											children: "Credit (QR)"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: entries.map((entry, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border/50 last:border-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-10 py-2 text-sm",
											children: entry.account_name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-2 text-right font-mono text-sm text-blue-600",
											children: Number(entry.debit || 0) > 0 ? Number(entry.debit).toLocaleString() : "-"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-2 text-right font-mono text-sm text-red-600",
											children: Number(entry.credit || 0) > 0 ? Number(entry.credit).toLocaleString() : "-"
										})
									]
								}, entry.id || index)) })]
							})
						})] }, voucher.id);
					})
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showNew,
				onOpenChange: setShowNew,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-2xl max-h-[90vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New Finance Voucher" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Create a double-entry journal voucher. Debit must equal Credit." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-5 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Voucher No *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: vForm.voucher_no,
											onChange: (e) => setVForm((form) => ({
												...form,
												voucher_no: e.target.value
											})),
											placeholder: "e.g. RV-2026-001"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Voucher Type *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: vForm.voucher_type,
											onValueChange: (value) => setVForm((form) => ({
												...form,
												voucher_type: value
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: VOUCHER_TYPES.map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: type.value,
												children: type.label
											}, type.value)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Voucher Date *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											value: vForm.voucher_date,
											onChange: (e) => setVForm((form) => ({
												...form,
												voucher_date: e.target.value
											}))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Total Amount (QR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											value: vForm.total_amount || "",
											onChange: (e) => setVForm((form) => ({
												...form,
												total_amount: Number(e.target.value)
											}))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "col-span-2 space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Notes / Narration" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: vForm.notes,
											onChange: (e) => setVForm((form) => ({
												...form,
												notes: e.target.value
											})),
											placeholder: "Description of this transaction"
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
									children: "Journal Entries"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs",
									onClick: () => setLines((current) => [...current, {
										account_name: "",
										debit: 0,
										credit: 0
									}]),
									children: "+ Add Line"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border border-border rounded-lg overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
										className: "bg-muted/20",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-3 py-2 text-left text-xs text-muted-foreground font-medium",
												children: "Account Name"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-3 py-2 text-right text-xs text-muted-foreground font-medium",
												children: "Dr (QR)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-3 py-2 text-right text-xs text-muted-foreground font-medium",
												children: "Cr (QR)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-8" })
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: lines.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-t border-border",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-2 py-1",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: line.account_name,
													onChange: (e) => setLines((items) => items.map((item, i) => i === index ? {
														...item,
														account_name: e.target.value
													} : item)),
													className: "h-8 text-sm",
													placeholder: "e.g. PDC In Hand"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-2 py-1 text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: line.debit || "",
													onChange: (e) => setLines((items) => items.map((item, i) => i === index ? {
														...item,
														debit: Number(e.target.value)
													} : item)),
													className: "h-8 text-sm text-right w-28"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-2 py-1 text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: line.credit || "",
													onChange: (e) => setLines((items) => items.map((item, i) => i === index ? {
														...item,
														credit: Number(e.target.value)
													} : item)),
													className: "h-8 text-sm text-right w-28"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-2 py-1",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "ghost",
													className: "h-7 w-7 p-0 text-muted-foreground hover:text-red-500",
													onClick: () => setLines((items) => items.filter((_, i) => i !== index)),
													children: "x"
												})
											})
										]
									}, index)) })]
								})
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setShowNew(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: handleCreate,
							disabled: saving,
							children: [saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }), "Post Voucher"]
						})] })
					]
				})
			})
		]
	});
}
//#endregion
export { TransactionsPage as component };
