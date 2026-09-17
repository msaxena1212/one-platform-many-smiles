import { i as __toESM } from "../_runtime.mjs";
import { x as fetchJournalEntries } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as Search, Lt as Download, st as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useFinanceStore } from "./finance-store-BEaAgb9S.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/finance.ledger-ve99cE9M.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GeneralLedger() {
	const { allLedgerTransactions, vouchers, journalEntries: storeJournalEntries } = useFinanceStore();
	const [dbEntries, setDbEntries] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [search, setSearch] = (0, import_react.useState)("");
	const [sourceFilter, setSourceFilter] = (0, import_react.useState)("all");
	(0, import_react.useEffect)(() => {
		fetchJournalEntries().then((data) => {
			setDbEntries(data || []);
		}).catch((err) => {
			console.warn("Error loading DB journal entries:", err);
		}).finally(() => {
			setLoading(false);
		});
	}, []);
	const combinedTransactions = (0, import_react.useMemo)(() => {
		let list = allLedgerTransactions || [];
		if (sourceFilter !== "all") list = list.filter((t) => t.source === sourceFilter);
		if (search.trim()) {
			const q = search.toLowerCase();
			list = list.filter((t) => (t.account_code || "").includes(q) || (t.account_name || "").toLowerCase().includes(q) || (t.reference || "").toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q) || (t.property_name || "").toLowerCase().includes(q) || (t.unit_ref || "").toLowerCase().includes(q) || (t.tenant_name || "").toLowerCase().includes(q));
		}
		return list;
	}, [
		allLedgerTransactions,
		search,
		sourceFilter
	]);
	const totalDebit = (0, import_react.useMemo)(() => combinedTransactions.reduce((s, t) => s + (t.debit || 0), 0), [combinedTransactions]);
	const totalCredit = (0, import_react.useMemo)(() => combinedTransactions.reduce((s, t) => s + (t.credit || 0), 0), [combinedTransactions]);
	const isBalanced = Math.abs(totalDebit - totalCredit) < .01;
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-32 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-bold tracking-tight",
					children: "General Ledger & Transaction Stream"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Immutable dual-entry accounting record across all leases, PDCs, deposits, AP, and payroll."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: `font-mono text-xs px-2.5 py-1 ${isBalanced ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-rose-50 text-rose-700 border-rose-300"}`,
						children: isBalanced ? "✓ Dr = Cr Balanced" : "⚠ Discrepancy"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						className: "gap-1.5 h-8 text-xs",
						onClick: () => toast.success("Exporting General Ledger to Excel/PDF..."),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Export GL"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-12 gap-3 bg-muted/20 p-3.5 rounded-lg border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sm:col-span-8 relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "pl-9 h-9 text-xs bg-background",
						placeholder: "Search account code, account name, reference, property, unit, tenant...",
						value: search,
						onChange: (e) => setSearch(e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sm:col-span-4 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground whitespace-nowrap",
						children: "Source:"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm",
						value: sourceFilter,
						onChange: (e) => setSourceFilter(e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "All Modules & Vouchers"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "PDC Management",
								children: "PDC Management"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "Security Deposits",
								children: "Security Deposits"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "Receivables",
								children: "Receivables & Invoices"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "Payable Invoice",
								children: "Payable Invoices (AP)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "Payroll Sync",
								children: "Payroll & Salary"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "Journal Entry",
								children: "Manual Journals"
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 bg-card shadow-sm border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-medium text-muted-foreground",
							children: "Total Debits"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xl font-bold font-mono text-blue-600 mt-1",
							children: ["QR ", totalDebit.toLocaleString(void 0, {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 bg-card shadow-sm border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-medium text-muted-foreground",
							children: "Total Credits"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xl font-bold font-mono text-emerald-600 mt-1",
							children: ["QR ", totalCredit.toLocaleString(void 0, {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 bg-card shadow-sm border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-medium text-muted-foreground",
							children: "Total Ledger Postings"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xl font-bold font-mono text-foreground mt-1",
							children: [combinedTransactions.length, " lines"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border rounded-lg overflow-hidden bg-card shadow-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-muted/50 border-b border-border text-left",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 font-bold",
										children: "Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 font-bold",
										children: "GL / SL Code"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 font-bold",
										children: "Account Description"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 font-bold",
										children: "Type"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 font-bold",
										children: "Reference / Entity"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 font-bold",
										children: "Source"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 text-right font-bold w-32",
										children: "Debit (QAR)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 text-right font-bold w-32",
										children: "Credit (QAR)"
									})
								] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-border",
								children: combinedTransactions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 8,
									className: "py-12 text-center text-muted-foreground",
									children: "No ledger transactions matching criteria."
								}) }) : combinedTransactions.map((tx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-muted/30 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2.5 font-mono text-muted-foreground whitespace-nowrap",
											children: tx.date
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2.5 font-mono font-bold text-primary",
											children: tx.account_code
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-medium text-foreground",
												children: tx.account_name
											}), tx.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] text-muted-foreground truncate max-w-xs",
												children: tx.description
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: `text-[10px] capitalize font-semibold ${tx.account_type === "Assets" ? "text-blue-700 bg-blue-50 border-blue-200" : tx.account_type === "Liabilities" ? "text-amber-700 bg-amber-50 border-amber-200" : tx.account_type === "Revenue" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : tx.account_type === "Expenses" ? "text-rose-700 bg-rose-50 border-rose-200" : "text-purple-700"}`,
												children: tx.account_type
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-2.5 font-mono",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-semibold text-foreground",
												children: tx.reference
											}), (tx.property_name || tx.unit_ref || tx.tenant_name) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] text-muted-foreground",
												children: [
													tx.property_name,
													tx.unit_ref,
													tx.tenant_name
												].filter(Boolean).join(" · ")
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "secondary",
												className: "text-[10px] font-normal",
												children: tx.source
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2.5 text-right font-mono font-semibold text-blue-600",
											children: tx.debit > 0 ? tx.debit.toLocaleString(void 0, {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2
											}) : "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2.5 text-right font-mono font-semibold text-emerald-600",
											children: tx.credit > 0 ? tx.credit.toLocaleString(void 0, {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2
											}) : "—"
										})
									]
								}, tx.id))
							}),
							combinedTransactions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", {
								className: "bg-muted/40 border-t-2 border-border font-bold text-xs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-4 py-3",
										colSpan: 6,
										children: [
											"Total (",
											combinedTransactions.length,
											" postings)"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-4 py-3 text-right font-mono font-bold text-blue-700",
										children: ["QR ", totalDebit.toLocaleString(void 0, {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-4 py-3 text-right font-mono font-bold text-emerald-700",
										children: ["QR ", totalCredit.toLocaleString(void 0, {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2
										})]
									})
								] })
							})
						]
					})
				})
			})
		]
	});
}
//#endregion
export { GeneralLedger as component };
