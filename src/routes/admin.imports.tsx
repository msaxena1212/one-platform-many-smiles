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
    <div className="h-[calc(100vh-5.5rem)] flex flex-col gap-3 overflow-hidden">
      {/* Header & Main Control Bar */}
      <div className="flex items-center justify-between shrink-0 bg-card/60 backdrop-blur-md border rounded-xl px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-teal-600 via-emerald-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-foreground">Excel Bulk Data Studio</h1>
              <Badge variant="outline" className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                v2.4 Pro
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">High-throughput bulk ingestion & reconciliation pipeline</p>
          </div>
        </div>

        {/* Step Progress Pill */}
        <div className="hidden md:flex items-center gap-1 bg-muted/60 p-1 rounded-full border border-border/50 text-xs">
          {[
            { id: "upload", label: "1. Configure & Ingest" },
            { id: "preview", label: "2. Verify & Reconcile" },
            { id: "results", label: "3. Commit & Audit" },
          ].map((s) => {
            const isActive = currentStep === s.id || (s.id === "upload" && currentStep === "history") || (s.id === "preview" && currentStep === "processing");
            return (
              <span
                key={s.id}
                className={`px-3 py-1 rounded-full font-medium transition-all text-[11px] ${
                  isActive
                    ? "bg-background text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground/70"
                }`}
              >
                {s.label}
              </span>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {currentStep !== "upload" && currentStep !== "history" && (
            <Button variant="ghost" size="sm" onClick={resetUploadState} className="h-8 text-xs gap-1">
              <RefreshCw className="h-3.5 w-3.5" /> Start New
            </Button>
          )}
          <Button
            variant={currentStep === "history" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentStep(currentStep === "history" ? "upload" : "history")}
            className="h-8 text-xs gap-1.5 shadow-xs"
          >
            <Clock className="h-3.5 w-3.5" /> History ({historyBatches.length})
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          VIEW 1: IMPORT HISTORY (Viewport fitted)
      ───────────────────────────────────────────────────────────────────────────── */}
      {currentStep === "history" && (
        <Card className="flex-1 flex flex-col min-h-0 border-border/70 overflow-hidden shadow-xs">
          <CardHeader className="py-3 px-4 shrink-0 flex flex-row items-center justify-between border-b bg-muted/30">
            <div>
              <CardTitle className="text-sm font-semibold">Excel Ingestion Lineage & Audit History</CardTitle>
              <CardDescription className="text-xs">Immutable ledger of executed batch files, mutations, and generated outcome sheets.</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => setCurrentStep("upload")} className="h-7 text-xs">
              Back to Studio
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0 overflow-y-auto">
            {historyBatches.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                <Clock className="h-10 w-10 mb-2 opacity-30 text-teal-600" />
                <p className="text-xs">No import history batches found in persistent storage.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-xs z-10">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Batch ID</TableHead>
                    <TableHead className="text-xs font-semibold">Module</TableHead>
                    <TableHead className="text-xs font-semibold">Operation</TableHead>
                    <TableHead className="text-xs font-semibold">File Name</TableHead>
                    <TableHead className="text-xs font-semibold">Uploaded By</TableHead>
                    <TableHead className="text-center text-xs font-semibold">Total Rows</TableHead>
                    <TableHead className="text-center text-xs font-semibold text-emerald-600">Committed (OK)</TableHead>
                    <TableHead className="text-center text-xs font-semibold text-rose-600">Errors / Failed</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold">Date & Time</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyBatches.map((b) => {
                    const totalRows = b.summary?.totalRows || b.records?.length || 0;
                    const successRows = b.summary?.successRows || 0;
                    const failedRows = b.summary?.failedRows || (b.status === "FAILED" && successRows === 0 ? totalRows : 0);
                    const displayDate = b.uploadedAt ? new Date(b.uploadedAt).toLocaleString() : "Recent";
                    
                    return (
                      <TableRow key={b.id} className="hover:bg-muted/40">
                        <TableCell className="font-mono font-bold text-xs">{b.batchIdentifier || b.id.slice(0, 8)}</TableCell>
                        <TableCell className="capitalize font-medium text-xs">{b.module}</TableCell>
                        <TableCell>
                          <Badge variant={b.operation === "CREATE" ? "default" : b.operation === "UPDATE" ? "secondary" : "destructive"} className="text-[10px] uppercase font-bold">
                            {b.operation}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[170px] truncate text-xs font-mono" title={b.fileName}>{b.fileName}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{b.uploadedBy?.name || "Admin"}</TableCell>
                        <TableCell className="text-center font-mono font-semibold text-xs">{totalRows}</TableCell>
                        <TableCell className="text-center font-mono text-xs text-emerald-600 font-bold">{successRows}</TableCell>
                        <TableCell className="text-center font-mono text-xs text-rose-600 font-bold">{failedRows}</TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] font-bold ${
                              b.status === "COMPLETED"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : b.status === "PARTIAL_SUCCESS"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : b.status === "FAILED"
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                                : "bg-blue-500/10 text-blue-600"
                            }`}
                            variant="outline"
                          >
                            {b.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{displayDate}</TableCell>
                        <TableCell className="text-right space-x-1 whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs font-semibold"
                            onClick={() => {
                              setCurrentBatch(b);
                              setCurrentStep("preview");
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1 text-primary" /> View Rows
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            title="Download Result Excel Report"
                            onClick={() => {
                              const data = ResultExcelGenerator.generateResultWorkbook(b);
                              ResultExcelGenerator.triggerDownload(data, `${b.batchIdentifier}_Result_Report.xlsx`);
                            }}
                          >
                            <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          VIEW 2: LANDING & UPLOAD WORKFLOW (STEP 1: Fit completely without page scroll)
      ───────────────────────────────────────────────────────────────────────────── */}
      {currentStep === "upload" && (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
          {/* Left Column (5 Cols): Module Selection + Operation */}
          <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
            {/* Module Picker */}
            <Card className="flex-1 flex flex-col min-h-0 border-border/70 overflow-hidden shadow-xs">
              <CardHeader className="py-2.5 px-3.5 shrink-0 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-[10px]">1</span>
                    Target Entity Module
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-mono capitalize">
                    {selectedModule}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-2.5 flex-1 min-h-0 overflow-y-auto space-y-1.5">
                {MODULES.map((m) => {
                  const Icon = m.icon;
                  const isSelected = selectedModule === m.key;
                  return (
                    <div
                      key={m.key}
                      onClick={() => handleModuleChange(m.key)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? "border-teal-500 bg-teal-500/10 ring-1 ring-teal-500 text-teal-950 dark:text-teal-100 font-medium"
                          : "hover:bg-muted/40 border-border/50 bg-card"
                      }`}
                    >
                      <div className={`p-2 rounded-md shrink-0 ${isSelected ? "bg-teal-600 text-white shadow-xs" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-xs leading-none">{m.label}</h4>
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-1">{m.description}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Operation Type Switcher */}
            <Card className="shrink-0 border-border/70 shadow-xs">
              <CardHeader className="py-2 px-3.5 border-b bg-muted/20">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-[10px]">2</span>
                  Operation Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 space-y-2">
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/70 rounded-lg">
                  {(["CREATE", "UPDATE", "DELETE"] as ImportOperation[]).map((op) => {
                    const isSelected = selectedOperation === op;
                    return (
                      <button
                        key={op}
                        type="button"
                        onClick={() => handleOperationChange(op)}
                        className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                          isSelected
                            ? op === "CREATE"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : op === "UPDATE"
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-rose-600 text-white shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {op}
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 bg-muted/40 rounded-md border border-border/40 text-[11px] text-muted-foreground">
                  {selectedOperation === "CREATE" && (
                    <p>✨ <strong className="text-foreground">CREATE:</strong> Adds new entries. Pre-checks uniqueness & relations.</p>
                  )}
                  {selectedOperation === "UPDATE" && (
                    <p>🔄 <strong className="text-foreground">UPDATE:</strong> Patches records. Blanks keep existing data; <code className="font-mono text-primary font-bold">[NULL]</code> clears fields.</p>
                  )}
                  {selectedOperation === "DELETE" && (
                    <p>⚠️ <strong className="text-rose-600">DELETE:</strong> Safe archived removal. Active contracts/dependencies are protected.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (7 Cols): Template & Dropzone + Diagnostic Bar */}
          <div className="lg:col-span-7 flex flex-col gap-3 min-h-0">
            {/* Step 3: Template Download Banner */}
            <Card className="shrink-0 border-border/70 shadow-xs bg-gradient-to-r from-card via-card to-teal-500/5">
              <CardContent className="p-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0 border border-emerald-500/20">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs uppercase tracking-tight text-foreground truncate">
                        {selectedModule}_{selectedOperation}_Template.xlsx
                      </h4>
                      <Badge variant="secondary" className="text-[9px] font-mono px-1 py-0">Masters Synced</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">Pre-populated dropdown lists & strict headers</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  disabled={isDownloadingTemplate}
                  className="shrink-0 h-8 text-xs gap-1.5 border-emerald-600/30 hover:bg-emerald-500/10 hover:text-emerald-700"
                >
                  {isDownloadingTemplate ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  Download Template
                </Button>
              </CardContent>
            </Card>

            {/* Step 4: Dropzone (Flex Expanded) */}
            <Card className="flex-1 flex flex-col min-h-0 border-border/70 shadow-xs">
              <CardHeader className="py-2 px-3.5 border-b bg-muted/20 shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-[10px]">3</span>
                    Workbook Ingestion & Validation
                  </CardTitle>
                  <span className="text-[11px] text-muted-foreground">Supported format: .xlsx</span>
                </div>
              </CardHeader>
              <CardContent className="p-3.5 flex-1 flex flex-col min-h-0 gap-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    fileToUpload
                      ? "border-teal-500 bg-teal-500/5 ring-2 ring-teal-500/20"
                      : "border-border/80 hover:border-teal-500/60 hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="hidden"
                  />

                  <div className={`p-3 rounded-full ${fileToUpload ? "bg-teal-500 text-white shadow-md shadow-teal-500/20" : "bg-muted text-muted-foreground"}`}>
                    <UploadCloud className="h-6 w-6" />
                  </div>

                  <div className="max-w-xs">
                    {fileToUpload ? (
                      <div>
                        <p className="font-bold text-xs text-foreground truncate">{fileToUpload.name}</p>
                        <p className="text-[11px] text-teal-600 font-mono mt-0.5">
                          {(fileToUpload.size / 1024).toFixed(1)} KB • Ready for schema verification
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-xs text-foreground">Click to browse or drop .xlsx workbook here</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Strict schema pre-flight check without database writes</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Validation Trigger Footer */}
                <div className="shrink-0 flex items-center justify-between gap-3 pt-1 border-t border-border/40">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>Dry-run verified against live master references</span>
                  </div>

                  <Button
                    size="sm"
                    onClick={handleValidateAndPreview}
                    disabled={!fileToUpload || isParsing}
                    className="h-9 px-4 text-xs font-semibold gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-sm shadow-teal-600/20"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying File...
                      </>
                    ) : (
                      <>
                        Inspect & Reconcile <ArrowRight className="h-3.5 w-3.5" />
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
          VIEW 3: PREVIEW & REVIEW SCREEN (STEP 2: Viewport Fitted)
      ───────────────────────────────────────────────────────────────────────────── */}
      {currentStep === "preview" && currentBatch && (
        <div className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-hidden">
          {/* Top Batch Details Header & Quick Action Bar */}
          <div className="bg-card/70 backdrop-blur-md border rounded-xl p-3 shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">{currentBatch.batchIdentifier}</Badge>
                  <Badge className={`text-[10px] uppercase font-bold ${selectedOperation === "CREATE" ? "bg-emerald-600" : selectedOperation === "UPDATE" ? "bg-blue-600" : "bg-rose-600"}`}>
                    {selectedOperation}
                  </Badge>
                  <Badge variant="secondary" className="capitalize text-[10px] font-semibold">{selectedModule}</Badge>
                </div>
                <h2 className="text-xs font-bold text-foreground truncate mt-0.5">
                  {currentBatch.fileName}
                </h2>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg border border-border/40 text-xs shrink-0">
              <div className="px-2.5 py-0.5 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Total</p>
                <p className="font-mono font-bold text-xs">{currentBatch.summary.totalRows}</p>
              </div>
              <div className="w-px h-6 bg-border/60" />
              <div className="px-2.5 py-0.5 text-center">
                <p className="text-[9px] uppercase tracking-wider text-emerald-600 font-semibold">Ready</p>
                <p className="font-mono font-bold text-xs text-emerald-600">{currentBatch.summary.validRows}</p>
              </div>
              {selectedOperation === "UPDATE" && (
                <>
                  <div className="w-px h-6 bg-border/60" />
                  <div className="px-2.5 py-0.5 text-center">
                    <p className="text-[9px] uppercase tracking-wider text-blue-600 font-semibold">No-op</p>
                    <p className="font-mono font-bold text-xs text-blue-600">{currentBatch.summary.noChangeRows}</p>
                  </div>
                </>
              )}
              <div className="w-px h-6 bg-border/60" />
              <div className="px-2.5 py-0.5 text-center">
                <p className="text-[9px] uppercase tracking-wider text-amber-600 font-semibold">Warn</p>
                <p className="font-mono font-bold text-xs text-amber-600">{currentBatch.summary.warningRows}</p>
              </div>
              <div className="w-px h-6 bg-border/60" />
              <div className="px-2.5 py-0.5 text-center">
                <p className="text-[9px] uppercase tracking-wider text-rose-600 font-semibold">Errors</p>
                <p className="font-mono font-bold text-xs text-rose-600">{currentBatch.summary.errorRows + currentBatch.summary.blockedRows}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={resetUploadState} className="h-8 text-xs">
                Upload Another
              </Button>
              {currentBatch.summary.validRows > 0 && (
                <Button
                  size="sm"
                  onClick={handleConfirmAndProcess}
                  disabled={isConfirming || (selectedOperation === "DELETE" && !deleteConfirmed)}
                  className={`h-8 text-xs font-semibold gap-1.5 shadow-xs ${
                    selectedOperation === "DELETE"
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Execute Commit ({currentBatch.summary.validRows})
                </Button>
              )}
            </div>
          </div>

          {/* Delete Guard Acknowledgement (Inline Pill) */}
          {selectedOperation === "DELETE" && (
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span className="truncate">Destructive deletion safety lock: verified rows will be permanently deleted or archived.</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0 ml-4">
                <Checkbox
                  id="del-confirm"
                  checked={deleteConfirmed}
                  onCheckedChange={(c) => setDeleteConfirmed(Boolean(c))}
                />
                <label htmlFor="del-confirm" className="text-[11px] font-bold cursor-pointer text-rose-900 dark:text-rose-200">
                  I Confirm Deletion
                </label>
              </div>
            </div>
          )}

          {/* Records Data Grid with Tabs & Search */}
          <Card className="flex-1 min-h-0 flex flex-col border-border/70 overflow-hidden shadow-xs">
            <CardHeader className="py-2 px-3.5 shrink-0 border-b bg-muted/20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
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
                  <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search key, record, error..."
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    className="pl-7 text-xs h-7 bg-card"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0 overflow-y-auto">
              {filteredRecords.length === 0 ? (
                <div className="h-full flex items-center justify-center py-12 text-muted-foreground text-xs">
                  No records matching the selected filter criteria.
                </div>
              ) : (
                <Table>
                  <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-xs z-10">
                    <TableRow className="border-b">
                      <TableHead className="w-12 text-[11px]">#</TableHead>
                      <TableHead className="text-[11px]">Record Key</TableHead>
                      <TableHead className="text-[11px]">Name / Label</TableHead>
                      {selectedOperation === "UPDATE" && <TableHead className="text-[11px]">Mutations</TableHead>}
                      {selectedOperation === "DELETE" && <TableHead className="text-[11px]">Dependencies</TableHead>}
                      <TableHead className="text-[11px]">Pre-flight Status</TableHead>
                      <TableHead className="text-[11px]">Diagnostics</TableHead>
                      <TableHead className="text-right text-[11px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((rec) => (
                      <TableRow key={rec.excelRowNumber} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-[11px] text-muted-foreground">{rec.excelRowNumber}</TableCell>
                        <TableCell className="font-mono font-semibold text-xs text-foreground">{rec.recordKey}</TableCell>
                        <TableCell className="text-xs max-w-[180px] truncate text-muted-foreground">{rec.recordName || "—"}</TableCell>
                        
                        {selectedOperation === "UPDATE" && (
                          <TableCell>
                            {rec.changes.length > 0 ? (
                              <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                                {rec.changes.length} field{rec.changes.length > 1 ? "s" : ""}
                              </Badge>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">Unmodified</span>
                            )}
                          </TableCell>
                        )}

                        {selectedOperation === "DELETE" && (
                          <TableCell>
                            {rec.dependencies.length > 0 ? (
                              <div className="flex gap-1 flex-wrap">
                                {rec.dependencies.map((d, i) => (
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
                              rec.status === "READY"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : rec.status === "NO_CHANGE"
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                : rec.status === "WARNING"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                            }`}
                            variant="outline"
                          >
                            {rec.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-xs max-w-[220px] truncate text-muted-foreground">
                          {rec.errors.length > 0 ? (
                            <span className="text-rose-600 font-medium">{rec.errors[0].message}</span>
                          ) : rec.warnings.length > 0 ? (
                            <span className="text-amber-600">{rec.warnings[0].message}</span>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInspectRecord(rec)}
                            className="h-6 px-2 text-[11px]"
                          >
                            Inspect
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          VIEW 4: PROCESSING LIVE STATE (STEP 3: Compact Centered Card)
      ───────────────────────────────────────────────────────────────────────────── */}
      {currentStep === "processing" && (
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center p-6 border-border/80 shadow-md">
            <CardContent className="space-y-4 p-0">
              <div className="p-3 bg-teal-500/10 text-teal-600 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Executing Ingestion Pipeline</h3>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{currentBatch?.batchIdentifier}</p>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-mono">
                  <span>Processed: {processingProgress.processed} / {processingProgress.total}</span>
                  <span className="text-emerald-600 font-bold">{processingProgress.success} OK</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 h-full transition-all duration-300"
                    style={{
                      width: `${processingProgress.total > 0 ? (processingProgress.processed / processingProgress.total) * 100 : 15}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Writing audit logs & updating database records. Please do not refresh.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          VIEW 5: FINAL RESULT SCREEN (STEP 4: Compact Grid)
      ───────────────────────────────────────────────────────────────────────────── */}
      {currentStep === "results" && currentBatch && (
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-border/80 shadow-md">
            <CardHeader className="text-center py-4 border-b bg-muted/20">
              <div className="mx-auto p-2 bg-emerald-500/10 text-emerald-600 rounded-full w-10 h-10 flex items-center justify-center mb-1">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg font-bold">Import Processing Complete</CardTitle>
              <CardDescription className="font-mono text-[11px]">
                Batch #{currentBatch.batchIdentifier} • {new Date().toLocaleDateString()}
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
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Download Outcome Workbooks</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button variant="outline" onClick={handleDownloadFullResult} className="justify-start gap-2 h-auto py-2.5 text-xs">
                    <Download className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div className="text-left truncate">
                      <p className="font-semibold text-xs">Full Result.xlsx</p>
                      <p className="text-[10px] text-muted-foreground">6 audit & diff sheets</p>
                    </div>
                  </Button>

                  {currentBatch.summary.failedRows > 0 && (
                    <Button variant="outline" onClick={handleDownloadFailedRecords} className="justify-start gap-2 h-auto py-2.5 text-xs border-rose-200 hover:bg-rose-500/10">
                      <Download className="h-4 w-4 text-rose-600 shrink-0" />
                      <div className="text-left truncate">
                        <p className="font-semibold text-xs text-rose-600">Failed Records.xlsx</p>
                        <p className="text-[10px] text-muted-foreground">Pre-annotated error reasons</p>
                      </div>
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep("history")} className="text-xs">
                  View Audit History
                </Button>
                <Button size="sm" onClick={resetUploadState} className="gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                  <RefreshCw className="h-3.5 w-3.5" /> Start Another Ingestion
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
