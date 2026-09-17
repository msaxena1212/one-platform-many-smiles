import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as ShieldCheck, At as FilePenLine, B as RefreshCw, En as ArrowRight, F as Search, Jt as CircleX, Lt as Download, Nt as Eye, Qt as CircleCheck, Rt as DoorOpen, Ut as CloudUpload, Wt as Clock, X as Package, f as UserCheck, h as TriangleAlert, hn as Building2, kt as FileSpreadsheet, s as Users, st as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { m as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { a as generateTemplateWorkbook, i as downloadTemplateFile, n as ExcelImportEngine, o as getCurrentProfile, r as ResultExcelGenerator, s as getImportBatchHistory, t as Checkbox } from "./auth-guards-D2rfyOJx.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DJOO1b-0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.imports-C6ji6IE0.js
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
		className: "h-[calc(100vh-5.5rem)] flex flex-col gap-3 overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between shrink-0 bg-card/60 backdrop-blur-md border rounded-xl px-4 py-2.5 shadow-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-9 w-9 rounded-lg bg-gradient-to-tr from-teal-600 via-emerald-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-base font-bold tracking-tight text-foreground",
								children: "Excel Bulk Data Studio"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
								children: "v2.4 Pro"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground",
							children: "High-throughput bulk ingestion & reconciliation pipeline"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "hidden md:flex items-center gap-1 bg-muted/60 p-1 rounded-full border border-border/50 text-xs",
						children: [
							{
								id: "upload",
								label: "1. Configure & Ingest"
							},
							{
								id: "preview",
								label: "2. Verify & Reconcile"
							},
							{
								id: "results",
								label: "3. Commit & Audit"
							}
						].map((s) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `px-3 py-1 rounded-full font-medium transition-all text-[11px] ${currentStep === s.id || s.id === "upload" && currentStep === "history" || s.id === "preview" && currentStep === "processing" ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground/70"}`,
								children: s.label
							}, s.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [currentStep !== "upload" && currentStep !== "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: resetUploadState,
							className: "h-8 text-xs gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5" }), " Start New"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: currentStep === "history" ? "default" : "outline",
							size: "sm",
							onClick: () => setCurrentStep(currentStep === "history" ? "upload" : "history"),
							className: "h-8 text-xs gap-1.5 shadow-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" }),
								" History (",
								historyBatches.length,
								")"
							]
						})]
					})
				]
			}),
			currentStep === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "flex-1 flex flex-col min-h-0 border-border/70 overflow-hidden shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "py-3 px-4 shrink-0 flex flex-row items-center justify-between border-b bg-muted/30",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-semibold",
						children: "Excel Ingestion Lineage & Audit History"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-xs",
						children: "Immutable ledger of executed batch files, mutations, and generated outcome sheets."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => setCurrentStep("upload"),
						className: "h-7 text-xs",
						children: "Back to Studio"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0 flex-1 min-h-0 overflow-y-auto",
					children: historyBatches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "h-full flex flex-col items-center justify-center text-muted-foreground py-12",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-10 w-10 mb-2 opacity-30 text-teal-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs",
							children: "No import history batches found in persistent storage."
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
						className: "sticky top-0 bg-background/95 backdrop-blur-xs z-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs font-semibold",
								children: "Batch ID"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs font-semibold",
								children: "Module"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs font-semibold",
								children: "Operation"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs font-semibold",
								children: "File Name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs font-semibold",
								children: "Uploaded By"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-center text-xs font-semibold",
								children: "Total Rows"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-center text-xs font-semibold text-emerald-600",
								children: "Committed (OK)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-center text-xs font-semibold text-rose-600",
								children: "Errors / Failed"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs font-semibold",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-xs font-semibold",
								children: "Date & Time"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right text-xs font-semibold",
								children: "Actions"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: historyBatches.map((b) => {
						const totalRows = b.summary?.totalRows || b.records?.length || 0;
						const successRows = b.summary?.successRows || 0;
						const failedRows = b.summary?.failedRows || (b.status === "FAILED" && successRows === 0 ? totalRows : 0);
						const displayDate = b.uploadedAt ? new Date(b.uploadedAt).toLocaleString() : "Recent";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
							className: "hover:bg-muted/40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "font-mono font-bold text-xs",
									children: b.batchIdentifier || b.id.slice(0, 8)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "capitalize font-medium text-xs",
									children: b.module
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: b.operation === "CREATE" ? "default" : b.operation === "UPDATE" ? "secondary" : "destructive",
									className: "text-[10px] uppercase font-bold",
									children: b.operation
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "max-w-[170px] truncate text-xs font-mono",
									title: b.fileName,
									children: b.fileName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-xs text-muted-foreground",
									children: b.uploadedBy?.name || "Admin"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-center font-mono font-semibold text-xs",
									children: totalRows
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-center font-mono text-xs text-emerald-600 font-bold",
									children: successRows
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-center font-mono text-xs text-rose-600 font-bold",
									children: failedRows
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: `text-[10px] font-bold ${b.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : b.status === "PARTIAL_SUCCESS" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" : b.status === "FAILED" ? "bg-rose-500/10 text-rose-600 border-rose-500/30" : "bg-blue-500/10 text-blue-600"}`,
									variant: "outline",
									children: b.status
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-xs text-muted-foreground whitespace-nowrap",
									children: displayDate
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
									className: "text-right space-x-1 whitespace-nowrap",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "ghost",
										size: "sm",
										className: "h-7 px-2 text-xs font-semibold",
										onClick: () => {
											setCurrentBatch(b);
											setCurrentStep("preview");
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5 mr-1 text-primary" }), " View Rows"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										className: "h-7 w-7 p-0",
										title: "Download Result Excel Report",
										onClick: () => {
											const data = ResultExcelGenerator.generateResultWorkbook(b);
											ResultExcelGenerator.triggerDownload(data, `${b.batchIdentifier}_Result_Report.xlsx`);
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 text-muted-foreground hover:text-foreground" })
									})]
								})
							]
						}, b.id);
					}) })] })
				})]
			}),
			currentStep === "upload" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-5 flex flex-col gap-3 min-h-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "flex-1 flex flex-col min-h-0 border-border/70 overflow-hidden shadow-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "py-2.5 px-3.5 shrink-0 border-b bg-muted/20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
									className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "h-5 w-5 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-[10px]",
										children: "1"
									}), "Target Entity Module"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "text-[10px] font-mono capitalize",
									children: selectedModule
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-2.5 flex-1 min-h-0 overflow-y-auto space-y-1.5",
							children: MODULES.map((m) => {
								const Icon = m.icon;
								const isSelected = selectedModule === m.key;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									onClick: () => handleModuleChange(m.key),
									className: `p-2.5 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${isSelected ? "border-teal-500 bg-teal-500/10 ring-1 ring-teal-500 text-teal-950 dark:text-teal-100 font-medium" : "hover:bg-muted/40 border-border/50 bg-card"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `p-2 rounded-md shrink-0 ${isSelected ? "bg-teal-600 text-white shadow-xs" : "bg-muted text-muted-foreground"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
												className: "font-semibold text-xs leading-none",
												children: m.label
											}), isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-teal-500" })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-muted-foreground truncate mt-1",
											children: m.description
										})]
									})]
								}, m.key);
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "shrink-0 border-border/70 shadow-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "py-2 px-3.5 border-b bg-muted/20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "h-5 w-5 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-[10px]",
									children: "2"
								}), "Operation Pipeline"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-2.5 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-3 gap-1.5 p-1 bg-muted/70 rounded-lg",
								children: [
									"CREATE",
									"UPDATE",
									"DELETE"
								].map((op) => {
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => handleOperationChange(op),
										className: `py-1.5 text-xs font-bold rounded-md transition-all ${selectedOperation === op ? op === "CREATE" ? "bg-emerald-600 text-white shadow-xs" : op === "UPDATE" ? "bg-blue-600 text-white shadow-xs" : "bg-rose-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`,
										children: op
									}, op);
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2 bg-muted/40 rounded-md border border-border/40 text-[11px] text-muted-foreground",
								children: [
									selectedOperation === "CREATE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										"✨ ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-foreground",
											children: "CREATE:"
										}),
										" Adds new entries. Pre-checks uniqueness & relations."
									] }),
									selectedOperation === "UPDATE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										"🔄 ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-foreground",
											children: "UPDATE:"
										}),
										" Patches records. Blanks keep existing data; ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
											className: "font-mono text-primary font-bold",
											children: "[NULL]"
										}),
										" clears fields."
									] }),
									selectedOperation === "DELETE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										"⚠️ ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-rose-600",
											children: "DELETE:"
										}),
										" Safe archived removal. Active contracts/dependencies are protected."
									] })
								]
							})]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-7 flex flex-col gap-3 min-h-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "shrink-0 border-border/70 shadow-xs bg-gradient-to-r from-card via-card to-teal-500/5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-3.5 flex items-center justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-2.5 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0 border border-emerald-500/20",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-6 w-6" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
											className: "font-bold text-xs uppercase tracking-tight text-foreground truncate",
											children: [
												selectedModule,
												"_",
												selectedOperation,
												"_Template.xlsx"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "secondary",
											className: "text-[9px] font-mono px-1 py-0",
											children: "Masters Synced"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground truncate mt-0.5",
										children: "Pre-populated dropdown lists & strict headers"
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								onClick: handleDownloadTemplate,
								disabled: isDownloadingTemplate,
								className: "shrink-0 h-8 text-xs gap-1.5 border-emerald-600/30 hover:bg-emerald-500/10 hover:text-emerald-700",
								children: [isDownloadingTemplate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), "Download Template"]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "flex-1 flex flex-col min-h-0 border-border/70 shadow-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "py-2 px-3.5 border-b bg-muted/20 shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
									className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "h-5 w-5 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-[10px]",
										children: "3"
									}), "Workbook Ingestion & Validation"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-muted-foreground",
									children: "Supported format: .xlsx"
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-3.5 flex-1 flex flex-col min-h-0 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								onClick: () => fileInputRef.current?.click(),
								className: `flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${fileToUpload ? "border-teal-500 bg-teal-500/5 ring-2 ring-teal-500/20" : "border-border/80 hover:border-teal-500/60 hover:bg-muted/30"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										ref: fileInputRef,
										onChange: handleFileChange,
										accept: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
										className: "hidden"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `p-3 rounded-full ${fileToUpload ? "bg-teal-500 text-white shadow-md shadow-teal-500/20" : "bg-muted text-muted-foreground"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-6 w-6" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "max-w-xs",
										children: fileToUpload ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-bold text-xs text-foreground truncate",
											children: fileToUpload.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[11px] text-teal-600 font-mono mt-0.5",
											children: [(fileToUpload.size / 1024).toFixed(1), " KB • Ready for schema verification"]
										})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-xs text-foreground",
											children: "Click to browse or drop .xlsx workbook here"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground mt-0.5",
											children: "Strict schema pre-flight check without database writes"
										})] })
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "shrink-0 flex items-center justify-between gap-3 pt-1 border-t border-border/40",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] text-muted-foreground flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-teal-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Dry-run verified against live master references" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									onClick: handleValidateAndPreview,
									disabled: !fileToUpload || isParsing,
									className: "h-9 px-4 text-xs font-semibold gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-sm shadow-teal-600/20",
									children: isParsing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), " Verifying File..."] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Inspect & Reconcile ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })] })
								})]
							})]
						})]
					})]
				})]
			}),
			currentStep === "preview" && currentBatch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-h-0 flex flex-col gap-2.5 overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-card/70 backdrop-blur-md border rounded-xl p-3 shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-2 bg-primary/10 rounded-lg text-primary shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "font-mono text-[10px] px-1.5 py-0",
												children: currentBatch.batchIdentifier
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: `text-[10px] uppercase font-bold ${selectedOperation === "CREATE" ? "bg-emerald-600" : selectedOperation === "UPDATE" ? "bg-blue-600" : "bg-rose-600"}`,
												children: selectedOperation
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "secondary",
												className: "capitalize text-[10px] font-semibold",
												children: selectedModule
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-xs font-bold text-foreground truncate mt-0.5",
										children: currentBatch.fileName
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg border border-border/40 text-xs shrink-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "px-2.5 py-0.5 text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[9px] uppercase tracking-wider text-muted-foreground font-semibold",
											children: "Total"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono font-bold text-xs",
											children: currentBatch.summary.totalRows
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-6 bg-border/60" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "px-2.5 py-0.5 text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[9px] uppercase tracking-wider text-emerald-600 font-semibold",
											children: "Ready"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono font-bold text-xs text-emerald-600",
											children: currentBatch.summary.validRows
										})]
									}),
									selectedOperation === "UPDATE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-6 bg-border/60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "px-2.5 py-0.5 text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[9px] uppercase tracking-wider text-blue-600 font-semibold",
											children: "No-op"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono font-bold text-xs text-blue-600",
											children: currentBatch.summary.noChangeRows
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-6 bg-border/60" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "px-2.5 py-0.5 text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[9px] uppercase tracking-wider text-amber-600 font-semibold",
											children: "Warn"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono font-bold text-xs text-amber-600",
											children: currentBatch.summary.warningRows
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-6 bg-border/60" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "px-2.5 py-0.5 text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[9px] uppercase tracking-wider text-rose-600 font-semibold",
											children: "Errors"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono font-bold text-xs text-rose-600",
											children: currentBatch.summary.errorRows + currentBatch.summary.blockedRows
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: resetUploadState,
									className: "h-8 text-xs",
									children: "Upload Another"
								}), currentBatch.summary.validRows > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									onClick: handleConfirmAndProcess,
									disabled: isConfirming || selectedOperation === "DELETE" && !deleteConfirmed,
									className: `h-8 text-xs font-semibold gap-1.5 shadow-xs ${selectedOperation === "DELETE" ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" }),
										"Execute Commit (",
										currentBatch.summary.validRows,
										")"
									]
								})]
							})
						]
					}),
					selectedOperation === "DELETE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-between text-xs shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-rose-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: "Destructive deletion safety lock: verified rows will be permanently deleted or archived."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center space-x-2 shrink-0 ml-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								id: "del-confirm",
								checked: deleteConfirmed,
								onCheckedChange: (c) => setDeleteConfirmed(Boolean(c))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "del-confirm",
								className: "text-[11px] font-bold cursor-pointer text-rose-900 dark:text-rose-200",
								children: "I Confirm Deletion"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "flex-1 min-h-0 flex flex-col border-border/70 overflow-hidden shadow-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "py-2 px-3.5 shrink-0 border-b bg-muted/20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
									value: previewTab,
									onValueChange: setPreviewTab,
									className: "w-full sm:w-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
										className: "grid grid-cols-4 sm:flex h-7 bg-muted/80 p-0.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
												value: "ALL",
												className: "text-[11px] h-6 px-2.5",
												children: [
													"All (",
													currentBatch.summary.totalRows,
													")"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
												value: "READY",
												className: "text-[11px] h-6 px-2.5 text-emerald-600 font-semibold",
												children: [
													"Ready (",
													currentBatch.summary.validRows,
													")"
												]
											}),
											selectedOperation === "UPDATE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
												value: "NO_CHANGE",
												className: "text-[11px] h-6 px-2.5 text-blue-600",
												children: [
													"No Change (",
													currentBatch.summary.noChangeRows,
													")"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
												value: "ERRORS",
												className: "text-[11px] h-6 px-2.5 text-rose-600 font-semibold",
												children: [
													"Errors (",
													currentBatch.summary.errorRows + currentBatch.summary.blockedRows,
													")"
												]
											})
										]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative w-full sm:w-60",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "Search key, record, error...",
										value: previewSearch,
										onChange: (e) => setPreviewSearch(e.target.value),
										className: "pl-7 text-xs h-7 bg-card"
									})]
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-0 flex-1 min-h-0 overflow-y-auto",
							children: filteredRecords.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full flex items-center justify-center py-12 text-muted-foreground text-xs",
								children: "No records matching the selected filter criteria."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
								className: "sticky top-0 bg-background/95 backdrop-blur-xs z-10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "border-b",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "w-12 text-[11px]",
											children: "#"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-[11px]",
											children: "Record Key"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-[11px]",
											children: "Name / Label"
										}),
										selectedOperation === "UPDATE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-[11px]",
											children: "Mutations"
										}),
										selectedOperation === "DELETE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-[11px]",
											children: "Dependencies"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-[11px]",
											children: "Pre-flight Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-[11px]",
											children: "Diagnostics"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-right text-[11px]",
											children: "Action"
										})
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filteredRecords.map((rec) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "hover:bg-muted/30",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-mono text-[11px] text-muted-foreground",
										children: rec.excelRowNumber
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-mono font-semibold text-xs text-foreground",
										children: rec.recordKey
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-xs max-w-[180px] truncate text-muted-foreground",
										children: rec.recordName || "—"
									}),
									selectedOperation === "UPDATE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: rec.changes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "secondary",
										className: "font-mono text-[10px] px-1.5 py-0",
										children: [
											rec.changes.length,
											" field",
											rec.changes.length > 1 ? "s" : ""
										]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] text-muted-foreground",
										children: "Unmodified"
									}) }),
									selectedOperation === "DELETE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: rec.dependencies.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex gap-1 flex-wrap",
										children: rec.dependencies.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: d.result === "Blocked" ? "destructive" : "outline",
											className: "text-[9px] px-1 py-0",
											children: [
												d.dependency,
												": ",
												d.count
											]
										}, i))
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] text-emerald-600 font-medium",
										children: "Clean"
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: `text-[10px] ${rec.status === "READY" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : rec.status === "NO_CHANGE" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : rec.status === "WARNING" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" : "bg-rose-500/10 text-rose-600 border-rose-500/30"}`,
										variant: "outline",
										children: rec.status
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-xs max-w-[220px] truncate text-muted-foreground",
										children: rec.errors.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-rose-600 font-medium",
											children: rec.errors[0].message
										}) : rec.warnings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-amber-600",
											children: rec.warnings[0].message
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground/60",
											children: "—"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "sm",
											onClick: () => setInspectRecord(rec),
											className: "h-6 px-2 text-[11px]",
											children: "Inspect"
										})
									})
								]
							}, rec.excelRowNumber)) })] })
						})]
					})
				]
			}),
			currentStep === "processing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 flex items-center justify-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "w-full max-w-md text-center p-6 border-border/80 shadow-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-4 p-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-3 bg-teal-500/10 text-teal-600 rounded-full w-12 h-12 mx-auto flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-base font-bold text-foreground",
								children: "Executing Ingestion Pipeline"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground font-mono mt-0.5",
								children: currentBatch?.batchIdentifier
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between text-xs font-mono",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"Processed: ",
										processingProgress.processed,
										" / ",
										processingProgress.total
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-emerald-600 font-bold",
										children: [processingProgress.success, " OK"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-full bg-muted rounded-full h-2 overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "bg-gradient-to-r from-teal-600 to-emerald-600 h-full transition-all duration-300",
										style: { width: `${processingProgress.total > 0 ? processingProgress.processed / processingProgress.total * 100 : 15}%` }
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground",
								children: "Writing audit logs & updating database records. Please do not refresh."
							})
						]
					})
				})
			}),
			currentStep === "results" && currentBatch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 flex items-center justify-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "w-full max-w-2xl border-border/80 shadow-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "text-center py-4 border-b bg-muted/20",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mx-auto p-2 bg-emerald-500/10 text-emerald-600 rounded-full w-10 h-10 flex items-center justify-center mb-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-6 w-6" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-lg font-bold",
								children: "Import Processing Complete"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
								className: "font-mono text-[11px]",
								children: [
									"Batch #",
									currentBatch.batchIdentifier,
									" • ",
									(/* @__PURE__ */ new Date()).toLocaleDateString()
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5 space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-3 text-center p-3 bg-muted/40 rounded-lg border border-border/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground font-medium",
										children: "Successfully Processed"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xl font-bold text-emerald-600 font-mono mt-0.5",
										children: currentBatch.summary.successRows
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground font-medium",
										children: "Failed Rows"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xl font-bold text-rose-600 font-mono mt-0.5",
										children: currentBatch.summary.failedRows
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground font-medium",
										children: "No Change (Skipped)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xl font-bold text-blue-600 font-mono mt-0.5",
										children: currentBatch.summary.noChangeRows
									})] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "font-semibold text-xs uppercase tracking-wider text-muted-foreground",
									children: "Download Outcome Workbooks"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										onClick: handleDownloadFullResult,
										className: "justify-start gap-2 h-auto py-2.5 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 text-emerald-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-left truncate",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-semibold text-xs",
												children: "Full Result.xlsx"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground",
												children: "6 audit & diff sheets"
											})]
										})]
									}), currentBatch.summary.failedRows > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										onClick: handleDownloadFailedRecords,
										className: "justify-start gap-2 h-auto py-2.5 text-xs border-rose-200 hover:bg-rose-500/10",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 text-rose-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-left truncate",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-semibold text-xs text-rose-600",
												children: "Failed Records.xlsx"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground",
												children: "Pre-annotated error reasons"
											})]
										})]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center pt-3 border-t",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setCurrentStep("history"),
									className: "text-xs",
									children: "View Audit History"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									onClick: resetUploadState,
									className: "gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5" }), " Start Another Ingestion"]
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
