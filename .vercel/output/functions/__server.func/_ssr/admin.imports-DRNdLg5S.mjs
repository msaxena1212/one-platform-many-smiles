import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $t as CircleCheck, A as ShieldCheck, At as FileSpreadsheet, Dn as ArrowRight, Gt as Clock, I as Search, Pt as Eye, Rt as Download, V as RefreshCw, Wt as CloudUpload, Yt as CircleX, Z as Package, ct as LoaderCircle, f as UserCheck, gn as Building2, h as TriangleAlert, jt as FilePenLine, s as Users, zt as DoorOpen } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { m as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { a as generateTemplateWorkbook, i as downloadTemplateFile, n as ExcelImportEngine, o as getCurrentProfile, r as ResultExcelGenerator, s as getImportBatchHistory, t as Checkbox } from "./auth-guards-CGXIK8H1.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DJOO1b-0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.imports-DRNdLg5S.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Route = createFileRoute("/admin/imports")({
	validateSearch: (search) => ({
		module: search.module || "property",
		op: search.op || "CREATE"
	}),
	component: AdminExcelImportPage
});
var MODULES = [
	{
		key: "property",
		label: "Property",
		icon: Building2,
		description: "Master properties, buildings, zones & cost centers"
	},
	{
		key: "unit",
		label: "Unit",
		icon: DoorOpen,
		description: "Apartments, villas, offices, room counts & amenities"
	},
	{
		key: "customer",
		label: "Customer",
		icon: Users,
		description: "Individual tenants, corporate clients & KYC documents"
	},
	{
		key: "asset",
		label: "Asset",
		icon: Package,
		description: "Fixed assets, HVAC, warranty & employee/unit assignments"
	},
	{
		key: "lease",
		label: "Lease",
		icon: FilePenLine,
		description: "Lease agreements, terms, rent schedules & deposit tracking"
	},
	{
		key: "employee",
		label: "Employee",
		icon: UserCheck,
		description: "HRMS employees, designations, departments & payroll"
	}
];
function AdminExcelImportPage() {
	const searchParams = Route.useSearch?.() || {};
	const initialModule = searchParams.module || "property";
	const initialOp = searchParams.op || "CREATE";
	const [selectedModule, setSelectedModule] = (0, import_react.useState)(initialModule);
	const [selectedOperation, setSelectedOperation] = (0, import_react.useState)(initialOp);
	const [currentStep, setCurrentStep] = (0, import_react.useState)("upload");
	const [isDownloadingTemplate, setIsDownloadingTemplate] = (0, import_react.useState)(false);
	const [isParsing, setIsParsing] = (0, import_react.useState)(false);
	const [currentBatch, setCurrentBatch] = (0, import_react.useState)(null);
	const [previewTab, setPreviewTab] = (0, import_react.useState)("ALL");
	const [previewSearch, setPreviewSearch] = (0, import_react.useState)("");
	const [inspectRecord, setInspectRecord] = (0, import_react.useState)(null);
	const [deleteConfirmed, setDeleteConfirmed] = (0, import_react.useState)(false);
	const [isConfirming, setIsConfirming] = (0, import_react.useState)(false);
	const [processingProgress, setProcessingProgress] = (0, import_react.useState)({
		processed: 0,
		total: 0,
		success: 0,
		failed: 0
	});
	const [historyBatches, setHistoryBatches] = (0, import_react.useState)([]);
	const [fileToUpload, setFileToUpload] = (0, import_react.useState)(null);
	const fileInputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setHistoryBatches(getImportBatchHistory());
	}, [currentStep]);
	const handleModuleChange = (newModule) => {
		setSelectedModule(newModule);
		resetUploadState();
	};
	const handleOperationChange = (newOp) => {
		setSelectedOperation(newOp);
		resetUploadState();
	};
	const resetUploadState = () => {
		setFileToUpload(null);
		setCurrentBatch(null);
		setCurrentStep("upload");
		setDeleteConfirmed(false);
		setPreviewTab("ALL");
		setPreviewSearch("");
		if (fileInputRef.current) fileInputRef.current.value = "";
	};
	const handleDownloadTemplate = async () => {
		try {
			setIsDownloadingTemplate(true);
			downloadTemplateFile(selectedModule, selectedOperation, await generateTemplateWorkbook(selectedModule, selectedOperation));
			toast.success(`Template for ${selectedModule.toUpperCase()} (${selectedOperation}) downloaded.`);
		} catch (e) {
			toast.error(e.message || "Failed to generate template");
		} finally {
			setIsDownloadingTemplate(false);
		}
	};
	const handleFileChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			if (!file.name.endsWith(".xlsx")) {
				toast.error("Invalid file format. Please upload an .xlsx file.");
				return;
			}
			setFileToUpload(file);
		}
	};
	const handleValidateAndPreview = async () => {
		if (!fileToUpload) {
			toast.error("Please select an Excel file to validate.");
			return;
		}
		try {
			setIsParsing(true);
			const buffer = await fileToUpload.arrayBuffer();
			let currentUser = {
				id: "admin-user",
				name: "Admin User",
				email: "admin@stayhub.qa"
			};
			try {
				const prof = await getCurrentProfile();
				if (prof) currentUser = {
					id: prof.id,
					name: prof.full_name || "Admin User",
					email: prof.email || "admin@stayhub.qa"
				};
			} catch {}
			const batch = await ExcelImportEngine.parseAndValidate(buffer, fileToUpload.name, selectedModule, selectedOperation, currentUser);
			setCurrentBatch(batch);
			setCurrentStep("preview");
			toast.success(`Validated ${batch.summary.totalRows} rows: ${batch.summary.validRows} ready, ${batch.summary.errorRows} errors.`);
		} catch (e) {
			toast.error(e.message || "Validation failed");
		} finally {
			setIsParsing(false);
		}
	};
	const handleConfirmAndProcess = async () => {
		if (!currentBatch) return;
		if (selectedOperation === "DELETE" && !deleteConfirmed) {
			toast.error("Please confirm that you understand the destructive nature of the DELETE operation.");
			return;
		}
		try {
			setIsConfirming(true);
			setCurrentStep("processing");
			let currentUser = {
				id: "admin-user",
				name: "Admin User"
			};
			try {
				const prof = await getCurrentProfile();
				if (prof) currentUser = {
					id: prof.id,
					name: prof.full_name || "Admin User"
				};
			} catch {}
			const processedBatch = await ExcelImportEngine.commitBatch(currentBatch, currentUser, (processed, total, success, failed) => {
				setProcessingProgress({
					processed,
					total,
					success,
					failed
				});
			});
			setCurrentBatch({ ...processedBatch });
			setCurrentStep("results");
			setHistoryBatches(getImportBatchHistory());
			toast.success(`Import finished: ${processedBatch.summary.successRows} successful, ${processedBatch.summary.failedRows} failed.`);
		} catch (e) {
			toast.error(e.message || "Failed to commit import batch");
			setCurrentStep("preview");
		} finally {
			setIsConfirming(false);
		}
	};
	const handleDownloadFullResult = () => {
		if (!currentBatch) return;
		const data = ResultExcelGenerator.generateResultWorkbook(currentBatch);
		ResultExcelGenerator.triggerDownload(data, `${currentBatch.batchIdentifier}_Full_Result.xlsx`);
	};
	const handleDownloadFailedRecords = () => {
		if (!currentBatch) return;
		const data = ResultExcelGenerator.generateFailedRecordsWorkbook(currentBatch);
		ResultExcelGenerator.triggerDownload(data, `${currentBatch.batchIdentifier}_Failed_Records.xlsx`);
	};
	const filteredRecords = (0, import_react.useMemo)(() => {
		if (!currentBatch) return [];
		return currentBatch.records.filter((rec) => {
			if (!(!previewSearch || String(rec.excelRowNumber).includes(previewSearch) || rec.recordKey.toLowerCase().includes(previewSearch.toLowerCase()) || rec.recordName && rec.recordName.toLowerCase().includes(previewSearch.toLowerCase()) || rec.recordId && rec.recordId.toLowerCase().includes(previewSearch.toLowerCase()))) return false;
			if (previewTab === "ALL") return true;
			if (previewTab === "READY") return rec.status === "READY" || rec.status === "WARNING";
			if (previewTab === "CHANGED") return rec.changes && rec.changes.length > 0;
			if (previewTab === "NO_CHANGE") return rec.status === "NO_CHANGE";
			if (previewTab === "ERRORS") return rec.status === "ERROR" || rec.status === "BLOCKED";
			if (previewTab === "BLOCKED") return rec.status === "BLOCKED";
			return true;
		});
	}, [
		currentBatch,
		previewTab,
		previewSearch
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-3xl font-bold tracking-tight flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-8 w-8 text-primary" }), "Excel Bulk Data Management"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Production-grade CREATE, UPDATE, and DELETE engine with schema validation, dependency guards & audit logging."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [currentStep !== "upload" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: resetUploadState,
						className: "gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" }), " New Import"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: currentStep === "history" ? "default" : "outline",
						size: "sm",
						onClick: () => setCurrentStep(currentStep === "history" ? "upload" : "history"),
						className: "gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4" }),
							" Import History (",
							historyBatches.length,
							")"
						]
					})]
				})]
			}),
			currentStep === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "flex flex-row items-center justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Excel Import Lineage & History" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Chronological log of all parsed, validated, and processed Excel batches." })] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: historyBatches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center py-12 text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-12 w-12 mx-auto mb-3 opacity-30" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No import history records found." })]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-md border overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Batch ID" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Module" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Operation" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "File Name" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Uploaded By" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Upload Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-center",
						children: "Total"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-center",
						children: "Success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-center",
						children: "Failed"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: historyBatches.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono font-medium text-xs",
						children: b.batchIdentifier
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "capitalize font-medium",
						children: b.module
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: b.operation === "CREATE" ? "default" : b.operation === "UPDATE" ? "secondary" : "destructive",
						children: b.operation
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "max-w-[180px] truncate text-xs",
						children: b.fileName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: b.uploadedBy?.name || "Admin"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs text-muted-foreground",
						children: new Date(b.uploadedAt).toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-center font-mono",
						children: b.summary?.totalRows || b.records?.length || 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-center font-mono text-emerald-600 font-bold",
						children: b.summary?.successRows || 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-center font-mono text-rose-600 font-bold",
						children: b.summary?.failedRows || 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						className: b.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : b.status === "PARTIAL_SUCCESS" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" : b.status === "FAILED" ? "bg-rose-500/10 text-rose-600 border-rose-500/30" : "bg-blue-500/10 text-blue-600",
						variant: "outline",
						children: b.status
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-right space-x-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => {
								setCurrentBatch(b);
								setCurrentStep("preview");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5 mr-1" }), " View"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => {
								const data = ResultExcelGenerator.generateResultWorkbook(b);
								ResultExcelGenerator.triggerDownload(data, `${b.batchIdentifier}_Result.xlsx`);
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" })
						})]
					})
				] }, b.id)) })] })
			}) })] }),
			currentStep === "upload" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-1 space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-lg",
						children: "1. Select Target Module"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Choose the PMS entity to manage." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "space-y-3",
						children: MODULES.map((m) => {
							const Icon = m.icon;
							const isSelected = selectedModule === m.key;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								onClick: () => handleModuleChange(m.key),
								className: `p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50 border-border"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `p-2 rounded-md ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "font-semibold text-sm",
											children: m.label
										}), isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "secondary",
											className: "text-[10px]",
											children: "Selected"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-0.5",
										children: m.description
									})]
								})]
							}, m.key);
						})
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-lg",
						children: "2. Select Operation"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Only one operation permitted per upload file." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg",
						children: [
							"CREATE",
							"UPDATE",
							"DELETE"
						].map((op) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => handleOperationChange(op),
								className: `py-2 text-xs font-semibold rounded-md transition-all ${selectedOperation === op ? op === "CREATE" ? "bg-emerald-600 text-white shadow" : op === "UPDATE" ? "bg-blue-600 text-white shadow" : "bg-rose-600 text-white shadow" : "text-muted-foreground hover:text-foreground"}`,
								children: op
							}, op);
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 p-3 bg-muted/40 rounded border text-xs space-y-1 text-muted-foreground",
						children: [
							selectedOperation === "CREATE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"💡 ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground",
									children: "CREATE:"
								}),
								" Adds new records. Duplicate keys in the file or existing in the DB will produce errors."
							] }),
							selectedOperation === "UPDATE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"💡 ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground",
									children: "UPDATE:"
								}),
								" Patches existing records. Blank cells preserve current values. Type ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "font-mono text-primary font-bold",
									children: "[NULL]"
								}),
								" to clear a field."
							] }),
							selectedOperation === "DELETE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"⚠️ ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-rose-500",
									children: "DELETE:"
								}),
								" Soft-deletes or archives records. Active leases, finance items, or dependencies will block deletion."
							] })
						]
					})] })] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-2 space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-lg flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "3. Official Excel Template" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "uppercase font-mono text-xs",
							children: [
								selectedModule,
								" • ",
								selectedOperation
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Download the official structured template pre-populated with master dropdown values and sample instructions." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-muted/20 border rounded-lg m-6 mt-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-3 bg-emerald-500/10 text-emerald-600 rounded-lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-8 w-8" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
								className: "font-semibold text-sm",
								children: [
									selectedModule.charAt(0).toUpperCase() + selectedModule.slice(1),
									"_",
									selectedOperation,
									"_Template.xlsx"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Contains required headers, field specifications & instruction sheet"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: handleDownloadTemplate,
							disabled: isDownloadingTemplate,
							className: "w-full sm:w-auto gap-2",
							children: [isDownloadingTemplate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), "Download Template"]
						})]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-lg",
						children: "4. Upload & Validate File"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Upload completed .xlsx workbook. No database modification occurs during validation." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							onClick: () => fileInputRef.current?.click(),
							className: `border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${fileToUpload ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									ref: fileInputRef,
									onChange: handleFileChange,
									accept: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
									className: "hidden"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-4 bg-primary/10 text-primary rounded-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-8 w-8" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: fileToUpload ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold text-sm text-primary",
									children: fileToUpload.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: [(fileToUpload.size / 1024).toFixed(1), " KB • Ready for validation"]
								})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-sm",
									children: "Drag and drop your Excel file here, or click to browse"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-1",
									children: "Supports .xlsx workbooks up to 15MB"
								})] }) })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-end pt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "lg",
								onClick: handleValidateAndPreview,
								disabled: !fileToUpload || isParsing,
								className: "gap-2 w-full sm:w-auto",
								children: isParsing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Validating File & DB References..."] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Validate & Preview Records ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })] })
							})
						})]
					})] })]
				})]
			}),
			currentStep === "preview" && currentBatch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-card border rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "font-mono text-xs",
									children: currentBatch.batchIdentifier
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: selectedOperation === "CREATE" ? "bg-emerald-600" : selectedOperation === "UPDATE" ? "bg-blue-600" : "bg-rose-600",
									children: selectedOperation
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "capitalize font-semibold",
									children: selectedModule
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-xl font-bold mt-2 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-5 w-5 text-muted-foreground" }), currentBatch.fileName]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: resetUploadState,
								children: "Upload Another File"
							}), currentBatch.summary.validRows > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "default",
								onClick: handleConfirmAndProcess,
								disabled: isConfirming || selectedOperation === "DELETE" && !deleteConfirmed,
								className: selectedOperation === "DELETE" ? "bg-rose-600 hover:bg-rose-700 gap-2" : "bg-emerald-600 hover:bg-emerald-700 gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4" }),
									"Confirm & Process ",
									currentBatch.summary.validRows,
									" Records"
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 sm:grid-cols-5 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground font-medium",
									children: "Total Rows"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-2xl font-bold mt-1 font-mono",
									children: currentBatch.summary.totalRows
								})]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-emerald-600 font-medium",
									children: "Ready to Commit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-2xl font-bold mt-1 font-mono text-emerald-600",
									children: currentBatch.summary.validRows
								})]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-blue-600 font-medium",
									children: "No Data Change"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-2xl font-bold mt-1 font-mono text-blue-600",
									children: currentBatch.summary.noChangeRows
								})]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-amber-600 font-medium",
									children: "Warnings"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-2xl font-bold mt-1 font-mono text-amber-600",
									children: currentBatch.summary.warningRows
								})]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-rose-600 font-medium",
									children: "Errors / Blocked"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-2xl font-bold mt-1 font-mono text-rose-600",
									children: currentBatch.summary.errorRows + currentBatch.summary.blockedRows
								})]
							}) })
						]
					}),
					selectedOperation === "DELETE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border-rose-300 bg-rose-50/50 dark:bg-rose-950/20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4 flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 text-rose-600 mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "font-semibold text-sm text-rose-900 dark:text-rose-200",
										children: "Mandatory Deletion Confirmation"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-rose-800 dark:text-rose-300",
										children: "Deletion is destructive. Deactivated or soft-deleted records will no longer be active for new contracts or operations."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center space-x-2 pt-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											id: "del-confirm",
											checked: deleteConfirmed,
											onCheckedChange: (c) => setDeleteConfirmed(Boolean(c))
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "del-confirm",
											className: "text-xs font-medium cursor-pointer",
											children: "I understand that this operation will remove or archive the selected records according to PMS rules."
										})]
									})
								]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
								value: previewTab,
								onValueChange: setPreviewTab,
								className: "w-full sm:w-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
									className: "grid grid-cols-5 w-full sm:w-auto",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
											value: "ALL",
											children: [
												"All (",
												currentBatch.summary.totalRows,
												")"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
											value: "READY",
											children: [
												"Ready (",
												currentBatch.summary.validRows,
												")"
											]
										}),
										selectedOperation === "UPDATE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "CHANGED",
											children: "Changed"
										}),
										selectedOperation === "UPDATE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
											value: "NO_CHANGE",
											children: [
												"No Change (",
												currentBatch.summary.noChangeRows,
												")"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
											value: "ERRORS",
											children: [
												"Errors (",
												currentBatch.summary.errorRows + currentBatch.summary.blockedRows,
												")"
											]
										})
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative w-full sm:w-64",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Search row, code, key...",
									value: previewSearch,
									onChange: (e) => setPreviewSearch(e.target.value),
									className: "pl-8 text-xs h-9"
								})]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: filteredRecords.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-center py-10 text-muted-foreground text-sm",
						children: "No records matching the selected filter."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-md border overflow-x-auto max-h-[500px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
							className: "sticky top-0 bg-card z-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "w-16",
									children: "Row"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Record Key / Identifier" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Name / Description" }),
								selectedOperation === "UPDATE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Changes" }),
								selectedOperation === "DELETE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Dependencies" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Validation Status" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Issues / Notes" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "text-right",
									children: "Action"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filteredRecords.map((rec) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-mono text-xs",
								children: rec.excelRowNumber
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-mono font-semibold text-xs",
								children: rec.recordKey
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-xs max-w-[200px] truncate",
								children: rec.recordName || "—"
							}),
							selectedOperation === "UPDATE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: rec.changes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "secondary",
								className: "font-mono text-[11px]",
								children: [
									rec.changes.length,
									" field",
									rec.changes.length > 1 ? "s" : "",
									" changed"
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "No changes"
							}) }),
							selectedOperation === "DELETE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: rec.dependencies.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-1",
								children: rec.dependencies.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: d.result === "Blocked" ? "destructive" : "outline",
									className: "text-[10px]",
									children: [
										d.dependency,
										": ",
										d.count
									]
								}, i))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-emerald-600",
								children: "Clean"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: rec.status === "READY" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : rec.status === "NO_CHANGE" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : rec.status === "WARNING" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" : "bg-rose-500/10 text-rose-600 border-rose-500/30",
								variant: "outline",
								children: rec.status
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-xs max-w-[250px] truncate text-muted-foreground",
								children: rec.errors.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-rose-600 font-medium",
									children: rec.errors[0].message
								}) : rec.warnings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-amber-600",
									children: rec.warnings[0].message
								}) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setInspectRecord(rec),
									className: "h-7 text-xs",
									children: "Inspect Details"
								})
							})
						] }, rec.excelRowNumber)) })] })
					}) })] })
				]
			}),
			currentStep === "processing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "max-w-xl mx-auto my-12 text-center p-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4 bg-primary/10 text-primary rounded-full w-16 h-16 mx-auto flex items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xl font-bold",
							children: "Processing Excel Import"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-1 font-mono",
							children: currentBatch?.batchIdentifier
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-xs font-mono",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Progress: ",
									processingProgress.processed,
									" / ",
									processingProgress.total
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Success: ",
									processingProgress.success,
									" | Failed: ",
									processingProgress.failed
								] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-full bg-muted rounded-full h-3 overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "bg-primary h-full transition-all duration-300",
									style: { width: `${processingProgress.total > 0 ? processingProgress.processed / processingProgress.total * 100 : 10}%` }
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Executing database transactions and generating audit snapshots. Please do not close this window."
						})
					]
				})
			}),
			currentStep === "results" && currentBatch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-w-3xl mx-auto space-y-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-t-4 border-t-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "text-center pb-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mx-auto p-3 bg-emerald-500/10 text-emerald-600 rounded-full w-14 h-14 flex items-center justify-center mb-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-8 w-8" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-2xl font-bold",
								children: "Import Processing Complete"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
								className: "font-mono text-xs",
								children: [
									"Batch #",
									currentBatch.batchIdentifier,
									" • ",
									(/* @__PURE__ */ new Date()).toLocaleString()
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-6 pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-4 text-center p-4 bg-muted/40 rounded-lg",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Successfully Processed"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-2xl font-bold text-emerald-600 font-mono mt-1",
										children: currentBatch.summary.successRows
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Failed Rows"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-2xl font-bold text-rose-600 font-mono mt-1",
										children: currentBatch.summary.failedRows
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "No Change (Skipped)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-2xl font-bold text-blue-600 font-mono mt-1",
										children: currentBatch.summary.noChangeRows
									})] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "font-semibold text-sm",
									children: "Downloadable Result Workbooks"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										onClick: handleDownloadFullResult,
										className: "justify-start gap-2 h-auto py-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-5 w-5 text-emerald-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-left",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-medium text-xs",
												children: "Download Complete Result.xlsx"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground",
												children: "6 sheets with summary, diffs & audit log"
											})]
										})]
									}), currentBatch.summary.failedRows > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										onClick: handleDownloadFailedRecords,
										className: "justify-start gap-2 h-auto py-3 border-rose-200",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-5 w-5 text-rose-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-left",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-medium text-xs text-rose-600",
												children: "Download Failed Records.xlsx"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground",
												children: "Includes error reasons for quick re-upload"
											})]
										})]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center pt-4 border-t",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									onClick: () => setCurrentStep("history"),
									children: "View All History"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: resetUploadState,
									className: "gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" }), " Start Another Import"]
								})]
							})
						]
					})]
				})
			}),
			inspectRecord && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: Boolean(inspectRecord),
				onOpenChange: (open) => !open && setInspectRecord(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-2xl max-h-[85vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Record Inspection (Row #",
								inspectRecord.excelRowNumber,
								")"
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "font-mono",
								children: inspectRecord.recordKey
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Detailed field breakdown, changes, dependencies, and validation diagnostics." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-2",
							children: [
								inspectRecord.errors.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-semibold flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-4 w-4 text-rose-600" }), " Validation Errors:"]
									}), inspectRecord.errors.map((e, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "ml-5 font-mono",
										children: [
											"[",
											e.code,
											"] ",
											e.message,
											" ",
											e.resolution && `— ${e.resolution}`
										]
									}, idx))]
								}),
								selectedOperation === "UPDATE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "font-semibold text-xs uppercase tracking-wider text-muted-foreground",
										children: "Old vs Proposed Data Comparison"
									}), inspectRecord.changes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground py-2",
										children: "No differences detected between Excel and current database record."
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded border overflow-hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Field" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Current DB Value" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Excel Proposed Value" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" })
										] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: inspectRecord.changes.map((ch, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "font-medium text-xs",
												children: ch.label
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-xs font-mono text-muted-foreground",
												children: String(ch.oldValue)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-xs font-mono font-bold text-primary",
												children: String(ch.newValue)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "secondary",
												className: "text-[10px]",
												children: ch.status
											}) })
										] }, idx)) })] })
									})]
								}),
								selectedOperation === "DELETE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "font-semibold text-xs uppercase tracking-wider text-muted-foreground",
										children: "Dependency & Foreign Link Check"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded border overflow-hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Dependency" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Count" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Evaluation" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Details" })
										] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: inspectRecord.dependencies.map((d, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "font-medium text-xs",
												children: d.dependency
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "font-mono text-xs",
												children: d.count
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: d.result === "Pass" ? "outline" : "destructive",
												className: "text-[10px]",
												children: d.result
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-xs text-muted-foreground",
												children: d.details
											})
										] }, idx)) })] })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 pt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "font-semibold text-xs uppercase tracking-wider text-muted-foreground",
										children: "Original Excel Row Data"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
										className: "p-3 bg-muted rounded text-[11px] font-mono overflow-x-auto max-h-40",
										children: JSON.stringify(inspectRecord.rawRowData, null, 2)
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setInspectRecord(null),
							children: "Close"
						}) })
					]
				})
			})
		]
	});
}
//#endregion
export { Route as n, AdminExcelImportPage as t };
