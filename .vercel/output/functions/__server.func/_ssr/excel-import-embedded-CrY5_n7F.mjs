import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $t as CircleCheck, At as FileSpreadsheet, Gt as Clock, I as Search, Pt as Eye, Rt as Download, Wt as CloudUpload, Yt as CircleX, an as ChevronLeft, ct as LoaderCircle, h as TriangleAlert, in as ChevronRight, j as ShieldCheck } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-C7RsdMLq.mjs";
import { a as ResultExcelGenerator, c as getCurrentProfile, l as getImportBatchHistory, n as ExcelImportEngine, o as downloadTemplateFile, s as generateTemplateWorkbook, t as Checkbox } from "./auth-guards-EcJq1CIb.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DJOO1b-0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/excel-import-embedded-CrY5_n7F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ExcelImportEmbedded({ module, defaultOperation = "CREATE", title, description, onCompleted, hideHistory = false }) {
	const [selectedOperation, setSelectedOperation] = (0, import_react.useState)(defaultOperation);
	const [currentStep, setCurrentStep] = (0, import_react.useState)("upload");
	const [isDownloadingTemplate, setIsDownloadingTemplate] = (0, import_react.useState)(false);
	const [isParsing, setIsParsing] = (0, import_react.useState)(false);
	const [currentBatch, setCurrentBatch] = (0, import_react.useState)(null);
	const [previewTab, setPreviewTab] = (0, import_react.useState)("ALL");
	const [previewSearch, setPreviewSearch] = (0, import_react.useState)("");
	const [previewPage, setPreviewPage] = (0, import_react.useState)(1);
	const [previewPageSize, setPreviewPageSize] = (0, import_react.useState)(25);
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
		setSelectedOperation(defaultOperation);
		resetUploadState();
	}, [module, defaultOperation]);
	(0, import_react.useEffect)(() => {
		setHistoryBatches(getImportBatchHistory().filter((b) => b.module === module));
	}, [currentStep, module]);
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
		setPreviewPage(1);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};
	const handleDownloadTemplate = async () => {
		try {
			setIsDownloadingTemplate(true);
			downloadTemplateFile(module, selectedOperation, await generateTemplateWorkbook(module, selectedOperation));
			toast.success(`Template for ${module.toUpperCase()} (${selectedOperation}) downloaded.`);
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
			processFile(file);
		}
	};
	const processFile = async (file) => {
		try {
			setIsParsing(true);
			toast.loading("Analyzing and validating Excel file...", { id: "parsing-toast" });
			const buffer = await file.arrayBuffer();
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
			const batch = await ExcelImportEngine.parseAndValidate(buffer, file.name, module, selectedOperation, currentUser);
			setCurrentBatch(batch);
			setCurrentStep("preview");
			toast.success(`Validated ${batch.summary.totalRows} rows: ${batch.summary.validRows} ready, ${batch.summary.errorRows} errors.`, { id: "parsing-toast" });
		} catch (err) {
			toast.error(`Import parsing failed: ${err.message || "Unknown error"}`, { id: "parsing-toast" });
			resetUploadState();
		} finally {
			setIsParsing(false);
		}
	};
	const handleExecuteImport = async () => {
		if (!currentBatch) return;
		if (selectedOperation === "DELETE" && !deleteConfirmed) {
			toast.error("You must explicitly confirm deletion by checking the box.");
			return;
		}
		try {
			setIsConfirming(true);
			setCurrentStep("processing");
			setProcessingProgress({
				processed: 0,
				total: currentBatch.summary.totalRows,
				success: 0,
				failed: 0
			});
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
			const finalBatch = await ExcelImportEngine.commitBatch(currentBatch, currentUser, (processed, total, success, failed) => {
				setProcessingProgress({
					processed,
					total,
					success,
					failed
				});
			});
			setCurrentBatch({ ...finalBatch });
			setCurrentStep("results");
			setHistoryBatches(getImportBatchHistory().filter((b) => b.module === module));
			toast.success(`Import operation complete! ${finalBatch.summary.successRows} Succeeded, ${finalBatch.summary.failedRows} Failed.`);
			try {
				window.dispatchEvent(new CustomEvent("pms_data_updated"));
			} catch {}
			if (onCompleted) onCompleted();
		} catch (err) {
			toast.error(`Execution failed: ${err.message || "Database update error"}`);
			setCurrentStep("preview");
		} finally {
			setIsConfirming(false);
		}
	};
	const handleDownloadResults = () => {
		if (!currentBatch) return;
		try {
			const buffer = ResultExcelGenerator.generateResultWorkbook(currentBatch);
			ResultExcelGenerator.triggerDownload(buffer, `${currentBatch.batchIdentifier}_Result_Report.xlsx`);
			toast.success("Detailed execution result workbook downloaded.");
		} catch (err) {
			toast.error(`Failed to generate results file: ${err.message}`);
		}
	};
	const handleDownloadFailedRecords = () => {
		if (!currentBatch) return;
		try {
			const buffer = ResultExcelGenerator.generateFailedRecordsWorkbook(currentBatch);
			ResultExcelGenerator.triggerDownload(buffer, `${currentBatch.batchIdentifier}_Failed_Records.xlsx`);
			toast.success("Failed records workbook downloaded.");
		} catch (err) {
			toast.error(`Failed to generate failed records file: ${err.message}`);
		}
	};
	const filteredRecords = (0, import_react.useMemo)(() => {
		if (!currentBatch) return [];
		return currentBatch.records.filter((rec) => {
			if (previewTab === "READY" && rec.status !== "READY") return false;
			if (previewTab === "NO_CHANGE" && rec.status !== "NO_CHANGE") return false;
			if (previewTab === "WARNING" && rec.status !== "WARNING") return false;
			if (previewTab === "ERRORS" && rec.status !== "ERROR" && rec.status !== "BLOCKED") return false;
			if (!previewSearch.trim()) return true;
			const search = previewSearch.toLowerCase();
			return rec.recordKey.toLowerCase().includes(search) || rec.recordName && rec.recordName.toLowerCase().includes(search) || Object.values(rec.rawRowData || {}).some((val) => String(val).toLowerCase().includes(search)) || rec.errors.some((e) => e.message.toLowerCase().includes(search)) || rec.warnings.some((w) => w.message.toLowerCase().includes(search));
		});
	}, [
		currentBatch,
		previewTab,
		previewSearch
	]);
	const totalPages = Math.max(1, Math.ceil(filteredRecords.length / previewPageSize));
	const currentPage = Math.min(previewPage, totalPages);
	const paginatedRecords = (0, import_react.useMemo)(() => {
		const start = (currentPage - 1) * previewPageSize;
		return filteredRecords.slice(start, start + previewPageSize);
	}, [
		filteredRecords,
		currentPage,
		previewPageSize
	]);
	const isBusy = isParsing || isConfirming || currentStep === "processing";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-xl font-bold tracking-tight text-foreground flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-5 w-5 text-primary" }), title || `Excel Bulk Import & Management: ${module.toUpperCase()}`]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: description || `Production-grade bulk CREATE, UPDATE, and DELETE pipeline for ${module} master data.`
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [!hideHistory && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: currentStep === "history" ? "secondary" : "outline",
						size: "sm",
						disabled: isBusy,
						onClick: () => setCurrentStep(currentStep === "history" ? "upload" : "history"),
						className: "text-xs gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" }), currentStep === "history" ? "Back to Upload" : "Execution History"]
					}), currentStep !== "upload" && currentStep !== "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						disabled: isBusy,
						onClick: resetUploadState,
						className: "text-xs",
						children: "Start New Import"
					})]
				})]
			}),
			currentStep !== "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
				value: selectedOperation,
				onValueChange: (val) => !isBusy && handleOperationChange(val),
				className: "w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "grid w-full grid-cols-3 max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "CREATE",
							disabled: isBusy,
							className: "text-xs font-medium",
							children: "CREATE (New)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "UPDATE",
							disabled: isBusy,
							className: "text-xs font-medium",
							children: "UPDATE (Modify)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "DELETE",
							disabled: isBusy,
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
										children: "Module:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "uppercase text-foreground font-semibold",
										children: module
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
								module.toUpperCase(),
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
								onChange: handleFileChange,
								accept: ".xlsx",
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
			currentStep === "preview" && currentBatch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/40 rounded-lg border border-border/60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-center px-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] uppercase text-muted-foreground font-semibold",
										children: "Total"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono font-bold text-sm text-foreground",
										children: currentBatch.summary.totalRows
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-6 bg-border/60" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-center px-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] uppercase text-emerald-600 font-semibold",
										children: "Ready"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono font-bold text-sm text-emerald-600",
										children: currentBatch.summary.validRows
									})]
								}),
								selectedOperation === "UPDATE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-6 bg-border/60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-center px-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] uppercase text-blue-600 font-semibold",
										children: "No-op"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono font-bold text-sm text-blue-600",
										children: currentBatch.summary.noChangeRows
									})]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-6 bg-border/60" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-center px-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] uppercase text-amber-600 font-semibold",
										children: "Warn"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono font-bold text-sm text-amber-600",
										children: currentBatch.summary.warningRows
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-6 bg-border/60" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-center px-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] uppercase text-rose-600 font-semibold",
										children: "Errors"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono font-bold text-sm text-rose-600",
										children: currentBatch.summary.errorRows + currentBatch.summary.blockedRows
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								disabled: isBusy,
								onClick: resetUploadState,
								className: "h-8 text-xs",
								children: "Upload Another"
							}), currentBatch.summary.validRows > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: handleExecuteImport,
								disabled: isBusy || selectedOperation === "DELETE" && !deleteConfirmed,
								className: `h-8 text-xs font-semibold gap-1.5 ${selectedOperation === "DELETE" ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`,
								children: [
									isConfirming ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" }),
									"Execute Commit (",
									currentBatch.summary.validRows,
									")"
								]
							})]
						})]
					}),
					selectedOperation === "DELETE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-between text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-rose-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Destructive deletion: verified rows will be permanently deleted from database." })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center space-x-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								id: "confirm-delete",
								checked: deleteConfirmed,
								onCheckedChange: (c) => setDeleteConfirmed(!!c)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "confirm-delete",
								className: "text-xs font-bold cursor-pointer",
								children: "I Confirm Deletion"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border/60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "py-2.5 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b bg-muted/20",
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Search key, record, error...",
									value: previewSearch,
									onChange: (e) => setPreviewSearch(e.target.value),
									className: "pl-8 h-7 text-xs"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-b-md overflow-x-auto max-h-96",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
									className: "sticky top-0 bg-background/95 backdrop-blur-xs z-10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "bg-muted/40 text-xs",
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
												children: "Status"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "text-[11px]",
												children: "Diagnostics"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "text-right text-[11px]",
												children: "Inspect"
											})
										]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filteredRecords.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									colSpan: 8,
									className: "text-center py-8 text-xs text-muted-foreground",
									children: "No records match current filter."
								}) }) : paginatedRecords.map((record) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "hover:bg-muted/30",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-mono text-[11px] text-muted-foreground",
											children: record.excelRowNumber
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-mono font-semibold text-xs text-foreground",
											children: record.recordKey
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-xs max-w-[180px] truncate text-muted-foreground",
											children: record.recordName || "—"
										}),
										selectedOperation === "UPDATE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: record.changes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "secondary",
											className: "font-mono text-[10px] px-1.5 py-0",
											children: [
												record.changes.length,
												" field",
												record.changes.length > 1 ? "s" : ""
											]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] text-muted-foreground",
											children: "Unmodified"
										}) }),
										selectedOperation === "DELETE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: record.dependencies.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex gap-1 flex-wrap",
											children: record.dependencies.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
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
											className: `text-[10px] ${record.status === "READY" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : record.status === "NO_CHANGE" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : record.status === "WARNING" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" : "bg-rose-500/10 text-rose-600 border-rose-500/30"}`,
											variant: "outline",
											children: record.status
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-xs max-w-[220px] truncate text-muted-foreground",
											children: record.errors.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-rose-600 font-medium",
												children: record.errors[0].message
											}) : record.warnings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-amber-600",
												children: record.warnings[0].message
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-emerald-600 flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3" }), " Ready"]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-right",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "sm",
												onClick: () => setInspectRecord(record),
												className: "h-6 px-2 text-[11px]",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5 text-muted-foreground" })
											})
										})
									]
								}, record.excelRowNumber)) })] })
							}), filteredRecords.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 border-t bg-muted/20 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-muted-foreground text-[11px]",
									children: [
										"Showing ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: Math.min((currentPage - 1) * previewPageSize + 1, filteredRecords.length)
										}),
										" - ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: Math.min(currentPage * previewPageSize, filteredRecords.length)
										}),
										" of ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: filteredRecords.length
										}),
										" records"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] text-muted-foreground",
											children: "Rows per page:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: String(previewPageSize),
											onValueChange: (val) => {
												setPreviewPageSize(Number(val));
												setPreviewPage(1);
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-7 w-[70px] text-xs",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: String(previewPageSize) })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "10",
													children: "10"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "25",
													children: "25"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "50",
													children: "50"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "100",
													children: "100"
												})
											] })]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "outline",
												size: "icon",
												className: "h-7 w-7",
												onClick: () => setPreviewPage((p) => Math.max(1, p - 1)),
												disabled: currentPage <= 1,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-3.5 w-3.5" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[11px] font-mono px-2 text-muted-foreground",
												children: [
													"Page ",
													currentPage,
													" of ",
													totalPages
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "outline",
												size: "icon",
												className: "h-7 w-7",
												onClick: () => setPreviewPage((p) => Math.min(totalPages, p + 1)),
												disabled: currentPage >= totalPages,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" })
											})
										]
									})]
								})]
							})]
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
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-primary h-2.5 rounded-full transition-all duration-300",
								style: { width: `${processingProgress.total > 0 ? Math.round(processingProgress.processed / processingProgress.total * 100) : 0}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-mono text-muted-foreground",
							children: [
								processingProgress.processed,
								" / ",
								processingProgress.total,
								" Records Processed (",
								processingProgress.success,
								" Success, ",
								processingProgress.failed,
								" Failed)"
							]
						})
					]
				})
			}),
			currentStep === "results" && currentBatch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "text-center py-4 border-b bg-muted/20",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto p-2 bg-emerald-500/10 text-emerald-600 rounded-full w-10 h-10 flex items-center justify-center mb-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-6 w-6" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base font-bold",
							children: "Import Execution Finished"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
							className: "text-xs font-mono",
							children: [
								"Batch #",
								currentBatch.batchIdentifier,
								" completed for ",
								module.toUpperCase(),
								" (",
								selectedOperation,
								")."
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
								children: "Download Outcome Reports"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									onClick: handleDownloadResults,
									className: "justify-start gap-2 h-auto py-2.5 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 text-emerald-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-left truncate",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-xs",
											children: "Full Result Report (.xlsx)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground",
											children: "6 audit & reconciliation sheets"
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
											children: "Failed Records (.xlsx)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground",
											children: "Pre-annotated error reasons"
										})]
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: resetUploadState,
								className: "text-xs",
								children: "Import Another File"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => setCurrentStep("history"),
								className: "text-xs gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" }), " View Audit History"]
							})]
						})
					]
				})]
			}),
			currentStep === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "py-3 px-4 flex flex-row items-center justify-between border-b bg-muted/20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-sm font-semibold",
						children: [
							"Audit Logs & Execution History (",
							module.toUpperCase(),
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
						className: "text-xs",
						children: [
							"Complete historical record of all bulk operations performed on ",
							module,
							" master data."
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => setCurrentStep("upload"),
						className: "h-7 text-xs",
						children: "Back to Upload"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0",
					children: historyBatches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center py-12 text-xs text-muted-foreground",
						children: [
							"No past execution batches recorded for ",
							module,
							"."
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-b-md border-t overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
							className: "bg-muted/40 text-[11px]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "py-2 px-2.5 font-semibold",
									children: "Batch ID"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "py-2 px-2 font-semibold",
									children: "Action"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "py-2 px-2.5 font-semibold",
									children: "File Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "py-2 px-2 font-semibold",
									children: "User"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "py-2 px-2 text-center font-semibold",
									children: "Total Rows"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "py-2 px-2 text-center font-semibold text-emerald-600",
									children: "Committed"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "py-2 px-2 text-center font-semibold text-rose-600",
									children: "Errors"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "py-2 px-2 font-semibold",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "py-2 px-2.5 font-semibold",
									children: "Date & Time"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "py-2 px-2 text-right font-semibold",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: historyBatches.map((batch) => {
							const totalRows = batch.summary?.totalRows ?? batch.totalRecords ?? batch.records?.length ?? 0;
							const successRows = batch.summary?.successRows ?? batch.successRecords ?? 0;
							const failedRows = batch.summary?.failedRows ?? batch.failedRecords ?? (batch.status === "FAILED" && successRows === 0 ? totalRows : 0);
							const displayDate = batch.uploadedAt ? new Date(batch.uploadedAt).toLocaleString() : batch.createdAt ? new Date(batch.createdAt).toLocaleString() : "Recent";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "hover:bg-muted/40 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "py-2 px-2.5 font-mono text-[11px] font-bold",
										children: batch.batchIdentifier || batch.id.slice(0, 8)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "py-2 px-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: batch.operation === "DELETE" ? "destructive" : "outline",
											className: "text-[9px] font-bold uppercase px-1.5 py-0",
											children: batch.operation
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "py-2 px-2.5 text-[11px] truncate max-w-[150px] font-mono",
										title: batch.fileName,
										children: batch.fileName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "py-2 px-2 text-[11px] font-mono text-muted-foreground truncate max-w-[100px]",
										children: batch.uploadedBy?.name || batch.createdBy || "Admin"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "py-2 px-2 text-center font-mono font-semibold text-[11px]",
										children: totalRows
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "py-2 px-2 text-center font-mono text-emerald-600 font-bold text-[11px]",
										children: successRows
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "py-2 px-2 text-center font-mono text-rose-600 font-bold text-[11px]",
										children: failedRows
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "py-2 px-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: batch.status === "COMPLETED" ? "outline" : batch.status === "FAILED" ? "destructive" : "secondary",
											className: `text-[9px] font-bold px-1.5 py-0 ${batch.status === "COMPLETED" ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" : ""}`,
											children: batch.status
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "py-2 px-2.5 text-[11px] text-muted-foreground whitespace-nowrap",
										children: displayDate
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "py-2 px-2 text-right space-x-1 whitespace-nowrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "ghost",
											size: "sm",
											className: "h-6 px-1.5 text-[11px] font-semibold",
											onClick: () => {
												setCurrentBatch(batch);
												setCurrentStep("preview");
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3 mr-1 text-primary" }), " View"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "sm",
											className: "h-6 w-6 p-0",
											title: "Download Result Excel Report",
											onClick: () => {
												const data = ResultExcelGenerator.generateResultWorkbook(batch);
												ResultExcelGenerator.triggerDownload(data, `${batch.batchIdentifier}_Result_Report.xlsx`);
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3 w-3 text-muted-foreground hover:text-foreground" })
										})]
									})
								]
							}, batch.id);
						}) })] })
					})
				})]
			}),
			inspectRecord && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!inspectRecord,
				onOpenChange: (open) => !open && setInspectRecord(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center justify-between text-sm font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4 text-primary" }),
									" Row ",
									inspectRecord.excelRowNumber,
									": ",
									inspectRecord.recordKey
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: inspectRecord.status === "READY" ? "outline" : inspectRecord.status === "WARNING" ? "secondary" : "destructive",
								className: "text-xs",
								children: inspectRecord.status
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Detailed field breakdown, validation rules, and difference mapping."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-1",
							children: [
								inspectRecord.errors.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 bg-rose-500/10 border border-rose-500/30 rounded-md text-xs text-rose-800 dark:text-rose-300 space-y-1",
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
								inspectRecord.warnings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 bg-amber-500/10 border border-amber-500/30 rounded-md text-xs text-amber-800 dark:text-amber-300 space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-semibold flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-amber-600" }), " Validation Warnings & Notices:"]
									}), inspectRecord.warnings.map((w, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "ml-5 font-mono",
										children: [
											"[",
											w.code || "WARN",
											"] ",
											w.message,
											" ",
											w.resolution && `— ${w.resolution}`
										]
									}, idx))]
								}),
								selectedOperation === "UPDATE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "font-semibold text-xs uppercase tracking-wider text-muted-foreground",
										children: "Field Modifications"
									}), inspectRecord.changes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground italic",
										children: "No fields were modified in this row."
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded border overflow-hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Field" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Original Value" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "New Value" }),
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
export { ExcelImportEmbedded as t };
