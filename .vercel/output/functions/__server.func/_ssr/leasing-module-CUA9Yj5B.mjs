import { i as __toESM } from "../_runtime.mjs";
import { B as supabase, H as updateAsset, m as fetchAssets } from "./supabase-y7n1teoy.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $t as CircleCheck, At as FileSpreadsheet, Cn as BadgeCheck, Gt as Clock, H as Receipt, Ht as CreditCard, I as Search, M as ShieldAlert, Mt as FileCheck, Nt as FileCheckCorner, Ot as FileUp, Pt as Eye, Rt as Download, Sn as Banknote, V as RefreshCw, W as Printer, Wt as CloudUpload, Yt as CircleX, an as ChevronLeft, ct as LoaderCircle, d as UserPlus, f as UserCheck, gn as Building2, h as TriangleAlert, ht as KeyRound, in as ChevronRight, j as ShieldCheck, jt as FilePenLine, kt as FileText, mt as Key, o as Wallet, ot as LogOut, p as Upload, pn as CalendarClock, q as Percent, qt as ClipboardCheck, s as Users, st as Lock, tn as CircleAlert, yn as Bell, z as RotateCcw, zt as DoorOpen } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { i as DropdownMenuTrigger, n as DropdownMenuCheckboxItem, r as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu-CqJvCzVX.mjs";
import { l as useRouterState, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { t as SearchableSelect } from "./searchable-select-CfxQoPsI.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-C7RsdMLq.mjs";
import { t as DynamicMastersService } from "./dynamic-masters-service-4scH-jHP.mjs";
import { n as utils, r as writeFileSync, t as readSync } from "../_libs/xlsx.mjs";
import { t as Checkbox } from "./auth-guards-EcJq1CIb.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DJOO1b-0.mjs";
import { t as ExcelImportEmbedded } from "./excel-import-embedded-CrY5_n7F.mjs";
import { d as resolveAccountingAccounts, l as postRentInvoiceReversal, n as postGuaranteeCheque, r as postLeaseDepositReceipt, t as normalizeUuid$1, u as postVoucher } from "./posting-engine-Gd7ZPbDa.mjs";
import { n as useFinanceStore } from "./finance-store-BZbkpJxf.mjs";
import { n as getCurrentISTDate } from "./date-utils-BA7FZwNI.mjs";
import { n as useAppData } from "./app-data-context-DAteLot6.mjs";
import { a as collectSecurityDeposit, c as returnPdc, s as receivePdc, t as ReceiptModal } from "./receipt-modal-h072ywYO.mjs";
import { O as View, _ as Page, o as Document, w as Text } from "../_libs/@react-pdf/image+[...].mjs";
import { n as pdf, t as StyleSheet } from "../_libs/react-pdf__renderer.mjs";
import { a as PaginationNext, i as PaginationLink, n as PaginationContent, o as PaginationPrevious, r as PaginationItem, t as Pagination } from "./pagination-Mm0k59kY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leasing-module-CUA9Yj5B.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_BANKS = [
	"Qatar National Bank (QNB)",
	"Doha Bank",
	"Commercial Bank of Qatar (CBQ)",
	"Qatar Islamic Bank (QIB)",
	"Masraf Al Rayan",
	"Ahli Bank",
	"International Bank of Qatar (IBQ)",
	"Dukhan Bank",
	"Qatar International Islamic Bank (QIIB)",
	"HSBC Bank Middle East",
	"Standard Chartered Bank",
	"Arab Bank",
	"BNP Paribas",
	"Other Bank"
];
var DEFAULT_DEPOSIT_TYPES = [
	"Security Deposit",
	"Kahramaa / Electricity Utility Deposit",
	"Water Utility Deposit",
	"Holding Advance Fee",
	"Maintenance Deposit",
	"Fit-out / Key Deposit",
	"Other Guarantee"
];
var DEFAULT_PAYMENT_METHODS = [
	"Bank Transfer",
	"Cheque / PDC",
	"Cash",
	"Credit Card / POS",
	"Direct Debit",
	"Corporate Draft"
];
function BulkPdcDepositModal({ open, onOpenChange, type, onSuccess, existingLeases = [] }) {
	const fileInputRef = (0, import_react.useRef)(null);
	const [selectedOperation, setSelectedOperation] = (0, import_react.useState)("CREATE");
	const [currentStep, setCurrentStep] = (0, import_react.useState)("upload");
	const [previewTab, setPreviewTab] = (0, import_react.useState)("ALL");
	const [previewSearch, setPreviewSearch] = (0, import_react.useState)("");
	const [deleteConfirmed, setDeleteConfirmed] = (0, import_react.useState)(false);
	const [isProcessing, setIsProcessing] = (0, import_react.useState)(false);
	const [isParsing, setIsParsing] = (0, import_react.useState)(false);
	const [isDownloadingTemplate, setIsDownloadingTemplate] = (0, import_react.useState)(false);
	const [inspectRow, setInspectRow] = (0, import_react.useState)(null);
	const [executionStats, setExecutionStats] = (0, import_react.useState)({
		total: 0,
		success: 0,
		errors: 0
	});
	const bankOptions = (0, import_react.useMemo)(() => {
		try {
			const stored = DynamicMastersService.getMasterStringOptions("bank_name");
			return stored && stored.length > 0 ? stored : DEFAULT_BANKS;
		} catch {
			return DEFAULT_BANKS;
		}
	}, []);
	const depositTypeOptions = (0, import_react.useMemo)(() => {
		try {
			const stored = DynamicMastersService.getMasterStringOptions("deposit_type");
			return stored && stored.length > 0 ? stored : DEFAULT_DEPOSIT_TYPES;
		} catch {
			return DEFAULT_DEPOSIT_TYPES;
		}
	}, []);
	const initialPdcRows = (0, import_react.useMemo)(() => [
		{
			id: "pdc-row-1",
			slNo: "2",
			unitName: "Wakra - 01 - Flat02",
			propertyCode: "Wakra - 01",
			unitNameCheck: "Wakra-01-Flat02",
			propertyCodeCheck: "Wakra-01",
			tenantName: "Mr. Shailesh Lanjewar",
			chequeNumber: "01000103",
			bank: "Doha Bank",
			maturityDate: "2026-08-05",
			amount: "4700",
			rentFromDate: "2026-07-15",
			rentToDate: "2026-08-14",
			status: "READY"
		},
		{
			id: "pdc-row-2",
			slNo: "3",
			unitName: "Wakra - 01 - Flat02",
			propertyCode: "Wakra - 01",
			unitNameCheck: "Wakra-01-Flat02",
			propertyCodeCheck: "Wakra-01",
			tenantName: "Mr. Shailesh Lanjewar",
			chequeNumber: "01000105",
			bank: "Doha Bank",
			maturityDate: "2026-09-05",
			amount: "4700",
			rentFromDate: "2026-08-15",
			rentToDate: "2026-09-14",
			status: "READY"
		},
		{
			id: "pdc-row-3",
			slNo: "4",
			unitName: "Wakra - 01 - Flat02",
			propertyCode: "Wakra - 01",
			unitNameCheck: "Wakra-01-Flat02",
			propertyCodeCheck: "Wakra-01",
			tenantName: "Mr. Shailesh Lanjewar",
			chequeNumber: "01000106",
			bank: "Doha Bank",
			maturityDate: "2026-10-05",
			amount: "4700",
			rentFromDate: "2026-09-15",
			rentToDate: "2026-10-14",
			status: "READY"
		},
		{
			id: "pdc-row-4",
			slNo: "5",
			unitName: "Wakra - 01 - Flat02",
			propertyCode: "Wakra - 01",
			unitNameCheck: "Wakra-01-Flat02",
			propertyCodeCheck: "Wakra-01",
			tenantName: "Mr. Shailesh Lanjewar",
			chequeNumber: "01000107",
			bank: "Doha Bank",
			maturityDate: "2026-11-05",
			amount: "4700",
			rentFromDate: "2026-10-15",
			rentToDate: "2026-11-14",
			status: "READY"
		},
		{
			id: "pdc-row-5",
			slNo: "26",
			unitName: "Wakra - 01 - Flat06",
			propertyCode: "Wakra - 01",
			unitNameCheck: "Wakra-01-Flat06",
			propertyCodeCheck: "Wakra-01",
			tenantName: "Mr. Salman Sajjad",
			chequeNumber: "01000180",
			bank: "CBQ",
			maturityDate: "2026-08-01",
			amount: "5700",
			rentFromDate: "2026-07-25",
			rentToDate: "2026-08-24",
			status: "READY"
		},
		{
			id: "pdc-row-6",
			slNo: "27",
			unitName: "Wakra - 01 - Flat06",
			propertyCode: "Wakra - 01",
			unitNameCheck: "Wakra-01-Flat06",
			propertyCodeCheck: "Wakra-01",
			tenantName: "Mr. Salman Sajjad",
			chequeNumber: "01000181",
			bank: "CBQ",
			maturityDate: "2026-09-01",
			amount: "5700",
			rentFromDate: "2026-08-25",
			rentToDate: "2026-09-24",
			status: "READY"
		}
	], []);
	const initialDepositRows = (0, import_react.useMemo)(() => [
		{
			id: "dep-row-1",
			slNo: "1",
			unitName: "Wakra - 01 - Flat02",
			propertyCode: "Wakra - 01",
			unitNameCheck: "Wakra-01-Flat02",
			propertyCodeCheck: "Wakra-01",
			tenantName: "Mr. Shailesh Lanjewar",
			receiptNumber: "RV-DEP-801",
			depositType: "Security Deposit",
			paymentMethod: "Bank Transfer",
			bankOrReference: "TRF-DOHA-44910",
			amount: "4700",
			depositDate: "2026-07-15",
			remarks: "1 Month Refundable Security Deposit",
			status: "READY"
		},
		{
			id: "dep-row-2",
			slNo: "2",
			unitName: "Wakra - 01 - Flat02",
			propertyCode: "Wakra - 01",
			unitNameCheck: "Wakra-01-Flat02",
			propertyCodeCheck: "Wakra-01",
			tenantName: "Mr. Shailesh Lanjewar",
			receiptNumber: "RV-DEP-802",
			depositType: "Kahramaa / Electricity Utility Deposit",
			paymentMethod: "Cash",
			bankOrReference: "CASH-VAULT-01",
			amount: "1500",
			depositDate: "2026-07-15",
			remarks: "Kahramaa Meter Guarantee",
			status: "READY"
		},
		{
			id: "dep-row-3",
			slNo: "3",
			unitName: "Wakra - 01 - Flat06",
			propertyCode: "Wakra - 01",
			unitNameCheck: "Wakra-01-Flat06",
			propertyCodeCheck: "Wakra-01",
			tenantName: "Mr. Salman Sajjad",
			receiptNumber: "RV-DEP-803",
			depositType: "Security Deposit",
			paymentMethod: "Cheque / PDC",
			bankOrReference: "CBQ-CHQ-90021",
			amount: "5700",
			depositDate: "2026-07-25",
			remarks: "Standard Holding Guarantee",
			status: "READY"
		}
	], []);
	const [pdcRows, setPdcsRows] = (0, import_react.useState)(initialPdcRows);
	const [depositRows, setDepositRows] = (0, import_react.useState)(initialDepositRows);
	const [uploadedFileName, setUploadedFileName] = (0, import_react.useState)(null);
	const cleanNormalize = (val) => (val || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
	const resetUploadState = () => {
		setUploadedFileName(null);
		setCurrentStep("upload");
		setDeleteConfirmed(false);
		setPreviewTab("ALL");
		setPreviewSearch("");
		if (fileInputRef.current) fileInputRef.current.value = "";
	};
	const handleOperationChange = (op) => {
		setSelectedOperation(op);
		resetUploadState();
	};
	const summary = (0, import_react.useMemo)(() => {
		const rows = type === "PDC" ? pdcRows : depositRows;
		return {
			total: rows.length,
			valid: rows.filter((r) => r.status === "READY").length,
			warnings: rows.filter((r) => r.status === "WARNING").length,
			errors: rows.filter((r) => r.status === "ERROR").length
		};
	}, [
		type,
		pdcRows,
		depositRows
	]);
	const filteredRecords = (0, import_react.useMemo)(() => {
		if (type === "PDC") return pdcRows.filter((r) => {
			if (previewTab === "VALID" && r.status !== "READY") return false;
			if (previewTab === "WARNING" && r.status !== "WARNING") return false;
			if (previewTab === "ERROR" && r.status !== "ERROR") return false;
			if (!previewSearch.trim()) return true;
			const q = previewSearch.toLowerCase();
			return r.unitName.toLowerCase().includes(q) || r.propertyCode.toLowerCase().includes(q) || r.tenantName.toLowerCase().includes(q) || r.chequeNumber.toLowerCase().includes(q) || r.bank.toLowerCase().includes(q);
		});
		else return depositRows.filter((r) => {
			if (previewTab === "VALID" && r.status !== "READY") return false;
			if (previewTab === "WARNING" && r.status !== "WARNING") return false;
			if (previewTab === "ERROR" && r.status !== "ERROR") return false;
			if (!previewSearch.trim()) return true;
			const q = previewSearch.toLowerCase();
			return r.unitName.toLowerCase().includes(q) || r.propertyCode.toLowerCase().includes(q) || r.tenantName.toLowerCase().includes(q) || r.receiptNumber.toLowerCase().includes(q) || r.depositType.toLowerCase().includes(q) || r.paymentMethod.toLowerCase().includes(q);
		});
	}, [
		type,
		pdcRows,
		depositRows,
		previewTab,
		previewSearch
	]);
	const handleDownloadTemplate = async () => {
		try {
			setIsDownloadingTemplate(true);
			const wb = utils.book_new();
			if (type === "PDC") {
				const headers = [
					"SL.No",
					"Unit Name",
					"Property Code",
					"Unit Name Check",
					"Property Code Check",
					"Tenant Name",
					"Cheque Number",
					"Bank",
					"Maturity Date",
					"Amount",
					"Rent From Date",
					"Rent To Date"
				];
				const sampleData = pdcRows.map((r) => [
					r.slNo,
					r.unitName,
					r.propertyCode,
					r.unitNameCheck || r.unitName.replace(/\s+/g, "-"),
					r.propertyCodeCheck || r.propertyCode.replace(/\s+/g, "-"),
					r.tenantName,
					r.chequeNumber,
					r.bank,
					r.maturityDate,
					r.amount,
					r.rentFromDate,
					r.rentToDate
				]);
				const ws = utils.aoa_to_sheet([headers, ...sampleData]);
				ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 4, 18) }));
				utils.book_append_sheet(wb, ws, `PDC_${selectedOperation}`);
				const wsInst = utils.aoa_to_sheet([
					["Bulk PDC Management Specification Guide"],
					["Module:", "Leasing - Bulk PDC Register"],
					["Operation Mode:", selectedOperation],
					["Date Format:", "YYYY-MM-DD (e.g. 2026-08-05) or DD.MM.YYYY"],
					["Bank Options:", bankOptions.join(", ")],
					[],
					["RULES & INTEGRITY CHECKS:"],
					["1. Primary Key:", "Cheque Number is mandatory and uniquely identifies each PDC."],
					["2. Unit Name Check:", "Double check field matches normalized Unit Name."],
					["3. Property Code Check:", "Double check field matches Property Code."],
					["4. For CREATE:", "Adds new cheque schedules linked to tenant lease."],
					["5. For UPDATE:", "Patches maturity, amount, bank, or rent period."],
					["6. For DELETE:", "De-registers PDCs from active holding register."]
				]);
				utils.book_append_sheet(wb, wsInst, "Instructions");
				writeFileSync(wb, `Bulk_PDC_${selectedOperation}_Template.xlsx`);
			} else {
				const headers = [
					"SL.No",
					"Unit Name",
					"Property Code",
					"Unit Name Check",
					"Property Code Check",
					"Tenant Name",
					"Receipt Number",
					"Deposit Type",
					"Payment Method",
					"Bank Or Reference",
					"Amount",
					"Deposit Date",
					"Remarks"
				];
				const sampleData = depositRows.map((r) => [
					r.slNo,
					r.unitName,
					r.propertyCode,
					r.unitNameCheck || r.unitName.replace(/\s+/g, "-"),
					r.propertyCodeCheck || r.propertyCode.replace(/\s+/g, "-"),
					r.tenantName,
					r.receiptNumber,
					r.depositType,
					r.paymentMethod,
					r.bankOrReference,
					r.amount,
					r.depositDate,
					r.remarks
				]);
				const ws = utils.aoa_to_sheet([headers, ...sampleData]);
				ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 4, 18) }));
				utils.book_append_sheet(wb, ws, `DEPOSIT_${selectedOperation}`);
				const wsInst = utils.aoa_to_sheet([
					["Bulk Lease Deposits Specification Guide"],
					["Module:", "Leasing - Security & Utility Deposits"],
					["Operation Mode:", selectedOperation],
					["Deposit Types:", depositTypeOptions.join(", ")],
					["Payment Methods:", DEFAULT_PAYMENT_METHODS.join(", ")],
					[],
					["RULES & INTEGRITY CHECKS:"],
					["1. Receipt Number:", "Unique identifier for the deposit voucher."],
					["2. Accounting Impact:", "Creates/Updates GL liability entries (Security Deposit Liability 21500)."],
					["3. For DELETE:", "Voids unallocated or unrefunded deposit vouchers."]
				]);
				utils.book_append_sheet(wb, wsInst, "Instructions");
				writeFileSync(wb, `Bulk_Deposit_${selectedOperation}_Template.xlsx`);
			}
			toast.success(`Downloaded official ${type} (${selectedOperation}) Excel template!`);
		} catch (e) {
			toast.error("Failed to generate template: " + e.message);
		} finally {
			setIsDownloadingTemplate(false);
		}
	};
	const handleFileUpload = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploadedFileName(file.name);
		setIsParsing(true);
		const reader = new FileReader();
		reader.onload = (evt) => {
			try {
				const workbook = readSync(new Uint8Array(evt.target?.result), { type: "array" });
				const sheetName = workbook.SheetNames[0];
				const sheet = workbook.Sheets[sheetName];
				const json = utils.sheet_to_json(sheet, { header: 1 });
				if (json.length < 2) {
					toast.error("Excel sheet is empty or missing data rows.");
					setIsParsing(false);
					return;
				}
				const dataRows = json.slice(1).filter((r) => r.length > 0 && r[0] != null);
				if (type === "PDC") {
					const parsed = dataRows.map((row, idx) => {
						const slNo = row[0] || idx + 1;
						const unitName = String(row[1] || `Unit-${idx + 1}`).trim();
						const propertyCode = String(row[2] || "Wakra - 01").trim();
						const unitNameCheck = String(row[3] || unitName).trim();
						const propertyCodeCheck = String(row[4] || propertyCode).trim();
						const tenantName = String(row[5] || "Tenant").trim();
						const chequeNumber = String(row[6] || `CHQ-${idx + 100}`).trim();
						const bank = String(row[7] || "Doha Bank").trim();
						const maturityDate = String(row[8] || "2026-08-05").trim().replace(/\./g, "-");
						const amount = String(row[9] || "4700").replace(/,/g, "").trim();
						const rentFromDate = String(row[10] || "2026-07-15").trim().replace(/\./g, "-");
						const rentToDate = String(row[11] || "2026-08-14").trim().replace(/\./g, "-");
						const unitClean = cleanNormalize(unitName);
						const unitCheckClean = cleanNormalize(unitNameCheck);
						const propClean = cleanNormalize(propertyCode);
						const propCheckClean = cleanNormalize(propertyCodeCheck);
						let status = "READY";
						let errorMessage = "";
						if (!chequeNumber) {
							status = "ERROR";
							errorMessage = "Cheque Number is mandatory.";
						} else if (unitClean !== unitCheckClean) {
							status = "WARNING";
							errorMessage = `Unit Name mismatch: "${unitName}" vs check "${unitNameCheck}".`;
						} else if (propClean !== propCheckClean) {
							status = "WARNING";
							errorMessage = `Property Code mismatch: "${propertyCode}" vs check "${propertyCodeCheck}".`;
						}
						return {
							id: `uploaded-pdc-${idx}-${Date.now()}`,
							slNo,
							unitName,
							propertyCode,
							unitNameCheck,
							propertyCodeCheck,
							tenantName,
							chequeNumber,
							bank,
							maturityDate,
							amount: parseFloat(amount) || 0,
							rentFromDate,
							rentToDate,
							status,
							errorMessage
						};
					});
					setPdcsRows(parsed);
					setCurrentStep("preview");
					toast.success(`Validated ${parsed.length} PDC rows: ${parsed.filter((r) => r.status === "READY").length} Ready`);
				} else {
					const parsed = dataRows.map((row, idx) => {
						const slNo = row[0] || idx + 1;
						const unitName = String(row[1] || `Unit-${idx + 1}`).trim();
						const propertyCode = String(row[2] || "Wakra - 01").trim();
						const unitNameCheck = String(row[3] || unitName).trim();
						const propertyCodeCheck = String(row[4] || propertyCode).trim();
						const tenantName = String(row[5] || "Tenant").trim();
						const receiptNumber = String(row[6] || `RV-DEP-${idx + 100}`).trim();
						const depositType = String(row[7] || "Security Deposit").trim();
						const paymentMethod = String(row[8] || "Bank Transfer").trim();
						const bankOrReference = String(row[9] || "REF-001").trim();
						const amount = String(row[10] || "5000").replace(/,/g, "").trim();
						const depositDate = String(row[11] || "2026-07-15").trim().replace(/\./g, "-");
						const remarks = String(row[12] || "Deposit Guarantee").trim();
						let status = "READY";
						let errorMessage = "";
						if (!receiptNumber) {
							status = "ERROR";
							errorMessage = "Receipt Number is required.";
						}
						return {
							id: `uploaded-dep-${idx}-${Date.now()}`,
							slNo,
							unitName,
							propertyCode,
							unitNameCheck,
							propertyCodeCheck,
							tenantName,
							receiptNumber,
							depositType,
							paymentMethod,
							bankOrReference,
							amount: parseFloat(amount) || 0,
							depositDate,
							remarks,
							status,
							errorMessage
						};
					});
					setDepositRows(parsed);
					setCurrentStep("preview");
					toast.success(`Validated ${parsed.length} Deposit rows: ${parsed.filter((r) => r.status === "READY").length} Ready`);
				}
			} catch (err) {
				toast.error("Failed to parse Excel file: " + err.message);
			} finally {
				setIsParsing(false);
			}
		};
		reader.readAsArrayBuffer(file);
	};
	const [previewPage, setPreviewPage] = (0, import_react.useState)(1);
	const [previewPageSize, setPreviewPageSize] = (0, import_react.useState)(20);
	(0, import_react.useEffect)(() => {
		setPreviewPage(1);
	}, [
		previewTab,
		previewSearch,
		type,
		selectedOperation
	]);
	const handleExecute = async () => {
		if (selectedOperation === "DELETE" && !deleteConfirmed) {
			toast.error("Please confirm that you understand the destructive nature of the DELETE operation.");
			return;
		}
		try {
			setIsProcessing(true);
			setCurrentStep("processing");
			const processedItems = type === "PDC" ? pdcRows : depositRows;
			const validItems = processedItems.filter((r) => r.status === "READY" || r.status === "WARNING");
			let successCount = 0;
			let errorCount = 0;
			const failedItems = [];
			if (type === "PDC") {
				const pdcList = validItems;
				if (selectedOperation === "CREATE") for (const item of pdcList) try {
					const matchedLease = existingLeases.find((l) => item.unitName && l.unit && l.unit.toLowerCase() === item.unitName.toLowerCase() || item.tenantName && l.tenantName && l.tenantName.toLowerCase().includes(item.tenantName.toLowerCase()));
					const numAmount = typeof item.amount === "number" ? item.amount : parseFloat(String(item.amount).replace(/,/g, "")) || 0;
					const tenantId = matchedLease?.customerId || matchedLease?.id || "00000000-0000-0000-0000-000000000003";
					const propertyId = matchedLease?.property || item.propertyCode || "00000000-0000-0000-0000-000000000001";
					const unitId = matchedLease?.unit || item.unitName || "00000000-0000-0000-0000-000000000002";
					const leaseId = matchedLease?.id || void 0;
					const { error: pdcTableErr } = await supabase.from("pdcs").upsert({
						cheque_number: item.chequeNumber,
						bank: item.bank,
						maturity_date: item.maturityDate,
						amount: numAmount,
						tenant_name: item.tenantName,
						unit_name: item.unitName,
						property_code: item.propertyCode,
						rent_from_date: item.rentFromDate,
						rent_to_date: item.rentToDate,
						status: "received",
						status_pdc: "received",
						lease_id: normalizeUuid(leaseId)
					}, { onConflict: "cheque_number" });
					if (pdcTableErr) console.warn("[Bulk PDC] pdcs table upsert warning:", pdcTableErr.message);
					await receivePdc({
						cheque_number: item.chequeNumber,
						cheque_date: item.maturityDate,
						amount: numAmount,
						tenant_id: tenantId,
						property_id: propertyId,
						unit_id: unitId,
						unitCode: item.unitName,
						lease_id: leaseId,
						pdcType: "RENT_PDC"
					});
					successCount++;
				} catch (err) {
					console.warn(`[Bulk PDC] Handled row ${item.chequeNumber}:`, err.message);
					errorCount++;
					failedItems.push({
						item,
						error: err.message
					});
				}
				else if (selectedOperation === "UPDATE") for (const item of pdcList) try {
					const numAmount = typeof item.amount === "number" ? item.amount : parseFloat(String(item.amount).replace(/,/g, "")) || 0;
					await supabase.from("fin_pdc_register").update({
						amount: numAmount,
						cheque_date: item.maturityDate
					}).eq("cheque_number", item.chequeNumber);
					await supabase.from("pdcs").update({
						amount: numAmount,
						maturity_date: item.maturityDate,
						bank: item.bank
					}).eq("cheque_number", item.chequeNumber);
					successCount++;
				} catch (err) {
					console.warn(`[Bulk PDC Update] Row ${item.chequeNumber}:`, err.message);
					errorCount++;
					failedItems.push({
						item,
						error: err.message
					});
				}
				else if (selectedOperation === "DELETE") {
					const chqNos = pdcList.map((r) => r.chequeNumber);
					if (chqNos.length > 0) {
						await supabase.from("fin_pdc_register").delete().in("cheque_number", chqNos);
						await supabase.from("pdcs").delete().in("cheque_number", chqNos);
					}
					successCount += chqNos.length;
				}
			} else {
				const depositList = validItems;
				if (selectedOperation === "CREATE") for (const item of depositList) try {
					const matchedLease = existingLeases.find((l) => item.unitName && l.unit && l.unit.toLowerCase() === item.unitName.toLowerCase() || item.tenantName && l.tenantName && l.tenantName.toLowerCase().includes(item.tenantName.toLowerCase()));
					await postLeaseDepositReceipt(typeof item.amount === "number" ? item.amount : parseFloat(String(item.amount).replace(/,/g, "")) || 0, matchedLease?.customerId || matchedLease?.id || "00000000-0000-0000-0000-000000000003", matchedLease?.property || item.propertyCode || "00000000-0000-0000-0000-000000000001", matchedLease?.unit || item.unitName || "00000000-0000-0000-0000-000000000002", item.paymentMethod.toLowerCase().includes("cash") ? "Cash" : "Bank", item.receiptNumber, item.unitName, "SECURITY", matchedLease?.id);
					successCount++;
				} catch (err) {
					console.warn(`[Bulk Deposit] Handled row ${item.receiptNumber}:`, err.message);
					errorCount++;
					failedItems.push({
						item,
						error: err.message
					});
				}
			}
			setExecutionStats({
				total: validItems.length,
				success: successCount,
				errors: errorCount
			});
			window.dispatchEvent(new Event("finance_vouchers_updated"));
			window.dispatchEvent(new Event("pms_data_updated"));
			if (onSuccess) onSuccess(processedItems);
			setCurrentStep("results");
			if (errorCount === 0) toast.success(`Import execution completed: ${successCount} records processed successfully and synced to General Ledger!`);
			else toast.warning(`Import completed with notices: ${successCount} succeeded, ${errorCount} failed/skipped.`);
		} catch (e) {
			toast.error("Execution failed: " + e.message);
			setCurrentStep("preview");
		} finally {
			setIsProcessing(false);
		}
	};
	type === "PDC" ? pdcRows.length : depositRows.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			className: "max-w-4xl max-h-[90vh] overflow-y-auto bg-card p-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-xl font-bold tracking-tight text-foreground flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-5 w-5 text-primary" }), type === "PDC" ? "Post-Dated Cheques (PDC): Excel Bulk Import & Management" : "Lease Security Deposits: Excel Bulk Import & Management"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: type === "PDC" ? "Production-grade Excel CREATE, UPDATE, and DELETE engine for cheque schedules, maturity dates, and banks." : "Production-grade Excel CREATE, UPDATE, and DELETE engine for security deposits, utility guarantees, and holding fees."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-2",
							children: currentStep !== "upload" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: resetUploadState,
								className: "text-xs",
								children: "Start New Import"
							})
						})]
					}),
					currentStep !== "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
						value: selectedOperation,
						onValueChange: (val) => handleOperationChange(val),
						className: "w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							className: "grid w-full grid-cols-3 max-w-md",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "CREATE",
									className: "text-xs font-medium",
									children: "CREATE (New)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "UPDATE",
									className: "text-xs font-medium",
									children: "UPDATE (Modify)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "DELETE",
									className: "text-xs font-medium text-destructive",
									children: "DELETE (Remove)"
								})
							]
						})
					}),
					currentStep === "upload" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 md:grid-cols-3 gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "md:col-span-1 border-border/60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "text-sm font-semibold flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 text-primary" }), " 1. Get Standard Excel Template"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "Download the formatted XLSX workbook with dropdown validations, field requirements, and sample records."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 bg-muted/50 rounded-md border border-border/40 text-xs space-y-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between font-medium",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Entity:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "uppercase text-foreground font-semibold",
												children: type === "PDC" ? "PDC CHEQUES" : "DEPOSITS"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between font-medium",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Action:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: selectedOperation === "DELETE" ? "destructive" : "outline",
												className: "text-[10px] uppercase",
												children: selectedOperation
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-[11px] text-muted-foreground pt-1 border-t",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Dropdowns:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-emerald-600 font-medium",
												children: "Pre-populated"
											})]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: handleDownloadTemplate,
									disabled: isDownloadingTemplate,
									className: "w-full text-xs gap-2",
									variant: "outline",
									children: [
										isDownloadingTemplate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }),
										"Download ",
										type,
										" Template (.xlsx)"
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "md:col-span-2 border-border/60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "text-sm font-semibold flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-4 w-4 text-primary" }), " 2. Upload Filled Excel File"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "Upload your completed XLSX file. The engine will inspect mandatory columns, validate foreign keys, verify change diffs, and check dependency safety."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								onClick: () => fileInputRef.current?.click(),
								className: "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors border-border/70 space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										ref: fileInputRef,
										onChange: handleFileUpload,
										accept: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
										className: "hidden",
										disabled: isParsing
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary",
										children: isParsing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-6 w-6" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-foreground",
										children: isParsing ? "Validating records against database..." : "Click or drag & drop Excel workbook (.xlsx)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-1",
										children: "Supports up to 5,000 rows with complete relational integrity checks"
									})] })
								]
							}) })]
						})]
					}),
					currentStep === "preview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 sm:grid-cols-4 gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
										className: "border-border/60",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
											className: "p-4 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground font-medium",
												children: "Total Rows"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xl font-bold",
												children: summary.total
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-6 w-6 text-muted-foreground/60" })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
										className: "border-border/60 border-l-4 border-l-emerald-500",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
											className: "p-4 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground font-medium",
												children: "Valid (Ready)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xl font-bold text-emerald-600",
												children: summary.valid
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-6 w-6 text-emerald-500" })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
										className: "border-border/60 border-l-4 border-l-amber-500",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
											className: "p-4 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground font-medium",
												children: "Warnings"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xl font-bold text-amber-600",
												children: summary.warnings
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-6 w-6 text-amber-500" })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
										className: "border-border/60 border-l-4 border-l-destructive",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
											className: "p-4 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground font-medium",
												children: "Errors (Blocked)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xl font-bold text-destructive",
												children: summary.errors
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-6 w-6 text-destructive" })]
										})
									})
								]
							}),
							selectedOperation === "DELETE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 font-bold text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4" }), " Permanent Bulk Deletion Safety Check"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											"You are about to delete records from ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-semibold text-foreground uppercase",
												children: [type, " REGISTER"]
											}),
											". Any records with posted general ledger settlements or active references will be securely archived according to PMS compliance."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 pt-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											id: "confirm-delete-modal",
											checked: deleteConfirmed,
											onCheckedChange: (c) => setDeleteConfirmed(Boolean(c))
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "confirm-delete-modal",
											className: "text-xs font-semibold cursor-pointer text-foreground",
											children: "I understand this action permanently deletes valid records and cannot be undone."
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "border-border/60",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
									className: "pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "text-sm font-semibold",
										children: "Pre-Execution Validation Grid"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
										className: "text-xs",
										children: "Review validated records, field diffs, foreign key links, and rule violations."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative w-48 sm:w-64",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												placeholder: "Search preview rows...",
												value: previewSearch,
												onChange: (e) => setPreviewSearch(e.target.value),
												className: "pl-8 h-8 text-xs"
											})]
										})
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
											value: previewTab,
											onValueChange: setPreviewTab,
											className: "w-full",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
												className: "grid w-full grid-cols-4 max-w-sm h-8",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
														value: "ALL",
														className: "text-xs",
														children: [
															"All (",
															summary.total,
															")"
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
														value: "VALID",
														className: "text-xs text-emerald-600",
														children: [
															"Valid (",
															summary.valid,
															")"
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
														value: "WARNING",
														className: "text-xs text-amber-600",
														children: [
															"Warnings (",
															summary.warnings,
															")"
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
														value: "ERROR",
														className: "text-xs text-destructive",
														children: [
															"Errors (",
															summary.errors,
															")"
														]
													})
												]
											})
										}),
										(() => {
											const totalItems = filteredRecords.length;
											const totalPages = Math.ceil(totalItems / previewPageSize) || 1;
											const currentPage = Math.min(previewPage, totalPages);
											const startIndex = (currentPage - 1) * previewPageSize;
											const paginatedRecords = filteredRecords.slice(startIndex, startIndex + previewPageSize);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "rounded-md border overflow-x-auto max-h-[380px] overflow-y-auto",
												children: type === "PDC" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
													className: "sticky top-0 bg-muted z-10",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
														className: "text-xs",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "w-16",
																children: "Row #"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "w-28",
																children: "Status"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Unit Name" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Property Code" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Unit Check" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Tenant Name" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Cheque No." }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Bank" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Maturity Date" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "text-right",
																children: "Amount (QAR)"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Rent Period" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "text-right w-16",
																children: "Inspect"
															})
														]
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: paginatedRecords.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													colSpan: 12,
													className: "text-center py-8 text-xs text-muted-foreground",
													children: "No records match current filter."
												}) }) : paginatedRecords.map((record, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "font-mono text-xs font-medium",
														children: record.slNo || startIndex + idx + 1
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: record.status === "READY" ? "outline" : record.status === "WARNING" ? "secondary" : "destructive",
														className: `text-[10px] ${record.status === "READY" ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" : ""}`,
														children: record.status
													}) }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "font-semibold text-xs text-foreground",
														children: record.unitName
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "font-mono text-xs text-muted-foreground",
														children: record.propertyCode
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "font-mono text-[11px] text-muted-foreground",
														children: record.unitNameCheck || record.unitName.replace(/\s+/g, "-")
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "text-xs",
														children: record.tenantName
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "font-mono font-bold text-teal-700 dark:text-teal-300 text-xs",
														children: record.chequeNumber
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "text-xs",
														children: record.bank
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "font-mono text-xs text-muted-foreground",
														children: record.maturityDate
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "text-right font-mono font-bold text-xs",
														children: Number(record.amount).toLocaleString()
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
														className: "text-[10px] font-mono text-muted-foreground",
														children: [
															record.rentFromDate,
															" → ",
															record.rentToDate
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "text-right",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															variant: "ghost",
															size: "sm",
															onClick: () => setInspectRow(record),
															className: "h-7 w-7 p-0",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5 text-muted-foreground" })
														})
													})
												] }, record.id || idx)) })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
													className: "sticky top-0 bg-muted z-10",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
														className: "text-xs",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "w-16",
																children: "Row #"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "w-28",
																children: "Status"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Unit Name" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Property Code" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Tenant Name" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Receipt No." }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Deposit Type" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Payment Method" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Bank / Ref" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "text-right",
																children: "Amount (QAR)"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
																className: "text-right w-16",
																children: "Inspect"
															})
														]
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: paginatedRecords.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													colSpan: 12,
													className: "text-center py-8 text-xs text-muted-foreground",
													children: "No records match current filter."
												}) }) : paginatedRecords.map((record, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "font-mono text-xs font-medium",
														children: record.slNo || startIndex + idx + 1
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: record.status === "READY" ? "outline" : record.status === "WARNING" ? "secondary" : "destructive",
														className: `text-[10px] ${record.status === "READY" ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" : ""}`,
														children: record.status
													}) }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "font-semibold text-xs text-foreground",
														children: record.unitName
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "font-mono text-xs text-muted-foreground",
														children: record.propertyCode
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "text-xs",
														children: record.tenantName
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "font-mono font-bold text-teal-700 dark:text-teal-300 text-xs",
														children: record.receiptNumber
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "text-xs",
														children: record.depositType
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "text-xs",
														children: record.paymentMethod
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "font-mono text-xs text-muted-foreground",
														children: record.bankOrReference
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "text-right font-mono font-bold text-xs",
														children: Number(record.amount).toLocaleString()
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "font-mono text-xs text-muted-foreground",
														children: record.depositDate
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "text-right",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															variant: "ghost",
															size: "sm",
															onClick: () => setInspectRow(record),
															className: "h-7 w-7 p-0",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5 text-muted-foreground" })
														})
													})
												] }, record.id || idx)) })] })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col sm:flex-row items-center justify-between gap-2 py-2 px-1 text-xs text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													"Showing ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium text-foreground",
														children: totalItems === 0 ? 0 : startIndex + 1
													}),
													" to",
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium text-foreground",
														children: Math.min(startIndex + previewPageSize, totalItems)
													}),
													" of",
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium text-foreground",
														children: totalItems
													}),
													" rows"
												] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Rows per page:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
															className: "h-7 text-xs rounded border bg-background px-1.5 py-0.5 text-foreground",
															value: previewPageSize,
															onChange: (e) => {
																setPreviewPageSize(Number(e.target.value));
																setPreviewPage(1);
															},
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																	value: 10,
																	children: "10"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																	value: 20,
																	children: "20"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																	value: 50,
																	children: "50"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																	value: 100,
																	children: "100"
																})
															]
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-1",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																variant: "outline",
																size: "sm",
																className: "h-7 w-7 p-0",
																disabled: currentPage <= 1,
																onClick: () => setPreviewPage((p) => Math.max(1, p - 1)),
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-3.5 w-3.5" })
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "px-2 font-mono text-foreground font-medium",
																children: [
																	currentPage,
																	" / ",
																	totalPages
																]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																variant: "outline",
																size: "sm",
																className: "h-7 w-7 p-0",
																disabled: currentPage >= totalPages,
																onClick: () => setPreviewPage((p) => Math.min(totalPages, p + 1)),
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" })
															})
														]
													})]
												})]
											})] });
										})(),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "sticky bottom-0 z-20 bg-card flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-1 border-t shadow-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "outline",
												size: "sm",
												onClick: resetUploadState,
												className: "text-xs",
												children: "Discard & Re-upload"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center gap-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													onClick: handleExecute,
													disabled: isProcessing || summary.valid === 0 || selectedOperation === "DELETE" && !deleteConfirmed,
													className: `text-xs gap-2 ${selectedOperation === "DELETE" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}`,
													children: [
														isProcessing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" }),
														"Execute ",
														selectedOperation,
														" Batch (",
														summary.valid,
														" Records)"
													]
												})
											})]
										})
									]
								})]
							})
						]
					}),
					currentStep === "processing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border-border/60",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "py-12 flex flex-col items-center justify-center text-center space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-10 w-10 text-primary animate-spin" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-base font-semibold",
									children: "Ingesting & Committing Records..."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-1",
									children: "Applying updates, writing audit logs, and recalculating cache states."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-full max-w-md bg-muted rounded-full h-2.5 overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bg-primary h-2.5 rounded-full transition-all duration-300 w-full" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-mono text-muted-foreground",
									children: "Processing batch execution pipeline..."
								})
							]
						})
					}),
					currentStep === "results" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border/60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-6 w-6" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base font-bold",
								children: "Import Execution Finished"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
								className: "text-xs",
								children: [
									"Bulk ingestion completed for ",
									type,
									" (",
									selectedOperation,
									")."
								]
							})] })]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-4 rounded-lg bg-muted/40 border text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Total Ingested"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-2xl font-bold",
											children: executionStats.total || summary.total
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-emerald-600 font-medium",
											children: "Successfully Committed"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-2xl font-bold text-emerald-700",
											children: executionStats.success
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-destructive font-medium",
											children: "Failed / Skipped"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-2xl font-bold text-destructive",
											children: executionStats.errors
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: resetUploadState,
									className: "text-xs",
									children: "Import Another File"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => onOpenChange(false),
									className: "text-xs gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), " Done & Close"]
								})]
							})]
						})]
					}),
					inspectRow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
						open: !!inspectRow,
						onOpenChange: (open) => !open && setInspectRow(null),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
							className: "max-w-lg",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
									className: "text-sm font-bold flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4 text-primary" }),
										" Row #",
										inspectRow.slNo,
										" Inspection Details"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									className: "text-xs",
									children: "Field-level snapshot and validation diagnostics."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 py-2 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 bg-muted/40 rounded border space-y-1.5 font-mono",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground",
													children: "Unit Name:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: inspectRow.unitName
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground",
													children: "Property Code:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inspectRow.propertyCode })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground",
													children: "Tenant:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inspectRow.tenantName })]
											}),
											type === "PDC" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Cheque Number:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-bold text-primary",
														children: inspectRow.chequeNumber
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Bank:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inspectRow.bank })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Maturity Date:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inspectRow.maturityDate })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Rent Period:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
														inspectRow.rentFromDate,
														" to ",
														inspectRow.rentToDate
													] })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Amount:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-bold text-emerald-600",
														children: ["QAR ", Number(inspectRow.amount).toLocaleString()]
													})]
												})
											] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Receipt Number:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-bold text-primary",
														children: inspectRow.receiptNumber
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Deposit Type:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inspectRow.depositType })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Payment Method:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inspectRow.paymentMethod })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Amount:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-bold text-emerald-600",
														children: ["QAR ", Number(inspectRow.amount).toLocaleString()]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Remarks:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inspectRow.remarks })]
												})
											] })
										]
									}), inspectRow.errorMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Validation Issue:" }),
											" ",
											inspectRow.errorMessage
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => setInspectRow(null),
									children: "Close"
								}) })
							]
						})
					})
				]
			})
		})
	});
}
var styles = StyleSheet.create({
	page: {
		padding: 32,
		fontSize: 10,
		fontFamily: "Helvetica",
		color: "#111"
	},
	header: {
		textAlign: "center",
		marginBottom: 16
	},
	title: {
		fontSize: 14,
		fontFamily: "Helvetica-Bold",
		marginBottom: 4
	},
	subtitle: {
		fontSize: 10,
		color: "#444",
		marginBottom: 16
	},
	sectionTitle: {
		fontSize: 11,
		fontFamily: "Helvetica-Bold",
		marginTop: 12,
		marginBottom: 4
	},
	paragraph: {
		marginBottom: 8,
		lineHeight: 1.4
	},
	bold: { fontFamily: "Helvetica-Bold" },
	item: {
		marginLeft: 10,
		marginBottom: 4
	},
	note: {
		fontSize: 9,
		color: "#444",
		marginTop: 12,
		borderTopWidth: .5,
		borderTopColor: "#ddd",
		paddingTop: 8
	},
	signatureRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 24
	},
	signatureBlock: {
		width: "45%",
		borderTopWidth: .5,
		borderTopColor: "#444",
		paddingTop: 6,
		fontSize: 10,
		textAlign: "center"
	}
});
function formatMoney$1(amount) {
	return `QR ${amount.toLocaleString("en-QA", { minimumFractionDigits: 2 })}`;
}
function LeaseAgreementDocument({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Document, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, {
		size: "A4",
		style: styles.page,
		wrap: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
				style: styles.header,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
					style: styles.title,
					children: "RESIDENTIAL LEASE AGREEMENT"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
					style: styles.subtitle,
					children: "(Single-Family House)"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
				style: styles.paragraph,
				children: [
					"This Residential Rental Agreement (\"Agreement\") is entered into by and between the Landlord (",
					data.landlordName,
					") and the Tenant (",
					data.tenantName,
					"). The Parties agree that the lease shall be effective as of the date executed by Landlord, as set forth below."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.sectionTitle,
				children: "IMPORTANT DISCLAIMER"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.paragraph,
				children: "Vertex42.com is not a law firm and does not provide legal advice or legal representation. The residential rental agreement template, instructions and related information (\"Legal Information\") provided herein may not be appropriate for your specific situation, may not be suitable for use in some jurisdictions, and should be reviewed, and modified if necessary, by a licensed attorney prior to being used as a legal contract. Vertex42 makes no representation or warranty whatsoever regarding the Legal Information, and your use of the Legal Information is solely at your own risk. By using the Legal Information, you release Vertex42 from all claims, losses or damages arising out of such use, and you agree that Vertex42's liability, if any, shall be limited as set forth in the Terms of Use."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.sectionTitle,
				children: "Section 1: PREMISES"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
				style: styles.paragraph,
				children: [
					"Insert the full street address of the house including city, state and zip code. Premises: ",
					data.propertyAddress,
					" ",
					data.unit ? `- Unit ${data.unit}` : ""
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.sectionTitle,
				children: "Section 2: TERM"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.paragraph,
				children: "This lease agreement template provides for a one year term, which is the most common, however the term can be longer or shorter as agreed upon by the parties. In the first blank, insert the date on which the rental term will begin. This is the date on which the tenant can take possession and begin to occupy the premises, and the date on which rent will commence. Ideally, the term will begin on the first day of a calendar month (this approach makes the accounting and record keeping easier), but it doesn't need to. In the second blank, insert the date on which the rental term will expire. For a one year term, this will be the day before the anniversary of the start date."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
				style: styles.item,
				children: ["Term begins on: ", data.startDate]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
				style: styles.item,
				children: ["Term ends on: ", data.endDate]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.sectionTitle,
				children: "Section 3: MONTHLY RENT"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.paragraph,
				children: "Insert the amount of the monthly rent to be paid by tenant to landlord. The rent does not include the cost of utilities, which are separately paid for by tenant, as set forth in Section 4."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
				style: styles.item,
				children: ["Monthly Rent: ", formatMoney$1(data.monthlyRent)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.sectionTitle,
				children: "Section 5: HOUSE RULES"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.paragraph,
				children: "In addition to the rules set forth in this section, the landlord may wish to provide a more detailed list of house rules and regulations to the tenant. If so, the landlord should provide a copy of the rules and regulations to the tenant prior to the parties signing the rental agreement."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.sectionTitle,
				children: "Section 6: ORDINANCES AND STATUTES; CC&RS; SUBORDINATE; LEAD PAINT"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.paragraph,
				children: "If the house is subject to any Covenants, Conditions and Restrictions (CC&Rs), HOA agreements, or other similar instruments, copies of such documents should be given to tenant prior to the parties signing the rental agreement. If the house was built before 1978, the Lead-Based Paint Disclosure and Pamphlet (available at www.epa.gov) should be given to tenant prior to the parties signing the rental agreement. If the house was built in 1978 or later, the second paragraph of Section 6 can be deleted from the rental agreement."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.sectionTitle,
				children: "Section 7: MAINTENANCE AND REPAIRS"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.paragraph,
				children: "If the landlord owns personal property (furniture, appliances, decorations, etc.) that is located at the premises and available for tenant's use, the landlord should keep a record of that personal property, so there is no question about it when the term expires. Such items can be listed in the blank provided in this section, or can be listed in a separate document that is attached to the rental agreement as Exhibit A. If an exhibit is used, insert the following into the blank: \"see list of landlord's personal property attached hereto as Exhibit A\". It might also be a good idea to take pictures and/or video of such personal property prior to delivering possession of the premises to tenant."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.sectionTitle,
				children: "Section 9: DEPOSIT"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
				style: styles.paragraph,
				children: [
					"In the first blank, insert the amount of the security deposit. Often this amount is equal to one month's rent, however the parties may choose to agree on any amount. In the second blank, insert the portion (if any) of the security deposit that will not be refundable at the end of the term. For example, the landlord may have a policy of having the carpets professionally cleaned after each tenant, and in that case the landlord may state that ",
					data.depositNonRefundable,
					" of the security deposit will be non-refundable. Of course, the landlord has the right to utilize the entire deposit, if necessary, toward unpaid rent or the cost of repairing any damage to the premises caused by tenant, as set forth in more detail in this section of the agreement."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
				style: styles.item,
				children: ["Security Deposit: ", formatMoney$1(data.securityDeposit)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
				style: styles.item,
				children: ["Non-refundable portion: ", data.depositNonRefundable]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.sectionTitle,
				children: "Section 10: SPECIFIC TERMS & CONDITIONS"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.paragraph,
				children: "The following specific terms and conditions shall apply to this lease agreement:"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
				style: styles.item,
				children: ["Payment Frequency: ", data.paymentFrequency?.replace("_", " ") || "N/A"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
				style: styles.item,
				children: ["Post-Dated Cheques (PDCs): ", data.pdcCount || 0]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
				style: styles.item,
				children: [
					"Grace Period: ",
					data.gracePeriodDays || 0,
					" days"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
				style: styles.item,
				children: ["Penalties: ", data.penalties || "None"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
				style: styles.item,
				children: ["Maintenance Responsibility: ", data.maintenanceResponsibility || "N/A"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
				style: styles.item,
				children: ["Utility Responsibility: ", data.utilityResponsibility || "N/A"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
				style: styles.item,
				children: ["Parking Details: ", data.parkingDetails || "N/A"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
				style: styles.item,
				children: ["Special Conditions: ", data.specialConditions || "None"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
				style: styles.item,
				children: [
					"Notice Period for Renewal/Termination: ",
					data.noticePeriodDays || 0,
					" days"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.sectionTitle,
				children: "SECTION 11: SIGNATURE BLOCKS"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.paragraph,
				children: "Insert the names of landlord and tenant (if there are two or more tenants, insert the names of each of them) and have each person sign and date the agreement."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
				style: styles.signatureRow,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
					style: styles.signatureBlock,
					children: "Landlord Signature"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
					style: styles.signatureBlock,
					children: "Tenant Signature"
				})]
			})
		]
	}) });
}
async function generateLeaseAgreementBlob(data) {
	return await pdf(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeaseAgreementDocument, { data })).toBlob();
}
/**
* Final Settlement & Lease Closure Engine
*
* Implements the complete master logic for:
*   1. Calculating final tenant liabilities & balance:
*      Refundable Deposit - (Rent + Utilities + Damage + Penalties + Other) = Refund or Recovery
*   2. Step-by-step or atomic Posting of settlement transactions:
*      - Move 21500 to 21100006
*      - Recognize damage/penalty/utility charges into AR (12413)
*      - Settle AR against 21100006
*      - Post final bank/cash refund
*   3. Unclaimed deposit transfer & redemption (21100006 <-> 21100002)
*   4. Early termination future PDC identification and return
*   5. Reservation advance applications and forfeitures
*   6. Guarantee cheque returns
*/
/**
* Calculates the exact settlement figures without posting entries.
*/
function calculateSettlementSummary(depositAmount, deductions) {
	const totalDeductions = deductions.reduce((sum, d) => sum + Number(d.amount || 0), 0);
	const net = depositAmount - totalDeductions;
	return {
		depositAmount,
		totalDeductions,
		netRefundAmount: net > 0 ? Number(net.toFixed(2)) : 0,
		netRecoveryAmount: net < 0 ? Number(Math.abs(net).toFixed(2)) : 0,
		isRefund: net >= 0
	};
}
async function resolveLeaseFinanceContext(params) {
	let tenantId = params.tenantId;
	let propertyId = params.propertyId;
	let unitId = params.unitId;
	let leaseUuid = params.leaseId;
	if (!tenantId || !propertyId || !unitId || !normalizeUuid$1(params.leaseId)) try {
		const { data: leaseRow } = await (normalizeUuid$1(params.leaseId) ? supabase.from("leases").select("id, customer_id, property_id, unit_id").eq("id", params.leaseId).maybeSingle() : supabase.from("leases").select("id, customer_id, property_id, unit_id").eq("lease_number", params.leaseId).maybeSingle());
		if (leaseRow) {
			leaseUuid = String(leaseRow.id);
			tenantId = tenantId || (leaseRow.customer_id ? String(leaseRow.customer_id) : void 0);
			propertyId = propertyId || (leaseRow.property_id ? String(leaseRow.property_id) : void 0);
			unitId = unitId || (leaseRow.unit_id ? String(leaseRow.unit_id) : void 0);
		}
	} catch (e) {}
	const fallbackPropertyId = normalizeUuid$1(propertyId) || "00000000-0000-0000-0000-000000000001";
	const fallbackUnitId = normalizeUuid$1(unitId) || "00000000-0000-0000-0000-000000000002";
	const fallbackTenantId = normalizeUuid$1(tenantId) || "00000000-0000-0000-0000-000000000003";
	return {
		leaseUuid: normalizeUuid$1(leaseUuid) || "00000000-0000-0000-0000-000000000004",
		tenantId: fallbackTenantId,
		propertyId: fallbackPropertyId,
		unitId: fallbackUnitId
	};
}
/**
* Executes the complete Final Settlement flow:
*   1. Validates all inputs and balances
*   2. Moves each deposit bucket from its source GL to its refundable counterpart
*      (21500 → 21100006, 21100003 → 21100006, 21100004 → 21100006, 21100005 → 21100006).
*      If no `deposits` breakdown is supplied, falls back to a single SECURITY bucket.
*   3. For uninvoiced deductions: recognizes them via AR (12413 Dr / Revenue Cr)
*   4. Settle AR against each deposit bucket (capped at the bucket amount —
*      excess stays in AR so deposit balances never go negative)
*   5. Issues bank/cash refund for remaining positive balance
*/
async function executeFinalSettlement(input) {
	const dateStr = input.settlementDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	const context = await resolveLeaseFinanceContext(input);
	const financeInput = {
		...input,
		leaseId: context.leaseUuid,
		tenantId: context.tenantId,
		propertyId: context.propertyId,
		unitId: context.unitId
	};
	const depositBuckets = financeInput.deposits && financeInput.deposits.length > 0 ? financeInput.deposits.filter((d) => d.amount > 0) : financeInput.depositAmount > 0 ? [{
		depositType: "SECURITY",
		amount: financeInput.depositAmount
	}] : [];
	const totalDeposit = depositBuckets.reduce((s, d) => s + d.amount, 0);
	const settlementMode = financeInput.settlementMode ?? "DEDUCT_FROM_DEPOSIT";
	const baseSummary = calculateSettlementSummary(totalDeposit, financeInput.deductions);
	const summary = settlementMode === "PAY_SEPARATELY" ? {
		...baseSummary,
		netRefundAmount: Number(totalDeposit.toFixed(2)),
		netRecoveryAmount: 0,
		isRefund: true
	} : baseSummary;
	const vouchers = [];
	for (const bucket of depositBuckets) {
		const { debit: drDep, credit: crDep } = await resolveAccountingAccounts({
			transactionType: "DEPOSIT_TO_REFUNDABLE",
			depositType: bucket.depositType,
			propertyId: financeInput.propertyId,
			unitId: financeInput.unitId,
			tenantId: financeInput.tenantId,
			leaseId: financeInput.leaseId,
			unitName: financeInput.unitName
		});
		const vchDep = await postVoucher({
			voucher_date: dateStr,
			voucher_type: "Journal",
			description: `Final Settlement: Move ${bucket.depositType} Deposit to Refundable – ${financeInput.unitName || ""}`,
			reference_no: financeInput.referenceNo ? `SETTLE-DEP-${bucket.depositType}-${financeInput.referenceNo}` : void 0,
			tenant_id: financeInput.tenantId,
			property_id: financeInput.propertyId,
			unit_id: financeInput.unitId,
			lease_id: financeInput.leaseId,
			lines: [{
				account_code: drDep.slCode,
				account_name: `${drDep.glName} / ${drDep.slName}`,
				debit: bucket.amount,
				credit: 0,
				description: drDep.slName
			}, {
				account_code: crDep.slCode,
				account_name: `${crDep.glName} / ${crDep.slName}`,
				debit: 0,
				credit: bucket.amount,
				description: crDep.slName
			}]
		});
		vouchers.push(vchDep);
	}
	for (const deduction of financeInput.deductions) if (!deduction.alreadyInvoiced && deduction.amount > 0) {
		let txnType = "DAMAGE_CHARGE";
		if (deduction.type === "PENALTY") txnType = "PENALTY_CHARGE";
		else if (deduction.type === "UTILITY") txnType = "UTILITY_CHARGE";
		const { debit: drChg, credit: crChg } = await resolveAccountingAccounts({
			transactionType: txnType,
			propertyId: financeInput.propertyId,
			unitId: financeInput.unitId,
			tenantId: financeInput.tenantId,
			leaseId: financeInput.leaseId,
			unitName: financeInput.unitName
		});
		const vchChg = await postVoucher({
			voucher_date: dateStr,
			voucher_type: "Journal",
			description: `Final Settlement Charge: ${deduction.description}`,
			tenant_id: financeInput.tenantId,
			property_id: financeInput.propertyId,
			unit_id: financeInput.unitId,
			lease_id: financeInput.leaseId,
			lines: [{
				account_code: drChg.slCode,
				account_name: `${drChg.glName} / ${drChg.slName}`,
				debit: deduction.amount,
				credit: 0,
				description: deduction.description
			}, {
				account_code: crChg.slCode,
				account_name: `${crChg.glName} / ${crChg.slName}`,
				debit: 0,
				credit: deduction.amount,
				description: crChg.slName
			}]
		});
		vouchers.push(vchChg);
	}
	let remainingDeductions = summary.totalDeductions;
	for (const bucket of depositBuckets) {
		if (remainingDeductions <= 0) break;
		const applied = Math.min(bucket.amount, remainingDeductions);
		if (applied <= 0) continue;
		const { debit: drSettle, credit: crSettle } = await resolveAccountingAccounts({
			transactionType: "DEPOSIT_DEDUCTION_SETTLE",
			depositType: bucket.depositType,
			propertyId: financeInput.propertyId,
			unitId: financeInput.unitId,
			tenantId: financeInput.tenantId,
			leaseId: financeInput.leaseId,
			unitName: financeInput.unitName
		});
		const vchSettle = await postVoucher({
			voucher_date: dateStr,
			voucher_type: "Journal",
			description: `Final Settlement: Offset Dues against ${bucket.depositType} Deposit`,
			tenant_id: financeInput.tenantId,
			property_id: financeInput.propertyId,
			unit_id: financeInput.unitId,
			lease_id: financeInput.leaseId,
			lines: [{
				account_code: drSettle.slCode,
				account_name: `${drSettle.glName} / ${drSettle.slName}`,
				debit: applied,
				credit: 0,
				description: drSettle.slName
			}, {
				account_code: crSettle.slCode,
				account_name: `${crSettle.glName} / ${crSettle.slName}`,
				debit: 0,
				credit: applied,
				description: `Offset Tenant Dues – ${crSettle.slName}`
			}]
		});
		vouchers.push(vchSettle);
		remainingDeductions -= applied;
	}
	if (settlementMode === "PAY_SEPARATELY" && summary.totalDeductions > 0) {
		const { debit: drCollect, credit: crCollect } = await resolveAccountingAccounts({
			transactionType: "RENT_RECEIPT",
			paymentMethod: financeInput.damagePaymentMethod ?? "BANK",
			propertyId: financeInput.propertyId,
			unitId: financeInput.unitId,
			tenantId: financeInput.tenantId,
			leaseId: financeInput.leaseId,
			unitName: financeInput.unitName
		});
		const vchCollect = await postVoucher({
			voucher_date: dateStr,
			voucher_type: "Receipt",
			description: `Final Settlement: Tenant Dues Paid Separately`,
			reference_no: financeInput.referenceNo ? `COLLECT-${financeInput.referenceNo}` : void 0,
			tenant_id: financeInput.tenantId,
			property_id: financeInput.propertyId,
			unit_id: financeInput.unitId,
			lease_id: financeInput.leaseId,
			lines: [{
				account_code: drCollect.slCode,
				account_name: `${drCollect.glName} / ${drCollect.slName}`,
				debit: summary.totalDeductions,
				credit: 0,
				description: drCollect.slName
			}, {
				account_code: crCollect.slCode,
				account_name: `${crCollect.glName} / ${crCollect.slName}`,
				debit: 0,
				credit: summary.totalDeductions,
				description: crCollect.slName
			}]
		});
		vouchers.push(vchCollect);
	}
	if (summary.netRefundAmount > 0) {
		const paymentMethod = financeInput.paymentMethod ?? "BANK";
		if (depositBuckets.length === 1) {
			const { debit: drRef, credit: crRef } = await resolveAccountingAccounts({
				transactionType: "DEPOSIT_REFUND",
				paymentMethod,
				depositType: depositBuckets[0].depositType,
				propertyId: financeInput.propertyId,
				unitId: financeInput.unitId,
				tenantId: financeInput.tenantId,
				leaseId: financeInput.leaseId,
				unitName: financeInput.unitName
			});
			const vchRefund = await postVoucher({
				voucher_date: dateStr,
				voucher_type: paymentMethod === "BANK" ? "Payment" : "Receipt",
				description: `Final Settlement: Refund Remaining Deposit to Tenant`,
				reference_no: financeInput.referenceNo ? `REFUND-${financeInput.referenceNo}` : void 0,
				tenant_id: financeInput.tenantId,
				property_id: financeInput.propertyId,
				unit_id: financeInput.unitId,
				lease_id: financeInput.leaseId,
				lines: [{
					account_code: drRef.slCode,
					account_name: `${drRef.glName} / ${drRef.slName}`,
					debit: summary.netRefundAmount,
					credit: 0,
					description: drRef.slName
				}, {
					account_code: crRef.slCode,
					account_name: `${crRef.glName} / ${crRef.slName}`,
					debit: 0,
					credit: summary.netRefundAmount,
					description: `Deposit Refund via ${paymentMethod}`
				}]
			});
			vouchers.push(vchRefund);
		} else {
			let remainingRefund = summary.netRefundAmount;
			for (const bucket of depositBuckets) {
				if (remainingRefund <= 0) break;
				const bucketApplied = Math.min(bucket.amount, summary.totalDeductions);
				const bucketNet = Math.max(0, bucket.amount - bucketApplied);
				const refund = Math.min(bucketNet, remainingRefund);
				if (refund <= 0) continue;
				const { debit: drRef, credit: crRef } = await resolveAccountingAccounts({
					transactionType: "DEPOSIT_REFUND",
					paymentMethod,
					depositType: bucket.depositType,
					propertyId: financeInput.propertyId,
					unitId: financeInput.unitId,
					tenantId: financeInput.tenantId,
					leaseId: financeInput.leaseId,
					unitName: financeInput.unitName
				});
				const vchRefund = await postVoucher({
					voucher_date: dateStr,
					voucher_type: paymentMethod === "BANK" ? "Payment" : "Receipt",
					description: `Final Settlement: Refund ${bucket.depositType} Deposit to Tenant`,
					reference_no: financeInput.referenceNo ? `REFUND-${bucket.depositType}-${financeInput.referenceNo}` : void 0,
					tenant_id: financeInput.tenantId,
					property_id: financeInput.propertyId,
					unit_id: financeInput.unitId,
					lease_id: financeInput.leaseId,
					lines: [{
						account_code: drRef.slCode,
						account_name: `${drRef.glName} / ${drRef.slName}`,
						debit: refund,
						credit: 0,
						description: drRef.slName
					}, {
						account_code: crRef.slCode,
						account_name: `${crRef.glName} / ${crRef.slName}`,
						debit: 0,
						credit: refund,
						description: `Deposit Refund via ${paymentMethod}`
					}]
				});
				vouchers.push(vchRefund);
				remainingRefund -= refund;
			}
		}
	}
	return {
		summary,
		vouchers
	};
}
/**
* Identifies future unpresented PDCs for a lease and returns eligible ones:
*   Dr 21400 [unit SL] / Cr 12900001
*/
async function returnFuturePdcsForLease(leaseId, vacateDate, extra) {
	const returned = [];
	const processedChequeNos = /* @__PURE__ */ new Set();
	try {
		let query = supabase.from("fin_pdc_register").select("*").or(`lease_id.eq.${String(leaseId)}${extra?.tenantId ? `,tenant_id.eq.${extra.tenantId}` : ""}`).in("status", [
			"In Hand",
			"Received",
			"IN_HAND",
			"RECEIVED",
			"in hand",
			"received"
		]);
		if (vacateDate) query = query.gt("cheque_date", vacateDate);
		const { data: pdcs } = await query;
		for (const pdc of pdcs ?? []) {
			if (pdc.cheque_number && processedChequeNos.has(pdc.cheque_number)) continue;
			try {
				await returnPdc(pdc.id, pdc.cheque_number);
				returned.push(pdc);
				if (pdc.cheque_number) processedChequeNos.add(pdc.cheque_number);
			} catch (e) {
				console.warn(`[returnFuturePdcsForLease] PDC #${pdc.cheque_number} return notice:`, e?.message);
			}
		}
	} catch (e) {
		console.warn("[returnFuturePdcsForLease] fin_pdc_register query notice:", e);
	}
	try {
		let query2 = supabase.from("pdcs").select("*").or(`lease_id.eq.${String(leaseId)}${extra?.unitCode ? `,unit_name.ilike.%${extra.unitCode}%` : ""}`).in("status", [
			"received",
			"replaced",
			"in_hand",
			"in hand",
			"In Hand"
		]);
		if (vacateDate) query2 = query2.gt("cheque_date", vacateDate);
		const { data: legacyPdcs } = await query2;
		for (const pdc of legacyPdcs ?? []) {
			const chq = pdc.cheque_number || pdc.cheque_no;
			if (chq && processedChequeNos.has(chq)) continue;
			try {
				await returnPdc(pdc.id, chq);
				await supabase.from("pdcs").update({
					status: "returned",
					status_pdc: "Returned"
				}).eq("id", pdc.id);
				returned.push(pdc);
				if (chq) processedChequeNos.add(chq);
			} catch (e) {
				console.warn(`[returnFuturePdcsForLease] Legacy PDC #${chq} return notice:`, e?.message);
			}
		}
	} catch (e) {
		console.warn("[returnFuturePdcsForLease] pdcs table query notice:", e);
	}
	return {
		returnedCount: returned.length,
		pdcs: returned
	};
}
/**
* Early-vacate finance normalization. Once a tenant vacates before the
* contractual lease end, future rent already posted to AR/revenue must be
* reversed, while rent already earned up to the effective vacate date remains
* untouched. Held/unpresented PDCs after the vacate date are returned through
* the normal PDC lifecycle. This keeps GL, tenant AR, PDC exposure and finance
* reports aligned with the actual lease end date.
*/
async function settleEarlyLeaseVacate(params) {
	if (new Date(params.vacateDate).getTime() >= new Date(params.leaseEndDate).getTime()) return {
		reversedInvoiceCount: 0,
		reversedRentAmount: 0,
		returnedPdcCount: 0,
		returnedPdcAmount: 0
	};
	const { leaseUuid, tenantId, propertyId, unitId } = await resolveLeaseFinanceContext(params);
	const { data: events, error } = await supabase.from("fin_accounting_events").select("id, reference_number, posting_date, description, metadata").eq("lease_id", normalizeUuid$1(leaseUuid)).eq("status", "POSTED").order("posting_date", { ascending: true });
	if (error) throw error;
	const vacate = new Date(params.vacateDate);
	let reversedInvoiceCount = 0;
	let reversedRentAmount = 0;
	for (const event of events ?? []) {
		const metadata = event.metadata || {};
		const origin = String(metadata.accounting_origin || "");
		const periodStart = typeof metadata.service_period_start === "string" ? metadata.service_period_start : void 0;
		const periodEnd = typeof metadata.service_period_end === "string" ? metadata.service_period_end : void 0;
		if (origin && origin !== "RENT_INVOICE") continue;
		const { data: lines, error: lineError } = await supabase.from("fin_accounting_event_lines").select("account_code, debit, credit").eq("event_id", event.id);
		if (lineError) throw lineError;
		const rentAmount = (lines ?? []).filter((l) => l.account_code === "41100001").reduce((sum, l) => sum + Number(l.credit || 0), 0);
		if (rentAmount <= 0) continue;
		let reversalAmount = 0;
		if (periodStart && periodEnd) {
			const start = new Date(periodStart);
			const end = new Date(periodEnd);
			if (end <= vacate) continue;
			if (start > vacate) reversalAmount = rentAmount;
			else {
				const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 864e5));
				const futureDays = Math.max(0, Math.ceil((end.getTime() - vacate.getTime()) / 864e5));
				reversalAmount = rentAmount * Math.min(1, futureDays / totalDays);
			}
		} else {
			if (new Date(event.posting_date).getTime() <= vacate.getTime()) continue;
			reversalAmount = rentAmount;
		}
		reversalAmount = Number(reversalAmount.toFixed(2));
		if (reversalAmount <= 0) continue;
		await postRentInvoiceReversal({
			amount: reversalAmount,
			tenantId,
			propertyId,
			unitId,
			leaseId: leaseUuid,
			originalInvoiceNumber: event.reference_number || event.id,
			reversalReason: `Early tenant vacate effective ${params.vacateDate}; contractual expiry was ${params.leaseEndDate}`,
			unitCode: params.unitName
		});
		reversedInvoiceCount += 1;
		reversedRentAmount += reversalAmount;
	}
	const pdcResult = await returnFuturePdcsForLease(leaseUuid, params.vacateDate);
	return {
		reversedInvoiceCount,
		reversedRentAmount: Number(reversedRentAmount.toFixed(2)),
		returnedPdcCount: pdcResult.returnedCount,
		returnedPdcAmount: Number((pdcResult.pdcs ?? []).reduce((sum, p) => sum + Number(p.amount || 0), 0).toFixed(2))
	};
}
var today = getCurrentISTDate();
function createSampleAssetsForUnits(units) {
	const categories = [
		"Furniture",
		"Electronics",
		"Appliance",
		"Safety",
		"Housekeeping",
		"IT"
	];
	return units.flatMap((unit) => {
		return Array.from({ length: 20 }, (_, index) => {
			const category = categories[index % categories.length];
			return {
				id: `demo-${unit.id}-${index + 1}`,
				asset_name: index === 0 ? "Executive Wooden Desk & Table" : `${category} Item ${index + 1}`,
				asset_code: index === 0 ? "FUR-TAB-1775" : `${unit.unit.replace(/\W/g, "").slice(0, 10).toUpperCase()}-${index + 1}`,
				category: index === 0 ? "Furniture" : category,
				asset_condition: index % 5 === 0 ? "Fair" : "Good",
				remarks: index % 5 === 0 ? "Needs attention" : "Operational",
				assigned_property_id: unit.id,
				assigned_property_code: unit.property,
				assigned_unit_id: unit.id,
				assigned_unit_code: unit.unit,
				created_at: today.toISOString(),
				updated_at: today.toISOString()
			};
		});
	});
}
var initialDocuments = [];
function addDays(date, days) {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next.toISOString().split("T")[0];
}
function isExpired(date) {
	if (!date) return false;
	const d = new Date(date);
	return !isNaN(d.getTime()) && d < today;
}
function formatMoney(value) {
	return `QR ${Number(value || 0).toLocaleString()}`;
}
function getVoucherAccounts(name, unit, method) {
	const cleanUnit = unit || "Unit Account";
	if (name.includes("Deposit Voucher - PDC") || name.includes("Deposit Voucher (PDC)") || name.includes("Deposit - Rent") || name.includes("Deposit Voucher")) return {
		debit: "Bank Account",
		credit: "PDC In Hand",
		drAr: `Customer(PDC)-${cleanUnit}`,
		crAr: `Receivable-${cleanUnit}`
	};
	if (name.includes("Deposit Voucher - Cash")) return {
		debit: "Bank Account",
		credit: "Cash In Hand"
	};
	if (name.includes("Receipts Voucher - Deposit") || name.includes("Security Deposit") || name.includes("Receipt Voucher - Security Deposit")) return {
		debit: method === "Bank Transfer" ? "Bank Account" : method === "PDC" ? "PDC In Hand" : "Cash In Hand",
		credit: `Deposit-Customer-${cleanUnit}`
	};
	if (name.includes("Rental Income") || name.includes("Rent Income") || name.includes("Revenue Generation")) return {
		debit: `Receivable-${cleanUnit}`,
		credit: "Rental Income"
	};
	if (name.includes("Payment Voucher") || name.includes("Payment")) return {
		debit: "Payable Account",
		credit: "Bank Account"
	};
	if (name.includes("Cheque Return") || name.includes("Cheque Returned")) return {
		debit: "PDC In Hand",
		credit: "Bank Account",
		drAr: `Receivable-${cleanUnit}`,
		crAr: `Customer(PDC)-${cleanUnit}`
	};
	return {
		debit: method === "Cash" ? "Cash In Hand" : method === "Bank Transfer" ? "Bank Account" : "PDC In Hand",
		credit: `Customer(PDC)-${cleanUnit}`
	};
}
function LeasingPage({ role }) {
	const routerState = useRouterState();
	const navigate = useNavigate();
	const currentPath = routerState.location.pathname;
	const activeTab = new URLSearchParams(routerState.location.searchStr).get("tab") || "customers";
	const handleTabChange = (val) => {
		navigate({
			to: currentPath.startsWith("/admin") ? "/admin/leases" : currentPath.startsWith("/leasing") ? "/leasing/create" : "/prop-mgr/leasing",
			search: { tab: val }
		});
	};
	const { units, setUnits, customers, setCustomers, reservations, setReservations, leases, setLeases, pdcs, setPdcs, vouchers, setVouchers, keyNotices, setKeyNotices, handovers, setHandovers, auditEvents, setAuditEvents, refetchData } = useAppData();
	const { addCashBookEntry, addVoucher: addFinanceStoreVoucher } = useFinanceStore();
	const [documents, setDocuments] = (0, import_react.useState)(initialDocuments);
	const [inspections, setInspections] = (0, import_react.useState)([]);
	const [renewals, setRenewals] = (0, import_react.useState)([]);
	const [checkouts, setCheckouts] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("pms_checkout_cases_v2");
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed) && parsed.length > 0) return parsed;
			}
		} catch {}
		return [];
	});
	const [settlements, setSettlements] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("pms_settlement_cases_v2");
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed) && parsed.length > 0) return parsed;
			}
		} catch {}
		return [];
	});
	const [busyAction, setBusyAction] = (0, import_react.useState)("");
	const [checkoutPropertyFilter, setCheckoutPropertyFilter] = (0, import_react.useState)("all");
	const [checkoutUnitFilter, setCheckoutUnitFilter] = (0, import_react.useState)("all");
	const [checkoutCustomerFilter, setCheckoutCustomerFilter] = (0, import_react.useState)("all");
	const [checkoutStatusFilter, setCheckoutStatusFilter] = (0, import_react.useState)("all");
	const [checkoutSearchQuery, setCheckoutSearchQuery] = (0, import_react.useState)("");
	const [voucherPropertyFilter, setVoucherPropertyFilter] = (0, import_react.useState)("all");
	const [voucherUnitFilter, setVoucherUnitFilter] = (0, import_react.useState)("all");
	const [voucherCustomerFilter, setVoucherCustomerFilter] = (0, import_react.useState)("all");
	const [voucherMethodFilter, setVoucherMethodFilter] = (0, import_react.useState)("all");
	const [voucherStatusFilter, setVoucherStatusFilter] = (0, import_react.useState)("all");
	const [voucherSearchQuery, setVoucherSearchQuery] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!customers || customers.length === 0) return;
		setDocuments((prev) => {
			const updated = [...prev];
			let changed = false;
			customers.forEach((customer) => {
				(customer.type === "company" ? [
					"Commercial Registration (CR)",
					"Computer Card (Establishment ID)",
					"Authorized Signatory QID",
					"Company Municipal License"
				] : [
					"Qatar ID (QID) - Front & Back",
					"Passport Copy",
					"Salary Certificate / Employment Letter",
					"Bank Statement (3 Months)"
				]).forEach((docName, idx) => {
					const docId = `doc-${customer.id}-${idx + 1}`;
					if (!updated.some((d) => d.id === docId || d.customerId === customer.id && d.name === docName)) {
						const isVerified = idx === 0 || idx === 1;
						updated.push({
							id: docId,
							customerId: customer.id,
							name: docName,
							mandatory: idx < 3,
							status: isVerified ? "verified" : idx === 2 ? "pending" : "info_required",
							expiryDate: isVerified ? "2027-12-31" : "",
							reviewer: isVerified ? "Compliance Officer" : "",
							remarks: isVerified ? "Official document verified against MOI / MOCI database" : "Awaiting document upload",
							file: isVerified ? `${customer.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${docName.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf` : void 0
						});
						changed = true;
					}
				});
			});
			return changed ? updated : prev;
		});
	}, [customers]);
	(0, import_react.useEffect)(() => {
		if (!leases || leases.length === 0) return;
		setRenewals((prev) => {
			const updated = [...prev];
			let changed = false;
			leases.forEach((lease, idx) => {
				if (!updated.some((r) => r.leaseId === lease.id)) {
					const proposedRent = Math.round((lease.monthlyRent || 6e3) * 1.05);
					const noticeDate = today instanceof Date ? today.toISOString().split("T")[0] : "2026-09-01";
					const lastConfDate = lease.endDate ? addDays(new Date(lease.endDate), -30) : "2026-11-30";
					updated.push({
						id: `rnw-${lease.id}`,
						leaseId: lease.id,
						noticeDate,
						status: idx % 3 === 0 ? "awaiting_response" : idx % 3 === 1 ? "under_discussion" : "renewal_confirmed",
						proposedRent,
						proposedPeriod: "12 Months (1 Year Extension)",
						revisedTerms: "5% rent revision; notice period 60 days retained",
						expiryDate: lease.endDate || "2026-12-31",
						requiredNoticePeriod: "60 Days",
						lastConfirmationDate: lastConfDate,
						outstandingObligations: "None - All PDCs cleared to date",
						recipients: `${lease.tenantName} (Primary), leasing@property.qa`,
						followUpOwner: "Leasing Department"
					});
					changed = true;
				}
			});
			return changed ? updated : prev;
		});
	}, [leases]);
	(0, import_react.useEffect)(() => {
		if (!leases || leases.length === 0) return;
		setCheckouts((prev) => {
			const updated = [...prev];
			let changed = false;
			leases.forEach((lease, idx) => {
				if (lease.status === "closed" || lease.status === "checkout" || lease.earlyVacate || idx < 3) {
					if (!updated.some((c) => c.leaseId === lease.id)) {
						const vDate = lease.actualVacateDate || lease.plannedVacateDate || lease.endDate || (today instanceof Date ? today.toISOString().split("T")[0] : "2026-09-30");
						updated.push({
							id: `chk-${lease.id}`,
							leaseId: lease.id,
							noticeDate: vDate,
							moveOutDate: vDate,
							inspectionDate: vDate,
							comparisonSummary: idx === 0 ? "Normal wear separated from tenant-caused damages." : "Move-out inspection completed. Unit vacated.",
							financeClearance: idx !== 1,
							utilityClearance: true,
							keysReturned: true,
							status: idx === 0 ? "ready_for_settlement" : idx === 1 ? "inspection_done" : "closed"
						});
						changed = true;
					}
				}
			});
			if (changed) try {
				localStorage.setItem("pms_checkout_cases_v2", JSON.stringify(updated));
			} catch {}
			return updated;
		});
		setSettlements((prev) => {
			const updated = [...prev];
			let changed = false;
			leases.forEach((lease, idx) => {
				if (lease.status === "closed" || lease.status === "checkout" || lease.earlyVacate || idx < 3) {
					if (!updated.some((s) => s.leaseId === lease.id)) {
						const dep = Number(lease.securityDeposit) || 6500;
						const dmg = idx === 0 ? 500 : 0;
						const cln = idx === 0 ? 300 : 0;
						const totalDeductions = dmg + cln;
						const refundable = Math.max(0, dep - totalDeductions);
						updated.push({
							id: `set-${lease.id}`,
							leaseId: lease.id,
							depositReceived: dep,
							outstandingRent: 0,
							damages: dmg,
							utilityCharges: 0,
							cleaningCharges: cln,
							restorationCharges: 0,
							otherDeductions: 0,
							refundableBalance: refundable,
							approval: idx === 2 ? "paid" : "pending_approval",
							settlementMode: "DEDUCT_FROM_DEPOSIT"
						});
						changed = true;
					}
				}
			});
			if (changed) try {
				localStorage.setItem("pms_settlement_cases_v2", JSON.stringify(updated));
			} catch {}
			return updated;
		});
	}, [leases]);
	const [realUnits, setRealUnits] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		async function fetchRealUnits() {
			try {
				const { supabase } = await import("./supabase-y7n1teoy.mjs").then((n) => n.V).then((n) => n.B);
				const [{ data: props }, { data: uns }] = await Promise.all([supabase.from("properties").select("id, title"), supabase.from("units").select("*")]);
				if (props && uns) {
					const propMap = new Map(props.map((p) => [p.id, p.title]));
					setRealUnits(uns.map((u) => ({
						id: u.id,
						property: propMap.get(u.property_id) || "Unknown Property",
						unit: u.unit_ref,
						status: u.status === "available" ? "Available" : u.status === "occupied" ? "Occupied" : u.status === "maintenance" ? "Vacant - Under Maintenance" : "Available",
						rent: Number(u.price || 0)
					})));
				}
			} catch (e) {
				console.error("Failed to load real units", e);
			}
		}
		fetchRealUnits();
	}, []);
	(0, import_react.useEffect)(() => {
		let channel = null;
		import("./supabase-y7n1teoy.mjs").then((n) => n.V).then((n) => n.B).then(({ supabase }) => {
			channel = supabase.channel(`leasing-page:leases:${Math.random().toString(36).substring(2, 9)}`).on("postgres_changes", {
				event: "UPDATE",
				schema: "public",
				table: "leases"
			}, (payload) => {
				const updated = payload.new;
				if (!updated?.lease_number) return;
				setLeases((prev) => prev.map((l) => l.id === updated.lease_number ? {
					...l,
					status: updated.lease_status ?? l.status
				} : l));
			}).subscribe();
		});
		return () => {
			if (channel) import("./supabase-y7n1teoy.mjs").then((n) => n.V).then((n) => n.B).then(({ supabase }) => {
				supabase.removeChannel(channel);
			});
		};
	}, []);
	const [viewCustomerOpen, setViewCustomerOpen] = (0, import_react.useState)(false);
	const [viewCustomerData, setViewCustomerData] = (0, import_react.useState)(null);
	const [editCustomerOpen, setEditCustomerOpen] = (0, import_react.useState)(false);
	const [editCustomerData, setEditCustomerData] = (0, import_react.useState)(null);
	const [bulkCustomerOpen, setBulkCustomerOpen] = (0, import_react.useState)(false);
	const [bulkCustomerCsv, setBulkCustomerCsv] = (0, import_react.useState)("");
	const [bulkLeaseOpen, setBulkLeaseOpen] = (0, import_react.useState)(false);
	const [bulkLeaseCsv, setBulkLeaseCsv] = (0, import_react.useState)("");
	const [bulkPdcOpen, setBulkPdcOpen] = (0, import_react.useState)(false);
	const [bulkPdcCsv, setBulkPdcCsv] = (0, import_react.useState)("");
	const [bulkDepositOpen, setBulkDepositOpen] = (0, import_react.useState)(false);
	const [bulkDepositCsv, setBulkDepositCsv] = (0, import_react.useState)("");
	const [bulkLeasingImporting, setBulkLeasingImporting] = (0, import_react.useState)(false);
	const [createLeaseOpen, setCreateLeaseOpen] = (0, import_react.useState)(false);
	const [selectedReservationForLease, setSelectedReservationForLease] = (0, import_react.useState)(null);
	const [createLeaseForm, setCreateLeaseForm] = (0, import_react.useState)({
		startDate: "",
		endDate: "",
		monthlyRent: "",
		securityDeposit: "",
		pdcCount: "12",
		paymentFrequency: "monthly",
		gracePeriodDays: "5",
		penalties: "Late payment and returned cheque penalties apply",
		maintenanceResponsibility: "Owner/Property Manager for major repairs; tenant for misuse",
		utilityResponsibility: "Tenant",
		parkingDetails: "Covered parking, 1 remote and access card",
		specialConditions: "",
		noticePeriodDays: "60"
	});
	const [releaseOpen, setReleaseOpen] = (0, import_react.useState)(false);
	const [selectedReservationForRelease, setSelectedReservationForRelease] = (0, import_react.useState)(null);
	const [releaseReason, setReleaseReason] = (0, import_react.useState)("");
	const [releaseType, setReleaseType] = (0, import_react.useState)("released");
	const [renewalNoticeOpen, setRenewalNoticeOpen] = (0, import_react.useState)(false);
	const [renewalNoticeForm, setRenewalNoticeForm] = (0, import_react.useState)({
		selectedLeaseId: "",
		rentIncreasePercent: "5",
		revisedTerms: "5% rent revision; notice period retained",
		proposedRenewalPeriod: "12 months",
		lastConfirmationDays: "30",
		additionalRecipients: "",
		notes: ""
	});
	const [editTermsOpen, setEditTermsOpen] = (0, import_react.useState)(false);
	const [selectedLeaseForTerms, setSelectedLeaseForTerms] = (0, import_react.useState)(null);
	const [agreementTermsForm, setAgreementTermsForm] = (0, import_react.useState)({
		paymentFrequency: "monthly",
		pdcCount: 12,
		gracePeriodDays: 5,
		penalties: "",
		maintenanceResponsibility: "",
		utilityResponsibility: "",
		parkingDetails: "",
		specialConditions: "",
		noticePeriodDays: 60
	});
	const [verifyDocOpen, setVerifyDocOpen] = (0, import_react.useState)(false);
	const [selectedDocId, setSelectedDocId] = (0, import_react.useState)(null);
	const [verifyDocForm, setVerifyDocForm] = (0, import_react.useState)({
		status: "verified",
		expiryDate: "",
		remarks: ""
	});
	const [uploadDocOpen, setUploadDocOpen] = (0, import_react.useState)(false);
	const [uploadDocForm, setUploadDocForm] = (0, import_react.useState)({
		file: "",
		fileName: "",
		remarks: ""
	});
	const [signatureWorkflowLease, setSignatureWorkflowLease] = (0, import_react.useState)(null);
	const [assets, setAssets] = (0, import_react.useState)([]);
	const [assetChanges, setAssetChanges] = (0, import_react.useState)({});
	const [assetLoading, setAssetLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		loadAssets();
	}, []);
	async function loadAssets() {
		setAssetLoading(true);
		try {
			const data = await fetchAssets();
			const allAssets = Array.isArray(data) && data.length > 0 ? data : createSampleAssetsForUnits(units);
			setAssets(allAssets || []);
			setAssetChanges(Object.fromEntries((allAssets || []).map((asset) => [asset.id, {
				condition: asset.asset_condition || "Good",
				imageFileName: ""
			}])));
		} catch (error) {
			console.error("Failed to load assets", error);
			const fallback = createSampleAssetsForUnits(units);
			setAssets(fallback);
			setAssetChanges(Object.fromEntries(fallback.map((asset) => [asset.id, {
				condition: asset.asset_condition || "Good",
				imageFileName: ""
			}])));
		} finally {
			setAssetLoading(false);
		}
	}
	async function saveAssetUpdate(assetId) {
		const change = assetChanges[assetId];
		if (!change) return;
		try {
			if (assetId.startsWith("demo-")) setAssets((items) => items.map((asset) => asset.id === assetId ? {
				...asset,
				asset_condition: change.condition,
				remarks: change.imageFileName ? `Image uploaded: ${change.imageFileName}` : asset.remarks
			} : asset));
			else {
				await updateAsset(assetId, {
					asset_condition: change.condition,
					remarks: change.imageFileName ? `Image uploaded: ${change.imageFileName}` : void 0
				});
				await loadAssets();
			}
			alert("Asset update saved.");
		} catch (error) {
			console.error("Failed to save asset update", error);
			alert("Unable to save asset update. Please try again.");
		}
	}
	async function saveAllAssetUpdates() {
		const entries = Object.entries(assetChanges);
		if (entries.length === 0) return;
		try {
			const demoEntries = entries.filter(([assetId]) => assetId.startsWith("demo-"));
			const realEntries = entries.filter(([assetId]) => !assetId.startsWith("demo-"));
			if (demoEntries.length > 0) setAssets((items) => items.map((asset) => {
				const change = assetChanges[asset.id];
				if (!asset.id.startsWith("demo-") || !change) return asset;
				return {
					...asset,
					asset_condition: change.condition,
					remarks: change.imageFileName ? `Image uploaded: ${change.imageFileName}` : asset.remarks
				};
			}));
			if (realEntries.length > 0) {
				await Promise.all(realEntries.map(([assetId, change]) => updateAsset(assetId, {
					asset_condition: change.condition,
					remarks: change.imageFileName ? `Image uploaded: ${change.imageFileName}` : void 0
				})));
				await loadAssets();
			}
			alert("Asset updates saved.");
		} catch (error) {
			console.error("Failed to save asset updates", error);
			alert("Unable to save asset updates. Please try again.");
		}
	}
	function updateAssetChange(assetId, partial) {
		setAssetChanges((prev) => ({
			...prev,
			[assetId]: {
				...prev[assetId],
				...partial
			}
		}));
	}
	const [keysWorkflowLease, setKeysWorkflowLease] = (0, import_react.useState)(null);
	const handoverAssets = (0, import_react.useMemo)(() => {
		if (!keysWorkflowLease) return [];
		const unit = units.find((item) => item.unit === keysWorkflowLease.unit);
		if (!unit) return [];
		return assets.filter((asset) => asset.assigned_unit_id === unit.id || asset.assigned_property_id === unit.id);
	}, [
		assets,
		keysWorkflowLease,
		units
	]);
	const [tenantSignOpen, setTenantSignOpen] = (0, import_react.useState)(false);
	const [tenantSignForm, setTenantSignForm] = (0, import_react.useState)({
		signedAt: today.toISOString().split("T")[0],
		signedDocument: "",
		receivedBy: "Leasing Department",
		remarks: ""
	});
	const [collectOpen, setCollectOpen] = (0, import_react.useState)(false);
	const [collectForm, setCollectForm] = (0, import_react.useState)({
		paymentMode: "PDC",
		chequeBank: "QNB",
		payerName: "",
		depositAmount: "",
		depositMode: "Cash",
		depositChequeNo: "",
		depositChequeBank: "",
		utilityDeposit: "0",
		qatarCoolDeposit: "0",
		reservationDeposit: "0",
		serviceFeeDeposit: "0",
		guaranteeChequeDeposit: "0",
		guaranteeChequeNo: "",
		guaranteeChequeBank: "QNB",
		agencyCommission: "0",
		adminCharges: "0",
		cashierName: "",
		notes: "",
		receiptFile: "",
		pdcCount: 12,
		startDate: today.toISOString().split("T")[0],
		endDate: addDays(today, 365),
		firstChequeDate: today.toISOString().split("T")[0],
		regularChequeAmount: "",
		customCheques: []
	});
	const [securityDepositOpen, setSecurityDepositOpen] = (0, import_react.useState)(false);
	const [securityDepositForm, setSecurityDepositForm] = (0, import_react.useState)({
		leaseId: "",
		amount: "",
		method: "Cash",
		receiptNo: "",
		chequeNo: "",
		bank: "",
		chequeDate: today.toISOString().split("T")[0],
		notes: ""
	});
	const [receiptModalOpen, setReceiptModalOpen] = (0, import_react.useState)(false);
	const [receiptModalData, setReceiptModalData] = (0, import_react.useState)(null);
	const [receiptModalSecondaryData, setReceiptModalSecondaryData] = (0, import_react.useState)(null);
	const [submitLandlordOpen, setSubmitLandlordOpen] = (0, import_react.useState)(false);
	const [submitLandlordForm, setSubmitLandlordForm] = (0, import_react.useState)({
		submittedTo: "",
		submittedAt: today.toISOString().split("T")[0],
		docsSent: "Email",
		notes: "",
		proofFile: ""
	});
	const [uploadAgreementOpen, setUploadAgreementOpen] = (0, import_react.useState)(false);
	const [uploadAgreementForm, setUploadAgreementForm] = (0, import_react.useState)({
		file: "",
		fileName: "",
		remarks: ""
	});
	const [landlordSignOpen, setLandlordSignOpen] = (0, import_react.useState)(false);
	const [landlordSignForm, setLandlordSignForm] = (0, import_react.useState)({
		signedAt: today.toISOString().split("T")[0],
		signedBy: "",
		signedDocument: "",
		sharedWithTenant: true,
		remarks: ""
	});
	const [keyNotifyOpen, setKeyNotifyOpen] = (0, import_react.useState)(false);
	const [keyNotifyForm, setKeyNotifyForm] = (0, import_react.useState)({
		handoverAt: addDays(today, 1),
		handoverTime: "10:00",
		recipients: [
			"Tenant",
			"Property Manager",
			"Concerned Property Staff",
			"Security",
			"Maintenance"
		],
		authorizedCollector: "",
		keysSummary: "2 metal keys, 2 access cards, 1 parking remote",
		staffContact: "Property Manager - +974 4400 2200",
		outstandingRequirements: "None",
		note: ""
	});
	const [handoverOpen, setHandoverOpen] = (0, import_react.useState)(false);
	const [handoverViewOpen, setHandoverViewOpen] = (0, import_react.useState)(false);
	const [selectedHandover, setSelectedHandover] = (0, import_react.useState)(null);
	const [handoverActiveTab, setHandoverActiveTab] = (0, import_react.useState)("details");
	const [handoverForm, setHandoverForm] = (0, import_react.useState)({
		handoverAt: addDays(today, 1),
		handoverTime: "10:00",
		keys: "2",
		keyType: "Metal door keys",
		accessCards: "2",
		parkingRemotes: "1",
		parkingDeviceDetails: "Remote for covered parking bay",
		electricityMeterReading: "",
		waterMeterReading: "",
		issuedBy: "Property Manager",
		collectorName: "",
		collectorIdNumber: "",
		unitCondition: "Good",
		cleanliness: "Clean",
		acWorking: true,
		plumbingOk: true,
		electricalOk: true,
		doorsWindowsOk: true,
		idVerified: true,
		photosTaken: "6",
		handoverPhotos: "",
		checklistDocument: "",
		assetChecklist: "",
		financeConfirmed: false,
		propertyManagerConfirmed: true,
		tenantConfirmed: false,
		tenantAcknowledgement: "Tenant acknowledged receipt of keys and access items.",
		note: ""
	});
	const [checkInForm, setCheckInForm] = (0, import_react.useState)({
		condition: "Good",
		furnitureCondition: "Good",
		fixturesCondition: "Good",
		wallFloorCeilingCondition: "Good",
		acCondition: "Operational",
		electricityMeter: "",
		waterMeter: "",
		damages: "",
		pendingMaintenance: "",
		photos: "8",
		note: ""
	});
	const [renewalResponseOpen, setRenewalResponseOpen] = (0, import_react.useState)(false);
	const [selectedRenewal, setSelectedRenewal] = (0, import_react.useState)(null);
	const [renewalResponseForm, setRenewalResponseForm] = (0, import_react.useState)({
		response: "confirm",
		confirmedRent: "",
		notes: "",
		updateStatus: "awaiting_response"
	});
	const [startCheckoutOpen, setStartCheckoutOpen] = (0, import_react.useState)(false);
	const [checkoutWorkflowLease, setCheckoutWorkflowLease] = (0, import_react.useState)(null);
	const [startCheckoutForm, setStartCheckoutForm] = (0, import_react.useState)({
		noticeDate: today.toISOString().split("T")[0],
		moveOutDate: "",
		inspectionDate: "",
		outstandingCharges: "Pending finance confirmation",
		utilityClearanceRequirements: "Final utility clearance required before checkout closure",
		keyReturnRequirements: "Return all keys, access cards, parking remotes and property items",
		notes: "",
		missingItems: "",
		cleaningCharges: "0",
		restorationCharges: "0"
	});
	const [checkoutActiveTab, setCheckoutActiveTab] = (0, import_react.useState)("condition");
	const [completeCheckoutOpen, setCompleteCheckoutOpen] = (0, import_react.useState)(false);
	const [selectedCheckout, setSelectedCheckout] = (0, import_react.useState)(null);
	const [completeCheckoutForm, setCompleteCheckoutForm] = (0, import_react.useState)({
		condition: "Repair required",
		electricityMeter: "",
		waterMeter: "",
		damages: "",
		missingItems: "",
		cleaningCharges: "0",
		restorationCharges: "0",
		outstandingRent: "0",
		damagesAmount: "0",
		utilityCharges: "0",
		otherDeductions: "0",
		daysOccupiedInMonth: "30",
		totalDaysInMonth: "30",
		currentMonthPdcDeposited: false,
		unusedRentRefund: "0",
		photos: "0",
		checkoutPhotos: "",
		checkoutReportFile: "",
		handoverConditionSummary: "",
		finalConditionSummary: "",
		financeClearance: false,
		utilityClearance: false,
		keysReturned: false,
		unitDisposition: "Vacant - Under Maintenance"
	});
	const [addPdcOpen, setAddPdcOpen] = (0, import_react.useState)(false);
	const [pdcLeaseId, setPdcLeaseId] = (0, import_react.useState)("");
	const [pdcRows, setPdcRows] = (0, import_react.useState)(() => Array.from({ length: 12 }, () => ({
		chequeNo: "",
		bank: "",
		amount: "",
		maturityDate: today.toISOString().split("T")[0],
		tenureStart: "",
		tenureEnd: "",
		file: ""
	})));
	const [addVoucherOpen, setAddVoucherOpen] = (0, import_react.useState)(false);
	const [addVoucherForm, setAddVoucherForm] = (0, import_react.useState)({
		leaseId: "",
		name: "Receipts Voucher - Rent",
		receiptNo: "",
		method: "PDC",
		period: "",
		debit: "PDC In Hand",
		credit: "",
		amount: "",
		createPdc: true,
		pdcChequeNo: "",
		pdcBank: "",
		pdcDate: today.toISOString().split("T")[0]
	});
	const [settleRefundOpen, setSettleRefundOpen] = (0, import_react.useState)(false);
	const [settleRefundStep, setSettleRefundStep] = (0, import_react.useState)(1);
	const [selectedSettlement, setSelectedSettlement] = (0, import_react.useState)(null);
	const [settleRefundForm, setSettleRefundForm] = (0, import_react.useState)({
		refundAmount: "",
		paymentMethod: "Bank Transfer",
		settlementMode: "DEDUCT_FROM_DEPOSIT",
		damagePaymentMode: "Bank Transfer",
		damages: "0",
		outstandingRent: "0",
		utilityCharges: "0",
		cleaningCharges: "0",
		restorationCharges: "0",
		otherDeductions: "0",
		daysOccupiedInMonth: "30",
		totalDaysInMonth: "30",
		currentMonthPdcDeposited: false,
		unusedRentRefund: "0",
		damageRemarks: "",
		notes: "",
		paymentRefNo: "",
		payerBank: "QNB",
		paymentDate: today.toISOString().split("T")[0],
		bgExpiryDate: "",
		paymentProofFileName: "",
		paymentProofData: "",
		refundBank: "Qatar National Bank (QNB)",
		refundIban: "",
		refundTxRef: "",
		refundChequeNo: "",
		refundChequeBank: "Qatar National Bank (QNB)",
		refundChequeDate: today.toISOString().split("T")[0],
		refundCashierName: "Treasury Department",
		refundPaymentDate: today.toISOString().split("T")[0],
		refundProofFileName: "",
		refundProofData: ""
	});
	const [discussRenewalOpen, setDiscussRenewalOpen] = (0, import_react.useState)(false);
	const [selectedDiscussRenewal, setSelectedDiscussRenewal] = (0, import_react.useState)(null);
	const [discussRenewalForm, setDiscussRenewalForm] = (0, import_react.useState)({
		discussedRent: "",
		proposedPeriod: "",
		tenantResponse: "positive",
		notes: "",
		nextFollowUpDate: ""
	});
	const [createReservationOpen, setCreateReservationOpen] = (0, import_react.useState)(false);
	const [createCustomerOpen, setCreateCustomerOpen] = (0, import_react.useState)(false);
	const [reservationForm, setReservationForm] = (0, import_react.useState)({
		property: "",
		unit: "AAA - GF2",
		tenantName: "",
		agent: "Marketing Agent",
		startDate: addDays(today, 10),
		validityDays: "7",
		rent: "5500",
		proposedEndDate: "",
		remarks: ""
	});
	const [customerForm, setCustomerForm] = (0, import_react.useState)({
		name: "",
		type: "individual",
		qatarId: "",
		passport: "",
		crNumber: "",
		nationality: "",
		mobile: "",
		email: "",
		permanentAddress: "",
		localAddress: "",
		authorizedSignatory: "",
		emergencyContact: "",
		employerInfo: ""
	});
	const activeReservations = (reservations || []).filter((item) => item?.status === "reserved").length;
	const blockedDocuments = (documents || []).filter((item) => item?.mandatory && item?.status !== "verified").length;
	const readyForKeys = (leases || []).filter((lease) => lease?.status === "fully_signed").length;
	const openSettlements = (settlements || []).filter((item) => item?.approval !== "paid").length;
	const upcomingRenewals = (0, import_react.useMemo)(() => (leases || []).filter((lease) => {
		if (!lease?.endDate) return false;
		const endTime = new Date(lease.endDate).getTime();
		if (isNaN(endTime)) return false;
		const todayTime = today instanceof Date ? today.getTime() : (/* @__PURE__ */ new Date()).getTime();
		const days = Math.ceil((endTime - todayTime) / 864e5);
		return days <= 60 && days >= 0 && lease.status !== "closed";
	}), [leases]);
	function withBusy(action, handler) {
		setBusyAction(action);
		window.setTimeout(() => {
			handler();
			setBusyAction("");
		}, 180);
	}
	function recordAudit(event) {
		setAuditEvents((items) => [{
			id: `a${items.length + 1}`,
			at: today.toISOString().split("T")[0],
			...event
		}, ...items]);
	}
	async function releaseFuturePdcExposure(lease, vacateDate) {
		try {
			const propId = String(lease.propertyId || "");
			const unitId = String(lease.unitId || "");
			const result = await settleEarlyLeaseVacate({
				leaseId: String(lease.id),
				tenantId: String(lease.customerId),
				propertyId: propId || void 0,
				unitId: unitId || void 0,
				unitName: lease.unit,
				vacateDate,
				leaseEndDate: lease.endDate
			});
			const futurePdcList = pdcs.filter((p) => p.leaseId === lease.id && new Date(p.date).getTime() > new Date(vacateDate).getTime() && [
				"received",
				"replaced",
				"in_hand",
				"partial_cash"
			].includes(p.status));
			const returnedIds = new Set(futurePdcList.map((p) => p.id));
			if (returnedIds.size > 0) setPdcs((items) => items.map((item) => returnedIds.has(item.id) ? {
				...item,
				status: "returned"
			} : item));
			for (const fp of futurePdcList) addFinanceStoreVoucher({
				voucher_no: `VCH-PDC-RET-${fp.chequeNo || fp.id}`,
				voucher_type: "Journal Voucher",
				date: vacateDate,
				name: `Early Vacate: Return Future PDC #${fp.chequeNo} (${lease.tenantName} - ${lease.unit})`,
				debit: "Customer PDC Liability",
				debit_code: "21400",
				credit: "PDC In Hand",
				credit_code: "12900",
				amount: fp.amount,
				method: "Cheque Return",
				property_name: lease.property,
				unit_ref: lease.unit,
				tenant_name: lease.tenantName
			});
			if (result.reversedRentAmount > 0) addFinanceStoreVoucher({
				voucher_no: `VCH-RENT-REV-${lease.id}`,
				voucher_type: "Journal Voucher",
				date: vacateDate,
				name: `Early Vacate: Reverse Unearned Rent Invoices (${lease.tenantName} - ${lease.unit})`,
				debit: "Rental Revenue (Unearned Reversal)",
				debit_code: "41100",
				credit: "Tenant Receivables",
				credit_code: "12413",
				amount: result.reversedRentAmount,
				method: "Revenue Normalization",
				property_name: lease.property,
				unit_ref: lease.unit,
				tenant_name: lease.tenantName
			});
			recordAudit({
				stage: "Early Vacate Finance Normalization",
				owner: "Finance Department",
				input: `${lease.tenantName} / ${lease.unit}; vacate ${vacateDate}; contractual expiry ${lease.endDate}`,
				approval: "Lease early termination settlement",
				status: "completed",
				output: `Reversed ${result.reversedInvoiceCount} future rent invoice(s) for ${formatMoney(result.reversedRentAmount)} and returned ${Math.max(result.returnedPdcCount, futurePdcList.length)} eligible future PDC(s) for ${formatMoney(result.returnedPdcAmount || futurePdcList.reduce((s, p) => s + p.amount, 0))}. GL/SL updated.`
			});
			return {
				returnedCount: Math.max(result.returnedPdcCount, futurePdcList.length),
				returnedAmount: result.returnedPdcAmount || futurePdcList.reduce((s, p) => s + p.amount, 0),
				reversedInvoiceCount: result.reversedInvoiceCount,
				reversedRentAmount: result.reversedRentAmount
			};
		} catch (error) {
			console.warn("[Early Vacate Finance] supplementary normalization notice:", error);
			recordAudit({
				stage: "Early Vacate Finance Normalization",
				owner: "Finance Department",
				input: `${lease.tenantName} / ${lease.unit}; vacate ${vacateDate}`,
				approval: "Partial – primary settlement posted successfully",
				status: "completed",
				output: `Primary settlement posted. Supplementary PDC normalization notice: ${error instanceof Error ? error.message : String(error)}. Finance team should verify any remaining future PDCs manually.`
			});
			return {
				returnedCount: 0,
				returnedAmount: 0,
				reversedInvoiceCount: 0,
				reversedRentAmount: 0
			};
		}
	}
	function createReservation() {
		const unit = (realUnits.length > 0 ? realUnits : units).find((item) => item.unit === reservationForm.unit);
		if (!unit || unit.status !== "Available") return;
		const reservation = {
			id: `r${reservations.length + 1}`,
			property: unit.property,
			unit: unit.unit,
			tenantName: reservationForm.tenantName || "Prospective Tenant",
			agent: reservationForm.agent,
			startDate: reservationForm.startDate,
			validUntil: addDays(today, Number(reservationForm.validityDays || 7)),
			rent: Number(reservationForm.rent || unit.rent),
			status: "reserved",
			remarks: reservationForm.remarks,
			proposedEndDate: reservationForm.proposedEndDate
		};
		setReservations((items) => [reservation, ...items]);
		setUnits((items) => items.map((item) => item.id === unit.id ? {
			...item,
			status: "Reserved"
		} : item));
		setReservationForm((form) => ({
			...form,
			tenantName: "",
			remarks: ""
		}));
		recordAudit({
			stage: "Unit Reservation",
			owner: "Marketing Agent",
			input: `${reservation.unit}, ${reservation.tenantName}, validity until ${reservation.validUntil}`,
			approval: "Lease Module reservation control",
			status: "Reserved",
			output: "Unit locked and unavailable for other offers"
		});
	}
	function releaseReservation(reservation, status) {
		setReservations((items) => items.map((item) => item.id === reservation.id ? {
			...item,
			status
		} : item));
		setUnits((items) => items.map((item) => item.unit === reservation.unit ? {
			...item,
			status: "Available"
		} : item));
		recordAudit({
			stage: "Reservation Notification",
			owner: "Leasing Department",
			input: `${reservation.unit} reservation ${status}`,
			approval: "Marketing/Leasing follow-up",
			status,
			output: "Agent notified and unit released to available stock"
		});
	}
	const nationalityOptions = (0, import_react.useMemo)(() => {
		return DynamicMastersService.getMasterStringOptions("nationality").map((name) => ({
			label: name,
			value: name
		}));
	}, []);
	const professionOptions = (0, import_react.useMemo)(() => {
		return DynamicMastersService.getMasterStringOptions("profession").map((name) => ({
			label: name,
			value: name
		}));
	}, []);
	function isCustomerDuplicate(form, excludeId) {
		return customers.some((customer) => {
			if (excludeId && customer.id === excludeId) return false;
			if (form.qatarId && customer.qatarId && form.qatarId.trim().toLowerCase() === customer.qatarId.trim().toLowerCase()) return true;
			if (form.passport && customer.passport && form.passport.trim().toLowerCase() === customer.passport.trim().toLowerCase()) return true;
			if (form.crNumber && customer.crNumber && form.crNumber.trim().toLowerCase() === customer.crNumber.trim().toLowerCase()) return true;
			if (form.mobile && customer.mobile && form.mobile.trim() === customer.mobile.trim()) return true;
			if (form.email && customer.email && form.email.trim().toLowerCase() === customer.email.trim().toLowerCase()) return true;
			return false;
		});
	}
	function validateCustomerIdentifiers(form) {
		if (form.type === "individual") {
			const qid = form.qatarId?.trim();
			if (qid && !/^\d{11}$/.test(qid)) return "Qatar ID (QID) must be exactly 11 numeric digits.";
			const passport = form.passport?.trim();
			if (passport && !/^[A-Za-z0-9]{9}$/.test(passport)) return "Passport Number must be exactly 9 alphanumeric characters.";
		}
		return null;
	}
	function createCustomer() {
		if (!customerForm.name.trim()) {
			alert("Please enter a customer name before saving.");
			return;
		}
		const valErr = validateCustomerIdentifiers(customerForm);
		if (valErr) {
			alert(valErr);
			return;
		}
		if (isCustomerDuplicate(customerForm)) {
			alert("A customer with the same Qatar ID, passport, CR number, mobile, or email already exists. Please verify unique identifiers before saving.");
			return;
		}
		const customer = {
			id: `c${customers.length + 1}`,
			...customerForm,
			status: "active"
		};
		setCustomers((items) => [customer, ...items]);
		const requiredDocs = customer.type === "company" ? [
			"Commercial Registration",
			"Computer Card",
			"Authorized signatory documents"
		] : [
			"Qatar ID",
			"Passport copy",
			"Residence permit"
		];
		setDocuments((items) => [...requiredDocs.map((name, index) => ({
			id: `d${documents.length + index + 1}`,
			customerId: customer.id,
			name,
			mandatory: true,
			status: "pending",
			issueDate: "",
			expiryDate: "",
			reviewer: "",
			remarks: "Awaiting upload"
		})), ...items]);
		setCustomerForm({
			name: "",
			type: "individual",
			qatarId: "",
			passport: "",
			crNumber: "",
			nationality: "",
			mobile: "",
			email: "",
			permanentAddress: "",
			localAddress: "",
			authorizedSignatory: "",
			emergencyContact: "",
			employerInfo: ""
		});
		recordAudit({
			stage: "Customer Master",
			owner: "Leasing Department",
			input: `${customer.name}, duplicate keys checked`,
			approval: "Customer activation",
			status: "active",
			output: "Tenant profile and mandatory document checklist created"
		});
	}
	function submitDocumentVerification() {
		if (!selectedDocId) return;
		setDocuments((items) => items.map((item) => item.id === selectedDocId ? {
			...item,
			status: verifyDocForm.status,
			expiryDate: verifyDocForm.status === "verified" ? verifyDocForm.expiryDate : item.expiryDate,
			reviewer: "Leasing Department",
			remarks: verifyDocForm.remarks || (verifyDocForm.status === "verified" ? "Verified and accepted" : verifyDocForm.status === "rejected" ? "Rejected by reviewer" : item.remarks)
		} : item));
		recordAudit({
			stage: "Document Verification",
			owner: "Leasing Department",
			input: `Doc ${selectedDocId} status ${verifyDocForm.status}`,
			approval: "Verification complete",
			status: verifyDocForm.status,
			output: verifyDocForm.remarks || `Document marked as ${verifyDocForm.status}`
		});
		setVerifyDocOpen(false);
	}
	function submitUploadDoc() {
		if (!selectedDocId || !uploadDocForm.file) {
			alert("Please select a file to upload.");
			return;
		}
		setDocuments((items) => items.map((item) => item.id === selectedDocId ? {
			...item,
			file: uploadDocForm.fileName || uploadDocForm.file,
			status: "pending",
			remarks: uploadDocForm.remarks || "Document uploaded and awaiting review"
		} : item));
		recordAudit({
			stage: "Document Upload",
			owner: "Leasing Department",
			input: `Doc ${selectedDocId} uploaded file: ${uploadDocForm.fileName || uploadDocForm.file}`,
			approval: "N/A",
			status: "pending",
			output: uploadDocForm.remarks || "Document uploaded successfully"
		});
		setUploadDocOpen(false);
	}
	function submitAgreementTerms() {
		if (!selectedLeaseForTerms) return;
		setLeases((items) => items.map((item) => item.id === selectedLeaseForTerms ? {
			...item,
			...agreementTermsForm
		} : item));
		recordAudit({
			stage: "Agreement Terms",
			owner: "Leasing Department",
			input: `Lease ${selectedLeaseForTerms}`,
			approval: "Terms Updated",
			status: "Updated",
			output: "Agreement terms and schedule updated"
		});
		setEditTermsOpen(false);
	}
	function openCreateLeaseDialog(reservation) {
		setSelectedReservationForLease(reservation);
		setCreateLeaseForm((f) => ({
			...f,
			startDate: reservation.startDate,
			endDate: addDays(new Date(reservation.startDate), 365),
			monthlyRent: String(reservation.rent),
			securityDeposit: String(reservation.rent),
			specialConditions: reservation.remarks || ""
		}));
		setCreateLeaseOpen(true);
	}
	function createLeaseFromReservation(reservation, formOverride) {
		const form = formOverride ?? createLeaseForm;
		const customer = customers.find((item) => item.name.toLowerCase() === reservation.tenantName.toLowerCase() && item.status === "active");
		if (!customer) {
			alert(`No active customer found for "${reservation.tenantName}". Please create the customer in Customer Master first.`);
			return;
		}
		const docsVerified = documents.filter((item) => item.customerId === customer.id && item.mandatory).every((item) => item.status === "verified");
		const lease = {
			id: `l${leases.length + 1}`,
			customerId: customer.id,
			reservationId: reservation.id,
			property: reservation.property,
			unit: reservation.unit,
			tenantName: customer.name,
			startDate: form.startDate || reservation.startDate,
			endDate: form.endDate || addDays(new Date(reservation.startDate), 365),
			monthlyRent: Number(form.monthlyRent) || reservation.rent,
			securityDeposit: Number(form.securityDeposit) || reservation.rent,
			pdcCount: Number(form.pdcCount) || 12,
			paymentFrequency: form.paymentFrequency,
			gracePeriodDays: Number(form.gracePeriodDays) || 5,
			penalties: form.penalties,
			maintenanceResponsibility: form.maintenanceResponsibility,
			utilityResponsibility: form.utilityResponsibility,
			parkingDetails: form.parkingDetails,
			specialConditions: form.specialConditions || reservation.remarks || "No special conditions",
			noticePeriodDays: Number(form.noticePeriodDays) || 60,
			status: docsVerified ? "documents_verified" : "documents_pending",
			collectionCompleted: false
		};
		setLeases((items) => [lease, ...items]);
		setReservations((items) => items.map((item) => item.id === reservation.id ? {
			...item,
			status: "converted"
		} : item));
		setCreateLeaseOpen(false);
		setSelectedReservationForLease(null);
		recordAudit({
			stage: "Lease Agreement Creation",
			owner: "Leasing Department",
			input: `${lease.tenantName}, ${lease.unit}, ${lease.paymentFrequency}, ${formatMoney(lease.monthlyRent)}`,
			approval: docsVerified ? "Document gate passed" : "Document gate pending",
			status: lease.status,
			output: "Lease agreement created with rent schedule terms"
		});
		recordAudit({
			stage: "Property Manager Handoff",
			owner: "Leasing Department",
			input: `${lease.tenantName}, ${lease.unit}, lease ${lease.id}`,
			approval: "Property Manager review required",
			status: "pending_approval",
			output: "Lease package forwarded to Property Manager for operational review"
		});
		if (customer.email) supabase.auth.getSession().then(({ data }) => {
			const accessToken = data.session?.access_token;
			if (!accessToken) throw new Error("Your Leasing session has expired. Please sign in again.");
			return fetch("/api/provision-tenant", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`
				},
				body: JSON.stringify({
					email: customer.email,
					fullName: customer.name
				})
			});
		}).then(async (response) => {
			const result = await response.json().catch(() => ({}));
			if (!response.ok) throw new Error(result.error || "Tenant account provisioning failed.");
			toast.success(`Tenant login created for ${result.email}. Initial password: Mindz@007`);
		}).catch((error) => toast.error(error instanceof Error ? error.message : "Tenant account provisioning failed."));
	}
	function openReleaseDialog(reservation) {
		setSelectedReservationForRelease(reservation);
		setReleaseReason("");
		setReleaseType(isExpired(reservation.validUntil) ? "expired" : "released");
		setReleaseOpen(true);
	}
	function confirmRelease() {
		if (!selectedReservationForRelease) return;
		releaseReservation(selectedReservationForRelease, releaseType);
		setReleaseOpen(false);
		setSelectedReservationForRelease(null);
	}
	function advanceLease(lease, status, patch = {}) {
		const fullPatch = {
			status,
			...patch
		};
		setLeases((items) => items.map((item) => item.id === lease.id ? {
			...item,
			...fullPatch
		} : item));
		recordAudit({
			stage: status === "tenant_signed_pending_collection" ? "Tenant Signature" : status === "fully_signed" ? "Landlord Signature" : status === "collection_completed" ? "Collection" : "Lease Status",
			owner: status === "tenant_signed_pending_collection" ? "Tenant/Leasing" : status === "fully_signed" ? "Landlord" : "Leasing Department",
			input: `${lease.tenantName}, ${lease.unit}`,
			approval: status === "fully_signed" ? "Landlord or authorized signatory" : "Workflow action",
			status,
			output: status === "fully_signed" ? "Fully signed lease uploaded and shared with tenant" : "Lease status updated"
		});
	}
	function submitTenantSign() {
		if (!signatureWorkflowLease) return;
		advanceLease(signatureWorkflowLease, "tenant_signed_pending_collection", {
			tenantSignedAt: tenantSignForm.signedAt,
			signedDocument: tenantSignForm.signedDocument || `tenant-signed-${signatureWorkflowLease.id}.pdf`,
			receivedBy: tenantSignForm.receivedBy
		});
		setTenantSignOpen(false);
	}
	async function submitCollect() {
		if (!signatureWorkflowLease) return;
		const lease = signatureWorkflowLease;
		let nextPdcs = [];
		if (collectForm.customCheques && collectForm.customCheques.length > 0) nextPdcs = collectForm.customCheques.filter((c) => c.chequeNo && c.chequeNo.trim() !== "" && Number(c.amount) > 0).map((c, index) => ({
			id: `p${pdcs.length + index + 1}`,
			leaseId: lease.id,
			chequeNo: c.chequeNo,
			bank: c.bank || collectForm.chequeBank || "Tenant Bank",
			date: c.date,
			amount: Number(c.amount),
			payerName: collectForm.payerName || lease.tenantName,
			period: c.period || (c.tenureStart && c.tenureEnd ? `${c.tenureStart} to ${c.tenureEnd}` : `PDC ${index + 1}`),
			tenureStart: c.tenureStart,
			tenureEnd: c.tenureEnd,
			status: "received"
		}));
		else {
			const count = Number(collectForm.pdcCount) || lease.pdcCount || 12;
			const totalRent = (lease.monthlyRent || 0) * (lease.pdcCount || 12);
			const regularAmt = Number(collectForm.regularChequeAmount) || lease.monthlyRent;
			const firstChequeStr = collectForm.firstChequeDate || collectForm.startDate || lease.startDate;
			const leaseStartStr = lease.startDate || firstChequeStr;
			nextPdcs = Array.from({ length: count }, (_, index) => {
				let amount = regularAmt;
				if (index === count - 1 && count > 1 && regularAmt * (count - 1) < totalRent) amount = totalRent - regularAmt * (count - 1);
				const bd = new Date(firstChequeStr);
				const day = bd.getDate();
				const rawMonth = bd.getMonth() + index;
				const yr = bd.getFullYear() + Math.floor(rawMonth / 12);
				const mo = (rawMonth % 12 + 12) % 12;
				const lastDay = new Date(yr, mo + 1, 0).getDate();
				const maturityStr = `${yr}-${String(mo + 1).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
				const tsDate = new Date(leaseStartStr);
				tsDate.setMonth(tsDate.getMonth() + index);
				const teDate = new Date(leaseStartStr);
				teDate.setMonth(teDate.getMonth() + index + 1);
				teDate.setDate(teDate.getDate() - 1);
				return {
					id: `p${pdcs.length + index + 1}`,
					leaseId: lease.id,
					chequeNo: `PDC-${lease.unit.replace(/\W/g, "")}-${String(index + 1).padStart(3, "0")}`,
					bank: collectForm.chequeBank || "Tenant Bank",
					date: maturityStr,
					amount: Math.max(0, amount),
					payerName: collectForm.payerName || lease.tenantName,
					period: `Cheque ${index + 1} of ${count}`,
					tenureStart: tsDate.toISOString().split("T")[0],
					tenureEnd: teDate.toISOString().split("T")[0],
					status: "received"
				};
			});
		}
		const pdcTotal = nextPdcs.reduce((sum, pdc) => sum + pdc.amount, 0);
		const agencyAmt = Number(collectForm.agencyCommission) || 0;
		const adminAmt = Number(collectForm.adminCharges) || 0;
		const utilityAmt = Number(collectForm.utilityDeposit) || 0;
		const qatarCoolAmt = Number(collectForm.qatarCoolDeposit) || 0;
		const reservationAmt = Number(collectForm.reservationDeposit) || 0;
		const serviceFeeAmt = Number(collectForm.serviceFeeDeposit) || 0;
		const guaranteeChequeAmt = Number(collectForm.guaranteeChequeDeposit) || 0;
		const depAmt = Number(collectForm.depositAmount) || lease.securityDeposit;
		const today_str = today.toISOString().split("T")[0];
		`${lease.id.toUpperCase()}${Date.now().toString().slice(-6)}`;
		const newVouchers = [
			{
				id: `v${vouchers.length + 1}`,
				leaseId: lease.id,
				name: "Receipts Voucher - Rent PDC",
				receiptNo: `RV-${lease.id}-01`,
				method: collectForm.paymentMode,
				period: `${collectForm.startDate || lease.startDate} to ${collectForm.endDate || lease.endDate}`,
				debit: "PDC In Hand (12900001)",
				credit: `Customer(PDC)-${lease.unit} (21400)`,
				amount: pdcTotal,
				status: "posted"
			},
			...depAmt > 0 ? [{
				id: `v${vouchers.length + 2}`,
				leaseId: lease.id,
				name: "Receipts Voucher - Security Deposit",
				receiptNo: `RV-${lease.id}-02`,
				method: collectForm.depositMode,
				period: "Security deposit",
				debit: collectForm.depositMode === "Cash" ? "Cash In Hand" : "Bank Operating Account",
				credit: `Security Deposit Liability - ${lease.unit} (21500)`,
				amount: depAmt,
				status: "posted"
			}] : [],
			...utilityAmt > 0 ? [{
				id: `v${vouchers.length + 3}`,
				leaseId: lease.id,
				name: "Receipts Voucher - Kahramaa Deposit",
				receiptNo: `RV-${lease.id}-UTL`,
				method: "Cash",
				period: "Kahramaa utility deposit",
				debit: "Cash In Hand",
				credit: "Kahramaa Deposit (21100003)",
				amount: utilityAmt,
				status: "posted"
			}] : [],
			...qatarCoolAmt > 0 ? [{
				id: `v${vouchers.length + 4}`,
				leaseId: lease.id,
				name: "Receipts Voucher - Qatar Cool Deposit",
				receiptNo: `RV-${lease.id}-QC`,
				method: "Cash",
				period: "Qatar Cool utility deposit",
				debit: "Cash In Hand",
				credit: "Qatar Cool Deposit (21100004)",
				amount: qatarCoolAmt,
				status: "posted"
			}] : [],
			...reservationAmt > 0 ? [{
				id: `v${vouchers.length + 5}`,
				leaseId: lease.id,
				name: "Receipts Voucher - Reservation Advance",
				receiptNo: `RV-${lease.id}-RES`,
				method: "Cash",
				period: "Reservation advance",
				debit: "Cash In Hand",
				credit: "Reservation Advance (21100001)",
				amount: reservationAmt,
				status: "posted"
			}] : [],
			...serviceFeeAmt > 0 ? [{
				id: `v${vouchers.length + 6}`,
				leaseId: lease.id,
				name: "Receipts Voucher - Service Fee Deposit",
				receiptNo: `RV-${lease.id}-SVC`,
				method: "Cash",
				period: "Service fee deposit",
				debit: "Cash In Hand",
				credit: "Service Fee Deposit (21100005)",
				amount: serviceFeeAmt,
				status: "posted"
			}] : [],
			...guaranteeChequeAmt > 0 ? [{
				id: `v${vouchers.length + 7}`,
				leaseId: lease.id,
				name: "Receipts Voucher - Guarantee Cheque",
				receiptNo: `RV-${lease.id}-GCHQ`,
				method: "Guarantee Cheque",
				period: "Guarantee cheque security",
				debit: "Deposit-PDC In Hand (12900002)",
				credit: "Guarantee Cheque Received (21200001)",
				amount: guaranteeChequeAmt,
				status: "posted"
			}] : [],
			...agencyAmt > 0 ? [{
				id: `v${vouchers.length + 8}`,
				leaseId: lease.id,
				name: "Agency Commission - Finance Mapping Required",
				receiptNo: `RV-${lease.id}-AGN`,
				method: "Cash",
				period: "One-time fee",
				debit: "Cash In Hand",
				credit: "Unmapped Finance Master Account",
				amount: agencyAmt,
				status: "draft"
			}] : [],
			...adminAmt > 0 ? [{
				id: `v${vouchers.length + 9}`,
				leaseId: lease.id,
				name: "Admin Charges - Finance Mapping Required",
				receiptNo: `RV-${lease.id}-ADM`,
				method: "Cash",
				period: "One-time fee",
				debit: "Cash In Hand",
				credit: "Unmapped Finance Master Account",
				amount: adminAmt,
				status: "draft"
			}] : []
		];
		try {
			const leaseIdValue = String(lease.id);
			const { data: financeLease } = await (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(leaseIdValue) ? supabase.from("leases").select("id, customer_id, property_id, unit_id").eq("id", leaseIdValue).maybeSingle() : supabase.from("leases").select("id, customer_id, property_id, unit_id").eq("lease_number", leaseIdValue).maybeSingle());
			if (financeLease?.id && financeLease.customer_id && financeLease.property_id && financeLease.unit_id) {
				if (pdcTotal > 0) for (const pdc of nextPdcs) await receivePdc({
					cheque_number: pdc.chequeNo,
					cheque_date: pdc.date,
					amount: pdc.amount,
					tenant_id: String(financeLease.customer_id),
					property_id: String(financeLease.property_id),
					unit_id: String(financeLease.unit_id),
					lease_id: String(financeLease.id),
					unitCode: lease.unit,
					pdcType: "RENT_PDC"
				});
				const depositCollections = [
					{
						amount: depAmt,
						type: "SECURITY",
						mode: collectForm.depositMode === "Cash" ? "Cash" : "Bank"
					},
					{
						amount: utilityAmt,
						type: "KAHRAMAA",
						mode: "Cash"
					},
					{
						amount: qatarCoolAmt,
						type: "QATAR_COOL",
						mode: "Cash"
					},
					{
						amount: reservationAmt,
						type: "RESERVATION",
						mode: "Cash"
					},
					{
						amount: serviceFeeAmt,
						type: "SERVICE_FEE",
						mode: "Cash"
					}
				];
				for (const deposit of depositCollections) {
					if (deposit.amount <= 0) continue;
					await collectSecurityDeposit({
						amount: deposit.amount,
						tenant_id: String(financeLease.customer_id),
						property_id: String(financeLease.property_id),
						unit_id: String(financeLease.unit_id),
						lease_id: String(financeLease.id),
						mode: deposit.mode,
						depositType: deposit.type,
						unit_name: lease.unit,
						ref: `RV-${lease.id}-${deposit.type}`
					});
				}
				if (guaranteeChequeAmt > 0) await postGuaranteeCheque({
					amount: guaranteeChequeAmt,
					tenantId: String(financeLease.customer_id),
					propertyId: String(financeLease.property_id),
					unitId: String(financeLease.unit_id),
					leaseId: String(financeLease.id),
					chequeNumber: collectForm.guaranteeChequeNo || `GNT-${lease.id}`,
					unitCode: lease.unit
				});
			}
		} catch (err) {
			console.warn("Authoritative finance posting skipped for in-memory/demo record:", err);
		}
		setPdcs((items) => [...nextPdcs, ...items]);
		if (agencyAmt > 0 || adminAmt > 0) toast.warning("Agency/Admin charges remain draft because no authoritative Finance Master account rule exists for those charge types.");
		setVouchers((items) => [...newVouchers, ...items]);
		newVouchers.forEach((v) => {
			const drCode = v.debit.includes("12900002") ? "12900" : v.debit.includes("12900") ? "12900" : v.debit.toLowerCase().includes("cash") ? "12100" : "12000";
			const crCode = v.credit.includes("21400") ? "21400" : v.credit.includes("21500") ? "21500" : v.credit.includes("21100001") ? "21100" : v.credit.includes("21100003") ? "21100" : v.credit.includes("21100004") ? "21100" : v.credit.includes("21100005") ? "21100" : v.credit.includes("21200001") ? "21200" : v.credit.includes("21100") ? "21100" : "41100";
			addFinanceStoreVoucher({
				voucher_no: v.receiptNo || `RV-${lease.id}-${Date.now().toString().slice(-4)}`,
				voucher_type: "Receipt Voucher",
				date: today_str,
				name: `${v.name} — ${lease.tenantName} (${lease.unit})`,
				debit: v.debit,
				debit_code: drCode,
				credit: v.credit,
				credit_code: crCode,
				amount: v.amount,
				method: v.method,
				property_name: lease.property,
				unit_ref: lease.unit,
				tenant_name: lease.tenantName
			});
		});
		if (depAmt > 0 && collectForm.depositMode === "Cash") addCashBookEntry({
			date: today_str,
			voucher: `RV-${lease.id}-02`,
			description: `Unit Security Deposit Cash — ${lease.tenantName} / ${lease.unit}`,
			type: "in",
			amount: depAmt
		});
		if (utilityAmt > 0) addCashBookEntry({
			date: today_str,
			voucher: `RV-${lease.id}-UTL`,
			description: `Kahramaa Utility Deposit — ${lease.tenantName} / ${lease.unit}`,
			type: "in",
			amount: utilityAmt
		});
		if (qatarCoolAmt > 0) addCashBookEntry({
			date: today_str,
			voucher: `RV-${lease.id}-QC`,
			description: `Qatar Cool Utility Deposit — ${lease.tenantName} / ${lease.unit}`,
			type: "in",
			amount: qatarCoolAmt
		});
		if (reservationAmt > 0) addCashBookEntry({
			date: today_str,
			voucher: `RV-${lease.id}-RES`,
			description: `Reservation Advance — ${lease.tenantName} / ${lease.unit}`,
			type: "in",
			amount: reservationAmt
		});
		if (serviceFeeAmt > 0) addCashBookEntry({
			date: today_str,
			voucher: `RV-${lease.id}-SVC`,
			description: `Service Fee Deposit — ${lease.tenantName} / ${lease.unit}`,
			type: "in",
			amount: serviceFeeAmt
		});
		advanceLease(lease, "collection_completed", {
			collectionCompleted: true,
			pdcCount: nextPdcs.length,
			startDate: collectForm.startDate || lease.startDate,
			endDate: collectForm.endDate || lease.endDate
		});
		recordAudit({
			stage: "Collection & Receipt Generation",
			owner: `Finance Cashier${collectForm.cashierName ? " – " + collectForm.cashierName : ""}`,
			input: `${nextPdcs.length} PDCs (${collectForm.chequeBank}), deposit ${collectForm.depositMode}${agencyAmt > 0 ? ", agency commission " + formatMoney(agencyAmt) : ""}${adminAmt > 0 ? ", admin charges " + formatMoney(adminAmt) : ""}${utilityAmt > 0 ? ", utility deposit " + formatMoney(utilityAmt) : ""}`,
			approval: "Cashier receipt posting",
			status: "collection_completed",
			output: (collectForm.notes || "Rent, deposit and fee collection receipts generated") + (collectForm.receiptFile ? ` (Proof: ${collectForm.receiptFile})` : "")
		});
		const totalCollectedAmt = pdcTotal + depAmt + agencyAmt + adminAmt + utilityAmt + qatarCoolAmt + reservationAmt + serviceFeeAmt + guaranteeChequeAmt;
		setReceiptModalData({
			receiptNo: `REC-${Date.now().toString().slice(-6)}`,
			acknowledgementNo: `ACK-${lease.id.toUpperCase()}`,
			date: today.toISOString().split("T")[0],
			tenantName: lease.tenantName,
			tenantPhone: lease.phone || "",
			tenantEmail: lease.email || "",
			tenantQid: lease.qatarId || "",
			propertyName: lease.property,
			unitRef: lease.unit,
			leaseNo: `LES-${lease.id.toUpperCase()}`,
			leaseStartDate: collectForm.startDate || lease.startDate,
			leaseEndDate: collectForm.endDate || lease.endDate,
			monthlyRent: lease.monthlyRent,
			totalContractRent: pdcTotal,
			depositAmount: depAmt,
			depositMode: collectForm.depositMode,
			pdcCount: nextPdcs.length,
			pdcs: nextPdcs.map((p) => ({
				chequeNo: p.chequeNo,
				bank: p.bank,
				date: p.date,
				amount: p.amount,
				period: p.period,
				tenureStart: p.tenureStart,
				tenureEnd: p.tenureEnd
			})),
			vouchers: newVouchers.map((v) => ({
				receiptNo: v.receiptNo,
				name: v.name,
				amount: v.amount,
				method: v.method,
				debit: v.debit,
				credit: v.credit
			})),
			agencyCommission: agencyAmt,
			adminCharges: adminAmt,
			utilityDeposit: utilityAmt,
			totalCollected: totalCollectedAmt,
			cashierName: collectForm.cashierName || "Finance Cashier",
			notes: collectForm.notes || "Official receipt acknowledged for rent cheques, security deposit, and applicable fees."
		});
		setReceiptModalOpen(true);
		setCollectOpen(false);
	}
	function submitToLandlord() {
		if (!signatureWorkflowLease) return;
		advanceLease(signatureWorkflowLease, "pending_landlord_signature", { landlordPackageSubmittedAt: submitLandlordForm.submittedAt });
		recordAudit({
			stage: "Submit to Landlord",
			owner: "Leasing Department",
			input: `Sent to ${submitLandlordForm.submittedTo} via ${submitLandlordForm.docsSent}`,
			approval: "Landlord package submission",
			status: "pending_landlord_signature",
			output: (submitLandlordForm.notes || "Package submitted to owner/landlord") + (submitLandlordForm.proofFile ? ` (Proof: ${submitLandlordForm.proofFile})` : "")
		});
		setSubmitLandlordOpen(false);
	}
	async function downloadLeaseAgreement(lease) {
		try {
			const blob = await generateLeaseAgreementBlob({
				tenantName: lease.tenantName,
				landlordName: "Landlord",
				propertyAddress: lease.property,
				unit: lease.unit,
				startDate: lease.startDate,
				endDate: lease.endDate,
				monthlyRent: lease.monthlyRent,
				securityDeposit: lease.securityDeposit,
				depositNonRefundable: "QR 0 or as agreed",
				leaseNo: `LES-${lease.id}`,
				paymentFrequency: lease.paymentFrequency,
				pdcCount: lease.pdcCount,
				gracePeriodDays: lease.gracePeriodDays,
				penalties: lease.penalties,
				maintenanceResponsibility: lease.maintenanceResponsibility,
				utilityResponsibility: lease.utilityResponsibility,
				parkingDetails: lease.parkingDetails,
				specialConditions: lease.specialConditions,
				noticePeriodDays: lease.noticePeriodDays
			});
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = `${lease.tenantName.replace(/\W+/g, "-")}-${lease.unit}-Lease-Agreement.pdf`;
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error(error);
			alert("Failed to generate lease agreement PDF. Please try again.");
		}
	}
	function submitUploadAgreement() {
		if (!signatureWorkflowLease) return;
		advanceLease(signatureWorkflowLease, "fully_signed", {
			landlordSignedAt: today.toISOString().split("T")[0],
			signedDocument: uploadAgreementForm.fileName || uploadAgreementForm.file,
			sharedWithTenant: true
		});
		recordAudit({
			stage: "Upload Agreement",
			owner: "Leasing Department",
			input: `Uploaded agreement file ${uploadAgreementForm.fileName || uploadAgreementForm.file}`,
			approval: "Agreement upload",
			status: "fully_signed",
			output: uploadAgreementForm.remarks || "Lease agreement uploaded and recorded."
		});
		setUploadAgreementOpen(false);
	}
	function submitLandlordSign() {
		if (!signatureWorkflowLease) return;
		advanceLease(signatureWorkflowLease, "fully_signed", {
			landlordSignedAt: landlordSignForm.signedAt,
			signedDocument: landlordSignForm.signedDocument || `fully-signed-${signatureWorkflowLease.id}.pdf`,
			sharedWithTenant: landlordSignForm.sharedWithTenant
		});
		setLandlordSignOpen(false);
	}
	async function addVoucher() {
		const { leaseId, name, receiptNo, method, period, amount, createPdc, pdcChequeNo, pdcBank, pdcDate } = addVoucherForm;
		if (!leaseId || !amount || !name) {
			alert("Please fill Lease, Voucher Name, and Amount.");
			return;
		}
		const accounts = getVoucherAccounts(name, leases.find((l) => l.id === leaseId)?.unit || "Unit", method);
		const numAmount = Number(amount) || 0;
		const vchNo = receiptNo || `VCH-${Date.now()}`;
		const newVoucher = {
			id: `v${vouchers.length + 1}`,
			leaseId,
			name,
			receiptNo: vchNo,
			method,
			period,
			debit: accounts.debit,
			credit: accounts.credit,
			amount: numAmount,
			status: "draft"
		};
		setVouchers((items) => [newVoucher, ...items]);
		if ((method === "PDC" || method === "Guarantee Cheque") && createPdc && pdcChequeNo) {
			const newPdc = {
				id: `p${pdcs.length + 1}`,
				leaseId,
				chequeNo: pdcChequeNo,
				bank: pdcBank || "Tenant Bank",
				date: pdcDate,
				amount: numAmount,
				status: "received"
			};
			setPdcs((items) => [newPdc, ...items]);
		}
		toast.warning("Manual voucher saved as Draft. Post it through the applicable Finance workflow so GL/SL is resolved from Finance Master.");
		recordAudit({
			stage: "Voucher Created",
			owner: "Finance Department",
			input: `${name} — ${method} — ${period || "-"}`,
			approval: "Manual entry",
			status: "draft",
			output: `Voucher ${newVoucher.receiptNo} saved as draft for Finance review; it was not posted directly to the ledger.`
		});
		setAddVoucherOpen(false);
		setAddVoucherForm({
			leaseId: "",
			name: "Receipts Voucher - Rent",
			receiptNo: "",
			method: "PDC",
			period: "",
			debit: "PDC In Hand",
			credit: "Rental Income",
			amount: "",
			createPdc: true,
			pdcChequeNo: "",
			pdcBank: "",
			pdcDate: today.toISOString().split("T")[0]
		});
	}
	function discussRenewal() {
		if (!selectedDiscussRenewal) return;
		setRenewals((items) => items.map((item) => item.id === selectedDiscussRenewal.id ? {
			...item,
			status: "under_discussion",
			proposedRent: discussRenewalForm.discussedRent ? Number(discussRenewalForm.discussedRent) : item.proposedRent,
			proposedPeriod: discussRenewalForm.proposedPeriod || item.proposedPeriod,
			outstandingObligations: discussRenewalForm.notes ? item.outstandingObligations + ` | Notes: ${discussRenewalForm.notes}` : item.outstandingObligations,
			lastConfirmationDate: discussRenewalForm.nextFollowUpDate || item.lastConfirmationDate
		} : item));
		recordAudit({
			stage: "Renewal Discussion",
			owner: "Leasing Department",
			input: `Tenant response: ${discussRenewalForm.tenantResponse}${discussRenewalForm.discussedRent ? ` | Discussed rent: QR ${discussRenewalForm.discussedRent}` : ""}`,
			approval: "Leasing manager review",
			status: "under_discussion",
			output: discussRenewalForm.notes || "Renewal discussion recorded. Follow-up scheduled."
		});
		setDiscussRenewalOpen(false);
		setSelectedDiscussRenewal(null);
		setDiscussRenewalForm({
			discussedRent: "",
			proposedPeriod: "",
			tenantResponse: "positive",
			notes: "",
			nextFollowUpDate: ""
		});
	}
	function generateRenewalNotices(form) {
		const f = form ?? renewalNoticeForm;
		const increaseMultiplier = 1 + (Number(f.rentIncreasePercent) || 5) / 100;
		const existing = new Set(renewals.map((item) => item.leaseId));
		const next = upcomingRenewals.filter((lease) => !existing.has(lease.id)).map((lease, index) => ({
			id: `rn${renewals.length + index + 1}`,
			leaseId: lease.id,
			noticeDate: today.toISOString().split("T")[0],
			status: "awaiting_response",
			proposedRent: Math.round(lease.monthlyRent * increaseMultiplier),
			proposedPeriod: f.proposedRenewalPeriod || `${addDays(new Date(lease.endDate), 1)} to ${addDays(new Date(lease.endDate), 366)}`,
			revisedTerms: f.revisedTerms || `${f.rentIncreasePercent}% rent revision, ${lease.noticePeriodDays}-day notice period retained`,
			expiryDate: lease.endDate,
			requiredNoticePeriod: `${lease.noticePeriodDays} days`,
			lastConfirmationDate: addDays(new Date(lease.endDate), -(Number(f.lastConfirmationDays) || 30)),
			outstandingObligations: "Finance to confirm outstanding rent, PDC and maintenance obligations",
			recipients: `Tenant, Leasing Department, Marketing Agent, Property Manager, Landlord or Authorized Person${f.additionalRecipients ? `, ${f.additionalRecipients}` : ""}`,
			followUpOwner: "Leasing Department"
		}));
		setRenewals((items) => [...next, ...items]);
		setRenewalNoticeOpen(false);
		if (next.length > 0) recordAudit({
			stage: "Lease Renewal Notification",
			owner: "System",
			input: `Leases expiring within 60 days; ${f.rentIncreasePercent}% increase proposed`,
			approval: "Automatic rule + manual override",
			status: "notified",
			output: `${next.length} renewal notice(s) generated at least 60 days before expiry with proposed terms and recipients`
		});
		else alert("No leases are due for renewal within 60 days, or notices have already been generated.");
	}
	function renewLease(renewal) {
		const oldLease = leases.find((item) => item.id === renewal.leaseId);
		if (!oldLease) return;
		const expiredDocs = documents.filter((d) => d.customerId === oldLease.customerId && d.mandatory && d.expiryDate && new Date(d.expiryDate) < today).map((d) => d.name);
		if (expiredDocs.length > 0) {
			if (!window.confirm(`Warning: The following mandatory documents have expired and should be renewed before activating the new lease period:\n\n${expiredDocs.join(", ")}\n\nProceed with renewal? (You can update documents in the Documents tab.)`)) return;
		}
		const renewed = {
			...oldLease,
			id: `l${leases.length + 1}`,
			renewalOf: oldLease.id,
			startDate: addDays(new Date(oldLease.endDate), 1),
			endDate: addDays(new Date(oldLease.endDate), 366),
			monthlyRent: renewal.proposedRent,
			status: "documents_pending",
			tenantSignedAt: void 0,
			landlordSignedAt: void 0,
			signedDocument: void 0,
			receivedBy: void 0,
			landlordPackageSubmittedAt: void 0,
			sharedWithTenant: false,
			collectionCompleted: false
		};
		setLeases((items) => [renewed, ...items.map((item) => item.id === oldLease.id ? {
			...item,
			status: "renewed"
		} : item)]);
		setRenewals((items) => items.map((item) => item.id === renewal.id ? {
			...item,
			status: "renewal_confirmed"
		} : item));
		setPdcs((items) => items.filter((item) => item.leaseId !== renewed.id));
		recordAudit({
			stage: "Lease Renewal Process",
			owner: "Leasing Department",
			input: `${oldLease.tenantName}, renewed period ${renewal.proposedPeriod}${expiredDocs.length > 0 ? " | Expired docs flagged: " + expiredDocs.join(", ") : ""}`,
			approval: "Renewal confirmation",
			status: "renewal_confirmed",
			output: "Renewed lease linked to previous lease history; document review recommended for expired credentials"
		});
	}
	function openSettleRefundModal(settlement) {
		setSelectedSettlement(settlement);
		const deductions = (settlement.outstandingRent || 0) + (settlement.damages || 0) + (settlement.utilityCharges || 0) + (settlement.cleaningCharges || 0) + (settlement.restorationCharges || 0) + (settlement.otherDeductions || 0);
		const initialMode = settlement.settlementMode || "DEDUCT_FROM_DEPOSIT";
		const calcRefund = initialMode === "PAY_SEPARATELY" ? settlement.depositReceived : Math.max(0, settlement.depositReceived - deductions);
		const _unusedRent = settlement.unusedRentRefund || 0;
		setSettleRefundForm({
			damages: String(settlement.damages || 0),
			outstandingRent: String(settlement.outstandingRent || 0),
			utilityCharges: String(settlement.utilityCharges || 0),
			cleaningCharges: String(settlement.cleaningCharges || 0),
			restorationCharges: String(settlement.restorationCharges || 0),
			otherDeductions: String(settlement.otherDeductions || 0),
			daysOccupiedInMonth: String(settlement.daysOccupiedInMonth ?? 30),
			totalDaysInMonth: String(settlement.totalDaysInMonth ?? 30),
			currentMonthPdcDeposited: settlement.currentMonthPdcDeposited ?? false,
			unusedRentRefund: String(_unusedRent),
			refundAmount: String(calcRefund + _unusedRent),
			paymentMethod: "Bank Transfer",
			settlementMode: initialMode,
			damagePaymentMode: settlement.damagePaymentMode || "Bank Transfer",
			damageRemarks: "",
			notes: `Security deposit settlement and refund for Lease ${settlement.leaseId}`,
			paymentRefNo: settlement.paymentRefNo || "",
			payerBank: settlement.payerBank || (settlement.damagePaymentMode === "Cash" ? "Cash In Hand" : "QNB"),
			paymentDate: settlement.paymentDate || today.toISOString().split("T")[0],
			bgExpiryDate: settlement.bgExpiryDate || "",
			paymentProofFileName: settlement.paymentProofFileName || "",
			paymentProofData: settlement.paymentProofUrl || "",
			refundBank: "Qatar National Bank (QNB)",
			refundIban: "",
			refundTxRef: "",
			refundChequeNo: "",
			refundChequeBank: "Qatar National Bank (QNB)",
			refundChequeDate: today.toISOString().split("T")[0],
			refundCashierName: "Treasury Department",
			refundPaymentDate: today.toISOString().split("T")[0],
			refundProofFileName: "",
			refundProofData: ""
		});
		setSettleRefundStep(1);
		setSettleRefundOpen(true);
	}
	async function executeSettleAndRefund() {
		if (!selectedSettlement) return;
		const settlement = selectedSettlement;
		const lease = leases.find((item) => item.id === settlement.leaseId);
		const checkout = checkouts.find((item) => item.leaseId === settlement.leaseId);
		const settlementDate = today.toISOString().split("T")[0];
		const pvNo = `PV-SET-${Date.now().toString().slice(-6)}`;
		const jvNo = `JV-SET-${Date.now().toString().slice(-6)}`;
		const rvDmgNo = `RV-DMG-${Date.now().toString().slice(-6)}`;
		const isBank = settleRefundForm.paymentMethod !== "Cash";
		const bankCrCode = isBank ? "12000" : "12100";
		const bankCrName = isBank ? "Bank Operating Account" : "Cash In Hand";
		const mode = settleRefundForm.settlementMode;
		const dmgPayMode = settleRefundForm.damagePaymentMode || "Bank Transfer";
		let dmgDrAccount = "Bank Operating Account";
		let dmgDrCode = "12000";
		if (dmgPayMode === "Cash") {
			dmgDrAccount = "Cash In Hand";
			dmgDrCode = "12100";
		} else if (dmgPayMode === "Cheque") {
			dmgDrAccount = "Cheques / PDC In Hand";
			dmgDrCode = "12200";
		} else if (dmgPayMode === "Bank Guarantee") {
			dmgDrAccount = "Bank Guarantee Security Held";
			dmgDrCode = "12500";
		}
		const damages = parseFloat(settleRefundForm.damages) || 0;
		const outstandingRent = parseFloat(settleRefundForm.outstandingRent) || 0;
		const utilityCharges = parseFloat(settleRefundForm.utilityCharges) || 0;
		const cleaningCharges = parseFloat(settleRefundForm.cleaningCharges) || 0;
		const restorationCharges = parseFloat(settleRefundForm.restorationCharges) || 0;
		const otherDeductions = parseFloat(settleRefundForm.otherDeductions) || 0;
		const totalDeductions = damages + outstandingRent + utilityCharges + cleaningCharges + restorationCharges + otherDeductions;
		const grossDeposit = settlement.depositReceived;
		const unusedRentRefund = settleRefundForm.currentMonthPdcDeposited ? Math.max(0, parseFloat(settleRefundForm.unusedRentRefund) || 0) : 0;
		const effectiveDeposit = grossDeposit + unusedRentRefund;
		const customRefund = parseFloat(settleRefundForm.refundAmount);
		const refundable = !isNaN(customRefund) ? customRefund : mode === "PAY_SEPARATELY" ? effectiveDeposit : Math.max(0, effectiveDeposit - totalDeductions);
		setSettlements((items) => items.map((item) => item.id === settlement.id ? {
			...item,
			damages,
			outstandingRent,
			utilityCharges,
			cleaningCharges,
			restorationCharges,
			otherDeductions,
			refundableBalance: mode === "PAY_SEPARATELY" ? grossDeposit : Math.max(0, grossDeposit - totalDeductions),
			approval: "pending_approval",
			settlementMode: mode,
			damagePaymentMode: mode === "PAY_SEPARATELY" ? dmgPayMode : void 0,
			paymentRefNo: mode === "PAY_SEPARATELY" ? settleRefundForm.paymentRefNo : void 0,
			payerBank: mode === "PAY_SEPARATELY" ? settleRefundForm.payerBank : void 0,
			paymentDate: mode === "PAY_SEPARATELY" ? settleRefundForm.paymentDate : void 0,
			bgExpiryDate: mode === "PAY_SEPARATELY" && dmgPayMode === "Bank Guarantee" ? settleRefundForm.bgExpiryDate : void 0,
			paymentProofFileName: mode === "PAY_SEPARATELY" ? settleRefundForm.paymentProofFileName : void 0,
			paymentProofUrl: mode === "PAY_SEPARATELY" ? settleRefundForm.paymentProofData : void 0
		} : item));
		const propName = lease?.property || "Old Salata - Residence No:23";
		const unitRef = lease?.unit || "Unit";
		const tenantName = lease?.tenantName || "Tenant";
		const leaseForFinance = lease;
		if (!leaseForFinance) throw new Error("Lease not found for settlement.");
		let centralSettlement;
		try {
			centralSettlement = await executeFinalSettlement({
				leaseId: String(leaseForFinance.id),
				tenantId: String(leaseForFinance.customerId),
				propertyId: String(leaseForFinance.propertyId || ""),
				unitId: String(leaseForFinance.unitId || ""),
				unitName: unitRef,
				depositAmount: grossDeposit,
				deductions: [
					{
						type: "RENT",
						description: "Outstanding rent",
						amount: outstandingRent
					},
					{
						type: "DAMAGE",
						description: "Damage / repair charges",
						amount: damages
					},
					{
						type: "UTILITY",
						description: "Utility charges",
						amount: utilityCharges
					},
					{
						type: "OTHER",
						description: "Cleaning / restoration / other charges",
						amount: cleaningCharges + restorationCharges + otherDeductions
					}
				],
				paymentMethod: isBank ? "BANK" : "CASH",
				settlementMode: mode,
				damagePaymentMethod: dmgPayMode === "Cash" ? "CASH" : dmgPayMode === "Cheque" ? "CHEQUE" : "BANK",
				referenceNo: jvNo,
				settlementDate
			});
		} catch (error) {
			setSettlements((items) => items.map((item) => item.id === settlement.id ? {
				...item,
				approval: "pending_approval"
			} : item));
			toast.error(`Settlement was not posted: ${error instanceof Error ? error.message : "Finance posting failed"}`);
			return;
		}
		setSettlements((items) => items.map((item) => item.id === settlement.id ? {
			...item,
			approval: "paid"
		} : item));
		if (centralSettlement.summary.netRecoveryAmount > 0) toast.warning(`Tenant recovery remains outstanding: QR ${centralSettlement.summary.netRecoveryAmount.toLocaleString()}.`);
		if (mode === "PAY_SEPARATELY" && dmgPayMode === "Cash" && totalDeductions > 0) addCashBookEntry({
			date: settlementDate,
			voucher: rvDmgNo,
			description: `Damage Cash Collection — ${tenantName} / ${unitRef}`,
			type: "in",
			amount: totalDeductions
		});
		if (settleRefundForm.paymentMethod === "Cash") {
			const cashRefundAmt = mode === "PAY_SEPARATELY" ? grossDeposit : refundable;
			if (cashRefundAmt > 0) addCashBookEntry({
				date: settlementDate,
				voucher: pvNo,
				description: `Security Deposit Cash Refund — ${tenantName} / ${unitRef}`,
				type: "out",
				amount: cashRefundAmt
			});
		}
		if (unusedRentRefund > 0) addFinanceStoreVoucher({
			voucher_no: `JV-UNR-${Date.now().toString().slice(-6)}`,
			voucher_type: "Journal Voucher",
			date: settlementDate,
			name: `Unearned Rent Reversal (Unused Days Refund) – ${tenantName} (${unitRef})`,
			debit: "Rental Revenue",
			debit_code: "41100",
			credit: "Security Deposit Liability",
			credit_code: "21500",
			amount: unusedRentRefund,
			method: "Journal Adjustment",
			property_name: propName,
			unit_ref: unitRef,
			tenant_name: tenantName
		});
		if (refundable > 0) addFinanceStoreVoucher({
			voucher_no: pvNo,
			voucher_type: "Payment Voucher",
			date: settlementDate,
			name: `Security Deposit Refund – ${tenantName} (${unitRef})`,
			debit: "Security Deposit Liability",
			debit_code: "21500",
			credit: isBank ? "Bank Operating Account" : "Cash In Hand",
			credit_code: isBank ? "12000" : "12100",
			amount: refundable,
			method: isBank ? "Bank Transfer" : "Cash",
			property_name: propName,
			unit_ref: unitRef,
			tenant_name: tenantName
		});
		if (totalDeductions > 0) {
			addFinanceStoreVoucher({
				voucher_no: `JV-DMG-REC-${settlement.leaseId}`,
				voucher_type: "Journal Voucher",
				date: settlementDate,
				name: `Checkout Settlement Deductions Recognized – ${tenantName} (${unitRef})`,
				debit: "Tenant Receivables",
				debit_code: "12413",
				credit: "Damage & Repair Recovery",
				credit_code: "41201",
				amount: totalDeductions,
				method: "Settlement Adjustment",
				property_name: propName,
				unit_ref: unitRef,
				tenant_name: tenantName
			});
			if (mode === "DEDUCT_FROM_DEPOSIT") addFinanceStoreVoucher({
				voucher_no: `JV-DEP-DED-${settlement.leaseId}`,
				voucher_type: "Journal Voucher",
				date: settlementDate,
				name: `Security Deposit Applied to Deductions – ${tenantName} (${unitRef})`,
				debit: "Security Deposit Liability",
				debit_code: "21500",
				credit: "Tenant Receivables",
				credit_code: "12413",
				amount: totalDeductions,
				method: "Deposit Offset",
				property_name: propName,
				unit_ref: unitRef,
				tenant_name: tenantName
			});
			else if (mode === "PAY_SEPARATELY") addFinanceStoreVoucher({
				voucher_no: rvDmgNo,
				voucher_type: "Receipt Voucher",
				date: settlementDate,
				name: `Damage Settlement Collection (${dmgPayMode}) – ${tenantName} (${unitRef})`,
				debit: dmgDrAccount,
				debit_code: dmgPayMode === "Cash" ? "12100" : "12000",
				credit: "Tenant Receivables",
				credit_code: "12413",
				amount: totalDeductions,
				method: dmgPayMode,
				property_name: propName,
				unit_ref: unitRef,
				tenant_name: tenantName
			});
		}
		if (centralSettlement.vouchers.length > 0) setVouchers((items) => [...centralSettlement.vouchers.map((v, index) => ({
			id: `central-${v.voucher_id}`,
			leaseId: settlement.leaseId,
			name: `Central Finance Settlement ${index + 1}`,
			receiptNo: v.voucher_number,
			method: "Finance Engine",
			period: "Final checkout settlement",
			debit: "Finance Master",
			credit: "Finance Master",
			amount: index === centralSettlement.vouchers.length - 1 ? centralSettlement.summary.netRefundAmount || centralSettlement.summary.netRecoveryAmount : 0,
			status: "posted"
		})), ...items]);
		const earlyVacateDate = checkout?.moveOutDate || lease?.plannedVacateDate;
		const isEarlyVacate = Boolean(lease && earlyVacateDate && new Date(earlyVacateDate).getTime() < new Date(lease.endDate).getTime());
		const vacateEffectiveDate = earlyVacateDate || settlementDate;
		if (lease && vacateEffectiveDate) try {
			await releaseFuturePdcExposure(lease, vacateEffectiveDate);
		} catch (vacateErr) {
			console.warn("[Settlement] Vacate PDC normalization notice (non-blocking):", vacateErr);
		}
		if (lease) {
			setLeases((items) => items.map((item) => item.id === lease.id ? {
				...item,
				status: "closed",
				endDate: earlyVacateDate || item.endDate,
				actualVacateDate: earlyVacateDate || settlementDate,
				plannedVacateDate: earlyVacateDate || item.plannedVacateDate,
				earlyVacate: isEarlyVacate || item.earlyVacate,
				earlyVacateReason: isEarlyVacate ? item.earlyVacateReason || "Tenant vacated before lease expiry" : item.earlyVacateReason
			} : item));
			setUnits((items) => items.map((item) => item.unit === lease.unit ? {
				...item,
				status: settlement.unitDisposition || "Vacant - Under Maintenance"
			} : item));
		}
		let primaryReceipt;
		let secondaryReceipt = null;
		if (mode === "PAY_SEPARATELY") {
			primaryReceipt = {
				receiptNo: rvDmgNo,
				acknowledgementNo: jvNo,
				date: settlementDate,
				tenantName,
				tenantPhone: "",
				tenantEmail: "",
				tenantQid: "",
				propertyName: propName,
				unitRef,
				leaseNo: lease ? `LES-${lease.id.toUpperCase()}` : `LES-${settlement.leaseId}`,
				leaseStartDate: lease?.startDate || settlementDate,
				leaseEndDate: lease?.endDate || settlementDate,
				monthlyRent: lease?.monthlyRent || 0,
				totalContractRent: lease ? lease.monthlyRent * (lease.pdcCount || 12) : 0,
				depositAmount: 0,
				depositMode: `Damage Settlement Collection (${dmgPayMode})`,
				pdcCount: 0,
				pdcs: [],
				vouchers: [
					{
						receiptNo: rvDmgNo,
						name: `Damage Charges Paid by Tenant (${dmgPayMode}${settleRefundForm.paymentRefNo ? ` • Ref: ${settleRefundForm.paymentRefNo}` : ""})`,
						amount: totalDeductions,
						method: dmgPayMode,
						debit: dmgDrAccount,
						credit: "Tenant Receivables (12413)"
					},
					...damages > 0 ? [{
						receiptNo: `${jvNo}-A1`,
						name: `Damage / Repair Costs`,
						amount: damages,
						method: dmgPayMode,
						debit: "Tenant AR (12413)",
						credit: "Repairs Recovery (41400)"
					}] : [],
					...outstandingRent > 0 ? [{
						receiptNo: `${jvNo}-A2`,
						name: `Outstanding Rent Recovered`,
						amount: outstandingRent,
						method: dmgPayMode,
						debit: "Tenant AR (12413)",
						credit: "Rental Revenue (41100)"
					}] : [],
					...utilityCharges > 0 ? [{
						receiptNo: `${jvNo}-A3`,
						name: `Kahramaa / Utility Charges`,
						amount: utilityCharges,
						method: dmgPayMode,
						debit: "Tenant AR (12413)",
						credit: "Utility Recovery (41400)"
					}] : [],
					...cleaningCharges > 0 ? [{
						receiptNo: `${jvNo}-A4`,
						name: `Deep Cleaning Charges`,
						amount: cleaningCharges,
						method: dmgPayMode,
						debit: "Tenant AR (12413)",
						credit: "Cleaning Recovery (41400)"
					}] : [],
					...restorationCharges > 0 ? [{
						receiptNo: `${jvNo}-A5`,
						name: `Painting / Restoration Charges`,
						amount: restorationCharges,
						method: dmgPayMode,
						debit: "Tenant AR (12413)",
						credit: "Restoration Recovery (41400)"
					}] : [],
					...otherDeductions > 0 ? [{
						receiptNo: `${jvNo}-A6`,
						name: `Other Charges`,
						amount: otherDeductions,
						method: dmgPayMode,
						debit: "Tenant AR (12413)",
						credit: "Admin Recovery (41400)"
					}] : []
				],
				agencyCommission: 0,
				adminCharges: 0,
				utilityDeposit: utilityCharges,
				totalCollected: totalDeductions,
				cashierName: "Finance Department",
				notes: `Damage Settlement Collection Receipt | Channel: ${dmgPayMode}${settleRefundForm.paymentRefNo ? ` | Instrument/Ref: ${settleRefundForm.paymentRefNo}` : ""}${settleRefundForm.payerBank ? ` | Source/Bank: ${settleRefundForm.payerBank}` : ""}${dmgPayMode === "Bank Guarantee" && settleRefundForm.bgExpiryDate ? ` | BG Expiry: ${settleRefundForm.bgExpiryDate}` : ""}${settleRefundForm.paymentProofFileName ? ` | Attached Proof: ${settleRefundForm.paymentProofFileName}` : ""}${settleRefundForm.damageRemarks ? ` | Damage Agreement: ${settleRefundForm.damageRemarks}` : ""}`
			};
			const refundDetailsText = settleRefundForm.paymentMethod === "Bank Transfer" ? `Bank: ${settleRefundForm.refundBank || "QNB"}${settleRefundForm.refundIban ? ` | IBAN: ${settleRefundForm.refundIban}` : ""}${settleRefundForm.refundTxRef ? ` | Transfer Ref: ${settleRefundForm.refundTxRef}` : ""}${settleRefundForm.refundPaymentDate ? ` | Transfer Date: ${settleRefundForm.refundPaymentDate}` : ""}` : settleRefundForm.paymentMethod === "Cheque" ? `Cheque No: ${settleRefundForm.refundChequeNo || "N/A"}${settleRefundForm.refundChequeBank ? ` | Issuing Bank: ${settleRefundForm.refundChequeBank}` : ""}${settleRefundForm.refundChequeDate ? ` | Cheque Date: ${settleRefundForm.refundChequeDate}` : ""}` : `Disbursed by: ${settleRefundForm.refundCashierName || "Treasury"}${settleRefundForm.refundPaymentDate ? ` | Date: ${settleRefundForm.refundPaymentDate}` : ""}`;
			secondaryReceipt = {
				receiptNo: pvNo,
				acknowledgementNo: jvNo,
				date: settlementDate,
				tenantName,
				tenantPhone: "",
				tenantEmail: "",
				tenantQid: "",
				propertyName: propName,
				unitRef,
				leaseNo: lease ? `LES-${lease.id.toUpperCase()}` : `LES-${settlement.leaseId}`,
				leaseStartDate: lease?.startDate || settlementDate,
				leaseEndDate: lease?.endDate || settlementDate,
				monthlyRent: lease?.monthlyRent || 0,
				totalContractRent: lease ? lease.monthlyRent * (lease.pdcCount || 12) : 0,
				depositAmount: grossDeposit,
				depositMode: `Full Deposit Refund (${settleRefundForm.paymentMethod})`,
				pdcCount: 0,
				pdcs: [],
				vouchers: [
					{
						receiptNo: jvNo,
						name: `Security Deposit Liability Released (21500 → ${bankCrCode})`,
						amount: grossDeposit,
						method: "Journal",
						debit: "Security Deposit Liability (21500)",
						credit: bankCrName
					},
					...unusedRentRefund > 0 ? [{
						receiptNo: `JV-UNR-${pvNo}`,
						name: `Unearned Rent Reversal — Unused Days (${settleRefundForm.daysOccupiedInMonth}/${settleRefundForm.totalDaysInMonth} days occupied)`,
						amount: unusedRentRefund,
						method: "Journal",
						debit: "Rental Revenue (41100)",
						credit: "Security Deposit Liability (21500)"
					}] : [],
					{
						receiptNo: pvNo,
						name: `Full Security Deposit Refund Paid (${settleRefundForm.paymentMethod}${settleRefundForm.refundTxRef ? ` • Ref: ${settleRefundForm.refundTxRef}` : settleRefundForm.refundChequeNo ? ` • Chq: ${settleRefundForm.refundChequeNo}` : ""})`,
						amount: refundable > 0 ? refundable : effectiveDeposit,
						method: settleRefundForm.paymentMethod,
						debit: bankCrName,
						credit: "Refund Payable (21300)"
					}
				],
				agencyCommission: 0,
				adminCharges: 0,
				utilityDeposit: 0,
				totalCollected: refundable > 0 ? refundable : effectiveDeposit,
				cashierName: settleRefundForm.paymentMethod === "Cash" ? settleRefundForm.refundCashierName || "Finance Department" : "Finance Department",
				notes: `Full Security Deposit Liability Refund (Damages settled separately via ${dmgPayMode}) | Gross Deposit: QR ${grossDeposit.toLocaleString()}${unusedRentRefund > 0 ? ` + Unused Rent Refund: QR ${unusedRentRefund.toLocaleString()} (${settleRefundForm.daysOccupiedInMonth}/${settleRefundForm.totalDaysInMonth} days)` : ""} | Refund Paid: QR ${(refundable > 0 ? refundable : effectiveDeposit).toLocaleString()} via ${settleRefundForm.paymentMethod} (${refundDetailsText})${settleRefundForm.refundProofFileName ? ` | Attached Proof: ${settleRefundForm.refundProofFileName}` : ""}${settleRefundForm.notes ? ` | Remarks: ${settleRefundForm.notes}` : ""}`,
				unusedRentRefund
			};
		} else {
			const refundDetailsText = settleRefundForm.paymentMethod === "Bank Transfer" ? `Bank: ${settleRefundForm.refundBank || "QNB"}${settleRefundForm.refundIban ? ` | IBAN: ${settleRefundForm.refundIban}` : ""}${settleRefundForm.refundTxRef ? ` | Transfer Ref: ${settleRefundForm.refundTxRef}` : ""}${settleRefundForm.refundPaymentDate ? ` | Transfer Date: ${settleRefundForm.refundPaymentDate}` : ""}` : settleRefundForm.paymentMethod === "Cheque" ? `Cheque No: ${settleRefundForm.refundChequeNo || "N/A"}${settleRefundForm.refundChequeBank ? ` | Issuing Bank: ${settleRefundForm.refundChequeBank}` : ""}${settleRefundForm.refundChequeDate ? ` | Cheque Date: ${settleRefundForm.refundChequeDate}` : ""}` : `Disbursed by: ${settleRefundForm.refundCashierName || "Treasury"}${settleRefundForm.refundPaymentDate ? ` | Date: ${settleRefundForm.refundPaymentDate}` : ""}`;
			primaryReceipt = {
				receiptNo: pvNo,
				acknowledgementNo: jvNo,
				date: settlementDate,
				tenantName,
				tenantPhone: "",
				tenantEmail: "",
				tenantQid: "",
				propertyName: propName,
				unitRef,
				leaseNo: lease ? `LES-${lease.id.toUpperCase()}` : `LES-${settlement.leaseId}`,
				leaseStartDate: lease?.startDate || settlementDate,
				leaseEndDate: lease?.endDate || settlementDate,
				monthlyRent: lease?.monthlyRent || 0,
				totalContractRent: lease ? lease.monthlyRent * (lease.pdcCount || 12) : 0,
				depositAmount: grossDeposit,
				depositMode: `Security Deposit Refund (Deductions Applied)`,
				pdcCount: 0,
				pdcs: [],
				vouchers: [
					{
						receiptNo: jvNo,
						name: `Security Deposit Released (21500 → ${bankCrCode})`,
						amount: grossDeposit,
						method: "Journal",
						debit: "Security Deposit Liability (21500)",
						credit: bankCrName
					},
					...unusedRentRefund > 0 ? [{
						receiptNo: `JV-UNR-${jvNo}`,
						name: `Unearned Rent Reversal — Unused Days (${settleRefundForm.daysOccupiedInMonth}/${settleRefundForm.totalDaysInMonth} days occupied)`,
						amount: unusedRentRefund,
						method: "Journal",
						debit: "Rental Revenue (41100)",
						credit: "Security Deposit Liability (21500)"
					}] : [],
					...refundable > 0 ? [{
						receiptNo: pvNo,
						name: `Net Deposit Refund Paid (${settleRefundForm.paymentMethod}${settleRefundForm.refundTxRef ? ` • Ref: ${settleRefundForm.refundTxRef}` : settleRefundForm.refundChequeNo ? ` • Chq: ${settleRefundForm.refundChequeNo}` : ""})`,
						amount: refundable,
						method: settleRefundForm.paymentMethod,
						debit: bankCrName,
						credit: "Refund Payable (21300)"
					}] : [],
					...damages > 0 ? [{
						receiptNo: `${jvNo}-A1`,
						name: `Damage / Repair Costs (Deducted from Deposit)`,
						amount: damages,
						method: "Deduction",
						debit: "Tenant AR (12413)",
						credit: "Repairs Recovery (41400)"
					}] : [],
					...outstandingRent > 0 ? [{
						receiptNo: `${jvNo}-A2`,
						name: `Outstanding Rent Recovered`,
						amount: outstandingRent,
						method: "Deduction",
						debit: "Tenant AR (12413)",
						credit: "Rental Revenue (41100)"
					}] : [],
					...utilityCharges > 0 ? [{
						receiptNo: `${jvNo}-A3`,
						name: `Kahramaa / Utility Charges`,
						amount: utilityCharges,
						method: "Deduction",
						debit: "Tenant AR (12413)",
						credit: "Utility Recovery (41400)"
					}] : [],
					...cleaningCharges > 0 ? [{
						receiptNo: `${jvNo}-A4`,
						name: `Deep Cleaning Charges`,
						amount: cleaningCharges,
						method: "Deduction",
						debit: "Tenant AR (12413)",
						credit: "Cleaning Recovery (41400)"
					}] : [],
					...restorationCharges > 0 ? [{
						receiptNo: `${jvNo}-A5`,
						name: `Painting / Restoration Charges`,
						amount: restorationCharges,
						method: "Deduction",
						debit: "Tenant AR (12413)",
						credit: "Restoration Recovery (41400)"
					}] : [],
					...otherDeductions > 0 ? [{
						receiptNo: `${jvNo}-A6`,
						name: `Other Administrative Charges`,
						amount: otherDeductions,
						method: "Deduction",
						debit: "Tenant AR (12413)",
						credit: "Admin Recovery (41400)"
					}] : []
				],
				agencyCommission: 0,
				adminCharges: 0,
				utilityDeposit: utilityCharges,
				totalCollected: refundable,
				cashierName: settleRefundForm.paymentMethod === "Cash" ? settleRefundForm.refundCashierName || "Finance Department" : "Finance Department",
				notes: `Settlement Mode: Deductions from Deposit | Gross Deposit: QR ${grossDeposit.toLocaleString()}${unusedRentRefund > 0 ? ` + Unused Rent Refund: QR ${unusedRentRefund.toLocaleString()} (${settleRefundForm.daysOccupiedInMonth}/${settleRefundForm.totalDaysInMonth} days)` : ""} | Total Deductions: QR ${totalDeductions.toLocaleString()} | Net Refund Paid: QR ${refundable.toLocaleString()} | Refund Channel: ${settleRefundForm.paymentMethod} (${refundDetailsText})${settleRefundForm.refundProofFileName ? ` | Attached Proof: ${settleRefundForm.refundProofFileName}` : ""}${settleRefundForm.damageRemarks ? ` | Damage Agreement: ${settleRefundForm.damageRemarks}` : ""}${settleRefundForm.notes ? ` | Remarks: ${settleRefundForm.notes}` : ""}`,
				unusedRentRefund
			};
			secondaryReceipt = null;
		}
		setReceiptModalData(primaryReceipt);
		setReceiptModalSecondaryData(secondaryReceipt);
		setReceiptModalOpen(true);
		setSettleRefundOpen(false);
		recordAudit({
			stage: "Security Deposit Settlement & Lease Closure",
			owner: "Finance Department",
			input: `Deposit ${formatMoney(grossDeposit)}, deductions ${formatMoney(totalDeductions)}, refund ${formatMoney(refundable)}, mode: ${mode}${mode === "PAY_SEPARATELY" ? ` (${dmgPayMode}, ref: ${settleRefundForm.paymentRefNo || "N/A"})` : ""}`,
			approval: "Settlement approval",
			status: "closed",
			output: `GL posted (${mode}): DR 21500 / CR ${bankCrCode}. ${mode === "PAY_SEPARATELY" && totalDeductions > 0 ? `RV ${rvDmgNo} (DR ${dmgDrCode} / CR 12413 via ${dmgPayMode}). ` : ""}PV ${pvNo}. Lease closed. Unit → ${settlement.unitDisposition || "Vacant"}.`
		});
		toast.success(mode === "PAY_SEPARATELY" ? `Settlement approved! Generated 2 receipts: Damage collection (${dmgPayMode} QR ${totalDeductions.toLocaleString()}) & Full deposit refund (QR ${grossDeposit.toLocaleString()}).` : `Settlement approved! Net refund of QR ${refundable.toLocaleString()} paid. Receipt generated.`);
	}
	const handoverTabOrder = [
		"details",
		"condition",
		"assets",
		"checklist",
		"acknowledgement"
	];
	function getNextHandoverTab(current) {
		const index = handoverTabOrder.indexOf(current);
		return index >= 0 && index < handoverTabOrder.length - 1 ? handoverTabOrder[index + 1] : current;
	}
	function completeDetailedHandoverAction(lease) {
		const newHandover = {
			id: `kh${Date.now()}`,
			leaseId: lease.id,
			handoverAt: `${handoverForm.handoverAt} ${handoverForm.handoverTime}`,
			keys: Number(handoverForm.keys) || 2,
			keyType: handoverForm.keyType || "Metal door keys",
			accessCards: Number(handoverForm.accessCards) || 2,
			parkingRemotes: Number(handoverForm.parkingRemotes) || 1,
			parkingDeviceDetails: handoverForm.parkingDeviceDetails || "None",
			electricityMeterReading: handoverForm.electricityMeterReading,
			waterMeterReading: handoverForm.waterMeterReading,
			meterInfo: `Elec: ${handoverForm.electricityMeterReading || "-"}, Water: ${handoverForm.waterMeterReading || "-"}`,
			unitCondition: handoverForm.unitCondition,
			cleanliness: handoverForm.cleanliness,
			acWorking: handoverForm.acWorking,
			plumbingOk: handoverForm.plumbingOk,
			electricalOk: handoverForm.electricalOk,
			doorsWindowsOk: handoverForm.doorsWindowsOk,
			idVerified: handoverForm.idVerified,
			photosTaken: Number(handoverForm.photosTaken) || 6,
			acknowledged: true,
			issuedBy: handoverForm.issuedBy,
			collectorName: handoverForm.collectorName || lease.tenantName,
			collectorIdNumber: handoverForm.collectorIdNumber,
			tenantAcknowledgement: handoverForm.tenantAcknowledgement || "Tenant acknowledged receipt",
			note: [
				handoverForm.note,
				handoverForm.assetChecklist ? `Asset Checklist: ${handoverForm.assetChecklist}` : "",
				handoverForm.checklistDocument ? `Checklist Doc: ${handoverForm.checklistDocument}` : "",
				handoverForm.handoverPhotos ? `Photos: ${handoverForm.handoverPhotos}` : "",
				`Finance Confirmed: ${handoverForm.financeConfirmed ? "Yes" : "No"}`,
				`PM Confirmed: ${handoverForm.propertyManagerConfirmed ? "Yes" : "No"}`,
				`Tenant Confirmed: ${handoverForm.tenantConfirmed ? "Yes" : "No"}`
			].filter(Boolean).join(" | ")
		};
		setHandovers((items) => [newHandover, ...items]);
		recordAudit({
			stage: "Key Handover",
			owner: "Property Manager",
			input: `${lease.unit} · ${handoverForm.keys}× ${handoverForm.keyType} · ${handoverForm.accessCards}× cards · ${handoverForm.parkingRemotes}× parking devices`,
			approval: `ID verified: ${handoverForm.idVerified ? "Yes" : "No"} · Tenant acknowledgement captured`,
			status: "acknowledged",
			output: handoverForm.note || `Handover recorded for ${handoverForm.collectorName || lease.tenantName} — Elec: ${handoverForm.electricityMeterReading || "-"}, Water: ${handoverForm.waterMeterReading || "-"}`
		});
		setHandoverOpen(false);
	}
	function completeHandoverAndCheckIn(lease) {
		completeDetailedHandoverAction(lease);
		completeDetailedCheckIn(lease);
	}
	function issueDetailedKeyNotice(lease) {
		const blocked = !(lease.status === "fully_signed" && lease.collectionCompleted);
		const notice = {
			id: `kn${keyNotices.length + 1}`,
			leaseId: lease.id,
			recipient: keyNotifyForm.recipients.join(", "),
			handoverAt: keyNotifyForm.handoverAt,
			handoverTime: keyNotifyForm.handoverTime,
			status: blocked ? "blocked" : "sent",
			note: keyNotifyForm.note || (blocked ? "Lease must be fully signed and collection completed" : "Key issue approved"),
			authorizedCollector: keyNotifyForm.authorizedCollector || lease.tenantName,
			keysSummary: keyNotifyForm.keysSummary,
			staffContact: keyNotifyForm.staffContact,
			outstandingRequirements: keyNotifyForm.outstandingRequirements || "None"
		};
		setKeyNotices((items) => [notice, ...items]);
		recordAudit({
			stage: "Key Issue Notification",
			owner: "Leasing Department",
			input: `${lease.tenantName}, ${lease.property}, ${lease.unit}, start ${lease.startDate}, handover ${keyNotifyForm.handoverAt} ${keyNotifyForm.handoverTime}`,
			approval: blocked ? "Blocked by lease gate" : "Fully signed and collected",
			status: notice.status,
			output: blocked ? notice.note : `Tenant, PM, staff and support teams notified; collector ${notice.authorizedCollector}; outstanding: ${notice.outstandingRequirements}`
		});
		setKeyNotifyOpen(false);
	}
	function completeDetailedCheckIn(lease) {
		setInspections((items) => [{
			id: `ci${items.length + 1}`,
			leaseId: lease.id,
			type: "check_in",
			condition: checkInForm.condition,
			furnitureCondition: checkInForm.furnitureCondition,
			fixturesCondition: checkInForm.fixturesCondition,
			wallFloorCeilingCondition: checkInForm.wallFloorCeilingCondition,
			acCondition: checkInForm.acCondition,
			electricityMeter: checkInForm.electricityMeter || "182167",
			waterMeter: checkInForm.waterMeter || "149089",
			damages: checkInForm.damages || "None recorded",
			pendingMaintenance: checkInForm.pendingMaintenance || "None",
			acknowledged: true,
			photos: Number(checkInForm.photos) || 8
		}, ...items]);
		advanceLease(lease, "active");
		setUnits((items) => items.map((item) => item.unit === lease.unit ? {
			...item,
			status: "Occupied"
		} : item));
		recordAudit({
			stage: "Check-In Process",
			owner: "Property Manager",
			input: "Unit condition, fixtures, utilities, photos, damage log and maintenance follow-up",
			approval: "Tenant acknowledgement",
			status: "completed",
			output: checkInForm.note || "Check-in report completed, maintenance logged where needed, and unit marked occupied"
		});
		setHandoverOpen(false);
	}
	function startCheckout(lease) {
		const moveOutDate = startCheckoutForm.moveOutDate || lease.endDate;
		const isEarlyVacate = new Date(moveOutDate).getTime() < new Date(lease.endDate).getTime();
		setLeases((items) => items.map((item) => item.id === lease.id ? {
			...item,
			status: "checkout",
			plannedVacateDate: moveOutDate,
			earlyVacate: isEarlyVacate,
			earlyVacateReason: isEarlyVacate ? startCheckoutForm.notes || "Tenant requested vacating before lease expiry" : item.earlyVacateReason
		} : item));
		setRenewals((items) => items.map((item) => item.leaseId === lease.id ? {
			...item,
			status: "non_renewal"
		} : item));
		setCheckouts((items) => {
			const existing = items.find((c) => c.leaseId === lease.id);
			const newCheckout = {
				id: existing?.id || `co${items.length + 1}`,
				leaseId: lease.id,
				noticeDate: startCheckoutForm.noticeDate || today.toISOString().split("T")[0],
				moveOutDate,
				originalLeaseEndDate: lease.endDate,
				earlyVacate: isEarlyVacate,
				inspectionDate: startCheckoutForm.inspectionDate || addDays(new Date(lease.endDate), -3),
				comparisonSummary: "Pending final comparison with original check-in report",
				nonRenewalNotice: startCheckoutForm.notes || (isEarlyVacate ? "Tenant early vacate notice received" : "Tenant non-renewal notice received"),
				outstandingCharges: startCheckoutForm.outstandingCharges,
				utilityClearanceRequirements: startCheckoutForm.utilityClearanceRequirements,
				keyReturnRequirements: startCheckoutForm.keyReturnRequirements,
				financeClearance: false,
				utilityClearance: false,
				keysReturned: false,
				status: "planned"
			};
			if (existing) return items.map((c) => c.leaseId === lease.id ? newCheckout : c);
			return [newCheckout, ...items];
		});
		recordAudit({
			stage: isEarlyVacate ? "Early Vacate & Check-Out" : "Non-Renewal & Check-Out",
			owner: "Leasing Department",
			input: `${lease.tenantName}, notice ${startCheckoutForm.noticeDate}, move-out ${moveOutDate}, lease expiry ${lease.endDate}, inspection ${startCheckoutForm.inspectionDate}`,
			approval: isEarlyVacate ? "Tenant early vacate notice" : "Tenant non-renewal notice",
			status: "planned",
			output: startCheckoutForm.notes || (isEarlyVacate ? "Early vacate checkout case opened; future PDCs and deposit settlement will be adjusted at closure" : "Checkout case opened with finance, utility and key-return requirements")
		});
		toast.success(`${isEarlyVacate ? "Early vacate" : "Non-renewal"} initiated for ${lease.tenantName}. Checkout case opened.`);
		setStartCheckoutOpen(false);
	}
	function completeCheckout(checkout) {
		const lease = leases.find((item) => item.id === checkout.leaseId);
		if (!lease) return;
		setCheckouts((items) => items.map((item) => item.id === checkout.id ? {
			...item,
			financeClearance: completeCheckoutForm.financeClearance,
			utilityClearance: completeCheckoutForm.utilityClearance,
			keysReturned: completeCheckoutForm.keysReturned,
			status: "ready_for_settlement",
			comparisonSummary: "Normal wear separated from tenant-caused damages",
			outstandingCharges: completeCheckoutForm.outstandingRent
		} : item));
		setInspections((items) => [{
			id: `coi${items.length + 1}`,
			leaseId: lease.id,
			type: "check_out",
			condition: `${completeCheckoutForm.condition} | Handover: ${completeCheckoutForm.handoverConditionSummary || "Not recorded"} | Final: ${completeCheckoutForm.finalConditionSummary || "Not recorded"}`,
			electricityMeter: completeCheckoutForm.electricityMeter || "182207",
			waterMeter: completeCheckoutForm.waterMeter || "149129",
			damages: completeCheckoutForm.damages || "None",
			pendingMaintenance: `Missing items: ${completeCheckoutForm.missingItems || "None"}; checkout photos: ${completeCheckoutForm.checkoutPhotos || "None"}; report: ${completeCheckoutForm.checkoutReportFile || "Pending"}`,
			acknowledged: true,
			photos: Number(completeCheckoutForm.photos) || 12
		}, ...items]);
		const _outstandingRent = Number(completeCheckoutForm.outstandingRent) || 0;
		const _damages = Number(completeCheckoutForm.damagesAmount) || 0;
		const _utility = Number(completeCheckoutForm.utilityCharges) || 0;
		const _cleaning = Number(completeCheckoutForm.cleaningCharges) || 0;
		const _restoration = Number(completeCheckoutForm.restorationCharges) || 0;
		const _other = Number(completeCheckoutForm.otherDeductions) || 0;
		const _daysOccupied = Number(completeCheckoutForm.daysOccupiedInMonth) || 30;
		const _totalDays = Number(completeCheckoutForm.totalDaysInMonth) || 30;
		const _isPdcDeposited = completeCheckoutForm.currentMonthPdcDeposited;
		const _unusedRent = Number(completeCheckoutForm.unusedRentRefund) || 0;
		const _totalDeductions = _outstandingRent + _damages + _utility + _cleaning + _restoration + _other;
		const _refundableBalance = Math.max(0, lease.securityDeposit + (_isPdcDeposited ? _unusedRent : 0) - _totalDeductions);
		setSettlements((items) => [{
			id: `s${items.length + 1}`,
			leaseId: lease.id,
			depositReceived: lease.securityDeposit,
			outstandingRent: _outstandingRent,
			damages: _damages,
			utilityCharges: _utility,
			cleaningCharges: _cleaning,
			restorationCharges: _restoration,
			otherDeductions: _other,
			daysOccupiedInMonth: _daysOccupied,
			totalDaysInMonth: _totalDays,
			currentMonthPdcDeposited: _isPdcDeposited,
			unusedRentRefund: _unusedRent,
			refundableBalance: _refundableBalance,
			unitDisposition: completeCheckoutForm.unitDisposition,
			approval: "pending_approval"
		}, ...items]);
		recordAudit({
			stage: "Check-Out Inspection",
			owner: "Property Manager",
			input: "Condition, meters, keys, utilities, damages, missing items, cleaning/restoration review",
			approval: "Tenant acknowledgement",
			status: "ready_for_settlement",
			output: `${checkout.earlyVacate ? "Early vacate" : "Checkout"} settlement draft created with damages, cleaning/restoration and refund recommendation`
		});
		setCompleteCheckoutOpen(false);
	}
	function handlePdcRowChange(idx, field, value) {
		setPdcRows((prev) => {
			const newRows = [...prev];
			const oldValue = newRows[idx][field];
			newRows[idx] = {
				...newRows[idx],
				[field]: value
			};
			if (idx === 0 && oldValue !== value) {
				const lease = leases.find((l) => l.id === pdcLeaseId);
				const count = lease ? lease.pdcCount : 12;
				for (let i = 1; i < count; i++) {
					if (field === "amount" && !prev[i].amount) newRows[i].amount = value;
					if (field === "bank" && !prev[i].bank) newRows[i].bank = value;
					if (field === "maturityDate" && value && (!prev[i].maturityDate || prev[i].maturityDate === today.toISOString().split("T")[0])) {
						const date = new Date(value);
						date.setMonth(date.getMonth() + i);
						newRows[i].maturityDate = date.toISOString().split("T")[0];
					}
					if (field === "tenureStart" && value && !prev[i].tenureStart) {
						const date = new Date(value);
						date.setMonth(date.getMonth() + i);
						newRows[i].tenureStart = date.toISOString().split("T")[0];
					}
					if (field === "tenureEnd" && value && !prev[i].tenureEnd) {
						const date = new Date(value);
						date.setMonth(date.getMonth() + i);
						newRows[i].tenureEnd = date.toISOString().split("T")[0];
					}
				}
			}
			return newRows;
		});
	}
	function addManualPdc() {
		const validRows = pdcRows.filter((row) => row.chequeNo || row.bank || row.amount || row.file);
		if (!pdcLeaseId) {
			alert("Please select a lease before adding PDC details.");
			return;
		}
		if (validRows.length === 0) {
			alert("Please enter at least one PDC line before saving.");
			return;
		}
		if (validRows.find((row) => !row.chequeNo || !row.bank || !row.amount || !row.maturityDate || !row.file)) {
			alert("Please fill all required fields for every PDC row you have started.");
			return;
		}
		const newPdcs = validRows.map((row, index) => ({
			id: `p${pdcs.length + index + 1}`,
			leaseId: pdcLeaseId,
			chequeNo: row.chequeNo,
			bank: row.bank,
			date: row.maturityDate,
			amount: Number(row.amount) || 0,
			status: "received",
			file: row.file
		}));
		setPdcs((items) => [...newPdcs, ...items]);
		recordAudit({
			stage: "PDC Bulk Added",
			owner: "Finance",
			input: `${newPdcs.length} PDC cheque(s) recorded for lease ${pdcLeaseId}`,
			approval: "Manual bulk entry",
			status: "received",
			output: `${newPdcs.length} PDCs recorded into the system for lease ${pdcLeaseId}`
		});
		setPdcRows(Array.from({ length: 12 }, () => ({
			chequeNo: "",
			bank: "",
			amount: "",
			maturityDate: today.toISOString().split("T")[0],
			tenureStart: "",
			tenureEnd: "",
			file: ""
		})));
		setPdcLeaseId("");
		setAddPdcOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: createReservationOpen,
				onOpenChange: setCreateReservationOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[480px] max-h-[88vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-lg font-bold",
								children: "Reserve Property Unit"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: "Locks unit from Available to Reserved until lease conversion or validity expiration."
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 overflow-y-auto space-y-4 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Target Property *",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
											value: reservationForm.property,
											onValueChange: (property) => setReservationForm((form) => ({
												...form,
												property,
												unit: ""
											})),
											placeholder: "Select Property",
											emptyText: "No property found.",
											options: Array.from(new Set((realUnits.length > 0 ? realUnits : units).map((u) => u.property))).map((prop) => ({
												label: prop,
												value: prop
											}))
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Available Unit *",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
											value: reservationForm.unit,
											onValueChange: (unit) => setReservationForm((form) => ({
												...form,
												unit
											})),
											disabled: !reservationForm.property,
											placeholder: "Select Unit",
											emptyText: "No available unit found for this property.",
											options: (realUnits.length > 0 ? realUnits : units).filter((u) => {
												if (u.property !== reservationForm.property) return false;
												if (u.status && u.status.toLowerCase() !== "available") return false;
												if (reservations.some((r) => r.property === u.property && r.unit === u.unit && (r.status === "reserved" || r.status === "converted"))) return false;
												if (leases.some((l) => l.property === u.property && l.unit === u.unit && (l.status === "active" || l.status === "fully_signed" || l.status === "collection_completed"))) return false;
												return true;
											}).map((unit) => ({
												label: `${unit.unit} - Available`,
												value: unit.unit
											}))
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Prospective Tenant Customer *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
										value: reservationForm.tenantName,
										onValueChange: (tenantName) => setReservationForm((form) => ({
											...form,
											tenantName
										})),
										placeholder: "Select Customer Profile",
										emptyText: "No customer found.",
										options: customers.map((c) => ({
											label: `${c.name} (${c.type})`,
											value: c.name
										}))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border bg-muted/20 p-4 space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "h-3.5 w-3.5 text-primary" }), " Reservation Timing & Terms"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Expected Lease Start",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "date",
													value: reservationForm.startDate,
													onChange: (event) => setReservationForm((form) => ({
														...form,
														startDate: event.target.value
													})),
													className: "bg-background"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Validity Hold (Days)",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: reservationForm.validityDays,
													onChange: (event) => setReservationForm((form) => ({
														...form,
														validityDays: event.target.value
													})),
													className: "bg-background"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Proposed Monthly Rent (QR)",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												placeholder: "0.00",
												value: reservationForm.rent,
												onChange: (event) => setReservationForm((form) => ({
													...form,
													rent: event.target.value
												})),
												className: "bg-background"
											})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Internal Remarks / Notes",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										placeholder: "Optional notes regarding reservation deposit or booking terms...",
										value: reservationForm.remarks,
										onChange: (event) => setReservationForm((form) => ({
											...form,
											remarks: event.target.value
										})),
										className: "text-xs"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex items-center justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setCreateReservationOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "shadow-sm",
								onClick: async () => {
									await withBusy("reserve", createReservation);
									setCreateReservationOpen(false);
								},
								children: [busyAction === "reserve" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mr-2 h-4 w-4" }), "Confirm Unit Reservation"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: createCustomerOpen,
				onOpenChange: setCreateCustomerOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[560px] max-h-[88vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-lg font-bold",
								children: "New Customer Profile"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: "Register individual or corporate tenant details with KYC identity validation."
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 overflow-y-auto space-y-4 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Full Name / Entity Name *",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "e.g. John Doe / Gulf Trading W.L.L.",
											value: customerForm.name,
											onChange: (event) => setCustomerForm((form) => ({
												...form,
												name: event.target.value
											})),
											className: "bg-background/80"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Customer Type",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: customerForm.type,
											onValueChange: (type) => setCustomerForm((form) => ({
												...form,
												type
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "bg-background/80",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "individual",
												children: "Individual"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "company",
												children: "Corporate / Company"
											})] })]
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border bg-muted/20 p-4 space-y-3.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "h-3.5 w-3.5 text-primary" }), " Identity & Verification Details"]
									}), customerForm.type === "individual" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Qatar ID (QID)",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "11 digits (e.g. 28463400000)",
													maxLength: 11,
													value: customerForm.qatarId,
													onChange: (event) => setCustomerForm((form) => ({
														...form,
														qatarId: event.target.value.replace(/\D/g, "")
													})),
													className: "bg-background font-mono"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Passport Number",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "9 characters (e.g. A12345678)",
													maxLength: 9,
													value: customerForm.passport,
													onChange: (event) => setCustomerForm((form) => ({
														...form,
														passport: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
													})),
													className: "bg-background font-mono uppercase"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Nationality",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
													options: nationalityOptions,
													value: customerForm.nationality,
													onValueChange: (val) => setCustomerForm((form) => ({
														...form,
														nationality: val
													})),
													placeholder: "Search & Select Nationality...",
													emptyText: "No matching nationality found."
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Emergency Contact",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "+974 5555 1234",
													value: customerForm.emergencyContact,
													onChange: (event) => setCustomerForm((form) => ({
														...form,
														emergencyContact: event.target.value
													})),
													className: "bg-background"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Profession",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
												options: professionOptions,
												value: customerForm.employerInfo,
												onValueChange: (val) => setCustomerForm((form) => ({
													...form,
													employerInfo: val
												})),
												placeholder: "Search & Select Profession...",
												emptyText: "No matching profession found."
											})
										})
									] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Commercial Registration (CR)",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												placeholder: "12345/00",
												value: customerForm.crNumber,
												onChange: (event) => setCustomerForm((form) => ({
													...form,
													crNumber: event.target.value
												})),
												className: "bg-background font-mono"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Authorized Signatory",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												placeholder: "Managing Director / POA",
												value: customerForm.authorizedSignatory,
												onChange: (event) => setCustomerForm((form) => ({
													...form,
													authorizedSignatory: event.target.value
												})),
												className: "bg-background"
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Emergency Contact",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												placeholder: "+974 4400 0000",
												value: customerForm.emergencyContact,
												onChange: (event) => setCustomerForm((form) => ({
													...form,
													emergencyContact: event.target.value
												})),
												className: "bg-background"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Company / Ops Contact",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												placeholder: "Operations Manager",
												value: customerForm.employerInfo,
												onChange: (event) => setCustomerForm((form) => ({
													...form,
													employerInfo: event.target.value
												})),
												className: "bg-background"
											})
										})]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border bg-muted/20 p-4 space-y-3.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-3.5 w-3.5 text-primary" }), " Contact & Address Records"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Mobile Number *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "+974 3300 0000",
													value: customerForm.mobile,
													onChange: (event) => setCustomerForm((form) => ({
														...form,
														mobile: event.target.value
													})),
													className: "bg-background"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Email Address *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "tenant@domain.qa",
													value: customerForm.email,
													onChange: (event) => setCustomerForm((form) => ({
														...form,
														email: event.target.value
													})),
													className: "bg-background"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Permanent Address",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
													rows: 2,
													placeholder: "Home country / headquarters address...",
													value: customerForm.permanentAddress,
													onChange: (event) => setCustomerForm((form) => ({
														...form,
														permanentAddress: event.target.value
													})),
													className: "bg-background text-xs"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Local Qatar Address",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
													rows: 2,
													placeholder: "Building, Street, Zone / PO Box...",
													value: customerForm.localAddress,
													onChange: (event) => setCustomerForm((form) => ({
														...form,
														localAddress: event.target.value
													})),
													className: "bg-background text-xs"
												})
											})]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex items-center justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setCreateCustomerOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "shadow-sm",
								onClick: async () => {
									await withBusy("customer", createCustomer);
									setCreateCustomerOpen(false);
								},
								children: [busyAction === "customer" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "mr-2 h-4 w-4" }), "Save Customer"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: viewCustomerOpen,
				onOpenChange: setViewCustomerOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[520px] max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "text-base font-bold flex items-center gap-2",
									children: viewCustomerData?.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									className: "text-xs",
									children: "Customer Profile ID & KYC Overview"
								})] })]
							}), viewCustomerData && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: viewCustomerData.status })]
						}),
						viewCustomerData && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 overflow-y-auto space-y-4 flex-1 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-3 bg-muted/30 p-3.5 rounded-xl border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase font-bold tracking-wider text-muted-foreground",
										children: "Type"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-semibold capitalize text-foreground mt-0.5",
										children: viewCustomerData.type
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase font-bold tracking-wider text-muted-foreground",
										children: "Primary ID"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-mono font-bold text-foreground mt-0.5",
										children: viewCustomerData.qatarId || viewCustomerData.passport || viewCustomerData.crNumber || "—"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase font-bold tracking-wider text-muted-foreground",
										children: "Nationality"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-semibold text-foreground mt-0.5",
										children: viewCustomerData.nationality || "—"
									})] })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2.5 border rounded-xl p-4 bg-muted/10",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 text-primary" }), " Verified Contact Information"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3 text-xs pt-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-2.5 rounded-lg bg-background border",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-semibold",
													children: "Mobile"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-foreground",
													children: viewCustomerData.mobile || "—"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-2.5 rounded-lg bg-background border",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-semibold",
													children: "Email"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-foreground truncate block",
													children: viewCustomerData.email || "—"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-2.5 rounded-lg bg-background border",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-semibold",
													children: "Emergency"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-foreground",
													children: viewCustomerData.emergencyContact || "—"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-2.5 rounded-lg bg-background border",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-semibold",
													children: "Profession / Signatory"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-foreground truncate block",
													children: viewCustomerData.employerInfo || viewCustomerData.authorizedSignatory || "—"
												})]
											})
										]
									}),
									viewCustomerData.permanentAddress && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2.5 rounded-lg bg-background border text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground block text-[10px] uppercase font-semibold",
											children: "Permanent Address"
										}), viewCustomerData.permanentAddress]
									}),
									viewCustomerData.localAddress && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2.5 rounded-lg bg-background border text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground block text-[10px] uppercase font-semibold",
											children: "Local Address"
										}), viewCustomerData.localAddress]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setViewCustomerOpen(false),
								children: "Close"
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: editCustomerOpen,
				onOpenChange: setEditCustomerOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[560px] max-h-[88vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-lg font-bold",
								children: "Edit Customer Profile"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: [
									"Update profile details for ",
									editCustomerData?.name,
									"."
								]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 overflow-y-auto space-y-4 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Full Name / Entity Name *",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: customerForm.name,
											onChange: (event) => setCustomerForm((form) => ({
												...form,
												name: event.target.value
											})),
											className: "bg-background/80"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Type",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: customerForm.type,
											onValueChange: (type) => setCustomerForm((form) => ({
												...form,
												type
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "bg-background/80",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "individual",
												children: "Individual"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "company",
												children: "Company"
											})] })]
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border bg-muted/20 p-4 space-y-3.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "h-3.5 w-3.5 text-primary" }), " Identity Credentials"]
									}), customerForm.type === "individual" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Qatar ID (QID)",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "11 digits (e.g. 28463400000)",
													maxLength: 11,
													value: customerForm.qatarId,
													onChange: (event) => setCustomerForm((form) => ({
														...form,
														qatarId: event.target.value.replace(/\D/g, "")
													})),
													className: "bg-background font-mono"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Passport Number",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "9 characters (e.g. A12345678)",
													maxLength: 9,
													value: customerForm.passport,
													onChange: (event) => setCustomerForm((form) => ({
														...form,
														passport: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
													})),
													className: "bg-background font-mono uppercase"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Nationality",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
													options: nationalityOptions,
													value: customerForm.nationality,
													onValueChange: (val) => setCustomerForm((form) => ({
														...form,
														nationality: val
													})),
													placeholder: "Search & Select Nationality...",
													emptyText: "No matching nationality found."
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Emergency Contact",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "+974 5555 1234",
													value: customerForm.emergencyContact,
													onChange: (event) => setCustomerForm((form) => ({
														...form,
														emergencyContact: event.target.value
													})),
													className: "bg-background"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Profession",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
												options: professionOptions,
												value: customerForm.employerInfo,
												onValueChange: (val) => setCustomerForm((form) => ({
													...form,
													employerInfo: val
												})),
												placeholder: "Search & Select Profession...",
												emptyText: "No matching profession found."
											})
										})
									] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Commercial Registration",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: customerForm.crNumber,
												onChange: (event) => setCustomerForm((form) => ({
													...form,
													crNumber: event.target.value
												})),
												className: "bg-background font-mono"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Authorized Signatory",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: customerForm.authorizedSignatory,
												onChange: (event) => setCustomerForm((form) => ({
													...form,
													authorizedSignatory: event.target.value
												})),
												className: "bg-background"
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Emergency Contact",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: customerForm.emergencyContact,
												onChange: (event) => setCustomerForm((form) => ({
													...form,
													emergencyContact: event.target.value
												})),
												className: "bg-background"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Company / Ops Contact",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: customerForm.employerInfo,
												onChange: (event) => setCustomerForm((form) => ({
													...form,
													employerInfo: event.target.value
												})),
												className: "bg-background"
											})
										})]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border bg-muted/20 p-4 space-y-3.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-3.5 w-3.5 text-primary" }), " Contact & Address"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Mobile",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: customerForm.mobile,
													onChange: (event) => setCustomerForm((form) => ({
														...form,
														mobile: event.target.value
													})),
													className: "bg-background"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Email",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: customerForm.email,
													onChange: (event) => setCustomerForm((form) => ({
														...form,
														email: event.target.value
													})),
													className: "bg-background"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Permanent Address",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
													rows: 2,
													value: customerForm.permanentAddress,
													onChange: (event) => setCustomerForm((form) => ({
														...form,
														permanentAddress: event.target.value
													})),
													className: "bg-background text-xs"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Local Address",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
													rows: 2,
													value: customerForm.localAddress,
													onChange: (event) => setCustomerForm((form) => ({
														...form,
														localAddress: event.target.value
													})),
													className: "bg-background text-xs"
												})
											})]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex items-center justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setEditCustomerOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								className: "shadow-sm",
								onClick: () => {
									if (editCustomerData) {
										const valErr = validateCustomerIdentifiers(customerForm);
										if (valErr) {
											alert(valErr);
											return;
										}
										if (isCustomerDuplicate(customerForm, editCustomerData.id)) {
											alert("Another customer already has this Qatar ID, Passport, CR Number, Mobile, or Email.");
											return;
										}
										setCustomers((prev) => prev.map((c) => c.id === editCustomerData.id ? {
											...c,
											...customerForm
										} : c));
										toast.success("Customer profile updated successfully.");
										setEditCustomerOpen(false);
									}
								},
								children: "Save Changes"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: createLeaseOpen,
				onOpenChange: setCreateLeaseOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-lg font-bold",
								children: "Create Lease Agreement"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: selectedReservationForLease ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Convert reservation · Unit: ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-foreground",
										children: selectedReservationForLease.unit
									}),
									" · Tenant: ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-foreground",
										children: selectedReservationForLease.tenantName
									})
								] }) : "Generate lease contract terms and schedule."
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 overflow-y-auto space-y-4 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border bg-muted/20 p-4 space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "h-3.5 w-3.5 text-primary" }), " Lease Period & Duration"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Lease Start Date *",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "date",
												value: createLeaseForm.startDate,
												onChange: (e) => setCreateLeaseForm((f) => ({
													...f,
													startDate: e.target.value
												})),
												className: "bg-background"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Lease End Date *",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "date",
												value: createLeaseForm.endDate,
												onChange: (e) => setCreateLeaseForm((f) => ({
													...f,
													endDate: e.target.value
												})),
												className: "bg-background"
											})
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border bg-muted/20 p-4 space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-3.5 w-3.5 text-primary" }), " Financial & PDC Terms"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-3 gap-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Monthly Rent (QR) *",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														value: createLeaseForm.monthlyRent,
														onChange: (e) => setCreateLeaseForm((f) => ({
															...f,
															monthlyRent: e.target.value
														})),
														className: "bg-background"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Security Deposit (QR) *",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														value: createLeaseForm.securityDeposit,
														onChange: (e) => setCreateLeaseForm((f) => ({
															...f,
															securityDeposit: e.target.value
														})),
														className: "bg-background"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Payment Frequency",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: createLeaseForm.paymentFrequency,
														onValueChange: (v) => setCreateLeaseForm((f) => ({
															...f,
															paymentFrequency: v
														})),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "bg-background",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "monthly",
																children: "Monthly"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "quarterly",
																children: "Quarterly"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "half_yearly",
																children: "Half Yearly"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "yearly",
																children: "Yearly"
															})
														] })]
													})
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-3 gap-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "No. of PDC Cheques",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														min: 1,
														max: 36,
														value: createLeaseForm.pdcCount,
														onChange: (e) => setCreateLeaseForm((f) => ({
															...f,
															pdcCount: e.target.value
														})),
														className: "bg-background"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Grace Period (days)",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														value: createLeaseForm.gracePeriodDays,
														onChange: (e) => setCreateLeaseForm((f) => ({
															...f,
															gracePeriodDays: e.target.value
														})),
														className: "bg-background"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Notice Period (days)",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														value: createLeaseForm.noticePeriodDays,
														onChange: (e) => setCreateLeaseForm((f) => ({
															...f,
															noticePeriodDays: e.target.value
														})),
														className: "bg-background"
													})
												})
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border bg-muted/20 p-4 space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-3.5 w-3.5 text-primary" }), " Responsibilities & Special Clauses"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Maintenance Responsibility",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: createLeaseForm.maintenanceResponsibility,
													onValueChange: (v) => setCreateLeaseForm((f) => ({
														...f,
														maintenanceResponsibility: v
													})),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "bg-background",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Owner/Property Manager for major repairs; tenant for misuse",
															children: "Owner/PM – Major; Tenant – Misuse"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Tenant",
															children: "Tenant (Full)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Owner",
															children: "Owner (Full)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Shared as per lease clause",
															children: "Shared as per Clause"
														})
													] })]
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Utility Responsibility",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: createLeaseForm.utilityResponsibility,
													onValueChange: (v) => setCreateLeaseForm((f) => ({
														...f,
														utilityResponsibility: v
													})),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "bg-background",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Tenant",
															children: "Tenant"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Owner",
															children: "Owner"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Shared",
															children: "Shared"
														})
													] })]
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Parking / Facility Details",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: createLeaseForm.parkingDetails,
													onChange: (e) => setCreateLeaseForm((f) => ({
														...f,
														parkingDetails: e.target.value
													})),
													className: "bg-background",
													placeholder: "e.g. 1 bay / remote #44"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Penalties Description",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: createLeaseForm.penalties,
													onChange: (e) => setCreateLeaseForm((f) => ({
														...f,
														penalties: e.target.value
													})),
													className: "bg-background",
													placeholder: "QR 100/day after grace period"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Special Contract Conditions",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												rows: 2,
												value: createLeaseForm.specialConditions,
												onChange: (e) => setCreateLeaseForm((f) => ({
													...f,
													specialConditions: e.target.value
												})),
												placeholder: "Any specific covenants, permissions or rules...",
												className: "bg-background text-xs"
											})
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex items-center justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setCreateLeaseOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "shadow-sm",
								onClick: () => {
									if (!createLeaseForm.startDate || !createLeaseForm.endDate || !createLeaseForm.monthlyRent) {
										alert("Start Date, End Date and Monthly Rent are required.");
										return;
									}
									if (selectedReservationForLease) createLeaseFromReservation(selectedReservationForLease, createLeaseForm);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "mr-2 h-4 w-4" }), " Create Lease"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: uploadDocOpen,
				onOpenChange: setUploadDocOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[480px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Upload Tenant Document"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: "Upload identification, commercial or contract attachments."
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mx-auto h-8 w-8 text-primary/60 mb-2" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Select File *",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "file",
												className: "cursor-pointer bg-background",
												onChange: (e) => {
													const name = e.target.files?.[0]?.name || "";
													setUploadDocForm((f) => ({
														...f,
														file: name,
														fileName: f.fileName || name
													}));
												}
											})
										}),
										uploadDocForm.file && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-primary font-medium mt-2",
											children: ["Selected: ", uploadDocForm.file]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Custom Document Name (Optional)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: uploadDocForm.fileName,
										onChange: (e) => setUploadDocForm((f) => ({
											...f,
											fileName: e.target.value
										})),
										placeholder: "e.g. Qatar ID - Front and Back"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Remarks (Optional)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										value: uploadDocForm.remarks,
										onChange: (e) => setUploadDocForm((f) => ({
											...f,
											remarks: e.target.value
										})),
										placeholder: "Optional notes for verifier...",
										className: "text-xs"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setUploadDocOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: submitUploadDoc,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "mr-2 h-4 w-4" }), " Upload Document"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: releaseOpen,
				onOpenChange: setReleaseOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[480px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-red-500/10 via-rose-500/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Release Unit Reservation"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: selectedReservationForRelease && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Unit: ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-foreground",
										children: selectedReservationForRelease.unit
									}),
									" · Tenant: ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-foreground",
										children: selectedReservationForRelease.tenantName
									})
								] })
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Release Reason Type",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: releaseType,
										onValueChange: (v) => setReleaseType(v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "released",
											children: "Manual Release / Tenant Withdrew"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "expired",
											children: "Expired Hold (Validity Lapsed)"
										})] })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Reason & Audit Remarks",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 3,
										value: releaseReason,
										onChange: (e) => setReleaseReason(e.target.value),
										placeholder: "State why this reservation is being cancelled or released...",
										className: "text-xs"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-amber-300 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"Releasing unlocks this unit immediately back to ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Available" }),
										" status for new lease bookings."
									] })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setReleaseOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "destructive",
								onClick: confirmRelease,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "mr-2 h-4 w-4" }), " Confirm Release"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: renewalNoticeOpen,
				onOpenChange: setRenewalNoticeOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "text-base font-bold",
									children: "Generate Lease Renewal Notices"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									className: "text-xs text-muted-foreground",
									children: "Automated notice dispatch for contracts expiring within 60 days."
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-full border border-primary/20",
								children: [upcomingRenewals.length, " Expiring"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 overflow-y-auto space-y-4 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Select Target Lease / Unit",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: renewalNoticeForm.selectedLeaseId,
										onValueChange: (v) => setRenewalNoticeForm((f) => ({
											...f,
											selectedLeaseId: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "bg-background",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a lease..." })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "all",
											children: "⚡ All Eligible Leases (Batch Process)"
										}), upcomingRenewals.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: l.id,
											children: [
												l.tenantName,
												" — ",
												l.unit,
												" (",
												l.property,
												")"
											]
										}, l.id))] })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border bg-muted/20 p-4 space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Percent, { className: "h-3.5 w-3.5 text-primary" }), " Renewal Parameters"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Proposed Rent Increase %",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													min: 0,
													max: 30,
													value: renewalNoticeForm.rentIncreasePercent,
													onChange: (e) => setRenewalNoticeForm((f) => ({
														...f,
														rentIncreasePercent: e.target.value
													})),
													className: "bg-background"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Cutoff (days before expiry)",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													min: 7,
													max: 90,
													value: renewalNoticeForm.lastConfirmationDays,
													onChange: (e) => setRenewalNoticeForm((f) => ({
														...f,
														lastConfirmationDays: e.target.value
													})),
													className: "bg-background"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Revised Contract Terms",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: renewalNoticeForm.revisedTerms,
												onChange: (e) => setRenewalNoticeForm((f) => ({
													...f,
													revisedTerms: e.target.value
												})),
												className: "bg-background",
												placeholder: "Standard 12-month extension with current terms"
											})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Additional Notification Recipients",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: renewalNoticeForm.additionalRecipients,
										onChange: (e) => setRenewalNoticeForm((f) => ({
											...f,
											additionalRecipients: e.target.value
										})),
										placeholder: "legal@domain.qa, accounts@domain.qa"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Internal Workflow Notes",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										value: renewalNoticeForm.notes,
										onChange: (e) => setRenewalNoticeForm((f) => ({
											...f,
											notes: e.target.value
										})),
										placeholder: "Internal follow-up instructions...",
										className: "text-xs"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setRenewalNoticeOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: () => generateRenewalNotices(renewalNoticeForm),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "mr-2 h-4 w-4" }), " Send Renewal Notices"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: verifyDocOpen,
				onOpenChange: setVerifyDocOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[480px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheckCorner, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Document Verification"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: "Compliance review and verification status assignment."
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Verification Decision",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: verifyDocForm.status,
										onValueChange: (v) => setVerifyDocForm((f) => ({
											...f,
											status: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "verified",
												children: "✅ Verified & Approved"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "info_required",
												children: "⚠️ Clarification / Re-upload Required"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "rejected",
												children: "❌ Rejected (Invalid / Mismatched)"
											})
										] })]
									})
								}),
								verifyDocForm.status === "verified" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Document Expiry Date (if applicable)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: verifyDocForm.expiryDate,
										onChange: (e) => setVerifyDocForm((f) => ({
											...f,
											expiryDate: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Reviewer Notes / Justification",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 3,
										value: verifyDocForm.remarks,
										onChange: (e) => setVerifyDocForm((f) => ({
											...f,
											remarks: e.target.value
										})),
										placeholder: verifyDocForm.status === "verified" ? "All details verified and match official record." : "Specify exactly what needs correction...",
										className: "text-xs"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setVerifyDocOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: submitDocumentVerification,
								children: "Submit Review"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: editTermsOpen,
				onOpenChange: setEditTermsOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-2xl max-h-[88vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Edit Agreement Terms"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: "Adjust payment schedules, penalties, and governance rules."
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 overflow-y-auto space-y-4 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border bg-muted/20 p-4 space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5 text-primary" }), " Payment Frequency & PDCs"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-4 gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Frequency",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: agreementTermsForm.paymentFrequency,
													onValueChange: (v) => setAgreementTermsForm((f) => ({
														...f,
														paymentFrequency: v
													})),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "bg-background",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "monthly",
															children: "Monthly"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "quarterly",
															children: "Quarterly"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "half_yearly",
															children: "Half Yearly"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "yearly",
															children: "Yearly"
														})
													] })]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "No. of PDCs",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: agreementTermsForm.pdcCount,
													onChange: (e) => setAgreementTermsForm((f) => ({
														...f,
														pdcCount: Number(e.target.value)
													})),
													className: "bg-background"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Grace (Days)",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: agreementTermsForm.gracePeriodDays,
													onChange: (e) => setAgreementTermsForm((f) => ({
														...f,
														gracePeriodDays: Number(e.target.value)
													})),
													className: "bg-background"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Notice (Days)",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: agreementTermsForm.noticePeriodDays,
													onChange: (e) => setAgreementTermsForm((f) => ({
														...f,
														noticePeriodDays: Number(e.target.value)
													})),
													className: "bg-background"
												})
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Penalties Rule",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											rows: 2,
											value: agreementTermsForm.penalties,
											onChange: (e) => setAgreementTermsForm((f) => ({
												...f,
												penalties: e.target.value
											})),
											placeholder: "Late payment penalty after grace period...",
											className: "bg-background text-xs"
										})
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border bg-muted/20 p-4 space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5 text-primary" }), " Maintenance, Utilities & Facilities"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Maintenance Responsibility",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: agreementTermsForm.maintenanceResponsibility,
												onValueChange: (v) => setAgreementTermsForm((f) => ({
													...f,
													maintenanceResponsibility: v
												})),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "bg-background",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select responsibility" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Property Manager for major repairs, tenant for misuse damages",
														children: "PM for Major / Tenant for Misuse"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Owner",
														children: "Owner (Full)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Tenant",
														children: "Tenant (Full)"
													})
												] })]
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Utility Responsibility",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: agreementTermsForm.utilityResponsibility,
												onValueChange: (v) => setAgreementTermsForm((f) => ({
													...f,
													utilityResponsibility: v
												})),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "bg-background",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select responsibility" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Tenant",
														children: "Tenant"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Owner",
														children: "Owner"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Shared",
														children: "Shared"
													})
												] })]
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Parking & Facilities",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: agreementTermsForm.parkingDetails,
											onChange: (e) => setAgreementTermsForm((f) => ({
												...f,
												parkingDetails: e.target.value
											})),
											placeholder: "e.g. 1 covered bay, gate remote #12",
											className: "bg-background"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Special Clauses & Covenants",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											rows: 2,
											value: agreementTermsForm.specialConditions,
											onChange: (e) => setAgreementTermsForm((f) => ({
												...f,
												specialConditions: e.target.value
											})),
											placeholder: "Any specific covenants or permissions...",
											className: "bg-background text-xs"
										})
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setEditTermsOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: submitAgreementTerms,
								children: "Save Agreement Terms"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: tenantSignOpen,
				onOpenChange: setTenantSignOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[480px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Tenant Lease Signature"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: [
									"Record tenant agreement signing for ",
									signatureWorkflowLease?.tenantName,
									" (",
									signatureWorkflowLease?.unit,
									")."
								]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Date of Signing",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											value: tenantSignForm.signedAt,
											onChange: (e) => setTenantSignForm((f) => ({
												...f,
												signedAt: e.target.value
											}))
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Received By",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: tenantSignForm.receivedBy,
											onValueChange: (v) => setTenantSignForm((f) => ({
												...f,
												receivedBy: v
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Leasing Department",
													children: "Leasing Dept"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Property Manager",
													children: "Property Manager"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Admin",
													children: "Admin Officer"
												})
											] })]
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mx-auto h-7 w-7 text-primary/60 mb-2" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Upload Signed Document",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "file",
												className: "cursor-pointer bg-background",
												onChange: (e) => setTenantSignForm((f) => ({
													...f,
													signedDocument: e.target.files?.[0]?.name || ""
												}))
											})
										}),
										tenantSignForm.signedDocument && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-primary font-medium mt-1",
											children: ["Selected: ", tenantSignForm.signedDocument]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Signing Remarks",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										value: tenantSignForm.remarks,
										onChange: (e) => setTenantSignForm((f) => ({
											...f,
											remarks: e.target.value
										})),
										placeholder: "Optional notes regarding signing...",
										className: "text-xs"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setTenantSignOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: submitTenantSign,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "mr-2 h-4 w-4" }), " Confirm Tenant Sign"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: collectOpen,
				onOpenChange: setCollectOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-5xl max-h-[92vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-5 w-5 text-primary" }), " Collect Rent & PDC Schedule"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
							"Record PDC collection, cheque counts, breakdown, and security deposit for ",
							signatureWorkflowLease?.tenantName,
							"."
						] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border bg-muted/20 p-3 space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
										children: "Lease Period & PDC Count"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-3 gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Lease Start Date",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "date",
													value: collectForm.startDate,
													onChange: (e) => setCollectForm((f) => ({
														...f,
														startDate: e.target.value
													}))
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Lease End Date",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "date",
													value: collectForm.endDate,
													onChange: (e) => setCollectForm((f) => ({
														...f,
														endDate: e.target.value
													}))
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "PDC Count (No. of Cheques)",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													min: 1,
													max: 36,
													value: collectForm.pdcCount,
													onChange: (e) => {
														const count = Number(e.target.value);
														setCollectForm((f) => ({
															...f,
															pdcCount: count
														}));
													}
												})
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Rent Payment Mode",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: collectForm.paymentMode,
											onValueChange: (v) => setCollectForm((f) => ({
												...f,
												paymentMode: v
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "PDC",
													children: "PDC (Post-Dated Cheques)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Cash",
													children: "Cash"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Bank Transfer",
													children: "Bank Transfer"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Guarantee Cheque",
													children: "Guarantee Cheque"
												})
											] })]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Bank Name (for PDCs)",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: collectForm.chequeBank,
											onChange: (e) => setCollectForm((f) => ({
												...f,
												chequeBank: e.target.value
											})),
											placeholder: "e.g. QNB, Doha Bank, CBQ"
										})
									})]
								}),
								collectForm.paymentMode === "PDC" && signatureWorkflowLease && (() => {
									const totalContractRent = (signatureWorkflowLease.monthlyRent || 0) * (signatureWorkflowLease.pdcCount || 12);
									const count = Number(collectForm.pdcCount) || signatureWorkflowLease.pdcCount || 12;
									const regAmount = Number(collectForm.regularChequeAmount) || signatureWorkflowLease.monthlyRent;
									const finalAmount = count > 1 ? totalContractRent - regAmount * (count - 1) : totalContractRent;
									function addMonthOffset(baseDateStr, monthOffset) {
										const d = new Date(baseDateStr);
										const day = d.getDate();
										const targetMonthRaw = d.getMonth() + monthOffset;
										const targetYear = d.getFullYear() + Math.floor(targetMonthRaw / 12);
										const targetMonth = (targetMonthRaw % 12 + 12) % 12;
										const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
										const finalDay = Math.min(day, lastDay);
										return `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(finalDay).padStart(2, "0")}`;
									}
									const regenerateCheques = (newCount = count, newRegAmt = regAmount, newFirstDate = collectForm.firstChequeDate || collectForm.startDate || signatureWorkflowLease.startDate) => {
										const leaseStartStr = signatureWorkflowLease.startDate || collectForm.startDate || newFirstDate;
										const generated = Array.from({ length: newCount }, (_, i) => {
											let amount = newRegAmt;
											if (i === newCount - 1 && newCount > 1) amount = Math.max(0, totalContractRent - newRegAmt * (newCount - 1));
											const tsDate = new Date(leaseStartStr);
											tsDate.setMonth(tsDate.getMonth() + i);
											const tenureStartStr = tsDate.toISOString().split("T")[0];
											const teDate = new Date(leaseStartStr);
											teDate.setMonth(teDate.getMonth() + i + 1);
											teDate.setDate(teDate.getDate() - 1);
											const tenureEndStr = teDate.toISOString().split("T")[0];
											const maturityStr = addMonthOffset(newFirstDate, i);
											return {
												chequeNo: `PDC-${signatureWorkflowLease.unit.replace(/\W/g, "")}-${String(i + 1).padStart(3, "0")}`,
												bank: collectForm.chequeBank || "QNB",
												date: maturityStr,
												amount,
												period: `Cheque ${i + 1} of ${newCount}`,
												tenureStart: tenureStartStr,
												tenureEnd: tenureEndStr,
												file: ""
											};
										});
										setCollectForm((f) => ({
											...f,
											pdcCount: newCount,
											customCheques: generated
										}));
									};
									const displayedRows = collectForm.customCheques && collectForm.customCheques.length > 0 ? collectForm.customCheques : Array.from({ length: count }, (_, i) => {
										const baseDate = collectForm.firstChequeDate || collectForm.startDate || signatureWorkflowLease.startDate || today.toISOString().split("T")[0];
										const bd = new Date(baseDate);
										const day = bd.getDate();
										const targetMonthRaw = bd.getMonth() + i;
										const targetYear = bd.getFullYear() + Math.floor(targetMonthRaw / 12);
										const targetMonth = (targetMonthRaw % 12 + 12) % 12;
										const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
										const maturityStr = `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
										const leaseStart = signatureWorkflowLease.startDate || collectForm.startDate || baseDate;
										const tsDate = new Date(leaseStart);
										tsDate.setMonth(tsDate.getMonth() + i);
										const teDate = new Date(leaseStart);
										teDate.setMonth(teDate.getMonth() + i + 1);
										teDate.setDate(teDate.getDate() - 1);
										return {
											chequeNo: `PDC-${signatureWorkflowLease.unit.replace(/\W/g, "")}-${String(i + 1).padStart(3, "0")}`,
											bank: collectForm.chequeBank || "QNB",
											date: maturityStr,
											amount: regAmount,
											period: `Cheque ${i + 1}`,
											tenureStart: tsDate.toISOString().split("T")[0],
											tenureEnd: teDate.toISOString().split("T")[0],
											file: ""
										};
									});
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs font-semibold uppercase tracking-wider text-primary",
													children: "Enter up to 12 PDC rows"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-xs text-muted-foreground",
													children: [
														"Total Rent: ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["QR ", totalContractRent.toLocaleString()] }),
														" across ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: count }),
														" cheques"
													]
												})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "outline",
													className: "h-7 text-xs gap-1",
													onClick: () => regenerateCheques(),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3 w-3" }), " Refresh / Reset Cheques"]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "First PDC Maturity Date",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "date",
														value: collectForm.firstChequeDate,
														onChange: (e) => {
															const val = e.target.value;
															setCollectForm((f) => ({
																...f,
																firstChequeDate: val
															}));
															regenerateCheques(count, regAmount, val);
														}
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Regular Cheque Amount (QR)",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														value: collectForm.regularChequeAmount,
														onChange: (e) => {
															const val = Number(e.target.value) || 0;
															setCollectForm((f) => ({
																...f,
																regularChequeAmount: String(val)
															}));
															regenerateCheques(count, val, collectForm.firstChequeDate);
														},
														placeholder: `${signatureWorkflowLease.monthlyRent}`
													})
												})]
											}),
											count > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-xs bg-background/80 p-2.5 rounded border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													"Breakdown: ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: count - 1 }),
													" cheque(s) of ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["QR ", regAmount.toLocaleString()] }),
													" + ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "1" }),
													" final cheque for remaining balance of ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["QR ", Math.max(0, finalAmount).toLocaleString()] })
												] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
													variant: "outline",
													className: "font-mono text-xs font-bold text-primary",
													children: ["Total: QR ", ((count - 1) * regAmount + finalAmount).toLocaleString()]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between items-center text-xs",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-semibold text-muted-foreground",
															children: [
																"Cheque Schedule Lines (",
																displayedRows.length,
																")"
															]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															size: "sm",
															variant: "outline",
															className: "h-6 text-xs gap-1",
															onClick: () => {
																const existing = collectForm.customCheques && collectForm.customCheques.length > 0 ? collectForm.customCheques : displayedRows;
																const nextIdx = existing.length + 1;
																const baseDate = collectForm.firstChequeDate || collectForm.startDate || signatureWorkflowLease.startDate || today.toISOString().split("T")[0];
																const bd = new Date(baseDate);
																const day = bd.getDate();
																const targetMonthRaw = bd.getMonth() + existing.length;
																const targetYear = bd.getFullYear() + Math.floor(targetMonthRaw / 12);
																const targetMonth = (targetMonthRaw % 12 + 12) % 12;
																const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
																const nextMaturity = `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
																const leaseStart = signatureWorkflowLease.startDate || collectForm.startDate || baseDate;
																const tsDate = new Date(leaseStart);
																tsDate.setMonth(tsDate.getMonth() + existing.length);
																const tenureStartStr = tsDate.toISOString().split("T")[0];
																const teDate = new Date(leaseStart);
																teDate.setMonth(teDate.getMonth() + existing.length + 1);
																teDate.setDate(teDate.getDate() - 1);
																const tenureEndStr = teDate.toISOString().split("T")[0];
																setCollectForm((f) => ({
																	...f,
																	pdcCount: nextIdx,
																	customCheques: [...existing, {
																		chequeNo: `PDC-${signatureWorkflowLease.unit.replace(/\W/g, "")}-${String(nextIdx).padStart(3, "0")}`,
																		bank: collectForm.chequeBank || "Bank",
																		date: nextMaturity,
																		amount: regAmount,
																		period: `Cheque ${nextIdx}`,
																		tenureStart: tenureStartStr,
																		tenureEnd: tenureEndStr,
																		file: ""
																	}]
																}));
															},
															children: "+ Add Cheque Row"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "max-h-72 overflow-y-auto border rounded bg-background",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
															className: "w-full text-xs",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
																className: "bg-muted/60 text-muted-foreground border-b sticky top-0 bg-muted",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
																		className: "px-2 py-2 text-left w-24",
																		children: "Cheque No."
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
																		className: "px-2 py-2 text-left w-24",
																		children: "Bank"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
																		className: "px-2 py-2 text-left w-32",
																		children: "Maturity"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
																		className: "px-2 py-2 text-right w-24",
																		children: "Amount"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
																		className: "px-2 py-2 text-left",
																		colSpan: 2,
																		children: "Tenure (Start & End)"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
																		className: "px-2 py-2 text-left w-36",
																		children: "Document"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-2 py-2 w-8" })
																] })
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
																className: "divide-y",
																children: displayedRows.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
																	className: "hover:bg-muted/20",
																	children: [
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																			className: "px-1.5 py-1.5",
																			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																				value: c.chequeNo,
																				onChange: (e) => {
																					const rows = collectForm.customCheques && collectForm.customCheques.length > 0 ? [...collectForm.customCheques] : [...displayedRows];
																					rows[i] = {
																						...rows[i],
																						chequeNo: e.target.value
																					};
																					setCollectForm((f) => ({
																						...f,
																						customCheques: rows
																					}));
																				},
																				className: "h-8 text-xs font-mono",
																				placeholder: `PDC-${i + 1}`
																			})
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																			className: "px-1.5 py-1.5",
																			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																				value: c.bank,
																				onChange: (e) => {
																					const rows = collectForm.customCheques && collectForm.customCheques.length > 0 ? [...collectForm.customCheques] : [...displayedRows];
																					rows[i] = {
																						...rows[i],
																						bank: e.target.value
																					};
																					setCollectForm((f) => ({
																						...f,
																						customCheques: rows
																					}));
																				},
																				className: "h-8 text-xs",
																				placeholder: "Bank"
																			})
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																			className: "px-1.5 py-1.5",
																			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																				type: "date",
																				value: c.date,
																				onChange: (e) => {
																					const rows = collectForm.customCheques && collectForm.customCheques.length > 0 ? [...collectForm.customCheques] : [...displayedRows];
																					rows[i] = {
																						...rows[i],
																						date: e.target.value
																					};
																					setCollectForm((f) => ({
																						...f,
																						customCheques: rows
																					}));
																				},
																				className: "h-8 text-xs font-mono"
																			})
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																			className: "px-1.5 py-1.5 text-right",
																			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																				type: "number",
																				value: c.amount || "",
																				onChange: (e) => {
																					const rows = collectForm.customCheques && collectForm.customCheques.length > 0 ? [...collectForm.customCheques] : [...displayedRows];
																					rows[i] = {
																						...rows[i],
																						amount: Number(e.target.value)
																					};
																					setCollectForm((f) => ({
																						...f,
																						customCheques: rows
																					}));
																				},
																				className: "h-8 text-xs text-right font-mono",
																				placeholder: "Amount"
																			})
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																			className: "px-1.5 py-1.5 w-32",
																			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																				type: "date",
																				value: c.tenureStart || "",
																				onChange: (e) => {
																					const rows = collectForm.customCheques && collectForm.customCheques.length > 0 ? [...collectForm.customCheques] : [...displayedRows];
																					rows[i] = {
																						...rows[i],
																						tenureStart: e.target.value
																					};
																					setCollectForm((f) => ({
																						...f,
																						customCheques: rows
																					}));
																				},
																				className: "h-8 text-xs font-mono",
																				placeholder: "Start date"
																			})
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																			className: "px-1.5 py-1.5 w-32",
																			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																				type: "date",
																				value: c.tenureEnd || "",
																				onChange: (e) => {
																					const rows = collectForm.customCheques && collectForm.customCheques.length > 0 ? [...collectForm.customCheques] : [...displayedRows];
																					rows[i] = {
																						...rows[i],
																						tenureEnd: e.target.value
																					};
																					setCollectForm((f) => ({
																						...f,
																						customCheques: rows
																					}));
																				},
																				className: "h-8 text-xs font-mono",
																				placeholder: "End date"
																			})
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																			className: "px-1.5 py-1.5",
																			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																				type: "file",
																				onChange: (e) => {
																					const file = e.target.files?.[0]?.name || "";
																					const rows = collectForm.customCheques && collectForm.customCheques.length > 0 ? [...collectForm.customCheques] : [...displayedRows];
																					rows[i] = {
																						...rows[i],
																						file
																					};
																					setCollectForm((f) => ({
																						...f,
																						customCheques: rows
																					}));
																				},
																				className: "h-8 text-[11px]"
																			})
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																			className: "px-1 py-1.5 text-center",
																			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																				size: "icon",
																				variant: "ghost",
																				className: "h-6 w-6 text-destructive hover:bg-destructive/10",
																				onClick: () => {
																					const rows = collectForm.customCheques && collectForm.customCheques.length > 0 ? [...collectForm.customCheques] : [...displayedRows];
																					setCollectForm((f) => ({
																						...f,
																						pdcCount: Math.max(1, rows.length - 1),
																						customCheques: rows.filter((_, idx) => idx !== i)
																					}));
																				},
																				children: "×"
																			})
																		})
																	]
																}, i))
															})]
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[11px] text-muted-foreground italic",
														children: "Leave rows blank to skip them. Only fully completed rows will be saved."
													})
												]
											})
										]
									});
								})(),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border bg-muted/20 p-4 space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "outline",
													className: "text-[10px] font-mono bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
													children: "GL 21500"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs font-bold uppercase tracking-wider text-foreground",
													children: "Type 1: Security Deposit for Unit"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[11px] text-muted-foreground",
												children: "Standard tenancy premise deposit"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Deposit Payment Mode",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: collectForm.depositMode,
													onValueChange: (v) => setCollectForm((f) => ({
														...f,
														depositMode: v
													})),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Cash",
															children: "Cash In Hand (12100)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Bank Transfer",
															children: "Bank Operating (12000)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "PDC",
															children: "PDC / Cheque (12900)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Guarantee Cheque",
															children: "Bank Guarantee Cheque (12900)"
														})
													] })]
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Unit Deposit Amount (QAR)",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: collectForm.depositAmount,
													onChange: (e) => setCollectForm((f) => ({
														...f,
														depositAmount: e.target.value
													})),
													placeholder: `${signatureWorkflowLease?.securityDeposit || 5600}`
												})
											})]
										}),
										(collectForm.depositMode === "PDC" || collectForm.depositMode === "Guarantee Cheque") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Deposit Cheque No.",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: collectForm.depositChequeNo,
													onChange: (e) => setCollectForm((f) => ({
														...f,
														depositChequeNo: e.target.value
													})),
													placeholder: "e.g. CHQ-SEC-01"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Deposit Cheque Bank",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: collectForm.depositChequeBank,
													onChange: (e) => setCollectForm((f) => ({
														...f,
														depositChequeBank: e.target.value
													})),
													placeholder: "e.g. QNB, CBQ, Doha Bank"
												})
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10 p-4 space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-[10px] font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
												children: "GL 21100 (Default Refundable)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200",
												children: "Type 2: Ancillary Refundable Deposits & Guarantees"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] text-emerald-700 dark:text-emerald-400",
											children: "By-default refundable liabilities"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-1 md:grid-cols-3 gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Kahramaa Deposit (21100003)",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: collectForm.utilityDeposit,
													onChange: (e) => setCollectForm((f) => ({
														...f,
														utilityDeposit: e.target.value
													})),
													placeholder: "0"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Qatar Cool Deposit (21100004)",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: collectForm.qatarCoolDeposit,
													onChange: (e) => setCollectForm((f) => ({
														...f,
														qatarCoolDeposit: e.target.value
													})),
													placeholder: "0"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Reservation Advance (21100001)",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: collectForm.reservationDeposit,
													onChange: (e) => setCollectForm((f) => ({
														...f,
														reservationDeposit: e.target.value
													})),
													placeholder: "0"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Service Fee Deposit (21100005)",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: collectForm.serviceFeeDeposit,
													onChange: (e) => setCollectForm((f) => ({
														...f,
														serviceFeeDeposit: e.target.value
													})),
													placeholder: "0"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Guarantee Cheque Amount (21100006)",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: collectForm.guaranteeChequeDeposit,
													onChange: (e) => setCollectForm((f) => ({
														...f,
														guaranteeChequeDeposit: e.target.value
													})),
													placeholder: "0"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Guarantee Cheque No. / Bank",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: collectForm.guaranteeChequeNo,
													onChange: (e) => setCollectForm((f) => ({
														...f,
														guaranteeChequeNo: e.target.value
													})),
													placeholder: "e.g. GNT-9988 (CBQ)"
												})
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border bg-muted/20 p-3 space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
										children: "One-Time Non-Refundable Fees (Revenue 41201)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Agency Commission (QR)",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												value: collectForm.agencyCommission,
												onChange: (e) => setCollectForm((f) => ({
													...f,
													agencyCommission: e.target.value
												})),
												placeholder: "0"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Admin Charges (QR)",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												value: collectForm.adminCharges,
												onChange: (e) => setCollectForm((f) => ({
													...f,
													adminCharges: e.target.value
												})),
												placeholder: "0"
											})
										})]
									})]
								}),
								signatureWorkflowLease && (() => {
									const pdcAmt = (collectForm.customCheques || []).filter((c) => Number(c.amount) > 0).reduce((s, c) => s + Number(c.amount), 0) || signatureWorkflowLease.monthlyRent * (collectForm.pdcCount || 12);
									const depAmt = Number(collectForm.depositAmount) || signatureWorkflowLease.securityDeposit;
									const depDrLabel = collectForm.depositMode === "Cash" ? "Cash In Hand" : collectForm.depositMode === "Bank Transfer" ? "Bank Operating Account" : "PDC In Hand";
									const depDrCode = collectForm.depositMode === "Cash" ? "12100" : collectForm.depositMode === "Bank Transfer" ? "12000" : "12900";
									const utilityAmt = Number(collectForm.utilityDeposit) || 0;
									const qatarCoolAmt = Number(collectForm.qatarCoolDeposit) || 0;
									const reservationAmt = Number(collectForm.reservationDeposit) || 0;
									const serviceFeeAmt = Number(collectForm.serviceFeeDeposit) || 0;
									const guaranteeChequeAmt = Number(collectForm.guaranteeChequeDeposit) || 0;
									const agencyAmt = Number(collectForm.agencyCommission) || 0;
									const adminAmt = Number(collectForm.adminCharges) || 0;
									const impacts = [];
									if (pdcAmt > 0) impacts.push({
										label: "Rent PDCs In Hand",
										category: "Rent",
										dr: "PDC In Hand",
										drCode: "12900",
										cr: "Customer PDC Liability",
										crCode: "21400",
										amount: pdcAmt
									});
									if (depAmt > 0) impacts.push({
										label: `Type 1: Unit Security Deposit (${collectForm.depositMode})`,
										category: "Deposit (21500)",
										dr: depDrLabel,
										drCode: depDrCode,
										cr: "Security Deposit Liability",
										crCode: "21500",
										amount: depAmt
									});
									if (utilityAmt > 0) impacts.push({
										label: "Type 2: Kahramaa Utility Deposit",
										category: "Deposit (21100)",
										dr: "Cash In Hand",
										drCode: "12100",
										cr: "Kahramaa Deposit - Tenant",
										crCode: "21100003",
										amount: utilityAmt
									});
									if (qatarCoolAmt > 0) impacts.push({
										label: "Type 2: Qatar Cool Deposit",
										category: "Deposit (21100)",
										dr: "Cash In Hand",
										drCode: "12100",
										cr: "Qatar Cool Deposit - Tenant",
										crCode: "21100004",
										amount: qatarCoolAmt
									});
									if (reservationAmt > 0) impacts.push({
										label: "Type 2: Reservation Advance",
										category: "Deposit (21100)",
										dr: "Cash In Hand",
										drCode: "12100",
										cr: "Reservation Advance - Tenant",
										crCode: "21100001",
										amount: reservationAmt
									});
									if (serviceFeeAmt > 0) impacts.push({
										label: "Type 2: Service Fee Deposit",
										category: "Deposit (21100)",
										dr: "Cash In Hand",
										drCode: "12100",
										cr: "Service Fee Deposit - Tenant",
										crCode: "21100005",
										amount: serviceFeeAmt
									});
									if (guaranteeChequeAmt > 0) impacts.push({
										label: "Type 2: Guarantee Cheque Security",
										category: "Deposit (21100)",
										dr: "PDC In Hand",
										drCode: "12900",
										cr: "Guarantee Cheque Liability",
										crCode: "21100006",
										amount: guaranteeChequeAmt
									});
									if (agencyAmt > 0) impacts.push({
										label: "Agency Commission",
										category: "Revenue",
										dr: "Cash In Hand",
										drCode: "12100",
										cr: "Agency Commission Income",
										crCode: "41201",
										amount: agencyAmt
									});
									if (adminAmt > 0) impacts.push({
										label: "Admin Charges",
										category: "Revenue",
										dr: "Cash In Hand",
										drCode: "12100",
										cr: "Admin Charges Income",
										crCode: "41201",
										amount: adminAmt
									});
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300",
												children: "Finance Ledgers & Accounts Updated on Collection"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "border rounded bg-background overflow-hidden",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
												className: "w-full text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
													className: "bg-muted/50 border-b",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "px-3 py-1.5 text-left font-medium text-muted-foreground",
															children: "Transaction"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "px-3 py-1.5 text-left font-medium text-emerald-700 dark:text-emerald-400",
															children: "Debit (DR) Account"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "px-3 py-1.5 text-left font-medium text-red-600 dark:text-red-400",
															children: "Credit (CR) Account"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "px-3 py-1.5 text-right font-medium text-muted-foreground",
															children: "Amount (QR)"
														})
													] })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
													className: "divide-y",
													children: [impacts.map((imp, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
														className: "hover:bg-muted/10",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																className: "px-3 py-1.5 font-medium",
																children: imp.label
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																className: "px-3 py-1.5",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "inline-flex items-center gap-1",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-1 rounded",
																		children: imp.drCode
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-emerald-700 dark:text-emerald-300",
																		children: imp.dr
																	})]
																})
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																className: "px-3 py-1.5",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "inline-flex items-center gap-1",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "font-mono text-[10px] bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 px-1 rounded",
																		children: imp.crCode
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-red-600 dark:text-red-300",
																		children: imp.cr
																	})]
																})
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																className: "px-3 py-1.5 text-right font-mono font-bold",
																children: ["QR ", imp.amount.toLocaleString()]
															})
														]
													}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
														className: "bg-muted/20 font-semibold",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-3 py-1.5",
															colSpan: 3,
															children: "Total Impact"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
															className: "px-3 py-1.5 text-right font-mono text-primary",
															children: ["QR ", impacts.reduce((s, i) => s + i.amount, 0).toLocaleString()]
														})]
													})]
												})]
											})
										})]
									});
								})(),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
									label: "Upload Collection Proof / Receipt (Optional)",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "file",
										onChange: (e) => setCollectForm((f) => ({
											...f,
											receiptFile: e.target.files?.[0]?.name || ""
										}))
									}), collectForm.receiptFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground mt-1",
										children: ["Selected: ", collectForm.receiptFile]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Notes",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										value: collectForm.notes,
										onChange: (e) => setCollectForm((f) => ({
											...f,
											notes: e.target.value
										})),
										placeholder: "Optional notes on PDC collection and schedule..."
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setCollectOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: submitCollect,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "mr-2 h-4 w-4" }), " Confirm Collection"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: submitLandlordOpen,
				onOpenChange: setSubmitLandlordOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[480px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Submit Package to Landlord"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: "Send lease contract bundle and collected PDCs for owner counter-signature."
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Submitted To (Landlord / Owner Representative)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: submitLandlordForm.submittedTo,
										onChange: (e) => setSubmitLandlordForm((f) => ({
											...f,
											submittedTo: e.target.value
										})),
										placeholder: "e.g. Sheikh Hassan Al-Thani"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Submission Date",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											value: submitLandlordForm.submittedAt,
											onChange: (e) => setSubmitLandlordForm((f) => ({
												...f,
												submittedAt: e.target.value
											}))
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Delivery Channel",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: submitLandlordForm.docsSent,
											onValueChange: (v) => setSubmitLandlordForm((f) => ({
												...f,
												docsSent: v
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Email",
													children: "📧 Email Dispatch"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Physical",
													children: "📁 Physical Courier / Hand Delivery"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "WhatsApp",
													children: "💬 WhatsApp Verified"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Courier",
													children: "🚚 Registered Courier"
												})
											] })]
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mx-auto h-7 w-7 text-primary/60 mb-2" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Upload Submission Proof (Optional)",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "file",
												className: "cursor-pointer bg-background",
												onChange: (e) => setSubmitLandlordForm((f) => ({
													...f,
													proofFile: e.target.files?.[0]?.name || ""
												}))
											})
										}),
										submitLandlordForm.proofFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-primary font-medium mt-1",
											children: ["Selected: ", submitLandlordForm.proofFile]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Submission Notes",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										value: submitLandlordForm.notes,
										onChange: (e) => setSubmitLandlordForm((f) => ({
											...f,
											notes: e.target.value
										})),
										placeholder: "Optional delivery tracking or submission notes...",
										className: "text-xs"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setSubmitLandlordOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: submitToLandlord,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "mr-2 h-4 w-4" }), " Confirm Submission"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: uploadAgreementOpen,
				onOpenChange: setUploadAgreementOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[480px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Upload Signed Agreement"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: "Upload executed lease agreement document to finalize and mark fully signed."
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mx-auto h-7 w-7 text-primary/60 mb-2" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Upload Agreement PDF / Document *",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "file",
												className: "cursor-pointer bg-background",
												onChange: (e) => setUploadAgreementForm((f) => ({
													...f,
													file: e.target.files?.[0]?.name || ""
												}))
											})
										}),
										uploadAgreementForm.file && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-primary font-medium mt-1",
											children: ["Selected: ", uploadAgreementForm.file]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Saved Document Name (Optional)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: uploadAgreementForm.fileName,
										onChange: (e) => setUploadAgreementForm((f) => ({
											...f,
											fileName: e.target.value
										})),
										placeholder: "e.g. Fully_Signed_Lease_Agreement_2026.pdf"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Remarks & Audit Log",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										value: uploadAgreementForm.remarks,
										onChange: (e) => setUploadAgreementForm((f) => ({
											...f,
											remarks: e.target.value
										})),
										placeholder: "Optional notes regarding final signed copy...",
										className: "text-xs"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setUploadAgreementOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: submitUploadAgreement,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-2 h-4 w-4" }), " Confirm Upload"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: landlordSignOpen,
				onOpenChange: setLandlordSignOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[480px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Landlord / Owner Signature"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: [
									"Record landlord signature for ",
									signatureWorkflowLease?.tenantName,
									" — ",
									signatureWorkflowLease?.unit,
									"."
								]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Date of Signing",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											value: landlordSignForm.signedAt,
											onChange: (e) => setLandlordSignForm((f) => ({
												...f,
												signedAt: e.target.value
											}))
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Signed By",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: landlordSignForm.signedBy,
											onChange: (e) => setLandlordSignForm((f) => ({
												...f,
												signedBy: e.target.value
											})),
											placeholder: "Sheikh Hassan Al-Thani"
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mx-auto h-7 w-7 text-primary/60 mb-2" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Upload Counter-Signed Document",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "file",
												className: "cursor-pointer bg-background",
												onChange: (e) => setLandlordSignForm((f) => ({
													...f,
													signedDocument: e.target.files?.[0]?.name || ""
												}))
											})
										}),
										landlordSignForm.signedDocument && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-primary font-medium mt-1",
											children: ["Selected: ", landlordSignForm.signedDocument]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 rounded-xl border bg-muted/20 p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										id: "shared",
										checked: landlordSignForm.sharedWithTenant,
										onChange: (e) => setLandlordSignForm((f) => ({
											...f,
											sharedWithTenant: e.target.checked
										})),
										className: "h-4 w-4 rounded accent-primary"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "shared",
										className: "text-xs font-semibold cursor-pointer",
										children: "Automatically share executed copy with tenant"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Remarks",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										value: landlordSignForm.remarks,
										onChange: (e) => setLandlordSignForm((f) => ({
											...f,
											remarks: e.target.value
										})),
										placeholder: "Optional remarks...",
										className: "text-xs"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setLandlordSignOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: submitLandlordSign,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "mr-2 h-4 w-4" }), " Confirm Landlord Sign"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: keyNotifyOpen,
				onOpenChange: setKeyNotifyOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[520px] w-[95vw] max-h-[88vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Key Issue & Handover Notification"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: [
									"Dispatch official handover schedule notice for ",
									keysWorkflowLease?.tenantName,
									" — ",
									keysWorkflowLease?.unit,
									"."
								]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 overflow-y-auto space-y-4 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Planned Handover Date",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											value: keyNotifyForm.handoverAt,
											onChange: (e) => setKeyNotifyForm((f) => ({
												...f,
												handoverAt: e.target.value
											})),
											className: "bg-background"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Planned Handover Time",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "time",
											value: keyNotifyForm.handoverTime,
											onChange: (e) => setKeyNotifyForm((f) => ({
												...f,
												handoverTime: e.target.value
											})),
											className: "bg-background"
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Stakeholder Recipients",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "outline",
											className: "w-full justify-start text-left font-normal h-auto min-h-10 py-2 whitespace-normal break-words bg-background",
											children: keyNotifyForm.recipients.length > 0 ? keyNotifyForm.recipients.join(", ") : "Select recipients..."
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
										className: "w-[300px]",
										children: [
											"Tenant",
											"Property Manager",
											"Concerned Property Staff",
											"Security",
											"Maintenance",
											"Facility Management"
										].map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuCheckboxItem, {
											checked: keyNotifyForm.recipients.includes(role),
											onCheckedChange: (checked) => {
												setKeyNotifyForm((f) => ({
													...f,
													recipients: checked ? [...f.recipients, role] : f.recipients.filter((r) => r !== role)
												}));
											},
											children: role
										}, role))
									})] })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border bg-muted/20 p-4 space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "h-3.5 w-3.5 text-primary" }), " Key Handover Particulars"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Authorized Collector",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: keyNotifyForm.authorizedCollector,
													onChange: (e) => setKeyNotifyForm((f) => ({
														...f,
														authorizedCollector: e.target.value
													})),
													placeholder: "Tenant or representative",
													className: "bg-background"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Keys & Access Summary",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: keyNotifyForm.keysSummary,
													onChange: (e) => setKeyNotifyForm((f) => ({
														...f,
														keysSummary: e.target.value
													})),
													placeholder: "2 keys, 2 cards, 1 remote",
													className: "bg-background"
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Outstanding Clearances",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: keyNotifyForm.outstandingRequirements,
													onChange: (e) => setKeyNotifyForm((f) => ({
														...f,
														outstandingRequirements: e.target.value
													})),
													placeholder: "None",
													className: "bg-background"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Manager / Staff Contact",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: keyNotifyForm.staffContact,
													onChange: (e) => setKeyNotifyForm((f) => ({
														...f,
														staffContact: e.target.value
													})),
													placeholder: "Name & Mobile #",
													className: "bg-background"
												})
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Special Access Instructions",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										value: keyNotifyForm.note,
										onChange: (e) => setKeyNotifyForm((f) => ({
											...f,
											note: e.target.value
										})),
										placeholder: "Any gate pass, security clearance or parking instructions...",
										className: "text-xs"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setKeyNotifyOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: () => keysWorkflowLease && issueDetailedKeyNotice(keysWorkflowLease),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "mr-2 h-4 w-4" }), " Send Notification"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: handoverOpen,
				onOpenChange: setHandoverOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "text-base font-bold",
									children: "Key Handover & Check-In Workflow"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
									className: "text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: keysWorkflowLease?.tenantName
										}),
										" · ",
										keysWorkflowLease?.unit,
										" · ",
										keysWorkflowLease?.property
									]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20",
								children: "Check-In Ready"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-6 pt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-1 rounded-xl bg-muted/60 p-1 text-xs font-medium border",
								children: handoverTabOrder.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: `flex-1 rounded-lg px-2.5 py-1.5 transition-all ${handoverActiveTab === tab ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`,
									onClick: () => setHandoverActiveTab(tab),
									type: "button",
									children: [
										tab === "details" && "🔑 Details",
										tab === "condition" && "🏠 Condition",
										tab === "assets" && "📦 Assets",
										tab === "checklist" && "✅ Checklist",
										tab === "acknowledgement" && "📝 Sign-off"
									]
								}, tab))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 overflow-y-auto space-y-4 flex-1",
							children: [
								handoverActiveTab === "details" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-muted/30 p-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
												children: "Handover Date & Time"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Date",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "date",
														value: handoverForm.handoverAt,
														onChange: (e) => setHandoverForm((f) => ({
															...f,
															handoverAt: e.target.value
														}))
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Time",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "time",
														value: handoverForm.handoverTime,
														onChange: (e) => setHandoverForm((f) => ({
															...f,
															handoverTime: e.target.value
														}))
													})
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-muted/30 p-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
													children: "Keys & Access Items"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-3 gap-3",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
															label: "Keys Issued",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "number",
																min: "0",
																value: handoverForm.keys,
																onChange: (e) => setHandoverForm((f) => ({
																	...f,
																	keys: e.target.value
																}))
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
															label: "Access Cards",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "number",
																min: "0",
																value: handoverForm.accessCards,
																onChange: (e) => setHandoverForm((f) => ({
																	...f,
																	accessCards: e.target.value
																}))
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
															label: "Parking Remotes",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "number",
																min: "0",
																value: handoverForm.parkingRemotes,
																onChange: (e) => setHandoverForm((f) => ({
																	...f,
																	parkingRemotes: e.target.value
																}))
															})
														})
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-3 grid grid-cols-2 gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "Key Type / Description",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															value: handoverForm.keyType,
															onChange: (e) => setHandoverForm((f) => ({
																...f,
																keyType: e.target.value
															})),
															placeholder: "Metal door keys / smart key / FOB"
														})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "Parking Device Details",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															value: handoverForm.parkingDeviceDetails,
															onChange: (e) => setHandoverForm((f) => ({
																...f,
																parkingDeviceDetails: e.target.value
															})),
															placeholder: "Remote serial, bay #, gate tag"
														})
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-muted/30 p-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
												children: "Meter Readings at Handover"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "⚡ Electricity Meter",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: handoverForm.electricityMeterReading,
														onChange: (e) => setHandoverForm((f) => ({
															...f,
															electricityMeterReading: e.target.value
														})),
														placeholder: "e.g. 182167 kWh"
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "💧 Water Meter",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: handoverForm.waterMeterReading,
														onChange: (e) => setHandoverForm((f) => ({
															...f,
															waterMeterReading: e.target.value
														})),
														placeholder: "e.g. 149089 m³"
													})
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-muted/30 p-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
												children: "Issued By"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Issuing Officer",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: handoverForm.issuedBy,
													onValueChange: (v) => setHandoverForm((f) => ({
														...f,
														issuedBy: v
													})),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Property Manager",
															children: "Property Manager"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Security",
															children: "Security"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Admin",
															children: "Admin"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Leasing Agent",
															children: "Leasing Agent"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Facility Manager",
															children: "Facility Manager"
														})
													] })]
												})
											})]
										})
									]
								}),
								handoverActiveTab === "condition" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-muted/30 p-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
												children: "Unit Condition at Handover"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Overall Condition",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: handoverForm.unitCondition,
														onValueChange: (v) => setHandoverForm((f) => ({
															...f,
															unitCondition: v
														})),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Excellent",
																children: "Excellent"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Good",
																children: "Good"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Fair",
																children: "Fair"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Needs Attention",
																children: "Needs Attention"
															})
														] })]
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Cleanliness",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: handoverForm.cleanliness,
														onValueChange: (v) => setHandoverForm((f) => ({
															...f,
															cleanliness: v
														})),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Spotless",
																children: "Spotless"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Clean",
																children: "Clean"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Acceptable",
																children: "Acceptable"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Needs Cleaning",
																children: "Needs Cleaning"
															})
														] })]
													})
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-muted/30 p-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
												children: "System & Fixture Checks"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "grid grid-cols-2 gap-3",
												children: [
													{
														key: "acWorking",
														label: "🌀 Air Conditioning"
													},
													{
														key: "plumbingOk",
														label: "🚿 Plumbing / Water"
													},
													{
														key: "electricalOk",
														label: "💡 Electrical"
													},
													{
														key: "doorsWindowsOk",
														label: "🚪 Doors &amp; Windows"
													}
												].map(({ key, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "flex cursor-pointer items-center gap-2 rounded-md border bg-background p-3 hover:bg-muted/50",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
															type: "checkbox",
															checked: handoverForm[key],
															onChange: (e) => setHandoverForm((f) => ({
																...f,
																[key]: e.target.checked
															})),
															className: "h-4 w-4 rounded accent-primary"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-sm font-medium",
															dangerouslySetInnerHTML: { __html: label }
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: `ml-auto text-xs font-semibold ${handoverForm[key] ? "text-green-600" : "text-red-500"}`,
															children: handoverForm[key] ? "OK" : "Issue"
														})
													]
												}, key))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Photos Taken",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												min: "0",
												value: handoverForm.photosTaken,
												onChange: (e) => setHandoverForm((f) => ({
													...f,
													photosTaken: e.target.value
												})),
												placeholder: "Number of photos documented"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Notes / Observations",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												rows: 3,
												value: handoverForm.note,
												onChange: (e) => setHandoverForm((f) => ({
													...f,
													note: e.target.value
												})),
												placeholder: "Any observations, pending items, special remarks..."
											})
										})
									]
								}),
								handoverActiveTab === "assets" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border bg-muted/30 p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
											children: "Assets List"
										}), assetLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground",
											children: "Loading assets…"
										}) : handoverAssets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground",
											children: "No assets assigned to this unit yet."
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "space-y-3",
											children: handoverAssets.map((asset) => {
												const change = assetChanges[asset.id] || {
													condition: asset.asset_condition || "Good",
													imageFileName: ""
												};
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "rounded-lg border bg-background p-3",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "grid gap-3 sm:grid-cols-[1fr_120px]",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "text-sm font-semibold",
																children: asset.asset_name
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "text-xs text-muted-foreground",
																children: asset.asset_code || asset.category || "Asset"
															})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
																label: "Condition",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
																	value: change.condition,
																	onValueChange: (v) => updateAssetChange(asset.id, { condition: v }),
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																			value: "Excellent",
																			children: "Excellent"
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																			value: "Good",
																			children: "Good"
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																			value: "Fair",
																			children: "Fair"
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																			value: "Needs Attention",
																			children: "Needs Attention"
																		})
																	] })]
																})
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "grid grid-cols-1 gap-3 sm:grid-cols-2 mt-3",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
																label: "Upload Asset Image",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																	type: "file",
																	onChange: (e) => updateAssetChange(asset.id, { imageFileName: e.target.files?.[0]?.name || "" })
																}), change.imageFileName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																	className: "text-xs text-muted-foreground mt-1",
																	children: ["Selected: ", change.imageFileName]
																})]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
																label: "Current Remarks",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
																	rows: 2,
																	value: asset.remarks || "",
																	readOnly: true
																})
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "flex justify-end mt-3",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																size: "sm",
																variant: "outline",
																onClick: () => saveAssetUpdate(asset.id),
																children: "Save Asset"
															})
														})
													]
												}, asset.id);
											})
										})]
									}), handoverAssets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										onClick: saveAllAssetUpdates,
										children: "Save All Asset Updates"
									})]
								}),
								handoverActiveTab === "checklist" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "rounded-lg border bg-amber-50 p-3 text-sm text-amber-800",
											children: "⚠️ All items below must be verified before confirming handover."
										}),
										[
											{
												label: "Lease is fully signed by tenant and landlord",
												check: true
											},
											{
												label: "Security deposit / collection is fully completed",
												check: true
											},
											{
												label: "Key Issue Notice has been sent to tenant",
												check: !!(keysWorkflowLease && handoverForm.collectorName)
											},
											{
												label: "Meter readings recorded (electricity &amp; water)",
												check: !!(handoverForm.electricityMeterReading && handoverForm.waterMeterReading)
											},
											{
												label: "Keys, access cards and parking remotes counted &amp; ready",
												check: Number(handoverForm.keys) > 0
											},
											{
												label: "Unit condition verified and documented",
												check: !!handoverForm.unitCondition
											},
											{
												label: "Collector ID verified",
												check: handoverForm.idVerified
											},
											{
												label: "Photos taken and on file",
												check: Number(handoverForm.photosTaken) > 0
											},
											{
												label: "Tenant acknowledgement text / signature captured",
												check: !!handoverForm.tenantAcknowledgement
											}
										].map(({ label, check }, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: `flex items-start gap-3 rounded-lg border p-3 ${check ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `mt-0.5 text-base ${check ? "text-green-600" : "text-orange-500"}`,
												children: check ? "✅" : "⏳"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm",
												dangerouslySetInnerHTML: { __html: label }
											})]
										}, i)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-muted/30 p-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
													children: "Collector Identity Verification"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-2 gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "Collector Name",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															value: handoverForm.collectorName,
															onChange: (e) => setHandoverForm((f) => ({
																...f,
																collectorName: e.target.value
															})),
															placeholder: "Tenant or authorised representative"
														})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "Collector ID / Passport No.",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															value: handoverForm.collectorIdNumber,
															onChange: (e) => setHandoverForm((f) => ({
																...f,
																collectorIdNumber: e.target.value
															})),
															placeholder: "Qatar ID / Passport"
														})
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "mt-3 flex cursor-pointer items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "checkbox",
														checked: handoverForm.idVerified,
														onChange: (e) => setHandoverForm((f) => ({
															...f,
															idVerified: e.target.checked
														})),
														className: "h-4 w-4 rounded accent-primary"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-sm font-medium",
														children: "ID document sighted and verified ✓"
													})]
												})
											]
										})
									]
								}),
								handoverActiveTab === "acknowledgement" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-blue-50 p-4 text-sm text-blue-800",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-semibold",
												children: "📜 Digital Acknowledgement"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1",
												children: "The collector confirms receipt of all keys and access items in the condition stated. This record serves as the official handover certificate."
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-muted/30 p-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
												children: "Handover Summary"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Unit"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: keysWorkflowLease?.unit
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Date / Time"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-medium",
														children: [
															handoverForm.handoverAt,
															" ",
															handoverForm.handoverTime
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Keys"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-medium",
														children: [
															handoverForm.keys,
															"× ",
															handoverForm.keyType
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Access Cards"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: handoverForm.accessCards
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Parking Remotes"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: handoverForm.parkingRemotes
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Electricity Meter"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: handoverForm.electricityMeterReading || "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Water Meter"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: handoverForm.waterMeterReading || "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Unit Condition"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: handoverForm.unitCondition
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Collector"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: handoverForm.collectorName || keysWorkflowLease?.tenantName
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "ID Verified"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `font-medium ${handoverForm.idVerified ? "text-green-600" : "text-red-500"}`,
														children: handoverForm.idVerified ? "Yes ✓" : "No ✗"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Issued By"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: handoverForm.issuedBy
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Photos"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: handoverForm.photosTaken
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Tenant Acknowledgement Statement",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												rows: 3,
												value: handoverForm.tenantAcknowledgement,
												onChange: (e) => setHandoverForm((f) => ({
													...f,
													tenantAcknowledgement: e.target.value
												})),
												placeholder: "I, [Tenant Name], acknowledge receipt of the above keys and access items..."
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center text-sm text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-medium text-foreground",
													children: "📸 Signature / Photo Upload"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1",
													children: "Physical signature sheet should be scanned and uploaded to the document store after handover."
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "outline",
													size: "sm",
													className: "mt-2",
													children: "Upload Signed Form"
												})
											]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "gap-2 pt-2 border-t",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => setHandoverOpen(false),
									children: "Cancel"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => setHandoverActiveTab(getNextHandoverTab(handoverActiveTab)),
									disabled: handoverActiveTab === handoverTabOrder[handoverTabOrder.length - 1],
									children: "Next →"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => keysWorkflowLease && completeHandoverAndCheckIn(keysWorkflowLease),
									disabled: !handoverForm.electricityMeterReading || !handoverForm.waterMeterReading || !handoverForm.collectorName,
									className: "gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "h-4 w-4" }), " Confirm Handover & Check-In"]
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: handoverViewOpen,
				onOpenChange: setHandoverViewOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[540px] max-h-[88vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-6 py-4 border-b flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "text-base font-bold",
									children: "Key Handover Certificate"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									className: "text-xs text-muted-foreground",
									children: "Official executed key release and check-in audit certificate."
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20",
								children: "Verified & Handed Over"
							})]
						}),
						selectedHandover && (() => {
							const lease = leases.find((l) => l.id === selectedHandover.leaseId);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-6 overflow-y-auto space-y-4 flex-1 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-3.5 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs font-medium",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 shrink-0 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Keys and access items released to authorized tenant representative." })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded-xl border bg-muted/20 p-4 space-y-2 text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-x-4 gap-y-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-semibold",
													children: "Tenant"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: lease?.tenantName
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-semibold",
													children: "Unit & Property"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-semibold text-foreground",
													children: [
														lease?.unit,
														" (",
														lease?.property,
														")"
													]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-semibold",
													children: "Handover Date"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: selectedHandover.handoverAt
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-semibold",
													children: "Keys Count"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-semibold text-foreground",
													children: [
														selectedHandover.keys,
														"× ",
														selectedHandover.keyType || "keys"
													]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-semibold",
													children: "Access Cards"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-semibold text-foreground",
													children: [selectedHandover.accessCards, " cards"]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-semibold",
													children: "Parking Remotes"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-semibold text-foreground",
													children: [selectedHandover.parkingRemotes, " remote(s)"]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-semibold",
													children: "Electricity Meter"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: selectedHandover.electricityMeterReading || "—"
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-semibold",
													children: "Water Meter"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: selectedHandover.waterMeterReading || "—"
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-semibold",
													children: "Unit Condition"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: selectedHandover.unitCondition || "—"
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-semibold",
													children: "Cleanliness"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: selectedHandover.cleanliness || "—"
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-semibold",
													children: "Collector"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: selectedHandover.collectorName
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-semibold",
													children: "ID Sighted"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `font-semibold ${selectedHandover.idVerified ? "text-emerald-600" : "text-rose-500"}`,
													children: selectedHandover.idVerified ? "Yes (Verified ✓)" : "Pending ✗"
												})] })
											]
										})
									}),
									selectedHandover.tenantAcknowledgement && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border bg-muted/20 p-3.5 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1",
											children: "Tenant Digital Acknowledgement"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "italic text-foreground",
											children: selectedHandover.tenantAcknowledgement
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-4 gap-2 text-xs font-semibold",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: `rounded-lg border p-2 text-center ${selectedHandover.acWorking ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300" : "border-rose-200 bg-rose-50/50 text-rose-700"}`,
												children: ["🌀 A/C ", selectedHandover.acWorking ? "✓" : "✗"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: `rounded-lg border p-2 text-center ${selectedHandover.plumbingOk ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300" : "border-rose-200 bg-rose-50/50 text-rose-700"}`,
												children: ["🚿 Plumb. ", selectedHandover.plumbingOk ? "✓" : "✗"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: `rounded-lg border p-2 text-center ${selectedHandover.electricalOk ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300" : "border-rose-200 bg-rose-50/50 text-rose-700"}`,
												children: ["💡 Elec. ", selectedHandover.electricalOk ? "✓" : "✗"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: `rounded-lg border p-2 text-center ${selectedHandover.doorsWindowsOk ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300" : "border-rose-200 bg-rose-50/50 text-rose-700"}`,
												children: ["🚪 Doors ", selectedHandover.doorsWindowsOk ? "✓" : "✗"]
											})
										]
									})
								]
							});
						})(),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setHandoverViewOpen(false),
								children: "Close"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => {
									window.print();
								},
								className: "gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "h-4 w-4" }), " Print Certificate"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: renewalResponseOpen,
				onOpenChange: setRenewalResponseOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[480px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Tenant Renewal Decision"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: [
									"Record decision for ",
									leases.find((l) => l.id === selectedRenewal?.leaseId)?.tenantName,
									" — ",
									leases.find((l) => l.id === selectedRenewal?.leaseId)?.unit,
									"."
								]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Tenant Formal Response",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: renewalResponseForm.response,
										onValueChange: (v) => setRenewalResponseForm((f) => ({
											...f,
											response: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "confirm",
											children: "✅ Confirmed Renewal (Accepts extension)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "non_renewal",
											children: "❌ Non-Renewal (Will vacate upon expiry)"
										})] })]
									})
								}),
								renewalResponseForm.response === "confirm" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Agreed Monthly Rent (QR)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: renewalResponseForm.confirmedRent,
										onChange: (e) => setRenewalResponseForm((f) => ({
											...f,
											confirmedRent: e.target.value
										})),
										placeholder: `Proposed: QR ${selectedRenewal?.proposedRent}`
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Negotiation & Confirmation Notes",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										value: renewalResponseForm.notes,
										onChange: (e) => setRenewalResponseForm((f) => ({
											...f,
											notes: e.target.value
										})),
										placeholder: "Special agreed terms, discount notes, or move-out confirmation...",
										className: "text-xs"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setRenewalResponseOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: () => {
									if (selectedRenewal) renewLease(selectedRenewal);
									setRenewalResponseOpen(false);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 h-4 w-4" }), " Confirm Decision"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: discussRenewalOpen,
				onOpenChange: setDiscussRenewalOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[500px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Renewal Discussion & Follow-Up"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: [
									"Document negotiation points for ",
									leases.find((l) => l.id === selectedDiscussRenewal?.leaseId)?.tenantName,
									" (",
									leases.find((l) => l.id === selectedDiscussRenewal?.leaseId)?.unit,
									")."
								]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border bg-muted/20 p-3.5 text-xs grid grid-cols-3 gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground block text-[10px] uppercase font-semibold",
											children: "Proposed Rent"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
											className: "text-foreground",
											children: ["QR ", selectedDiscussRenewal?.proposedRent?.toLocaleString()]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground block text-[10px] uppercase font-semibold",
											children: "Proposed Period"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-foreground",
											children: selectedDiscussRenewal?.proposedPeriod
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground block text-[10px] uppercase font-semibold",
											children: "Expiry Date"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-foreground",
											children: selectedDiscussRenewal?.expiryDate
										})] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Tenant Sentiment",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: discussRenewalForm.tenantResponse,
										onValueChange: (v) => setDiscussRenewalForm((f) => ({
											...f,
											tenantResponse: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "positive",
												children: "🟢 Positive — High likelihood to renew"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "pending",
												children: "🟡 Pending — Reviewing proposed offer"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "negative",
												children: "🔴 Negative — Requesting lower rent or vacating"
											})
										] })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Discussed Rent (QR)",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											value: discussRenewalForm.discussedRent,
											onChange: (e) => setDiscussRenewalForm((f) => ({
												...f,
												discussedRent: e.target.value
											})),
											placeholder: `QR ${selectedDiscussRenewal?.proposedRent}`
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Agreed Period",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: discussRenewalForm.proposedPeriod,
											onChange: (e) => setDiscussRenewalForm((f) => ({
												...f,
												proposedPeriod: e.target.value
											})),
											placeholder: "12 months"
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Next Follow-Up / Decision Deadline",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: discussRenewalForm.nextFollowUpDate,
										onChange: (e) => setDiscussRenewalForm((f) => ({
											...f,
											nextFollowUpDate: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Discussion Notes & Actions",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										value: discussRenewalForm.notes,
										onChange: (e) => setDiscussRenewalForm((f) => ({
											...f,
											notes: e.target.value
										})),
										placeholder: "Key points discussed, maintenance promises, counter-offers...",
										className: "text-xs"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setDiscussRenewalOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: discussRenewal,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "mr-2 h-4 w-4" }), " Save Discussion"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: addVoucherOpen,
				onOpenChange: setAddVoucherOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[580px] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Add Finance Voucher Entry"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: "Post double-entry voucher transaction and optionally register corresponding PDC cheque."
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 overflow-y-auto space-y-4 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Target Lease Contract *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: addVoucherForm.leaseId,
										onValueChange: (v) => {
											const lease = leases.find((l) => l.id === v);
											const accounts = getVoucherAccounts(addVoucherForm.name, lease?.unit || "", addVoucherForm.method);
											setAddVoucherForm((f) => ({
												...f,
												leaseId: v,
												debit: accounts.debit,
												credit: accounts.credit
											}));
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "bg-background",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select lease" })
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
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Voucher Transaction Type *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: addVoucherForm.name,
										onValueChange: (v) => {
											const accounts = getVoucherAccounts(v, leases.find((l) => l.id === addVoucherForm.leaseId)?.unit || "", addVoucherForm.method);
											setAddVoucherForm((f) => ({
												...f,
												name: v,
												debit: accounts.debit,
												credit: accounts.credit
											}));
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "bg-background",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Receipts Voucher - Rent",
												children: "Receipts Voucher — Rent"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Receipts Voucher - Deposit",
												children: "Receipts Voucher — Deposit"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Deposit Voucher - PDC",
												children: "Deposit Voucher — PDC"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Deposit Voucher - Cash",
												children: "Deposit Voucher — Cash"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Cheque Returned Voucher",
												children: "Cheque Returned Voucher"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Revenue Generation (Single or Batch)",
												children: "Revenue Generation (Single or Batch)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Payment Voucher",
												children: "Payment Voucher"
											})
										] })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Receipt / Voucher No.",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: addVoucherForm.receiptNo,
											onChange: (e) => setAddVoucherForm((f) => ({
												...f,
												receiptNo: e.target.value
											})),
											placeholder: "Auto-generated if blank",
											className: "bg-background"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Payment Method",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: addVoucherForm.method,
											onValueChange: (v) => {
												const lease = leases.find((l) => l.id === addVoucherForm.leaseId);
												const accounts = getVoucherAccounts(addVoucherForm.name, lease?.unit || "", v);
												setAddVoucherForm((f) => ({
													...f,
													method: v,
													debit: accounts.debit,
													credit: accounts.credit
												}));
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "PDC",
													children: "PDC Cheque"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Cash",
													children: "Cash"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Bank Transfer",
													children: "Bank Transfer"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Guarantee Cheque",
													children: "Guarantee Cheque"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Batch",
													children: "Batch Post"
												})
											] })]
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border bg-muted/20 p-4 space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5 text-primary" }), " General Ledger Accounts"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Debit (DR) Account",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: addVoucherForm.debit,
													onValueChange: (v) => setAddVoucherForm((f) => ({
														...f,
														debit: v
													})),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "text-xs font-mono bg-background",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Debit Account" })
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "PDC In Hand",
															children: "PDC In Hand (12900)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Cash In Hand",
															children: "Cash In Hand (12100)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Bank Account",
															children: "Bank Account (12000)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
															value: `Customer(PDC)-${leases.find((l) => l.id === addVoucherForm.leaseId)?.unit || "Unit"}`,
															children: [
																"Customer(PDC)-",
																leases.find((l) => l.id === addVoucherForm.leaseId)?.unit || "Unit",
																" (21400)"
															]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
															value: `Receivable-${leases.find((l) => l.id === addVoucherForm.leaseId)?.unit || "Unit"}`,
															children: [
																"Receivable-",
																leases.find((l) => l.id === addVoucherForm.leaseId)?.unit || "Unit",
																" (12413)"
															]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Payable Account",
															children: "Payable Account (20100)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Deposit-PDC In Hand",
															children: "Deposit-PDC In Hand (12900002)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: `Security Deposit Liability-${leases.find((l) => l.id === addVoucherForm.leaseId)?.unit || "Unit"}`,
															children: "Security Deposit Liability (21500)"
														})
													] })]
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Credit (CR) Account",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: addVoucherForm.credit,
													onValueChange: (v) => setAddVoucherForm((f) => ({
														...f,
														credit: v
													})),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "text-xs font-mono bg-background",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Credit Account" })
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "PDC In Hand",
															children: "PDC In Hand (12900)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Cash In Hand",
															children: "Cash In Hand (12100)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Bank Account",
															children: "Bank Account (12000)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
															value: `Customer(PDC)-${leases.find((l) => l.id === addVoucherForm.leaseId)?.unit || "Unit"}`,
															children: [
																"Customer(PDC)-",
																leases.find((l) => l.id === addVoucherForm.leaseId)?.unit || "Unit",
																" (21400)"
															]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
															value: `Receivable-${leases.find((l) => l.id === addVoucherForm.leaseId)?.unit || "Unit"}`,
															children: [
																"Receivable-",
																leases.find((l) => l.id === addVoucherForm.leaseId)?.unit || "Unit",
																" (12413)"
															]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Rental Income",
															children: "Rental Income (41100)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
															value: `Deposit-Customer-${leases.find((l) => l.id === addVoucherForm.leaseId)?.unit || "Unit"}`,
															children: [
																"Deposit-Customer-",
																leases.find((l) => l.id === addVoucherForm.leaseId)?.unit || "Unit",
																" (21500)"
															]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: `Security Deposit Liability-${leases.find((l) => l.id === addVoucherForm.leaseId)?.unit || "Unit"}`,
															children: "Security Deposit Liability (21500)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Payable Account",
															children: "Payable Account (20100)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Guarantee Cheque Received",
															children: "Guarantee Cheque Received (21200)"
														})
													] })]
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Voucher Amount (QR) *",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												value: addVoucherForm.amount,
												onChange: (e) => setAddVoucherForm((f) => ({
													...f,
													amount: e.target.value
												})),
												placeholder: "0.00",
												className: "bg-background font-mono font-bold"
											})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Voucher Remarks / Particulars",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: addVoucherForm.period,
										onChange: (e) => setAddVoucherForm((f) => ({
											...f,
											period: e.target.value
										})),
										placeholder: "Optional voucher narrative or notes...",
										className: "bg-background"
									})
								}),
								(addVoucherForm.method === "PDC" || addVoucherForm.method === "Guarantee Cheque") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-bold text-primary",
											children: "Automated PDC Register Entry"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-muted-foreground",
											children: "Automatically creates an active cheque record in PDC Management ledger."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-center gap-2 cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: addVoucherForm.createPdc,
												onChange: (e) => setAddVoucherForm((f) => ({
													...f,
													createPdc: e.target.checked
												})),
												className: "h-4 w-4 rounded accent-primary"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-semibold",
												children: "Create PDC"
											})]
										})]
									}), addVoucherForm.createPdc && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-3 gap-2 pt-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Cheque No.",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: addVoucherForm.pdcChequeNo,
													onChange: (e) => setAddVoucherForm((f) => ({
														...f,
														pdcChequeNo: e.target.value
													})),
													placeholder: "CHQ-001",
													className: "bg-background text-xs"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Bank",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: addVoucherForm.pdcBank,
													onChange: (e) => setAddVoucherForm((f) => ({
														...f,
														pdcBank: e.target.value
													})),
													placeholder: "QNB",
													className: "bg-background text-xs"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Maturity Date",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "date",
													value: addVoucherForm.pdcDate,
													onChange: (e) => setAddVoucherForm((f) => ({
														...f,
														pdcDate: e.target.value
													})),
													className: "bg-background text-xs"
												})
											})
										]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setAddVoucherOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: addVoucher,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "mr-2 h-4 w-4" }), " Add Voucher"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: settleRefundOpen,
				onOpenChange: setSettleRefundOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[580px] max-h-[90vh] overflow-y-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
						className: "pb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
								className: "flex items-center gap-2 text-base font-bold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5 text-purple-600" }), "Settle & Refund Security Deposit"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 text-[11px] font-semibold",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `px-2 py-0.5 rounded-full ${settleRefundStep === 1 ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-800"}`,
										children: "1. Deductions"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "→"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `px-2 py-0.5 rounded-full ${settleRefundStep === 2 ? "bg-purple-600 text-white" : "bg-muted text-muted-foreground"}`,
										children: "2. Payment & GL"
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: settleRefundStep === 1 ? "Step 1 of 2: Review and adjust tenant damage deductions and select settlement mode." : "Step 2 of 2: Configure payment details, review GL journal posting, and issue receipt."
						})]
					}), selectedSettlement && (() => {
						const lease = leases.find((l) => l.id === selectedSettlement.leaseId);
						const damages = parseFloat(settleRefundForm.damages) || 0;
						const outstandingRent = parseFloat(settleRefundForm.outstandingRent) || 0;
						const utilityCharges = parseFloat(settleRefundForm.utilityCharges) || 0;
						const cleaningCharges = parseFloat(settleRefundForm.cleaningCharges) || 0;
						const restorationCharges = parseFloat(settleRefundForm.restorationCharges) || 0;
						const otherDeductions = parseFloat(settleRefundForm.otherDeductions) || 0;
						const totalDeductions = damages + outstandingRent + utilityCharges + cleaningCharges + restorationCharges + otherDeductions;
						const grossDeposit = selectedSettlement.depositReceived || lease?.securityDeposit || 0;
						const unusedRentRefundUI = settleRefundForm.currentMonthPdcDeposited ? Math.max(0, parseFloat(settleRefundForm.unusedRentRefund) || 0) : 0;
						const effectiveDepositUI = grossDeposit + unusedRentRefundUI;
						const maxCalculated = Math.max(0, effectiveDepositUI - totalDeductions);
						const enteredRefund = parseFloat(settleRefundForm.refundAmount) || 0;
						const mode = settleRefundForm.settlementMode;
						const dmgPayMode = settleRefundForm.damagePaymentMode || "Bank Transfer";
						const bankLabel = settleRefundForm.paymentMethod !== "Cash" ? "12000 Bank Operating Account" : "12100 Cash In Hand";
						let dmgDrLabel = "12000 Bank Operating Account";
						if (dmgPayMode === "Cash") dmgDrLabel = "12100 Cash In Hand";
						else if (dmgPayMode === "Cheque") dmgDrLabel = "12200 Cheques / PDC In Hand";
						else if (dmgPayMode === "Bank Guarantee") dmgDrLabel = "12500 Bank Guarantee Security Held";
						const depositDeduction = Math.min(effectiveDepositUI, totalDeductions);
						const remainingAR = Math.max(0, totalDeductions - effectiveDepositUI);
						const _daysOccupied = parseInt(settleRefundForm.daysOccupiedInMonth) || 0;
						const _totalDays = parseInt(settleRefundForm.totalDaysInMonth) || 30;
						const _monthlyRent = lease?.monthlyRent || 0;
						const _computedUnusedRent = settleRefundForm.currentMonthPdcDeposited && _monthlyRent > 0 ? Math.round(_monthlyRent / _totalDays * Math.max(0, _totalDays - _daysOccupied)) : 0;
						const handleDeductionChange = (field, val) => {
							const updatedForm = {
								...settleRefundForm,
								[field]: val
							};
							const d = parseFloat(field === "damages" ? val : updatedForm.damages) || 0;
							const r = parseFloat(field === "outstandingRent" ? val : updatedForm.outstandingRent) || 0;
							const u = parseFloat(field === "utilityCharges" ? val : updatedForm.utilityCharges) || 0;
							const c = parseFloat(field === "cleaningCharges" ? val : updatedForm.cleaningCharges) || 0;
							const res = parseFloat(field === "restorationCharges" ? val : updatedForm.restorationCharges) || 0;
							const o = parseFloat(field === "otherDeductions" ? val : updatedForm.otherDeductions) || 0;
							const tot = d + r + u + c + res + o;
							const effDep = grossDeposit + (updatedForm.currentMonthPdcDeposited ? parseFloat(updatedForm.unusedRentRefund) || 0 : 0);
							if (updatedForm.settlementMode === "DEDUCT_FROM_DEPOSIT") updatedForm.refundAmount = String(Math.max(0, effDep - tot));
							else updatedForm.refundAmount = String(effDep);
							setSettleRefundForm(updatedForm);
						};
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-1 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border bg-muted/40 p-2.5 space-y-1 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-medium",
											children: "Tenant / Customer:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: lease?.tenantName || selectedSettlement.leaseId
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-medium",
											children: "Property & Unit:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											lease?.property || "Old Salata - Residence No:23",
											" • ",
											lease?.unit || "Unit"
										] })]
									})]
								}),
								settleRefundStep === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border border-amber-200 bg-amber-50/60 p-2.5 space-y-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[11px] font-bold uppercase tracking-wider text-amber-900 block",
														children: "Damage Settlement Mode"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-amber-800 font-medium",
														children: "Select accounting treatment"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-2 gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														type: "button",
														onClick: () => {
															setSettleRefundForm((f) => ({
																...f,
																settlementMode: "DEDUCT_FROM_DEPOSIT",
																refundAmount: String(maxCalculated)
															}));
														},
														className: `rounded-lg border p-2 text-left text-[11px] transition-all ${mode === "DEDUCT_FROM_DEPOSIT" ? "border-purple-500 bg-purple-50 text-purple-900 font-semibold ring-1 ring-purple-400" : "border-border bg-background text-muted-foreground hover:border-purple-300"}`,
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "font-semibold mb-0.5",
															children: "✂ Deduct from Deposit"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "text-[10px] opacity-75",
															children: "Offset damages from deposit liability. Refund remainder."
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														type: "button",
														onClick: () => {
															setSettleRefundForm((f) => ({
																...f,
																settlementMode: "PAY_SEPARATELY",
																refundAmount: String(grossDeposit)
															}));
														},
														className: `rounded-lg border p-2 text-left text-[11px] transition-all ${mode === "PAY_SEPARATELY" ? "border-blue-500 bg-blue-50 text-blue-900 font-semibold ring-1 ring-blue-400" : "border-border bg-background text-muted-foreground hover:border-blue-300"}`,
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "font-semibold mb-0.5",
															children: "💳 Customer Pays Separately"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "text-[10px] opacity-75",
															children: "Customer pays via Cash, Cheque, Bank, or BG. Full deposit refunded."
														})]
													})]
												}),
												mode === "PAY_SEPARATELY" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[10px] text-blue-800 bg-blue-50 rounded p-1.5 border border-blue-200",
													children: [
														"ℹ ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Customer Pays Separately Mode:" }),
														" Customer pays ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["QAR ", totalDeductions.toLocaleString()] }),
														" directly for damages & repair charges (via Cash, Cheque, Bank Transfer, or Bank Guarantee). A ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Receipt Voucher" }),
														" will be recorded with payment proof, and the full deposit of ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["QAR ", grossDeposit.toLocaleString()] }),
														" will be released untouched."
													]
												}),
												mode === "DEDUCT_FROM_DEPOSIT" && remainingAR > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[10px] text-red-700 bg-red-50 rounded p-1.5 border border-red-200",
													children: [
														"⚠ Damages (QAR ",
														totalDeductions.toLocaleString(),
														") exceed deposit (QAR ",
														grossDeposit.toLocaleString(),
														"). Residual AR of QAR ",
														remainingAR.toLocaleString(),
														" remains outstanding."
													]
												})
											]
										}),
										mode === "PAY_SEPARATELY" && totalDeductions > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border border-blue-300 bg-blue-50/70 p-2.5 space-y-2.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3.5 w-3.5 text-blue-600" }), "Tenant Payment Details & Proof Upload"]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: "outline",
														className: "text-[10px] border-blue-300 text-blue-800 bg-blue-100 font-semibold",
														children: "Separate Collection"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-[10px] font-semibold text-blue-950",
														children: "Payment Channel / Instrument"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "grid grid-cols-4 gap-1.5",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																type: "button",
																onClick: () => setSettleRefundForm((f) => ({
																	...f,
																	damagePaymentMode: "Bank Transfer",
																	payerBank: f.payerBank === "Cash In Hand" ? "QNB" : f.payerBank
																})),
																className: `rounded border px-2 py-1.5 text-center text-[11px] font-medium transition-all ${dmgPayMode === "Bank Transfer" ? "border-blue-600 bg-blue-600 text-white shadow-sm" : "border-border bg-background text-muted-foreground hover:bg-muted"}`,
																children: "🏦 Bank Transfer"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																type: "button",
																onClick: () => setSettleRefundForm((f) => ({
																	...f,
																	damagePaymentMode: "Cash",
																	payerBank: "Cash In Hand"
																})),
																className: `rounded border px-2 py-1.5 text-center text-[11px] font-medium transition-all ${dmgPayMode === "Cash" ? "border-emerald-600 bg-emerald-600 text-white shadow-sm" : "border-border bg-background text-muted-foreground hover:bg-muted"}`,
																children: "💵 Cash In Hand"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																type: "button",
																onClick: () => setSettleRefundForm((f) => ({
																	...f,
																	damagePaymentMode: "Cheque",
																	payerBank: f.payerBank === "Cash In Hand" ? "Commercial Bank" : f.payerBank
																})),
																className: `rounded border px-2 py-1.5 text-center text-[11px] font-medium transition-all ${dmgPayMode === "Cheque" ? "border-indigo-600 bg-indigo-600 text-white shadow-sm" : "border-border bg-background text-muted-foreground hover:bg-muted"}`,
																children: "📝 Bank Cheque"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																type: "button",
																onClick: () => setSettleRefundForm((f) => ({
																	...f,
																	damagePaymentMode: "Bank Guarantee",
																	payerBank: f.payerBank === "Cash In Hand" ? "QNB" : f.payerBank
																})),
																className: `rounded border px-2 py-1.5 text-center text-[11px] font-medium transition-all ${dmgPayMode === "Bank Guarantee" ? "border-amber-600 bg-amber-600 text-white shadow-sm" : "border-border bg-background text-muted-foreground hover:bg-muted"}`,
																children: "🛡 Bank Guarantee"
															})
														]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-3 gap-2",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
																className: "text-[10px] font-medium text-blue-950",
																children: [
																	dmgPayMode === "Cash" ? "Cash Receipt / Slip #" : dmgPayMode === "Cheque" ? "Cheque Number #" : dmgPayMode === "Bank Guarantee" ? "Bank Guarantee (BG) Ref #" : "Transaction / Wire Ref #",
																	" ",
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-destructive",
																		children: "*"
																	})
																]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																className: "h-7 text-xs font-mono bg-background",
																placeholder: dmgPayMode === "Cash" ? "e.g. CRV-4019" : dmgPayMode === "Cheque" ? "e.g. CHQ-0018492" : dmgPayMode === "Bank Guarantee" ? "e.g. BG-QNB-2026-8812" : "e.g. TRX-CBQ-90123",
																value: settleRefundForm.paymentRefNo,
																onChange: (e) => setSettleRefundForm({
																	...settleRefundForm,
																	paymentRefNo: e.target.value
																})
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-[10px] font-medium text-blue-950",
																children: dmgPayMode === "Cash" ? "Receiving Location / Counter" : dmgPayMode === "Bank Guarantee" ? "Issuing Bank Name" : dmgPayMode === "Cheque" ? "Drawn Bank Name" : "Payer Bank Name"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																className: "h-7 text-xs bg-background",
																placeholder: dmgPayMode === "Cash" ? "e.g. Finance Cashier Desk" : dmgPayMode === "Bank Guarantee" ? "e.g. Qatar National Bank (QNB)" : "e.g. QNB / CBQ / Doha Bank",
																value: settleRefundForm.payerBank,
																onChange: (e) => setSettleRefundForm({
																	...settleRefundForm,
																	payerBank: e.target.value
																})
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-[10px] font-medium text-blue-950",
																children: dmgPayMode === "Cheque" ? "Cheque Date" : dmgPayMode === "Bank Guarantee" ? "BG Issue Date" : "Payment / Receipt Date"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "date",
																className: "h-7 text-xs bg-background",
																value: settleRefundForm.paymentDate,
																onChange: (e) => setSettleRefundForm({
																	...settleRefundForm,
																	paymentDate: e.target.value
																})
															})]
														})
													]
												}),
												dmgPayMode === "Bank Guarantee" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-2 gap-2 bg-amber-100/60 p-2 rounded border border-amber-200",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
															className: "text-[10px] font-semibold text-amber-950",
															children: ["Bank Guarantee Expiry Date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-destructive",
																children: "*"
															})]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "date",
															className: "h-7 text-xs bg-background font-mono",
															value: settleRefundForm.bgExpiryDate,
															onChange: (e) => setSettleRefundForm({
																...settleRefundForm,
																bgExpiryDate: e.target.value
															})
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-[10px] text-amber-900 flex items-center pt-2",
														children: ["🛡 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "Bank Guarantee serves as secure payment instrument held against damage clearance (GL 12500)." })]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-[10px] font-medium text-blue-950",
														children: dmgPayMode === "Cash" ? "Upload Signed Cash Receipt / Counter Slip" : dmgPayMode === "Cheque" ? "Upload Cheque Leaf Copy (Front & Back)" : dmgPayMode === "Bank Guarantee" ? "Upload Bank Guarantee Certificate / Official Letter" : "Upload Payment Slip / Bank Transfer Confirmation"
													}), settleRefundForm.paymentProofFileName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center justify-between p-2 rounded bg-background border border-emerald-300",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-2 overflow-hidden",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheckCorner, { className: "h-4 w-4 text-emerald-600 shrink-0" }),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-xs font-medium truncate text-foreground",
																	children: settleRefundForm.paymentProofFileName
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	className: "bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0",
																	children: "Attached"
																})
															]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															type: "button",
															variant: "ghost",
															size: "sm",
															className: "h-6 text-[10px] text-destructive hover:bg-destructive/10 px-2",
															onClick: () => setSettleRefundForm({
																...settleRefundForm,
																paymentProofFileName: "",
																paymentProofData: ""
															}),
															children: "Remove"
														})]
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
														className: "flex flex-col items-center justify-center p-2.5 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-background hover:bg-blue-50/50 transition-colors",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center gap-2 text-blue-700",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-xs font-medium",
																	children: dmgPayMode === "Cash" ? "Click to upload signed cash voucher / receipt copy" : dmgPayMode === "Cheque" ? "Click to upload scanned cheque leaf copy" : dmgPayMode === "Bank Guarantee" ? "Click to upload scanned BG certificate / letter" : "Click to upload bank transfer slip / screenshot"
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-[10px] text-muted-foreground mt-0.5",
																children: "PNG, JPG, PDF up to 10MB"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																type: "file",
																accept: "image/*,.pdf",
																className: "hidden",
																onChange: (e) => {
																	const file = e.target.files?.[0];
																	if (file) {
																		const reader = new FileReader();
																		reader.onload = () => {
																			setSettleRefundForm((prev) => ({
																				...prev,
																				paymentProofFileName: file.name,
																				paymentProofData: reader.result
																			}));
																		};
																		reader.readAsDataURL(file);
																	}
																}
															})
														]
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 space-y-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5",
														children: "✏ Update Damage & Repair Details (Tenant-Agreed)"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground",
														children: "Editable before final posting"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-3 gap-2",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-[10px] font-medium text-muted-foreground",
																children: "Damage / Repairs (QAR)"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "number",
																step: "0.01",
																className: "h-7 text-xs font-mono bg-background",
																value: settleRefundForm.damages,
																onChange: (e) => handleDeductionChange("damages", e.target.value)
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-[10px] font-medium text-muted-foreground",
																children: "Outstanding Rent (QAR)"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "number",
																step: "0.01",
																className: "h-7 text-xs font-mono bg-background",
																value: settleRefundForm.outstandingRent,
																onChange: (e) => handleDeductionChange("outstandingRent", e.target.value)
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-[10px] font-medium text-muted-foreground",
																children: "Kahramaa / Utilities (QAR)"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "number",
																step: "0.01",
																className: "h-7 text-xs font-mono bg-background",
																value: settleRefundForm.utilityCharges,
																onChange: (e) => handleDeductionChange("utilityCharges", e.target.value)
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-[10px] font-medium text-muted-foreground",
																children: "Deep Cleaning (QAR)"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "number",
																step: "0.01",
																className: "h-7 text-xs font-mono bg-background",
																value: settleRefundForm.cleaningCharges,
																onChange: (e) => handleDeductionChange("cleaningCharges", e.target.value)
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-[10px] font-medium text-muted-foreground",
																children: "Painting / Restoration (QAR)"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "number",
																step: "0.01",
																className: "h-7 text-xs font-mono bg-background",
																value: settleRefundForm.restorationCharges,
																onChange: (e) => handleDeductionChange("restorationCharges", e.target.value)
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-[10px] font-medium text-muted-foreground",
																children: "Other Charges (QAR)"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "number",
																step: "0.01",
																className: "h-7 text-xs font-mono bg-background",
																value: settleRefundForm.otherDeductions,
																onChange: (e) => handleDeductionChange("otherDeductions", e.target.value)
															})]
														})
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1 pt-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-[10px] font-medium text-muted-foreground",
														children: "Tenant Damage Agreement / Quotation Notes"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														className: "h-7 text-xs bg-background",
														placeholder: "e.g. Tenant agreed to pay QR 650 for wall repair and faucet replacement",
														value: settleRefundForm.damageRemarks,
														onChange: (e) => setSettleRefundForm({
															...settleRefundForm,
															damageRemarks: e.target.value
														})
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border border-teal-200 bg-teal-50/60 p-2.5 space-y-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[11px] font-bold uppercase tracking-wider text-teal-900",
														children: "🗓 Occupancy & Current-Month PDC"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-teal-700",
														children: "Unused rent refund if PDC deposited"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-3 gap-2",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																className: "text-[10px] font-medium text-teal-900",
																children: "Days Occupied in Month"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																type: "number",
																min: 0,
																max: 31,
																className: "w-full h-7 rounded border border-teal-300 bg-background px-2 text-xs font-mono",
																value: settleRefundForm.daysOccupiedInMonth,
																onChange: (e) => {
																	const dOcc = parseInt(e.target.value) || 0;
																	const dTot = parseInt(settleRefundForm.totalDaysInMonth) || 30;
																	const unusedR = settleRefundForm.currentMonthPdcDeposited ? Math.round(_monthlyRent / dTot * Math.max(0, dTot - dOcc)) : 0;
																	const effDep = grossDeposit + unusedR;
																	const tot = (parseFloat(settleRefundForm.damages) || 0) + (parseFloat(settleRefundForm.outstandingRent) || 0) + (parseFloat(settleRefundForm.utilityCharges) || 0) + (parseFloat(settleRefundForm.cleaningCharges) || 0) + (parseFloat(settleRefundForm.restorationCharges) || 0) + (parseFloat(settleRefundForm.otherDeductions) || 0);
																	const refund = settleRefundForm.settlementMode === "DEDUCT_FROM_DEPOSIT" ? Math.max(0, effDep - tot) : effDep;
																	setSettleRefundForm((f) => ({
																		...f,
																		daysOccupiedInMonth: e.target.value,
																		unusedRentRefund: String(unusedR),
																		refundAmount: String(refund)
																	}));
																}
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																className: "text-[10px] font-medium text-teal-900",
																children: "Total Days in Month"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																type: "number",
																min: 28,
																max: 31,
																className: "w-full h-7 rounded border border-teal-300 bg-background px-2 text-xs font-mono",
																value: settleRefundForm.totalDaysInMonth,
																onChange: (e) => {
																	const dTot = parseInt(e.target.value) || 30;
																	const dOcc = parseInt(settleRefundForm.daysOccupiedInMonth) || 0;
																	const unusedR = settleRefundForm.currentMonthPdcDeposited ? Math.round(_monthlyRent / dTot * Math.max(0, dTot - dOcc)) : 0;
																	const effDep = grossDeposit + unusedR;
																	const tot = (parseFloat(settleRefundForm.damages) || 0) + (parseFloat(settleRefundForm.outstandingRent) || 0) + (parseFloat(settleRefundForm.utilityCharges) || 0) + (parseFloat(settleRefundForm.cleaningCharges) || 0) + (parseFloat(settleRefundForm.restorationCharges) || 0) + (parseFloat(settleRefundForm.otherDeductions) || 0);
																	const refund = settleRefundForm.settlementMode === "DEDUCT_FROM_DEPOSIT" ? Math.max(0, effDep - tot) : effDep;
																	setSettleRefundForm((f) => ({
																		...f,
																		totalDaysInMonth: e.target.value,
																		unusedRentRefund: String(unusedR),
																		refundAmount: String(refund)
																	}));
																}
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																className: "text-[10px] font-medium text-teal-900",
																children: "Current Month PDC Deposited?"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex gap-2 pt-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																	type: "button",
																	onClick: () => {
																		const dOcc = parseInt(settleRefundForm.daysOccupiedInMonth) || 0;
																		const dTot = parseInt(settleRefundForm.totalDaysInMonth) || 30;
																		const computed = Math.round(_monthlyRent / dTot * Math.max(0, dTot - dOcc));
																		const effDep = grossDeposit + computed;
																		const tot = (parseFloat(settleRefundForm.damages) || 0) + (parseFloat(settleRefundForm.outstandingRent) || 0) + (parseFloat(settleRefundForm.utilityCharges) || 0) + (parseFloat(settleRefundForm.cleaningCharges) || 0) + (parseFloat(settleRefundForm.restorationCharges) || 0) + (parseFloat(settleRefundForm.otherDeductions) || 0);
																		const refund = settleRefundForm.settlementMode === "DEDUCT_FROM_DEPOSIT" ? Math.max(0, effDep - tot) : effDep;
																		setSettleRefundForm((f) => ({
																			...f,
																			currentMonthPdcDeposited: true,
																			unusedRentRefund: String(computed),
																			refundAmount: String(refund)
																		}));
																	},
																	className: `flex-1 rounded border px-2 py-1 text-[11px] font-semibold transition-all ${settleRefundForm.currentMonthPdcDeposited ? "border-teal-600 bg-teal-600 text-white shadow-sm" : "border-border bg-background text-muted-foreground hover:border-teal-400 hover:text-teal-700"}`,
																	children: "✓ Yes"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																	type: "button",
																	onClick: () => {
																		const tot = (parseFloat(settleRefundForm.damages) || 0) + (parseFloat(settleRefundForm.outstandingRent) || 0) + (parseFloat(settleRefundForm.utilityCharges) || 0) + (parseFloat(settleRefundForm.cleaningCharges) || 0) + (parseFloat(settleRefundForm.restorationCharges) || 0) + (parseFloat(settleRefundForm.otherDeductions) || 0);
																		const refund = settleRefundForm.settlementMode === "DEDUCT_FROM_DEPOSIT" ? Math.max(0, grossDeposit - tot) : grossDeposit;
																		setSettleRefundForm((f) => ({
																			...f,
																			currentMonthPdcDeposited: false,
																			unusedRentRefund: "0",
																			refundAmount: String(refund)
																		}));
																	},
																	className: `flex-1 rounded border px-2 py-1 text-[11px] font-semibold transition-all ${!settleRefundForm.currentMonthPdcDeposited ? "border-red-500 bg-red-500 text-white shadow-sm" : "border-border bg-background text-muted-foreground hover:border-red-400 hover:text-red-600"}`,
																	children: "✗ No"
																})]
															})]
														})
													]
												}),
												settleRefundForm.currentMonthPdcDeposited && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-2 gap-2 pt-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-[10px] bg-teal-100 border border-teal-300 rounded p-1.5 space-y-0.5",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "font-semibold text-teal-900",
																children: "Auto-Calculated Unused Rent Refund"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "font-mono text-teal-800 text-sm font-bold",
																children: ["QAR ", _computedUnusedRent.toLocaleString()]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "text-teal-700",
																children: [
																	"= QAR ",
																	_monthlyRent.toLocaleString(),
																	" ÷ ",
																	_totalDays,
																	"d × ",
																	Math.max(0, _totalDays - _daysOccupied),
																	"d unused"
																]
															})
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
															className: "text-[10px] font-medium text-teal-900",
															children: "Override Unused Rent (QAR)"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
															type: "number",
															step: "0.01",
															min: 0,
															className: "w-full h-7 rounded border border-teal-300 bg-background px-2 text-xs font-mono",
															value: settleRefundForm.unusedRentRefund,
															onChange: (e) => {
																const effDep = grossDeposit + Math.max(0, parseFloat(e.target.value) || 0);
																const tot = (parseFloat(settleRefundForm.damages) || 0) + (parseFloat(settleRefundForm.outstandingRent) || 0) + (parseFloat(settleRefundForm.utilityCharges) || 0) + (parseFloat(settleRefundForm.cleaningCharges) || 0) + (parseFloat(settleRefundForm.restorationCharges) || 0) + (parseFloat(settleRefundForm.otherDeductions) || 0);
																const refund = settleRefundForm.settlementMode === "DEDUCT_FROM_DEPOSIT" ? Math.max(0, effDep - tot) : effDep;
																setSettleRefundForm((f) => ({
																	...f,
																	unusedRentRefund: e.target.value,
																	refundAmount: String(refund)
																}));
															}
														})]
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-purple-50/50 border-purple-200 p-2.5 space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[11px] font-bold uppercase tracking-wider text-purple-900 block",
												children: "Settlement Financial Summary"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-3 gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2 rounded bg-background border",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-muted-foreground block text-[10px]",
																children: "Security Deposit Held:"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "font-bold text-foreground font-mono",
																children: ["QAR ", grossDeposit.toLocaleString()]
															}),
															unusedRentRefundUI > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "block text-[10px] text-teal-700 font-semibold",
																children: [
																	"+ QAR ",
																	unusedRentRefundUI.toLocaleString(),
																	" unused rent"
																]
															})
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2 rounded bg-background border",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-muted-foreground block text-[10px]",
															children: "Total Damages / Deductions:"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-bold text-destructive font-mono",
															children: ["-QAR ", totalDeductions.toLocaleString()]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2 rounded bg-background border border-emerald-300 bg-emerald-50/70",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-emerald-800 block text-[10px] font-semibold",
															children: mode === "PAY_SEPARATELY" ? "Total Refund:" : "Net Refund to Pay:"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-bold text-emerald-700 font-mono",
															children: ["QAR ", mode === "PAY_SEPARATELY" ? effectiveDepositUI.toLocaleString() : maxCalculated.toLocaleString()]
														})]
													})
												]
											})]
										})
									]
								}),
								settleRefundStep === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border border-purple-200 bg-purple-50/60 p-2.5 space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted-foreground block",
													children: "Selected Settlement Mode"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-purple-900 text-xs",
													children: mode === "DEDUCT_FROM_DEPOSIT" ? "✂ Deductions from Deposit" : `💳 Customer Pays Separately (${dmgPayMode})`
												})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-right",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground block",
														children: mode === "PAY_SEPARATELY" ? `Damage Collection (${dmgPayMode})` : "Total Deductions Applied"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-mono font-bold text-xs text-foreground",
														children: ["QAR ", totalDeductions.toLocaleString()]
													})]
												})]
											}), mode === "PAY_SEPARATELY" && (settleRefundForm.paymentProofFileName || settleRefundForm.paymentRefNo) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between text-[10px] text-blue-900 bg-blue-100/70 rounded px-2 py-1 border border-blue-200",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													"Channel: ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: dmgPayMode }),
													" • Ref: ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: settleRefundForm.paymentRefNo || "N/A" }),
													" • Source: ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: settleRefundForm.payerBank || "N/A" }),
													dmgPayMode === "Bank Guarantee" && settleRefundForm.bgExpiryDate && ` • Exp: ${settleRefundForm.bgExpiryDate}`
												] }), settleRefundForm.paymentProofFileName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "flex items-center gap-1 font-medium text-emerald-800",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheckCorner, { className: "h-3 w-3 text-emerald-600" }), " Proof Attached"]
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
													className: "text-[11px] font-semibold",
													children: [
														mode === "PAY_SEPARATELY" ? "Deposit Refund Amount (QAR)" : "Actual Refund to Pay (QAR)",
														" ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-destructive",
															children: "*"
														})
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													step: "0.01",
													className: "h-8 text-xs font-mono font-bold",
													value: settleRefundForm.refundAmount,
													onChange: (e) => setSettleRefundForm({
														...settleRefundForm,
														refundAmount: e.target.value
													})
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-[11px] font-semibold",
													children: "Deposit Refund Payment Method"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: settleRefundForm.paymentMethod,
													onValueChange: (v) => setSettleRefundForm({
														...settleRefundForm,
														paymentMethod: v
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "h-8 text-xs bg-background",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Bank Transfer",
															children: "Bank Transfer"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Cheque",
															children: "Bank Cheque"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Cash",
															children: "Cash In Hand"
														})
													] })]
												})]
											})]
										}),
										settleRefundForm.paymentMethod === "Bank Transfer" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-blue-50/40 p-3 space-y-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5 text-xs font-semibold text-blue-900",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5 text-blue-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bank Transfer Details" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-2.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-[10px] font-semibold text-muted-foreground",
															children: "Beneficiary Bank"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															className: "h-7 text-xs bg-background",
															placeholder: "e.g. Qatar National Bank (QNB)",
															value: settleRefundForm.refundBank,
															onChange: (e) => setSettleRefundForm({
																...settleRefundForm,
																refundBank: e.target.value
															})
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-[10px] font-semibold text-muted-foreground",
															children: "Beneficiary IBAN / Account No."
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															className: "h-7 text-xs font-mono bg-background",
															placeholder: "QA00QNBA000000000000000000000",
															value: settleRefundForm.refundIban,
															onChange: (e) => setSettleRefundForm({
																...settleRefundForm,
																refundIban: e.target.value
															})
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-[10px] font-semibold text-muted-foreground",
															children: "Transaction / Transfer Ref #"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															className: "h-7 text-xs font-mono bg-background",
															placeholder: "e.g. TRF-998241",
															value: settleRefundForm.refundTxRef,
															onChange: (e) => setSettleRefundForm({
																...settleRefundForm,
																refundTxRef: e.target.value
															})
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-[10px] font-semibold text-muted-foreground",
															children: "Transfer Execution Date"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "date",
															className: "h-7 text-xs bg-background",
															value: settleRefundForm.refundPaymentDate,
															onChange: (e) => setSettleRefundForm({
																...settleRefundForm,
																refundPaymentDate: e.target.value
															})
														})]
													})
												]
											})]
										}),
										settleRefundForm.paymentMethod === "Cheque" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-amber-50/40 p-3 space-y-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5 text-xs font-semibold text-amber-900",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5 text-amber-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bank Cheque Disbursement Details" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-3 gap-2.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-[10px] font-semibold text-muted-foreground",
															children: "Cheque Number"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															className: "h-7 text-xs font-mono bg-background",
															placeholder: "e.g. CHQ-88219",
															value: settleRefundForm.refundChequeNo,
															onChange: (e) => setSettleRefundForm({
																...settleRefundForm,
																refundChequeNo: e.target.value
															})
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-[10px] font-semibold text-muted-foreground",
															children: "Issuing Bank"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															className: "h-7 text-xs bg-background",
															placeholder: "e.g. QNB Operating Account",
															value: settleRefundForm.refundChequeBank,
															onChange: (e) => setSettleRefundForm({
																...settleRefundForm,
																refundChequeBank: e.target.value
															})
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-[10px] font-semibold text-muted-foreground",
															children: "Cheque Date"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "date",
															className: "h-7 text-xs bg-background",
															value: settleRefundForm.refundChequeDate,
															onChange: (e) => setSettleRefundForm({
																...settleRefundForm,
																refundChequeDate: e.target.value
															})
														})]
													})
												]
											})]
										}),
										settleRefundForm.paymentMethod === "Cash" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-emerald-50/40 p-3 space-y-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5 text-xs font-semibold text-emerald-900",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-3.5 w-3.5 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Cash Disbursement Details" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-2.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-[10px] font-semibold text-muted-foreground",
														children: "Disbursed By / Cashier Name"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														className: "h-7 text-xs bg-background",
														placeholder: "e.g. Main Cash Till / Treasury",
														value: settleRefundForm.refundCashierName,
														onChange: (e) => setSettleRefundForm({
															...settleRefundForm,
															refundCashierName: e.target.value
														})
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-[10px] font-semibold text-muted-foreground",
														children: "Disbursement Date"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "date",
														className: "h-7 text-xs bg-background",
														value: settleRefundForm.refundPaymentDate,
														onChange: (e) => setSettleRefundForm({
															...settleRefundForm,
															refundPaymentDate: e.target.value
														})
													})]
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-1 md:grid-cols-2 gap-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-[11px] font-semibold",
													children: "Payment Proof / Signed Slip (Optional)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "file",
														className: "h-8 text-xs bg-background",
														onChange: (e) => {
															const file = e.target.files?.[0];
															if (file) {
																const reader = new FileReader();
																reader.onload = () => {
																	setSettleRefundForm({
																		...settleRefundForm,
																		refundProofFileName: file.name,
																		refundProofData: reader.result
																	});
																};
																reader.readAsDataURL(file);
															}
														}
													}), settleRefundForm.refundProofFileName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: "outline",
														className: "text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300 shrink-0",
														children: "Attached"
													})]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-[11px] font-semibold",
													children: "Settlement & Refund Remarks"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													className: "h-8 text-xs",
													placeholder: "e.g. Unit inspected, damage costs settled, deposit refund processed",
													value: settleRefundForm.notes,
													onChange: (e) => setSettleRefundForm({
														...settleRefundForm,
														notes: e.target.value
													})
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-muted/30 p-2.5 space-y-1 text-[11px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-semibold text-muted-foreground uppercase text-[10px] block",
												children: [
													"Automatic Double-Entry Posting on Execution (",
													mode === "DEDUCT_FROM_DEPOSIT" ? "Deduct from Deposit" : `Customer Pays via ${dmgPayMode}`,
													"):"
												]
											}), mode === "DEDUCT_FROM_DEPOSIT" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [totalDeductions > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between font-mono text-amber-700",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "DR 12413 Tenant Receivables (damage recognized)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["QAR ", totalDeductions.toLocaleString()] })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between font-mono text-amber-600 opacity-80",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\xA0\xA0CR 41400/41100 Recovery Income" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["QAR ", totalDeductions.toLocaleString()] })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between font-mono text-purple-700",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "DR 21500 Security Deposit (deduction)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["QAR ", depositDeduction.toLocaleString()] })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between font-mono text-purple-600 opacity-80",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\xA0\xA0CR 12413 Tenant Receivables (settled)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["QAR ", depositDeduction.toLocaleString()] })]
												})
											] }), enteredRefund > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between font-mono text-emerald-700",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "DR 21500 Security Deposit (refund balance)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["QAR ", enteredRefund.toLocaleString()] })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between font-mono text-blue-700",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["\xA0\xA0CR ", bankLabel] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["QAR ", enteredRefund.toLocaleString()] })]
											})] })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												totalDeductions > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between font-mono text-amber-700",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "DR 12413 Tenant Receivables (damage recognized)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["QAR ", totalDeductions.toLocaleString()] })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between font-mono text-amber-600 opacity-80",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\xA0\xA0CR 41400/41100 Recovery Income" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["QAR ", totalDeductions.toLocaleString()] })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between font-mono text-blue-700",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
															"DR ",
															dmgDrLabel,
															" (tenant settles damage via ",
															dmgPayMode,
															")"
														] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["QAR ", totalDeductions.toLocaleString()] })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between font-mono text-blue-600 opacity-80",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\xA0\xA0CR 12413 Tenant Receivables" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["QAR ", totalDeductions.toLocaleString()] })]
													})
												] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between font-mono text-emerald-700",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "DR 21500 Security Deposit (full refund)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["QAR ", grossDeposit.toLocaleString()] })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between font-mono text-blue-700",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["\xA0\xA0CR ", bankLabel] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["QAR ", grossDeposit.toLocaleString()] })]
												})
											] })]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, {
									className: "gap-2 border-t pt-2 mt-2",
									children: settleRefundStep === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										onClick: () => setSettleRefundOpen(false),
										children: "Cancel"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "bg-purple-600 hover:bg-purple-700 text-white",
										onClick: () => setSettleRefundStep(2),
										children: "Next: Payment & GL Review →"
									})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										onClick: () => setSettleRefundStep(1),
										children: "← Back to Deductions"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										className: "bg-purple-600 hover:bg-purple-700 text-white",
										onClick: executeSettleAndRefund,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mr-2 h-4 w-4" }), " Confirm Settlement & Issue Receipt"]
									})] })
								})
							]
						});
					})()]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: startCheckoutOpen,
				onOpenChange: setStartCheckoutOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[620px] max-h-[90vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2 text-base font-bold text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-5 w-5 text-rose-600" }), "Initiate Tenant Vacate & Check-Out"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Record tenant vacating / early move-out notice, verify lease tenure, and queue inspection and deposit settlement."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								className: "text-xs font-semibold flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5 text-primary" }), " Select Customer / Tenant Lease"]
							}), (() => {
								const activeLeases = leases.filter((l) => l.status !== "closed" && l.status !== "terminated" && l.status !== "checkout");
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: checkoutWorkflowLease?.id || "",
									onValueChange: (val) => {
										const target = leases.find((l) => l.id === val);
										if (target) {
											setCheckoutWorkflowLease(target);
											setStartCheckoutForm((f) => ({
												...f,
												moveOutDate: today.toISOString().split("T")[0],
												inspectionDate: today.toISOString().split("T")[0]
											}));
										}
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-9 text-xs font-medium bg-background border-primary/40 focus:ring-primary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: activeLeases.length === 0 ? "No active leases found" : "Choose an active customer / lease" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: activeLeases.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "py-2 px-3 text-xs text-muted-foreground",
										children: "No active leases available for check-out"
									}) : activeLeases.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: l.id,
										className: "text-xs font-medium",
										children: [
											l.tenantName,
											" — ",
											l.unit,
											" (",
											l.property,
											") [",
											l.startDate,
											" to ",
											l.endDate,
											"]"
										]
									}, l.id)) })]
								});
							})()]
						}),
						checkoutWorkflowLease && (() => {
							const customer = customers.find((c) => c.id === checkoutWorkflowLease.customerId);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3 py-1 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded-lg border bg-muted/40 p-3 space-y-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-x-4 gap-y-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-bold",
													children: "Tenant Name"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground text-sm",
													children: checkoutWorkflowLease.tenantName
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-bold",
													children: "Unit & Property"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-semibold text-foreground",
													children: [
														checkoutWorkflowLease.unit,
														" (",
														checkoutWorkflowLease.property,
														")"
													]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-bold",
													children: "Contact / QID / Mobile"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono text-muted-foreground",
													children: [
														customer?.qatarId || customer?.crNumber || "—",
														" • ",
														customer?.mobile || "—"
													]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-bold",
													children: "Email Address"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground truncate block",
													children: customer?.email || "—"
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-bold",
													children: "Lease Tenure"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono text-foreground font-medium",
													children: [
														checkoutWorkflowLease.startDate,
														" to ",
														checkoutWorkflowLease.endDate
													]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block text-[10px] uppercase font-bold",
													children: "Monthly Rent / Security Deposit"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono text-foreground font-medium",
													children: [
														"QR ",
														checkoutWorkflowLease.monthlyRent?.toLocaleString(),
														" / QR ",
														checkoutWorkflowLease.securityDeposit?.toLocaleString()
													]
												})] })
											]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-3 gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
													className: "text-[11px] font-semibold",
													children: ["Notice Date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-destructive",
														children: "*"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "date",
													className: "h-8 text-xs font-mono",
													value: startCheckoutForm.noticeDate,
													onChange: (e) => setStartCheckoutForm((f) => ({
														...f,
														noticeDate: e.target.value
													}))
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
													className: "text-[11px] font-semibold",
													children: ["Planned Move-Out Date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-destructive",
														children: "*"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "date",
													className: "h-8 text-xs font-mono",
													value: startCheckoutForm.moveOutDate,
													onChange: (e) => setStartCheckoutForm((f) => ({
														...f,
														moveOutDate: e.target.value
													}))
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
													className: "text-[11px] font-semibold",
													children: ["Inspection Schedule ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-destructive",
														children: "*"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "date",
													className: "h-8 text-xs font-mono",
													value: startCheckoutForm.inspectionDate,
													onChange: (e) => setStartCheckoutForm((f) => ({
														...f,
														inspectionDate: e.target.value
													}))
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-[11px] font-semibold",
											children: "Vacating Reason / Handover Notes"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											rows: 2,
											className: "text-xs",
											value: startCheckoutForm.notes,
											onChange: (e) => setStartCheckoutForm((f) => ({
												...f,
												notes: e.target.value
											})),
											placeholder: "e.g. Tenant relocating abroad / lease non-renewal / early vacating agreed by landlord..."
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-md bg-blue-50 border border-blue-200 p-2 text-[11px] text-blue-800 space-y-0.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold",
											children: "Next Step upon Initiation:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-blue-700",
											children: [
												"A Check-Out Inspection case will be queued under ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Checkout" }),
												". You can then complete the unit meter readings, verify asset checklist, calculate approved deductions, and issue the official refund receipt & GL settlement vouchers."
											]
										})]
									})
								]
							});
						})(),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "border-t pt-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setStartCheckoutOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "bg-rose-600 hover:bg-rose-700 text-white gap-1.5",
								onClick: () => {
									if (checkoutWorkflowLease) {
										startCheckout(checkoutWorkflowLease);
										setStartCheckoutOpen(false);
									}
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" }), " Confirm & Queue Check-Out"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: completeCheckoutOpen,
				onOpenChange: setCompleteCheckoutOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-3xl max-h-[90vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2 text-lg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-flex items-center justify-center rounded-full bg-primary/10 p-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-5 w-5 text-primary" })
							}), "Check-Out Inspection & Final Clearances"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
							className: "text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-foreground",
									children: leases.find((l) => l.id === selectedCheckout?.leaseId)?.tenantName
								}),
								" · ",
								leases.find((l) => l.id === selectedCheckout?.leaseId)?.unit,
								" · ",
								leases.find((l) => l.id === selectedCheckout?.leaseId)?.property
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-1 rounded-lg bg-muted p-1 text-xs",
							children: [
								{
									id: "condition",
									label: "🏠 Condition & Meters"
								},
								{
									id: "assets",
									label: "📦 Asset Verification"
								},
								{
									id: "damages",
									label: "💰 Deductions & Settlement"
								},
								{
									id: "clearances",
									label: "✅ Clearances & Sign-Off"
								}
							].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: `flex-1 rounded-md px-2.5 py-1.5 font-medium transition-colors ${checkoutActiveTab === tab.id ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`,
								onClick: () => setCheckoutActiveTab(tab.id),
								type: "button",
								children: tab.label
							}, tab.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-2",
							children: [
								checkoutActiveTab === "condition" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-muted/30 p-3 space-y-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
												children: "Unit Overall Condition"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Final Condition",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: completeCheckoutForm.condition,
														onValueChange: (v) => setCompleteCheckoutForm((f) => ({
															...f,
															condition: v
														})),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Good",
																children: "Good — Minor cleaning only"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Repair required",
																children: "Repair Required"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Major damage",
																children: "Major Damage"
															})
														] })]
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Unit Disposition on Release",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: completeCheckoutForm.unitDisposition,
														onValueChange: (v) => setCompleteCheckoutForm((f) => ({
															...f,
															unitDisposition: v
														})),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Available",
															children: "Vacant - Ready / Available"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Vacant - Under Maintenance",
															children: "Vacant - Under Maintenance / Repairs"
														})] })]
													})
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-muted/30 p-3 space-y-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
												children: "Final Meter Readings at Check-Out"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "⚡ Final Electricity Meter (kWh)",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: completeCheckoutForm.electricityMeter,
														onChange: (e) => setCompleteCheckoutForm((f) => ({
															...f,
															electricityMeter: e.target.value
														})),
														placeholder: "e.g. 182207"
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "💧 Final Water Meter (m³)",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: completeCheckoutForm.waterMeter,
														onChange: (e) => setCompleteCheckoutForm((f) => ({
															...f,
															waterMeter: e.target.value
														})),
														placeholder: "e.g. 149129"
													})
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-muted/30 p-3 space-y-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "No. of Photos Documented",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													min: "0",
													value: completeCheckoutForm.photos,
													onChange: (e) => setCompleteCheckoutForm((f) => ({
														...f,
														photos: e.target.value
													}))
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Damages / Inspection Notes",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
													rows: 2,
													value: completeCheckoutForm.damages,
													onChange: (e) => setCompleteCheckoutForm((f) => ({
														...f,
														damages: e.target.value
													})),
													placeholder: "Note any scratches, paint peeling, fixture damages..."
												})
											})]
										})
									]
								}),
								checkoutActiveTab === "assets" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border bg-muted/30 p-3 space-y-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
												children: "Assigned Assets Check-Out Verification"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs text-muted-foreground",
												children: [handoverAssets.length, " asset(s) registered"]
											})]
										}), handoverAssets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "rounded-md border bg-background p-4 text-center text-xs text-muted-foreground",
											children: "No registered fixed assets found for this unit. You can note any unlisted items in the damages/missing items section."
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "space-y-2.5",
											children: handoverAssets.map((asset) => {
												const change = assetChanges[asset.id] || {
													condition: asset.asset_condition || "Good",
													imageFileName: ""
												};
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "rounded-lg border bg-background p-3 flex items-center justify-between gap-3 text-xs",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "min-w-0 flex-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "font-semibold text-foreground",
															children: asset.asset_name
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "text-muted-foreground text-[11px] font-mono",
															children: asset.asset_code || asset.category || "Asset"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "w-40",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
															value: change.condition,
															onValueChange: (v) => updateAssetChange(asset.id, { condition: v }),
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
																className: "h-7 text-xs",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Excellent",
																	children: "Excellent"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Good",
																	children: "Good (Normal Wear)"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Fair",
																	children: "Fair / Scratched"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Needs Attention",
																	children: "Damaged / Missing"
																})
															] })]
														})
													})]
												}, asset.id);
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Missing Items or Fixtures",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: completeCheckoutForm.missingItems,
											onChange: (e) => setCompleteCheckoutForm((f) => ({
												...f,
												missingItems: e.target.value
											})),
											placeholder: "e.g. 1 parking remote missing, kitchen light fixture broken..."
										})
									})]
								}),
								checkoutActiveTab === "damages" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border bg-purple-50/40 border-purple-200 p-3 space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-bold uppercase tracking-wider text-purple-900",
												children: "Security Deposit Settlement Calculation"
											}), (() => {
												const dep = leases.find((l) => l.id === selectedCheckout?.leaseId)?.securityDeposit || 5100;
												const rent = Number(completeCheckoutForm.outstandingRent) || 0;
												const dmg = Number(completeCheckoutForm.damagesAmount) || 0;
												const utl = Number(completeCheckoutForm.utilityCharges) || 0;
												const cln = Number(completeCheckoutForm.cleaningCharges) || 0;
												const rst = Number(completeCheckoutForm.restorationCharges) || 0;
												const other = Number(completeCheckoutForm.otherDeductions) || 0;
												const totalDeductions = rent + dmg + utl + cln + rst + other;
												const _unusedRent = completeCheckoutForm.currentMonthPdcDeposited ? Number(completeCheckoutForm.unusedRentRefund) || 0 : 0;
												const netRefund = dep + _unusedRent - totalDeductions;
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-3 gap-2 text-xs pt-1",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "p-2 rounded bg-background border",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-muted-foreground block text-[11px]",
																	children: "Gross Deposit:"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "font-bold text-foreground font-mono",
																	children: ["QR ", dep.toLocaleString()]
																}),
																_unusedRent > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "block text-[10px] text-teal-700 font-semibold",
																	children: [
																		"+ QR ",
																		_unusedRent.toLocaleString(),
																		" unused rent"
																	]
																})
															]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "p-2 rounded bg-background border",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-muted-foreground block text-[11px]",
																children: "Total Deductions:"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "font-bold text-destructive font-mono",
																children: ["-QR ", totalDeductions.toLocaleString()]
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "p-2 rounded bg-background border border-emerald-300 bg-emerald-50/60",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-emerald-800 block text-[11px] font-semibold",
																children: "Net Refund Payable:"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "font-bold text-emerald-700 font-mono",
																children: ["QR ", netRefund.toLocaleString()]
															})]
														})
													]
												});
											})()]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border p-3 space-y-3 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-semibold text-muted-foreground uppercase tracking-wider text-[11px]",
												children: "Deduction Item Breakdown (QAR)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "Outstanding Rent",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															className: "h-8 text-xs font-mono",
															value: completeCheckoutForm.outstandingRent,
															onChange: (e) => setCompleteCheckoutForm((f) => ({
																...f,
																outstandingRent: e.target.value
															}))
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "Damage / Repair Costs",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															className: "h-8 text-xs font-mono",
															value: completeCheckoutForm.damagesAmount,
															onChange: (e) => setCompleteCheckoutForm((f) => ({
																...f,
																damagesAmount: e.target.value
															}))
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "Final Utility (Kahramaa) Charges",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															className: "h-8 text-xs font-mono",
															value: completeCheckoutForm.utilityCharges,
															onChange: (e) => setCompleteCheckoutForm((f) => ({
																...f,
																utilityCharges: e.target.value
															}))
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "Deep Cleaning Charges",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															className: "h-8 text-xs font-mono",
															value: completeCheckoutForm.cleaningCharges,
															onChange: (e) => setCompleteCheckoutForm((f) => ({
																...f,
																cleaningCharges: e.target.value
															}))
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "Painting / Restoration Charges",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															className: "h-8 text-xs font-mono",
															value: completeCheckoutForm.restorationCharges,
															onChange: (e) => setCompleteCheckoutForm((f) => ({
																...f,
																restorationCharges: e.target.value
															}))
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "Other Administrative Deductions",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															className: "h-8 text-xs font-mono",
															value: completeCheckoutForm.otherDeductions,
															onChange: (e) => setCompleteCheckoutForm((f) => ({
																...f,
																otherDeductions: e.target.value
															}))
														})
													})
												]
											})]
										}),
										(() => {
											const _rent = leases.find((l) => l.id === selectedCheckout?.leaseId)?.monthlyRent || 0;
											const _dOcc = parseInt(completeCheckoutForm.daysOccupiedInMonth) || 0;
											const _dTot = parseInt(completeCheckoutForm.totalDaysInMonth) || 30;
											const _isPdc = completeCheckoutForm.currentMonthPdcDeposited;
											const _computedUnused = _isPdc && _rent > 0 ? Math.round(_rent / _dTot * Math.max(0, _dTot - _dOcc)) : 0;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-lg border border-teal-200 bg-teal-50/60 p-3 space-y-2.5 text-xs",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center justify-between",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[11px] font-bold uppercase tracking-wider text-teal-900",
															children: "🗓 Occupancy & Current-Month PDC"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-teal-700",
															children: "Unused rent refund if PDC was deposited"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "grid grid-cols-3 gap-2",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																	className: "text-[10px] font-semibold text-teal-900",
																	children: "Days Occupied in Month"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																	type: "number",
																	min: 0,
																	max: 31,
																	className: "h-8 text-xs font-mono border-teal-300 bg-background",
																	value: completeCheckoutForm.daysOccupiedInMonth,
																	onChange: (e) => {
																		const dOcc = parseInt(e.target.value) || 0;
																		const dTot = parseInt(completeCheckoutForm.totalDaysInMonth) || 30;
																		const computed = completeCheckoutForm.currentMonthPdcDeposited && _rent > 0 ? Math.round(_rent / dTot * Math.max(0, dTot - dOcc)) : 0;
																		setCompleteCheckoutForm((f) => ({
																			...f,
																			daysOccupiedInMonth: e.target.value,
																			unusedRentRefund: String(computed)
																		}));
																	}
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																	className: "text-[10px] font-semibold text-teal-900",
																	children: "Total Days in Month"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																	type: "number",
																	min: 28,
																	max: 31,
																	className: "h-8 text-xs font-mono border-teal-300 bg-background",
																	value: completeCheckoutForm.totalDaysInMonth,
																	onChange: (e) => {
																		const dTot = parseInt(e.target.value) || 30;
																		const dOcc = parseInt(completeCheckoutForm.daysOccupiedInMonth) || 0;
																		const computed = completeCheckoutForm.currentMonthPdcDeposited && _rent > 0 ? Math.round(_rent / dTot * Math.max(0, dTot - dOcc)) : 0;
																		setCompleteCheckoutForm((f) => ({
																			...f,
																			totalDaysInMonth: e.target.value,
																			unusedRentRefund: String(computed)
																		}));
																	}
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																	className: "text-[10px] font-semibold text-teal-900",
																	children: "Current Month PDC Deposited?"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "flex gap-1.5 pt-0.5",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																		type: "button",
																		onClick: () => {
																			const computed = _rent > 0 ? Math.round(_rent / _dTot * Math.max(0, _dTot - _dOcc)) : 0;
																			setCompleteCheckoutForm((f) => ({
																				...f,
																				currentMonthPdcDeposited: true,
																				unusedRentRefund: String(computed)
																			}));
																		},
																		className: `flex-1 rounded border px-2 py-1.5 text-[11px] font-bold transition-all ${_isPdc ? "border-teal-600 bg-teal-600 text-white shadow-sm" : "border-border bg-background text-muted-foreground hover:border-teal-400 hover:text-teal-700"}`,
																		children: "✓ Yes"
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																		type: "button",
																		onClick: () => setCompleteCheckoutForm((f) => ({
																			...f,
																			currentMonthPdcDeposited: false,
																			unusedRentRefund: "0"
																		})),
																		className: `flex-1 rounded border px-2 py-1.5 text-[11px] font-bold transition-all ${!_isPdc ? "border-red-500 bg-red-500 text-white shadow-sm" : "border-border bg-background text-muted-foreground hover:border-red-400 hover:text-red-600"}`,
																		children: "✗ No"
																	})]
																})]
															})
														]
													}),
													_isPdc && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "grid grid-cols-2 gap-2 pt-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "bg-teal-100 border border-teal-300 rounded p-2 space-y-0.5",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "font-semibold text-teal-900 block text-[10px]",
																	children: "Auto-Calculated Unused Rent"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "font-mono text-teal-800 text-sm font-bold",
																	children: ["QAR ", _computedUnused.toLocaleString()]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "text-teal-700 block text-[10px]",
																	children: [
																		"= QAR ",
																		_rent.toLocaleString(),
																		" ÷ ",
																		_dTot,
																		"d × ",
																		Math.max(0, _dTot - _dOcc),
																		"d unused"
																	]
																})
															]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																className: "text-[10px] font-semibold text-teal-900",
																children: "Override Unused Rent (QAR)"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "number",
																step: "0.01",
																min: 0,
																className: "h-8 text-xs font-mono border-teal-300 bg-background",
																value: completeCheckoutForm.unusedRentRefund,
																onChange: (e) => setCompleteCheckoutForm((f) => ({
																	...f,
																	unusedRentRefund: e.target.value
																}))
															})]
														})]
													})
												]
											});
										})()
									]
								}),
								checkoutActiveTab === "clearances" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border bg-muted/30 p-3 space-y-2 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-muted-foreground uppercase tracking-wider text-[11px]",
											children: "Inter-Departmental Clearances"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2 pt-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "flex items-center gap-2.5 p-2 rounded-md border bg-background cursor-pointer hover:bg-muted/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "checkbox",
														checked: completeCheckoutForm.financeClearance,
														onChange: (e) => setCompleteCheckoutForm((f) => ({
															...f,
															financeClearance: e.target.checked
														})),
														className: "h-4 w-4 rounded accent-primary"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold block",
														children: "Finance & Accounts Clearance"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[11px] text-muted-foreground",
														children: "All rental dues, bounced cheques, and legal matters cleared."
													})] })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "flex items-center gap-2.5 p-2 rounded-md border bg-background cursor-pointer hover:bg-muted/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "checkbox",
														checked: completeCheckoutForm.utilityClearance,
														onChange: (e) => setCompleteCheckoutForm((f) => ({
															...f,
															utilityClearance: e.target.checked
														})),
														className: "h-4 w-4 rounded accent-primary"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold block",
														children: "Kahramaa & Utility Clearance"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[11px] text-muted-foreground",
														children: "Final electricity and water meter bill settled with provider."
													})] })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "flex items-center gap-2.5 p-2 rounded-md border bg-background cursor-pointer hover:bg-muted/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "checkbox",
														checked: completeCheckoutForm.keysReturned,
														onChange: (e) => setCompleteCheckoutForm((f) => ({
															...f,
															keysReturned: e.target.checked
														})),
														className: "h-4 w-4 rounded accent-primary"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold block",
														children: "Key & Access Device Handback"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[11px] text-muted-foreground",
														children: "All door keys, building access cards, and parking remotes received."
													})] })]
												})
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border bg-blue-50/60 border-blue-200 p-3 text-xs text-blue-900 space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold block",
											children: "📜 Settlement Statement Ready for Sign-Off"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[11px]",
											children: [
												"Submitting this form will finalize the Move-Out inspection, update the checkout case to ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold",
													children: "Ready For Settlement"
												}),
												", and generate the final deposit refund record."
											]
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "gap-2 border-t pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setCompleteCheckoutOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => selectedCheckout && completeCheckout(selectedCheckout),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "mr-2 h-4 w-4" }), " Complete & Generate Settlement"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: addPdcOpen,
				onOpenChange: setAddPdcOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[1000px] max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Manual Bulk PDC / Cheque Entry"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: "Register up to 12 post-dated cheques with maturity, tenure periods, and scan attachments."
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 overflow-y-auto space-y-4 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Select Lease Contract *",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: pdcLeaseId,
									onValueChange: setPdcLeaseId,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "bg-background",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select lease" })
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
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border bg-muted/20 p-4 space-y-2.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5 text-primary" }), " Cheque Schedule Rows"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "Leave empty rows to skip"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-[2fr_2fr_2fr_2fr_3fr_2fr] gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Cheque No." }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bank" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Maturity Date" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Amount (QR)" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tenure (Start & End)" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Cheque Scan" })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "space-y-2 max-h-[360px] overflow-y-auto pr-1",
										children: pdcRows.map((row, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-[2fr_2fr_2fr_2fr_3fr_2fr] gap-2 items-center text-sm p-1.5 rounded-lg bg-background border hover:border-primary/40 transition-colors",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: row.chequeNo,
													onChange: (e) => handlePdcRowChange(idx, "chequeNo", e.target.value),
													placeholder: `PDC-${idx + 1}`,
													className: "h-8 text-xs"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: row.bank,
													onChange: (e) => handlePdcRowChange(idx, "bank", e.target.value),
													placeholder: "Bank",
													className: "h-8 text-xs"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "date",
													value: row.maturityDate,
													onChange: (e) => handlePdcRowChange(idx, "maturityDate", e.target.value),
													className: "h-8 text-xs"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: row.amount,
													onChange: (e) => handlePdcRowChange(idx, "amount", e.target.value),
													placeholder: "Amount",
													className: "h-8 text-xs font-mono font-bold"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "date",
														value: row.tenureStart,
														onChange: (e) => handlePdcRowChange(idx, "tenureStart", e.target.value),
														title: "Start Date",
														className: "h-8 text-[11px] px-1"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "date",
														value: row.tenureEnd,
														onChange: (e) => handlePdcRowChange(idx, "tenureEnd", e.target.value),
														title: "End Date",
														className: "h-8 text-[11px] px-1"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "file",
													onChange: (e) => handlePdcRowChange(idx, "file", e.target.files?.[0]?.name || ""),
													className: "h-8 text-[11px] cursor-pointer"
												})
											]
										}, idx))
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setAddPdcOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: addManualPdc,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "mr-2 h-4 w-4" }), " Save PDC Records"]
							})]
						})
					]
				})
			}),
			activeTab === "customers" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold tracking-tight",
					children: "Customer Master"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Manage individual & corporate tenants, KYC verification, duplicate checks and contacts."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: () => setBulkCustomerOpen(true),
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-4 w-4 text-primary" }), " Excel Bulk Import / Manage"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setCreateCustomerOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "mr-2 h-4 w-4" }), " Add Customer"]
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Total Customers",
						value: (customers || []).length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-emerald-600" }),
						description: "Active tenant profiles"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Individual Tenants",
						value: (customers || []).filter((c) => c?.type === "individual").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-4 w-4 text-blue-600" }),
						description: "Personal residential leases"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Corporate Accounts",
						value: (customers || []).filter((c) => c?.type === "company").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 text-indigo-600" }),
						description: "Commercial & bulk company leases"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Active Status",
						value: (customers || []).filter((c) => c?.status === "active").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-green-600" }),
						description: "Verified & active customers"
					})
				]
			})] }),
			activeTab === "reservations" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold tracking-tight",
					children: "Unit Reservations"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Lock available units for prospective tenants with validity limits and conversion controls."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setCreateReservationOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mr-2 h-4 w-4" }), " Create Reservation"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Active Reserved",
						value: activeReservations,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 text-blue-600" }),
						description: "Currently held units"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Converted to Lease",
						value: (reservations || []).filter((r) => r?.status === "converted").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-emerald-600" }),
						description: "Successfully converted"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Released / Expired",
						value: (reservations || []).filter((r) => r?.status === "released" || r?.validUntil && isExpired(r.validUntil)).length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 text-amber-600" }),
						description: "Released back to inventory"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Total Reservations",
						value: (reservations || []).length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoorOpen, { className: "h-4 w-4 text-purple-600" }),
						description: "Historical bookings logged"
					})
				]
			})] }),
			activeTab === "documents" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold tracking-tight",
					children: "Document Verification"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Verify mandatory QID, Passport, CR, and salary documents before lease generation."
				})] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Verified Documents",
						value: (documents || []).filter((d) => d?.status === "verified").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-green-600" }),
						description: "Compliant & approved"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Document Blocks",
						value: blockedDocuments,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 text-amber-600" }),
						description: "Mandatory docs pending review"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Info Required / Rejected",
						value: (documents || []).filter((d) => d?.status === "info_required" || d?.status === "rejected").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-4 w-4 text-red-600" }),
						description: "Requires tenant resubmission"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Total Documents",
						value: (documents || []).length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 text-blue-600" }),
						description: "Tenant KYC files tracked"
					})
				]
			})] }),
			activeTab === "agreement" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold tracking-tight",
					children: "Lease Agreement Terms"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Configure payment schedules, PDC terms, maintenance responsibilities and notice periods."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: () => setBulkLeaseOpen(true),
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-4 w-4 text-primary" }), " Excel Bulk Import / Manage"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setCreateLeaseOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "mr-2 h-4 w-4" }), " Create Lease"]
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Total Agreements",
						value: (leases || []).length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-4 w-4 text-emerald-600" }),
						description: "All contract records"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Active Contracts",
						value: (leases || []).filter((l) => l?.status === "active" || l?.status === "fully_signed").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-blue-600" }),
						description: "Live tenancy contracts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Draft / In-Review",
						value: (leases || []).filter((l) => l?.status === "documents_pending" || l?.status === "documents_verified" || l?.status === "tenant_signed_pending_collection").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-amber-600" }),
						description: "Pending execution"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Total Monthly Rent",
						value: formatMoney((leases || []).reduce((sum, l) => sum + (Number(l?.monthlyRent) || 0), 0)),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-4 w-4 text-indigo-600" }),
						description: "Contracted monthly roll"
					})
				]
			})] }),
			activeTab === "signatures" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold tracking-tight",
					children: "Signatures & Collection Workflow"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Gate execution with tenant digital/ink signature, security deposit & PDC collection, and landlord countersign."
				})] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Pending Collection",
						value: (leases || []).filter((l) => !l?.collectionCompleted).length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-4 w-4 text-amber-600" }),
						description: "PDCs / Deposit not yet collected"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Collections Completed",
						value: (leases || []).filter((l) => l?.collectionCompleted).length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-green-600" }),
						description: "Receipts generated & locked"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Fully Signed",
						value: (leases || []).filter((l) => l?.status === "fully_signed" || l?.status === "active").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-4 w-4 text-emerald-600" }),
						description: "Tenant & Landlord executed"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Pending Signatures",
						value: (leases || []).filter((l) => l?.status === "tenant_signed_pending_collection" || l?.status === "pending_landlord_signature" || l?.status === "documents_pending").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-blue-600" }),
						description: "Awaiting bilateral signatures"
					})
				]
			})] }),
			activeTab === "keys" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold tracking-tight",
					children: "Keys Handover & Check-In"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Formal key issue notice, access cards, meter readings, inventory verification, and check-in inspection."
				})] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Ready For Keys",
						value: readyForKeys,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-4 w-4 text-green-600" }),
						description: "Fully signed & collected"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Key Notices Issued",
						value: (keyNotices || []).length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-blue-600" }),
						description: "Handover notices sent"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Handover Completed",
						value: (handovers || []).length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "h-4 w-4 text-emerald-600" }),
						description: "Keys & access devices issued"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Inspections Verified",
						value: (inspections || []).filter((i) => i?.type === "check_in").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-4 w-4 text-indigo-600" }),
						description: "Condition checklists logged"
					})
				]
			})] }),
			activeTab === "vouchers" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold tracking-tight",
					children: "Leasing Vouchers & Receipts"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Rent receipts, security deposit liabilities, PDC clearances, and settlement documents synced to Finance."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => setBulkPdcOpen(true),
							className: "gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "h-4 w-4 text-primary" }), " Bulk PDCs"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => setBulkDepositOpen(true),
							className: "gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "h-4 w-4 text-primary" }), " Bulk Deposits"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => {
								setAddVoucherForm((f) => ({
									...f,
									leaseId: (leases || [])[0]?.id || ""
								}));
								setAddVoucherOpen(true);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "mr-2 h-4 w-4" }), " + Add Voucher"]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Total Vouchers",
						value: (vouchers || []).length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-4 w-4 text-blue-600" }),
						description: "All leasing accounting records"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Posted Vouchers",
						value: (vouchers || []).filter((v) => v?.status === "posted").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-green-600" }),
						description: "Synced to General Ledger"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Draft / In-Process",
						value: (vouchers || []).filter((v) => v?.status === "draft").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-amber-600" }),
						description: "Pending posting/review"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Total Value",
						value: formatMoney((vouchers || []).reduce((s, v) => s + (Number(v?.amount) || 0), 0)),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-4 w-4 text-indigo-600" }),
						description: "Aggregate voucher amount"
					})
				]
			})] }),
			activeTab === "renewals" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold tracking-tight",
					children: "Lease Renewals & Expiry Tracking"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Automatic 60-day lease expiry alerts, rent increase proposals, negotiations, and renewal notices."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setRenewalNoticeOpen(true),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "mr-2 h-4 w-4" }),
						"Generate Renewal Notices",
						upcomingRenewals.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-bold",
							children: upcomingRenewals.length
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Expiring in 60 Days",
						value: upcomingRenewals.length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "h-4 w-4 text-rose-600" }),
						description: "Upcoming lease expiries"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Renewal Confirmed",
						value: (renewals || []).filter((r) => r?.status === "renewal_confirmed").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-green-600" }),
						description: "Agreed to renew"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "In Discussion / Awaiting",
						value: (renewals || []).filter((r) => r?.status === "under_discussion" || r?.status === "awaiting_response").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-amber-600" }),
						description: "Active negotiation"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Non-Renewal Confirmed",
						value: (renewals || []).filter((r) => r?.status === "non_renewal_confirmed").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4 text-slate-600" }),
						description: "Proceeding to checkout"
					})
				]
			})] }),
			activeTab === "checkout" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold tracking-tight",
					children: "Check-Out & Settlement"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Move-out inspections, utility clearances, damage deductions, and security deposit settlements."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "bg-rose-600 hover:bg-rose-700 text-white",
					onClick: () => {
						const activeLease = (leases || []).find((l) => l?.status !== "checkout" && l?.status !== "closed") || (leases || [])[0];
						if (activeLease) {
							setCheckoutWorkflowLease(activeLease);
							setStartCheckoutForm({
								noticeDate: today instanceof Date ? today.toISOString().split("T")[0] : "",
								moveOutDate: today instanceof Date ? today.toISOString().split("T")[0] : "",
								inspectionDate: today instanceof Date ? today.toISOString().split("T")[0] : "",
								outstandingCharges: "Pending finance confirmation",
								utilityClearanceRequirements: "Final utility clearance required before checkout closure",
								keyReturnRequirements: "Return all keys, access cards, parking remotes and property items",
								notes: "Tenant requested early vacating / checkout",
								missingItems: "",
								cleaningCharges: "0",
								restorationCharges: "0"
							});
							setStartCheckoutOpen(true);
						} else alert("No active lease found to initiate vacate.");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "mr-2 h-4 w-4" }), " + Initiate Vacate / Check-Out"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Active Check-Outs",
						value: (settlements || []).filter((s) => s?.approval !== "paid").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4 text-amber-600" }),
						description: "Move-outs in progress"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Open Settlements",
						value: openSettlements,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-4 w-4 text-red-600" }),
						description: "Pending deposit refunds"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Completed / Settled",
						value: (settlements || []).filter((s) => s?.approval === "paid").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-green-600" }),
						description: "Fully settled & closed"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Check-Out Inspections",
						value: (inspections || []).filter((i) => i?.type === "check_out").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-4 w-4 text-blue-600" }),
						description: "Move-out audits filed"
					})
				]
			})] }),
			activeTab === "audit" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold tracking-tight",
					children: "SRS Workflow & Audit Flow"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Full immutable audit trail across reservation, KYC verification, contracts, keys, and settlements."
				})] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Audit Events Logged",
						value: (auditEvents || []).length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-indigo-600" }),
						description: "Immutable system events"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Completed Actions",
						value: (auditEvents || []).filter((a) => a?.status === "completed" || a?.status === "approved").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-green-600" }),
						description: "Approved transitions"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Pending Approvals",
						value: (auditEvents || []).filter((a) => a?.status === "pending" || a?.status === "in_review").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-amber-600" }),
						description: "Awaiting action"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Active Leases",
						value: (leases || []).filter((l) => l?.status === "active").length,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-4 w-4 text-blue-600" }),
						description: "Governed portfolio units"
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: activeTab,
				onValueChange: handleTabChange,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "reservations",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Unit Reservation - Lease Module" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Reserving a unit locks it from Available to Reserved until conversion, expiry or release." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
							columns: [
								"Unit",
								"Tenant",
								"Valid Until",
								"Rent",
								"Status",
								"Actions"
							],
							rows: (reservations || []).map((reservation) => [
								reservation?.unit || "-",
								reservation?.tenantName || "-",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: reservation?.validUntil && isExpired(reservation.validUntil) && reservation.status === "reserved" ? "text-red-600" : "",
									children: reservation?.validUntil || "-"
								}),
								formatMoney(reservation?.rent),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: reservation?.status }, "status"),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-end gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										disabled: reservation?.status !== "reserved",
										onClick: () => openCreateLeaseDialog(reservation),
										children: "Create Lease"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										disabled: reservation?.status !== "reserved",
										onClick: () => openReleaseDialog(reservation),
										children: "Release"
									})]
								}, "actions")
							])
						}) })] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "customers",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Customer Master With Duplicate Validation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Duplicate checks run across Qatar ID, passport, CR number, mobile and email before activation." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
							columns: [
								"Name",
								"Type",
								"Primary ID",
								"Contact",
								"Status",
								"Actions"
							],
							rows: (customers || []).map((customer) => [
								customer?.name || "-",
								customer?.type || "individual",
								customer?.qatarId || customer?.passport || customer?.crNumber || "-",
								`${customer?.mobile || "-"} / ${customer?.email || "-"}`,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: customer?.status }, "status"),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-end gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => {
											setViewCustomerData(customer);
											setViewCustomerOpen(true);
										},
										children: "View"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => {
											setEditCustomerData(customer);
											setCustomerForm({
												name: customer?.name || "",
												type: customer?.type || "individual",
												qatarId: customer?.qatarId || "",
												passport: customer?.passport || "",
												crNumber: customer?.crNumber || "",
												nationality: customer?.nationality || "",
												mobile: customer?.mobile || "",
												email: customer?.email || "",
												permanentAddress: customer?.permanentAddress || "",
												localAddress: customer?.localAddress || "",
												authorizedSignatory: customer?.authorizedSignatory || "",
												emergencyContact: customer?.emergencyContact || "",
												employerInfo: customer?.employerInfo || ""
											});
											setEditCustomerOpen(true);
										},
										children: "Edit"
									})]
								}, "actions")
							])
						}) })] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "documents",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Document Verification & Approval" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Mandatory documents must be verified before the lease can move beyond document gates." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
							columns: [
								"Customer",
								"Document",
								"Mandatory",
								"Expiry",
								"Status",
								"Reviewer",
								"Actions"
							],
							rows: (documents || []).map((document) => {
								return [
									(customers || []).find((item) => item?.id === document?.customerId)?.name || "-",
									document?.name || "Document",
									document?.mandatory ? "Yes" : "No",
									document?.expiryDate || "-",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: document?.status }), document?.file && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted-foreground",
											children: [
												"(",
												document.file,
												")"
											]
										})]
									}, "status"),
									document?.reviewer || "-",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-end gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => {
													setSelectedDocId(document?.id);
													setUploadDocForm({
														file: "",
														fileName: "",
														remarks: ""
													});
													setUploadDocOpen(true);
												},
												children: "Upload"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => {
													setSelectedDocId(document?.id);
													setVerifyDocForm({
														status: "verified",
														expiryDate: "",
														remarks: ""
													});
													setVerifyDocOpen(true);
												},
												children: "Verify"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => {
													setSelectedDocId(document?.id);
													setVerifyDocForm({
														status: "info_required",
														expiryDate: "",
														remarks: ""
													});
													setVerifyDocOpen(true);
												},
												children: "Need Info"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => {
													setSelectedDocId(document?.id);
													setVerifyDocForm({
														status: "rejected",
														expiryDate: "",
														remarks: ""
													});
													setVerifyDocOpen(true);
												},
												children: "Reject"
											})
										]
									}, "actions")
								];
							})
						}) })] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "agreement",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Lease Agreement Terms & Payment Schedule Rules" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Agreement data now includes payment frequency, PDC count, grace/penalty terms, maintenance, utilities, parking, special clauses and notice period." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
							columns: [
								"Lease",
								"Rent / Frequency",
								"PDCs",
								"Grace / Penalty",
								"Responsibilities",
								"Facilities / Clauses",
								"Renewal Notice",
								"Actions"
							],
							rows: (leases || []).map((lease) => [
								`${lease?.tenantName || "Tenant"} / ${lease?.unit || "Unit"} (${lease?.property || "Property"})`,
								`${formatMoney(lease?.monthlyRent)} / ${(lease?.paymentFrequency || "monthly").replace("_", " ")}`,
								`${lease?.pdcCount || 12} cheques`,
								`${lease?.gracePeriodDays || 7} days / ${lease?.penalties || "5%"}`,
								`Maintenance: ${lease?.maintenanceResponsibility || "Landlord"}; Utilities: ${lease?.utilityResponsibility || "Tenant"}`,
								`${lease?.parkingDetails || "Dedicated Parking"}; ${lease?.specialConditions || "Standard Tenancy"}`,
								`${lease?.noticePeriodDays || 60} days`,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex justify-end",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => {
											if (!lease?.id) return;
											setSelectedLeaseForTerms(lease.id);
											setAgreementTermsForm({
												paymentFrequency: lease.paymentFrequency,
												pdcCount: lease.pdcCount,
												gracePeriodDays: lease.gracePeriodDays,
												penalties: lease.penalties,
												maintenanceResponsibility: lease.maintenanceResponsibility,
												utilityResponsibility: lease.utilityResponsibility,
												parkingDetails: lease.parkingDetails,
												specialConditions: lease.specialConditions,
												noticePeriodDays: lease.noticePeriodDays
											});
											setEditTermsOpen(true);
										},
										children: "Edit Terms"
									})
								}, "actions")
							])
						}) })] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "signatures",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Lease Signature & Collection Workflow" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Actions are gated by document verification, collection receipt and landlord signature." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
							columns: [
								"Lease",
								"Tenant",
								"Period",
								"Deposit",
								"Status",
								"Signature Package",
								"Actions"
							],
							rows: (leases || []).map((lease) => {
								return [
									`${lease?.property || "Property"} / ${lease?.unit || "Unit"}`,
									lease?.tenantName || "Tenant",
									`${lease?.startDate || "-"} to ${lease?.endDate || "-"}`,
									formatMoney(lease?.securityDeposit),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: lease?.status }, "status"),
									`Agreement: ${lease?.signedDocument || "-"}; shared: ${lease?.sharedWithTenant ? "Yes" : "No"}`,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap justify-end gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => downloadLeaseAgreement(lease),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 h-4 w-4" }), "Download Agreement"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => {
													setSignatureWorkflowLease(lease);
													setUploadAgreementForm({
														file: "",
														fileName: "",
														remarks: ""
													});
													setUploadAgreementOpen(true);
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-2 h-4 w-4" }), "Upload Agreement"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												disabled: lease?.collectionCompleted,
												title: lease?.collectionCompleted ? "Collection already recorded — cannot re-collect" : void 0,
												onClick: () => {
													setSignatureWorkflowLease(lease);
													const count = lease?.pdcCount || 12;
													const totalRent = (lease?.monthlyRent || 0) * count;
													const regAmt = lease?.monthlyRent || 0;
													function addMonthToDate(baseDateStr, monthOffset) {
														const d = new Date(baseDateStr);
														if (isNaN(d.getTime())) return today.toISOString().split("T")[0];
														const day = d.getDate();
														const targetMonthRaw = d.getMonth() + monthOffset;
														const targetYear = d.getFullYear() + Math.floor(targetMonthRaw / 12);
														const targetMonth = (targetMonthRaw % 12 + 12) % 12;
														const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
														const finalDay = Math.min(day, lastDay);
														return `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(finalDay).padStart(2, "0")}`;
													}
													const leaseStartStr = lease?.startDate || today.toISOString().split("T")[0];
													const firstChequeStr = leaseStartStr;
													const generated = Array.from({ length: count }, (_, i) => {
														let amount = regAmt;
														if (i === count - 1 && count > 1) amount = Math.max(0, totalRent - regAmt * (count - 1));
														const tsDate = new Date(leaseStartStr);
														tsDate.setMonth(tsDate.getMonth() + i);
														const tenureStartStr = !isNaN(tsDate.getTime()) ? tsDate.toISOString().split("T")[0] : leaseStartStr;
														const teDate = new Date(leaseStartStr);
														teDate.setMonth(teDate.getMonth() + i + 1);
														teDate.setDate(teDate.getDate() - 1);
														const tenureEndStr = !isNaN(teDate.getTime()) ? teDate.toISOString().split("T")[0] : leaseStartStr;
														const maturityStr = addMonthToDate(firstChequeStr, i);
														return {
															chequeNo: `PDC-${(lease?.unit || "Unit").replace(/\W/g, "")}-${String(i + 1).padStart(3, "0")}`,
															bank: "QNB",
															date: maturityStr,
															amount,
															period: `Cheque ${i + 1} of ${count}`,
															tenureStart: tenureStartStr,
															tenureEnd: tenureEndStr,
															file: ""
														};
													});
													setCollectForm({
														paymentMode: "PDC",
														chequeBank: "QNB",
														payerName: lease?.tenantName || "Tenant",
														depositAmount: String(lease?.securityDeposit || 0),
														depositMode: "Cash",
														depositChequeNo: "",
														depositChequeBank: "",
														utilityDeposit: "",
														qatarCoolDeposit: "",
														reservationDeposit: "",
														serviceFeeDeposit: "",
														guaranteeChequeDeposit: "",
														guaranteeChequeNo: "",
														guaranteeChequeBank: "QNB",
														agencyCommission: "",
														adminCharges: "",
														cashierName: "",
														notes: "",
														receiptFile: "",
														pdcCount: count,
														startDate: lease?.startDate || "",
														endDate: lease?.endDate || "",
														firstChequeDate: lease?.startDate || "",
														regularChequeAmount: String(lease?.monthlyRent || 0),
														customCheques: generated
													});
													setCollectOpen(true);
												},
												children: lease?.collectionCompleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mr-1 h-3 w-3" }), "Collected"] }) : "Collect"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												disabled: !lease?.collectionCompleted,
												title: !lease?.collectionCompleted ? "Receipt is generated once all PDCs and Security Deposits are collected" : void 0,
												className: lease?.collectionCompleted ? "text-primary border-primary/50 gap-1" : "gap-1 opacity-50",
												onClick: () => {
													if (!lease) return;
													const leasePdcs = (pdcs || []).filter((p) => p.leaseId === lease.id);
													const leaseVouchers = (vouchers || []).filter((v) => v.leaseId === lease.id);
													const pdcTot = leasePdcs.reduce((s, p) => s + (p.amount || 0), 0) || (lease.monthlyRent || 0) * (lease.pdcCount || 12);
													const totalCol = pdcTot + (lease.securityDeposit || 0);
													setReceiptModalData({
														receiptNo: `REC-${(lease.id || "").toUpperCase()}`,
														acknowledgementNo: `ACK-${(lease.id || "").toUpperCase()}`,
														date: lease.startDate || (today instanceof Date ? today.toISOString().split("T")[0] : ""),
														tenantName: lease.tenantName || "Tenant",
														tenantPhone: lease.phone || "",
														tenantEmail: lease.email || "",
														tenantQid: lease.qatarId || "",
														propertyName: lease.property || "",
														unitRef: lease.unit || "",
														leaseNo: `LES-${(lease.id || "").toUpperCase()}`,
														leaseStartDate: lease.startDate || "",
														leaseEndDate: lease.endDate || "",
														monthlyRent: lease.monthlyRent || 0,
														totalContractRent: pdcTot,
														depositAmount: lease.securityDeposit || 0,
														depositMode: "Cash / PDC",
														pdcCount: leasePdcs.length || lease.pdcCount || 12,
														pdcs: leasePdcs.length > 0 ? leasePdcs.map((p, idx) => ({
															chequeNo: p.chequeNo || "",
															bank: p.bank || "QNB",
															date: p.date || "",
															amount: p.amount || 0,
															period: p.period || (p.tenureStart && p.tenureEnd ? `${p.tenureStart} to ${p.tenureEnd}` : `Cheque ${idx + 1}`),
															tenureStart: p.tenureStart || addDays(new Date(lease.startDate || today), idx * 30),
															tenureEnd: p.tenureEnd || addDays(new Date(lease.startDate || today), idx * 30 + 29)
														})) : Array.from({ length: lease.pdcCount || 12 }, (_, i) => ({
															chequeNo: `PDC-${(lease.unit || "").replace(/\W/g, "")}-${String(i + 1).padStart(3, "0")}`,
															bank: "QNB",
															date: addDays(new Date(lease.startDate || today), i * 30),
															amount: i === (lease.pdcCount || 12) - 1 ? Math.max(0, pdcTot - (lease.monthlyRent || 0) * ((lease.pdcCount || 12) - 1)) : lease.monthlyRent || 0,
															period: `${addDays(new Date(lease.startDate || today), i * 30)} to ${addDays(new Date(lease.startDate || today), i * 30 + 29)}`,
															tenureStart: addDays(new Date(lease.startDate || today), i * 30),
															tenureEnd: addDays(new Date(lease.startDate || today), i * 30 + 29)
														})),
														vouchers: leaseVouchers.map((v) => ({
															receiptNo: v.receiptNo,
															name: v.name,
															amount: v.amount,
															method: v.method,
															debit: v.debit,
															credit: v.credit
														})),
														totalCollected: totalCol,
														cashierName: "Finance Cashier",
														notes: "Official receipt acknowledged for lease security deposit and rent PDC schedule."
													});
													setReceiptModalOpen(true);
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" }), " View Receipt"]
											})
										]
									}, "actions")
								];
							})
						}) })] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "keys",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Key Issue, Handover & Check-In" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "No key issue is allowed unless collection is complete and the lease is fully signed." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
							columns: [
								"Lease",
								"Status",
								"Key Notice",
								"Handover",
								"Check-In",
								"Actions"
							],
							rows: (leases || []).map((lease) => {
								const notice = (keyNotices || []).find((item) => item.leaseId === lease?.id);
								const handover = (handovers || []).find((item) => item.leaseId === lease?.id);
								const checkIn = (inspections || []).find((item) => item.leaseId === lease?.id && item.type === "check_in");
								return [
									`${lease?.tenantName || "Tenant"} / ${lease?.unit || "Unit"}`,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: lease?.status }, "status"),
									notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: notice.status }), notice.handoverAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted-foreground",
											children: [
												notice.handoverAt,
												" ",
												notice.handoverTime || ""
											]
										})]
									}, "notice") : "-",
									handover ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full px-2 py-0.5 w-fit",
												children: "✅ Handed Over"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs text-muted-foreground",
												children: [
													handover.keys || 0,
													"× ",
													handover.keyType || "keys",
													" · ",
													handover.accessCards || 0,
													" cards"
												]
											}),
											handover.handoverAt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: handover.handoverAt
											})
										]
									}, "handover") : "-",
									checkIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full px-2 py-0.5 w-fit",
											children: "🏠 Checked In"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted-foreground",
											children: [
												checkIn.condition || "Good",
												" · ",
												checkIn.photos || 0,
												" photos"
											]
										})]
									}, "checkin") : "-",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-end gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => {
													setKeysWorkflowLease(lease);
													setKeyNotifyForm({
														handoverAt: addDays(today, 1),
														handoverTime: "10:00",
														recipients: [
															"Tenant",
															"Property Manager",
															"Concerned Property Staff",
															"Security",
															"Maintenance"
														],
														authorizedCollector: lease?.tenantName || "",
														keysSummary: "2 metal keys, 2 access cards, 1 parking remote",
														staffContact: "Property Manager - +974 4400 2200",
														outstandingRequirements: "None",
														note: ""
													});
													setKeyNotifyOpen(true);
												},
												children: "Notify"
											}),
											handover ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												className: "border-green-300 text-green-700 hover:bg-green-50",
												onClick: () => {
													setSelectedHandover(handover);
													setHandoverViewOpen(true);
												},
												children: "View"
											}) : null,
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => {
													setKeysWorkflowLease(lease);
													setHandoverActiveTab("details");
													setHandoverForm({
														handoverAt: notice?.handoverAt || addDays(today, 1),
														handoverTime: notice?.handoverTime || "10:00",
														keys: "2",
														keyType: "Metal door keys",
														accessCards: "2",
														parkingRemotes: "1",
														parkingDeviceDetails: "Remote for covered parking bay",
														electricityMeterReading: handover?.electricityMeterReading || "",
														waterMeterReading: handover?.waterMeterReading || "",
														issuedBy: "Property Manager",
														collectorName: notice?.authorizedCollector || lease?.tenantName || "",
														collectorIdNumber: "",
														unitCondition: "Good",
														cleanliness: "Clean",
														acWorking: true,
														plumbingOk: true,
														electricalOk: true,
														doorsWindowsOk: true,
														idVerified: true,
														photosTaken: "6",
														handoverPhotos: "",
														checklistDocument: "",
														assetChecklist: "",
														financeConfirmed: false,
														propertyManagerConfirmed: true,
														tenantConfirmed: false,
														tenantAcknowledgement: "Tenant acknowledged receipt of keys and access items.",
														note: ""
													});
													setCheckInForm({
														condition: "Good",
														furnitureCondition: "Good",
														fixturesCondition: "Good",
														wallFloorCeilingCondition: "Good",
														acCondition: "Operational",
														electricityMeter: handover?.electricityMeterReading || "",
														waterMeter: handover?.waterMeterReading || "",
														damages: "",
														pendingMaintenance: "",
														photos: "8",
														note: ""
													});
													setHandoverOpen(true);
												},
												children: "Handover & Check-In"
											})
										]
									}, "actions")
								];
							})
						}) })] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "renewals",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Lease Renewal Notification & Process" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "The system detects leases within 60 days of expiry and tracks tenant response." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
							columns: [
								"Lease",
								"Expiry",
								"Recipients",
								"Proposed Terms",
								"Last Confirmation",
								"Obligations",
								"Status",
								"Actions"
							],
							rows: (renewals || []).map((renewal) => {
								const lease = (leases || []).find((item) => item.id === renewal.leaseId);
								return [
									lease ? `${lease.tenantName} / ${lease.unit}` : "-",
									lease?.endDate || "-",
									renewal?.recipients || "-",
									`${renewal?.proposedPeriod || ""}; ${formatMoney(renewal?.proposedRent)}; ${renewal?.revisedTerms || ""}`,
									renewal?.lastConfirmationDate || "-",
									renewal?.outstandingObligations || "-",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: renewal?.status }, "status"),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-end gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												disabled: renewal?.status === "renewal_confirmed" || renewal?.status === "non_renewal_confirmed",
												onClick: () => {
													setSelectedDiscussRenewal(renewal);
													setDiscussRenewalForm({
														discussedRent: String(renewal?.proposedRent || 0),
														proposedPeriod: renewal?.proposedPeriod || "",
														tenantResponse: "pending",
														notes: "",
														nextFollowUpDate: renewal?.lastConfirmationDate || ""
													});
													setDiscussRenewalOpen(true);
												},
												children: "Discuss"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												disabled: renewal?.status === "renewal_confirmed" || renewal?.status === "non_renewal_confirmed",
												onClick: () => {
													setSelectedRenewal(renewal);
													setRenewalResponseForm({
														response: "confirm",
														confirmedRent: String(renewal?.proposedRent || 0),
														notes: "",
														updateStatus: "awaiting_response"
													});
													setRenewalResponseOpen(true);
												},
												children: "Renew"
											}),
											lease && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												disabled: renewal?.status === "renewal_confirmed" || renewal?.status === "non_renewal_confirmed",
												onClick: () => {
													setCheckoutWorkflowLease(lease);
													setStartCheckoutForm({
														noticeDate: today instanceof Date ? today.toISOString().split("T")[0] : "",
														moveOutDate: lease.endDate || "",
														inspectionDate: addDays(new Date(lease.endDate || today), -3),
														outstandingCharges: "Pending finance confirmation",
														utilityClearanceRequirements: "Final utility clearance required before checkout closure",
														keyReturnRequirements: "Return all keys, access cards, parking remotes and property items",
														notes: "",
														missingItems: "",
														cleaningCharges: "0",
														restorationCharges: "0"
													});
													setStartCheckoutOpen(true);
													setRenewals((items) => (items || []).map((item) => item.id === renewal.id ? {
														...item,
														status: "non_renewal_confirmed"
													} : item));
												},
												children: "Non-Renew"
											})
										]
									}, "actions")
								];
							})
						}) })] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "checkout",
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "border-border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
									className: "pb-3 pt-4 px-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
											className: "text-base font-semibold",
											children: "Non-Renewal, Check-Out & Security Deposit Settlement"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
											className: "text-xs",
											children: "Initiate tenant move-out/early vacating, complete inspections, verify clearances, and settle security deposits."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex items-center gap-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "ghost",
												className: "h-8 text-xs text-muted-foreground gap-1",
												onClick: () => {
													setCheckoutPropertyFilter("all");
													setCheckoutUnitFilter("all");
													setCheckoutCustomerFilter("all");
													setCheckoutStatusFilter("all");
													setCheckoutSearchQuery("");
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3 w-3" }), " Reset Filters"]
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: checkoutPropertyFilter,
												onValueChange: setCheckoutPropertyFilter,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs bg-background",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Properties" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "all",
													children: "All Properties"
												}), Array.from(new Set(leases.map((l) => l.property).filter(Boolean))).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: p,
													children: p
												}, p))] })]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: checkoutUnitFilter,
												onValueChange: setCheckoutUnitFilter,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs bg-background",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Units" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "all",
													children: "All Units"
												}), Array.from(new Set(leases.map((l) => l.unit).filter(Boolean))).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: u,
													children: u
												}, u))] })]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: checkoutCustomerFilter,
												onValueChange: setCheckoutCustomerFilter,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs bg-background",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Customers" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "all",
													children: "All Customers"
												}), Array.from(new Set(leases.map((l) => l.tenantName).filter(Boolean))).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: c,
													children: c
												}, c))] })]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: checkoutStatusFilter,
												onValueChange: setCheckoutStatusFilter,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs bg-background",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Statuses" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "all",
														children: "All Statuses"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "closed",
														children: "Closed / Settled"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "ready_for_settlement",
														children: "Ready for Settlement"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "inspection_done",
														children: "Inspection Done"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "planned",
														children: "Planned"
													})
												] })]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													className: "h-8 text-xs pl-8 bg-background",
													placeholder: "Search lease, unit, tenant...",
													value: checkoutSearchQuery,
													onChange: (e) => setCheckoutSearchQuery(e.target.value)
												})]
											})
										]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
								className: "pb-2 pt-4 px-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "text-sm font-semibold",
										children: "1. Move-Out Inspections, Clearances & Key Returns"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										className: "text-[10px]",
										children: [checkouts.length, " records"]
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "space-y-4 px-4 pb-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
									columns: [
										"Lease",
										"Notice Date",
										"Move-Out / Inspection",
										"Clearances",
										"Comparison Summary",
										"Status",
										"Actions"
									],
									rows: checkouts.filter((checkout) => {
										const lease = leases.find((item) => item.id === checkout.leaseId);
										if (checkoutPropertyFilter !== "all" && lease?.property !== checkoutPropertyFilter) return false;
										if (checkoutUnitFilter !== "all" && lease?.unit !== checkoutUnitFilter) return false;
										if (checkoutCustomerFilter !== "all" && lease?.tenantName !== checkoutCustomerFilter) return false;
										if (checkoutStatusFilter !== "all" && checkout.status !== checkoutStatusFilter) return false;
										if (checkoutSearchQuery.trim()) {
											const q = checkoutSearchQuery.toLowerCase();
											if (!((lease?.tenantName || "").toLowerCase().includes(q) || (lease?.unit || "").toLowerCase().includes(q) || (lease?.property || "").toLowerCase().includes(q) || (checkout.leaseId || "").toLowerCase().includes(q))) return false;
										}
										return true;
									}).map((checkout) => {
										const lease = leases.find((item) => item.id === checkout.leaseId);
										return [
											lease ? `${lease.tenantName} (${lease.unit})` : checkout.leaseId,
											checkout.noticeDate,
											`${checkout.moveOutDate} / ${checkout.inspectionDate}`,
											`Finance ${checkout.financeClearance ? "OK" : "Pending"}, Utility ${checkout.utilityClearance ? "OK" : "Pending"}, Keys ${checkout.keysReturned ? "Returned" : "Pending"}`,
											checkout.comparisonSummary,
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: checkout.status }, "status"),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												className: "h-7 text-xs",
												onClick: () => {
													setSelectedCheckout(checkout);
													setCompleteCheckoutForm({
														condition: "Good",
														electricityMeter: "",
														waterMeter: "",
														damages: "",
														missingItems: "",
														cleaningCharges: "0",
														restorationCharges: "0",
														outstandingRent: "0",
														damagesAmount: "0",
														utilityCharges: "0",
														otherDeductions: "0",
														daysOccupiedInMonth: "30",
														totalDaysInMonth: "30",
														currentMonthPdcDeposited: false,
														unusedRentRefund: "0",
														photos: "0",
														checkoutPhotos: "",
														checkoutReportFile: "",
														handoverConditionSummary: "",
														finalConditionSummary: "",
														financeClearance: false,
														utilityClearance: false,
														keysReturned: false,
														unitDisposition: "Available"
													});
													setCheckoutActiveTab("condition");
													setCompleteCheckoutOpen(true);
												},
												disabled: checkout.status === "ready_for_settlement" || checkout.status === "closed",
												children: "Complete Inspection"
											}, "action")
										];
									})
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
								className: "pb-2 pt-4 px-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "text-sm font-semibold",
										children: "2. Security Deposit Settlements & Financial Approvals"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										className: "text-[10px]",
										children: [settlements.length, " records"]
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "space-y-4 px-4 pb-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
									columns: [
										"Lease",
										"Deposit Received",
										"Total Deductions",
										"Refund Amount",
										"Approval Status",
										"Actions"
									],
									rows: settlements.filter((settlement) => {
										const lease = leases.find((item) => item.id === settlement.leaseId);
										if (checkoutPropertyFilter !== "all" && lease?.property !== checkoutPropertyFilter) return false;
										if (checkoutUnitFilter !== "all" && lease?.unit !== checkoutUnitFilter) return false;
										if (checkoutCustomerFilter !== "all" && lease?.tenantName !== checkoutCustomerFilter) return false;
										if (checkoutStatusFilter !== "all" && settlement.approval !== checkoutStatusFilter) return false;
										if (checkoutSearchQuery.trim()) {
											const q = checkoutSearchQuery.toLowerCase();
											if (!((lease?.tenantName || "").toLowerCase().includes(q) || (lease?.unit || "").toLowerCase().includes(q) || (lease?.property || "").toLowerCase().includes(q) || (settlement.leaseId || "").toLowerCase().includes(q))) return false;
										}
										return true;
									}).map((settlement) => {
										const lease = leases.find((item) => item.id === settlement.leaseId);
										const deductions = settlement.outstandingRent + settlement.damages + settlement.utilityCharges + (settlement.cleaningCharges || 0) + (settlement.restorationCharges || 0) + settlement.otherDeductions;
										const refund = Math.max(0, settlement.depositReceived - deductions);
										return [
											lease ? `${lease.tenantName} (${lease.unit})` : settlement.leaseId,
											formatMoney(settlement.depositReceived),
											formatMoney(deductions),
											formatMoney(refund),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: settlement.approval }, "status"),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: settlement.approval === "paid" ? "secondary" : "default",
												className: "h-7 text-xs",
												disabled: settlement.approval === "paid",
												onClick: () => openSettleRefundModal(settlement),
												children: settlement.approval === "paid" ? "Settled & Refunded" : "Settle & Refund"
											}, "action")
										];
									})
								})
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "vouchers",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "pb-3 pt-4 px-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "text-base font-semibold",
										children: "Detailed Voucher Accounting"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
										className: "text-xs",
										children: "Named financial documents model rent receipts, deposits, PDC clearance, cheque returns, rental income, and settlements synced to Finance."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "ghost",
											className: "h-8 text-xs text-muted-foreground gap-1",
											onClick: () => {
												setVoucherPropertyFilter("all");
												setVoucherUnitFilter("all");
												setVoucherCustomerFilter("all");
												setVoucherMethodFilter("all");
												setVoucherStatusFilter("all");
												setVoucherSearchQuery("");
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3 w-3" }), " Reset Filters"]
										})
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5 pt-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: voucherPropertyFilter,
											onValueChange: setVoucherPropertyFilter,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Properties" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "all",
												children: "All Properties"
											}), Array.from(new Set(leases.map((l) => l.property).filter(Boolean))).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: p,
												children: p
											}, p))] })]
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: voucherUnitFilter,
											onValueChange: setVoucherUnitFilter,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Units" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "all",
												children: "All Units"
											}), Array.from(new Set(leases.map((l) => l.unit).filter(Boolean))).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: u,
												children: u
											}, u))] })]
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: voucherCustomerFilter,
											onValueChange: setVoucherCustomerFilter,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Customers" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "all",
												children: "All Customers"
											}), Array.from(new Set(leases.map((l) => l.tenantName).filter(Boolean))).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: c,
												children: c
											}, c))] })]
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: voucherMethodFilter,
											onValueChange: setVoucherMethodFilter,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Methods" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "all",
													children: "All Methods"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "PDC",
													children: "PDC"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Cash",
													children: "Cash"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Bank Transfer",
													children: "Bank Transfer"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Finance Engine",
													children: "Finance Engine"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Deposit Offset",
													children: "Deposit Offset"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Journal",
													children: "Journal"
												})
											] })]
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: voucherStatusFilter,
											onValueChange: setVoucherStatusFilter,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Statuses" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "all",
													children: "All Statuses"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "posted",
													children: "Posted"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "draft",
													children: "Draft"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "shared",
													children: "Shared"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "settled",
													children: "Settled"
												})
											] })]
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												className: "h-8 text-xs pl-8 bg-background",
												placeholder: "Search vouchers...",
												value: voucherSearchQuery,
												onChange: (e) => setVoucherSearchQuery(e.target.value)
											})]
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "px-4 pb-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
									columns: [
										"Voucher / Receipt",
										"Lease",
										"Method / Period",
										"Debit",
										"Credit",
										"Amount",
										"Status",
										"Actions"
									],
									rows: (vouchers || []).filter((voucher) => {
										if (!voucher) return false;
										const lease = leases?.find((item) => item.id === voucher.leaseId);
										if (voucherPropertyFilter !== "all" && lease?.property !== voucherPropertyFilter) return false;
										if (voucherUnitFilter !== "all" && lease?.unit !== voucherUnitFilter) return false;
										if (voucherCustomerFilter !== "all" && lease?.tenantName !== voucherCustomerFilter) return false;
										if (voucherMethodFilter !== "all" && !(voucher.method || "").toLowerCase().includes(voucherMethodFilter.toLowerCase()) && !(voucher.name || "").toLowerCase().includes(voucherMethodFilter.toLowerCase())) return false;
										if (voucherStatusFilter !== "all" && (voucher.status || "").toLowerCase() !== voucherStatusFilter.toLowerCase()) return false;
										if (voucherSearchQuery.trim()) {
											const q = voucherSearchQuery.toLowerCase();
											if (!((voucher.name || "").toLowerCase().includes(q) || (voucher.receiptNo || "").toLowerCase().includes(q) || (voucher.debit || "").toLowerCase().includes(q) || (voucher.credit || "").toLowerCase().includes(q) || (lease?.tenantName || "").toLowerCase().includes(q) || (lease?.unit || "").toLowerCase().includes(q) || (lease?.property || "").toLowerCase().includes(q))) return false;
										}
										return true;
									}).map((voucher) => {
										const lease = leases?.find((item) => item.id === voucher.leaseId);
										const vName = voucher.name || "Voucher";
										return [
											`${vName} / ${voucher.receiptNo || "-"}`,
											lease ? `${lease.tenantName} / ${lease.unit}` : voucher.leaseId || "-",
											`${voucher.method || "-"} / ${voucher.period || "-"}`,
											voucher.debit || "-",
											voucher.credit || "-",
											formatMoney(Number(voucher.amount) || 0),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: voucher.status }, "status"),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-end gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-7 text-xs",
														onClick: () => {
															const isSecurity = vName.includes("Security Deposit") || vName.includes("Deposit");
															setReceiptModalData({
																receiptNo: voucher.receiptNo || voucher.id || "REC",
																acknowledgementNo: `ACK-${voucher.receiptNo || voucher.id || "001"}`,
																date: today.toISOString().split("T")[0],
																tenantName: lease?.tenantName || "Valued Tenant",
																tenantPhone: "",
																tenantEmail: "",
																tenantQid: "",
																propertyName: lease?.property || "Old Salata - Residence No:23",
																unitRef: lease?.unit || "Unit",
																leaseNo: lease ? `LES-${(lease.id || "").toUpperCase()}` : `LES-GEN`,
																leaseStartDate: lease?.startDate || today.toISOString().split("T")[0],
																leaseEndDate: lease?.endDate || today.toISOString().split("T")[0],
																monthlyRent: lease?.monthlyRent || voucher.amount || 0,
																totalContractRent: lease ? (Number(lease.monthlyRent) || 0) * (lease.pdcCount || 12) : Number(voucher.amount) || 0,
																depositAmount: isSecurity ? Number(voucher.amount) || 0 : lease?.securityDeposit || 0,
																depositMode: voucher.method || "PDC",
																pdcCount: voucher.method === "PDC" ? 1 : 0,
																pdcs: voucher.method === "PDC" ? [{
																	chequeNo: voucher.receiptNo || "CHQ-001",
																	bank: "QNB",
																	date: today.toISOString().split("T")[0],
																	amount: Number(voucher.amount) || 0,
																	period: voucher.period || "Rent"
																}] : [],
																vouchers: [{
																	receiptNo: voucher.receiptNo || voucher.id || "REC",
																	name: vName,
																	amount: Number(voucher.amount) || 0,
																	method: voucher.method || "PDC",
																	debit: voucher.debit || "",
																	credit: voucher.credit || ""
																}],
																totalCollected: Number(voucher.amount) || 0,
																cashierName: "Finance Department",
																notes: `Official receipt for ${vName} (${voucher.method || "Voucher"}).`
															});
															setReceiptModalOpen(true);
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-3.5 w-3.5 mr-1" }), " Receipt"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-7 text-xs",
														disabled: voucher.status !== "draft",
														onClick: () => {
															toast.warning("Manual leasing vouchers cannot be posted from this screen. Use the applicable Finance workflow so GL/SL/Account is resolved by the Account Resolver and Posting Engine.");
														},
														children: "Post"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-7 text-xs",
														disabled: voucher.status === "draft" || voucher.status === "shared",
														onClick: () => setVouchers((items) => items.map((item) => item.id === voucher.id ? {
															...item,
															status: "shared"
														} : item)),
														children: "Share"
													})
												]
											}, "actions")
										];
									})
								})
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "audit",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "SRS Workflow & Audit History" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Each stage records responsible department, input, approval, system status and output for future reference and audit." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
							columns: [
								"Date",
								"Stage",
								"Owner",
								"Input",
								"Approval",
								"Status",
								"Output"
							],
							rows: auditEvents.map((event) => [
								event.at,
								event.stage,
								event.owner,
								event.input,
								event.approval,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: event.status }, "status"),
								event.output
							])
						}) })] })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptModal, {
				open: receiptModalOpen,
				onOpenChange: setReceiptModalOpen,
				data: receiptModalData,
				secondaryData: receiptModalSecondaryData
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: bulkCustomerOpen,
				onOpenChange: setBulkCustomerOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					className: "max-w-6xl max-h-[92vh] overflow-y-auto bg-card p-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExcelImportEmbedded, {
						module: "customer",
						title: "Customer Master: Excel Bulk Import & Management",
						description: "Production-grade Excel CREATE, UPDATE, and DELETE engine for individual tenants, corporate clients, and KYC data.",
						onCompleted: () => {
							refetchData?.();
						}
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: bulkLeaseOpen,
				onOpenChange: setBulkLeaseOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					className: "max-w-6xl max-h-[92vh] overflow-y-auto bg-card p-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExcelImportEmbedded, {
						module: "lease",
						title: "Lease Agreements: Excel Bulk Import & Management",
						description: "Production-grade Excel CREATE, UPDATE, and DELETE engine for tenancy contracts, payment terms, and schedules.",
						onCompleted: () => {
							refetchData?.();
						}
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulkPdcDepositModal, {
				open: bulkPdcOpen,
				onOpenChange: setBulkPdcOpen,
				type: "PDC",
				existingLeases: leases,
				onSuccess: (items) => {
					const newPdcs = items.map((item, idx) => ({
						id: `pdc-bulk-${Date.now()}-${idx}`,
						leaseId: leases.find((l) => l.tenantName === item.tenantName || l.unit === item.unitName)?.id || leases[0]?.id || "L-1001",
						chequeNo: item.chequeNumber || `CHQ-${Math.floor(1e5 + Math.random() * 9e5)}`,
						bank: item.bank || "Doha Bank",
						date: item.maturityDate || today.toISOString().split("T")[0],
						amount: Number(item.amount) || 4700,
						payerName: item.tenantName || "Tenant",
						status: "received",
						period: `${item.rentFromDate} to ${item.rentToDate}`
					}));
					setPdcs((prev) => [...newPdcs, ...prev]);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulkPdcDepositModal, {
				open: bulkDepositOpen,
				onOpenChange: setBulkDepositOpen,
				type: "DEPOSIT",
				existingLeases: leases,
				onSuccess: (items) => {
					const newVouchers = items.map((item, idx) => ({
						id: `v-dep-${Date.now()}-${idx}`,
						leaseId: leases.find((l) => l.tenantName === item.tenantName || l.unit === item.unitName)?.id || leases[0]?.id || "L-1001",
						name: `Receipts Voucher - ${item.depositType || "Security Deposit"}`,
						receiptNo: item.receiptNumber || `RV-DEP-${Math.floor(1e3 + Math.random() * 9e3)}`,
						method: item.paymentMethod || "Bank Transfer",
						period: item.remarks || "Security Deposit Guarantee",
						debit: item.paymentMethod === "Cash" ? "Cash In Hand" : "Bank Operating Account",
						credit: "Security Deposit Liability (21500)",
						amount: Number(item.amount) || 4700,
						status: "posted"
					}));
					setVouchers((prev) => [...newVouchers, ...prev]);
				}
			})
		]
	});
}
function Metric({ label, value, icon, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
		className: "pb-2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-xs font-medium uppercase text-muted-foreground",
				children: label
			}), icon]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-2xl font-bold truncate",
		children: value
	}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[11px] text-muted-foreground mt-1 truncate",
		children: description
	})] })] });
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
function StatusBadge({ value }) {
	const safeValue = String(value || "").trim();
	const normalized = safeValue ? safeValue.replace(/_/g, " ") : "Unknown";
	const valLower = safeValue.toLowerCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "outline",
		className: `capitalize ${valLower.includes("verified") || valLower.includes("active") || valLower.includes("sent") || valLower.includes("posted") || valLower.includes("paid") ? "border-green-200 bg-green-50 text-green-700" : valLower.includes("pending") || valLower.includes("awaiting") || valLower.includes("draft") || valLower.includes("reserved") ? "border-amber-200 bg-amber-50 text-amber-700" : valLower.includes("rejected") || valLower.includes("blocked") || valLower.includes("duplicate") || valLower.includes("expired") ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-slate-50 text-slate-700"}`,
		children: normalized
	});
}
function DataTable({ columns, rows }) {
	const [page, setPage] = (0, import_react.useState)(1);
	const ITEMS_PER_PAGE = 20;
	const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE);
	const paginatedRows = rows.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto rounded-md border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[920px] text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "border-b bg-muted/30",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground last:text-right",
						children: column
					}, column)) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "divide-y",
					children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: columns.length,
						className: "px-4 py-8 text-center text-muted-foreground",
						children: "No records yet."
					}) }) : paginatedRows.map((row, rowIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
						className: "align-middle",
						children: row.map((cell, cellIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 last:text-right",
							children: cell
						}, `${rowIndex}-${cellIndex}`))
					}, rowIndex))
				})]
			})
		}), totalPages > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PaginationContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationPrevious, {
				href: "#",
				onClick: (e) => {
					e.preventDefault();
					setPage((p) => Math.max(1, p - 1));
				},
				className: page === 1 ? "pointer-events-none opacity-50" : ""
			}) }),
			[...Array(totalPages)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationLink, {
				href: "#",
				onClick: (e) => {
					e.preventDefault();
					setPage(i + 1);
				},
				isActive: page === i + 1,
				children: i + 1
			}) }, i)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationNext, {
				href: "#",
				onClick: (e) => {
					e.preventDefault();
					setPage((p) => Math.min(totalPages, p + 1));
				},
				className: page === totalPages ? "pointer-events-none opacity-50" : ""
			}) })
		] }) })]
	});
}
//#endregion
export { LeasingPage as default };
