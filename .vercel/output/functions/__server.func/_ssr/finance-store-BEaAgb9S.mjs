import { i as __toESM } from "../_runtime.mjs";
import { B as supabase } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { d as resolveAccountingAccounts, u as postVoucher } from "./posting-engine-YWc7RZdA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/finance-store-BEaAgb9S.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var INITIAL_JOURNAL_LEDGER = [];
var INITIAL_GRN_MAPPINGS = [];
var INITIAL_PAYABLE_INVOICES = [];
var INITIAL_VOUCHERS = [];
var INITIAL_RECEIVABLE_INVOICES = [];
var INITIAL_LEGAL_RECEIVABLES = [];
var INITIAL_PAYROLL_SYNCS = [];
var INITIAL_BANK_CLEARANCES = [];
var INITIAL_BANK_RECONCILIATIONS = [];
var INITIAL_RECON_STATEMENTS = [];
var INITIAL_CASH_BOOK = [];
var INITIAL_PETTY_CASH = [];
var FinanceContext = (0, import_react.createContext)(null);
function FinanceProvider({ children }) {
	const FINANCE_STORAGE_KEY = "zyno-pms-finance-data-v5";
	const [journalEntries, setJournalEntries] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return INITIAL_JOURNAL_LEDGER;
		try {
			const saved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-journals`);
			return saved ? JSON.parse(saved) : INITIAL_JOURNAL_LEDGER;
		} catch {
			return INITIAL_JOURNAL_LEDGER;
		}
	});
	const [grnMappings, setGrnMappings] = (0, import_react.useState)(INITIAL_GRN_MAPPINGS);
	const [payableInvoices, setPayableInvoices] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return INITIAL_PAYABLE_INVOICES;
		try {
			const saved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-ap`);
			return saved ? JSON.parse(saved) : INITIAL_PAYABLE_INVOICES;
		} catch {
			return INITIAL_PAYABLE_INVOICES;
		}
	});
	const [vouchers, setVouchers] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return INITIAL_VOUCHERS;
		try {
			const saved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-vouchers`);
			if (!saved) return INITIAL_VOUCHERS;
			const list = JSON.parse(saved);
			return Array.isArray(list) ? list : INITIAL_VOUCHERS;
		} catch {
			return INITIAL_VOUCHERS;
		}
	});
	const [receivableInvoices, setReceivableInvoices] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return INITIAL_RECEIVABLE_INVOICES;
		try {
			const saved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-ar`);
			return saved ? JSON.parse(saved) : INITIAL_RECEIVABLE_INVOICES;
		} catch {
			return INITIAL_RECEIVABLE_INVOICES;
		}
	});
	const [legalReceivables, setLegalReceivables] = (0, import_react.useState)(INITIAL_LEGAL_RECEIVABLES);
	const [payrollSyncs, setPayrollSyncs] = (0, import_react.useState)(INITIAL_PAYROLL_SYNCS);
	const [bankClearances, setBankClearances] = (0, import_react.useState)(INITIAL_BANK_CLEARANCES);
	const [bankReconciliations, setBankReconciliations] = (0, import_react.useState)(INITIAL_BANK_RECONCILIATIONS);
	const [reconciliationStatements, setReconciliationStatements] = (0, import_react.useState)(INITIAL_RECON_STATEMENTS);
	const [cashBookEntries, setCashBookEntries] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return INITIAL_CASH_BOOK;
		try {
			const saved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-cashbook`);
			return saved ? JSON.parse(saved) : INITIAL_CASH_BOOK;
		} catch {
			return INITIAL_CASH_BOOK;
		}
	});
	const [pettyCashEntries, setPettyCashEntries] = (0, import_react.useState)(INITIAL_PETTY_CASH);
	const [isSyncing, setIsSyncing] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (typeof window !== "undefined") try {
			localStorage.setItem(`${FINANCE_STORAGE_KEY}-vouchers`, JSON.stringify(vouchers));
			localStorage.setItem(`${FINANCE_STORAGE_KEY}-journals`, JSON.stringify(journalEntries));
			localStorage.setItem(`${FINANCE_STORAGE_KEY}-ar`, JSON.stringify(receivableInvoices));
			localStorage.setItem(`${FINANCE_STORAGE_KEY}-ap`, JSON.stringify(payableInvoices));
			localStorage.setItem(`${FINANCE_STORAGE_KEY}-cashbook`, JSON.stringify(cashBookEntries));
		} catch {}
	}, [
		vouchers,
		journalEntries,
		receivableInvoices,
		payableInvoices,
		cashBookEntries
	]);
	const seenVoucherIds = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const fetchSupabaseData = async (showToast = false) => {
		setIsSyncing(true);
		try {
			const { data: vData, error: vError } = await supabase.from("fin_vouchers").select("*, fin_voucher_lines(account_code, account_name, debit, credit)").order("voucher_date", { ascending: false });
			if (!vError && vData) {
				setVouchers((prev) => {
					const existingNos = new Set(prev.map((v) => v.voucher_no));
					const mapped = vData.filter((r) => !existingNos.has(r.voucher_number)).map((r) => {
						const isPV = r.voucher_type === "PV";
						const isRV = r.voucher_type === "RV";
						const lines = r.fin_voucher_lines || [];
						const drLine = lines.find((l) => Number(l.debit) > 0);
						const crLine = lines.find((l) => Number(l.credit) > 0);
						const desc = (r.description || "").toLowerCase();
						let drCode = drLine?.account_code;
						let crCode = crLine?.account_code;
						let drName = drLine?.account_name;
						let crName = crLine?.account_name;
						if (!drCode || !crCode) if (desc.includes("rent pdc") || desc.includes("rv-l1-01")) {
							drCode = "12900";
							drName = "PDC In Hand";
							crCode = "21400";
							crName = "Customer (PDC) Liability";
						} else if (desc.includes("security deposit") || desc.includes("rv-l1-02")) {
							drCode = "12100001";
							drName = "Cash In Hand";
							crCode = "21500";
							crName = "Security Deposit Liability";
						} else if (desc.includes("kahramaa") || desc.includes("rv-l1-utl") || desc.includes("qatar cool") || desc.includes("rv-l1-qc") || desc.includes("reservation") || desc.includes("rv-l1-res") || desc.includes("service fee") || desc.includes("rv-l1-svc")) {
							drCode = "12100001";
							drName = "Cash In Hand";
							crCode = "21100";
							crName = "Refundable Deposit Liability";
						} else if (desc.includes("guarantee cheque") || desc.includes("rv-l1-gchq")) {
							drCode = "12900";
							drName = "PDC In Hand (Guarantee)";
							crCode = "21200";
							crName = "Guarantee Cheque Liability";
						} else if (desc.includes("pdc deposited to bank") || desc.includes("vch-dep-")) {
							drCode = "12000001";
							drName = "Bank Operating Account";
							crCode = "12900";
							crName = "PDC In Hand";
						} else if (desc.includes("pdc cleared") || desc.includes("vch-clr-")) {
							drCode = "21400";
							drName = "Customer (PDC) Liability";
							crCode = "41100";
							crName = "Rental Revenue";
						} else if (desc.includes("pdc returned on cash settlement") || desc.includes("vch-csh-ret-")) {
							drCode = "21400";
							drName = "Customer (PDC) Liability";
							crCode = "12900";
							crName = "PDC In Hand";
						} else if (desc.includes("bank deposit of replaced pdc cash till") || desc.includes("vch-csh-dep-")) {
							drCode = "12000001";
							drName = "Bank Operating Account";
							crCode = "12100001";
							drName = "Cash In Hand";
						} else if (desc.includes("cash collected in place of pdc") || desc.includes("vch-csh-pdc-")) {
							drCode = "12100001";
							drName = "Cash In Hand";
							crCode = "41100";
							crName = "Rental Revenue";
						} else if (desc.includes("pdc cheque returned") || desc.includes("vch-ret-pdc-")) {
							drCode = "12900";
							drName = "PDC In Hand";
							crCode = "12000001";
							drName = "Bank Operating Account";
						} else if (desc.includes("tenant dues restored") || desc.includes("vch-ret-ar-")) {
							drCode = "12413";
							drName = "Tenant Receivables";
							crCode = "21400";
							crName = "Customer (PDC) Liability";
						} else if (desc.includes("admin charges") || desc.includes("rv-l1-adm")) {
							drCode = "12100001";
							drName = "Cash In Hand";
							crCode = "41500";
							crName = "Admin Fee Income";
						} else if (desc.includes("agency commission") || desc.includes("rv-l1-agn")) {
							drCode = "12100001";
							drName = "Cash In Hand";
							crCode = "41400";
							crName = "Agency Commission Income";
						} else {
							drCode = isPV ? "22100001" : "12000001";
							drName = isPV ? "Accounts Payable / Expense" : "Bank Operating Account";
							crCode = isPV ? "12000001" : "41100";
							crName = isPV ? "Bank Operating Account" : "Rental Revenue";
						}
						return {
							id: r.id,
							voucher_no: r.voucher_number,
							voucher_type: isPV ? "Payment Voucher" : isRV ? "Receipt Voucher" : "Journal Voucher",
							date: r.voucher_date,
							name: r.description || r.voucher_number,
							debit: drName || "Debit Account",
							debit_code: drCode || "12000001",
							credit: crName || "Credit Account",
							credit_code: crCode || "41100",
							amount: Number(r.total_amount) || 0,
							status: r.status === "posted" ? "Posted" : "Draft"
						};
					});
					return mapped.length ? [...mapped, ...prev] : prev;
				});
				vData.forEach((r) => seenVoucherIds.current.add(r.id));
			}
			const { data: jData, error: jError } = await supabase.from("journal_entries").select("*, journal_lines(*, gl_accounts(code, name_en))").order("posting_date", { ascending: false }).limit(50);
			if (!jError && jData?.length) setJournalEntries((prev) => {
				const existingNos = new Set(prev.map((j) => j.je_no));
				const mapped = jData.filter((r) => !existingNos.has(r.je_no)).map((r) => {
					const drLine = r.journal_lines?.find((l) => l.debit > 0);
					const crLine = r.journal_lines?.find((l) => l.credit > 0);
					return {
						id: r.id,
						je_no: r.je_no,
						posting_date: r.posting_date,
						reference: r.source_id || r.je_no,
						narration: r.narration || "",
						dr_account: drLine?.gl_accounts?.name_en || "General Account",
						dr_code: drLine?.gl_accounts?.code || "10000",
						cr_account: crLine?.gl_accounts?.name_en || "General Account",
						cr_code: crLine?.gl_accounts?.code || "10000",
						amount: drLine?.debit || 0,
						status: r.status || "Posted"
					};
				});
				return mapped.length ? [...mapped, ...prev] : prev;
			});
			if (typeof window !== "undefined") try {
				const vDataSaved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-vouchers`);
				if (vDataSaved) {
					const parsed = JSON.parse(vDataSaved);
					if (Array.isArray(parsed) && parsed.length) setVouchers(parsed);
				}
				const jDataSaved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-journals`);
				if (jDataSaved) {
					const parsed = JSON.parse(jDataSaved);
					if (Array.isArray(parsed) && parsed.length) setJournalEntries(parsed);
				}
				const arDataSaved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-ar`);
				if (arDataSaved) {
					const parsed = JSON.parse(arDataSaved);
					if (Array.isArray(parsed) && parsed.length) setReceivableInvoices(parsed);
				}
				const apDataSaved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-ap`);
				if (apDataSaved) {
					const parsed = JSON.parse(apDataSaved);
					if (Array.isArray(parsed) && parsed.length) setPayableInvoices(parsed);
				}
				const cbDataSaved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-cashbook`);
				if (cbDataSaved) {
					const parsed = JSON.parse(cbDataSaved);
					if (Array.isArray(parsed) && parsed.length) setCashBookEntries(parsed);
				}
			} catch {}
			if (showToast) toast.success("Financial records & reports refreshed successfully");
		} catch (err) {
			if (showToast) toast.error("Failed to refresh financial records: " + (err?.message || "Error"));
		} finally {
			setIsSyncing(false);
		}
	};
	const refreshFinanceData = async () => {
		await fetchSupabaseData(true);
	};
	(0, import_react.useEffect)(() => {
		fetchSupabaseData(false);
		const voucherChannel = supabase.channel("finance-store:fin_vouchers").on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "fin_vouchers"
		}, (payload) => {
			const r = payload.new;
			if (!r?.id || seenVoucherIds.current.has(r.id)) return;
			seenVoucherIds.current.add(r.id);
			const isPV = r.voucher_type === "PV";
			const isRV = r.voucher_type === "RV";
			const mapped = {
				id: r.id,
				voucher_no: r.voucher_number,
				voucher_type: isPV ? "Payment Voucher" : isRV ? "Receipt Voucher" : "Journal Voucher",
				date: r.voucher_date,
				name: r.description || r.voucher_number,
				debit: isPV ? "Accounts Payable / Expense" : isRV ? "Bank Operating Account" : "Journal Debit",
				debit_code: isPV ? r.reference_no && /^\d+$/.test(r.reference_no) ? r.reference_no : "22100001" : "12000001",
				credit: isPV ? "Bank Operating Account" : isRV ? "Rental Revenue" : "Journal Credit",
				credit_code: isPV ? "12000001" : r.reference_no && /^\d+$/.test(r.reference_no) ? r.reference_no : "41100",
				amount: Number(r.total_amount) || 0,
				status: "Posted"
			};
			setVouchers((prev) => {
				if (prev.some((v) => v.id === r.id || v.voucher_no === r.voucher_number)) return prev;
				return [mapped, ...prev];
			});
			toast.info(`Voucher ${r.voucher_number} posted to GL via Supabase.`);
		}).subscribe();
		const eventChannel = supabase.channel("finance-store:fin_accounting_events").on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "fin_accounting_events"
		}, (payload) => {
			const r = payload.new;
			if (!r?.id) return;
			const entry = {
				id: r.id,
				je_no: r.reference_number || `EVT-${r.id.slice(0, 8).toUpperCase()}`,
				posting_date: r.posting_date || r.event_date,
				reference: r.source_id || r.reference_number || r.id,
				narration: r.description || r.event_type,
				dr_account: "Various (see lines)",
				dr_code: "10000",
				cr_account: "Various (see lines)",
				cr_code: "10000",
				amount: r.total_debit || 0,
				status: "Posted",
				property_name: r.metadata?.property_name,
				unit_ref: r.metadata?.unit_ref,
				tenant_name: r.metadata?.tenant_name
			};
			setJournalEntries((prev) => {
				if (prev.some((j) => j.id === r.id || j.je_no === entry.je_no)) return prev;
				return [entry, ...prev];
			});
		}).subscribe();
		const handleVoucherSync = () => {
			const STORE_KEY_V = `${FINANCE_STORAGE_KEY}-vouchers`;
			const STORE_KEY_AP = `${FINANCE_STORAGE_KEY}-ap`;
			try {
				const vData = JSON.parse(localStorage.getItem(STORE_KEY_V) || "[]");
				setVouchers((prev) => {
					const existingNos = new Set(prev.map((v) => v.voucher_no));
					const newOnes = vData.filter((v) => !existingNos.has(v.voucher_no));
					return newOnes.length ? [...newOnes, ...prev] : prev;
				});
				const apData = JSON.parse(localStorage.getItem(STORE_KEY_AP) || "[]");
				setPayableInvoices((prev) => {
					const existingNos = new Set(prev.map((i) => i.invoice_no));
					const newOnes = apData.filter((i) => !existingNos.has(i.invoice_no));
					const updates = apData.filter((i) => existingNos.has(i.invoice_no));
					let merged = newOnes.length ? [...newOnes, ...prev] : [...prev];
					if (updates.length) merged = merged.map((i) => {
						const u = updates.find((u) => u.invoice_no === i.invoice_no);
						return u ? {
							...i,
							status: u.status
						} : i;
					});
					return merged;
				});
			} catch {}
		};
		window.addEventListener("finance_vouchers_updated", handleVoucherSync);
		handleVoucherSync();
		return () => {
			supabase.removeChannel(voucherChannel);
			supabase.removeChannel(eventChannel);
			window.removeEventListener("finance_vouchers_updated", handleVoucherSync);
		};
	}, []);
	function addJournalEntry(entry) {
		const newEntry = {
			...entry,
			id: `je-${Date.now()}`,
			status: "Posted"
		};
		setJournalEntries((prev) => [newEntry, ...prev]);
		toast.success(`Journal Entry ${newEntry.je_no} posted to General Ledger!`);
		Promise.resolve(supabase.from("journal_entries").insert({
			je_no: newEntry.je_no,
			posting_date: newEntry.posting_date,
			period: newEntry.posting_date?.slice(0, 7) ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 7),
			source_module: "Finance Store",
			source_id: newEntry.reference || null,
			narration: newEntry.narration || null,
			status: "posted"
		})).then(({ error }) => {
			if (error) console.warn("[FinanceStore] journal_entries persist warn:", error.message);
		});
	}
	function addGrnMapping(mapping) {
		const newGrn = {
			...mapping,
			id: `grn-${Date.now()}`
		};
		setGrnMappings((prev) => [newGrn, ...prev]);
		toast.success(`GRN ${newGrn.grn_no} cost allocated & posted to ${newGrn.mapped_gl}!`);
	}
	function addPayableInvoice(inv) {
		const newInv = {
			...inv,
			id: `ap-${Date.now()}`,
			status: "Unpaid"
		};
		setPayableInvoices((prev) => [newInv, ...prev]);
		toast.success(`AP Invoice ${newInv.invoice_no} created and posted!`);
	}
	function markPayableInvoicePaid(invoiceNo) {
		setPayableInvoices((prev) => prev.map((inv) => {
			if (inv.invoice_no === invoiceNo) {
				const pv = {
					id: `vch-pay-${Date.now()}`,
					voucher_no: `VCH-PAY-${Math.floor(1e3 + Math.random() * 9e3)}`,
					voucher_type: "Payment Voucher",
					date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
					name: `Settlement for Invoice ${invoiceNo}`,
					debit: inv.account,
					debit_code: inv.account_code || "22100001",
					credit: "Bank Operating Account",
					credit_code: "12000001",
					amount: inv.amount,
					method: "Bank Transfer",
					status: "Posted"
				};
				setVouchers((v) => [pv, ...v]);
				return {
					...inv,
					status: "Paid"
				};
			}
			return inv;
		}));
		toast.success(`Invoice ${invoiceNo} marked as Paid. Payment Voucher generated.`);
	}
	function addVoucher(vch) {
		const newVch = {
			...vch,
			id: `vch-${Date.now()}`,
			status: "Posted"
		};
		setVouchers((prev) => [newVch, ...prev]);
		toast.success(`${newVch.voucher_type} ${newVch.voucher_no} posted successfully!`);
		const typeCode = newVch.voucher_type === "Payment Voucher" ? "PV" : newVch.voucher_type === "Receipt Voucher" ? "RV" : "JV";
		Promise.resolve(supabase.from("fin_vouchers").insert({
			voucher_number: newVch.voucher_no,
			voucher_date: newVch.date,
			voucher_type: typeCode,
			reference_no: newVch.debit_code || null,
			description: newVch.name,
			total_amount: newVch.amount,
			status: "posted",
			posted_at: (/* @__PURE__ */ new Date()).toISOString()
		}).select("id")).then(({ error, data }) => {
			if (error) {
				console.warn("[FinanceStore] fin_vouchers persist warn:", error.message);
				return;
			}
			const insertedId = Array.isArray(data) ? data[0]?.id : data?.id;
			if (insertedId) seenVoucherIds.current.add(String(insertedId));
		});
	}
	function addReceivableInvoice(inv) {
		const newInv = {
			...inv,
			id: `ar-${Date.now()}`,
			status: "Pending"
		};
		setReceivableInvoices((prev) => [newInv, ...prev]);
		toast.success(`AR Invoice ${newInv.invoice_no} generated and posted!`);
	}
	function markReceivableInvoicePaid(invoiceNo) {
		setReceivableInvoices((prev) => prev.map((inv) => {
			if (inv.invoice_no === invoiceNo) {
				const rv = {
					id: `vch-rec-${Date.now()}`,
					voucher_no: `VCH-REC-${Math.floor(1e3 + Math.random() * 9e3)}`,
					voucher_type: "Receipt Voucher",
					date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
					name: `Receipt for Rent Invoice ${invoiceNo}`,
					debit: "Bank Operating Account",
					debit_code: "12000001",
					credit: "Rental Revenue",
					credit_code: inv.account_code || "41100",
					amount: inv.amount,
					method: "Bank Transfer",
					status: "Posted"
				};
				setVouchers((v) => [rv, ...v]);
				return {
					...inv,
					status: "Paid"
				};
			}
			return inv;
		}));
		toast.success(`AR Invoice ${invoiceNo} marked as Collected.`);
	}
	function addLegalEscalation(esc) {
		const newLgl = {
			...esc,
			id: `lgl-${Date.now()}`
		};
		setLegalReceivables((prev) => [newLgl, ...prev]);
		toast.success(`Legal Case ${newLgl.legal_case_id} escalated and posted to Legal Receivables (12411).`);
	}
	function recoverLegalReceivable(caseId, amount, bankRef, paymentMethod = "Bank Transfer", propertyName, unitRef, tenantName, details) {
		const isCash = paymentMethod.toLowerCase().includes("cash");
		const isCheque = paymentMethod.toLowerCase().includes("cheque");
		const isPdc = paymentMethod.toLowerCase().includes("pdc");
		const methodType = isCash ? "CASH" : isPdc ? "PDC" : "BANK";
		const entryDate = details?.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		const finalTenant = tenantName || "Valued Tenant";
		const finalUnit = unitRef || "General";
		const finalProp = propertyName || "Main Portfolio";
		const detailNarration = isCheque && details?.chequeNo ? ` [Cheque #${details.chequeNo} - ${details.chequeBank || "Bank"}]` : "";
		setLegalReceivables((prev) => prev.map((l) => {
			if (l.legal_case_id === caseId || l.id === caseId) {
				const newBal = Math.max(0, l.outstanding_balance - amount);
				return {
					...l,
					outstanding_balance: newBal,
					status: newBal <= 0 ? "Fully Recovered" : "Partially Recovered"
				};
			}
			return l;
		}));
		const drCode = isCash ? "12100001" : isPdc ? "12900" : "12000001";
		const drAccount = isCash ? "Cash In Hand" : isPdc ? "PDC In Hand" : isCheque ? `Bank Account (${details?.chequeBank || "Bank"})` : "Bank Operating Account";
		const voucherNumber = `VCH-REC-${bankRef}`;
		setVouchers((prev) => {
			if (prev.some((v) => v.voucher_no === voucherNumber)) return prev;
			return [{
				id: `vch-rec-lgl-${Date.now()}`,
				voucher_no: voucherNumber,
				voucher_type: "Receipt Voucher",
				date: entryDate,
				name: `Legal Settlement Recovery — ${finalTenant} (${finalUnit}) [${caseId}]${detailNarration}`,
				debit: drAccount,
				debit_code: drCode,
				credit: "Legal Receivables (12411)",
				credit_code: "12411",
				amount,
				method: paymentMethod,
				status: "Posted",
				property_name: finalProp,
				unit_ref: finalUnit,
				tenant_name: finalTenant
			}, ...prev];
		});
		resolveAccountingAccounts({
			transactionType: "LEGAL_RECOVERY",
			paymentMethod: methodType,
			propertyId: propertyName || "1",
			unitName: unitRef
		}).then(({ debit: drAcct, credit: crAcct }) => {
			return postVoucher({
				voucher_date: entryDate,
				voucher_type: "Receipt",
				description: `Legal Settlement Recovery — ${finalTenant} (${finalUnit}) [${caseId}]${detailNarration}`,
				reference_no: bankRef,
				lines: [{
					account_code: drAcct.slCode,
					account_name: `${drAcct.glName} / ${drAcct.slName}`,
					debit: amount,
					credit: 0,
					description: drAcct.slName
				}, {
					account_code: crAcct.slCode,
					account_name: `${crAcct.glName} / ${crAcct.slName}`,
					debit: 0,
					credit: amount,
					description: crAcct.slName
				}]
			});
		}).catch((err) => {
			console.warn("[FinanceStore] Legal recovery posting note:", err?.message);
		});
		toast.success(`Recovered QR ${amount.toLocaleString()} for Legal Case ${caseId}.`);
	}
	function addPayrollSync(run) {
		const newRun = {
			...run,
			id: `pr-${Date.now()}`,
			status: "Posted",
			error_details: `Successfully mapped & posted net QR ${run.total_amount.toLocaleString()} from ${run.bank_account}`
		};
		setPayrollSyncs((prev) => [newRun, ...prev]);
		const pv = {
			id: `vch-pr-${Date.now()}`,
			voucher_no: `VCH-PAY-${run.payroll_run_id}`,
			voucher_type: "Payment Voucher",
			date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			name: `Payroll Disbursement for Period ${run.period} - ${run.department}`,
			debit: "Staff Salaries & Allowances",
			debit_code: "50100",
			credit: "Bank Operating Account",
			credit_code: "12000001",
			amount: run.total_amount,
			method: "Bank Transfer",
			status: "Posted"
		};
		setVouchers((v) => [pv, ...v]);
		toast.success(`Payroll Run ${run.payroll_run_id} synced & posted to General Ledger!`);
	}
	function addBankClearance(entry) {
		const newClr = {
			...entry,
			id: `bc-${Date.now()}`
		};
		setBankClearances((prev) => [newClr, ...prev]);
		toast.success(`Clearance recorded for ${newClr.ref}`);
	}
	function addBankReconciliation(rec) {
		const newRec = {
			...rec,
			id: `br-${Date.now()}`
		};
		setBankReconciliations((prev) => [newRec, ...prev]);
		toast.success(`Bank Reconciliation for ${newRec.statement_date} completed!`);
	}
	function addReconciliationStatement(stmt) {
		const newStmt = {
			...stmt,
			id: `rs-${Date.now()}`
		};
		setReconciliationStatements((prev) => [newStmt, ...prev]);
		toast.success(`Reconciliation Statement ${newStmt.title} archived.`);
	}
	function addCashBookEntry(entry) {
		setCashBookEntries((prev) => {
			const currentIn = prev.reduce((s, r) => s + (r.cash_in || 0), 0);
			const currentOut = prev.reduce((s, r) => s + (r.cash_out || 0), 0);
			const newBal = currentIn + (entry.type === "in" ? entry.amount : 0) - (currentOut + (entry.type === "out" ? entry.amount : 0));
			return [{
				id: `cb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
				date: entry.date,
				voucher: entry.voucher,
				description: entry.description,
				cash_in: entry.type === "in" ? entry.amount : 0,
				cash_out: entry.type === "out" ? entry.amount : 0,
				balance: newBal
			}, ...prev];
		});
		toast.success("Cash Book entry recorded.");
	}
	function addPettyCashEntry(entry) {
		const newPetty = {
			...entry,
			id: `pc-${Date.now()}`
		};
		setPettyCashEntries((prev) => [newPetty, ...prev]);
		toast.success("Petty Cash expense recorded.");
	}
	const allLedgerTransactions = (0, import_react.useMemo)(() => {
		const list = [];
		const COA_ACCOUNT_NAMES = {
			"10000": "Assets Control Account",
			"12000": "Bank Accounts",
			"12000001": "Bank Operating Account (QNB)",
			"12000002": "CBQ Escrow Bank Account",
			"12100": "Cash Accounts",
			"12100001": "Cash in Hand / Operating Cash",
			"12300001": "Advance to Vendors",
			"12400": "Receivables Control",
			"12411001": "Legal Receivables (Defaulted / Escalated)",
			"12413001": "Tenant Receivables",
			"12900001": "Rent PDC In Hand",
			"12900002": "Guarantee Cheque In Hand",
			"13000": "Fixed Assets Portfolio",
			"13900": "Accumulated Depreciation",
			"20000": "Liabilities Control Account",
			"22100": "Trade Payables",
			"22100001": "Trade Payables - Vendors",
			"22100002": "Vendor Retention Payable",
			"21100001": "Reservation Advance Deposit",
			"21100003": "Kahramaa Utility Deposit",
			"21100004": "Qatar Cool Deposit",
			"21100005": "Service Fee Deposit",
			"21100006": "Guarantee Cheque Liability",
			"21200001": "Guarantee Cheque Received",
			"21300001": "Tenant Refund Payable",
			"21400001": "Customer PDC Liability",
			"21500001": "Security Deposit Liability",
			"21600001": "Utility Deposit Liability",
			"30000": "Owner Capital & Equity",
			"40000": "Revenue Control Account",
			"41100001": "Rental Revenue",
			"41201001": "Parking Revenue",
			"41201002": "Agency & Admin Commission",
			"41201003": "Utility Recovery Income",
			"41201004": "CAM & Maintenance Recovery",
			"41201005": "Late Payment Penalty Revenue",
			"41201006": "Lease Transfer Fee Revenue",
			"41201007": "Cheque Dishonour Recovery",
			"51001": "Labour Outsource",
			"51001001": "CMEP-Labor Cost-Facilities Mgt",
			"51001002": "House Keeping Labor Cost",
			"51001003": "Security Staff Labor Cost",
			"51002": "Annual Maintenance Contract",
			"51002001": "CMEP-Facilities Mgt AMC",
			"51002002": "Swimming Pool Maintenance",
			"51002003": "CCTV AMC Charges",
			"51002004": "Landscaping AMC Charges",
			"51002005": "Fire Fighting AMC Charges",
			"51002006": "Fire Alarm AMC Charges",
			"51003": "Utilities & Other Direct Exp",
			"51003001": "Electricity & Water-Common Area",
			"51003002": "Electricity & Water-Vacant Period",
			"51003003": "Electricity & Water- Inclusive",
			"51003004": "Telephone & Internet Expenses",
			"51003005": "Master Community Charges",
			"51003006": "Common Area Maintenance Cost",
			"51004": "Repairs & Maintenance",
			"51004001": "Repair and Maintenance Cost",
			"51004002": "Bathtub, Kitchen Zinc & WC Charges",
			"51004003": "Sewage & Waste Removal Charges",
			"51004004": "Sweet Water Charges",
			"51004005": "Sports&Gym Equipment Maintenance",
			"51004006": "Cost of CMEP Materials",
			"51004007": "Cost of House Keeping Materials",
			"51004008": "Cost of Landscaping Material",
			"51004009": "Check Out Expenses",
			"51101": "Staff Cost",
			"51101001": "Staff Basic Salary",
			"51101002": "Staff Accommodation Allowance",
			"51101003": "Staff Transportation Allowance",
			"51101004": "Staff Mobile & Telephone Allowance",
			"51101005": "Staff Overtime - Fixed",
			"51101006": "Staff Leave Salary",
			"51101007": "Staff Air Ticket",
			"51101008": "Staff End of Service Benefits",
			"51101009": "Staff Bonus",
			"51101010": "Staff Special Allowance",
			"51101011": "Staff Food Allowance",
			"51101012": "Staff Other Allowance",
			"51101013": "Staff Laundry Cost",
			"51101014": "Staff Medical & Insurance Cost",
			"51101015": "Staff Uniform Cost",
			"51101016": "Staff Visa & Immigration Cost",
			"51102": "General and Administrative Expenses",
			"51102001": "Vehicles & Other Insurance Expenses",
			"51102002": "Government & Municipal Charges",
			"51102003": "Legal Charges",
			"51102004": "Other General & Administration Expenses",
			"51102005": "Commission & Brokerage Expenses",
			"51102006": "Printing & Stationary Expenses",
			"51102007": "Subscription Fees",
			"51102008": "Audit Fees",
			"51102009": "Vehicle Hire Expenses",
			"51102010": "Vehicle Maintenance Cost",
			"51102011": "Miscellaneous Expense",
			"51102012": "Generator Maintenance Expenses",
			"51102013": "Brokerage Leasing",
			"51102014": "IT Expenses",
			"51102015": "Recruitment Charges",
			"51103": "Head office expenses",
			"51103001": "Head office expenses",
			"51104": "Selling and Marketing Expenses",
			"51104001": "Sales Promotion Expenses",
			"51104002": "Other Advertisement Expenses",
			"51105": "Finance Cost",
			"51105001": "Other Bank Charges",
			"51106": "Depreciation&Amortization",
			"51106001": "Machinery (Light) - Depreciation",
			"51106002": "Furniture & Fixtures - Depreciation",
			"51106003": "Office Equipment - Depreciation",
			"51106004": "Commercial Kitchen Equipment - Depreciation",
			"51106005": "Appliances - Depreciation",
			"51106006": "IT Software Amortization",
			"51106007": "Sports And Gym Equipment - Depreciation",
			"51106008": "Tools And Equipment - Depreciation",
			"51106009": "CCTV Systems - Depreciation",
			"51106010": "Access Control - Depreciation",
			"51106011": "Vehicles - Depreciation"
		};
		const getCoaName = (name, code, defaultFallback) => {
			const trimmedCode = (code || "").trim();
			if (trimmedCode && COA_ACCOUNT_NAMES[trimmedCode]) return COA_ACCOUNT_NAMES[trimmedCode];
			const strippedName = (name || "").trim().replace(/^\d{4,6}\s*[-–—]\s*/, "");
			if (strippedName && !/^\d+$/.test(strippedName) && strippedName !== trimmedCode) return strippedName;
			return defaultFallback;
		};
		journalEntries.forEach((je) => {
			const isExpense = je.dr_code.startsWith("5");
			const isAsset = je.dr_code.startsWith("1");
			const isLiab = je.dr_code.startsWith("2");
			const isRev = je.dr_code.startsWith("4");
			let derivedTenant = je.tenant_name;
			let derivedUnit = je.unit_ref;
			let derivedProperty = je.property_name;
			if ((!derivedTenant || derivedTenant === "Corporate / Admin") && je.narration) {
				const slashMatch = je.narration.match(/[—–\-]\s*([^(|—–\-/]+?)\s*\/\s*([^(|—–\-/]+)/);
				if (slashMatch && slashMatch[1]?.trim() && slashMatch[1].trim() !== "Tenant") {
					derivedTenant = slashMatch[1].trim();
					if (!derivedUnit || derivedUnit === "General") derivedUnit = slashMatch[2].trim().replace(/\s+via.*$/i, "");
				} else {
					const parenMatch = je.narration.match(/[—–\-]\s*([^(|—–\-]+?)\s*\(([^)]+)\)/);
					if (parenMatch && parenMatch[1]?.trim() && parenMatch[1].trim() !== "Tenant") {
						derivedTenant = parenMatch[1].trim();
						if (!derivedUnit || derivedUnit === "General") derivedUnit = parenMatch[2].trim();
					} else {
						const dashMatch = je.narration.match(/[—–\-]\s*([^|—–\-]+)/);
						if (dashMatch && dashMatch[1]?.trim() && dashMatch[1].trim() !== "Tenant") {
							const cand = dashMatch[1].trim();
							if (cand.startsWith("Flat") || cand.startsWith("AAA") || cand.includes("Unit")) {
								if (!derivedUnit || derivedUnit === "General") derivedUnit = cand;
							} else derivedTenant = cand;
						}
					}
				}
			}
			if ((!derivedProperty || derivedProperty === "Main Portfolio" || derivedProperty === "Unassigned") && derivedUnit) {
				const u = derivedUnit.toLowerCase();
				if (u.includes("flat16") || u.includes("aaa")) derivedProperty = "Old Salata - Residence No:23";
				else if (u.includes("flat14") || u.includes("flat08") || u.includes("bldg06") || u.includes("mansoura")) derivedProperty = "MANSOURA - BLDG06";
				else if (u.includes("002") || u.includes("neeman")) derivedProperty = "Neeman's New Building";
			}
			if (derivedTenant && derivedTenant.toLowerCase().includes("ashutosh")) {
				if (!derivedProperty || derivedProperty === "Main Portfolio" || derivedProperty === "Unassigned") derivedProperty = "MANSOURA - BLDG06";
				if (!derivedUnit || derivedUnit === "General" || derivedUnit === "Unassigned") derivedUnit = "Flat14";
			}
			const finalProperty = derivedProperty && derivedProperty !== "Main Portfolio" ? derivedProperty : "Unassigned";
			const finalUnit = derivedUnit && derivedUnit !== "General" ? derivedUnit : "Unassigned";
			const finalTenant = derivedTenant && derivedTenant !== "Corporate / Admin" ? derivedTenant : "Unassigned";
			list.push({
				id: `tx-je-dr-${je.id}`,
				date: je.posting_date,
				account_code: je.dr_code,
				account_name: getCoaName(je.dr_account, je.dr_code, "Operating Account"),
				account_type: isExpense ? "Expenses" : isAsset ? "Assets" : isLiab ? "Liabilities" : isRev ? "Revenue" : "Assets",
				reference: je.je_no,
				debit: je.amount,
				credit: 0,
				source: "Journal Ledger",
				description: je.narration,
				property_name: finalProperty,
				unit_ref: finalUnit,
				tenant_name: finalTenant
			});
			const isCrRev = je.cr_code.startsWith("4");
			const isCrLiab = je.cr_code.startsWith("2");
			const isCrAsset = je.cr_code.startsWith("1");
			const isCrExp = je.cr_code.startsWith("5");
			list.push({
				id: `tx-je-cr-${je.id}`,
				date: je.posting_date,
				account_code: je.cr_code,
				account_name: getCoaName(je.cr_account, je.cr_code, "Operating Account"),
				account_type: isCrRev ? "Revenue" : isCrLiab ? "Liabilities" : isCrAsset ? "Assets" : isCrExp ? "Expenses" : "Capital",
				reference: je.je_no,
				debit: 0,
				credit: je.amount,
				source: "Journal Ledger",
				description: je.narration,
				property_name: finalProperty,
				unit_ref: finalUnit,
				tenant_name: finalTenant
			});
		});
		grnMappings.forEach((grn) => {
			list.push({
				id: `tx-grn-dr-${grn.id}`,
				date: "2026-08-18",
				account_code: grn.mapped_code || "51004001",
				account_name: getCoaName(grn.mapped_gl, grn.mapped_code, "Repairs & Maintenance"),
				account_type: grn.mapped_code?.startsWith("1") ? "Assets" : "Expenses",
				reference: grn.grn_no,
				debit: grn.amount,
				credit: 0,
				source: "GRN Cost Mapping",
				description: `${grn.vendor} - ${grn.description}`,
				property_name: grn.property || "Unassigned",
				unit_ref: "Facility Plant & Equip",
				tenant_name: grn.vendor
			});
			list.push({
				id: `tx-grn-cr-${grn.id}`,
				date: "2026-08-18",
				account_code: "22100001",
				account_name: "Accounts Payable",
				account_type: "Liabilities",
				reference: grn.grn_no,
				debit: 0,
				credit: grn.amount,
				source: "GRN Cost Mapping",
				description: `Payable to ${grn.vendor}`,
				property_name: grn.property || "Unassigned",
				unit_ref: "Facility Plant & Equip",
				tenant_name: grn.vendor
			});
		});
		payableInvoices.forEach((ap) => {
			list.push({
				id: `tx-ap-dr-${ap.id}`,
				date: ap.date,
				account_code: ap.account_code || "51004001",
				account_name: getCoaName(ap.account, ap.account_code, "Repairs & Maintenance"),
				account_type: "Expenses",
				reference: ap.invoice_no,
				debit: ap.amount,
				credit: 0,
				source: "Payable Invoice",
				description: `Invoice from ${ap.vendor}`,
				property_name: "Unassigned",
				unit_ref: "Building Maintenance",
				tenant_name: ap.vendor
			});
			list.push({
				id: `tx-ap-cr-${ap.id}`,
				date: ap.date,
				account_code: "22100001",
				account_name: "Accounts Payable",
				account_type: "Liabilities",
				reference: ap.invoice_no,
				debit: 0,
				credit: ap.amount,
				source: "Payable Invoice",
				description: `Payable to ${ap.vendor}`,
				property_name: "Unassigned",
				unit_ref: "Building Maintenance",
				tenant_name: ap.vendor
			});
		});
		vouchers.forEach((vch) => {
			const isDrExp = vch.debit_code.startsWith("5");
			const isDrAsset = vch.debit_code.startsWith("1");
			const isDrLiab = vch.debit_code.startsWith("2");
			let propName = vch.property_name || vch.property;
			let unitName = vch.unit_ref || vch.unit;
			let tenantName = vch.tenant_name || vch.tenant;
			if ((!tenantName || tenantName === "Corporate / Admin") && vch.name) {
				const slashMatch = vch.name.match(/[—–\-]\s*([^(|—–\-/]+?)\s*\/\s*([^(|—–\-/]+)/);
				if (slashMatch && slashMatch[1]?.trim() && slashMatch[1].trim() !== "Tenant") {
					tenantName = slashMatch[1].trim();
					if (!unitName || unitName === "General") unitName = slashMatch[2].trim();
				} else {
					const parenMatch = vch.name.match(/[—–\-]\s*([^(|—–\-]+?)\s*\(([^)]+)\)/);
					if (parenMatch && parenMatch[1]?.trim() && parenMatch[1].trim() !== "Tenant") {
						tenantName = parenMatch[1].trim();
						if (!unitName || unitName === "General") unitName = parenMatch[2].trim();
					} else {
						const dashMatch = vch.name.match(/[—–\-]\s*([^|—–\-]+)/);
						if (dashMatch && dashMatch[1]?.trim()) tenantName = dashMatch[1].trim();
					}
				}
			}
			if ((!propName || propName === "Main Portfolio") && unitName) {
				const u = unitName.toLowerCase();
				if (u.includes("flat16") || u.includes("aaa")) propName = "Old Salata - Residence No:23";
				else if (u.includes("flat14") || u.includes("flat08") || u.includes("mansoura")) propName = "MANSOURA - BLDG06";
				else if (u.includes("002") || u.includes("neeman")) propName = "Neeman's New Building";
			}
			if (tenantName && tenantName.toLowerCase().includes("ashutosh")) {
				if (!propName || propName === "Main Portfolio") propName = "MANSOURA - BLDG06";
				if (!unitName || unitName === "General") unitName = "Flat14";
			}
			const finalProp = propName || (vch.name.includes("Depreciation") ? "Main Portfolio (Corporate)" : "Main Portfolio");
			const finalUnit = unitName || (vch.name.includes("Depreciation") ? "Fixed Assets / Depr" : "General");
			const finalTenant = tenantName || (vch.name.includes("Depreciation") ? "Internal Assets Desk" : "Corporate / Admin");
			list.push({
				id: `tx-vch-dr-${vch.id}`,
				date: vch.date,
				account_code: vch.debit_code || "12000001",
				account_name: getCoaName(vch.debit, vch.debit_code, "Bank Operating Account"),
				account_type: isDrExp ? "Expenses" : isDrAsset ? "Assets" : isDrLiab ? "Liabilities" : "Assets",
				reference: vch.voucher_no,
				debit: vch.amount,
				credit: 0,
				source: vch.voucher_type,
				description: vch.name,
				property_name: finalProp,
				unit_ref: finalUnit,
				tenant_name: finalTenant
			});
			const isCrRev = vch.credit_code.startsWith("4");
			const isCrAsset = vch.credit_code.startsWith("1");
			const isCrLiab = vch.credit_code.startsWith("2");
			list.push({
				id: `tx-vch-cr-${vch.id}`,
				date: vch.date,
				account_code: vch.credit_code || "41100",
				account_name: getCoaName(vch.credit, vch.credit_code, "Rental Revenue"),
				account_type: isCrRev ? "Revenue" : isCrAsset ? "Assets" : isCrLiab ? "Liabilities" : "Capital",
				reference: vch.voucher_no,
				debit: 0,
				credit: vch.amount,
				source: vch.voucher_type,
				description: vch.name,
				property_name: finalProp,
				unit_ref: finalUnit,
				tenant_name: finalTenant
			});
		});
		receivableInvoices.forEach((ar) => {
			list.push({
				id: `tx-ar-dr-${ar.id}`,
				date: ar.date,
				account_code: "12413",
				account_name: "Tenant Receivables",
				account_type: "Assets",
				reference: ar.invoice_no,
				debit: ar.amount,
				credit: 0,
				source: "Receivable Invoice",
				description: `Rent Invoice for ${ar.tenant}`,
				property_name: ar.property,
				unit_ref: ar.unit,
				tenant_name: ar.tenant
			});
			list.push({
				id: `tx-ar-cr-${ar.id}`,
				date: ar.date,
				account_code: ar.account_code || "41100",
				account_name: "Rental Revenue",
				account_type: "Revenue",
				reference: ar.invoice_no,
				debit: 0,
				credit: ar.amount,
				source: "Receivable Invoice",
				description: `${ar.stream} - ${ar.tenant}`,
				property_name: ar.property,
				unit_ref: ar.unit,
				tenant_name: ar.tenant
			});
		});
		legalReceivables.forEach((lgl) => {
			list.push({
				id: `tx-lgl-dr-${lgl.id}`,
				date: lgl.escalation_date,
				account_code: "12411",
				account_name: "Legal Receivables (Defaulted)",
				account_type: "Assets",
				reference: lgl.legal_case_id,
				debit: lgl.original_amount,
				credit: 0,
				source: "Legal Receivables",
				description: `Legal Escalation: ${lgl.tenant_name}`,
				property_name: lgl.property_name,
				unit_ref: lgl.unit_ref,
				tenant_name: lgl.tenant_name
			});
			list.push({
				id: `tx-lgl-cr-${lgl.id}`,
				date: lgl.escalation_date,
				account_code: "12413",
				account_name: "Tenant Receivables",
				account_type: "Assets",
				reference: lgl.legal_case_id,
				debit: 0,
				credit: lgl.original_amount,
				source: "Legal Receivables",
				description: `Transferred to Legal: ${lgl.tenant_name}`,
				property_name: lgl.property_name,
				unit_ref: lgl.unit_ref,
				tenant_name: lgl.tenant_name
			});
		});
		bankClearances.forEach((clr) => {
			if (clr.status === "Cleared") {
				const isUtilityOrPayment = clr.type.toLowerCase().includes("utility") || clr.type.toLowerCase().includes("transfer") || clr.type.toLowerCase().includes("payment");
				const drCode = isUtilityOrPayment ? "22100001" : "12000001";
				const drName = isUtilityOrPayment ? "Accounts Payable (Utility/Disbursement)" : "Bank Operating Account (Cleared Funds)";
				const crCode = isUtilityOrPayment ? "12000001" : "12900";
				const crName = isUtilityOrPayment ? "Bank Operating Account" : "PDC In Hand / Cheques Held";
				list.push({
					id: `tx-clr-dr-${clr.id}`,
					date: clr.date,
					account_code: drCode,
					account_name: drName,
					account_type: isUtilityOrPayment ? "Liabilities" : "Assets",
					reference: clr.ref,
					debit: clr.amount,
					credit: 0,
					source: "Bank Clearance",
					description: `Bank Clearance for ${clr.ref} (${clr.bank})`,
					property_name: "Corporate Treasury",
					unit_ref: "Bank Operations",
					tenant_name: clr.bank
				});
				list.push({
					id: `tx-clr-cr-${clr.id}`,
					date: clr.date,
					account_code: crCode,
					account_name: crName,
					account_type: isUtilityOrPayment ? "Assets" : "Assets",
					reference: clr.ref,
					debit: 0,
					credit: clr.amount,
					source: "Bank Clearance",
					description: `Bank Clearance for ${clr.ref} (${clr.bank})`,
					property_name: "Corporate Treasury",
					unit_ref: "Bank Operations",
					tenant_name: clr.bank
				});
			}
		});
		return list.sort((a, b) => new Date(a.date || "").getTime() - new Date(b.date || "").getTime());
	}, [
		journalEntries,
		grnMappings,
		payableInvoices,
		vouchers,
		receivableInvoices,
		legalReceivables,
		bankClearances
	]);
	const trialBalanceDetailed = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		allLedgerTransactions.forEach((tx) => {
			const existing = map.get(tx.account_code) || {
				code: tx.account_code,
				name: tx.account_name,
				type: tx.account_type,
				debit: 0,
				credit: 0
			};
			existing.debit += tx.debit || 0;
			existing.credit += tx.credit || 0;
			map.set(tx.account_code, existing);
		});
		return Array.from(map.values()).map((a) => ({
			...a,
			balance: a.debit - a.credit
		}));
	}, [allLedgerTransactions]);
	const trialBalanceSummary = (0, import_react.useMemo)(() => {
		let assetsDr = 0;
		let liabilitiesCr = 0;
		let capitalCr = 0;
		let revenueCr = 0;
		let expensesDr = 0;
		trialBalanceDetailed.forEach((acc) => {
			const netDr = acc.debit - acc.credit;
			const netCr = acc.credit - acc.debit;
			if (acc.type === "Assets") assetsDr += netDr;
			else if (acc.type === "Liabilities") liabilitiesCr += netCr;
			else if (acc.type === "Capital") capitalCr += netCr;
			else if (acc.type === "Revenue") revenueCr += netCr;
			else if (acc.type === "Expenses") expensesDr += netDr;
		});
		const totalDebit = (assetsDr > 0 ? assetsDr : 0) + (expensesDr > 0 ? expensesDr : 0) + (liabilitiesCr < 0 ? -liabilitiesCr : 0) + (capitalCr < 0 ? -capitalCr : 0) + (revenueCr < 0 ? -revenueCr : 0);
		const totalCredit = (liabilitiesCr > 0 ? liabilitiesCr : 0) + (capitalCr > 0 ? capitalCr : 0) + (revenueCr > 0 ? revenueCr : 0) + (assetsDr < 0 ? -assetsDr : 0) + (expensesDr < 0 ? -expensesDr : 0);
		const isBalanced = Math.abs(totalDebit - totalCredit) < .01;
		return {
			assets: assetsDr,
			liabilities: liabilitiesCr,
			capital: capitalCr,
			revenue: revenueCr,
			expenses: expensesDr,
			totalDebit,
			totalCredit,
			isBalanced
		};
	}, [trialBalanceDetailed]);
	const profitAndLossReport = (0, import_react.useMemo)(() => {
		let rentalRevenue = 0;
		let otherRevenue = 0;
		let maintenanceExpense = 0;
		let payrollExpense = 0;
		let utilitiesExpense = 0;
		let cleaningExpense = 0;
		let totalRevenue = 0;
		let totalExpenses = 0;
		allLedgerTransactions.forEach((tx) => {
			if (tx.account_type === "Revenue") {
				const netRev = (tx.credit || 0) - (tx.debit || 0);
				totalRevenue += netRev;
				if (tx.account_code.startsWith("411")) rentalRevenue += netRev;
				else otherRevenue += netRev;
			} else if (tx.account_type === "Expenses") {
				const netExp = (tx.debit || 0) - (tx.credit || 0);
				totalExpenses += netExp;
				if (tx.account_code.startsWith("51101")) payrollExpense += netExp;
				else if (tx.account_code.startsWith("51003")) utilitiesExpense += netExp;
				else if (tx.account_code === "51004007" || tx.account_code === "51001002" || tx.account_code === "51002002") cleaningExpense += netExp;
				else maintenanceExpense += netExp;
			}
		});
		const netProfit = totalRevenue - totalExpenses;
		return {
			rentalRevenue,
			otherRevenue,
			totalRevenue,
			maintenanceExpense,
			payrollExpense,
			utilitiesExpense,
			cleaningExpense,
			totalExpenses,
			netProfit
		};
	}, [allLedgerTransactions]);
	const balanceSheetReport = (0, import_react.useMemo)(() => {
		let bankCashAssets = 0;
		let pdcInHandAssets = 0;
		let arReceivablesAssets = 0;
		let legalReceivablesAssets = 0;
		let fixedAssets = 0;
		let totalAssets = 0;
		let apLiabilities = 0;
		let securityDepositLiabilities = 0;
		let pdcCustomerLiabilities = 0;
		let totalLiabilities = 0;
		let ownerCapital = 0;
		allLedgerTransactions.forEach((tx) => {
			if (tx.account_type === "Assets") {
				const netAsset = (tx.debit || 0) - (tx.credit || 0);
				totalAssets += netAsset;
				if (tx.account_code.startsWith("121") || tx.account_code.startsWith("12000") || tx.account_code === "10000") bankCashAssets += netAsset;
				else if (tx.account_code.startsWith("129")) pdcInHandAssets += netAsset;
				else if (tx.account_code.startsWith("12411")) legalReceivablesAssets += netAsset;
				else if (tx.account_code.startsWith("124") || tx.account_code.startsWith("123")) arReceivablesAssets += netAsset;
				else if (tx.account_code.startsWith("13")) fixedAssets += netAsset;
				else bankCashAssets += netAsset;
			} else if (tx.account_type === "Liabilities") {
				const netLiab = (tx.credit || 0) - (tx.debit || 0);
				totalLiabilities += netLiab;
				if (tx.account_code.startsWith("221")) apLiabilities += netLiab;
				else if (tx.account_code.startsWith("214")) pdcCustomerLiabilities += netLiab;
				else if (tx.account_code.startsWith("215") || tx.account_code.startsWith("211") || tx.account_code.startsWith("213")) securityDepositLiabilities += netLiab;
				else apLiabilities += netLiab;
			} else if (tx.account_type === "Capital") ownerCapital += (tx.credit || 0) - (tx.debit || 0);
		});
		const netProfit = profitAndLossReport.netProfit;
		const totalEquity = ownerCapital + netProfit;
		const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
		return {
			bankCashAssets,
			pdcInHandAssets,
			arReceivablesAssets,
			legalReceivablesAssets,
			fixedAssets,
			totalAssets,
			apLiabilities,
			securityDepositLiabilities,
			pdcCustomerLiabilities,
			totalLiabilities,
			ownerCapital,
			retainedNetProfit: netProfit,
			totalEquity,
			totalLiabilitiesAndEquity,
			isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < .01
		};
	}, [allLedgerTransactions, profitAndLossReport]);
	const cashFlowReport = (0, import_react.useMemo)(() => {
		const CASH_CODES = new Set([
			"10100",
			"12000001",
			"12001",
			"12100001"
		]);
		let operatingInflow = 0;
		let operatingOutflow = 0;
		let investingCash = 0;
		let financingCash = 0;
		const byReference = /* @__PURE__ */ new Map();
		allLedgerTransactions.forEach((tx) => {
			const bucket = byReference.get(tx.reference) || [];
			bucket.push(tx);
			byReference.set(tx.reference, bucket);
		});
		byReference.forEach((lines) => {
			const cashLines = lines.filter((tx) => CASH_CODES.has(tx.account_code));
			if (!cashLines.length) return;
			const narration = lines.map((tx) => tx.description || "").join(" ").toLowerCase();
			const nonCash = lines.filter((tx) => !CASH_CODES.has(tx.account_code));
			if (!nonCash.length) return;
			const cashNet = cashLines.reduce((sum, tx) => sum + (tx.debit || 0) - (tx.credit || 0), 0);
			if (Math.abs(cashNet) < .005) return;
			if (narration.includes("pdc deposited")) return;
			const hasFixedAsset = nonCash.some((tx) => tx.account_code.startsWith("13"));
			const hasCapital = nonCash.some((tx) => tx.account_code.startsWith("3"));
			if (hasFixedAsset) investingCash += cashNet;
			else if (hasCapital) financingCash += cashNet;
			else if (cashNet > 0) operatingInflow += cashNet;
			else operatingOutflow += Math.abs(cashNet);
		});
		const netOperatingCash = operatingInflow - operatingOutflow;
		const netCashChange = netOperatingCash + investingCash + financingCash;
		const endingCashBalance = allLedgerTransactions.filter((tx) => CASH_CODES.has(tx.account_code)).reduce((sum, tx) => sum + (tx.debit || 0) - (tx.credit || 0), 0);
		return {
			operatingInflow,
			operatingOutflow,
			netOperatingCash,
			investingCash,
			financingCash,
			netCashChange,
			endingCashBalance
		};
	}, [allLedgerTransactions]);
	const cashOnHandPosition = (0, import_react.useMemo)(() => {
		const CASH_ON_HAND_CODES = new Set(["10100", "12100001"]);
		const PETTY_CASH_CODES = new Set(["12101", "12102"]);
		let vaultCash = 0;
		let pettyCashFloat = 0;
		allLedgerTransactions.forEach((tx) => {
			const net = (tx.debit || 0) - (tx.credit || 0);
			if (CASH_ON_HAND_CODES.has(tx.account_code)) vaultCash += net;
			if (PETTY_CASH_CODES.has(tx.account_code)) pettyCashFloat += net;
		});
		return {
			vaultCash,
			pettyCashFloat,
			siteDesks: 0,
			totalCashOnHand: vaultCash + pettyCashFloat
		};
	}, [allLedgerTransactions]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinanceContext.Provider, {
		value: {
			journalEntries,
			addJournalEntry,
			grnMappings,
			addGrnMapping,
			payableInvoices,
			addPayableInvoice,
			markPayableInvoicePaid,
			vouchers,
			addVoucher,
			receivableInvoices,
			addReceivableInvoice,
			markReceivableInvoicePaid,
			legalReceivables,
			addLegalEscalation,
			recoverLegalReceivable,
			payrollSyncs,
			addPayrollSync,
			bankClearances,
			addBankClearance,
			bankReconciliations,
			addBankReconciliation,
			reconciliationStatements,
			addReconciliationStatement,
			cashBookEntries,
			addCashBookEntry,
			pettyCashEntries,
			addPettyCashEntry,
			allLedgerTransactions,
			trialBalanceSummary,
			trialBalanceDetailed,
			profitAndLossReport,
			balanceSheetReport,
			cashFlowReport,
			cashOnHandPosition,
			isSyncing,
			refreshFinanceData
		},
		children
	});
}
function useFinanceStore() {
	const ctx = (0, import_react.useContext)(FinanceContext);
	if (!ctx) throw new Error("useFinanceStore must be used within a FinanceProvider");
	return ctx;
}
//#endregion
export { useFinanceStore as n, FinanceProvider as t };
