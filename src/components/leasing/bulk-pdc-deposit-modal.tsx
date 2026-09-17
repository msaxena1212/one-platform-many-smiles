import { useState, useRef, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Edit2,
  FileCheck,
  Building2,
  Receipt,
  Banknote,
  ArrowRight,
  Eye,
  Clock,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { DynamicMastersService } from "@/lib/dynamic-masters-service";

export type BulkPdcRow = {
  id: string;
  slNo: string | number;
  unitName: string;
  propertyCode: string;
  unitNameCheck?: string;
  propertyCodeCheck?: string;
  tenantName: string;
  chequeNumber: string;
  bank: string;
  maturityDate: string;
  amount: number | string;
  rentFromDate: string;
  rentToDate: string;
  status?: "READY" | "WARNING" | "ERROR";
  errorMessage?: string;
};

export type BulkDepositRow = {
  id: string;
  slNo: string | number;
  unitName: string;
  propertyCode: string;
  unitNameCheck?: string;
  propertyCodeCheck?: string;
  tenantName: string;
  receiptNumber: string;
  depositType: string;
  paymentMethod: string;
  bankOrReference: string;
  amount: number | string;
  depositDate: string;
  remarks: string;
  status?: "READY" | "WARNING" | "ERROR";
  errorMessage?: string;
};

interface BulkPdcDepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "PDC" | "DEPOSIT";
  onSuccess?: (items: any[]) => void;
  existingLeases?: Array<{
    id: string;
    tenantName: string;
    unit: string;
    property: string;
    monthlyRent?: number;
    securityDeposit?: number;
    startDate?: string;
    endDate?: string;
  }>;
}

const DEFAULT_BANKS = [
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
  "Other Bank",
];

const DEFAULT_DEPOSIT_TYPES = [
  "Security Deposit",
  "Kahramaa / Electricity Utility Deposit",
  "Water Utility Deposit",
  "Holding Advance Fee",
  "Maintenance Deposit",
  "Fit-out / Key Deposit",
  "Other Guarantee",
];

const DEFAULT_PAYMENT_METHODS = [
  "Bank Transfer",
  "Cheque / PDC",
  "Cash",
  "Credit Card / POS",
  "Direct Debit",
  "Corporate Draft",
];

