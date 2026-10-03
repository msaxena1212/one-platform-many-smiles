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
  ChevronLeft,
  ChevronRight,
  History,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { DynamicMastersService } from "@/lib/dynamic-masters-service";
import { supabase } from "@/lib/supabase";
import { receivePdc } from "@/lib/finance/pdcService";
import { postLeaseDepositReceipt } from "@/lib/finance/posting-engine";
import { saveImportBatch, getImportBatchHistory, type AuditLogEntry } from "@/lib/excel-import/storage-service";
import type { ImportBatch } from "@/lib/excel-import/types";
import { getCurrentProfile } from "@/lib/auth-guards";

/** Local UUID normalizer — mirrors the private helper in posting-engine.ts */
function normalizeUuid(value: string | number | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return UUID_RE.test(s) ? s : undefined;
}

/** Robust Date parser to format DD-MM-YYYY, DD/MM/YYYY, Excel serial numbers, or YYYY-MM-DD to strict ISO YYYY-MM-DD */
function formatDateToIso(val: any): string {
  if (val === null || val === undefined || val === "") return new Date().toISOString().split("T")[0];
  if (typeof val === "number") {
    // Excel serial date format (approximate to JS date)
    const excelEpoch = new Date(1899, 11, 30);
    const dateObj = new Date(excelEpoch.getTime() + val * 86400000);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toISOString().split("T")[0];
    }
  }
  const s = String(val).trim().replace(/\./g, "-").replace(/\//g, "-");
  
  // Case: DD-MM-YYYY
  const ddmmyyyyMatch = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = ddmmyyyyMatch[1].padStart(2, "0");
    const month = ddmmyyyyMatch[2].padStart(2, "0");
    const year = ddmmyyyyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Case: YYYY-MM-DD
  const yyyymmddMatch = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (yyyymmddMatch) {
    const year = yyyymmddMatch[1];
    const month = yyyymmddMatch[2].padStart(2, "0");
    const day = yyyymmddMatch[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Try standard Date parse
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return s;
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  // Execution state tracking for accurate Results display
  const [executionStats, setExecutionStats] = useState<{ total: number; success: number; errors: number }>({
    total: 0,
    success: 0,
    errors: 0,
  });
  const [failedItemsState, setFailedItemsState] = useState<Array<{ item: any; error: string }>>([]);
  const [processingProgress, setProcessingProgress] = useState<{
    total: number;
    processed: number;
    success: number;
    currentItem: string;
  }>({ total: 0, processed: 0, success: 0, currentItem: "" });

  // Live entry log — grows during execution
  const [liveLog, setLiveLog] = useState<Array<{
    index: number;
    label: string;
    unit: string;
    status: "RUNNING" | "SUCCESS" | "ERROR";
    error?: string;
  }>>([])
  const liveLogRef = useRef<HTMLDivElement>(null);

  // Batch Execution History State
  const [historyBatches, setHistoryBatches] = useState<ImportBatch[]>([]);
  const [inspectedBatch, setInspectedBatch] = useState<ImportBatch | null>(null);
  const loadHistory = () => {
    try {
      const history = getImportBatchHistory();
      // Filter for PDC or lease/deposit related batches or general history
      setHistoryBatches(history.filter(b => (type === "PDC" ? (b.module === "lease" || (b as any).type === "PDC") : true)));
    } catch {
      setHistoryBatches([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [type, open]);

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
          ["2. For CREATE:", "Adds new cheque schedules linked to tenant lease."],
          ["3. For UPDATE:", "Patches maturity, amount, bank, or rent period."],
          ["4. For DELETE:", "De-registers PDCs from active holding register."],
        ]);
        XLSX.utils.book_append_sheet(wb, wsInst, "Instructions");

        XLSX.writeFile(wb, `Bulk_PDC_${selectedOperation}_Template.xlsx`);
      } else {
        const headers = [
          "SL.No",
          "Unit Name",
          "Property Code",
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

        const headerRow = (json[0] || []).map((h: any) => String(h || "").trim().toLowerCase());
        const dataRows = json.slice(1).filter((r: any[]) => r.length > 0 && r[0] != null);

        // Helper to find column index by match strings or fallback to default index
        const findColIdx = (keywords: string[], fallbackIdx: number) => {
          const idx = headerRow.findIndex((h: string) => keywords.some(k => h.includes(k)));
          return idx !== -1 ? idx : fallbackIdx;
        };

        if (type === "PDC") {
          // Detect whether old template format with check columns was uploaded
          const hasCheckCols = headerRow.some((h: string) => h.includes("check"));
          const slIdx = findColIdx(["sl", "no", "s.no"], 0);
          const unitIdx = findColIdx(["unit name", "unit"], 1);
          const propIdx = findColIdx(["property code", "property"], 2);
          const tenantIdx = findColIdx(["tenant name", "tenant", "drawer"], hasCheckCols ? 5 : 3);
          const chqIdx = findColIdx(["cheque number", "cheque no", "cheque", "chq"], hasCheckCols ? 6 : 4);
          const bankIdx = findColIdx(["bank"], hasCheckCols ? 7 : 5);
          const matIdx = findColIdx(["maturity date", "maturity", "cheque date", "date"], hasCheckCols ? 8 : 6);
          const amtIdx = findColIdx(["amount"], hasCheckCols ? 9 : 7);
          const rentFromIdx = findColIdx(["rent from", "from date", "period start"], hasCheckCols ? 10 : 8);
          const rentToIdx = findColIdx(["rent to", "to date", "period end"], hasCheckCols ? 11 : 9);

          const parsed: BulkPdcRow[] = dataRows.map((row: any[], idx: number) => {
            const slNo = row[slIdx] || idx + 1;
            const unitName = String(row[unitIdx] || `Unit-${idx + 1}`).trim();
            const propertyCode = String(row[propIdx] || "Wakra - 01").trim();
            const tenantName = String(row[tenantIdx] || "Tenant").trim();
            const chequeNumber = String(row[chqIdx] || `CHQ-${idx + 100}`).trim();
            const bank = String(row[bankIdx] || "Doha Bank").trim();
            const maturityDate = formatDateToIso(row[matIdx] || "2026-08-05");
            const amount = String(row[amtIdx] || "4700").replace(/,/g, "").trim();
            const rentFromDate = formatDateToIso(row[rentFromIdx] || "2026-07-15");
            const rentToDate = formatDateToIso(row[rentToIdx] || "2026-08-14");

            let status: "READY" | "WARNING" | "ERROR" = "READY";
            let errorMessage = "";

            if (!chequeNumber) {
              status = "ERROR";
              errorMessage = "Cheque Number is mandatory.";
            }

            return {
              id: `uploaded-pdc-${idx}-${Date.now()}`,
              slNo,
              unitName,
              propertyCode,
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
          const hasCheckCols = headerRow.some((h: string) => h.includes("check"));
          const slIdx = findColIdx(["sl", "no", "s.no"], 0);
          const unitIdx = findColIdx(["unit name", "unit"], 1);
          const propIdx = findColIdx(["property code", "property"], 2);
          const tenantIdx = findColIdx(["tenant name", "tenant"], hasCheckCols ? 5 : 3);
          const recIdx = findColIdx(["receipt number", "receipt no", "receipt", "voucher"], hasCheckCols ? 6 : 4);
          const depTypeIdx = findColIdx(["deposit type", "type"], hasCheckCols ? 7 : 5);
          const payMethodIdx = findColIdx(["payment method", "method"], hasCheckCols ? 8 : 6);
          const bankRefIdx = findColIdx(["bank or reference", "bank", "reference", "ref"], hasCheckCols ? 9 : 7);
          const amtIdx = findColIdx(["amount"], hasCheckCols ? 10 : 8);
          const depDateIdx = findColIdx(["deposit date", "date"], hasCheckCols ? 11 : 9);
          const remIdx = findColIdx(["remarks", "notes", "narration"], hasCheckCols ? 12 : 10);

          const parsed: BulkDepositRow[] = dataRows.map((row: any[], idx: number) => {
            const slNo = row[slIdx] || idx + 1;
            const unitName = String(row[unitIdx] || `Unit-${idx + 1}`).trim();
            const propertyCode = String(row[propIdx] || "Wakra - 01").trim();
            const tenantName = String(row[tenantIdx] || "Tenant").trim();
            const receiptNumber = String(row[recIdx] || `RV-DEP-${idx + 100}`).trim();
            const depositType = String(row[depTypeIdx] || "Security Deposit").trim();
            const paymentMethod = String(row[payMethodIdx] || "Bank Transfer").trim();
            const bankOrReference = String(row[bankRefIdx] || "REF-001").trim();
            const amount = String(row[amtIdx] || "5000").replace(/,/g, "").trim();
            const depositDate = formatDateToIso(row[depDateIdx] || "2026-07-15");
            const remarks = String(row[remIdx] || "Deposit Guarantee").trim();

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

  // Pagination state for preview table
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [previewPageSize, setPreviewPageSize] = useState<number>(20);

  // Reset page when search or tab changes
  useEffect(() => {
    setPreviewPage(1);
  }, [previewTab, previewSearch, type, selectedOperation]);

  // Execution Handler with true Database and GL Accounting Posting
  const handleExecute = async () => {
    if (selectedOperation === "DELETE" && !deleteConfirmed) {
      toast.error("Please confirm that you understand the destructive nature of the DELETE operation.");
      return;
    }

    try {
      setIsProcessing(true);
      setCurrentStep("processing");
      setLiveLog([]);

      const processedItems = type === "PDC" ? pdcRows : depositRows;
      const validItems = processedItems.filter((r) => r.status === "READY" || r.status === "WARNING");

      let successCount = 0;
      let errorCount = 0;
      const failedItems: any[] = [];

      setProcessingProgress({
        total: validItems.length,
        processed: 0,
        success: 0,
        currentItem: "Initializing batch execution...",
      });

      if (type === "PDC") {
        const pdcList = validItems as BulkPdcRow[];

        if (selectedOperation === "CREATE") {
          // Process in sequential chunks with live progress updates
          for (let i = 0; i < pdcList.length; i++) {
            const item = pdcList[i];
            const logLabel = `Cheque #${item.chequeNumber}`;
            // Mark as RUNNING
            setLiveLog((prev) => [
              ...prev,
              { index: i, label: logLabel, unit: item.unitName, status: "RUNNING" },
            ]);
            setTimeout(() => liveLogRef.current?.scrollTo({ top: liveLogRef.current.scrollHeight, behavior: "smooth" }), 30);
            setProcessingProgress({
              total: pdcList.length,
              processed: i + 1,
              success: successCount,
              currentItem: `${logLabel} (${item.unitName})`,
            });
            try {
              const matchedLease = existingLeases.find(
                (l) =>
                  (item.unitName && l.unit && l.unit.toLowerCase() === item.unitName.toLowerCase()) ||
                  (item.tenantName && l.tenantName && l.tenantName.toLowerCase().includes(item.tenantName.toLowerCase()))
              );

              const numAmount = typeof item.amount === "number" ? item.amount : parseFloat(String(item.amount).replace(/,/g, "")) || 0;
              const tenantId = matchedLease?.id || "00000000-0000-0000-0000-000000000003";
              const propertyId = matchedLease?.property || item.propertyCode || "00000000-0000-0000-0000-000000000001";
              const unitId = matchedLease?.unit || item.unitName || "00000000-0000-0000-0000-000000000002";
              const leaseId = matchedLease?.id || undefined;
              const safeMaturityDate = formatDateToIso(item.maturityDate);
              const safeRentFrom = formatDateToIso(item.rentFromDate);
              const safeRentTo = formatDateToIso(item.rentToDate);

              // Check existing PDC by compound key (cheque_number + unit_name) to avoid
              // overwriting a different unit's PDC that happens to share the same cheque number.
              const { data: existingPdc } = await supabase
                .from("pdcs")
                .select("id")
                .eq("cheque_number", item.chequeNumber)
                .eq("unit_name", item.unitName || "")
                .maybeSingle();

              if (existingPdc?.id) {
                await supabase
                  .from("pdcs")
                  .update({
                    bank: item.bank,
                    maturity_date: safeMaturityDate,
                    amount: numAmount,
                    tenant_name: item.tenantName,
                    unit_name: item.unitName,
                    property_code: item.propertyCode,
                    rent_from_date: safeRentFrom,
                    rent_to_date: safeRentTo,
                    status: "received",
                    status_pdc: "received",
                    lease_id: normalizeUuid(leaseId),
                  })
                  .eq("id", existingPdc.id);
              } else {
                await supabase.from("pdcs").insert({
                  cheque_number: item.chequeNumber,
                  bank: item.bank,
                  maturity_date: safeMaturityDate,
                  amount: numAmount,
                  tenant_name: item.tenantName,
                  unit_name: item.unitName,
                  property_code: item.propertyCode,
                  rent_from_date: safeRentFrom,
                  rent_to_date: safeRentTo,
                  status: "received",
                  status_pdc: "received",
                  lease_id: normalizeUuid(leaseId),
                });
              }

              await receivePdc({
                cheque_number: item.chequeNumber,
                cheque_date: safeMaturityDate,
                amount: numAmount,
                tenant_id: tenantId,
                property_id: propertyId,
                unit_id: unitId,
                unitCode: item.unitName,
                lease_id: leaseId,
                pdcType: "RENT_PDC",
              });
              successCount++;
              setLiveLog((prev) => prev.map((e) => e.index === i ? { ...e, status: "SUCCESS" } : e));
            } catch (err: any) {
              console.warn(`[Bulk PDC] Handled row ${item.chequeNumber}:`, err.message);
              errorCount++;
              failedItems.push({ item, error: err.message });
              setLiveLog((prev) => prev.map((e) => e.index === i ? { ...e, status: "ERROR", error: err.message } : e));
            }
          }
        } else if (selectedOperation === "UPDATE") {
          for (let i = 0; i < pdcList.length; i++) {
            const item = pdcList[i];
            const logLabel = `Cheque #${item.chequeNumber}`;
            setLiveLog((prev) => [...prev, { index: i, label: logLabel, unit: item.unitName, status: "RUNNING" }]);
            setTimeout(() => liveLogRef.current?.scrollTo({ top: liveLogRef.current.scrollHeight, behavior: "smooth" }), 30);
            setProcessingProgress({
              total: pdcList.length,
              processed: i + 1,
              success: successCount,
              currentItem: logLabel,
            });
            try {
              const numAmount = typeof item.amount === "number" ? item.amount : parseFloat(String(item.amount).replace(/,/g, "")) || 0;
              const safeMaturityDate = formatDateToIso(item.maturityDate);
              await supabase
                .from("fin_pdc_register")
                .update({
                  amount: numAmount,
                  cheque_date: safeMaturityDate,
                })
                .eq("cheque_number", item.chequeNumber);

              await supabase
                .from("pdcs")
                .update({
                  amount: numAmount,
                  maturity_date: safeMaturityDate,
                  bank: item.bank,
                })
                .eq("cheque_number", item.chequeNumber);

              successCount++;
              setLiveLog((prev) => prev.map((e) => e.index === i ? { ...e, status: "SUCCESS" } : e));
            } catch (err: any) {
              console.warn(`[Bulk PDC Update] Row ${item.chequeNumber}:`, err.message);
              errorCount++;
              failedItems.push({ item, error: err.message });
              setLiveLog((prev) => prev.map((e) => e.index === i ? { ...e, status: "ERROR", error: err.message } : e));
            }
          }
        } else if (selectedOperation === "DELETE") {
          const chqNos = pdcList.map((r) => r.chequeNumber);
          if (chqNos.length > 0) {
            await supabase.from("fin_pdc_register").delete().in("cheque_number", chqNos);
            await supabase.from("pdcs").delete().in("cheque_number", chqNos);
          }
          successCount += chqNos.length;
        }
      } else {
        // Lease Security Deposit batch
        const depositList = validItems as BulkDepositRow[];

        if (selectedOperation === "CREATE") {
          for (let i = 0; i < depositList.length; i++) {
            const item = depositList[i];
            const logLabel = `Receipt #${item.receiptNumber}`;
            setLiveLog((prev) => [...prev, { index: i, label: logLabel, unit: item.unitName, status: "RUNNING" }]);
            setTimeout(() => liveLogRef.current?.scrollTo({ top: liveLogRef.current.scrollHeight, behavior: "smooth" }), 30);
            setProcessingProgress({
              total: depositList.length,
              processed: i + 1,
              success: successCount,
              currentItem: `${logLabel} (${item.unitName})`,
            });
            try {
              const matchedLease = existingLeases.find(
                (l) =>
                  (item.unitName && l.unit && l.unit.toLowerCase() === item.unitName.toLowerCase()) ||
                  (item.tenantName && l.tenantName && l.tenantName.toLowerCase().includes(item.tenantName.toLowerCase()))
              );

              const numAmount = typeof item.amount === "number" ? item.amount : parseFloat(String(item.amount).replace(/,/g, "")) || 0;
              const tenantId = matchedLease?.id || "00000000-0000-0000-0000-000000000003";
              const propertyId = matchedLease?.property || item.propertyCode || "00000000-0000-0000-0000-000000000001";
              const unitId = matchedLease?.unit || item.unitName || "00000000-0000-0000-0000-000000000002";
              const mode = item.paymentMethod.toLowerCase().includes("cash") ? "Cash" : "Bank";

              await postLeaseDepositReceipt(
                numAmount,
                tenantId,
                propertyId,
                unitId,
                mode,
                item.receiptNumber,
                item.unitName,
                "SECURITY",
                matchedLease?.id
              );
              successCount++;
              setLiveLog((prev) => prev.map((e) => e.index === i ? { ...e, status: "SUCCESS" } : e));
            } catch (err: any) {
              console.warn(`[Bulk Deposit] Handled row ${item.receiptNumber}:`, err.message);
              errorCount++;
              failedItems.push({ item, error: err.message });
              setLiveLog((prev) => prev.map((e) => e.index === i ? { ...e, status: "ERROR", error: err.message } : e));
            }
          }
        }
      }

      setExecutionStats({
        total: validItems.length,
        success: successCount,
        errors: errorCount,
      });
      setFailedItemsState(failedItems);

      // Save batch into persistent storage history for auditing & replay
      const profile = await getCurrentProfile();
      const newBatch: ImportBatch = {
        id: `batch-${Date.now()}`,
        batchIdentifier: `BATCH-${type}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
        module: type === "PDC" ? "lease" : "lease",
        operation: selectedOperation,
        fileName: uploadedFileName || `Bulk_${type}_${selectedOperation}_Manual.xlsx`,
        fileSize: 1024 * (processedItems.length || 1),
        uploadedBy: {
          id: profile?.id || "admin",
          name: profile?.name || "Operations User",
          email: profile?.email || "ops@stayhub.qa",
        },
        uploadedAt: new Date().toISOString(),
        status: errorCount === 0 ? "COMPLETED" : successCount > 0 ? "PARTIAL_SUCCESS" : "FAILED",
        records: (processedItems as any[]).map((r, idx) => ({
          recordKey: type === "PDC" ? r.chequeNumber : r.receiptNumber,
          excelRowNumber: Number(r.slNo) || idx + 2,
          operation: selectedOperation,
          status: r.status === "READY" ? "VALID" : r.status === "WARNING" ? "WARNING" : "ERROR",
          normalizedData: r,
          errors: r.errorMessage && r.status === "ERROR" ? [{ code: "VALIDATION_FAIL", message: r.errorMessage, rowNumber: Number(r.slNo) || idx + 2, severity: "ERROR" }] : [],
          warnings: r.errorMessage && r.status === "WARNING" ? [{ code: "MISMATCH_WARN", message: r.errorMessage, rowNumber: Number(r.slNo) || idx + 2, severity: "WARNING" }] : [],
          changes: [],
          dependencies: [],
          rawRowData: r,
        })),
        summary: {
          totalRows: processedItems.length,
          validRows: successCount,
          errorRows: errorCount,
          warningRows: summary.warnings,
          recordsToCreate: selectedOperation === "CREATE" ? successCount : 0,
          recordsToUpdate: selectedOperation === "UPDATE" ? successCount : 0,
          recordsToDelete: selectedOperation === "DELETE" ? successCount : 0,
          noChangeRows: 0,
          blockedRows: 0,
          skippedRows: errorCount,
          successRows: successCount,
          failedRows: errorCount,
        },
      };

      try {
        saveImportBatch(newBatch);
        loadHistory();
      } catch (e) {
        console.warn("Could not save batch to local storage:", e);
      }

      // Notify App Data Context & Finance modules to refresh
      window.dispatchEvent(new Event("finance_vouchers_updated"));
      window.dispatchEvent(new Event("pms_data_updated"));

      if (onSuccess) {
        onSuccess(processedItems);
      }

      setCurrentStep("results");
      if (errorCount === 0) {
        toast.success(
          `Import execution completed: ${successCount} records processed successfully and synced to General Ledger!`
        );
      } else {
        toast.warning(
          `Import completed with notices: ${successCount} succeeded, ${errorCount} failed/skipped.`
        );
      }
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
              <Button
                variant={currentStep === "history" ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  if (currentStep === "history") {
                    setCurrentStep("upload");
                  } else {
                    loadHistory();
                    setCurrentStep("history");
                  }
                }}
                className="text-xs gap-1.5"
              >
                <History className="h-3.5 w-3.5 text-primary" />
                {currentStep === "history" ? "Back to Studio" : `Execution History (${historyBatches.length})`}
              </Button>

              {currentStep !== "upload" && currentStep !== "history" && (
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

          {/* STEP: EXECUTION HISTORY VIEW */}
          {currentStep === "history" && (
            <Card className="border-border/60">
              <CardHeader className="pb-3 flex flex-row items-center justify-between border-b bg-muted/20">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" /> Excel Ingestion Lineage &amp; Execution History
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Persistent ledger of executed PDC &amp; Deposit bulk upload batches with row counts, committed state, and error logs.
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => setCurrentStep("upload")} className="h-7 text-xs">
                  Back to Studio
                </Button>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto max-h-[420px]">
                {historyBatches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-muted-foreground py-12 space-y-2">
                    <Clock className="h-8 w-8 opacity-30 text-teal-600" />
                    <p className="text-xs">No previous batch execution history records found in storage.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur-xs z-10">
                      <TableRow className="text-xs">
                        <TableHead className="font-semibold">Batch ID</TableHead>
                        <TableHead className="font-semibold">Operation</TableHead>
                        <TableHead className="font-semibold">File Name</TableHead>
                        <TableHead className="font-semibold">Uploaded By</TableHead>
                        <TableHead className="text-center font-semibold">Total Rows</TableHead>
                        <TableHead className="text-center font-semibold text-emerald-600">Committed (OK)</TableHead>
                        <TableHead className="text-center font-semibold text-rose-600">Errors</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Date &amp; Time</TableHead>
                        <TableHead className="font-semibold text-center">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyBatches.map((b) => {
                        const totalRows = b.summary?.totalRows || b.records?.length || 0;
                        const successRows = b.summary?.successRows || 0;
                        const failedRows = b.summary?.failedRows || 0;
                        const displayDate = b.uploadedAt ? new Date(b.uploadedAt).toLocaleString() : "Recent";

                        return (
                          <TableRow key={b.id} className="hover:bg-muted/40 text-xs">
                            <TableCell className="font-mono font-bold text-primary">{b.batchIdentifier || b.id.slice(0, 10)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={b.operation === "CREATE" ? "default" : b.operation === "UPDATE" ? "secondary" : "destructive"}
                                className="text-[10px] uppercase font-bold"
                              >
                                {b.operation}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[160px] truncate font-mono text-[11px]" title={b.fileName}>
                              {b.fileName}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{b.uploadedBy?.name || "Admin"}</TableCell>
                            <TableCell className="text-center font-mono font-semibold">{totalRows}</TableCell>
                            <TableCell className="text-center font-mono text-emerald-600 font-bold">{successRows}</TableCell>
                            <TableCell className="text-center font-mono text-rose-600 font-bold">{failedRows}</TableCell>
                            <TableCell>
                              <Badge
                                className={`text-[10px] font-bold ${
                                  b.status === "COMPLETED"
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                    : b.status === "PARTIAL_SUCCESS"
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                    : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                                }`}
                                variant="outline"
                              >
                                {b.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">{displayDate}</TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-[10px] gap-1 text-primary hover:bg-primary/10"
                                onClick={() => setInspectedBatch(b)}
                              >
                                <FileText className="h-3 w-3" />
                                Inspect
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

          {/* BATCH DETAIL INSPECT DIALOG */}
          {inspectedBatch && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-background border border-border/60 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
                  <div>
                    <h3 className="text-sm font-bold font-mono text-primary">{inspectedBatch.batchIdentifier || inspectedBatch.id}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {inspectedBatch.operation} · {inspectedBatch.fileName} · {inspectedBatch.uploadedAt ? new Date(inspectedBatch.uploadedAt).toLocaleString() : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-3 text-xs">
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {inspectedBatch.summary?.successRows ?? 0} OK
                      </span>
                      <span className="flex items-center gap-1 text-rose-600 font-semibold">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {inspectedBatch.summary?.failedRows ?? 0} Errors
                      </span>
                      <span className="flex items-center gap-1 text-amber-600 font-semibold">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {inspectedBatch.summary?.warningRows ?? 0} Warnings
                      </span>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInspectedBatch(null)}>
                      Close
                    </Button>
                  </div>
                </div>

                {/* Summary row */}
                <div className="flex gap-6 px-6 py-3 bg-muted/10 border-b text-xs text-muted-foreground">
                  <span>Total Rows: <strong className="text-foreground">{inspectedBatch.summary?.totalRows ?? inspectedBatch.records?.length ?? 0}</strong></span>
                  <span>Uploaded by: <strong className="text-foreground">{inspectedBatch.uploadedBy?.name || "Admin"}</strong></span>
                  <Badge
                    className={`text-[10px] font-bold ${
                      inspectedBatch.status === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : inspectedBatch.status === "PARTIAL_SUCCESS"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                    }`}
                    variant="outline"
                  >
                    {inspectedBatch.status}
                  </Badge>
                </div>

                {/* Records table */}
                <div className="overflow-y-auto flex-1">
                  {(!inspectedBatch.records || inspectedBatch.records.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <FileText className="h-8 w-8 opacity-20 mb-2" />
                      <p className="text-xs">No individual record details stored for this batch.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur-xs z-10">
                        <TableRow className="text-xs">
                          <TableHead className="font-semibold w-10">#</TableHead>
                          <TableHead className="font-semibold">Record Key</TableHead>
                          <TableHead className="font-semibold">Unit</TableHead>
                          <TableHead className="font-semibold">Cheque / Receipt</TableHead>
                          <TableHead className="font-semibold text-right">Amount</TableHead>
                          <TableHead className="font-semibold">Maturity Date</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Errors / Warnings</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inspectedBatch.records.map((rec, idx) => {
                          const raw = (rec as any).rawRowData || (rec as any).normalizedData || {};
                          const errMsgs = (rec.errors || []).map((e: any) => e.message).filter(Boolean);
                          const warnMsgs = (rec.warnings || []).map((w: any) => w.message).filter(Boolean);
                          const statusColor =
                            rec.status === "VALID" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : rec.status === "WARNING" ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : "bg-rose-500/10 text-rose-600 border-rose-500/30";

                          return (
                            <TableRow key={rec.recordKey || idx} className="text-xs hover:bg-muted/30">
                              <TableCell className="font-mono text-muted-foreground">{rec.excelRowNumber || idx + 2}</TableCell>
                              <TableCell className="font-mono font-semibold text-primary max-w-[140px] truncate" title={rec.recordKey}>
                                {rec.recordKey || "—"}
                              </TableCell>
                              <TableCell className="max-w-[140px] truncate" title={raw.unitName}>
                                {raw.unitName || raw.unit_name || "—"}
                              </TableCell>
                              <TableCell className="font-mono text-[11px]">
                                {raw.chequeNumber || raw.cheque_number || raw.receiptNumber || raw.receipt_number || "—"}
                              </TableCell>
                              <TableCell className="text-right font-mono font-semibold">
                                {raw.amount ? `QR ${Number(raw.amount).toLocaleString("en-QA", { minimumFractionDigits: 2 })}` : "—"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {raw.maturityDate || raw.maturity_date || raw.cheque_date || "—"}
                              </TableCell>
                              <TableCell>
                                <Badge className={`text-[10px] font-bold ${statusColor}`} variant="outline">
                                  {rec.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[200px]">
                                {errMsgs.length > 0 && (
                                  <div className="text-rose-600 text-[10px] space-y-0.5">
                                    {errMsgs.map((m: string, mi: number) => (
                                      <div key={mi} className="flex items-start gap-1">
                                        <AlertCircle className="h-2.5 w-2.5 mt-0.5 shrink-0" />
                                        <span>{m}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {warnMsgs.length > 0 && (
                                  <div className="text-amber-600 text-[10px] space-y-0.5 mt-1">
                                    {warnMsgs.map((m: string, mi: number) => (
                                      <div key={mi} className="flex items-start gap-1">
                                        <AlertTriangle className="h-2.5 w-2.5 mt-0.5 shrink-0" />
                                        <span>{m}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {errMsgs.length === 0 && warnMsgs.length === 0 && (
                                  <span className="text-emerald-600 text-[10px] flex items-center gap-1">
                                    <CheckCircle2 className="h-2.5 w-2.5" /> OK
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </div>
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

                  {/* Table with fixed height viewport and pagination */}
                  {(() => {
                    const totalItems = filteredRecords.length;
                    const totalPages = Math.ceil(totalItems / previewPageSize) || 1;
                    const currentPage = Math.min(previewPage, totalPages);
                    const startIndex = (currentPage - 1) * previewPageSize;
                    const paginatedRecords = filteredRecords.slice(startIndex, startIndex + previewPageSize);

                    return (
                      <>
                        <div className="rounded-md border overflow-x-auto max-h-[380px] overflow-y-auto">
                          {type === "PDC" ? (
                            <Table>
                              <TableHeader className="sticky top-0 bg-muted z-10">
                                <TableRow className="text-xs">
                                  <TableHead className="w-16">Row #</TableHead>
                                  <TableHead className="w-28">Status</TableHead>
                                  <TableHead>Unit Name</TableHead>
                                  <TableHead>Property Code</TableHead>
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
                                {paginatedRecords.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={11} className="text-center py-8 text-xs text-muted-foreground">
                                      No records match current filter.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  (paginatedRecords as BulkPdcRow[]).map((record, idx) => (
                                    <TableRow key={record.id || idx}>
                                      <TableCell className="font-mono text-xs font-medium">{record.slNo || startIndex + idx + 1}</TableCell>
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
                              <TableHeader className="sticky top-0 bg-muted z-10">
                                <TableRow className="text-xs">
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
                                {paginatedRecords.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={12} className="text-center py-8 text-xs text-muted-foreground">
                                      No records match current filter.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  (paginatedRecords as BulkDepositRow[]).map((record, idx) => (
                                    <TableRow key={record.id || idx}>
                                      <TableCell className="font-mono text-xs font-medium">{record.slNo || startIndex + idx + 1}</TableCell>
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

                        {/* Pagination Bar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-2 px-1 text-xs text-muted-foreground">
                          <div>
                            Showing <span className="font-medium text-foreground">{totalItems === 0 ? 0 : startIndex + 1}</span> to{" "}
                            <span className="font-medium text-foreground">{Math.min(startIndex + previewPageSize, totalItems)}</span> of{" "}
                            <span className="font-medium text-foreground">{totalItems}</span> rows
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <span>Rows per page:</span>
                              <select
                                className="h-7 text-xs rounded border bg-background px-1.5 py-0.5 text-foreground"
                                value={previewPageSize}
                                onChange={(e) => {
                                  setPreviewPageSize(Number(e.target.value));
                                  setPreviewPage(1);
                                }}
                              >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                disabled={currentPage <= 1}
                                onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </Button>
                              <span className="px-2 font-mono text-foreground font-medium">
                                {currentPage} / {totalPages}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                disabled={currentPage >= totalPages}
                                onClick={() => setPreviewPage((p) => Math.min(totalPages, p + 1))}
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {/* Bottom Action Footer */}
                  <div className="sticky bottom-0 z-20 bg-card flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-1 border-t shadow-sm">
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
              <CardContent className="py-6 flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2.5 bg-teal-500/10 text-teal-600 rounded-full shrink-0">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">Executing Ingestion Pipeline</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Writing GL entries, resolving accounts &amp; updating register.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono font-bold text-emerald-600">{processingProgress.success} Committed</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{processingProgress.processed} / {processingProgress.total}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full space-y-1">
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-600 to-emerald-500 h-2 rounded-full transition-all duration-150"
                      style={{
                        width: `${
                          processingProgress.total > 0
                            ? Math.min(100, (processingProgress.processed / processingProgress.total) * 100)
                            : 4
                        }%`,
                      }}
                    />
                  </div>
                  {processingProgress.currentItem && (
                    <p className="text-[10px] font-mono text-muted-foreground truncate">
                      <span className="text-teal-600 font-semibold">Active: </span>{processingProgress.currentItem}
                    </p>
                  )}
                </div>

                {/* Live entry log */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Execution Log</span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {liveLog.filter(e => e.status === "SUCCESS").length} ok &nbsp;·&nbsp;
                      {liveLog.filter(e => e.status === "ERROR").length} err
                    </span>
                  </div>
                  <div
                    ref={liveLogRef}
                    className="rounded-md border bg-muted/30 overflow-y-auto font-mono text-[11px]"
                    style={{ maxHeight: "280px", minHeight: "80px" }}
                  >
                    {liveLog.length === 0 ? (
                      <div className="px-3 py-4 text-[11px] text-muted-foreground text-center">
                        Waiting for first entry...
                      </div>
                    ) : (
                      <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted/80 border-b border-border/40 z-10">
                          <tr>
                            <th className="px-2 py-1 text-left text-[10px] font-bold text-muted-foreground w-8">#</th>
                            <th className="px-2 py-1 text-left text-[10px] font-bold text-muted-foreground">{type === "PDC" ? "Cheque No." : "Receipt No."}</th>
                            <th className="px-2 py-1 text-left text-[10px] font-bold text-muted-foreground">Unit</th>
                            <th className="px-2 py-1 text-left text-[10px] font-bold text-muted-foreground">Status</th>
                            <th className="px-2 py-1 text-left text-[10px] font-bold text-muted-foreground">Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {liveLog.map((entry) => (
                            <tr
                              key={entry.index}
                              className={`border-b border-border/20 ${
                                entry.status === "RUNNING"
                                  ? "bg-teal-500/5"
                                  : entry.status === "SUCCESS"
                                  ? "bg-emerald-500/5"
                                  : "bg-rose-500/5"
                              }`}
                            >
                              <td className="px-2 py-0.5 text-muted-foreground">{entry.index + 1}</td>
                              <td className="px-2 py-0.5 font-semibold text-foreground">{entry.label}</td>
                              <td className="px-2 py-0.5 text-muted-foreground truncate max-w-[130px]" title={entry.unit}>{entry.unit}</td>
                              <td className="px-2 py-0.5">
                                {entry.status === "RUNNING" ? (
                                  <span className="flex items-center gap-1 text-teal-600">
                                    <Loader2 className="h-3 w-3 animate-spin" /> Processing
                                  </span>
                                ) : entry.status === "SUCCESS" ? (
                                  <span className="flex items-center gap-1 text-emerald-600">
                                    <CheckCircle2 className="h-3 w-3" /> Committed
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-rose-600">
                                    <XCircle className="h-3 w-3" /> Failed
                                  </span>
                                )}
                              </td>
                              <td className="px-2 py-0.5 text-muted-foreground text-[10px] truncate max-w-[140px]" title={entry.error || ""}>
                                {entry.error ? <span className="text-rose-500">{entry.error.slice(0, 60)}{entry.error.length > 60 ? '…' : ''}</span> : null}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground self-start">
                  Please do not close this window while database writes are active.
                </p>
              </CardContent>
            </Card>
          )}

          {/* STEP 4: FINAL RESULTS */}
          {currentStep === "results" && (
            <Card className="border-border/60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    executionStats.errors > 0 && executionStats.success === 0
                      ? "bg-rose-100 text-rose-600"
                      : executionStats.errors > 0
                      ? "bg-amber-100 text-amber-600"
                      : "bg-emerald-100 text-emerald-600"
                  }`}>
                    {executionStats.errors > 0 && executionStats.success === 0
                      ? <XCircle className="h-6 w-6" />
                      : executionStats.errors > 0
                      ? <AlertTriangle className="h-6 w-6" />
                      : <FileCheck className="h-6 w-6" />
                    }
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Import Execution Finished</CardTitle>
                    <CardDescription className="text-xs">
                      Bulk ingestion completed for {type} ({selectedOperation}).
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/40 border text-center">
                    <p className="text-xs text-muted-foreground">Total Ingested</p>
                    <p className="text-2xl font-bold">{executionStats.total || summary.total}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                    <p className="text-xs text-emerald-600 font-medium">Successfully Committed</p>
                    <p className="text-2xl font-bold text-emerald-700">{executionStats.success}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                    <p className="text-xs text-destructive font-medium">Failed / Skipped</p>
                    <p className="text-2xl font-bold text-destructive">{executionStats.errors}</p>
                  </div>
                </div>

                {/* Inline Failed Records Error Detail Table */}
                {failedItemsState.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-rose-600">
                        Failed / Skipped Records — Error Details ({failedItemsState.length} rows)
                      </h4>
                    </div>
                    <div className="rounded-md border border-rose-200 overflow-hidden">
                      <div className="max-h-[260px] overflow-y-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead className="sticky top-0 bg-rose-50 border-b border-rose-200 z-10">
                            <tr>
                              <th className="px-2.5 py-2 text-left text-[10px] font-bold uppercase text-rose-700 whitespace-nowrap">Row</th>
                              <th className="px-2.5 py-2 text-left text-[10px] font-bold uppercase text-rose-700 whitespace-nowrap">
                                {type === "PDC" ? "Cheque No." : "Receipt No."}
                              </th>
                              <th className="px-2.5 py-2 text-left text-[10px] font-bold uppercase text-rose-700 whitespace-nowrap">Unit / Tenant</th>
                              <th className="px-2.5 py-2 text-left text-[10px] font-bold uppercase text-rose-700">Error Reason</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-rose-100">
                            {failedItemsState.map((f, idx) => (
                              <tr key={idx} className="hover:bg-rose-50/60">
                                <td className="px-2.5 py-1.5 font-mono font-bold text-rose-700 text-[11px] whitespace-nowrap">
                                  {f.item?.slNo || idx + 2}
                                </td>
                                <td className="px-2.5 py-1.5 font-mono text-[11px]">
                                  {type === "PDC" ? (f.item?.chequeNumber || "—") : (f.item?.receiptNumber || "—")}
                                </td>
                                <td className="px-2.5 py-1.5">
                                  <span className="text-[11px] block truncate max-w-[140px]" title={f.item?.unitName}>
                                    {f.item?.unitName || "—"}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground block truncate max-w-[140px]">
                                    {f.item?.tenantName || ""}
                                  </span>
                                </td>
                                <td className="px-2.5 py-1.5">
                                  <span className="text-[11px] text-rose-800 block leading-tight" title={f.error}>
                                    {f.error && f.error.length > 90 ? f.error.slice(0, 90) + "…" : (f.error || "Unknown error")}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {failedItemsState.length > 8 && (
                        <div className="px-3 py-1.5 bg-rose-50 border-t border-rose-200 text-[10px] text-rose-600 font-medium">
                          {failedItemsState.length} failed rows — scroll to view all details
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={resetUploadState} className="text-xs">
                    Import Another File
                  </Button>

                  <Button onClick={() => onOpenChange(false)} className="text-xs gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Done &amp; Close
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
