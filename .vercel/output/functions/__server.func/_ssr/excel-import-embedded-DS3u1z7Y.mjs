import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $t as CircleCheck, A as ShieldCheck, At as FileSpreadsheet, Gt as Clock, I as Search, Mt as FileCheck, Pt as Eye, Rt as Download, Wt as CloudUpload, Yt as CircleX, ct as LoaderCircle, h as TriangleAlert, kt as FileText, tn as CircleAlert } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { a as generateTemplateWorkbook, i as downloadTemplateFile, n as ExcelImportEngine, o as getCurrentProfile, r as ResultExcelGenerator, s as getImportBatchHistory, t as Checkbox } from "./auth-guards-CGXIK8H1.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DJOO1b-0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/excel-import-embedded-DS3u1z7Y.js
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
			const userEmail = getCurrentProfile()?.email || "admin@pms-system.qa";
			const batch = await ExcelImportEngine.parseAndValidate(buffer, file.name, module, selectedOperation, userEmail);
			setCurrentBatch(batch);
			setCurrentStep("preview");
			toast.success(`Validated ${batch.totalRecords} rows: ${batch.validRecords} Valid, ${batch.warningRecords} Warnings, ${batch.errorRecords} Errors`, { id: "parsing-toast" });
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
				total: currentBatch.totalRecords,
				success: 0,
				failed: 0
			});
			const userEmail = getCurrentProfile()?.email || "admin@pms-system.qa";
			const finalBatch = await ExcelImportEngine.executeBatch(currentBatch, userEmail, (progress) => {
				setProcessingProgress({
					processed: progress.processed,
					total: progress.total,
					success: progress.success,
					failed: progress.failed
				});
			});
			setCurrentBatch(finalBatch);
			setCurrentStep("results");
			toast.success(`Import operation complete! ${finalBatch.successRecords} Succeeded, ${finalBatch.failedRecords} Failed.`);
			if (onCompleted) onCompleted();
		} catch (err) {
			toast.error(`Execution failed: ${err.message || "Database update error"}`);
			setCurrentStep("preview");
		} finally {
			setIsConfirming(false);
		}
	};
	const handleDownloadResults = async () => {
		if (!currentBatch) return;
		try {
			const buffer = await ResultExcelGenerator.generateResultWorkbook(currentBatch);
			ResultExcelGenerator.downloadResultFile(currentBatch, buffer);
			toast.success("Detailed execution result workbook downloaded.");
		} catch (err) {
			toast.error(`Failed to generate results file: ${err.message}`);
		}
	};
	const filteredRecords = (0, import_react.useMemo)(() => {
		if (!currentBatch) return [];
		return currentBatch.records.filter((rec) => {
			if (previewTab !== "ALL" && rec.status !== previewTab) return false;
			if (!previewSearch.trim()) return true;
			const search = previewSearch.toLowerCase();
			return rec.identifier.toLowerCase().includes(search) || Object.values(rec.parsedData).some((val) => String(val).toLowerCase().includes(search)) || rec.errors.some((e) => e.message.toLowerCase().includes(search));
		});
	}, [
		currentBatch,
		previewTab,
		previewSearch
	]);
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
						onClick: () => setCurrentStep(currentStep === "history" ? "upload" : "history"),
						className: "text-xs gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" }), currentStep === "history" ? "Back to Upload" : "Execution History"]
					}), currentStep !== "upload" && currentStep !== "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: resetUploadState,
						className: "text-xs",
						children: "Start New Import"
					})]
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
										children: currentBatch.totalRecords
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
										children: currentBatch.validRecords
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
										children: currentBatch.warningRecords
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
										children: currentBatch.errorRecords
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4" }), " Permanent Bulk Deletion Safety Check"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									"You are about to delete records from ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground uppercase",
										children: module
									}),
									". Any records with active foreign references (e.g. occupied units, active leases, assigned assets) will be strictly BLOCKED to prevent cascade data corruption."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									id: "confirm-delete",
									checked: deleteConfirmed,
									onCheckedChange: (c) => setDeleteConfirmed(!!c)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "confirm-delete",
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
													currentBatch.totalRecords,
													")"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
												value: "VALID",
												className: "text-xs text-emerald-600",
												children: [
													"Valid (",
													currentBatch.validRecords,
													")"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
												value: "WARNING",
												className: "text-xs text-amber-600",
												children: [
													"Warnings (",
													currentBatch.warningRecords,
													")"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
												value: "ERROR",
												className: "text-xs text-destructive",
												children: [
													"Errors (",
													currentBatch.errorRecords,
													")"
												]
											})
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-md border overflow-x-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "bg-muted/40 text-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "w-16",
												children: "Row #"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "w-32",
												children: "Status"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Identifier / Key" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Operation / Summary" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Validation Feedback" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "text-right w-20",
												children: "Inspect"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filteredRecords.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										colSpan: 6,
										className: "text-center py-8 text-xs text-muted-foreground",
										children: "No records match current filter."
									}) }) : filteredRecords.slice(0, 50).map((record) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-mono text-xs font-medium",
											children: record.rowIndex
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: record.status === "VALID" ? "outline" : record.status === "WARNING" ? "secondary" : "destructive",
											className: `text-[10px] ${record.status === "VALID" ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" : ""}`,
											children: record.status
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-mono text-xs font-semibold",
											children: record.identifier || "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-xs",
											children: selectedOperation === "UPDATE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-muted-foreground",
												children: [record.changes.length, " field(s) modified"]
											}) : selectedOperation === "DELETE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-muted-foreground",
												children: [record.dependencies.length, " dependency check(s)"]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "New master record"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-xs max-w-xs truncate",
											children: record.errors.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-destructive font-medium",
												children: record.errors.map((e) => e.message).join("; ")
											}) : record.warnings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-amber-600 font-medium",
												children: record.warnings.map((w) => w.message).join("; ")
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-emerald-600 flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3" }), " Ready for processing"]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-right",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "sm",
												onClick: () => setInspectRecord(record),
												className: "h-7 w-7 p-0",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5 text-muted-foreground" })
											})
										})
									] }, record.rowIndex)) })] })
								}),
								filteredRecords.length > 50 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground text-center",
									children: [
										"Showing first 50 of ",
										filteredRecords.length,
										" records."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "sm",
										onClick: resetUploadState,
										className: "text-xs",
										children: "Discard & Re-upload"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											onClick: handleExecuteImport,
											disabled: isConfirming || currentBatch.validRecords === 0 && currentBatch.warningRecords === 0 || selectedOperation === "DELETE" && !deleteConfirmed,
											className: `text-xs gap-2 ${selectedOperation === "DELETE" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}`,
											children: [
												isConfirming ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" }),
												"Execute ",
												selectedOperation,
												" Batch (",
												currentBatch.validRecords + currentBatch.warningRecords,
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
								" Records Processed"
							]
						})
					]
				})
			}),
			currentStep === "results" && currentBatch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
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
							"Batch ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono",
								children: currentBatch.id
							}),
							" completed for ",
							module.toUpperCase(),
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
									children: currentBatch.totalRecords
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-emerald-600 font-medium",
									children: "Successfully Committed"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-2xl font-bold text-emerald-700",
									children: currentBatch.successRecords
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-destructive font-medium",
									children: "Failed / Skipped"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-2xl font-bold text-destructive",
									children: currentBatch.failedRecords
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
							onClick: handleDownloadResults,
							className: "text-xs gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Download Result Report (.xlsx)"]
						})]
					})]
				})]
			}),
			currentStep === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
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
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: historyBatches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center py-12 text-xs text-muted-foreground",
					children: [
						"No past execution batches recorded for ",
						module,
						"."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-md border overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "bg-muted/40 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Batch ID" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Operation" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "File Name" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Executed By" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Records" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date / Time" })
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: historyBatches.map((batch) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs font-semibold",
							children: batch.id
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: batch.operation === "DELETE" ? "destructive" : "outline",
							className: "text-[10px]",
							children: batch.operation
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs truncate max-w-xs",
							children: batch.fileName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs font-mono",
							children: batch.createdBy
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-emerald-600 font-semibold",
								children: [batch.successRecords, " OK"]
							}), batch.failedRecords > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-destructive ml-1",
								children: [
									"(",
									batch.failedRecords,
									" Fail)"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs text-muted-foreground",
							children: new Date(batch.createdAt).toLocaleString()
						})
					] }, batch.id)) })] })
				}) })]
			}),
			inspectRecord && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!inspectRecord,
				onOpenChange: (open) => !open && setInspectRecord(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2 text-sm font-bold",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4 text-primary" }),
								" Row ",
								inspectRecord.rowIndex,
								": ",
								inspectRecord.identifier
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Detailed field breakdown, validation rules, and difference mapping."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between p-3 bg-muted/40 rounded-lg",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-foreground",
										children: "Record Status"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: inspectRecord.errors.length > 0 ? inspectRecord.errors.map((e) => e.message).join(", ") : inspectRecord.warnings.length > 0 ? inspectRecord.warnings.map((w) => w.message).join(", ") : "Passed all validation tests"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: inspectRecord.status === "VALID" ? "outline" : inspectRecord.status === "WARNING" ? "secondary" : "destructive",
										className: "text-xs",
										children: inspectRecord.status
									})]
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