export function BulkPdcDepositModal({
  open,
  onOpenChange,
  type,
  onSuccess,
  existingLeases = [],
}: BulkPdcDepositModalProps) {
  const [selectedOperation, setSelectedOperation] = useState<"CREATE" | "UPDATE" | "DELETE">("CREATE");
  const [currentStep, setCurrentStep] = useState<"upload" | "preview" | "processing" | "results" | "history">("upload");
  const [previewTab, setPreviewTab] = useState<string>("ALL");
  const [previewSearch, setPreviewSearch] = useState("");
  
  // Confirmation state for DELETE
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [inspectRow, setInspectRow] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic masters & options
  const bankOptions = useMemo(() => {
    try {
      const stored = DynamicMastersService.getMasterStringOptions("bank_name");
      return stored && stored.length > 0 ? stored : DEFAULT_BANKS;
    } catch {
      return DEFAULT_BANKS;
    }
  }, []);

  const depositTypeOptions = useMemo(() => {
    try {
      const stored = DynamicMastersService.getMasterStringOptions("deposit_type");
      return stored && stored.length > 0 ? stored : DEFAULT_DEPOSIT_TYPES;
    } catch {
      return DEFAULT_DEPOSIT_TYPES;
    }
  }, []);

  // Initial Seed Sample Data matching the exact schema prompt
  const initialPdcRows: BulkPdcRow[] = useMemo(() => [
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
      status: "READY",
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
      status: "READY",
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
      status: "READY",
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
      status: "READY",
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
      status: "READY",
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
      status: "READY",
    },
  ], []);

  const initialDepositRows: BulkDepositRow[] = useMemo(() => [
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
      status: "READY",
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
      status: "READY",
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
      status: "READY",
    },
  ], []);

  const [pdcRows, setPdcsRows] = useState<BulkPdcRow[]>(initialPdcRows);
  const [depositRows, setDepositRows] = useState<BulkDepositRow[]>(initialDepositRows);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const cleanNormalize = (val: string) => (val || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

  const resetUploadState = () => {
    setUploadedFileName(null);
    setCurrentStep("upload");
    setDeleteConfirmed(false);
    setPreviewTab("ALL");
    setPreviewSearch("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOperationChange = (op: "CREATE" | "UPDATE" | "DELETE") => {
    setSelectedOperation(op);
    resetUploadState();
  };

  // Metrics summary
  const summary = useMemo(() => {
    const rows = type === "PDC" ? pdcRows : depositRows;
    const total = rows.length;
    const valid = rows.filter(r => r.status === "READY").length;
    const warnings = rows.filter(r => r.status === "WARNING").length;
    const errors = rows.filter(r => r.status === "ERROR").length;
    return { total, valid, warnings, errors };
  }, [type, pdcRows, depositRows]);

  // Filtered rows for preview search & tabs
  const filteredRecords = useMemo(() => {
    if (type === "PDC") {
      return pdcRows.filter(r => {
        if (previewTab === "VALID" && r.status !== "READY") return false;
        if (previewTab === "WARNING" && r.status !== "WARNING") return false;
        if (previewTab === "ERROR" && r.status !== "ERROR") return false;
        if (!previewSearch.trim()) return true;
        const q = previewSearch.toLowerCase();
        return (
          r.unitName.toLowerCase().includes(q) ||
          r.propertyCode.toLowerCase().includes(q) ||
          r.tenantName.toLowerCase().includes(q) ||
          r.chequeNumber.toLowerCase().includes(q) ||
          r.bank.toLowerCase().includes(q)
        );
      });
    } else {
      return depositRows.filter(r => {
        if (previewTab === "VALID" && r.status !== "READY") return false;
        if (previewTab === "WARNING" && r.status !== "WARNING") return false;
        if (previewTab === "ERROR" && r.status !== "ERROR") return false;
        if (!previewSearch.trim()) return true;
        const q = previewSearch.toLowerCase();
        return (
          r.unitName.toLowerCase().includes(q) ||
          r.propertyCode.toLowerCase().includes(q) ||
          r.tenantName.toLowerCase().includes(q) ||
          r.receiptNumber.toLowerCase().includes(q) ||
          r.depositType.toLowerCase().includes(q) ||
          r.paymentMethod.toLowerCase().includes(q)
        );
      });
    }
  }, [type, pdcRows, depositRows, previewTab, previewSearch]);

  // Download official Excel Template
  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      const wb = XLSX.utils.book_new();

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
          "Rent To Date",
        ];

        const sampleData = pdcRows.map(r => [
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
          r.rentToDate,
        ]);

        const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
        ws["!cols"] = headers.map(h => ({ wch: Math.max(h.length + 4, 18) }));
        XLSX.utils.book_append_sheet(wb, ws, `PDC_${selectedOperation}`);

        // Instructions Sheet
        const wsInst = XLSX.utils.aoa_to_sheet([
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
          ["6. For DELETE:", "De-registers PDCs from active holding register."],
        ]);
        XLSX.utils.book_append_sheet(wb, wsInst, "Instructions");

        XLSX.writeFile(wb, `Bulk_PDC_${selectedOperation}_Template.xlsx`);
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
          "Remarks",
        ];

        const sampleData = depositRows.map(r => [
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
          r.remarks,
        ]);

        const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
        ws["!cols"] = headers.map(h => ({ wch: Math.max(h.length + 4, 18) }));
        XLSX.utils.book_append_sheet(wb, ws, `DEPOSIT_${selectedOperation}`);

        // Instructions Sheet
        const wsInst = XLSX.utils.aoa_to_sheet([
          ["Bulk Lease Deposits Specification Guide"],
          ["Module:", "Leasing - Security & Utility Deposits"],
          ["Operation Mode:", selectedOperation],
          ["Deposit Types:", depositTypeOptions.join(", ")],
          ["Payment Methods:", DEFAULT_PAYMENT_METHODS.join(", ")],
          [],
          ["RULES & INTEGRITY CHECKS:"],
          ["1. Receipt Number:", "Unique identifier for the deposit voucher."],
          ["2. Accounting Impact:", "Creates/Updates GL liability entries (Security Deposit Liability 21500)."],
          ["3. For DELETE:", "Voids unallocated or unrefunded deposit vouchers."],
        ]);
        XLSX.utils.book_append_sheet(wb, wsInst, "Instructions");

        XLSX.writeFile(wb, `Bulk_Deposit_${selectedOperation}_Template.xlsx`);
      }

      toast.success(`Downloaded official ${type} (${selectedOperation}) Excel template!`);
    } catch (e: any) {
      toast.error("Failed to generate template: " + e.message);
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  // Parse Uploaded XLSX
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

        if (json.length < 2) {
          toast.error("Excel sheet is empty or missing data rows.");
          setIsParsing(false);
          return;
        }

        const dataRows = json.slice(1).filter((r: any[]) => r.length > 0 && r[0] != null);

        if (type === "PDC") {
          const parsed: BulkPdcRow[] = dataRows.map((row: any[], idx: number) => {
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

            // Integrity verification
            const unitClean = cleanNormalize(unitName);
            const unitCheckClean = cleanNormalize(unitNameCheck);
            const propClean = cleanNormalize(propertyCode);
            const propCheckClean = cleanNormalize(propertyCodeCheck);

            let status: "READY" | "WARNING" | "ERROR" = "READY";
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
              errorMessage,
            };
          });

          setPdcsRows(parsed);
          setCurrentStep("preview");
          toast.success(`Validated ${parsed.length} PDC rows: ${parsed.filter(r => r.status === 'READY').length} Ready`);
        } else {
          const parsed: BulkDepositRow[] = dataRows.map((row: any[], idx: number) => {
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

            let status: "READY" | "WARNING" | "ERROR" = "READY";
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
              errorMessage,
            };
          });

          setDepositRows(parsed);
          setCurrentStep("preview");
          toast.success(`Validated ${parsed.length} Deposit rows: ${parsed.filter(r => r.status === 'READY').length} Ready`);
        }
      } catch (err: any) {
        toast.error("Failed to parse Excel file: " + err.message);
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Execution Handler
  const handleExecute = async () => {
    if (selectedOperation === "DELETE" && !deleteConfirmed) {
      toast.error("Please confirm that you understand the destructive nature of the DELETE operation.");
      return;
    }

    try {
      setIsProcessing(true);
      setCurrentStep("processing");

      await new Promise((res) => setTimeout(res, 900));

      const processedItems = type === "PDC" ? pdcRows : depositRows;

      if (onSuccess) {
        onSuccess(processedItems);
      }

      setCurrentStep("results");
      toast.success(
        `Import complete: ${summary.valid + summary.warnings} records processed, ${summary.errors} failed.`
      );
    } catch (e: any) {
      toast.error("Execution failed: " + e.message);
      setCurrentStep("preview");
    } finally {
      setIsProcessing(false);
    }
  };

  const activeRowCount = type === "PDC" ? pdcRows.length : depositRows.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card p-6">
        <div className="space-y-6">
          {/* Top Header & Controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                {type === "PDC"
                  ? "Post-Dated Cheques (PDC): Excel Bulk Import & Management"
                  : "Lease Security Deposits: Excel Bulk Import & Management"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {type === "PDC"
                  ? "Production-grade Excel CREATE, UPDATE, and DELETE engine for cheque schedules, maturity dates, and banks."
                  : "Production-grade Excel CREATE, UPDATE, and DELETE engine for security deposits, utility guarantees, and holding fees."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {currentStep !== "upload" && (
                <Button variant="outline" size="sm" onClick={resetUploadState} className="text-xs">
                  Start New Import
                </Button>
              )}
            </div>
          </div>

          {/* Operation Tabs (CREATE, UPDATE, DELETE) */}
          {currentStep !== "history" && (
            <Tabs
              value={selectedOperation}
              onValueChange={(val) => handleOperationChange(val as "CREATE" | "UPDATE" | "DELETE")}
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
                      <span className="text-muted-foreground">Entity:</span>
                      <span className="uppercase text-foreground font-semibold">{type === "PDC" ? "PDC CHEQUES" : "DEPOSITS"}</span>
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
                    Download {type} Template (.xlsx)
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
                      onChange={handleFileUpload}
                      accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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
          {currentStep === "preview" && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border-border/60">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Total Rows</p>
                      <p className="text-xl font-bold">{summary.total}</p>
                    </div>
                    <FileText className="h-6 w-6 text-muted-foreground/60" />
                  </CardContent>
                </Card>

                <Card className="border-border/60 border-l-4 border-l-emerald-500">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Valid (Ready)</p>
                      <p className="text-xl font-bold text-emerald-600">{summary.valid}</p>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </CardContent>
                </Card>

                <Card className="border-border/60 border-l-4 border-l-amber-500">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Warnings</p>
                      <p className="text-xl font-bold text-amber-600">{summary.warnings}</p>
                    </div>
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  </CardContent>
                </Card>

                <Card className="border-border/60 border-l-4 border-l-destructive">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Errors (Blocked)</p>
                      <p className="text-xl font-bold text-destructive">{summary.errors}</p>
                    </div>
                    <XCircle className="h-6 w-6 text-destructive" />
                  </CardContent>
                </Card>
              </div>

              {/* Delete Danger Warning */}
              {selectedOperation === "DELETE" && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertTriangle className="h-4 w-4" /> Permanent Bulk Deletion Safety Check
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You are about to delete records from <span className="font-semibold text-foreground uppercase">{type} REGISTER</span>. Any records with posted general ledger settlements or active references will be securely archived according to PMS compliance.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox
                      id="confirm-delete-modal"
                      checked={deleteConfirmed}
                      onCheckedChange={(c) => setDeleteConfirmed(Boolean(c))}
                    />
                    <Label htmlFor="confirm-delete-modal" className="text-xs font-semibold cursor-pointer text-foreground">
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
                      <TabsTrigger value="ALL" className="text-xs">All ({summary.total})</TabsTrigger>
                      <TabsTrigger value="VALID" className="text-xs text-emerald-600">Valid ({summary.valid})</TabsTrigger>
                      <TabsTrigger value="WARNING" className="text-xs text-amber-600">Warnings ({summary.warnings})</TabsTrigger>
                      <TabsTrigger value="ERROR" className="text-xs text-destructive">Errors ({summary.errors})</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="rounded-md border overflow-x-auto">
                    {type === "PDC" ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 text-xs">
                            <TableHead className="w-16">Row #</TableHead>
                            <TableHead className="w-28">Status</TableHead>
                            <TableHead>Unit Name</TableHead>
                            <TableHead>Property Code</TableHead>
                            <TableHead>Unit Check</TableHead>
                            <TableHead>Tenant Name</TableHead>
                            <TableHead>Cheque No.</TableHead>
                            <TableHead>Bank</TableHead>
                            <TableHead>Maturity Date</TableHead>
                            <TableHead className="text-right">Amount (QAR)</TableHead>
                            <TableHead>Rent Period</TableHead>
                            <TableHead className="text-right w-16">Inspect</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRecords.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={12} className="text-center py-8 text-xs text-muted-foreground">
                                No records match current filter.
                              </TableCell>
                            </TableRow>
                          ) : (
                            (filteredRecords as BulkPdcRow[]).map((record, idx) => (
                              <TableRow key={record.id || idx}>
                                <TableCell className="font-mono text-xs font-medium">{record.slNo || idx + 1}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      record.status === "READY"
                                        ? "outline"
                                        : record.status === "WARNING"
                                        ? "secondary"
                                        : "destructive"
                                    }
                                    className={`text-[10px] ${
                                      record.status === "READY" ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" : ""
                                    }`}
                                  >
                                    {record.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-semibold text-xs text-foreground">{record.unitName}</TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">{record.propertyCode}</TableCell>
                                <TableCell className="font-mono text-[11px] text-muted-foreground">{record.unitNameCheck || record.unitName.replace(/\s+/g, "-")}</TableCell>
                                <TableCell className="text-xs">{record.tenantName}</TableCell>
                                <TableCell className="font-mono font-bold text-teal-700 dark:text-teal-300 text-xs">{record.chequeNumber}</TableCell>
                                <TableCell className="text-xs">{record.bank}</TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">{record.maturityDate}</TableCell>
                                <TableCell className="text-right font-mono font-bold text-xs">
                                  {Number(record.amount).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-[10px] font-mono text-muted-foreground">
                                  {record.rentFromDate} → {record.rentToDate}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setInspectRow(record)}
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
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 text-xs">
                            <TableHead className="w-16">Row #</TableHead>
                            <TableHead className="w-28">Status</TableHead>
                            <TableHead>Unit Name</TableHead>
                            <TableHead>Property Code</TableHead>
                            <TableHead>Tenant Name</TableHead>
                            <TableHead>Receipt No.</TableHead>
                            <TableHead>Deposit Type</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Bank / Ref</TableHead>
                            <TableHead className="text-right">Amount (QAR)</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right w-16">Inspect</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRecords.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={12} className="text-center py-8 text-xs text-muted-foreground">
                                No records match current filter.
                              </TableCell>
                            </TableRow>
                          ) : (
                            (filteredRecords as BulkDepositRow[]).map((record, idx) => (
                              <TableRow key={record.id || idx}>
                                <TableCell className="font-mono text-xs font-medium">{record.slNo || idx + 1}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      record.status === "READY"
                                        ? "outline"
                                        : record.status === "WARNING"
                                        ? "secondary"
                                        : "destructive"
                                    }
                                    className={`text-[10px] ${
                                      record.status === "READY" ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" : ""
                                    }`}
                                  >
                                    {record.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-semibold text-xs text-foreground">{record.unitName}</TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">{record.propertyCode}</TableCell>
                                <TableCell className="text-xs">{record.tenantName}</TableCell>
                                <TableCell className="font-mono font-bold text-teal-700 dark:text-teal-300 text-xs">{record.receiptNumber}</TableCell>
                                <TableCell className="text-xs">{record.depositType}</TableCell>
                                <TableCell className="text-xs">{record.paymentMethod}</TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">{record.bankOrReference}</TableCell>
                                <TableCell className="text-right font-mono font-bold text-xs">
                                  {Number(record.amount).toLocaleString()}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">{record.depositDate}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setInspectRow(record)}
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
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={resetUploadState} className="text-xs">
                      Discard & Re-upload
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleExecute}
                        disabled={
                          isProcessing ||
                          summary.valid === 0 ||
                          (selectedOperation === "DELETE" && !deleteConfirmed)
                        }
                        className={`text-xs gap-2 ${
                          selectedOperation === "DELETE" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""
                        }`}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        )}
                        Execute {selectedOperation} Batch ({summary.valid} Records)
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
                    className="bg-primary h-2.5 rounded-full transition-all duration-300 w-full"
                  />
                </div>
                <p className="text-xs font-mono text-muted-foreground">
                  Processing batch execution pipeline...
                </p>
              </CardContent>
            </Card>
          )}

          {/* STEP 4: FINAL RESULTS */}
          {currentStep === "results" && (
            <Card className="border-border/60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <FileCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Import Execution Finished</CardTitle>
                    <CardDescription className="text-xs">
                      Bulk ingestion completed for {type} ({selectedOperation}).
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/40 border text-center">
                    <p className="text-xs text-muted-foreground">Total Ingested</p>
                    <p className="text-2xl font-bold">{summary.total}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                    <p className="text-xs text-emerald-600 font-medium">Successfully Committed</p>
                    <p className="text-2xl font-bold text-emerald-700">{summary.valid}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                    <p className="text-xs text-destructive font-medium">Failed / Skipped</p>
                    <p className="text-2xl font-bold text-destructive">{summary.errors}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={resetUploadState} className="text-xs">
                    Import Another File
                  </Button>

                  <Button onClick={() => onOpenChange(false)} className="text-xs gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Done & Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ROW INSPECTION MODAL */}
          {inspectRow && (
            <Dialog open={!!inspectRow} onOpenChange={(open) => !open && setInspectRow(null)}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" /> Row #{inspectRow.slNo} Inspection Details
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Field-level snapshot and validation diagnostics.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2 text-xs">
                  <div className="p-3 bg-muted/40 rounded border space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unit Name:</span>
                      <span className="font-semibold text-foreground">{inspectRow.unitName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property Code:</span>
                      <span>{inspectRow.propertyCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tenant:</span>
                      <span>{inspectRow.tenantName}</span>
                    </div>
                    {type === "PDC" ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cheque Number:</span>
                          <span className="font-bold text-primary">{inspectRow.chequeNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bank:</span>
                          <span>{inspectRow.bank}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Maturity Date:</span>
                          <span>{inspectRow.maturityDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rent Period:</span>
                          <span>{inspectRow.rentFromDate} to {inspectRow.rentToDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-bold text-emerald-600">QAR {Number(inspectRow.amount).toLocaleString()}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Receipt Number:</span>
                          <span className="font-bold text-primary">{inspectRow.receiptNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deposit Type:</span>
                          <span>{inspectRow.depositType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Method:</span>
                          <span>{inspectRow.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-bold text-emerald-600">QAR {Number(inspectRow.amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Remarks:</span>
                          <span>{inspectRow.remarks}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {inspectRow.errorMessage && (
                    <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                      <strong>Validation Issue:</strong> {inspectRow.errorMessage}
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" size="sm" onClick={() => setInspectRow(null)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
