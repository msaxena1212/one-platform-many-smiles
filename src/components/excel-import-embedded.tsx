import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertCircle,
  FileCheck,
  Building2,
  DoorOpen,
  Users,
  Package,
  FileSignature,
  UserCheck,
  Loader2,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import type { ImportModule, ImportOperation, ImportBatch, ImportParsedRecord, ImportRowStatus } from "@/lib/excel-import/types";
import { ExcelImportEngine } from "@/lib/excel-import/engine";
import { generateTemplateWorkbook, downloadTemplateFile } from "@/lib/excel-import/template-generator";
import { ResultExcelGenerator } from "@/lib/excel-import/result-generator";
import { getImportBatchHistory, getAuditLogs } from "@/lib/excel-import/storage-service";
import { getCurrentProfile } from "@/lib/auth-guards";

interface ExcelImportEmbeddedProps {
  module: ImportModule;
  defaultOperation?: ImportOperation;
  title?: string;
  description?: string;
  onCompleted?: () => void;
  hideHistory?: boolean;
}

export function ExcelImportEmbedded({
  module,
  defaultOperation = "CREATE",
  title,
  description,
  onCompleted,
  hideHistory = false,
}: ExcelImportEmbeddedProps) {
  const [selectedOperation, setSelectedOperation] = useState<ImportOperation>(defaultOperation);
  
  // Workflow step: 1: upload, 2: preview, 3: processing, 4: results, 5: history
  const [currentStep, setCurrentStep] = useState<"upload" | "preview" | "processing" | "results" | "history">("upload");
  
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<ImportBatch | null>(null);
  
  // Preview filtering & search & pagination
  const [previewTab, setPreviewTab] = useState<string>("ALL");
  const [previewSearch, setPreviewSearch] = useState("");
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [previewPageSize, setPreviewPageSize] = useState<number>(25);
  const [inspectRecord, setInspectRecord] = useState<ImportParsedRecord | null>(null);
  
  // Confirmation state
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ processed: 0, total: 0, success: 0, failed: 0 });

  // History & Audit state
  const [historyBatches, setHistoryBatches] = useState<ImportBatch[]>([]);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Always reset to upload view whenever module or defaultOperation changes
  useEffect(() => {
    setSelectedOperation(defaultOperation);
    resetUploadState();
  }, [module, defaultOperation]);

  useEffect(() => {
    setHistoryBatches(getImportBatchHistory().filter(b => b.module === module));
  }, [currentStep, module]);

  const handleOperationChange = (newOp: ImportOperation) => {
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Download template
  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      const data = await generateTemplateWorkbook(module, selectedOperation);
      downloadTemplateFile(module, selectedOperation, data);
      toast.success(`Template for ${module.toUpperCase()} (${selectedOperation}) downloaded.`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate template");
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Process & Parse File
  const processFile = async (file: File) => {
    try {
      setIsParsing(true);
      toast.loading("Analyzing and validating Excel file...", { id: "parsing-toast" });
      
      const buffer = await file.arrayBuffer();
      let currentUser = { id: "admin-user", name: "Admin User", email: "admin@stayhub.qa" };
      try {
        const prof = await getCurrentProfile();
        if (prof) {
          currentUser = { id: prof.id, name: prof.full_name || "Admin User", email: (prof as any).email || "admin@stayhub.qa" };
        }
      } catch {
        // fallback
      }
      
      const batch = await ExcelImportEngine.parseAndValidate(
        buffer,
        file.name,
        module,
        selectedOperation,
        currentUser
      );

      setCurrentBatch(batch);
      setCurrentStep("preview");
      toast.success(
        `Validated ${batch.summary.totalRows} rows: ${batch.summary.validRows} ready, ${batch.summary.errorRows} errors.`,
        { id: "parsing-toast" }
      );
    } catch (err: any) {
      toast.error(`Import parsing failed: ${err.message || "Unknown error"}`, { id: "parsing-toast" });
      resetUploadState();
    } finally {
      setIsParsing(false);
    }
  };

  // Execute Batch
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
        failed: 0,
      });

      let currentUser = { id: "admin-user", name: "Admin User" };
      try {
        const prof = await getCurrentProfile();
        if (prof) currentUser = { id: prof.id, name: prof.full_name || "Admin User" };
      } catch {
        // fallback
      }

      const finalBatch = await ExcelImportEngine.commitBatch(
        currentBatch,
        currentUser,
        (processed, total, success, failed) => {
          setProcessingProgress({
            processed,
            total,
            success,
            failed,
          });
        }
      );

      setCurrentBatch({ ...finalBatch });
      setCurrentStep("results");
      setHistoryBatches(getImportBatchHistory().filter(b => b.module === module));
      toast.success(`Import operation complete! ${finalBatch.summary.successRows} Succeeded, ${finalBatch.summary.failedRows} Failed.`);
      try {
        window.dispatchEvent(new CustomEvent("pms_data_updated"));
      } catch {}
      if (onCompleted) {
        onCompleted();
      }
    } catch (err: any) {
      toast.error(`Execution failed: ${err.message || "Database update error"}`);
      setCurrentStep("preview");
    } finally {
      setIsConfirming(false);
    }
  };

  // Download Result Excel
  const handleDownloadResults = () => {
    if (!currentBatch) return;
    try {
      const buffer = ResultExcelGenerator.generateResultWorkbook(currentBatch);
      ResultExcelGenerator.triggerDownload(buffer, `${currentBatch.batchIdentifier}_Result_Report.xlsx`);
      toast.success("Detailed execution result workbook downloaded.");
    } catch (err: any) {
      toast.error(`Failed to generate results file: ${err.message}`);
    }
  };

  const handleDownloadFailedRecords = () => {
    if (!currentBatch) return;
    try {
      const buffer = ResultExcelGenerator.generateFailedRecordsWorkbook(currentBatch);
      ResultExcelGenerator.triggerDownload(buffer, `${currentBatch.batchIdentifier}_Failed_Records.xlsx`);
      toast.success("Failed records workbook downloaded.");
    } catch (err: any) {
      toast.error(`Failed to generate failed records file: ${err.message}`);
    }
  };

  // Filtered Preview Records
  const filteredRecords = useMemo(() => {
    if (!currentBatch) return [];
    return currentBatch.records.filter((rec) => {
      if (previewTab === "READY" && rec.status !== "READY") return false;
      if (previewTab === "NO_CHANGE" && rec.status !== "NO_CHANGE") return false;
      if (previewTab === "WARNING" && rec.status !== "WARNING") return false;
      if (previewTab === "ERRORS" && rec.status !== "ERROR" && rec.status !== "BLOCKED") return false;
      if (!previewSearch.trim()) return true;
      const search = previewSearch.toLowerCase();
      return (
        rec.recordKey.toLowerCase().includes(search) ||
        (rec.recordName && rec.recordName.toLowerCase().includes(search)) ||
        Object.values(rec.rawRowData || {}).some((val) => String(val).toLowerCase().includes(search)) ||
        rec.errors.some((e) => e.message.toLowerCase().includes(search)) ||
        rec.warnings.some((w) => w.message.toLowerCase().includes(search))
      );
    });
  }, [currentBatch, previewTab, previewSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / previewPageSize));
  const currentPage = Math.min(previewPage, totalPages);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * previewPageSize;
    return filteredRecords.slice(start, start + previewPageSize);
  }, [filteredRecords, currentPage, previewPageSize]);

  const isBusy = isParsing || isConfirming || currentStep === "processing";

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            {title || `Excel Bulk Import & Management: ${module.toUpperCase()}`}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {description || `Production-grade bulk CREATE, UPDATE, and DELETE pipeline for ${module} master data.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!hideHistory && (
            <Button
              variant={currentStep === "history" ? "secondary" : "outline"}
              size="sm"
              disabled={isBusy}
              onClick={() => setCurrentStep(currentStep === "history" ? "upload" : "history")}
              className="text-xs gap-1.5"
            >
              <Clock className="h-3.5 w-3.5" />
              {currentStep === "history" ? "Back to Upload" : "Execution History"}
            </Button>
          )}
          {currentStep !== "upload" && currentStep !== "history" && (
            <Button variant="outline" size="sm" disabled={isBusy} onClick={resetUploadState} className="text-xs">
              Start New Import
            </Button>
          )}
        </div>
      </div>

      {/* Operation Tabs */}
      {currentStep !== "history" && (
        <Tabs
          value={selectedOperation}
          onValueChange={(val) => !isBusy && handleOperationChange(val as ImportOperation)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="CREATE" disabled={isBusy} className="text-xs font-medium">CREATE (New)</TabsTrigger>
            <TabsTrigger value="UPDATE" disabled={isBusy} className="text-xs font-medium">UPDATE (Modify)</TabsTrigger>
            <TabsTrigger value="DELETE" disabled={isBusy} className="text-xs font-medium text-destructive">DELETE (Remove)</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* STEP 1: UPLOAD & TEMPLATE VIEW */}
      {currentStep === "upload" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 Card: Template Download */}
          <Card className="md:col-span-1 border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" /> 1. Get Standard Excel Template
              </CardTitle>
              <CardDescription className="text-xs">
                Download the formatted XLSX workbook with dropdown validations, field requirements, and sample records.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-md border border-border/40 text-xs space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Module:</span>
                  <span className="uppercase text-foreground font-semibold">{module}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Action:</span>
                  <Badge variant={selectedOperation === "DELETE" ? "destructive" : "outline"} className="text-[10px] uppercase">
                    {selectedOperation}
                  </Badge>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t">
                  <span>Dropdowns:</span>
                  <span className="text-emerald-600 font-medium">Pre-populated</span>
                </div>
              </div>

              <Button
                onClick={handleDownloadTemplate}
                disabled={isDownloadingTemplate}
                className="w-full text-xs gap-2"
                variant="outline"
              >
                {isDownloadingTemplate ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                Download {module.toUpperCase()} Template (.xlsx)
              </Button>
            </CardContent>
          </Card>

          {/* Step 2 Card: File Upload & Ingest */}
          <Card className="md:col-span-2 border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-primary" /> 2. Upload Filled Excel File
              </CardTitle>
              <CardDescription className="text-xs">
                Upload your completed XLSX file. The engine will inspect mandatory columns, validate foreign keys, verify change diffs, and check dependency safety.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors border-border/70 space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx"
                  className="hidden"
                  disabled={isParsing}
                />
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                  {isParsing ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isParsing ? "Validating records against database..." : "Click or drag & drop Excel workbook (.xlsx)"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports up to 5,000 rows with complete relational integrity checks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 2: VALIDATION PREVIEW & DRILL-DOWN */}
      {currentStep === "preview" && currentBatch && (
        <div className="space-y-4">
          {/* Summary Metric Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/40 rounded-lg border border-border/60">
            <div className="flex items-center gap-3">
              <div className="text-center px-2">
                <p className="text-[10px] uppercase text-muted-foreground font-semibold">Total</p>
                <p className="font-mono font-bold text-sm text-foreground">{currentBatch.summary.totalRows}</p>
              </div>
              <div className="w-px h-6 bg-border/60" />
              <div className="text-center px-2">
                <p className="text-[10px] uppercase text-emerald-600 font-semibold">Ready</p>
                <p className="font-mono font-bold text-sm text-emerald-600">{currentBatch.summary.validRows}</p>
              </div>
              {selectedOperation === "UPDATE" && (
                <>
                  <div className="w-px h-6 bg-border/60" />
                  <div className="text-center px-2">
                    <p className="text-[10px] uppercase text-blue-600 font-semibold">No-op</p>
                    <p className="font-mono font-bold text-sm text-blue-600">{currentBatch.summary.noChangeRows}</p>
                  </div>
                </>
              )}
              <div className="w-px h-6 bg-border/60" />
              <div className="text-center px-2">
                <p className="text-[10px] uppercase text-amber-600 font-semibold">Warn</p>
                <p className="font-mono font-bold text-sm text-amber-600">{currentBatch.summary.warningRows}</p>
              </div>
              <div className="w-px h-6 bg-border/60" />
              <div className="text-center px-2">
                <p className="text-[10px] uppercase text-rose-600 font-semibold">Errors</p>
                <p className="font-mono font-bold text-sm text-rose-600">{currentBatch.summary.errorRows + currentBatch.summary.blockedRows}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={isBusy} onClick={resetUploadState} className="h-8 text-xs">
                Upload Another
              </Button>
              {currentBatch.summary.validRows > 0 && (
                <Button
                  size="sm"
                  onClick={handleExecuteImport}
                  disabled={isBusy || (selectedOperation === "DELETE" && !deleteConfirmed)}
                  className={`h-8 text-xs font-semibold gap-1.5 ${
                    selectedOperation === "DELETE"
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {isConfirming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  Execute Commit ({currentBatch.summary.validRows})
                </Button>
              )}
            </div>
          </div>

          {/* Delete Danger Warning */}
          {selectedOperation === "DELETE" && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>Destructive deletion: verified rows will be permanently deleted from database.</span>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirm-delete"
                  checked={deleteConfirmed}
                  onCheckedChange={(c) => setDeleteConfirmed(!!c)}
                />
                <Label htmlFor="confirm-delete" className="text-xs font-bold cursor-pointer">
                  I Confirm Deletion
                </Label>
              </div>
            </div>
          )}

          {/* Preview Table Section */}
          <Card className="border-border/60">
            <CardHeader className="py-2.5 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b bg-muted/20">
              <Tabs value={previewTab} onValueChange={setPreviewTab} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-4 sm:flex h-7 bg-muted/80 p-0.5">
                  <TabsTrigger value="ALL" className="text-[11px] h-6 px-2.5">All ({currentBatch.summary.totalRows})</TabsTrigger>
                  <TabsTrigger value="READY" className="text-[11px] h-6 px-2.5 text-emerald-600 font-semibold">Ready ({currentBatch.summary.validRows})</TabsTrigger>
                  {selectedOperation === "UPDATE" && (
                    <TabsTrigger value="NO_CHANGE" className="text-[11px] h-6 px-2.5 text-blue-600">No Change ({currentBatch.summary.noChangeRows})</TabsTrigger>
                  )}
                  <TabsTrigger value="ERRORS" className="text-[11px] h-6 px-2.5 text-rose-600 font-semibold">Errors ({currentBatch.summary.errorRows + currentBatch.summary.blockedRows})</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search key, record, error..."
                  value={previewSearch}
                  onChange={(e) => setPreviewSearch(e.target.value)}
                  className="pl-8 h-7 text-xs"
                />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="rounded-b-md overflow-x-auto max-h-96">
                <Table>
                  <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-xs z-10">
                    <TableRow className="bg-muted/40 text-xs">
                      <TableHead className="w-12 text-[11px]">#</TableHead>
                      <TableHead className="text-[11px]">Record Key</TableHead>
                      <TableHead className="text-[11px]">Name / Label</TableHead>
                      {selectedOperation === "UPDATE" && <TableHead className="text-[11px]">Mutations</TableHead>}
                      {selectedOperation === "DELETE" && <TableHead className="text-[11px]">Dependencies</TableHead>}
                      <TableHead className="text-[11px]">Status</TableHead>
                      <TableHead className="text-[11px]">Diagnostics</TableHead>
                      <TableHead className="text-right text-[11px]">Inspect</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                          No records match current filter.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRecords.map((record) => (
                        <TableRow key={record.excelRowNumber} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-[11px] text-muted-foreground">{record.excelRowNumber}</TableCell>
                          <TableCell className="font-mono font-semibold text-xs text-foreground">{record.recordKey}</TableCell>
                          <TableCell className="text-xs max-w-[180px] truncate text-muted-foreground">{record.recordName || "—"}</TableCell>
                          
                          {selectedOperation === "UPDATE" && (
                            <TableCell>
                              {record.changes.length > 0 ? (
                                <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                                  {record.changes.length} field{record.changes.length > 1 ? "s" : ""}
                                </Badge>
                              ) : (
                                <span className="text-[11px] text-muted-foreground">Unmodified</span>
                              )}
                            </TableCell>
                          )}

                          {selectedOperation === "DELETE" && (
                            <TableCell>
                              {record.dependencies.length > 0 ? (
                                <div className="flex gap-1 flex-wrap">
                                  {record.dependencies.map((d, i) => (
                                    <Badge key={i} variant={d.result === "Blocked" ? "destructive" : "outline"} className="text-[9px] px-1 py-0">
                                      {d.dependency}: {d.count}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[11px] text-emerald-600 font-medium">Clean</span>
                              )}
                            </TableCell>
                          )}

                          <TableCell>
                            <Badge
                              className={`text-[10px] ${
                                record.status === "READY"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                  : record.status === "NO_CHANGE"
                                  ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                  : record.status === "WARNING"
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                  : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                              }`}
                              variant="outline"
                            >
                              {record.status}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-xs max-w-[220px] truncate text-muted-foreground">
                            {record.errors.length > 0 ? (
                              <span className="text-rose-600 font-medium">{record.errors[0].message}</span>
                            ) : record.warnings.length > 0 ? (
                              <span className="text-amber-600">{record.warnings[0].message}</span>
                            ) : (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Ready
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setInspectRecord(record)}
                              className="h-6 px-2 text-[11px]"
                            >
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredRecords.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 border-t bg-muted/20 text-xs">
                  <div className="text-muted-foreground text-[11px]">
                    Showing <span className="font-semibold text-foreground">{Math.min((currentPage - 1) * previewPageSize + 1, filteredRecords.length)}</span> - <span className="font-semibold text-foreground">{Math.min(currentPage * previewPageSize, filteredRecords.length)}</span> of <span className="font-semibold text-foreground">{filteredRecords.length}</span> records
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">Rows per page:</span>
                      <Select
                        value={String(previewPageSize)}
                        onValueChange={(val) => {
                          setPreviewPageSize(Number(val));
                          setPreviewPage(1);
                        }}
                      >
                        <SelectTrigger className="h-7 w-[70px] text-xs">
                          <SelectValue placeholder={String(previewPageSize)} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-[11px] font-mono px-2 text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setPreviewPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 3: PROCESSING PROGRESS */}
      {currentStep === "processing" && (
        <Card className="border-border/60">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <div>
              <h3 className="text-base font-semibold">Ingesting & Committing Records...</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Applying updates, writing audit logs, and recalculating cache states.
              </p>
            </div>
            <div className="w-full max-w-md bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    processingProgress.total > 0
                      ? Math.round((processingProgress.processed / processingProgress.total) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className="text-xs font-mono text-muted-foreground">
              {processingProgress.processed} / {processingProgress.total} Records Processed ({processingProgress.success} Success, {processingProgress.failed} Failed)
            </p>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: FINAL RESULTS & DOWNLOAD */}
      {currentStep === "results" && currentBatch && (
        <Card className="border-border/60">
          <CardHeader className="text-center py-4 border-b bg-muted/20">
            <div className="mx-auto p-2 bg-emerald-500/10 text-emerald-600 rounded-full w-10 h-10 flex items-center justify-center mb-1">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-base font-bold">Import Execution Finished</CardTitle>
            <CardDescription className="text-xs font-mono">
              Batch #{currentBatch.batchIdentifier} completed for {module.toUpperCase()} ({selectedOperation}).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center p-3 bg-muted/40 rounded-lg border border-border/40">
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Successfully Processed</p>
                <p className="text-xl font-bold text-emerald-600 font-mono mt-0.5">{currentBatch.summary.successRows}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Failed Rows</p>
                <p className="text-xl font-bold text-rose-600 font-mono mt-0.5">{currentBatch.summary.failedRows}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">No Change (Skipped)</p>
                <p className="text-xl font-bold text-blue-600 font-mono mt-0.5">{currentBatch.summary.noChangeRows}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Download Outcome Reports</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleDownloadResults} className="justify-start gap-2 h-auto py-2.5 text-xs">
                  <Download className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div className="text-left truncate">
                    <p className="font-semibold text-xs">Full Result Report (.xlsx)</p>
                    <p className="text-[10px] text-muted-foreground">6 audit & reconciliation sheets</p>
                  </div>
                </Button>

                {currentBatch.summary.failedRows > 0 && (
                  <Button variant="outline" onClick={handleDownloadFailedRecords} className="justify-start gap-2 h-auto py-2.5 text-xs border-rose-200 hover:bg-rose-500/10">
                    <Download className="h-4 w-4 text-rose-600 shrink-0" />
                    <div className="text-left truncate">
                      <p className="font-semibold text-xs text-rose-600">Failed Records (.xlsx)</p>
                      <p className="text-[10px] text-muted-foreground">Pre-annotated error reasons</p>
                    </div>
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t">
              <Button variant="outline" size="sm" onClick={resetUploadState} className="text-xs">
                Import Another File
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep("history")} className="text-xs gap-1.5">
                <Clock className="h-3.5 w-3.5" /> View Audit History
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 5: HISTORY TAB */}
      {currentStep === "history" && (
        <Card className="border-border/60">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b bg-muted/20">
            <div>
              <CardTitle className="text-sm font-semibold">Audit Logs & Execution History ({module.toUpperCase()})</CardTitle>
              <CardDescription className="text-xs">
                Complete historical record of all bulk operations performed on {module} master data.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => setCurrentStep("upload")} className="h-7 text-xs">
              Back to Upload
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {historyBatches.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground">
                No past execution batches recorded for {module}.
              </div>
            ) : (
              <div className="rounded-b-md border-t overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 text-[11px]">
                      <TableHead className="py-2 px-2.5 font-semibold">Batch ID</TableHead>
                      <TableHead className="py-2 px-2 font-semibold">Action</TableHead>
                      <TableHead className="py-2 px-2.5 font-semibold">File Name</TableHead>
                      <TableHead className="py-2 px-2 font-semibold">User</TableHead>
                      <TableHead className="py-2 px-2 text-center font-semibold">Total Rows</TableHead>
                      <TableHead className="py-2 px-2 text-center font-semibold text-emerald-600">Committed</TableHead>
                      <TableHead className="py-2 px-2 text-center font-semibold text-rose-600">Errors</TableHead>
                      <TableHead className="py-2 px-2 font-semibold">Status</TableHead>
                      <TableHead className="py-2 px-2.5 font-semibold">Date & Time</TableHead>
                      <TableHead className="py-2 px-2 text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyBatches.map((batch) => {
                      const totalRows = batch.summary?.totalRows ?? (batch as any).totalRecords ?? batch.records?.length ?? 0;
                      const successRows = batch.summary?.successRows ?? (batch as any).successRecords ?? 0;
                      const failedRows = batch.summary?.failedRows ?? (batch as any).failedRecords ?? (batch.status === "FAILED" && successRows === 0 ? totalRows : 0);
                      const displayDate = batch.uploadedAt
                        ? new Date(batch.uploadedAt).toLocaleString()
                        : (batch as any).createdAt
                        ? new Date((batch as any).createdAt).toLocaleString()
                        : "Recent";

                      return (
                        <TableRow key={batch.id} className="hover:bg-muted/40 text-xs">
                          <TableCell className="py-2 px-2.5 font-mono text-[11px] font-bold">{batch.batchIdentifier || batch.id.slice(0, 8)}</TableCell>
                          <TableCell className="py-2 px-2">
                            <Badge variant={batch.operation === "DELETE" ? "destructive" : "outline"} className="text-[9px] font-bold uppercase px-1.5 py-0">
                              {batch.operation}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2 px-2.5 text-[11px] truncate max-w-[150px] font-mono" title={batch.fileName}>{batch.fileName}</TableCell>
                          <TableCell className="py-2 px-2 text-[11px] font-mono text-muted-foreground truncate max-w-[100px]">{batch.uploadedBy?.name || (batch as any).createdBy || "Admin"}</TableCell>
                          <TableCell className="py-2 px-2 text-center font-mono font-semibold text-[11px]">{totalRows}</TableCell>
                          <TableCell className="py-2 px-2 text-center font-mono text-emerald-600 font-bold text-[11px]">{successRows}</TableCell>
                          <TableCell className="py-2 px-2 text-center font-mono text-rose-600 font-bold text-[11px]">{failedRows}</TableCell>
                          <TableCell className="py-2 px-2">
                            <Badge
                              variant={batch.status === "COMPLETED" ? "outline" : batch.status === "FAILED" ? "destructive" : "secondary"}
                              className={`text-[9px] font-bold px-1.5 py-0 ${
                                batch.status === "COMPLETED" ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" : ""
                              }`}
                            >
                              {batch.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2 px-2.5 text-[11px] text-muted-foreground whitespace-nowrap">
                            {displayDate}
                          </TableCell>
                          <TableCell className="py-2 px-2 text-right space-x-1 whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1.5 text-[11px] font-semibold"
                              onClick={() => {
                                setCurrentBatch(batch);
                                setCurrentStep("preview");
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1 text-primary" /> View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              title="Download Result Excel Report"
                              onClick={() => {
                                const data = ResultExcelGenerator.generateResultWorkbook(batch);
                                ResultExcelGenerator.triggerDownload(data, `${batch.batchIdentifier}_Result_Report.xlsx`);
                              }}
                            >
                              <Download className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ROW INSPECT MODAL */}
      {inspectRecord && (
        <Dialog open={!!inspectRecord} onOpenChange={(open) => !open && setInspectRecord(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between text-sm font-bold">
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" /> Row {inspectRecord.excelRowNumber}: {inspectRecord.recordKey}
                </span>
                <Badge
                  variant={inspectRecord.status === "READY" ? "outline" : inspectRecord.status === "WARNING" ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {inspectRecord.status}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Detailed field breakdown, validation rules, and difference mapping.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
              {/* Errors/Warnings */}
              {inspectRecord.errors.length > 0 && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-md text-xs text-rose-800 dark:text-rose-300 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-rose-600" /> Validation Errors:
                  </p>
                  {inspectRecord.errors.map((e, idx) => (
                    <p key={idx} className="ml-5 font-mono">[{e.code}] {e.message} {e.resolution && `— ${e.resolution}`}</p>
                  ))}
                </div>
              )}

              {inspectRecord.warnings.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-md text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" /> Validation Warnings & Notices:
                  </p>
                  {inspectRecord.warnings.map((w, idx) => (
                    <p key={idx} className="ml-5 font-mono">[{w.code || 'WARN'}] {w.message} {w.resolution && `— ${w.resolution}`}</p>
                  ))}
                </div>
              )}

              {/* Changes Table for UPDATE */}
              {selectedOperation === "UPDATE" && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Field Modifications</h4>
                  {inspectRecord.changes.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No fields were modified in this row.</p>
                  ) : (
                    <div className="rounded border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Field</TableHead>
                            <TableHead>Original Value</TableHead>
                            <TableHead>New Value</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inspectRecord.changes.map((ch, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium text-xs">{ch.label}</TableCell>
                              <TableCell className="text-xs font-mono text-muted-foreground">{String(ch.oldValue)}</TableCell>
                              <TableCell className="text-xs font-mono font-bold text-primary">{String(ch.newValue)}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-[10px]">{ch.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {/* Dependencies Table for DELETE */}
              {selectedOperation === "DELETE" && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Dependency & Foreign Link Check</h4>
                  <div className="rounded border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dependency</TableHead>
                          <TableHead>Count</TableHead>
                          <TableHead>Evaluation</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inspectRecord.dependencies.map((d, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium text-xs">{d.dependency}</TableCell>
                            <TableCell className="font-mono text-xs">{d.count}</TableCell>
                            <TableCell>
                              <Badge variant={d.result === "Pass" ? "outline" : "destructive"} className="text-[10px]">
                                {d.result}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{d.details}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Raw row values snapshot */}
              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Original Excel Row Data</h4>
                <pre className="p-3 bg-muted rounded text-[11px] font-mono overflow-x-auto max-h-40">
                  {JSON.stringify(inspectRecord.rawRowData, null, 2)}
                </pre>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setInspectRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
