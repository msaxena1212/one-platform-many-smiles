import { B as supabase } from "./supabase-DXZNSXc4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/proc-invoices-api-BBGs9sGK.js
var INVOICE_STORAGE_KEY = "proc_ap_invoices_cache_v2";
var RECEIPT_STORAGE_KEY = "proc_payment_receipts_v2";
function getLocalInvoices() {
	try {
		const raw = localStorage.getItem(INVOICE_STORAGE_KEY);
		if (raw) return JSON.parse(raw);
	} catch (e) {
		console.error("Failed to read local AP Invoices:", e);
	}
	return [];
}
function saveLocalInvoices(list) {
	try {
		localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(list));
		window.dispatchEvent(new Event("ap_invoices_updated"));
	} catch (e) {
		console.error("Failed to save local AP Invoices:", e);
	}
}
function getLocalReceipts() {
	try {
		const raw = localStorage.getItem(RECEIPT_STORAGE_KEY);
		if (raw) return JSON.parse(raw);
	} catch (e) {
		console.error("Failed to read local Payment Receipts:", e);
	}
	return [];
}
function saveLocalReceipts(list) {
	try {
		localStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(list));
		window.dispatchEvent(new Event("payment_receipts_updated"));
	} catch (e) {
		console.error("Failed to save local Payment Receipts:", e);
	}
}
async function postFinancePaymentVoucher(invoice, receiptNum, pvNum) {
	const paidDate = invoice.paid_at || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	try {
		await supabase.from("fin_vouchers").insert({
			voucher_number: pvNum,
			voucher_date: paidDate,
			voucher_type: "PV",
			reference_no: invoice.invoice_number,
			description: `Vendor Payment: ${invoice.invoice_number} | PO: ${invoice.po_number || "N/A"} | GRN: ${invoice.grn_number || "N/A"} | Rcpt: ${receiptNum}`,
			total_amount: invoice.total_amount,
			status: "posted",
			posted_at: (/* @__PURE__ */ new Date()).toISOString()
		});
	} catch (e) {
		console.warn("[ApInvoicesApi] fin_vouchers Supabase insert note:", e);
	}
	const FIN_STORE_KEY = "zyno-pms-finance-data-v1-vouchers";
	try {
		const existing = JSON.parse(localStorage.getItem(FIN_STORE_KEY) || "[]");
		const pvEntry = {
			id: `vch-pv-${Date.now()}`,
			voucher_no: pvNum,
			voucher_type: "Payment Voucher",
			date: paidDate,
			name: `Vendor Settlement — ${invoice.invoice_number} (${receiptNum})`,
			debit: "Trade Payables - Vendors",
			debit_code: "22100001",
			credit: "Bank Operating Account",
			credit_code: "12000001",
			amount: invoice.total_amount,
			method: invoice.payment_method || "Bank Wire",
			status: "Posted",
			property_name: "Procurement",
			unit_ref: invoice.grn_number || invoice.po_number || "N/A",
			tenant_name: String(invoice.vendor_id)
		};
		if (!existing.some((v) => v.voucher_no === pvNum)) {
			localStorage.setItem(FIN_STORE_KEY, JSON.stringify([pvEntry, ...existing]));
			window.dispatchEvent(new Event("finance_vouchers_updated"));
		}
	} catch (e) {
		console.error("Failed to sync Payment Voucher to Finance Store:", e);
	}
	const AP_STORE_KEY = "zyno-pms-finance-data-v1-ap";
	try {
		const existingAp = JSON.parse(localStorage.getItem(AP_STORE_KEY) || "[]");
		const invNo = invoice.invoice_number;
		if (existingAp.some((i) => i.invoice_no === invNo)) {
			const updatedAp = existingAp.map((i) => i.invoice_no === invNo ? {
				...i,
				status: "Paid"
			} : i);
			localStorage.setItem(AP_STORE_KEY, JSON.stringify(updatedAp));
		} else {
			const apEntry = {
				id: `ap-proc-${Date.now()}`,
				invoice_no: invNo,
				vendor: String(invoice.vendor_id),
				date: invoice.invoice_date,
				due_date: invoice.due_date || paidDate,
				account: "51004001 - Repair and Maintenance Cost",
				account_code: "51004001",
				amount: invoice.total_amount,
				status: "Paid"
			};
			localStorage.setItem(AP_STORE_KEY, JSON.stringify([apEntry, ...existingAp]));
		}
	} catch (e) {
		console.error("Failed to sync AP Invoice to Finance Store:", e);
	}
}
var ApInvoicesApi = {
	fetchAll: async () => {
		let invoices = [];
		try {
			const { data, error } = await supabase.from("proc_ap_invoices").select("*").order("created_at", { ascending: false });
			if (!error && Array.isArray(data) && data.length > 0) invoices = data;
		} catch {}
		if (invoices.length === 0) invoices = getLocalInvoices();
		const existingInvNumbers = new Set(invoices.map((i) => i.invoice_number).filter(Boolean));
		try {
			const [grnRes, poRes] = await Promise.all([supabase.from("proc_goods_receipts").select("*").order("created_at", { ascending: false }), supabase.from("proc_purchase_orders").select("*")]);
			const grns = grnRes.data || [];
			const pos = poRes.data || [];
			const poMap = new Map(pos.map((p) => [p.id, p]));
			const existingGrnNumbers = new Set(invoices.map((i) => i.grn_number).filter(Boolean));
			let hasNew = false;
			for (const grn of grns) if (!existingGrnNumbers.has(grn.grn_number)) {
				const po = poMap.get(grn.purchase_order_id);
				const grnSuffix = grn.grn_number ? grn.grn_number.replace(/^GRN-/, "") : String(Date.now()).slice(-6);
				const invNumber = `APINV-${grnSuffix}`;
				const newInv = {
					id: `inv-auto-${grn.id || grnSuffix}`,
					invoice_number: invNumber,
					vendor_id: grn.vendor_id || po?.vendor_id || "1",
					po_number: po?.doc_number || "—",
					grn_number: grn.grn_number,
					invoice_date: grn.grn_date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
					due_date: new Date(Date.now() + 720 * 60 * 60 * 1e3).toISOString().slice(0, 10),
					amount: Number(grn.total_amount || 0),
					tax_amount: 0,
					total_amount: Number(grn.total_amount || 0),
					amount_paid: 0,
					status: "DRAFT",
					posting_status: "UNPOSTED",
					source_type: "PROCUREMENT",
					remarks: `Auto-generated from GRN ${grn.grn_number} against PO ${po?.doc_number || "N/A"}`,
					created_at: grn.created_at || (/* @__PURE__ */ new Date()).toISOString()
				};
				invoices.push(newInv);
				existingGrnNumbers.add(grn.grn_number);
				existingInvNumbers.add(invNumber);
				hasNew = true;
			}
			try {
				const mntInvoicesRaw = localStorage.getItem("pms_vendor_invoices");
				if (mntInvoicesRaw) {
					const mntInvoices = JSON.parse(mntInvoicesRaw);
					for (const m of mntInvoices) if (m.invoiceNo && !existingInvNumbers.has(m.invoiceNo)) {
						invoices.push({
							id: m.id || `mnt-inv-${m.invoiceNo}`,
							invoice_number: m.invoiceNo,
							vendor_id: m.vendorName || "Carrier Middle East Qatar",
							vendor_name: m.vendorName,
							po_number: m.workOrderId || m.ticketId || "—",
							grn_number: m.ticketId || "—",
							invoice_date: m.invoiceDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
							due_date: m.dueDate || new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
							amount: Number(m.baseAmount !== void 0 ? m.baseAmount : Number(m.amount || 0) - Number(m.taxAmount || 0)),
							tax_amount: Number(m.taxAmount || 0),
							total_amount: Number(m.amount || 0),
							amount_paid: m.status === "Approved" || m.status === "PAID" || m.status === "Paid" ? Number(m.amount || 0) : 0,
							status: m.status === "Approved" || m.status === "PAID" || m.status === "Paid" ? "PAID" : "SUBMITTED",
							posting_status: m.status === "Approved" || m.status === "PAID" || m.status === "Paid" ? "POSTED" : "UNPOSTED",
							remarks: m.partsDescription || m.labourDescription || "Maintenance Contractor Invoice",
							receipt_attachment: m.receiptAttachment || m.receiptFileName,
							source_type: "MAINTENANCE",
							property: m.property,
							unit_ref: m.unitRef,
							expense_gl_account: m.glAccount,
							created_at: m.invoiceDate || (/* @__PURE__ */ new Date()).toISOString()
						});
						existingInvNumbers.add(m.invoiceNo);
						hasNew = true;
					}
				}
			} catch (e) {
				console.warn("Failed merging pms_vendor_invoices in ApInvoicesApi:", e);
			}
			if (hasNew) saveLocalInvoices(invoices);
		} catch (e) {
			console.error("Error auto-synthesizing AP Invoices from GRNs / Maintenance:", e);
		}
		return invoices;
	},
	create: async (payload) => {
		const id = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
		const newRecord = {
			...payload,
			id,
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		};
		try {
			const { data } = await supabase.from("proc_ap_invoices").insert({
				invoice_number: payload.invoice_number,
				vendor_id: payload.vendor_id,
				po_number: payload.po_number || null,
				grn_number: payload.grn_number || null,
				invoice_date: payload.invoice_date,
				due_date: payload.due_date || null,
				amount: payload.amount,
				tax_amount: payload.tax_amount || 0,
				total_amount: payload.total_amount,
				status: payload.status || "DRAFT",
				remarks: payload.remarks || null
			}).select().single();
			if (data) newRecord.id = data.id || id;
		} catch {}
		saveLocalInvoices([newRecord, ...getLocalInvoices().filter((i) => i.invoice_number !== newRecord.invoice_number)]);
		return newRecord;
	},
	update: async (id, payload) => {
		try {
			await supabase.from("proc_ap_invoices").update(payload).eq("id", id);
		} catch {}
		const current = getLocalInvoices();
		const existingInv = current.find((i) => i.id === id || i.invoice_number === payload.invoice_number);
		saveLocalInvoices(current.map((i) => {
			if (i.id === id || i.invoice_number === payload.invoice_number) return {
				...i,
				...payload,
				paid_at: payload.status === "PAID" ? i.paid_at || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) : i.paid_at
			};
			return i;
		}));
		if ((payload.status === "PAID" || payload.status === "PARTIAL") && existingInv) {
			const suffix = existingInv.invoice_number.replace(/^APINV-/, "");
			const existingReceipts = getLocalReceipts();
			const invoiceReceipts = existingReceipts.filter((r) => r.invoice_number === existingInv.invoice_number);
			const installmentIndex = invoiceReceipts.length + 1;
			const rcptNum = invoiceReceipts.length === 0 && payload.status === "PAID" ? `RCPT-${suffix}` : `RCPT-${suffix}-P${installmentIndex}`;
			const pvNum = invoiceReceipts.length === 0 && payload.status === "PAID" ? `PV-${suffix}` : `PV-${suffix}-P${installmentIndex}`;
			const paidAmount = Number(payload.amount_paid || existingInv.total_amount);
			const receipt = {
				id: `rcpt-${Date.now()}-${installmentIndex}`,
				receipt_number: rcptNum,
				voucher_number: pvNum,
				invoice_number: existingInv.invoice_number,
				po_number: existingInv.po_number,
				grn_number: existingInv.grn_number,
				vendor_id: existingInv.vendor_id,
				amount_paid: paidAmount,
				payment_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				payment_method: payload.payment_method || "Bank Wire / QNB Corporate",
				reference_no: payload.payment_reference || `TXN-${Date.now().toString().slice(-6)}`,
				bank_account: payload.payment_method?.includes("CBQ") ? "Commercial Bank of Qatar (CBQ) - Operational (IBAN: QA99CBQA00000000654321)" : payload.payment_method?.includes("Cash") ? "12100001 - Cash in Hand (Office Cashier Vault)" : "Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)",
				gl_debit_account: "22100001 - Trade Payables - Vendors",
				gl_credit_account: payload.payment_method?.includes("Cash") ? "12100001 - Cash in Hand / Operating Cash" : "12000001 - Bank Operating Account (QNB)",
				remarks: `${payload.status === "PAID" ? "Final Settlement" : `Installment #${installmentIndex}`} for Invoice ${existingInv.invoice_number}`,
				status: payload.status === "PAID" ? "Settled" : "Partial",
				created_at: (/* @__PURE__ */ new Date()).toISOString()
			};
			saveLocalReceipts([receipt, ...existingReceipts.filter((r) => r.id !== receipt.id)]);
			postFinancePaymentVoucher({
				...existingInv,
				total_amount: paidAmount
			}, rcptNum, pvNum);
			try {
				const mntRaw = localStorage.getItem("pms_vendor_invoices");
				if (mntRaw) {
					const mntList = JSON.parse(mntRaw);
					let mntChanged = false;
					const updatedMnt = mntList.map((m) => {
						if (m.invoiceNo === existingInv.invoice_number || m.id === existingInv.id) {
							mntChanged = true;
							return {
								...m,
								status: payload.status === "PAID" ? "Approved" : m.status
							};
						}
						return m;
					});
					if (mntChanged) localStorage.setItem("pms_vendor_invoices", JSON.stringify(updatedMnt));
				}
			} catch (e) {
				console.warn("Failed cross-syncing pms_vendor_invoices:", e);
			}
			try {
				const finApRaw = localStorage.getItem("zyno-pms-finance-data-v1-ap");
				if (finApRaw) {
					const finApList = JSON.parse(finApRaw);
					let finChanged = false;
					const updatedFin = finApList.map((f) => {
						if (f.invoice_no === existingInv.invoice_number || f.id === existingInv.id) {
							finChanged = true;
							return {
								...f,
								status: payload.status === "PAID" ? "Paid" : f.status
							};
						}
						return f;
					});
					if (finChanged) localStorage.setItem("zyno-pms-finance-data-v1-ap", JSON.stringify(updatedFin));
				}
			} catch (e) {
				console.warn("Failed cross-syncing zyno-pms-finance-data-v1-ap:", e);
			}
			window.dispatchEvent(new Event("finance_vouchers_updated"));
			window.dispatchEvent(new Event("pms_vendor_invoices_updated"));
		}
	},
	delete: async (id) => {
		try {
			await supabase.from("proc_ap_invoices").delete().eq("id", id);
		} catch {}
		saveLocalInvoices(getLocalInvoices().filter((i) => i.id !== id));
	},
	getAllReceipts: () => {
		return getLocalReceipts();
	},
	getReceiptByInvoice: (invoiceNumber) => {
		return getLocalReceipts().find((r) => r.invoice_number === invoiceNumber);
	},
	getAllReceiptsForInvoice: (invoiceNumber) => {
		return getLocalReceipts().filter((r) => r.invoice_number === invoiceNumber);
	},
	getReceiptByGrn: (grnNumber) => {
		return getLocalReceipts().find((r) => r.grn_number === grnNumber);
	}
};
//#endregion
export { ApInvoicesApi as t };
