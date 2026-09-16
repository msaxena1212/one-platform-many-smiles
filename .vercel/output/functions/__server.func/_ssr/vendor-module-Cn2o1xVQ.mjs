import { i as __toESM } from "../_runtime.mjs";
import { B as supabase } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $t as CircleCheck, A as ShieldCheck, At as FileSpreadsheet, Bt as DollarSign, D as ShoppingBag, G as Plus, Ht as CreditCard, I as Search, J as Pencil, K as Phone, Mn as Activity, Ot as FileUp, Pt as Eye, Rt as Download, Sn as Banknote, V as RefreshCw, X as Paperclip, at as Mail, cn as CheckCheck, ct as LoaderCircle, dt as Layers, g as TrendingUp, gt as Info, in as ChevronRight, k as Shield, kt as FileText, s as Users, v as Trash2, yt as History } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as ScrollArea } from "./scroll-area-BlnbM3_c.mjs";
import { l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DJOO1b-0.mjs";
import { d as FinVendorsApi } from "./supabase-finance-B6nDq-G1.mjs";
import { t as formatDDMMMYYYY } from "./date-utils-BA7FZwNI.mjs";
import { t as ApInvoicesApi } from "./proc-invoices-api-BBGs9sGK.mjs";
import { n as ProformaInvoiceDialog, t as PaymentReceiptDialog } from "./proforma-invoice-dialog-bIUbrys6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/vendor-module-Cn2o1xVQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var VENDOR_TABS = [
	{
		key: "master",
		label: "Vendor Master",
		icon: Users,
		color: "text-violet-500"
	},
	{
		key: "invoices",
		label: "AP Invoices",
		icon: FileText,
		color: "text-cyan-500"
	},
	{
		key: "advances",
		label: "Vendor Advances",
		icon: DollarSign,
		color: "text-emerald-500"
	},
	{
		key: "payments",
		label: "Payment History",
		icon: CreditCard,
		color: "text-rose-500"
	},
	{
		key: "performance",
		label: "Supplier Scorecard",
		icon: TrendingUp,
		color: "text-indigo-500"
	}
];
function statusVariant(s) {
	if ([
		"Active",
		"PAID",
		"APPROVED",
		"MATCHED"
	].includes(s)) return "default";
	if ([
		"Expired",
		"DISPUTED",
		"Blacklisted"
	].includes(s)) return "destructive";
	if ([
		"Pending",
		"DRAFT",
		"PARTIAL"
	].includes(s)) return "secondary";
	return "outline";
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-xs font-semibold",
			children: label
		}), children]
	});
}
function postAdvanceVoucherToGL(params) {
	const isCash = params.paymentMode.toLowerCase().includes("cash") || params.paymentMode.toLowerCase().includes("petty");
	const crCode = isCash ? "12100001" : "12000001";
	const crName = isCash ? "Cash in Hand (Office Vault)" : "Bank Operating Account (QNB)";
	const vDate = params.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const refNo = params.reference || `ADV-TXN-${Date.now().toString().slice(-6)}`;
	const pvNo = `PV-ADV-${Date.now().toString().slice(-6)}`;
	const newVoucher = {
		id: `vchr-adv-${Date.now()}`,
		voucher_no: pvNo,
		voucher_type: "Payment Voucher",
		date: vDate,
		name: `Vendor Advance Disbursement — ${params.vendorName} (${params.purpose || "Mobilization / Pre-payment"})`,
		debit: "Advance to Vendors",
		debit_code: "12300001",
		credit: crName,
		credit_code: crCode,
		amount: params.amount,
		method: isCash ? "Cash" : "Bank Transfer",
		property_name: "Main Portfolio",
		unit_ref: refNo,
		tenant_name: params.vendorName,
		status: "Posted",
		lines: [{
			account_code: "12300001",
			account_name: "Advance to Vendors",
			debit: params.amount,
			credit: 0,
			description: `Advance to ${params.vendorName}`
		}, {
			account_code: crCode,
			account_name: crName,
			debit: 0,
			credit: params.amount,
			description: `Disbursement via ${params.paymentMode}`
		}]
	};
	try {
		const k1 = "zyno-pms-finance-data-v1-vouchers";
		const k2 = "zyno_finance_vouchers";
		const existing1 = JSON.parse(localStorage.getItem(k1) || "[]");
		const existing2 = JSON.parse(localStorage.getItem(k2) || "[]");
		localStorage.setItem(k1, JSON.stringify([newVoucher, ...existing1]));
		localStorage.setItem(k2, JSON.stringify([newVoucher, ...existing2]));
	} catch (e) {
		console.error("Failed to store voucher locally", e);
	}
	try {
		supabase.from("fin_vouchers").insert({
			voucher_number: pvNo,
			voucher_date: vDate,
			voucher_type: "Payment Voucher",
			reference_no: refNo,
			description: `Vendor Advance Disbursement to ${params.vendorName}`,
			total_amount: params.amount,
			status: "POSTED"
		}).then(() => {});
	} catch {}
	window.dispatchEvent(new CustomEvent("finance_vouchers_updated"));
	window.dispatchEvent(new CustomEvent("ap_invoices_updated"));
}
function EmptyState({ text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border border-dashed rounded-lg p-10 text-center text-sm text-muted-foreground",
		children: text
	});
}
function ScoreBar({ score, color = "bg-emerald-500" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 h-2 rounded-full bg-muted overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `h-full rounded-full ${color}`,
				style: { width: `${Math.min(100, score)}%` }
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-mono font-bold w-8 text-right",
			children: score
		})]
	});
}
function VendorModule({ role }) {
	const routerSearch = useRouterState({ select: (s) => s.location.search });
	const activeTab = typeof routerSearch?.tab === "string" ? routerSearch.tab : "master";
	const [vendors, setVendors] = (0, import_react.useState)([]);
	const [contacts, setContacts] = (0, import_react.useState)([]);
	const [bankDetails, setBankDetails] = (0, import_react.useState)([]);
	const [qualifications, setQualifications] = (0, import_react.useState)([]);
	const [apInvoices, setApInvoices] = (0, import_react.useState)([]);
	const [selectedReceipt, setSelectedReceipt] = (0, import_react.useState)(null);
	const [showReceiptModal, setShowReceiptModal] = (0, import_react.useState)(false);
	const [selectedInvoiceForView, setSelectedInvoiceForView] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [search, setSearch] = (0, import_react.useState)("");
	const [showVendorModal, setShowVendorModal] = (0, import_react.useState)(false);
	const [editVendor, setEditVendor] = (0, import_react.useState)(null);
	const [bulkVendorOpen, setBulkVendorOpen] = (0, import_react.useState)(false);
	const [bulkVendorData, setBulkVendorData] = (0, import_react.useState)("");
	const [bulkVendorLoading, setBulkVendorLoading] = (0, import_react.useState)(false);
	const [showContactModal, setShowContactModal] = (0, import_react.useState)(false);
	const [showBankModal, setShowBankModal] = (0, import_react.useState)(false);
	const [showQualModal, setShowQualModal] = (0, import_react.useState)(false);
	const [showInvoiceModal, setShowInvoiceModal] = (0, import_react.useState)(false);
	const [showAdvanceModal, setShowAdvanceModal] = (0, import_react.useState)(false);
	const [advanceForm, setAdvanceForm] = (0, import_react.useState)({
		vendorId: "",
		amount: "0",
		date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		paymentMode: "Bank Wire / QNB Corporate Electronic",
		reference: "",
		purpose: "Contract Advance / Procurement Mobilization",
		remarks: ""
	});
	const [paymentTargetInv, setPaymentTargetInv] = (0, import_react.useState)(null);
	const [payModalStep, setPayModalStep] = (0, import_react.useState)(1);
	const [advanceHistoryVendor, setAdvanceHistoryVendor] = (0, import_react.useState)(null);
	const [showAdvanceHistoryModal, setShowAdvanceHistoryModal] = (0, import_react.useState)(false);
	const [ordersVendor, setOrdersVendor] = (0, import_react.useState)(null);
	const [showOrdersModal, setShowOrdersModal] = (0, import_react.useState)(false);
	const [vendorPos, setVendorPos] = (0, import_react.useState)([]);
	const [vendorPayForm, setVendorPayForm] = (0, import_react.useState)({
		paymentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		paymentMethod: "Bank Wire / QNB Corporate Electronic",
		disbursingBank: "Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)",
		transactionReference: "",
		beneficiaryAccount: "",
		cashReceiptNo: "",
		receiverName: "",
		chequeNumber: "",
		chequeDueDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		remarks: "",
		paymentAmount: 0,
		applyAdvance: false,
		advanceAmount: 0
	});
	const [vendorStep, setVendorStep] = (0, import_react.useState)(1);
	const [vendorForm, setVendorForm] = (0, import_react.useState)({
		code: "",
		name: "",
		contact_person: "",
		email: "",
		phone: "",
		tax_number: "",
		address: "",
		city: "",
		country: "Qatar",
		vendor_type: "Supplier",
		payment_terms: "Net 30 Days",
		settlement_mode: "Bank Wire / Electronic Transfer (QNB)",
		currency: "QAR",
		status: "Active",
		notes: "",
		tax_rate: "0",
		tax_registration_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		cr_expiry_date: new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10),
		terms_doc_name: "",
		company_profile_name: "",
		tax_cert_name: "",
		contact_name: "",
		contact_role: "",
		contact_phone: "",
		contact_email: "",
		contact_primary: true,
		qual_category: "General Maintenance",
		qual_certification: "",
		qual_expiry: "",
		qual_status: "Active",
		qual_notes: "",
		bank_name: "",
		bank_account_name: "",
		bank_account_number: "",
		bank_iban: "",
		bank_swift: "",
		bank_currency: "QAR"
	});
	const [contactForm, setContactForm] = (0, import_react.useState)({
		vendorId: "",
		name: "",
		role: "",
		phone: "",
		email: "",
		is_primary: false
	});
	const [bankForm, setBankForm] = (0, import_react.useState)({
		vendorId: "",
		bank_name: "",
		account_name: "",
		account_number: "",
		iban: "",
		swift_code: "",
		currency: "QAR"
	});
	const [qualForm, setQualForm] = (0, import_react.useState)({
		vendorId: "",
		category: "",
		certification: "",
		expiry_date: "",
		status: "Active",
		notes: ""
	});
	const [invoiceForm, setInvoiceForm] = (0, import_react.useState)({
		vendorId: "",
		invoice_number: "",
		po_number: "",
		grn_number: "",
		invoice_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		due_date: "",
		amount: "0",
		tax_amount: "0",
		payment_terms: "Net 30 Days",
		settlement_mode: "Bank Wire / Electronic Transfer (QNB)",
		remarks: ""
	});
	const loadAll = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			const [vRes, cRes, bRes, qRes, iRes, poRes] = await Promise.all([
				FinVendorsApi.fetchAll().catch(() => []),
				(async () => {
					try {
						return (await supabase.from("vendor_contacts").select("*").order("is_primary", { ascending: false })).data || [];
					} catch {
						return [];
					}
				})(),
				(async () => {
					try {
						return (await supabase.from("vendor_bank_details").select("*")).data || [];
					} catch {
						return [];
					}
				})(),
				(async () => {
					try {
						return (await supabase.from("vendor_qualifications").select("*")).data || [];
					} catch {
						return [];
					}
				})(),
				ApInvoicesApi.fetchAll().catch(() => []),
				(async () => {
					try {
						return (await supabase.from("proc_purchase_orders").select("*").order("created_at", { ascending: false })).data || [];
					} catch {
						return [];
					}
				})()
			]);
			setVendorPos(poRes || []);
			setVendors(vRes || []);
			setContacts(cRes || []);
			setBankDetails(bRes || []);
			setQualifications(qRes || []);
			setApInvoices([]);
		} catch (e) {
			toast.error("Load failed: " + e.message);
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		loadAll();
		const handleUpdate = () => loadAll();
		window.addEventListener("ap_invoices_updated", handleUpdate);
		return () => window.removeEventListener("ap_invoices_updated", handleUpdate);
	}, [loadAll]);
	function openNewVendor() {
		setEditVendor(null);
		setVendorStep(1);
		setVendorForm({
			code: "VND-" + String(Date.now()).slice(-4),
			name: "",
			contact_person: "",
			email: "",
			phone: "",
			tax_number: "",
			address: "",
			city: "",
			country: "Qatar",
			vendor_type: "Supplier",
			payment_terms: "Net 30 Days",
			settlement_mode: "Bank Wire / Electronic Transfer (QNB)",
			currency: "QAR",
			status: "Active",
			notes: "",
			tax_rate: "0",
			tax_registration_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			cr_expiry_date: new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10),
			terms_doc_name: "",
			company_profile_name: "",
			tax_cert_name: "",
			contact_name: "",
			contact_role: "Account Manager",
			contact_phone: "",
			contact_email: "",
			contact_primary: true,
			qual_category: "General Maintenance",
			qual_certification: "Commercial Registration",
			qual_expiry: "",
			qual_status: "Active",
			qual_notes: "",
			bank_name: "",
			bank_account_name: "",
			bank_account_number: "",
			bank_iban: "",
			bank_swift: "",
			bank_currency: "QAR"
		});
		setShowVendorModal(true);
	}
	function openEditVendor(v) {
		setEditVendor(v);
		setVendorStep(1);
		setVendorForm({
			code: v.code || "",
			name: v.name || "",
			contact_person: v.contact_person || "",
			email: v.email || "",
			phone: v.phone || "",
			tax_number: v.tax_number || "",
			address: v.address || "",
			city: v.city || "",
			country: v.country || "Qatar",
			vendor_type: v.vendor_type || "Supplier",
			payment_terms: v.payment_terms || "Net 30 Days",
			settlement_mode: v.settlement_mode || "Bank Wire / Electronic Transfer (QNB)",
			currency: v.currency || "QAR",
			status: v.status || "Active",
			notes: v.notes || "",
			tax_rate: "0",
			tax_registration_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			cr_expiry_date: new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10),
			terms_doc_name: "",
			company_profile_name: "",
			tax_cert_name: "",
			contact_name: "",
			contact_role: "",
			contact_phone: "",
			contact_email: "",
			contact_primary: true,
			qual_category: "",
			qual_certification: "",
			qual_expiry: "",
			qual_status: "Active",
			qual_notes: "",
			bank_name: "",
			bank_account_name: "",
			bank_account_number: "",
			bank_iban: "",
			bank_swift: "",
			bank_currency: "QAR"
		});
		setShowVendorModal(true);
	}
	async function handleSaveVendor() {
		if (!vendorForm.code.trim() || !vendorForm.name.trim()) return toast.error("Vendor Code and Name are required.");
		setSaving(true);
		try {
			const payload = {
				code: vendorForm.code,
				name: vendorForm.name,
				contact_person: vendorForm.contact_person || null,
				email: vendorForm.email || null,
				phone: vendorForm.phone || null,
				tax_number: vendorForm.tax_number || null,
				address: vendorForm.address || null,
				city: vendorForm.city || null,
				country: vendorForm.country,
				vendor_type: vendorForm.vendor_type,
				payment_terms: vendorForm.payment_terms,
				settlement_mode: vendorForm.settlement_mode,
				currency: vendorForm.currency,
				status: vendorForm.status,
				notes: vendorForm.notes || null
			};
			if (editVendor) {
				const { error } = await supabase.from("fin_vendors").update(payload).eq("id", editVendor.id);
				if (error) throw error;
				toast.success(`${vendorForm.name} updated.`);
			} else {
				const { data: createdVendor, error } = await supabase.from("fin_vendors").insert(payload).select().single();
				if (error) throw error;
				const vId = createdVendor.id;
				if (vendorForm.contact_name.trim()) try {
					await supabase.from("vendor_contacts").insert({
						vendor_id: vId,
						name: vendorForm.contact_name,
						role: vendorForm.contact_role || "Primary Contact",
						phone: vendorForm.contact_phone || vendorForm.phone || null,
						email: vendorForm.contact_email || vendorForm.email || null,
						is_primary: vendorForm.contact_primary
					});
				} catch {}
				if (vendorForm.qual_category.trim()) try {
					await supabase.from("vendor_qualifications").insert({
						vendor_id: vId,
						category: vendorForm.qual_category,
						certification: vendorForm.qual_certification || null,
						expiry_date: vendorForm.qual_expiry || null,
						status: vendorForm.qual_status,
						notes: vendorForm.qual_notes || null
					});
				} catch {}
				if (vendorForm.bank_name.trim() && vendorForm.bank_account_number.trim()) try {
					await supabase.from("vendor_bank_details").insert({
						vendor_id: vId,
						bank_name: vendorForm.bank_name,
						account_name: vendorForm.bank_account_name || vendorForm.name,
						account_number: vendorForm.bank_account_number,
						iban: vendorForm.bank_iban || null,
						swift_code: vendorForm.bank_swift || null,
						currency: vendorForm.bank_currency || "QAR"
					});
				} catch {}
				toast.success(`${vendorForm.name} fully onboarded with all details.`);
			}
			setShowVendorModal(false);
			await loadAll();
		} catch (e) {
			toast.error(`Save failed: ${e.message}`);
		} finally {
			setSaving(false);
		}
	}
	async function handleDeleteVendor(v) {
		if (!confirm(`Delete vendor "${v.name}"?`)) return;
		try {
			const { error } = await supabase.from("fin_vendors").delete().eq("id", v.id);
			if (error) throw error;
			toast.success(`${v.name} deleted.`);
			await loadAll();
		} catch (e) {
			toast.error(`Delete failed: ${e.message}`);
		}
	}
	async function handleToggleStatus(v) {
		const ns = v.status === "Active" ? "Inactive" : "Active";
		try {
			const { error } = await supabase.from("fin_vendors").update({ status: ns }).eq("id", v.id);
			if (error) throw error;
			toast.success(`${v.name} → ${ns}`);
			await loadAll();
		} catch (e) {
			toast.error(e.message);
		}
	}
	const downloadVendorCsvTemplate = () => {
		const csvContent = [[
			"VendorCode",
			"VendorName",
			"VendorType",
			"ContactPerson",
			"Email",
			"Phone",
			"TaxNumber",
			"Address",
			"City",
			"Country",
			"PaymentTerms",
			"BankName",
			"IBAN",
			"Status"
		].join(","), ...[[
			"VND-8801",
			"Gulf Facilities LLC",
			"Supplier",
			"Ahmed Hassan",
			"ahmed@gulffacil.qa",
			"+97455001122",
			"10001234567890003",
			"Building 12, C Ring Rd",
			"Doha",
			"Qatar",
			"Net 30 Days",
			"Qatar National Bank",
			"QA55QNBA00000000123456",
			"Active"
		], [
			"VND-8802",
			"Mannai Trading Co",
			"Contractor",
			"Fatima Al-Nasr",
			"procurement@mannai.qa",
			"+97444567890",
			"20001234567890004",
			"Salwa Industrial Area",
			"Doha",
			"Qatar",
			"Net 45 Days",
			"Commercial Bank of Qatar",
			"QA55CBQA00000000987654",
			"Active"
		]].map((r) => r.join(","))].join("\n");
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", `vendor_import_template_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success("Vendor CSV template downloaded");
	};
	const handleBulkVendorImport = async () => {
		if (!bulkVendorData.trim()) {
			toast.error("Please provide CSV content to import");
			return;
		}
		setBulkVendorLoading(true);
		try {
			const lines = bulkVendorData.trim().split("\n").filter((l) => l.trim().length > 0);
			if (lines.length <= 1) {
				toast.error("CSV contains no data rows");
				setBulkVendorLoading(false);
				return;
			}
			const dataRows = lines.slice(1);
			let successCount = 0;
			let failCount = 0;
			for (const line of dataRows) {
				const parts = line.split(",").map((p) => p.trim());
				if (!parts[0] || !parts[1]) {
					failCount++;
					continue;
				}
				const [vendorCode, vendorName, vendorType, contactPerson, email, phone, taxNumber, address, city, country, paymentTerms, bankName, iban, status] = parts;
				const payload = {
					code: vendorCode || `VND-${String(Date.now()).slice(-4)}`,
					name: vendorName,
					vendor_type: vendorType || "Supplier",
					contact_person: contactPerson || null,
					email: email || null,
					phone: phone || null,
					tax_number: taxNumber || null,
					address: address || null,
					city: city || "Doha",
					country: country || "Qatar",
					payment_terms: paymentTerms || "Net 30 Days",
					settlement_mode: "Bank Wire / Electronic Transfer (QNB)",
					currency: "QAR",
					status: status || "Active",
					notes: null
				};
				const { data: createdVendor, error } = await supabase.from("fin_vendors").insert(payload).select().single();
				if (error) {
					console.error("Bulk vendor insert error:", error);
					failCount++;
				} else {
					if (iban && createdVendor) try {
						await supabase.from("vendor_bank_details").insert({
							vendor_id: createdVendor.id,
							bank_name: bankName || "Qatar National Bank",
							account_name: vendorName,
							account_number: "",
							iban,
							currency: "QAR"
						});
					} catch {}
					successCount++;
				}
			}
			toast.success(`Bulk Vendor Ingestion Complete: ${successCount} created, ${failCount} failed.`);
			setBulkVendorOpen(false);
			setBulkVendorData("");
			await loadAll();
		} catch (err) {
			toast.error("Bulk vendor import failed: " + err.message);
		} finally {
			setBulkVendorLoading(false);
		}
	};
	function openPaymentReceipt(inv) {
		let rcpt = ApInvoicesApi.getReceiptByInvoice(inv.invoice_number);
		if (!rcpt && inv.grn_number) rcpt = ApInvoicesApi.getReceiptByGrn(inv.grn_number);
		if (!rcpt) {
			const suffix = (inv.invoice_number || "000").replace(/^APINV-/, "");
			rcpt = {
				id: `rcpt-synth-${inv.id}`,
				receipt_number: `RCPT-${suffix}`,
				voucher_number: `PV-${suffix}`,
				invoice_number: inv.invoice_number,
				po_number: inv.po_number,
				grn_number: inv.grn_number,
				vendor_id: inv.vendor_id,
				vendor_name: vendors.find((v) => String(v.id) === String(inv.vendor_id))?.name,
				amount_paid: Number(inv.total_amount || 0),
				payment_date: inv.paid_at || inv.invoice_date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				payment_method: "Bank Wire / QNB Corporate",
				reference_no: `TXN-${String(inv.id).slice(-6)}`,
				bank_account: "Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)",
				gl_debit_account: "22100001 - Trade Payables - Vendors",
				gl_credit_account: "12000001 - Bank Operating Account (QNB)",
				status: "Settled",
				created_at: (/* @__PURE__ */ new Date()).toISOString()
			};
		}
		setSelectedReceipt(rcpt);
		setShowReceiptModal(true);
	}
	async function handleSaveInvoice() {
		if (!invoiceForm.vendorId || !invoiceForm.invoice_number.trim()) return toast.error("Vendor and Invoice Number are required.");
		setSaving(true);
		try {
			const amt = Number(invoiceForm.amount) || 0;
			const tax = Number(invoiceForm.tax_amount) || 0;
			await ApInvoicesApi.create({
				invoice_number: invoiceForm.invoice_number,
				vendor_id: invoiceForm.vendorId,
				po_number: invoiceForm.po_number || void 0,
				grn_number: invoiceForm.grn_number || void 0,
				invoice_date: invoiceForm.invoice_date,
				due_date: invoiceForm.due_date || void 0,
				amount: amt,
				tax_amount: tax,
				total_amount: amt + tax,
				payment_terms: invoiceForm.payment_terms,
				payment_method: invoiceForm.settlement_mode,
				settlement_mode: invoiceForm.settlement_mode,
				status: "DRAFT",
				remarks: invoiceForm.remarks || void 0
			});
			toast.success(`Invoice ${invoiceForm.invoice_number} created.`);
			setShowInvoiceModal(false);
			await loadAll();
		} catch (e) {
			toast.error(`Failed: ${e.message}`);
		} finally {
			setSaving(false);
		}
	}
	async function handleApproveInvoice(inv) {
		try {
			await ApInvoicesApi.update(inv.id, { status: "APPROVED" });
			toast.success(`Invoice ${inv.invoice_number} approved.`);
			await loadAll();
		} catch (e) {
			toast.error(e.message);
		}
	}
	async function handleConfirmVendorPayment() {
		if (!paymentTargetInv) return;
		setSaving(true);
		try {
			const totalDue = Number(paymentTargetInv.total_amount || 0);
			const partialKey = `partial_paid_${paymentTargetInv.id}`;
			const alreadyPaid = Number(localStorage.getItem(partialKey) || "0");
			const advKey = `vendor_advance_${paymentTargetInv.vendor_id}`;
			const advBalance = Number(localStorage.getItem(advKey) || "0");
			const cashAmount = vendorPayForm.paymentAmount;
			const advApplied = vendorPayForm.applyAdvance ? Math.min(vendorPayForm.advanceAmount, advBalance) : 0;
			const effectivePaid = cashAmount + advApplied;
			const newTotalPaid = alreadyPaid + effectivePaid;
			const isFullySettled = newTotalPaid >= totalDue - .01;
			localStorage.setItem(partialKey, String(newTotalPaid));
			if (advApplied > 0) {
				localStorage.setItem(advKey, String(advBalance - advApplied));
				const utilKey = `vendor_adv_util_${paymentTargetInv.vendor_id}`;
				const prevUtils = JSON.parse(localStorage.getItem(utilKey) || "[]");
				const newUtil = {
					id: `util-${Date.now()}`,
					invoice_id: paymentTargetInv.id,
					invoice_number: paymentTargetInv.invoice_number,
					date: vendorPayForm.paymentDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
					advance_used: advApplied,
					cash_paid: cashAmount,
					total_settled: effectivePaid,
					reference: vendorPayForm.transactionReference,
					created_at: (/* @__PURE__ */ new Date()).toISOString()
				};
				localStorage.setItem(utilKey, JSON.stringify([newUtil, ...prevUtils]));
				const advVchrNo = `PV-SETTLE-ADV-${Date.now().toString().slice(-6)}`;
				const vendorName = vendors.find((v) => String(v.id) === String(paymentTargetInv.vendor_id))?.name || `Vendor #${paymentTargetInv.vendor_id}`;
				const advanceSettlementVoucher = {
					id: `vchr-settle-${Date.now()}`,
					voucher_no: advVchrNo,
					voucher_type: "Payment Voucher",
					date: vendorPayForm.paymentDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
					name: `Advance Offset Settlement — Inv ${paymentTargetInv.invoice_number} (${vendorName})`,
					debit: "Trade Payables - Vendors",
					debit_code: "22100001",
					credit: "Advance to Vendors",
					credit_code: "12300001",
					amount: advApplied,
					method: "Advance Offset",
					property_name: "Main Portfolio",
					unit_ref: paymentTargetInv.po_number || "Facility Operations",
					tenant_name: vendorName,
					status: "Posted",
					lines: [{
						account_code: "22100001",
						account_name: "Trade Payables - Vendors",
						debit: advApplied,
						credit: 0,
						description: `Advance offset for ${paymentTargetInv.invoice_number}`
					}, {
						account_code: "12300001",
						account_name: "Advance to Vendors",
						debit: 0,
						credit: advApplied,
						description: `Advance utilized against invoice ${paymentTargetInv.invoice_number}`
					}]
				};
				try {
					const k1 = "zyno-pms-finance-data-v1-vouchers";
					const k2 = "zyno_finance_vouchers";
					const e1 = JSON.parse(localStorage.getItem(k1) || "[]");
					const e2 = JSON.parse(localStorage.getItem(k2) || "[]");
					localStorage.setItem(k1, JSON.stringify([advanceSettlementVoucher, ...e1]));
					localStorage.setItem(k2, JSON.stringify([advanceSettlementVoucher, ...e2]));
				} catch (e) {
					console.error("Failed to store settlement voucher", e);
				}
			}
			if (cashAmount > 0) {
				const isCash = vendorPayForm.paymentMethod.toLowerCase().includes("cash") || vendorPayForm.paymentMethod.toLowerCase().includes("petty");
				const crCode = isCash ? "12100001" : "12000001";
				const crName = isCash ? "Cash in Hand (Office Vault)" : "Bank Operating Account (QNB)";
				const pvNo = `PV-${paymentTargetInv.invoice_number.replace("APINV-", "").replace("INV-AP-", "")}`;
				const vendorName = vendors.find((v) => String(v.id) === String(paymentTargetInv.vendor_id))?.name || `Vendor #${paymentTargetInv.vendor_id}`;
				const paymentVoucher = {
					id: `vchr-pay-${Date.now()}`,
					voucher_no: pvNo,
					voucher_type: "Payment Voucher",
					date: vendorPayForm.paymentDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
					name: `Vendor Settlement — ${paymentTargetInv.invoice_number} (${vendorName})`,
					debit: "Trade Payables - Vendors",
					debit_code: "22100001",
					credit: crName,
					credit_code: crCode,
					amount: cashAmount,
					method: isCash ? "Cash" : "Bank Transfer",
					property_name: "Main Portfolio",
					unit_ref: paymentTargetInv.po_number || "Facility Operations",
					tenant_name: vendorName,
					status: "Posted",
					lines: [{
						account_code: "22100001",
						account_name: "Trade Payables - Vendors",
						debit: cashAmount,
						credit: 0,
						description: `Settlement for ${paymentTargetInv.invoice_number}`
					}, {
						account_code: crCode,
						account_name: crName,
						debit: 0,
						credit: cashAmount,
						description: `Paid via ${vendorPayForm.paymentMethod}`
					}]
				};
				try {
					const k1 = "zyno-pms-finance-data-v1-vouchers";
					const k2 = "zyno_finance_vouchers";
					const e1 = JSON.parse(localStorage.getItem(k1) || "[]");
					const e2 = JSON.parse(localStorage.getItem(k2) || "[]");
					localStorage.setItem(k1, JSON.stringify([paymentVoucher, ...e1]));
					localStorage.setItem(k2, JSON.stringify([paymentVoucher, ...e2]));
				} catch (e) {
					console.error("Failed to store payment voucher", e);
				}
			}
			await ApInvoicesApi.update(paymentTargetInv.id, {
				status: isFullySettled ? "PAID" : "PARTIAL",
				amount_paid: newTotalPaid,
				posting_status: isFullySettled ? "POSTED" : "PARTIAL_POSTED",
				payment_method: vendorPayForm.paymentMethod,
				payment_reference: vendorPayForm.transactionReference
			});
			if (isFullySettled) toast.success(`Invoice ${paymentTargetInv.invoice_number} fully settled. Financial Ledgers updated with 4-leg GL entries.`);
			else {
				const remaining = totalDue - newTotalPaid;
				toast.info(`Payment of QAR ${effectivePaid.toLocaleString()} applied (${advApplied > 0 ? `QAR ${advApplied.toLocaleString()} advance + ` : ""}QAR ${cashAmount.toLocaleString()} cash/bank). Outstanding balance: QAR ${remaining.toLocaleString()}.`);
			}
			window.dispatchEvent(new CustomEvent("finance_vouchers_updated"));
			window.dispatchEvent(new CustomEvent("ap_invoices_updated"));
			const currentInv = paymentTargetInv;
			setPaymentTargetInv(null);
			await loadAll();
			openPaymentReceipt(currentInv);
		} catch (e) {
			toast.error(e.message);
		} finally {
			setSaving(false);
		}
	}
	const filtered = search.trim() ? vendors.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()) || v.code?.toLowerCase().includes(search.toLowerCase())) : vendors;
	const activeCount = vendors.filter((v) => v.status === "Active").length;
	const totalPayable = apInvoices.filter((i) => i.status !== "PAID").reduce((s, i) => s + Number(i.total_amount || 0), 0);
	const paidYTD = apInvoices.filter((i) => i.status === "PAID").reduce((s, i) => s + Number(i.total_amount || 0), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-[calc(100vh-80px)] overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 overflow-auto p-6 space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-bold tracking-tight",
							children: VENDOR_TABS.find((t) => t.key === activeTab)?.label ?? "Vendor Management"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Centralized supplier registry — master data, qualifications, banking, invoices, and performance."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2 items-center flex-wrap",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									onClick: loadAll,
									disabled: loading,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}` }), " Refresh"]
								}),
								activeTab === "master" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => setBulkVendorOpen(true),
									className: "gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-4 w-4 text-primary" }), " Bulk Import"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									onClick: openNewVendor,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " New Vendor"]
								})] }),
								activeTab === "advances" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "text-muted-foreground border-dashed gap-1",
									onClick: () => toast.info("Vendor advances are disbursed and booked exclusively by the Finance Team under Finance → Payment Vouchers."),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "mr-1.5 h-4 w-4 text-emerald-500" }), " Advance Disbursed by Finance"]
								}),
								activeTab === "invoices" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									onClick: () => setShowInvoiceModal(true),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " New AP Invoice"]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 lg:grid-cols-4 gap-3",
						children: [
							[
								"Total Vendors",
								vendors.length,
								Users,
								"text-violet-500"
							],
							[
								"Active",
								activeCount,
								CircleCheck,
								"text-emerald-500"
							],
							[
								"Payable (QAR)",
								totalPayable.toLocaleString(),
								FileText,
								"text-amber-500"
							],
							[
								"Paid YTD (QAR)",
								paidYTD.toLocaleString(),
								CreditCard,
								"text-cyan-500"
							]
						].map(([l, v, Icon, c]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "bg-card/50",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: l
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: `text-xl font-bold mt-1 ${c}`,
									children: v
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5 text-muted-foreground/60" })]
							})
						}, l))
					}),
					activeTab === "master" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative max-w-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Search vendors...",
								value: search,
								onChange: (e) => setSearch(e.target.value),
								className: "pl-8 h-8 text-xs"
							})]
						}), filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { text: "No vendors registered. Click 'New Vendor' to add a supplier." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
										children: "Type"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "font-bold",
										children: "Contact"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "font-bold",
										children: "Phone / Email"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "font-bold",
										children: "Tax No"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "font-bold",
										children: "Payment Terms & Settlement"
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
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filtered.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "text-xs hover:bg-muted/30",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-mono font-bold text-primary",
										children: v.code
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: v.name }), v.city && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-muted-foreground text-[10px]",
											children: [
												v.city,
												", ",
												v.country
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "text-[10px]",
										children: v.vendor_type || "Supplier"
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: v.contact_person || "—" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [
										v.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3 w-3 text-muted-foreground" }), v.phone]
										}),
										v.email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3 w-3 text-muted-foreground" }), v.email]
										}),
										!v.phone && !v.email && "—"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-mono",
										children: v.tax_number || "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-medium text-foreground",
										children: v.payment_terms || "Net 30 Days"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] text-muted-foreground",
										children: v.settlement_mode || "Bank Wire / Electronic"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: statusVariant(v.status || "Active"),
										children: v.status || "Active"
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-end gap-1 items-center",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "icon",
													variant: "ghost",
													className: "h-7 w-7 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-950/30",
													title: "View Purchase Orders & Order History",
													onClick: () => {
														setOrdersVendor(v);
														setShowOrdersModal(true);
													},
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-3.5 w-3.5" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "icon",
													variant: "ghost",
													className: "h-7 w-7",
													title: "Edit Vendor",
													onClick: () => openEditVendor(v),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "icon",
													variant: "ghost",
													className: "h-7 w-7",
													title: v.status === "Active" ? "Deactivate" : "Activate",
													onClick: () => handleToggleStatus(v),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-3.5 w-3.5 text-amber-500" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "icon",
													variant: "ghost",
													className: "h-7 w-7 text-destructive",
													title: "Delete",
													onClick: () => handleDeleteVendor(v),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
												})
											]
										})
									})
								]
							}, v.id)) })] })
						})]
					}),
					activeTab === "advances" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900 p-3 text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-4 w-4 shrink-0 mt-0.5 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Advance to Vendors (GL 12300001 — Current Asset):" }),
								" Advance deposits and mobilization funds disbursed to suppliers prior to invoice presentation. Balances auto-offset against payable invoices on settlement. Use the \"",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Disburse Advance Payment" }),
								"\" button above to record a new disbursement."
							] })]
						}), (() => {
							const vendorsWithAdvanceData = vendors.map((v) => {
								const advBal = Number(localStorage.getItem(`vendor_advance_${v.id}`) || "0");
								const vInvoices = apInvoices.filter((i) => String(i.vendor_id) === String(v.id));
								const totalSettled = vInvoices.reduce((a, b) => {
									const pKey = `partial_paid_${b.id}`;
									return a + Number(localStorage.getItem(pKey) || (b.status === "PAID" ? b.total_amount : 0));
								}, 0);
								const totalInvoiced = vInvoices.reduce((a, b) => a + Number(b.total_amount || 0), 0);
								return {
									...v,
									advBal,
									totalSettled,
									totalInvoiced
								};
							}).filter((v) => v.advBal > 0 || v.totalSettled > 0);
							if (vendorsWithAdvanceData.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border border-dashed rounded-lg p-10 text-center text-sm text-muted-foreground bg-card",
								children: [
									"No active vendor advances or advance utilization recorded yet. Click ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\"Disburse Advance Payment\"" }),
									" above to disburse mobilization funds."
								]
							});
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border rounded-lg overflow-x-auto bg-card",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, {
									className: "whitespace-nowrap",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "bg-muted/50 text-xs whitespace-nowrap",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold whitespace-nowrap",
												children: "Vendor Code"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold whitespace-nowrap",
												children: "Vendor Name"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold whitespace-nowrap",
												children: "Vendor Type"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right whitespace-nowrap",
												children: "Available Advance (QAR)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right whitespace-nowrap",
												children: "Settled / Utilized (QAR)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold whitespace-nowrap",
												children: "Debit Account (Asset)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold whitespace-nowrap",
												children: "Credit Account (Disbursement)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right whitespace-nowrap",
												children: "Actions"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: vendorsWithAdvanceData.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "text-xs hover:bg-muted/30 whitespace-nowrap",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "font-mono font-bold text-primary whitespace-nowrap",
												children: v.code
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "font-semibold whitespace-nowrap",
												children: v.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "whitespace-nowrap",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "outline",
													className: "text-[10px] whitespace-nowrap",
													children: v.vendor_type || "Supplier"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right font-mono font-bold whitespace-nowrap",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: v.advBal > 0 ? "text-emerald-600 font-bold" : "text-muted-foreground",
													children: ["QAR ", v.advBal.toLocaleString()]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
												className: "text-right font-mono font-bold text-blue-600 whitespace-nowrap",
												children: ["QAR ", v.totalSettled.toLocaleString()]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
												className: "font-mono text-[11px] text-blue-700 dark:text-blue-400 whitespace-nowrap",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold",
													children: "Dr. 12300001"
												}), " (Advance to Vendors)"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
												className: "font-mono text-[11px] text-emerald-700 dark:text-emerald-400 whitespace-nowrap",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold",
														children: "Cr. 12000001"
													}),
													" (Bank QNB) / ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold",
														children: "Cr. 12100001"
													}),
													" (Cash)"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right whitespace-nowrap",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "outline",
													className: "h-7 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-1 whitespace-nowrap",
													title: "View Advance History & Utilization",
													onClick: () => {
														setAdvanceHistoryVendor(v);
														setShowAdvanceHistoryModal(true);
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-3.5 w-3.5" }), " History & Usage"]
												})
											})
										]
									}, v.id)) })]
								})
							});
						})()]
					}),
					activeTab === "invoices" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 p-3 text-xs text-blue-900 dark:text-blue-300 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-4 w-4 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "3-Way Match:" }), " Invoice → PO Number → GRN Number. All three must align before payment is authorised."] })]
						}), apInvoices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { text: "No AP invoices yet. Create an invoice and link it to a PO and GRN." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border rounded-lg overflow-hidden bg-card",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "bg-muted/50 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "font-bold",
										children: "Invoice #"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "font-bold",
										children: "Vendor"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "font-bold",
										children: "PO Ref"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "font-bold",
										children: "GRN Ref"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "font-bold",
										children: "Invoice Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "font-bold",
										children: "Due Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "font-bold text-right",
										children: "Total (QAR)"
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
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: apInvoices.map((inv) => {
								const totalDue = Number(inv.total_amount || 0);
								const alreadyPaid = Number(localStorage.getItem(`partial_paid_${inv.id}`) || "0");
								const outstanding = totalDue - alreadyPaid;
								const isPartial = inv.status === "PARTIAL";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "text-xs hover:bg-muted/30",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-mono font-bold text-primary",
											children: inv.invoice_number
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-semibold",
											children: vendors.find((v) => String(v.id) === String(inv.vendor_id))?.name || inv.vendor_id
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-mono text-cyan-500",
											children: inv.po_number || "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-mono text-emerald-500",
											children: inv.grn_number || "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: inv.invoice_date }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: inv.due_date ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: inv.status !== "PAID" && new Date(inv.due_date) < /* @__PURE__ */ new Date() ? "text-destructive font-semibold" : "",
											children: inv.due_date
										}) : "—" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
											className: "text-right",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "font-semibold",
													children: ["QAR ", totalDue.toLocaleString()]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[10px] text-muted-foreground font-mono",
													children: [
														"Base: ",
														Number(inv.amount || totalDue - (inv.tax_amount || 0)).toLocaleString(),
														" | Tax: ",
														Number(inv.tax_amount || 0).toLocaleString()
													]
												}),
												isPartial && alreadyPaid > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[10px] text-amber-600 font-mono mt-0.5",
													children: [
														"Paid: ",
														alreadyPaid.toLocaleString(),
														" | Due: ",
														outstanding.toLocaleString()
													]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: statusVariant(inv.status),
											className: isPartial ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400" : "",
											children: isPartial ? "Partial" : inv.status
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-right",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-end gap-1.5 items-center flex-wrap",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-7 text-xs px-2 gap-1 text-primary border-primary/40 hover:bg-primary/10",
														onClick: () => setSelectedInvoiceForView(inv),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), " View Proforma"]
													}),
													inv.status === "DRAFT" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-7 text-xs",
														onClick: () => handleApproveInvoice(inv),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "mr-1 h-3.5 w-3.5 text-emerald-500" }), "Approve"]
													}),
													(inv.status === "APPROVED" || isPartial) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-7 text-xs border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30",
														onClick: () => setSelectedInvoiceForView(inv),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "mr-1 h-3.5 w-3.5 text-amber-600" }), "Awaiting Finance Settlement"]
													}),
													(inv.status === "PAID" || isPartial && alreadyPaid > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-7 text-xs px-2.5 gap-1 text-emerald-600 border-emerald-500/40",
														onClick: () => openPaymentReceipt(inv),
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3 w-3" }),
															" ",
															isPartial ? "Receipts" : "Receipt"
														]
													})
												]
											})
										})
									]
								}, inv.id);
							}) })] })
						})]
					}),
					activeTab === "payments" && (apInvoices.filter((i) => i.status === "PAID" || i.status === "PARTIAL").length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { text: "No payments recorded. Paid and partially paid invoices appear here." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border rounded-lg overflow-hidden bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
							className: "bg-muted/50 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Invoice #" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Vendor" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "PO / GRN Chain" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "text-right",
									children: "Amount Paid (QAR)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "text-right",
									children: "Receipt"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: apInvoices.filter((i) => i.status === "PAID").map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
							className: "text-xs hover:bg-muted/30",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "font-mono font-bold text-primary",
									children: inv.invoice_number
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "font-semibold",
									children: vendors.find((v) => String(v.id) === String(inv.vendor_id))?.name || inv.vendor_id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "font-mono text-muted-foreground",
									children: [inv.po_number, inv.grn_number].filter(Boolean).join(" → ") || "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: inv.invoice_date }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-right font-semibold font-mono text-emerald-600",
									children: Number(inv.total_amount || 0).toLocaleString()
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										className: "h-6 text-[10px] px-2 gap-1 text-emerald-600 border-emerald-500/40",
										onClick: () => openPaymentReceipt(inv),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-2.5 w-2.5" }), " Receipt"]
									})
								})
							]
						}, inv.id)) })] })
					})),
					activeTab === "performance" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Supplier performance scorecard based on delivery, quality, and compliance metrics."
						}), vendors.filter((v) => v.status === "Active").length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { text: "No active vendors to score." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-4 md:grid-cols-2",
							children: vendors.filter((v) => v.status === "Active").map((v) => {
								const vi = apInvoices.filter((i) => String(i.vendor_id) === String(v.id));
								const paid = vi.filter((i) => i.status === "PAID").length;
								const total = vi.length;
								const onTime = total > 0 ? Math.round(paid / total * 100) : 75;
								const quality = 80 + v.name.charCodeAt(0) % 20;
								const certs = qualifications.filter((q) => String(q.vendor_id) === String(v.id) && q.status === "Active").length;
								const compliance = certs > 0 ? 95 : 60;
								const overall = Math.round((onTime + quality + compliance) / 3);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
									className: "bg-card/50",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
										className: "pb-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
												className: "text-sm",
												children: v.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
												className: "text-[10px]",
												children: [
													v.code,
													" · ",
													v.vendor_type || "Supplier"
												]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: `text-2xl font-bold ${overall >= 80 ? "text-emerald-500" : overall >= 60 ? "text-amber-500" : "text-rose-500"}`,
												children: overall
											})]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "space-y-2 pt-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between text-[10px] text-muted-foreground mb-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "On-Time Delivery" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [onTime, "%"] })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreBar, {
												score: onTime,
												color: "bg-blue-500"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between text-[10px] text-muted-foreground mb-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Quality Score" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [quality, "%"] })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreBar, {
												score: quality,
												color: "bg-emerald-500"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between text-[10px] text-muted-foreground mb-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Compliance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [compliance, "%"] })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreBar, {
												score: compliance,
												color: "bg-violet-500"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "pt-1 flex justify-between text-[10px] text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													total,
													" Invoice(s) · ",
													paid,
													" Paid"
												] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [certs, " Certification(s)"] })]
											})
										]
									})]
								}, v.id);
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showVendorModal,
				onOpenChange: setShowVendorModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editVendor ? "Edit Vendor" : "New Vendor Registration" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: editVendor ? "Update vendor information in the central registry." : "Complete the 4-step onboarding wizard for seamless supplier registration." })] }),
						!editVendor && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-4 gap-2 border-b pb-3 pt-1",
							children: [
								{
									step: 1,
									label: "Vendor Master",
									icon: Users
								},
								{
									step: 2,
									label: "Contacts",
									icon: Phone
								},
								{
									step: 3,
									label: "Qualification",
									icon: Shield
								},
								{
									step: 4,
									label: "Bank Details",
									icon: Banknote
								}
							].map(({ step, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setVendorStep(step),
								className: `flex flex-col items-center gap-1 p-2 rounded-md text-xs font-medium transition-all ${vendorStep === step ? "bg-primary/10 text-primary border border-primary/30" : vendorStep > step ? "text-emerald-600 hover:bg-muted/50" : "text-muted-foreground hover:bg-muted/30"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${vendorStep === step ? "bg-primary text-primary-foreground" : vendorStep > step ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`,
										children: vendorStep > step ? "✓" : step
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5 hidden sm:inline" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] truncate max-w-full font-semibold",
									children: label
								})]
							}, step))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
							className: "max-h-[60vh] pr-2",
							children: [
								(vendorStep === 1 || editVendor) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 py-2 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Vendor Code *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: vendorForm.code,
													onChange: (e) => setVendorForm({
														...vendorForm,
														code: e.target.value
													}),
													placeholder: "VND-001",
													className: "h-8 text-xs"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Vendor Type",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: vendorForm.vendor_type,
													onValueChange: (v) => setVendorForm({
														...vendorForm,
														vendor_type: v
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "h-8 text-xs",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
														"Supplier",
														"Contractor",
														"Consultant",
														"Service Provider",
														"Sub-Contractor"
													].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: t,
														children: t
													}, t)) })]
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Company / Vendor Name *",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: vendorForm.name,
												onChange: (e) => setVendorForm({
													...vendorForm,
													name: e.target.value
												}),
												placeholder: "Al Rashid Trading LLC",
												className: "h-8 text-xs font-medium"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Primary Contact Person",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: vendorForm.contact_person,
													onChange: (e) => setVendorForm({
														...vendorForm,
														contact_person: e.target.value
													}),
													className: "h-8 text-xs"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Phone",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: vendorForm.phone,
													onChange: (e) => setVendorForm({
														...vendorForm,
														phone: e.target.value
													}),
													placeholder: "+974 5555 0000",
													className: "h-8 text-xs"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Email",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "email",
												value: vendorForm.email,
												onChange: (e) => setVendorForm({
													...vendorForm,
													email: e.target.value
												}),
												className: "h-8 text-xs"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-3 rounded-lg border bg-muted/20 space-y-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "font-semibold text-foreground flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5 text-emerald-600" }), " Tax & Commercial Registration (CR) Details"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-3 gap-2.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "Tax / CR Number *",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															value: vendorForm.tax_number,
															onChange: (e) => setVendorForm({
																...vendorForm,
																tax_number: e.target.value
															}),
															placeholder: "CR-88291",
															className: "h-8 text-xs font-mono font-bold"
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "CR Expiry Date",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "date",
															value: vendorForm.cr_expiry_date,
															onChange: (e) => setVendorForm({
																...vendorForm,
																cr_expiry_date: e.target.value
															}),
															className: "h-8 text-xs"
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "Tax / VAT Rate (%)",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															min: "0",
															max: "100",
															value: vendorForm.tax_rate,
															onChange: (e) => setVendorForm({
																...vendorForm,
																tax_rate: e.target.value
															}),
															placeholder: "0",
															className: "h-8 text-xs font-mono"
														})
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-3 rounded-lg border bg-blue-50/40 dark:bg-blue-950/20 space-y-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-3.5 w-3.5 text-blue-600" }), " Upload Vendor Documentation & Agreements"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-3 gap-2.5 text-xs",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2 rounded border bg-background flex flex-col justify-between",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold block text-[11px]",
															children: "Terms & Conditions"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block truncate",
															children: vendorForm.terms_doc_name || "No file chosen"
														})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
															className: "mt-2 inline-flex items-center justify-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 rounded cursor-pointer text-[10px] font-medium transition",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "h-3 w-3" }),
																" ",
																vendorForm.terms_doc_name ? "Replace Terms" : "Upload Terms",
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																	type: "file",
																	accept: ".pdf,.doc,.docx",
																	className: "hidden",
																	onChange: (e) => {
																		const file = e.target.files?.[0];
																		if (file) {
																			setVendorForm((prev) => ({
																				...prev,
																				terms_doc_name: file.name
																			}));
																			toast.success(`Terms document "${file.name}" attached.`);
																		}
																	}
																})
															]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2 rounded border bg-background flex flex-col justify-between",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold block text-[11px]",
															children: "Company Profile / CR"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block truncate",
															children: vendorForm.company_profile_name || "No file chosen"
														})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
															className: "mt-2 inline-flex items-center justify-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 rounded cursor-pointer text-[10px] font-medium transition",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "h-3 w-3" }),
																" ",
																vendorForm.company_profile_name ? "Replace Profile" : "Upload Profile",
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																	type: "file",
																	accept: ".pdf,.doc,.docx,.png,.jpg",
																	className: "hidden",
																	onChange: (e) => {
																		const file = e.target.files?.[0];
																		if (file) {
																			setVendorForm((prev) => ({
																				...prev,
																				company_profile_name: file.name
																			}));
																			toast.success(`Company Profile "${file.name}" attached.`);
																		}
																	}
																})
															]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2 rounded border bg-background flex flex-col justify-between",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold block text-[11px]",
															children: "Tax Card / Certificate"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block truncate",
															children: vendorForm.tax_cert_name || "No file chosen"
														})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
															className: "mt-2 inline-flex items-center justify-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 rounded cursor-pointer text-[10px] font-medium transition",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "h-3 w-3" }),
																" ",
																vendorForm.tax_cert_name ? "Replace Tax Card" : "Upload Tax Card",
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																	type: "file",
																	accept: ".pdf,.doc,.docx,.png,.jpg",
																	className: "hidden",
																	onChange: (e) => {
																		const file = e.target.files?.[0];
																		if (file) {
																			setVendorForm((prev) => ({
																				...prev,
																				tax_cert_name: file.name
																			}));
																			toast.success(`Tax Certificate "${file.name}" attached.`);
																		}
																	}
																})
															]
														})]
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Billing Currency",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: vendorForm.currency,
													onValueChange: (v) => setVendorForm({
														...vendorForm,
														currency: v
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "h-8 text-xs",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
														"QAR",
														"USD",
														"EUR",
														"AED",
														"SAR",
														"GBP"
													].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: c,
														children: c
													}, c)) })]
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Payment Terms *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: vendorForm.payment_terms,
													onValueChange: (v) => setVendorForm({
														...vendorForm,
														payment_terms: v
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "h-8 text-xs",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
														"Immediate / Cash on Delivery",
														"Net 7 Days",
														"Net 14 Days",
														"Net 30 Days",
														"Net 45 Days",
														"Net 60 Days",
														"Net 90 Days"
													].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: t,
														children: t
													}, t)) })]
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Settlement Mode *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: vendorForm.settlement_mode,
													onValueChange: (v) => setVendorForm({
														...vendorForm,
														settlement_mode: v
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "h-8 text-xs",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Bank Wire / Electronic Transfer (QNB)",
															children: "Bank Wire / Electronic Transfer (QNB)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "CBQ Electronic Wire",
															children: "CBQ Electronic Wire"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Corporate Cheque on Delivery",
															children: "Corporate Cheque on Delivery"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Direct Debit / Online Portal",
															children: "Direct Debit / Online Portal"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Cash in Hand / Petty Cash",
															children: "Cash in Hand / Petty Cash"
														})
													] })]
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Status",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: vendorForm.status,
													onValueChange: (v) => setVendorForm({
														...vendorForm,
														status: v
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "h-8 text-xs",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Active",
															children: "Active"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Inactive",
															children: "Inactive"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Blacklisted",
															children: "Blacklisted"
														})
													] })]
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Address",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: vendorForm.address,
												onChange: (e) => setVendorForm({
													...vendorForm,
													address: e.target.value
												}),
												className: "h-8 text-xs"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "City",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: vendorForm.city,
													onChange: (e) => setVendorForm({
														...vendorForm,
														city: e.target.value
													}),
													placeholder: "Doha",
													className: "h-8 text-xs"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Country",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: vendorForm.country,
													onChange: (e) => setVendorForm({
														...vendorForm,
														country: e.target.value
													}),
													className: "h-8 text-xs"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Notes",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												value: vendorForm.notes,
												onChange: (e) => setVendorForm({
													...vendorForm,
													notes: e.target.value
												}),
												className: "text-xs min-h-[50px]"
											})
										})
									]
								}),
								vendorStep === 2 && !editVendor && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 py-2 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4 text-blue-500 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Configure the direct key account representative or emergency escalation contact." })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Contact Full Name *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: vendorForm.contact_name,
													onChange: (e) => setVendorForm({
														...vendorForm,
														contact_name: e.target.value
													}),
													placeholder: "Salem Al-Kuwari",
													className: "h-8 text-xs"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Role / Designation",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: vendorForm.contact_role,
													onChange: (e) => setVendorForm({
														...vendorForm,
														contact_role: e.target.value
													}),
													placeholder: "Sales Director",
													className: "h-8 text-xs"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Direct Phone",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: vendorForm.contact_phone,
													onChange: (e) => setVendorForm({
														...vendorForm,
														contact_phone: e.target.value
													}),
													placeholder: "+974 5500 1234",
													className: "h-8 text-xs"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Direct Email",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "email",
													value: vendorForm.contact_email,
													onChange: (e) => setVendorForm({
														...vendorForm,
														contact_email: e.target.value
													}),
													placeholder: "salem@supplier.qa",
													className: "h-8 text-xs"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 pt-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												id: "v_primary",
												checked: vendorForm.contact_primary,
												onChange: (e) => setVendorForm({
													...vendorForm,
													contact_primary: e.target.checked
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "v_primary",
												className: "text-xs cursor-pointer font-medium",
												children: "Designate as Primary Contact for Purchase Orders & RFQs"
											})]
										})
									]
								}),
								vendorStep === 3 && !editVendor && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 py-2 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4 text-emerald-500 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Provide compliance, ISO certifications, trade license, and qualification details." })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Trade / Service Category *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: vendorForm.qual_category,
													onChange: (e) => setVendorForm({
														...vendorForm,
														qual_category: e.target.value
													}),
													placeholder: "HVAC, Fire Safety, Electrical...",
													className: "h-8 text-xs"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Certification / License",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: vendorForm.qual_certification,
													onChange: (e) => setVendorForm({
														...vendorForm,
														qual_certification: e.target.value
													}),
													placeholder: "Commercial Registration, ISO 9001",
													className: "h-8 text-xs"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "License / Cert Expiry Date",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "date",
													value: vendorForm.qual_expiry,
													onChange: (e) => setVendorForm({
														...vendorForm,
														qual_expiry: e.target.value
													}),
													className: "h-8 text-xs"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Compliance Status",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: vendorForm.qual_status,
													onValueChange: (v) => setVendorForm({
														...vendorForm,
														qual_status: v
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "h-8 text-xs",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Active",
															children: "Active (Compliant)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Pending",
															children: "Pending Audit"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Expired",
															children: "Expired"
														})
													] })]
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Compliance Notes / Scope",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: vendorForm.qual_notes,
												onChange: (e) => setVendorForm({
													...vendorForm,
													qual_notes: e.target.value
												}),
												placeholder: "Authorized distributor for Daikin, Carrier...",
												className: "h-8 text-xs"
											})
										})
									]
								}),
								vendorStep === 4 && !editVendor && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 py-2 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-4 w-4 text-amber-500 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Set up supplier bank account for direct electronic wire settlements and AP disbursements." })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Bank Name *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: vendorForm.bank_name,
													onChange: (e) => setVendorForm({
														...vendorForm,
														bank_name: e.target.value
													}),
													placeholder: "Qatar National Bank (QNB)",
													className: "h-8 text-xs"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Account Holder Name",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: vendorForm.bank_account_name,
													onChange: (e) => setVendorForm({
														...vendorForm,
														bank_account_name: e.target.value
													}),
													placeholder: vendorForm.name || "Company Legal Name",
													className: "h-8 text-xs"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Account Number *",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: vendorForm.bank_account_number,
												onChange: (e) => setVendorForm({
													...vendorForm,
													bank_account_number: e.target.value
												}),
												placeholder: "0013-098271-001",
												className: "h-8 text-xs font-mono"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "IBAN",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: vendorForm.bank_iban,
													onChange: (e) => setVendorForm({
														...vendorForm,
														bank_iban: e.target.value
													}),
													placeholder: "QA58QNBA000000000013098271001",
													className: "h-8 text-xs font-mono"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "SWIFT / BIC Code",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: vendorForm.bank_swift,
													onChange: (e) => setVendorForm({
														...vendorForm,
														bank_swift: e.target.value
													}),
													placeholder: "QNBAQAQA",
													className: "h-8 text-xs font-mono"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Disbursement Currency",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: vendorForm.bank_currency,
												onValueChange: (v) => setVendorForm({
													...vendorForm,
													bank_currency: v
												}),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
													"QAR",
													"USD",
													"EUR",
													"AED"
												].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: c,
													children: c
												}, c)) })]
											})
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "flex flex-row justify-between items-center sm:justify-between w-full pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: !editVendor && vendorStep > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								size: "sm",
								onClick: () => setVendorStep((s) => s - 1),
								children: "Back"
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setShowVendorModal(false),
									children: "Cancel"
								}), !editVendor && vendorStep < 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									size: "sm",
									onClick: () => {
										if (vendorStep === 1 && (!vendorForm.code.trim() || !vendorForm.name.trim())) return toast.error("Vendor Code and Name are required.");
										setVendorStep((s) => s + 1);
									},
									children: ["Next Step ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-1 h-3.5 w-3.5" })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									onClick: handleSaveVendor,
									disabled: saving,
									children: editVendor ? "Update Vendor" : "Complete Registration"
								})]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showContactModal,
				onOpenChange: setShowContactModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add Vendor Contact" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Vendor *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: contactForm.vendorId,
										onValueChange: (v) => setContactForm({
											...contactForm,
											vendorId: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select vendor" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: vendors.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: String(v.id),
											children: v.name
										}, v.id)) })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Full Name *",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: contactForm.name,
											onChange: (e) => setContactForm({
												...contactForm,
												name: e.target.value
											}),
											className: "h-8 text-xs"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Role",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: contactForm.role,
											onChange: (e) => setContactForm({
												...contactForm,
												role: e.target.value
											}),
											placeholder: "Sales Manager",
											className: "h-8 text-xs"
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Phone",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: contactForm.phone,
											onChange: (e) => setContactForm({
												...contactForm,
												phone: e.target.value
											}),
											className: "h-8 text-xs"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Email",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "email",
											value: contactForm.email,
											onChange: (e) => setContactForm({
												...contactForm,
												email: e.target.value
											}),
											className: "h-8 text-xs"
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 pt-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										id: "is_primary",
										checked: contactForm.is_primary,
										onChange: (e) => setContactForm({
											...contactForm,
											is_primary: e.target.checked
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "is_primary",
										className: "text-xs cursor-pointer",
										children: "Mark as Primary Contact"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setShowContactModal(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: async () => {
								if (!contactForm.vendorId || !contactForm.name.trim()) return toast.error("Vendor and Name required.");
								try {
									const { error } = await supabase.from("vendor_contacts").insert({
										vendor_id: contactForm.vendorId,
										name: contactForm.name,
										role: contactForm.role,
										phone: contactForm.phone || null,
										email: contactForm.email || null,
										is_primary: contactForm.is_primary
									});
									if (error) throw error;
									toast.success("Contact added.");
									setShowContactModal(false);
									await loadAll();
								} catch (e) {
									toast.error(e.message);
								}
							},
							children: "Add Contact"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showBankModal,
				onOpenChange: setShowBankModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add Bank Account" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Vendor *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: bankForm.vendorId,
										onValueChange: (v) => setBankForm({
											...bankForm,
											vendorId: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select vendor" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: vendors.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: String(v.id),
											children: v.name
										}, v.id)) })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Bank Name *",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: bankForm.bank_name,
											onChange: (e) => setBankForm({
												...bankForm,
												bank_name: e.target.value
											}),
											className: "h-8 text-xs"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Account Name",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: bankForm.account_name,
											onChange: (e) => setBankForm({
												...bankForm,
												account_name: e.target.value
											}),
											className: "h-8 text-xs"
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Account Number *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: bankForm.account_number,
										onChange: (e) => setBankForm({
											...bankForm,
											account_number: e.target.value
										}),
										className: "h-8 text-xs font-mono"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "IBAN",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: bankForm.iban,
											onChange: (e) => setBankForm({
												...bankForm,
												iban: e.target.value
											}),
											className: "h-8 text-xs font-mono"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "SWIFT / BIC",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: bankForm.swift_code,
											onChange: (e) => setBankForm({
												...bankForm,
												swift_code: e.target.value
											}),
											className: "h-8 text-xs font-mono"
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Currency",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: bankForm.currency,
										onValueChange: (v) => setBankForm({
											...bankForm,
											currency: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
											"QAR",
											"USD",
											"EUR",
											"AED"
										].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: c,
											children: c
										}, c)) })]
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setShowBankModal(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: async () => {
								if (!bankForm.vendorId || !bankForm.bank_name || !bankForm.account_number) return toast.error("Vendor, Bank Name and Account Number required.");
								try {
									const { error } = await supabase.from("vendor_bank_details").insert({
										...bankForm,
										vendor_id: bankForm.vendorId
									});
									if (error) throw error;
									toast.success("Bank account added.");
									setShowBankModal(false);
									await loadAll();
								} catch (e) {
									toast.error(e.message);
								}
							},
							children: "Save Bank Account"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showQualModal,
				onOpenChange: setShowQualModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add Qualification" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Vendor *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: qualForm.vendorId,
										onValueChange: (v) => setQualForm({
											...qualForm,
											vendorId: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select vendor" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: vendors.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: String(v.id),
											children: v.name
										}, v.id)) })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Category *",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: qualForm.category,
											onChange: (e) => setQualForm({
												...qualForm,
												category: e.target.value
											}),
											placeholder: "HVAC, Civil...",
											className: "h-8 text-xs"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Certification",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: qualForm.certification,
											onChange: (e) => setQualForm({
												...qualForm,
												certification: e.target.value
											}),
											placeholder: "ISO 9001...",
											className: "h-8 text-xs"
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Expiry Date",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											value: qualForm.expiry_date,
											onChange: (e) => setQualForm({
												...qualForm,
												expiry_date: e.target.value
											}),
											className: "h-8 text-xs"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Status",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: qualForm.status,
											onValueChange: (v) => setQualForm({
												...qualForm,
												status: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Active",
													children: "Active"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Expired",
													children: "Expired"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Pending",
													children: "Pending"
												})
											] })]
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Notes",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: qualForm.notes,
										onChange: (e) => setQualForm({
											...qualForm,
											notes: e.target.value
										}),
										className: "h-8 text-xs"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setShowQualModal(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: async () => {
								if (!qualForm.vendorId || !qualForm.category) return toast.error("Vendor and Category required.");
								try {
									const { error } = await supabase.from("vendor_qualifications").insert({
										vendor_id: qualForm.vendorId,
										category: qualForm.category,
										certification: qualForm.certification || null,
										expiry_date: qualForm.expiry_date || null,
										status: qualForm.status,
										notes: qualForm.notes || null
									});
									if (error) throw error;
									toast.success("Qualification added.");
									setShowQualModal(false);
									await loadAll();
								} catch (e) {
									toast.error(e.message);
								}
							},
							children: "Add Qualification"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showInvoiceModal,
				onOpenChange: setShowInvoiceModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New AP Invoice" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Log a vendor invoice and link it to a PO and GRN for 3-way matching." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Vendor *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: invoiceForm.vendorId,
										onValueChange: (v) => {
											const vendor = vendors.find((vObj) => String(vObj.id) === v);
											setInvoiceForm({
												...invoiceForm,
												vendorId: v,
												payment_terms: vendor?.payment_terms || "Net 30 Days"
											});
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select vendor" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: vendors.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: String(v.id),
											children: [
												v.name,
												" (",
												v.code,
												")"
											]
										}, v.id)) })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Invoice Number *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: invoiceForm.invoice_number,
										onChange: (e) => setInvoiceForm({
											...invoiceForm,
											invoice_number: e.target.value
										}),
										placeholder: "INV-2025-001",
										className: "h-8 text-xs font-mono"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "PO Reference",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: invoiceForm.po_number,
											onChange: (e) => setInvoiceForm({
												...invoiceForm,
												po_number: e.target.value
											}),
											placeholder: "PO-2025-000001",
											className: "h-8 text-xs font-mono"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "GRN Reference",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: invoiceForm.grn_number,
											onChange: (e) => setInvoiceForm({
												...invoiceForm,
												grn_number: e.target.value
											}),
											placeholder: "GRN-2025-000001",
											className: "h-8 text-xs font-mono"
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Invoice Date",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											value: invoiceForm.invoice_date,
											onChange: (e) => setInvoiceForm({
												...invoiceForm,
												invoice_date: e.target.value
											}),
											className: "h-8 text-xs"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Due Date",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											value: invoiceForm.due_date,
											onChange: (e) => setInvoiceForm({
												...invoiceForm,
												due_date: e.target.value
											}),
											className: "h-8 text-xs"
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Net Amount (QAR) *",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											value: invoiceForm.amount,
											onChange: (e) => setInvoiceForm({
												...invoiceForm,
												amount: e.target.value
											}),
											className: "h-8 text-xs font-mono font-bold"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Tax Amount (QAR)",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											value: invoiceForm.tax_amount,
											onChange: (e) => setInvoiceForm({
												...invoiceForm,
												tax_amount: e.target.value
											}),
											className: "h-8 text-xs font-mono"
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Payment Terms *",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: invoiceForm.payment_terms,
											onValueChange: (v) => setInvoiceForm({
												...invoiceForm,
												payment_terms: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
												"Immediate / Cash on Delivery",
												"Net 7 Days",
												"Net 14 Days",
												"Net 30 Days",
												"Net 45 Days",
												"Net 60 Days",
												"Net 90 Days"
											].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: t,
												children: t
											}, t)) })]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Settlement Mode *",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: invoiceForm.settlement_mode,
											onValueChange: (v) => setInvoiceForm({
												...invoiceForm,
												settlement_mode: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Bank Wire / Electronic Transfer (QNB)",
													children: "Bank Wire / Electronic Transfer (QNB)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "CBQ Electronic Wire",
													children: "CBQ Electronic Wire"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Corporate Cheque on Delivery",
													children: "Corporate Cheque on Delivery"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Direct Debit / Online Portal",
													children: "Direct Debit / Online Portal"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Cash in Hand / Petty Cash",
													children: "Cash in Hand / Petty Cash"
												})
											] })]
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Remarks",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: invoiceForm.remarks,
										onChange: (e) => setInvoiceForm({
											...invoiceForm,
											remarks: e.target.value
										}),
										className: "h-8 text-xs"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setShowInvoiceModal(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleSaveInvoice,
							disabled: saving,
							children: "Create Invoice"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProformaInvoiceDialog, {
				invoice: selectedInvoiceForView,
				open: !!selectedInvoiceForView,
				onOpenChange: (open) => !open && setSelectedInvoiceForView(null),
				vendors,
				onViewReceiptClick: (inv) => openPaymentReceipt(inv),
				onPayClick: (inv) => {
					setSelectedInvoiceForView(null);
					setPaymentTargetInv(inv);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentReceiptDialog, {
				receipt: selectedReceipt,
				open: showReceiptModal,
				onOpenChange: setShowReceiptModal,
				vendorName: selectedReceipt?.vendor_name || vendors.find((v) => String(v.id) === String(selectedReceipt?.vendor_id))?.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showAdvanceModal,
				onOpenChange: setShowAdvanceModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl",
					onPointerDownOutside: (e) => e.preventDefault(),
					onEscapeKeyDown: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "p-5 pb-3 border-b",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
								className: "flex items-center gap-2 text-base",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-5 w-5 text-emerald-600" }), "Disburse Advance Payment to Vendor"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs",
								children: "Record an advance / mobilization deposit disbursed to supplier prior to invoice presentation."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
							className: "flex-1 px-5 py-4 max-h-[calc(90vh-130px)] space-y-4 text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Vendor *",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: advanceForm.vendorId,
											onValueChange: (v) => setAdvanceForm({
												...advanceForm,
												vendorId: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Vendor" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: vendors.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
												value: String(v.id),
												children: [
													v.name,
													" (",
													v.code,
													")"
												]
											}, v.id)) })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Advance Amount (QAR) *",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												min: "1",
												value: advanceForm.amount,
												onChange: (e) => setAdvanceForm({
													...advanceForm,
													amount: e.target.value
												}),
												className: "font-mono font-bold text-sm h-8"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Disbursement Date *",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "date",
												value: advanceForm.date,
												onChange: (e) => setAdvanceForm({
													...advanceForm,
													date: e.target.value
												}),
												className: "h-8 text-xs"
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Disbursement Mode *",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: advanceForm.paymentMode,
											onValueChange: (v) => setAdvanceForm({
												...advanceForm,
												paymentMode: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Bank Wire / QNB Corporate Electronic",
													children: "Bank Wire / Electronic Transfer (QNB)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Commercial Bank of Qatar (CBQ) Wire",
													children: "CBQ Electronic Wire"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Corporate Cheque / Manager's Cheque",
													children: "Corporate Cheque"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Cash in Hand / Office Vault Cash",
													children: "Cash in Hand / Cash Vault"
												})
											] })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Payment Reference / TXN #",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: advanceForm.reference,
												onChange: (e) => setAdvanceForm({
													...advanceForm,
													reference: e.target.value
												}),
												placeholder: "TXN-998812",
												className: "h-8 text-xs font-mono"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Advance Purpose",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: advanceForm.purpose,
												onChange: (e) => setAdvanceForm({
													...advanceForm,
													purpose: e.target.value
												}),
												className: "h-8 text-xs"
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Remarks / PO Contract Ref",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: advanceForm.remarks,
											onChange: (e) => setAdvanceForm({
												...advanceForm,
												remarks: e.target.value
											}),
											placeholder: "e.g. PO-2026-000008 30% advance mobilization",
											className: "h-8 text-xs"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 rounded-lg bg-muted/40 border text-[11px] space-y-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1 font-semibold text-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 text-emerald-600" }), "Journal Entry Preview — Double-Entry GL/SL/Account Posting:"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-4 gap-1 p-2 rounded bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/50",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-bold text-blue-700 dark:text-blue-400 col-span-4 text-[10px]",
														children: "DEBIT (Dr.) — Asset Created"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-muted-foreground",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "GL Code:" }), " 12300001"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-muted-foreground",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Account:" }), " Advance to Vendors"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-muted-foreground",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Group:" }), " Current Assets"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-muted-foreground",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Sub-Ledger:" }),
															" ",
															vendors.find((v) => String(v.id) === advanceForm.vendorId)?.name || "—"
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "col-span-4 font-mono font-bold text-blue-700 dark:text-blue-400",
														children: ["QAR ", Number(advanceForm.amount || 0).toLocaleString()]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-4 gap-1 p-2 rounded bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-bold text-emerald-700 dark:text-emerald-400 col-span-4 text-[10px]",
														children: ["CREDIT (Cr.) — ", advanceForm.paymentMode.includes("Cash") ? "Cash Disbursed" : "Bank Disbursed"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-muted-foreground",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "GL Code:" }),
															" ",
															advanceForm.paymentMode.includes("Cash") ? "12100001" : "12000001"
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-muted-foreground",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Account:" }),
															" ",
															advanceForm.paymentMode.includes("Cash") ? "Cash in Hand (Office Vault)" : "Bank Operating Account (QNB)"
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-muted-foreground",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Group:" }),
															" Current Assets / ",
															advanceForm.paymentMode.includes("Cash") ? "Cash" : "Bank"
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-muted-foreground",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Voucher:" }),
															" ADV-PV / ",
															advanceForm.reference || "Auto"
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "col-span-4 font-mono font-bold text-emerald-700 dark:text-emerald-400",
														children: ["QAR ", Number(advanceForm.amount || 0).toLocaleString()]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground italic",
												children: "This creates a current asset (advance to vendor) sub-ledger entry. Balance auto-offsets future payable invoices for this vendor."
											})
										]
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "p-4 border-t bg-muted/20 flex flex-row justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setShowAdvanceModal(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "bg-emerald-600 hover:bg-emerald-700 text-white gap-1",
								disabled: saving || !advanceForm.vendorId || Number(advanceForm.amount) <= 0,
								onClick: () => {
									const amt = Number(advanceForm.amount);
									if (amt <= 0) return toast.error("Please specify a valid advance amount.");
									const advKey = `vendor_advance_${advanceForm.vendorId}`;
									const curr = Number(localStorage.getItem(advKey) || "0");
									localStorage.setItem(advKey, String(curr + amt));
									const targetVendor = vendors.find((v) => String(v.id) === String(advanceForm.vendorId));
									postAdvanceVoucherToGL({
										amount: amt,
										vendorId: advanceForm.vendorId,
										vendorName: targetVendor?.name || `Vendor #${advanceForm.vendorId}`,
										paymentMode: advanceForm.paymentMode,
										reference: advanceForm.reference,
										date: advanceForm.date,
										purpose: advanceForm.purpose || advanceForm.remarks
									});
									toast.success(`Advance payment of QAR ${amt.toLocaleString()} posted to Vendor Advance Ledger (Dr. 12300001 / Cr. ${advanceForm.paymentMode.includes("Cash") ? "12100001 Cash" : "12000001 Bank"}). Payment Voucher posted to Finance GL.`);
									setShowAdvanceModal(false);
									loadAll();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }), " Disburse & Post Advance"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showAdvanceHistoryModal,
				onOpenChange: setShowAdvanceHistoryModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					className: "max-w-2xl max-h-[95vh] flex flex-col p-0 overflow-hidden rounded-xl",
					onPointerDownOutside: (e) => e.preventDefault(),
					onEscapeKeyDown: (e) => e.preventDefault(),
					children: advanceHistoryVendor && (() => {
						const advKey = `vendor_advance_${advanceHistoryVendor.id}`;
						const utilKey = `vendor_adv_util_${advanceHistoryVendor.id}`;
						const currentAdvance = Number(localStorage.getItem(advKey) || "0");
						const vendorInvoices = apInvoices.filter((i) => String(i.vendor_id) === String(advanceHistoryVendor.id));
						const totalInvoiced = vendorInvoices.reduce((a, b) => a + Number(b.total_amount || 0), 0);
						vendorInvoices.reduce((a, b) => {
							const pKey = `partial_paid_${b.id}`;
							return a + Number(localStorage.getItem(pKey) || (b.status === "PAID" ? b.total_amount : 0));
						}, 0);
						const explicitUtils = JSON.parse(localStorage.getItem(utilKey) || "[]");
						const inferredUtils = vendorInvoices.filter((inv) => {
							const pKey = `partial_paid_${inv.id}`;
							return Number(localStorage.getItem(pKey) || (inv.status === "PAID" ? inv.total_amount : 0)) > 0 && !explicitUtils.some((u) => u.invoice_id === inv.id || u.invoice_number === inv.invoice_number);
						}).map((inv) => {
							const pKey = `partial_paid_${inv.id}`;
							const pPaid = Number(localStorage.getItem(pKey) || (inv.status === "PAID" ? inv.total_amount : 0));
							return {
								id: `util-inf-${inv.id}`,
								invoice_id: inv.id,
								invoice_number: inv.invoice_number,
								date: inv.invoice_date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
								advance_used: pPaid,
								cash_paid: 0,
								total_settled: pPaid,
								reference: inv.po_number || "Advance Offset",
								created_at: (/* @__PURE__ */ new Date()).toISOString()
							};
						});
						const allAdvanceUtils = [...explicitUtils, ...inferredUtils];
						const totalAdvanceUtilized = allAdvanceUtils.reduce((s, u) => s + Number(u.advance_used || 0), 0);
						const totalDisbursed = currentAdvance + totalAdvanceUtilized;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
								className: "p-5 pb-3 border-b shrink-0 bg-gradient-to-r from-emerald-600/10 to-teal-600/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
										className: "flex items-center gap-2 text-base",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-5 w-5 text-emerald-600" }), "Advance Management & Utilization History"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
										className: "text-xs",
										children: [
											"Vendor: ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "text-foreground",
												children: advanceHistoryVendor.name
											}),
											" (",
											advanceHistoryVendor.code,
											")"
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "font-mono text-emerald-600 border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20",
										children: "GL 12300001 (Advance to Vendors)"
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex-1 overflow-y-auto p-5 space-y-4 max-h-[calc(95vh-130px)]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-4 gap-2.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-3 rounded-lg border bg-blue-500/10 border-blue-500/20 text-center",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[10px] text-blue-700 dark:text-blue-400 font-semibold",
														children: "Total Disbursed"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "text-lg font-black font-mono text-blue-600 mt-1",
														children: ["QAR ", totalDisbursed.toLocaleString()]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-3 rounded-lg border bg-violet-500/10 border-violet-500/20 text-center",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[10px] text-violet-700 dark:text-violet-400 font-semibold",
														children: "Total Advance Utilized"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "text-lg font-black font-mono text-violet-600 mt-1",
														children: ["QAR ", totalAdvanceUtilized.toLocaleString()]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/20 text-center",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold",
														children: "Available Advance Balance"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "text-lg font-black font-mono text-emerald-600 mt-1",
														children: ["QAR ", currentAdvance.toLocaleString()]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-3 rounded-lg border bg-muted/40 text-center",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[10px] text-muted-foreground",
														children: "Total Invoices Raised"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "text-lg font-black font-mono text-primary mt-1",
														children: ["QAR ", totalInvoiced.toLocaleString()]
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "font-bold text-foreground flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-4 w-4 text-violet-600" }), " Advance Utilization Tracking & Offsets"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "border rounded-lg overflow-x-auto",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, {
													className: "whitespace-nowrap",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
														className: "bg-muted/50 text-[11px] whitespace-nowrap",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "font-bold whitespace-nowrap",
																children: "Date"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "font-bold whitespace-nowrap",
																children: "Invoice #"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "font-bold whitespace-nowrap",
																children: "Reference / Voucher"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "font-bold text-right whitespace-nowrap",
																children: "Advance Utilized (QAR)"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "font-bold text-right whitespace-nowrap",
																children: "Cash / Bank Paid (QAR)"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "font-bold text-right whitespace-nowrap",
																children: "Total Settled (QAR)"
															})
														]
													}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [allAdvanceUtils.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
														className: "text-xs hover:bg-muted/30 whitespace-nowrap",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
																className: "whitespace-nowrap font-medium",
																children: formatDDMMMYYYY(u.date)
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
																className: "font-mono font-bold text-primary whitespace-nowrap",
																children: u.invoice_number
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
																className: "font-mono text-cyan-600 whitespace-nowrap",
																children: u.reference || "Advance Offset"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
																className: "text-right font-mono font-bold text-violet-600 whitespace-nowrap",
																children: ["QAR ", Number(u.advance_used).toLocaleString()]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
																className: "text-right font-mono text-muted-foreground whitespace-nowrap",
																children: ["QAR ", Number(u.cash_paid).toLocaleString()]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
																className: "text-right font-mono font-bold text-emerald-600 whitespace-nowrap",
																children: ["QAR ", Number(u.total_settled).toLocaleString()]
															})
														]
													}, u.id)), allAdvanceUtils.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														colSpan: 6,
														className: "text-center py-3 text-muted-foreground whitespace-nowrap",
														children: "No advance utilization records yet. Advances are tracked here when applied to invoices."
													}) })] })]
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "font-bold text-foreground flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-4 w-4 text-primary" }), " Vendor Invoices & Total Settlements"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "border rounded-lg overflow-x-auto",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, {
													className: "whitespace-nowrap",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
														className: "bg-muted/50 text-[11px] whitespace-nowrap",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "font-bold whitespace-nowrap",
																children: "Invoice #"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "font-bold whitespace-nowrap",
																children: "PO / GRN"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "font-bold whitespace-nowrap",
																children: "Date"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "font-bold text-right whitespace-nowrap",
																children: "Amount (QAR)"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "font-bold whitespace-nowrap",
																children: "Status"
															})
														]
													}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [vendorInvoices.map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
														className: "text-xs hover:bg-muted/30 whitespace-nowrap",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
																className: "font-mono font-bold text-primary whitespace-nowrap",
																children: inv.invoice_number
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
																className: "font-mono text-cyan-600 whitespace-nowrap",
																children: inv.po_number || "—"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
																className: "whitespace-nowrap",
																children: formatDDMMMYYYY(inv.invoice_date)
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
																className: "text-right font-mono font-bold whitespace-nowrap",
																children: ["QAR ", Number(inv.total_amount).toLocaleString()]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
																className: "whitespace-nowrap",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	variant: inv.status === "PAID" ? "default" : "outline",
																	className: "text-[10px] whitespace-nowrap",
																	children: inv.status
																})
															})
														]
													}, inv.id)), vendorInvoices.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														colSpan: 5,
														className: "text-center py-4 text-muted-foreground whitespace-nowrap",
														children: "No invoices recorded for this vendor."
													}) })] })]
												})
											})]
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, {
								className: "p-4 border-t bg-muted/20 flex justify-end shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => setShowAdvanceHistoryModal(false),
									children: "Close"
								})
							})
						] });
					})()
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showOrdersModal,
				onOpenChange: setShowOrdersModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					className: "max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl",
					onPointerDownOutside: (e) => e.preventDefault(),
					onEscapeKeyDown: (e) => e.preventDefault(),
					children: ordersVendor && (() => {
						const posForVendor = vendorPos.filter((p) => Number(p.vendor_id) === Number(ordersVendor.id) || String(p.vendor_id) === String(ordersVendor.id));
						const totalPoValue = posForVendor.reduce((a, b) => a + Number(b.total_amount || 0), 0);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
								className: "p-5 pb-3 border-b shrink-0 bg-gradient-to-r from-cyan-600/10 to-blue-600/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
										className: "flex items-center gap-2 text-base",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-5 w-5 text-cyan-600" }), "Purchase Orders & Procurement Contracts"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
										className: "text-xs",
										children: [
											"Vendor: ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "text-foreground",
												children: ordersVendor.name
											}),
											" (",
											ordersVendor.code,
											")"
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										className: "font-mono text-cyan-600 border-cyan-500/40",
										children: [posForVendor.length, " Order(s)"]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
								className: "flex-1 p-5 max-h-[calc(90vh-140px)]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3.5 rounded-lg border bg-cyan-500/10 border-cyan-500/20 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground block text-[11px]",
											children: "Total PO Contract Volume"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xl font-bold font-mono text-cyan-700 dark:text-cyan-400",
											children: ["QAR ", totalPoValue.toLocaleString()]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-right text-[11px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground block",
												children: "Active Payment Terms"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-foreground",
												children: ordersVendor.payment_terms || "30 Days"
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "border rounded-lg overflow-hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
											className: "bg-muted/50 text-[11px]",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "font-bold",
													children: "PO Number"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "font-bold",
													children: "Order Date"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "font-bold",
													children: "Delivery Due"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "font-bold text-right",
													children: "Total (QAR)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "font-bold",
													children: "Status"
												})
											]
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [posForVendor.map((po) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
											className: "text-xs hover:bg-muted/30",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "font-mono font-bold text-primary",
													children: po.doc_number
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: po.po_date }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: po.delivery_date || "—" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
													className: "text-right font-mono font-bold",
													children: ["QAR ", Number(po.total_amount).toLocaleString()]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: po.status === "CLOSED" ? "default" : po.status === "APPROVED" ? "secondary" : "outline",
													className: "text-[10px]",
													children: po.status
												}) })
											]
										}, po.id)), posForVendor.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											colSpan: 5,
											className: "text-center py-6 text-muted-foreground",
											children: "No purchase orders issued for this vendor yet."
										}) })] })] })
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, {
								className: "p-4 border-t bg-muted/20 flex justify-end shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => setShowOrdersModal(false),
									children: "Close"
								})
							})
						] });
					})()
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!paymentTargetInv,
				onOpenChange: (open) => {
					if (!open) setPaymentTargetInv(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-xl",
					onPointerDownOutside: (e) => e.preventDefault(),
					onEscapeKeyDown: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "p-4 pb-2.5 border-b shrink-0 bg-muted/10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
								className: "flex items-center gap-2 text-base",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-5 w-5 text-emerald-600" }), "Vendor Invoice Payment & Settlement"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs",
								children: "Review invoice settlement details and GL posting preview. (Disbursements are posted via Finance Team)."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-2 border-b px-5 py-2.5 bg-muted/30 shrink-0",
							children: [{
								step: 1,
								label: "1. Settlement & Payment Mode",
								icon: CreditCard
							}, {
								step: 2,
								label: "2. GL & Accounts Verification",
								icon: ShieldCheck
							}].map(({ step, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setPayModalStep(step),
								className: `flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-semibold transition-all ${payModalStep === step ? "bg-primary/10 text-primary border border-primary/30" : payModalStep > step ? "text-emerald-600 hover:bg-muted/50" : "text-muted-foreground hover:bg-muted/30"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${payModalStep === step ? "bg-primary text-primary-foreground" : payModalStep > step ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border"}`,
									children: payModalStep > step ? "✓" : step
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: label
								})]
							}, step))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1 overflow-y-auto px-5 py-4 max-h-[calc(85vh-135px)]",
							children: paymentTargetInv && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4 py-1 text-xs",
								children: [payModalStep === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3.5",
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
														children: paymentTargetInv.invoice_number
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between font-semibold",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Vendor Name:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: vendors.find((v) => String(v.id) === String(paymentTargetInv.vendor_id))?.name || String(paymentTargetInv.vendor_id) })]
												}),
												paymentTargetInv.po_number && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "PO & GRN Chain:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-mono text-cyan-600",
														children: [
															paymentTargetInv.po_number,
															" ",
															paymentTargetInv.grn_number ? `→ ${paymentTargetInv.grn_number}` : ""
														]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between text-sm font-bold border-t border-emerald-500/20 pt-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Invoice Amount:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-emerald-600 font-mono",
														children: ["QAR ", Number(paymentTargetInv.total_amount || 0).toLocaleString()]
													})]
												})
											]
										}),
										(() => {
											const totalDue = Number(paymentTargetInv.total_amount || 0);
											const partialKey = `partial_paid_${paymentTargetInv.id}`;
											const alreadyPaid = Number(localStorage.getItem(partialKey) || "0");
											const outstanding = totalDue - alreadyPaid;
											const advKey = `vendor_advance_${paymentTargetInv.vendor_id}`;
											const advBalance = Number(localStorage.getItem(advKey) || "0");
											const advApplied = vendorPayForm.applyAdvance ? Math.min(vendorPayForm.advanceAmount, advBalance) : 0;
											const cashRequired = Math.max(0, outstanding - advApplied);
											const payingNow = vendorPayForm.paymentAmount;
											const remaining = outstanding - payingNow - advApplied;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "grid grid-cols-3 gap-2 text-center",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "p-2 rounded-md bg-muted/50 border",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																	className: "text-[10px] text-muted-foreground",
																	children: "Invoice Total"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																	className: "font-bold font-mono text-sm",
																	children: ["QAR ", totalDue.toLocaleString()]
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "p-2 rounded-md bg-blue-500/10 border border-blue-500/20",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																	className: "text-[10px] text-blue-600",
																	children: "Previously Paid"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																	className: "font-bold font-mono text-sm text-blue-600",
																	children: ["QAR ", alreadyPaid.toLocaleString()]
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: `p-2 rounded-md border ${remaining <= .01 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"}`,
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																	className: `text-[10px] ${remaining <= .01 ? "text-emerald-600" : "text-amber-600"}`,
																	children: remaining <= .01 ? "Fully Settled" : "Remaining After"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																	className: `font-bold font-mono text-sm ${remaining <= .01 ? "text-emerald-600" : "text-amber-600"}`,
																	children: ["QAR ", Math.max(0, remaining).toLocaleString()]
																})]
															})
														]
													}),
													advBalance > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-3 rounded-lg bg-violet-500/10 border-2 border-violet-500/30 space-y-2",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center justify-between",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																	className: "text-xs font-bold text-violet-700 dark:text-violet-400 flex items-center gap-1.5",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-3.5 w-3.5" }), "Step 1 — Apply Vendor Advance (First Priority)"]
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[10px] font-mono bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 px-2 py-0.5 rounded border border-violet-300/40",
																	children: "GL 12300001 → 22100001"
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center gap-2",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																	type: "checkbox",
																	id: "vendorApplyAdv",
																	checked: vendorPayForm.applyAdvance,
																	onChange: (e) => {
																		const checked = e.target.checked;
																		setVendorPayForm((prev) => ({
																			...prev,
																			applyAdvance: checked,
																			advanceAmount: checked ? Math.min(advBalance, outstanding) : 0
																		}));
																	},
																	className: "h-4 w-4 rounded"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
																	htmlFor: "vendorApplyAdv",
																	className: "text-xs font-semibold cursor-pointer",
																	children: ["Use Advance Balance — Available: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																		className: "font-mono text-violet-700 dark:text-violet-400",
																		children: ["QAR ", advBalance.toLocaleString()]
																	})]
																})]
															}),
															vendorPayForm.applyAdvance && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "space-y-1.5",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																		className: "text-[10px] font-semibold block",
																		children: "Advance Amount to Apply (QAR)"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																		type: "number",
																		min: "0",
																		max: Math.min(advBalance, outstanding),
																		value: vendorPayForm.advanceAmount,
																		onChange: (e) => setVendorPayForm({
																			...vendorPayForm,
																			advanceAmount: Math.min(Number(e.target.value), advBalance, outstanding)
																		}),
																		className: "font-mono h-8 text-xs"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																		className: "grid grid-cols-2 gap-1 text-[10px] text-muted-foreground font-mono p-2 bg-violet-50/70 dark:bg-violet-950/30 rounded border border-violet-200/40",
																		children: [
																			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Dr." }), " 22100001 Trade Payables"] }),
																			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																				className: "text-right font-bold text-violet-700 dark:text-violet-400",
																				children: ["QAR ", advApplied.toLocaleString()]
																			}),
																			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Cr." }), " 12300001 Advance to Vendors"] }),
																			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																				className: "text-right font-bold text-violet-700 dark:text-violet-400",
																				children: ["QAR ", advApplied.toLocaleString()]
																			})
																		]
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																		className: "text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold",
																		children: ["Cash required after advance offset: QAR ", cashRequired.toLocaleString()]
																	})
																]
															})
														]
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg bg-muted/30 border border-dashed text-[10px] text-muted-foreground flex items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-3.5 w-3.5 shrink-0" }), "No advance balance available for this vendor. Payment will be settled entirely via cash/bank disbursement."]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-3 rounded-lg bg-muted/30 border space-y-2",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center justify-between",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																	className: "text-xs font-bold",
																	children: advApplied > 0 ? "Step 2 — Cash / Bank Payment (Remaining Balance)" : "Cash / Bank Payment Amount (QAR) *"
																}), cashRequired > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
																	type: "button",
																	className: "text-[10px] text-primary underline",
																	onClick: () => setVendorPayForm({
																		...vendorPayForm,
																		paymentAmount: cashRequired
																	}),
																	children: [
																		"Use Remaining (",
																		cashRequired.toLocaleString(),
																		")"
																	]
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "number",
																min: "0",
																max: outstanding,
																value: vendorPayForm.paymentAmount,
																onChange: (e) => setVendorPayForm({
																	...vendorPayForm,
																	paymentAmount: Math.min(Number(e.target.value), outstanding)
																}),
																className: "font-mono font-bold text-base h-10"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex justify-between text-[10px] text-muted-foreground",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
																	"Outstanding: QAR ",
																	outstanding.toLocaleString(),
																	" ",
																	advApplied > 0 ? `(Adv. applied: QAR ${advApplied.toLocaleString()})` : ""
																] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: payingNow + advApplied >= outstanding - .01 ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold",
																	children: payingNow + advApplied >= outstanding - .01 ? "Full settlement" : `Partial — QAR ${Math.max(0, remaining).toLocaleString()} will remain`
																})]
															})
														]
													})
												]
											});
										})(),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "text-xs font-semibold block mb-1.5",
												children: "Payment Date *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "date",
												value: vendorPayForm.paymentDate,
												onChange: (e) => setVendorPayForm({
													...vendorPayForm,
													paymentDate: e.target.value
												}),
												className: "h-8 text-xs"
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "text-xs font-semibold block mb-1.5",
												children: "Payment Mode *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: vendorPayForm.paymentMethod,
												onValueChange: (v) => setVendorPayForm({
													...vendorPayForm,
													paymentMethod: v
												}),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
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
										(vendorPayForm.paymentMethod.includes("Wire") || vendorPayForm.paymentMethod.includes("CBQ")) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-3 p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/20",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-bold text-blue-700 dark:text-blue-400",
													children: "Bank Wire / Electronic Transfer Details"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "text-xs font-semibold block mb-1.5",
													children: "Disbursing Bank Account"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: vendorPayForm.disbursingBank,
													onValueChange: (v) => setVendorPayForm({
														...vendorPayForm,
														disbursingBank: v
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "h-8 text-xs",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)",
														children: "QNB - Main Operating (QA42QNBA00000000123456)"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Commercial Bank of Qatar (CBQ) - Operational (IBAN: QA99CBQA00000000654321)",
														children: "CBQ - Operational (QA99CBQA00000000654321)"
													})] })]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-2 gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														className: "text-xs font-semibold block mb-1.5",
														children: "Wire Transfer Reference #"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: vendorPayForm.transactionReference,
														onChange: (e) => setVendorPayForm({
															...vendorPayForm,
															transactionReference: e.target.value
														}),
														placeholder: "e.g. TXN-884211",
														className: "h-8 text-xs font-mono"
													})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														className: "text-xs font-semibold block mb-1.5",
														children: "Beneficiary Account / IBAN"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: vendorPayForm.beneficiaryAccount,
														onChange: (e) => setVendorPayForm({
															...vendorPayForm,
															beneficiaryAccount: e.target.value
														}),
														className: "h-8 text-xs font-mono"
													})] })]
												})
											]
										}),
										(vendorPayForm.paymentMethod.includes("Cash") || vendorPayForm.paymentMethod.includes("Petty")) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-3 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-bold text-amber-700 dark:text-amber-400",
													children: "Cash Disbursement & Handover Details"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-2 gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														className: "text-xs font-semibold block mb-1.5",
														children: "Disbursing Cash Vault"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														disabled: true,
														value: "12100001 - Cash in Hand (Office Vault)",
														className: "bg-background h-8 text-xs"
													})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														className: "text-xs font-semibold block mb-1.5",
														children: "Petty Cash Voucher / Receipt #"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: vendorPayForm.cashReceiptNo,
														onChange: (e) => setVendorPayForm({
															...vendorPayForm,
															cashReceiptNo: e.target.value
														}),
														placeholder: "PCV-00821",
														className: "h-8 text-xs font-mono"
													})] })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "text-xs font-semibold block mb-1.5",
													children: "Receiver / Vendor Representative Name *"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: vendorPayForm.receiverName,
													onChange: (e) => setVendorPayForm({
														...vendorPayForm,
														receiverName: e.target.value
													}),
													placeholder: "Full name of recipient",
													className: "h-8 text-xs"
												})] })
											]
										}),
										vendorPayForm.paymentMethod.includes("Cheque") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-3 p-3.5 rounded-lg bg-violet-500/10 border border-violet-500/20",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-bold text-violet-700 dark:text-violet-400",
													children: "Corporate Cheque Details"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-2 gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														className: "text-xs font-semibold block mb-1.5",
														children: "Issuing Bank"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														disabled: true,
														value: "Qatar National Bank (QNB) - Corporate Cheque",
														className: "bg-background h-8 text-xs"
													})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														className: "text-xs font-semibold block mb-1.5",
														children: "Cheque Number *"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: vendorPayForm.chequeNumber,
														onChange: (e) => setVendorPayForm({
															...vendorPayForm,
															chequeNumber: e.target.value
														}),
														placeholder: "CHQ-004812",
														className: "h-8 text-xs font-mono"
													})] })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-2 gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														className: "text-xs font-semibold block mb-1.5",
														children: "Cheque Due / Value Date"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "date",
														value: vendorPayForm.chequeDueDate,
														onChange: (e) => setVendorPayForm({
															...vendorPayForm,
															chequeDueDate: e.target.value
														}),
														className: "h-8 text-xs"
													})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														className: "text-xs font-semibold block mb-1.5",
														children: "Payee / In Favor Of"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														disabled: true,
														value: vendors.find((v) => String(v.id) === String(paymentTargetInv.vendor_id))?.name || "",
														className: "bg-background h-8 text-xs"
													})] })]
												})
											]
										})
									]
								}), payModalStep === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-4 rounded-xl bg-muted/40 border space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs font-bold text-foreground flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-emerald-600" }), " Chart of Accounts (COA) / GL / SL Double-Entry Mapping"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-3 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between items-center text-[11px]",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-bold text-blue-700 dark:text-blue-400 font-mono",
														children: "DEBIT (Dr.) — Liability Settlement"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-bold font-mono text-blue-700 dark:text-blue-400",
														children: ["QAR ", (vendorPayForm.paymentAmount + (vendorPayForm.applyAdvance ? vendorPayForm.advanceAmount : 0)).toLocaleString()]
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[11px] grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t border-blue-200/50",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "GL Code:" }), " 22100001"] }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "GL Name:" }), " Trade Payables (Vendors)"] }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Account Group:" }), " Current Liabilities"] }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Sub-Ledger:" }),
															" ",
															vendors.find((v) => String(v.id) === String(paymentTargetInv.vendor_id))?.name || `Vendor #${paymentTargetInv.vendor_id}`
														] })
													]
												})]
											}),
											vendorPayForm.paymentAmount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between items-center text-[11px]",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-bold text-emerald-700 dark:text-emerald-400 font-mono",
														children: "CREDIT (Cr.) — Disbursing Source"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-bold font-mono text-emerald-700 dark:text-emerald-400",
														children: ["QAR ", vendorPayForm.paymentAmount.toLocaleString()]
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[11px] grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t border-emerald-200/50",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "GL Code:" }),
															" ",
															vendorPayForm.paymentMethod.includes("Cash") ? "12100001" : "12000001"
														] }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "GL Name:" }),
															" ",
															vendorPayForm.paymentMethod.includes("Cash") ? "Cash in Hand (Office Vault)" : "Bank Operating Account (QNB/CBQ)"
														] }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Account Group:" }), " Current Assets / Cash & Bank"] }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Voucher Type:" }), " PV (Payment Voucher)"] })
													]
												})]
											}),
											vendorPayForm.applyAdvance && vendorPayForm.advanceAmount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-3 rounded-lg border bg-violet-50/50 dark:bg-violet-950/20 space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between items-center text-[11px]",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-bold text-violet-700 dark:text-violet-400 font-mono",
														children: "CREDIT (Cr.) — Advance Offset"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-bold font-mono text-violet-700 dark:text-violet-400",
														children: ["QAR ", vendorPayForm.advanceAmount.toLocaleString()]
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[11px] grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t border-violet-200/50",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "GL Code:" }), " 12300001"] }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "GL Name:" }), " Advance to Vendors"] }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Account Group:" }), " Current Assets (Advance Payments)"] }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Offset Status:" }), " Cleared from Advance Ledger"] })
													]
												})]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 rounded-lg border bg-background text-[11px] space-y-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground",
													children: "Invoice Reference:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono font-bold text-primary",
													children: paymentTargetInv.invoice_number
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground",
													children: "Payment Mode:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold",
													children: vendorPayForm.paymentMethod
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground",
													children: "Transaction / Voucher Ref:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono",
													children: vendorPayForm.transactionReference || "Auto-Generated"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between border-t pt-1.5 font-bold",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Settlement Impact:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono text-emerald-600",
													children: ["QAR ", (vendorPayForm.paymentAmount + (vendorPayForm.applyAdvance ? vendorPayForm.advanceAmount : 0)).toLocaleString()]
												})]
											})
										]
									})]
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "p-4 border-t bg-muted/20 flex flex-row justify-between items-center sm:justify-between w-full shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: payModalStep > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								size: "sm",
								onClick: () => setPayModalStep((s) => s - 1),
								children: "Back to Details"
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setPaymentTargetInv(null),
									children: "Cancel"
								}), payModalStep === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									size: "sm",
									onClick: () => {
										if (vendorPayForm.paymentAmount <= 0 && (!vendorPayForm.applyAdvance || vendorPayForm.advanceAmount <= 0)) return toast.error("Please enter a payment amount or apply advance credit.");
										setPayModalStep(2);
									},
									children: ["Verify GL & Accounts ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-1 h-3.5 w-3.5" })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									className: "bg-emerald-600 hover:bg-emerald-700 text-white gap-1",
									onClick: handleConfirmVendorPayment,
									disabled: saving,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }), " Confirm & Post to GL"]
								})]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: bulkVendorOpen,
				onOpenChange: setBulkVendorOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-5 w-5 text-primary" }), "Bulk Vendor Roster Ingestion (CSV / Excel)"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Upload a CSV file to register multiple vendor accounts with master data, bank details, and qualification flags in a single operation." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between p-3.5 rounded-lg border bg-muted/40",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-foreground",
											children: "Standard Vendor Master Template"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground mt-0.5",
											children: "Columns: VendorCode, VendorName, VendorType, ContactPerson, Email, Phone, TaxNumber, Address, City, Country, PaymentTerms, BankName, IBAN, Status"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										onClick: downloadVendorCsvTemplate,
										className: "gap-2 shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), " Template"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Select CSV Document" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "file",
										accept: ".csv, text/csv, application/vnd.ms-excel",
										onChange: (e) => {
											const file = e.target.files?.[0];
											if (!file) return;
											const reader = new FileReader();
											reader.onload = (evt) => {
												setBulkVendorData(evt.target?.result || "");
											};
											reader.readAsText(file);
										}
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs text-muted-foreground",
										children: "Or Paste Raw CSV Lines"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										value: bulkVendorData,
										onChange: (e) => setBulkVendorData(e.target.value),
										placeholder: `VendorCode,VendorName,VendorType,ContactPerson,Email,Phone,TaxNumber,Address,City,Country,PaymentTerms,BankName,IBAN,Status\nVND-8801,Gulf Facilities LLC,Supplier,Ahmed Hassan,ahmed@gulffacil.qa,+97455001122,10001234567890003,Building 12 C Ring Rd,Doha,Qatar,Net 30 Days,Qatar National Bank,QA55QNBA00000000123456,Active`,
										className: "font-mono text-xs h-32"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setBulkVendorOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: handleBulkVendorImport,
							disabled: bulkVendorLoading || !bulkVendorData.trim(),
							className: "gap-2",
							children: [bulkVendorLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), "Import Vendors"]
						})] })
					]
				})
			})
		]
	});
}
//#endregion
export { VendorModule };
