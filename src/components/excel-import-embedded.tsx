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
  
  // Preview filtering & search
  const [previewTab, setPreviewTab] = useState<string>("ALL");
  const [previewSearch, setPreviewSearch] = useState("");
  const [inspectRecord, setInspectRecord] = useState<ImportParsedRecord | null>(null);
  
  // Confirmation state
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ processed: 0, total: 0, success: 0, failed: 0 });

  // History & Audit state
  const [historyBatches, setHistoryBatches] = useState<ImportBatch[]>([]);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const currentUser = getCurrentProfile();
      const userEmail = currentUser?.email || "admin@pms-system.qa";
      
      const batch = await ExcelImportEngine.parseAndValidate(
        buffer,
        file.name,
        module,
        selectedOperation,
        userEmail
      );

      setCurrentBatch(batch);
      setCurrentStep("preview");
      toast.success(`Validated ${batch.totalRecords} rows: ${batch.validRecords} Valid, ${batch.warningRecords} Warnings, ${batch.errorRecords} Errors`, { id: "parsing-toast" });
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
        total: currentBatch.totalRecords,
        success: 0,
        failed: 0,
      });

      const currentUser = getCurrentProfile();
      const userEmail = currentUser?.email || "admin@pms-system.qa";

      const finalBatch = await ExcelImportEngine.executeBatch(
        currentBatch,
        userEmail,
        (progress) => {
          setProcessingProgress({
            processed: progress.processed,
            total: progress.total,
            success: progress.success,
            failed: progress.failed,
          });
        }
      );

      setCurrentBatch(finalBatch);
      setCurrentStep("results");
      toast.success(`Import operation complete! ${finalBatch.successRecords} Succeeded, ${finalBatch.failedRecords} Failed.`);
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
  const handleDownloadResults = async () => {
    if (!currentBatch) return;
    try {
      const buffer = await ResultExcelGenerator.generateResultWorkbook(currentBatch);
      ResultExcelGenerator.downloadResultFile(currentBatch, buffer);
      toast.success("Detailed execution result workbook downloaded.");
    } catch (err: any) {
      toast.error(`Failed to generate results file: ${err.message}`);
    }
  };

  // Filtered Preview Records
  const filteredRecords = useMemo(() => {
    if (!currentBatch) return [];
    return currentBatch.records.filter((rec) => {
      if (previewTab !== "ALL" && rec.status !== previewTab) return false;
      if (!previewSearch.trim()) return true;
      const search = previewSearch.toLowerCase();
      return (
        rec.identifier.toLowerCase().includes(search) ||
        Object.values(rec.parsedData).some((val) => String(val).toLowerCase().includes(search)) ||
        rec.errors.some((e) => e.message.toLowerCase().includes(search))
      );
    });
  }, [currentBatch, previewTab, previewSearch]);

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
              onClick={() => setCurrentStep(currentStep === "history" ? "upload" : "history")}
              className="text-xs gap-1.5"
            >
              <Clock className="h-3.5 w-3.5" />
              {currentStep === "history" ? "Back to Upload" : "Execution History"}
            </Button>
          )}
          {currentStep !== "upload" && currentStep !== "history" && (
            <Button variant="outline" size="sm" onClick={resetUploadState} className="text-xs">
              Start New Import
            </Button>
          )}
        </div>
      </div>

      {/* Operation Tabs */}
      {currentStep !== "history" && (
        <Tabs
          value={selectedOperation}
          onValueChange={(val) => handleOperationChange(val as ImportOperation)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="CREATE" className="text-xs font-medium">CREATE (New)</TabsTrigger>
            <TabsTrigger value="UPDATE" className="text-xs font-medium">UPDATE (Modify)</TabsTrigger>
            <TabsTrigger value="DELETE" className="text-xs font-medium text-destructive">DELETE (Remove)</TabsTrigger>
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
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Rows</p>
                  <p className="text-xl font-bold">{currentBatch.totalRecords}</p>
                </div>
                <FileText className="h-6 w-6 text-muted-foreground/60" />
              </CardContent>
            </Card>

            <Card className="border-border/60 border-l-4 border-l-emerald-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Valid (Ready)</p>
                  <p className="text-xl font-bold text-emerald-600">{currentBatch.validRecords}</p>
                </div>
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </CardContent>
            </Card>

            <Card className="border-border/60 border-l-4 border-l-amber-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Warnings</p>
                  <p className="text-xl font-bold text-amber-600">{currentBatch.warningRecords}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </CardContent>
            </Card>

            <Card className="border-border/60 border-l-4 border-l-destructive">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Errors (Blocked)</p>
                  <p className="text-xl font-bold text-destructive">{currentBatch.errorRecords}</p>
                </div>
                <XCircle className="h-6 w-6 text-destructive" />
              </CardContent>
            </Card>
          </div>

          {/* Delete Danger Warning */}
          {selectedOperation === "DELETE" && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="h-4 w-4" /> Permanent Bulk Deletion Safety Check
              </div>
              <p className="text-xs text-muted-foreground">
                You are about to delete records from <span className="font-semibold text-foreground uppercase">{module}</span>. Any records with active foreign references (e.g. occupied units, active leases, assigned assets) will be strictly BLOCKED to prevent cascade data corruption.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="confirm-delete"
                  checked={deleteConfirmed}
                  onCheckedChange={(c) => setDeleteConfirmed(!!c)}
                />
                <Label htmlFor="confirm-delete" className="text-xs font-semibold cursor-pointer text-foreground">
                  I understand this action permanently deletes valid records and cannot be undone.
                </Label>
              </div>
            </div>
          )}

          {/* Preview Table Section */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold">Pre-Execution Validation Grid</CardTitle>
                <CardDescription className="text-xs">
                  Review validated records, field diffs, foreign key links, and rule violations.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search preview rows..."
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Tabs value={previewTab} onValueChange={setPreviewTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 max-w-sm h-8">
                  <TabsTrigger value="ALL" className="text-xs">All ({currentBatch.totalRecords})</TabsTrigger>
                  <TabsTrigger value="VALID" className="text-xs text-emerald-600">Valid ({currentBatch.validRecords})</TabsTrigger>
                  <TabsTrigger value="WARNING" className="text-xs text-amber-600">Warnings ({currentBatch.warningRecords})</TabsTrigger>
                  <TabsTrigger value="ERROR" className="text-xs text-destructive">Errors ({currentBatch.errorRecords})</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 text-xs">
                      <TableHead className="w-16">Row #</TableHead>
                      <TableHead className="w-32">Status</TableHead>
                      <TableHead>Identifier / Key</TableHead>
                      <TableHead>Operation / Summary</TableHead>
                      <TableHead>Validation Feedback</TableHead>
                      <TableHead className="text-right w-20">Inspect</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                          No records match current filter.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.slice(0, 50).map((record) => (
                        <TableRow key={record.rowIndex}>
                          <TableCell className="font-mono text-xs font-medium">{record.rowIndex}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.status === "VALID"
                                  ? "outline"
                                  : record.status === "WARNING"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className={`text-[10px] ${
                                record.status === "VALID" ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" : ""
                              }`}
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs font-semibold">
                            {record.identifier || "—"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {selectedOperation === "UPDATE" ? (
                              <span className="text-muted-foreground">
                                {record.changes.length} field(s) modified
                              </span>
                            ) : selectedOperation === "DELETE" ? (
                              <span className="text-muted-foreground">
                                {record.dependencies.length} dependency check(s)
                              </span>
                            ) : (
                              <span className="text-muted-foreground">New master record</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs max-w-xs truncate">
                            {record.errors.length > 0 ? (
                              <span className="text-destructive font-medium">
                                {record.errors.map((e) => e.message).join("; ")}
                              </span>
                            ) : record.warnings.length > 0 ? (
                              <span className="text-amber-600 font-medium">
                                {record.warnings.map((w) => w.message).join("; ")}
                              </span>
                            ) : (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Ready for processing
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setInspectRecord(record)}
                              className="h-7 w-7 p-0"
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

              {filteredRecords.length > 50 && (
                <p className="text-xs text-muted-foreground text-center">
                  Showing first 50 of {filteredRecords.length} records.
                </p>
              )}

              {/* Bottom Action Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={resetUploadState} className="text-xs">
                  Discard & Re-upload
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleExecuteImport}
                    disabled={
                      isConfirming ||
                      (currentBatch.validRecords === 0 && currentBatch.warningRecords === 0) ||
                      (selectedOperation === "DELETE" && !deleteConfirmed)
                    }
                    className={`text-xs gap-2 ${
                      selectedOperation === "DELETE" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""
                    }`}
                  >
                    {isConfirming ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    )}
                    Execute {selectedOperation} Batch ({currentBatch.validRecords + currentBatch.warningRecords} Records)
                  </Button>
                </div>
              </div>
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
              {processingProgress.processed} / {processingProgress.total} Records Processed
            </p>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: FINAL RESULTS & DOWNLOAD */}
      {currentStep === "results" && currentBatch && (
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <FileCheck className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Import Execution Finished</CardTitle>
                <CardDescription className="text-xs">
                  Batch <span className="font-mono">{currentBatch.id}</span> completed for {module.toUpperCase()} ({selectedOperation}).
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/40 border text-center">
                <p className="text-xs text-muted-foreground">Total Ingested</p>
                <p className="text-2xl font-bold">{currentBatch.totalRecords}</p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                <p className="text-xs text-emerald-600 font-medium">Successfully Committed</p>
                <p className="text-2xl font-bold text-emerald-700">{currentBatch.successRecords}</p>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                <p className="text-xs text-destructive font-medium">Failed / Skipped</p>
                <p className="text-2xl font-bold text-destructive">{currentBatch.failedRecords}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={resetUploadState} className="text-xs">
                Import Another File
              </Button>

              <Button onClick={handleDownloadResults} className="text-xs gap-2">
                <Download className="h-3.5 w-3.5" /> Download Result Report (.xlsx)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 5: HISTORY TAB */}
      {currentStep === "history" && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Audit Logs & Execution History ({module.toUpperCase()})</CardTitle>
            <CardDescription className="text-xs">
              Complete historical record of all bulk operations performed on {module} master data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyBatches.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground">
                No past execution batches recorded for {module}.
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 text-xs">
                      <TableHead>Batch ID</TableHead>
                      <TableHead>Operation</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Executed By</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Date / Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-mono text-xs font-semibold">{batch.id}</TableCell>
                        <TableCell>
                          <Badge variant={batch.operation === "DELETE" ? "destructive" : "outline"} className="text-[10px]">
                            {batch.operation}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs truncate max-w-xs">{batch.fileName}</TableCell>
                        <TableCell className="text-xs font-mono">{batch.createdBy}</TableCell>
                        <TableCell className="text-xs">
                          <span className="text-emerald-600 font-semibold">{batch.successRecords} OK</span>
                          {batch.failedRecords > 0 && <span className="text-destructive ml-1">({batch.failedRecords} Fail)</span>}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(batch.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
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
              <DialogTitle className="flex items-center gap-2 text-sm font-bold">
                <Eye className="h-4 w-4 text-primary" /> Row {inspectRecord.rowIndex}: {inspectRecord.identifier}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Detailed field breakdown, validation rules, and difference mapping.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
              {/* Status Badge & Messages */}
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                <div>
                  <p className="text-xs font-semibold text-foreground">Record Status</p>
                  <p className="text-[11px] text-muted-foreground">
                    {inspectRecord.errors.length > 0
                      ? inspectRecord.errors.map(e => e.message).join(", ")
                      : inspectRecord.warnings.length > 0
                      ? inspectRecord.warnings.map(w => w.message).join(", ")
                      : "Passed all validation tests"}
                  </p>
                </div>
                <Badge
                  variant={inspectRecord.status === "VALID" ? "outline" : inspectRecord.status === "WARNING" ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {inspectRecord.status}
                </Badge>
              </div>

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
