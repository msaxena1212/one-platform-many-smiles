import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/admin/imports")({
  validateSearch: (search: Record<string, unknown>) => ({
    module: (search.module as ImportModule) || "property",
    op: (search.op as ImportOperation) || "CREATE",
  }),
  component: AdminExcelImportPage,
});

const MODULES: { key: ImportModule; label: string; icon: any; description: string }[] = [
  { key: "property", label: "Property", icon: Building2, description: "Master properties, buildings, zones & cost centers" },
  { key: "unit", label: "Unit", icon: DoorOpen, description: "Apartments, villas, offices, room counts & amenities" },
  { key: "customer", label: "Customer", icon: Users, description: "Individual tenants, corporate clients & KYC documents" },
  { key: "asset", label: "Asset", icon: Package, description: "Fixed assets, HVAC, warranty & employee/unit assignments" },
  { key: "lease", label: "Lease", icon: FileSignature, description: "Lease agreements, terms, rent schedules & deposit tracking" },
  { key: "employee", label: "Employee", icon: UserCheck, description: "HRMS employees, designations, departments & payroll" },
];

export function AdminExcelImportPage() {
  const searchParams = Route.useSearch?.() || {};
  const initialModule = (searchParams.module as ImportModule) || "property";
  const initialOp = (searchParams.op as ImportOperation) || "CREATE";

  const [selectedModule, setSelectedModule] = useState<ImportModule>(initialModule);
  const [selectedOperation, setSelectedOperation] = useState<ImportOperation>(initialOp);
  
  // Workflow step: 1: select/upload, 2: preview, 3: processing, 4: results, 5: history
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
    setHistoryBatches(getImportBatchHistory());
  }, [currentStep]);

  // Handle module/operation change (must reset uploaded file & validation)
  const handleModuleChange = (newModule: ImportModule) => {
    setSelectedModule(newModule);
    resetUploadState();
  };

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
      const data = await generateTemplateWorkbook(selectedModule, selectedOperation);
      downloadTemplateFile(selectedModule, selectedOperation, data);
      toast.success(`Template for ${selectedModule.toUpperCase()} (${selectedOperation}) downloaded.`);
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
    }
  };

  // Validate & Preview Pipeline
  const handleValidateAndPreview = async () => {
    if (!fileToUpload) {
      toast.error("Please select an Excel file to validate.");
      return;
    }

    try {
      setIsParsing(true);
      const buffer = await fileToUpload.arrayBuffer();
      
      let currentUser = { id: "admin-user", name: "Admin User", email: "admin@stayhub.qa" };
      try {
        const prof = await getCurrentProfile();
        if (prof) {
          currentUser = { id: prof.id, name: prof.full_name || "Admin User", email: (prof as any).email || "admin@stayhub.qa" };
        }
      } catch {
        // demo fallback
      }

      const batch = await ExcelImportEngine.parseAndValidate(
        buffer,
        fileToUpload.name,
        selectedModule,
        selectedOperation,
        currentUser
      );

      setCurrentBatch(batch);
      setCurrentStep("preview");
      toast.success(`Validated ${batch.summary.totalRows} rows: ${batch.summary.validRows} ready, ${batch.summary.errorRows} errors.`);
    } catch (e: any) {
      toast.error(e.message || "Validation failed");
    } finally {
      setIsParsing(false);
    }
  };

  // Execute Batch Confirmation
  const handleConfirmAndProcess = async () => {
    if (!currentBatch) return;

    if (selectedOperation === "DELETE" && !deleteConfirmed) {
      toast.error("Please confirm that you understand the destructive nature of the DELETE operation.");
      return;
    }

    try {
      setIsConfirming(true);
      setCurrentStep("processing");

      let currentUser = { id: "admin-user", name: "Admin User" };
      try {
        const prof = await getCurrentProfile();
        if (prof) currentUser = { id: prof.id, name: prof.full_name || "Admin User" };
      } catch {
        // demo fallback
      }

      const processedBatch = await ExcelImportEngine.commitBatch(
        currentBatch,
        currentUser,
        (processed, total, success, failed) => {
          setProcessingProgress({ processed, total, success, failed });
        }
      );

      setCurrentBatch({ ...processedBatch });
      setCurrentStep("results");
      setHistoryBatches(getImportBatchHistory());
      toast.success(`Import finished: ${processedBatch.summary.successRows} successful, ${processedBatch.summary.failedRows} failed.`);
    } catch (e: any) {
      toast.error(e.message || "Failed to commit import batch");
      setCurrentStep("preview");
    } finally {
      setIsConfirming(false);
    }
  };

  // Download Output Files
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

  // Filter records in preview
  const filteredRecords = useMemo(() => {
    if (!currentBatch) return [];
    return currentBatch.records.filter((rec) => {
      const matchesSearch =
        !previewSearch ||
        String(rec.excelRowNumber).includes(previewSearch) ||
        rec.recordKey.toLowerCase().includes(previewSearch.toLowerCase()) ||
        (rec.recordName && rec.recordName.toLowerCase().includes(previewSearch.toLowerCase())) ||
        (rec.recordId && rec.recordId.toLowerCase().includes(previewSearch.toLowerCase()));

      if (!matchesSearch) return false;

      if (previewTab === "ALL") return true;
      if (previewTab === "READY") return rec.status === "READY" || rec.status === "WARNING";
      if (previewTab === "CHANGED") return rec.changes && rec.changes.length > 0;
      if (previewTab === "NO_CHANGE") return rec.status === "NO_CHANGE";
      if (previewTab === "ERRORS") return rec.status === "ERROR" || rec.status === "BLOCKED";
      if (previewTab === "BLOCKED") return rec.status === "BLOCKED";
      return true;
    });
  }, [currentBatch, previewTab, previewSearch]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Main Nav Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
            Excel Bulk Data Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Production-grade CREATE, UPDATE, and DELETE engine with schema validation, dependency guards & audit logging.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentStep !== "upload" && (
            <Button variant="outline" size="sm" onClick={resetUploadState} className="gap-1.5">
              <RefreshCw className="h-4 w-4" /> New Import
            </Button>
          )}
          <Button
            variant={currentStep === "history" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentStep(currentStep === "history" ? "upload" : "history")}
            className="gap-1.5"
          >
            <Clock className="h-4 w-4" /> Import History ({historyBatches.length})
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          VIEW 1: IMPORT HISTORY
      ───────────────────────────────────────────────────────────────────────────── */}
      {currentStep === "history" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Excel Import Lineage & History</CardTitle>
              <CardDescription>Chronological log of all parsed, validated, and processed Excel batches.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {historyBatches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No import history records found.</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch ID</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Operation</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Success</TableHead>
                      <TableHead className="text-center">Failed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyBatches.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-mono font-medium text-xs">{b.batchIdentifier}</TableCell>
                        <TableCell className="capitalize font-medium">{b.module}</TableCell>
                        <TableCell>
                          <Badge variant={b.operation === "CREATE" ? "default" : b.operation === "UPDATE" ? "secondary" : "destructive"}>
                            {b.operation}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate text-xs">{b.fileName}</TableCell>
                        <TableCell className="text-xs">{b.uploadedBy?.name || "Admin"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(b.uploadedAt).toLocaleString()}</TableCell>
                        <TableCell className="text-center font-mono">{b.summary?.totalRows || b.records?.length || 0}</TableCell>
                        <TableCell className="text-center font-mono text-emerald-600 font-bold">{b.summary?.successRows || 0}</TableCell>
                        <TableCell className="text-center font-mono text-rose-600 font-bold">{b.summary?.failedRows || 0}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              b.status === "COMPLETED"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : b.status === "PARTIAL_SUCCESS"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : b.status === "FAILED"
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                                : "bg-blue-500/10 text-blue-600"
                            }
                            variant="outline"
                          >
                            {b.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCurrentBatch(b);
                              setCurrentStep("preview");
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const data = ResultExcelGenerator.generateResultWorkbook(b);
                              ResultExcelGenerator.triggerDownload(data, `${b.batchIdentifier}_Result.xlsx`);
                            }}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
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

      {/* ─────────────────────────────────────────────────────────────────────────────
          VIEW 2: LANDING & UPLOAD WORKFLOW (STEP 1)
      ───────────────────────────────────────────────────────────────────────────── */}
      {currentStep === "upload" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Module & Operation Selection */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. Select Target Module</CardTitle>
                <CardDescription>Choose the PMS entity to manage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {MODULES.map((m) => {
                  const Icon = m.icon;
                  const isSelected = selectedModule === m.key;
                  return (
                    <div
                      key={m.key}
                      onClick={() => handleModuleChange(m.key)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:bg-muted/50 border-border"
                      }`}
                    >
                      <div className={`p-2 rounded-md ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">{m.label}</h4>
                          {isSelected && <Badge variant="secondary" className="text-[10px]">Selected</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Select Operation</CardTitle>
                <CardDescription>Only one operation permitted per upload file.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
                  {(["CREATE", "UPDATE", "DELETE"] as ImportOperation[]).map((op) => {
                    const isSelected = selectedOperation === op;
                    return (
                      <button
                        key={op}
                        type="button"
                        onClick={() => handleOperationChange(op)}
                        className={`py-2 text-xs font-semibold rounded-md transition-all ${
                          isSelected
                            ? op === "CREATE"
                              ? "bg-emerald-600 text-white shadow"
                              : op === "UPDATE"
                              ? "bg-blue-600 text-white shadow"
                              : "bg-rose-600 text-white shadow"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {op}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 bg-muted/40 rounded border text-xs space-y-1 text-muted-foreground">
                  {selectedOperation === "CREATE" && (
                    <p>💡 <span className="font-semibold text-foreground">CREATE:</span> Adds new records. Duplicate keys in the file or existing in the DB will produce errors.</p>
                  )}
                  {selectedOperation === "UPDATE" && (
                    <p>💡 <span className="font-semibold text-foreground">UPDATE:</span> Patches existing records. Blank cells preserve current values. Type <code className="font-mono text-primary font-bold">[NULL]</code> to clear a field.</p>
                  )}
                  {selectedOperation === "DELETE" && (
                    <p>⚠️ <span className="font-semibold text-rose-500">DELETE:</span> Soft-deletes or archives records. Active leases, finance items, or dependencies will block deletion.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Template Generator & File Dropzone */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>3. Official Excel Template</span>
                  <Badge variant="outline" className="uppercase font-mono text-xs">
                    {selectedModule} • {selectedOperation}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Download the official structured template pre-populated with master dropdown values and sample instructions.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-muted/20 border rounded-lg m-6 mt-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg">
                    <FileSpreadsheet className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">
                      {selectedModule.charAt(0).toUpperCase() + selectedModule.slice(1)}_{selectedOperation}_Template.xlsx
                    </h4>
                    <p className="text-xs text-muted-foreground">Contains required headers, field specifications & instruction sheet</p>
                  </div>
                </div>
                <Button onClick={handleDownloadTemplate} disabled={isDownloadingTemplate} className="w-full sm:w-auto gap-2">
                  {isDownloadingTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Download Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">4. Upload & Validate File</CardTitle>
                <CardDescription>Upload completed .xlsx workbook. No database modification occurs during validation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                    fileToUpload
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="hidden"
                  />

                  <div className="p-4 bg-primary/10 text-primary rounded-full">
                    <UploadCloud className="h-8 w-8" />
                  </div>

                  <div>
                    {fileToUpload ? (
                      <div>
                        <p className="font-semibold text-sm text-primary">{fileToUpload.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {(fileToUpload.size / 1024).toFixed(1)} KB • Ready for validation
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-sm">Drag and drop your Excel file here, or click to browse</p>
                        <p className="text-xs text-muted-foreground mt-1">Supports .xlsx workbooks up to 15MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    size="lg"
                    onClick={handleValidateAndPreview}
                    disabled={!fileToUpload || isParsing}
                    className="gap-2 w-full sm:w-auto"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Validating File & DB References...
                      </>
                    ) : (
                      <>
                        Validate & Preview Records <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          VIEW 3: PREVIEW & REVIEW SCREEN (STEP 2)
      ───────────────────────────────────────────────────────────────────────────── */}
      {currentStep === "preview" && currentBatch && (
        <div className="space-y-6">
          {/* Top Batch Details Header */}
          <div className="bg-card border rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">{currentBatch.batchIdentifier}</Badge>
                <Badge className={selectedOperation === "CREATE" ? "bg-emerald-600" : selectedOperation === "UPDATE" ? "bg-blue-600" : "bg-rose-600"}>
                  {selectedOperation}
                </Badge>
                <Badge variant="secondary" className="capitalize font-semibold">{selectedModule}</Badge>
              </div>
              <h2 className="text-xl font-bold mt-2 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                {currentBatch.fileName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={resetUploadState}>
                Upload Another File
              </Button>
              {currentBatch.summary.validRows > 0 && (
                <Button
                  size="default"
                  onClick={handleConfirmAndProcess}
                  disabled={isConfirming || (selectedOperation === "DELETE" && !deleteConfirmed)}
                  className={selectedOperation === "DELETE" ? "bg-rose-600 hover:bg-rose-700 gap-2" : "bg-emerald-600 hover:bg-emerald-700 gap-2"}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Confirm & Process {currentBatch.summary.validRows} Records
                </Button>
              )}
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground font-medium">Total Rows</p>
                <h3 className="text-2xl font-bold mt-1 font-mono">{currentBatch.summary.totalRows}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-emerald-600 font-medium">Ready to Commit</p>
                <h3 className="text-2xl font-bold mt-1 font-mono text-emerald-600">{currentBatch.summary.validRows}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-blue-600 font-medium">No Data Change</p>
                <h3 className="text-2xl font-bold mt-1 font-mono text-blue-600">{currentBatch.summary.noChangeRows}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-amber-600 font-medium">Warnings</p>
                <h3 className="text-2xl font-bold mt-1 font-mono text-amber-600">{currentBatch.summary.warningRows}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-rose-600 font-medium">Errors / Blocked</p>
                <h3 className="text-2xl font-bold mt-1 font-mono text-rose-600">{currentBatch.summary.errorRows + currentBatch.summary.blockedRows}</h3>
              </CardContent>
            </Card>
          </div>

          {/* Delete Guard Acknowledgement Checkbox */}
          {selectedOperation === "DELETE" && (
            <Card className="border-rose-300 bg-rose-50/50 dark:bg-rose-950/20">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
                <div className="space-y-2 flex-1">
                  <h4 className="font-semibold text-sm text-rose-900 dark:text-rose-200">Mandatory Deletion Confirmation</h4>
                  <p className="text-xs text-rose-800 dark:text-rose-300">
                    Deletion is destructive. Deactivated or soft-deleted records will no longer be active for new contracts or operations.
                  </p>
                  <div className="flex items-center space-x-2 pt-1">
                    <Checkbox
                      id="del-confirm"
                      checked={deleteConfirmed}
                      onCheckedChange={(c) => setDeleteConfirmed(Boolean(c))}
                    />
                    <label htmlFor="del-confirm" className="text-xs font-medium cursor-pointer">
                      I understand that this operation will remove or archive the selected records according to PMS rules.
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Records Table with Tabs & Search */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Tabs value={previewTab} onValueChange={setPreviewTab} className="w-full sm:w-auto">
                  <TabsList className="grid grid-cols-5 w-full sm:w-auto">
                    <TabsTrigger value="ALL">All ({currentBatch.summary.totalRows})</TabsTrigger>
                    <TabsTrigger value="READY">Ready ({currentBatch.summary.validRows})</TabsTrigger>
                    {selectedOperation === "UPDATE" && (
                      <TabsTrigger value="CHANGED">Changed</TabsTrigger>
                    )}
                    {selectedOperation === "UPDATE" && (
                      <TabsTrigger value="NO_CHANGE">No Change ({currentBatch.summary.noChangeRows})</TabsTrigger>
                    )}
                    <TabsTrigger value="ERRORS">Errors ({currentBatch.summary.errorRows + currentBatch.summary.blockedRows})</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search row, code, key..."
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    className="pl-8 text-xs h-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRecords.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No records matching the selected filter.
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto max-h-[500px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow>
                        <TableHead className="w-16">Row</TableHead>
                        <TableHead>Record Key / Identifier</TableHead>
                        <TableHead>Name / Description</TableHead>
                        {selectedOperation === "UPDATE" && <TableHead>Changes</TableHead>}
                        {selectedOperation === "DELETE" && <TableHead>Dependencies</TableHead>}
                        <TableHead>Validation Status</TableHead>
                        <TableHead>Issues / Notes</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((rec) => (
                        <TableRow key={rec.excelRowNumber}>
                          <TableCell className="font-mono text-xs">{rec.excelRowNumber}</TableCell>
                          <TableCell className="font-mono font-semibold text-xs">{rec.recordKey}</TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate">{rec.recordName || "—"}</TableCell>
                          
                          {selectedOperation === "UPDATE" && (
                            <TableCell>
                              {rec.changes.length > 0 ? (
                                <Badge variant="secondary" className="font-mono text-[11px]">
                                  {rec.changes.length} field{rec.changes.length > 1 ? "s" : ""} changed
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">No changes</span>
                              )}
                            </TableCell>
                          )}

                          {selectedOperation === "DELETE" && (
                            <TableCell>
                              {rec.dependencies.length > 0 ? (
                                <div className="flex gap-1">
                                  {rec.dependencies.map((d, i) => (
                                    <Badge key={i} variant={d.result === "Blocked" ? "destructive" : "outline"} className="text-[10px]">
                                      {d.dependency}: {d.count}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-emerald-600">Clean</span>
                              )}
                            </TableCell>
                          )}

                          <TableCell>
                            <Badge
                              className={
                                rec.status === "READY"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                  : rec.status === "NO_CHANGE"
                                  ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                  : rec.status === "WARNING"
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                  : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                              }
                              variant="outline"
                            >
                              {rec.status}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-xs max-w-[250px] truncate text-muted-foreground">
                            {rec.errors.length > 0 ? (
                              <span className="text-rose-600 font-medium">{rec.errors[0].message}</span>
                            ) : rec.warnings.length > 0 ? (
                              <span className="text-amber-600">{rec.warnings[0].message}</span>
                            ) : (
                              "—"
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setInspectRecord(rec)}
                              className="h-7 text-xs"
                            >
                              Inspect Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          VIEW 4: PROCESSING LIVE STATE (STEP 3)
      ───────────────────────────────────────────────────────────────────────────── */}
      {currentStep === "processing" && (
        <Card className="max-w-xl mx-auto my-12 text-center p-8">
          <CardContent className="space-y-6">
            <div className="p-4 bg-primary/10 text-primary rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Processing Excel Import</h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono">{currentBatch?.batchIdentifier}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span>Progress: {processingProgress.processed} / {processingProgress.total}</span>
                <span>Success: {processingProgress.success} | Failed: {processingProgress.failed}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{
                    width: `${processingProgress.total > 0 ? (processingProgress.processed / processingProgress.total) * 100 : 10}%`,
                  }}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Executing database transactions and generating audit snapshots. Please do not close this window.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          VIEW 5: FINAL RESULT SCREEN (STEP 4)
      ───────────────────────────────────────────────────────────────────────────── */}
      {currentStep === "results" && currentBatch && (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="border-t-4 border-t-primary">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 bg-emerald-500/10 text-emerald-600 rounded-full w-14 h-14 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold">Import Processing Complete</CardTitle>
              <CardDescription className="font-mono text-xs">
                Batch #{currentBatch.batchIdentifier} • {new Date().toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid grid-cols-3 gap-4 text-center p-4 bg-muted/40 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Successfully Processed</p>
                  <p className="text-2xl font-bold text-emerald-600 font-mono mt-1">{currentBatch.summary.successRows}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Failed Rows</p>
                  <p className="text-2xl font-bold text-rose-600 font-mono mt-1">{currentBatch.summary.failedRows}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">No Change (Skipped)</p>
                  <p className="text-2xl font-bold text-blue-600 font-mono mt-1">{currentBatch.summary.noChangeRows}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Downloadable Result Workbooks</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button variant="outline" onClick={handleDownloadFullResult} className="justify-start gap-2 h-auto py-3">
                    <Download className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div className="text-left">
                      <p className="font-medium text-xs">Download Complete Result.xlsx</p>
                      <p className="text-[10px] text-muted-foreground">6 sheets with summary, diffs & audit log</p>
                    </div>
                  </Button>

                  {currentBatch.summary.failedRows > 0 && (
                    <Button variant="outline" onClick={handleDownloadFailedRecords} className="justify-start gap-2 h-auto py-3 border-rose-200">
                      <Download className="h-5 w-5 text-rose-600 shrink-0" />
                      <div className="text-left">
                        <p className="font-medium text-xs text-rose-600">Download Failed Records.xlsx</p>
                        <p className="text-[10px] text-muted-foreground">Includes error reasons for quick re-upload</p>
                      </div>
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button variant="ghost" onClick={() => setCurrentStep("history")}>
                  View All History
                </Button>
                <Button onClick={resetUploadState} className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Start Another Import
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          INSPECT MODAL / DRAWER (FOR OLD VS NEW DIFFS OR DEPENDENCY DETAILS)
      ───────────────────────────────────────────────────────────────────────────── */}
      {inspectRecord && (
        <Dialog open={Boolean(inspectRecord)} onOpenChange={(open) => !open && setInspectRecord(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Record Inspection (Row #{inspectRecord.excelRowNumber})</span>
                <Badge variant="outline" className="font-mono">{inspectRecord.recordKey}</Badge>
              </DialogTitle>
              <DialogDescription>
                Detailed field breakdown, changes, dependencies, and validation diagnostics.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Errors/Warnings */}
              {inspectRecord.errors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-rose-600" /> Validation Errors:
                  </p>
                  {inspectRecord.errors.map((e, idx) => (
                    <p key={idx} className="ml-5 font-mono">[{e.code}] {e.message} {e.resolution && `— ${e.resolution}`}</p>
                  ))}
                </div>
              )}

              {/* Diffs Table for UPDATE */}
              {selectedOperation === "UPDATE" && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Old vs Proposed Data Comparison</h4>
                  {inspectRecord.changes.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">No differences detected between Excel and current database record.</p>
                  ) : (
                    <div className="rounded border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Field</TableHead>
                            <TableHead>Current DB Value</TableHead>
                            <TableHead>Excel Proposed Value</TableHead>
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
