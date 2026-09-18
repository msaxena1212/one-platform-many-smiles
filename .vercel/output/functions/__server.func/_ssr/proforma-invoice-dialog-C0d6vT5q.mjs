import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $t as CircleCheck, Gt as Clock, U as QrCode, W as Printer, c as User, dt as Layers, gn as Building2, j as ShieldCheck, kt as FileText, tn as CircleAlert } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as ScrollArea } from "./scroll-area-BlnbM3_c.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { i as DialogFooter, n as DialogContent, t as Dialog } from "./dialog-C7RsdMLq.mjs";
import { t as ApInvoicesApi } from "./proc-invoices-api-CiSRP0lp.mjs";
import { t as QRCodeSVG } from "../_libs/qrcode.react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/proforma-invoice-dialog-C0d6vT5q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PaymentReceiptDialog({ receipt, open, onOpenChange, vendorName, allReceipts: propReceipts }) {
	const [selectedReceipt, setSelectedReceipt] = (0, import_react.useState)(receipt);
	(0, import_react.useEffect)(() => {
		setSelectedReceipt(receipt);
	}, [receipt]);
	if (!receipt && !selectedReceipt) return null;
	const currentReceipt = selectedReceipt || receipt;
	if (!currentReceipt) return null;
	const receiptsList = propReceipts && propReceipts.length > 0 ? propReceipts : ApInvoicesApi.getAllReceiptsForInvoice(currentReceipt.invoice_number);
	const displayList = receiptsList.length > 0 ? receiptsList : [currentReceipt];
	const handlePrint = () => {
		window.print();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl bg-card border shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col rounded-xl",
			onPointerDownOutside: (e) => e.preventDefault(),
			onEscapeKeyDown: (e) => e.preventDefault(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex justify-between items-start shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mb-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5 text-emerald-200" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold tracking-wider uppercase text-emerald-100",
								children: "Official Payment Settlement Receipt"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-black tracking-tight",
							children: currentReceipt.receipt_number
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-emerald-100/90 mt-0.5",
							children: ["Finance Voucher Ref: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "font-mono",
								children: currentReceipt.voucher_number
							})]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							className: "bg-white/20 hover:bg-white/20 text-white border-0 text-xs px-3 py-1 font-semibold backdrop-blur-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 mr-1 text-emerald-200" }),
								" ",
								currentReceipt.status === "Partial" ? "Partial Disbursement" : "Settled & Posted"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-emerald-100 mt-2",
							children: currentReceipt.payment_date
						})]
					})]
				}),
				displayList.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-muted/60 border-b px-5 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[11px] font-bold text-muted-foreground flex items-center gap-1.5 shrink-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-3.5 w-3.5 text-primary" }),
							" Payment Installments (",
							displayList.length,
							"):"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-1.5 flex-wrap",
						children: displayList.map((r, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setSelectedReceipt(r),
							className: `px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all ${currentReceipt.id === r.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-background text-muted-foreground hover:bg-muted border"}`,
							children: [
								"#",
								idx + 1,
								": QAR ",
								Number(r.amount_paid).toLocaleString(),
								" (",
								r.receipt_number,
								")"
							]
						}, r.id || idx))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "flex-1 p-5 max-h-[calc(90vh-180px)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between p-4 rounded-xl bg-muted/40 border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground block text-[11px]",
									children: currentReceipt.status === "Partial" ? "Disbursed Installment Amount" : "Total Settled Amount"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-2xl font-black font-mono text-primary",
									children: ["QAR ", Number(currentReceipt.amount_paid).toLocaleString("en-US", { minimumFractionDigits: 2 })]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-right text-[11px]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground block",
											children: "Payment Method"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: currentReceipt.payment_method
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground block font-mono text-[10px] mt-0.5",
											children: currentReceipt.reference_no
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
									children: "3-Way Procurement Match Chain"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-3 gap-2 p-3 rounded-lg border bg-background text-[11px]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-r pr-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground block text-[10px]",
												children: "Purchase Order"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono font-bold text-cyan-600 dark:text-cyan-400",
												children: currentReceipt.po_number || "—"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-r px-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground block text-[10px]",
												children: "Goods Receipt Note"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono font-bold text-emerald-600 dark:text-emerald-400",
												children: currentReceipt.grn_number || "—"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "pl-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground block text-[10px]",
												children: "Payable Invoice"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono font-bold text-violet-600 dark:text-violet-400",
												children: currentReceipt.invoice_number
											})]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3 p-3 rounded-lg border bg-muted/20 text-[11px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground block text-[10px]",
										children: "Vendor / Beneficiary"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-foreground text-xs",
										children: vendorName || currentReceipt.vendor_name || `Vendor #${currentReceipt.vendor_id}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground text-[10px] block mt-0.5",
										children: "Commercial Supplier Registry"
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground block text-[10px]",
									children: "Disbursing Account & Mode"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground",
									children: currentReceipt.bank_account
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
									children: "General Ledger (GL) Posting Impact"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border rounded-lg overflow-hidden text-[11px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between p-2.5 bg-muted/50 border-b font-mono",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-semibold text-rose-600 dark:text-rose-400",
											children: ["Dr. ", currentReceipt.gl_debit_account]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-bold",
											children: ["QAR ", Number(currentReceipt.amount_paid).toLocaleString("en-US", { minimumFractionDigits: 2 })]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between p-2.5 bg-muted/20 font-mono",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-semibold text-emerald-600 dark:text-emerald-400",
											children: ["Cr. ", currentReceipt.gl_credit_account]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-bold",
											children: ["QAR ", Number(currentReceipt.amount_paid).toLocaleString("en-US", { minimumFractionDigits: 2 })]
										})]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-[10px] text-emerald-900 dark:text-emerald-300 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Audit Trail Verified • System Generated Financial Voucher • Real-time GL Sync" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono font-semibold",
									children: currentReceipt.status.toUpperCase()
								})]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "p-4 bg-muted/30 border-t flex sm:justify-between items-center shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] text-muted-foreground hidden sm:inline",
						children: "Official Payment Voucher Receipt"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => onOpenChange(false),
							children: "Close"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							className: "gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white",
							onClick: handlePrint,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-3.5 w-3.5" }), " Print Receipt"]
						})]
					})]
				})
			]
		})
	});
}
function ProformaInvoiceDialog({ invoice, open, onOpenChange, onPayClick, onViewReceiptClick, vendors = [] }) {
	if (!invoice) return null;
	const totalAmount = Number(invoice.total_amount || invoice.amount || 0);
	const taxAmount = Number(invoice.tax_amount || 0);
	const baseAmount = totalAmount - taxAmount > 0 ? totalAmount - taxAmount : totalAmount;
	const localPaid = Number(localStorage.getItem(`partial_paid_${invoice.id}`) || "0");
	const alreadyPaid = Number(invoice.amount_paid ?? (invoice.status === "PAID" || invoice.status === "Paid" ? totalAmount : localPaid));
	const outstanding = Math.max(0, totalAmount - alreadyPaid);
	const isPaid = (invoice.status === "PAID" || invoice.status === "Paid" || outstanding <= .01) && totalAmount > 0;
	const isPartial = invoice.status === "PARTIAL" || invoice.status === "Partial" || alreadyPaid > 0 && outstanding > .01;
	const vendorObj = vendors.find((v) => String(v.id) === String(invoice.vendor_id) || v.name === invoice.vendor || v.name === invoice.vendor_name);
	const vendorDisplayName = invoice.vendor_name || invoice.vendor || vendorObj?.name || (invoice.vendor_id ? `Vendor #${invoice.vendor_id}` : "Vendor / Supplier");
	const vendorCode = vendorObj?.code || invoice.vendor_code || "VND-SUPP";
	const vendorTax = vendorObj?.tax_number || invoice.vendor_tax_number || "CR-QAT-98421";
	const vendorPhone = vendorObj?.phone || invoice.vendor_phone || "+974 4400 0000";
	const vendorEmail = vendorObj?.email || invoice.vendor_email || "accounts@supplier.qa";
	const paymentTerms = invoice.payment_terms || vendorObj?.payment_terms || "Net 30 Days";
	const settlementMode = invoice.settlement_mode || invoice.payment_method || vendorObj?.settlement_mode || "Bank Wire / Electronic Transfer (QNB)";
	const lineItems = invoice.line_items && invoice.line_items.length > 0 ? invoice.line_items : [{
		description: invoice.remarks || (invoice.po_number ? `Procurement Deliverables under ${invoice.po_number}` : `Standard Commercial Vendor Services`),
		quantity: 1,
		unit_rate: baseAmount,
		line_total: baseAmount,
		property: invoice.property || invoice.property_name || "General Facility",
		unit: invoice.unit_ref || "Common Area"
	}];
	const handlePrint = () => {
		window.print();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-3xl bg-card border shadow-2xl p-0 overflow-hidden max-h-[92vh] flex flex-col rounded-xl",
			onPointerDownOutside: (e) => e.preventDefault(),
			onEscapeKeyDown: (e) => e.preventDefault(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white flex justify-between items-start shrink-0 border-b border-indigo-500/20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mb-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded",
								children: "Official Commercial Document"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-indigo-200/80 font-medium",
								children: "Proforma / Accounts Payable Invoice"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-2xl font-black tracking-tight font-mono text-white flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-6 w-6 text-indigo-400" }), invoice.invoice_number || invoice.invoice_no || "PROFORMA-INV"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-slate-300 mt-1",
							children: [
								"Issue Date: ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "text-white",
									children: invoice.invoice_date || invoice.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
								}),
								invoice.due_date && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" • Due Date: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "text-indigo-200",
									children: invoice.due_date
								})] })
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right flex flex-col items-end gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: isPaid ? "default" : isPartial ? "secondary" : "outline",
							className: `text-xs px-3 py-1 font-semibold border ${isPaid ? "bg-emerald-600 text-white border-emerald-400" : isPartial ? "bg-amber-500/20 text-amber-200 border-amber-400/40" : "bg-slate-800 text-slate-200 border-slate-600"}`,
							children: isPaid ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 mr-1 text-emerald-300 inline" }), " Paid & Settled"] }) : isPartial ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5 mr-1 text-amber-300 inline" }),
								" Partial Payment (",
								alreadyPaid.toLocaleString(),
								" Paid)"
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-3.5 w-3.5 mr-1 text-slate-300 inline" }), " Awaiting Finance Settlement"] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[10px] text-slate-400 font-mono",
							children: [
								"Status: ",
								invoice.status || "APPROVED",
								" • ",
								invoice.posting_status || "POSTED"
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "flex-1 p-6 max-h-[calc(92vh-140px)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-5 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1 pr-3 border-r",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] uppercase font-bold text-muted-foreground tracking-wider block",
											children: "Billed To (Buyer / Client)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-bold text-foreground",
											children: "ZYNO Property Management Services LLC"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground text-[11px]",
											children: "Financial Operations & Accounts Payable Division"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground text-[11px]",
											children: "Doha, State of Qatar • CR: 109283-QA"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground text-[11px]",
											children: "Tax / VAT ID: QA-VAT-884029"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1 pl-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] uppercase font-bold text-primary tracking-wider block",
											children: "Vendor / Payee Details"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm font-bold text-foreground flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-3.5 w-3.5 text-primary" }), vendorDisplayName]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground mt-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Vendor Code: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-foreground font-mono",
													children: vendorCode
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["CR / Tax No: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-foreground font-mono",
													children: vendorTax
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Phone: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-foreground",
													children: vendorPhone
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Email: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-foreground",
													children: vendorEmail
												})] })
											]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
									children: "3-Way Procurement Match & Audit Traceability"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-4 gap-2.5 p-3 rounded-xl border bg-card",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-2 rounded-lg bg-blue-500/10 border border-blue-500/20",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[9px] uppercase font-bold text-blue-700 dark:text-blue-400 block",
												children: "Purchase Order"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono font-bold text-blue-600 dark:text-blue-300 text-xs",
												children: invoice.po_number || "PO-DIRECT-REQ"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[9px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block",
												children: "Goods Receipt (GRN)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono font-bold text-emerald-600 dark:text-emerald-300 text-xs",
												children: invoice.grn_number || "GRN-VERIFIED"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-2 rounded-lg bg-violet-500/10 border border-violet-500/20",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[9px] uppercase font-bold text-violet-700 dark:text-violet-400 block",
												children: "Payment Terms"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-violet-700 dark:text-violet-300 text-xs truncate block",
												children: paymentTerms
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-2 rounded-lg bg-amber-500/10 border border-amber-500/20",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[9px] uppercase font-bold text-amber-700 dark:text-amber-400 block",
												children: "Settlement Mode"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-amber-700 dark:text-amber-300 text-[11px] truncate block",
												children: settlementMode
											})]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-3.5 w-3.5 text-primary" }), " Itemized Commercial Line Items & Allocation"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[10px] text-muted-foreground font-mono",
										children: [
											lineItems.length,
											" line item",
											lineItems.length > 1 ? "s" : ""
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "border rounded-xl overflow-hidden bg-background",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
										className: "w-full text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
											className: "bg-muted/60 font-bold border-b text-muted-foreground text-[11px]",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "p-3 text-left",
													children: "#"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "p-3 text-left",
													children: "Description / Deliverable"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "p-3 text-left",
													children: "Property / Unit Allocation"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "p-3 text-center",
													children: "Qty"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "p-3 text-right",
													children: "Unit Rate (QAR)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "p-3 text-right",
													children: "Line Total (QAR)"
												})
											] })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
											className: "divide-y",
											children: lineItems.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "hover:bg-muted/20",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "p-3 font-mono text-muted-foreground",
														children: idx + 1
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
														className: "p-3",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "font-semibold text-foreground",
															children: item.description
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "text-[10px] text-muted-foreground",
															children: "Certified against PO specifications & warehouse intake"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "p-3",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-1.5",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "font-medium text-foreground",
																	children: item.property || "Main Facility"
																}),
																item.unit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	variant: "secondary",
																	className: "text-[10px] px-1.5 py-0 h-4 font-mono text-cyan-700 bg-cyan-50 border border-cyan-200",
																	children: item.unit
																})
															]
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
														className: "p-3 text-center font-mono font-medium",
														children: [item.quantity || 1, " Nos"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "p-3 text-right font-mono text-muted-foreground",
														children: Number(item.unit_rate || item.line_total || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "p-3 text-right font-mono font-bold text-foreground",
														children: Number(item.line_total || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })
													})
												]
											}, idx))
										})]
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4 items-start",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 p-3.5 rounded-xl border bg-muted/20",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5 text-emerald-600" }), " Double-Entry GL Posting Map"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5 font-mono text-[11px]",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between p-2 rounded bg-background border",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-rose-600 dark:text-rose-400 font-semibold",
													children: [
														"Dr. ",
														invoice.expense_gl_code || "51004001",
														" — ",
														invoice.expense_gl_account || "Repair & Maintenance Cost / CMEP"
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-bold",
													children: ["QAR ", baseAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })]
												})]
											}),
											taxAmount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between p-2 rounded bg-background border",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-rose-600 dark:text-rose-400 font-semibold",
													children: "Dr. 12800001 — Input VAT / Recoverable Tax"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-bold",
													children: ["QAR ", taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between p-2 rounded bg-background border",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-emerald-600 dark:text-emerald-400 font-semibold",
													children: [
														"Cr. 22100001 — Trade Payables - Vendors (",
														vendorDisplayName,
														")"
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-bold",
													children: ["QAR ", totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })]
												})]
											})
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-4 rounded-xl border bg-card space-y-2.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Subtotal / Net Amount:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono font-medium text-foreground",
												children: ["QAR ", baseAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "VAT / Tax Amount (0% / Exempt):" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono font-medium text-foreground",
												children: ["QAR ", taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-t pt-2 flex justify-between text-sm font-bold",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-foreground",
												children: "Total Payable Invoice:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono text-base text-primary",
												children: ["QAR ", totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-2.5 rounded-lg bg-muted/40 border space-y-1 text-[11px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between font-semibold",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-emerald-700 dark:text-emerald-400",
													children: "Amount Paid & Settled:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono text-emerald-600 dark:text-emerald-400",
													children: ["QAR ", alreadyPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between font-bold",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: outstanding <= .01 ? "text-muted-foreground" : "text-amber-700 dark:text-amber-400",
													children: "Outstanding Balance Due:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: `font-mono ${outstanding <= .01 ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400"}`,
													children: ["QAR ", outstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })]
												})]
											})]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3.5 rounded-xl border bg-card flex flex-col sm:flex-row items-center justify-between gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "p-2 rounded-lg bg-white border shadow-sm shrink-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QRCodeSVG, {
											value: `ZYNOPMS|CR:109283-QA|TIN:QA-VAT-884029|INV:${invoice.invoice_number || invoice.invoice_no}|TOTAL:${totalAmount}|DATE:${invoice.invoice_date || invoice.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}`,
											size: 68,
											level: "M"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-0.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "h-3.5 w-3.5 text-primary" }), " State of Qatar • Tax Authority Digital Stamp"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-foreground font-semibold text-[11px]",
												children: "Electronic Commercial Invoice Verification"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground",
												children: "Compliant with Qatar Law No. 24 of 2018 on Income Tax • 0% Standard Rate Applied"
											})
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-right shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										className: "text-[10px] border-emerald-500/40 text-emerald-600 bg-emerald-500/5 gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3 text-emerald-600" }), " Digitally Authenticated"]
									})
								})]
							}),
							invoice.remarks && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg border bg-muted/10 space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground uppercase font-bold",
									children: "Remarks & Settlement Notes"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-foreground text-xs",
									children: invoice.remarks
								})]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "p-4 bg-muted/30 border-t flex sm:justify-between items-center shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[11px] text-muted-foreground font-mono hidden sm:inline",
							children: [
								"Ref: ",
								invoice.invoice_number || invoice.invoice_no,
								" • Official PMS Proforma View"
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => onOpenChange(false),
								children: "Close"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "gap-1.5",
								onClick: handlePrint,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-3.5 w-3.5" }), " Print Proforma"]
							}),
							isPaid && onViewReceiptClick && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white",
								onClick: () => {
									onOpenChange(false);
									onViewReceiptClick(invoice);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" }), " View Payment Receipt"]
							})
						]
					})]
				})
			]
		})
	});
}
//#endregion
export { ProformaInvoiceDialog as n, PaymentReceiptDialog as t };
