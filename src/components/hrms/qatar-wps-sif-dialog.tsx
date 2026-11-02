import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Download,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Building2,
  Landmark,
  Eye,
  RefreshCw,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  WpsEmployerConfig,
  WpsEmployeeRecord,
  DEFAULT_AL_AMEEN_WPS_CONFIG,
  QATAR_BANKS_SWIFT,
  validateWpsPayroll,
  generateQatarWpsSif,
  generateQatarWpsCsv,
  normalizeQatarIban,
  normalizeQatarId,
} from "@/lib/qatar-wps-sif";
import type { HrmsPayslip, HrmsEmployee } from "@/lib/hrmsService";

interface QatarWpsSifDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payslips: HrmsPayslip[];
  employees: HrmsEmployee[];
  cycleMonthYear: string; // e.g. "2026-09"
  cycleName?: string;
}

export function QatarWpsSifDialog({
  open,
  onOpenChange,
  payslips,
  employees,
  cycleMonthYear,
  cycleName,
}: QatarWpsSifDialogProps) {
  const [config, setConfig] = useState<WpsEmployerConfig>(DEFAULT_AL_AMEEN_WPS_CONFIG);
  const [showRawPreview, setShowRawPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoNormalized, setAutoNormalized] = useState(false);

  // Map payslips & employees to WpsEmployeeRecord
  const wpsRecords = useMemo<WpsEmployeeRecord[]>(() => {
    return payslips.map((ps, idx) => {
      const emp = employees.find((e) => e.id === ps.employee_id) || ps.employees || {};
      const fName = emp.first_name || "";
      const lName = emp.last_name || "";
      const fullName = `${fName} ${lName}`.trim() || `Staff ${ps.employee_id.slice(-4)}`;

      // Resolve bank swift
      const bankName = (emp.bank_name || "QNB").toUpperCase();
      let swift = "QNBAQAQA";
      for (const [key, val] of Object.entries(QATAR_BANKS_SWIFT)) {
        if (bankName.includes(key)) {
          swift = val;
          break;
        }
      }

      const rawQid = emp.qid || emp.national_id || emp.qatar_id || emp.id_number || "";
      const rawIban = emp.iban || emp.bank_account_number || "";

      const employeeQid = autoNormalized
        ? normalizeQatarId(rawQid, idx + 101)
        : rawQid || normalizeQatarId("", idx + 101);

      const employeeIban = autoNormalized
        ? normalizeQatarIban(rawIban, swift)
        : rawIban || normalizeQatarIban("", swift);

      return {
        employeeIdCode: emp.employee_id_code || `EMP-${String(idx + 1).padStart(3, "0")}`,
        employeeQid,
        visaId: emp.visa_number || undefined,
        employeeName: fullName,
        employeeBankSwift: swift,
        employeeIban,
        workingDays: ps.working_days || 30,
        netSalary: Number(ps.net_salary || 0),
        basicSalary: Number(ps.basic_pay || 0),
        extraHours: Number(ps.overtime_hours || 0),
        extraHoursPay: Number(ps.overtime_pay || 0),
        deductions: Number(ps.total_deductions || 0),
        paymentType: "SALARY",
        notes: `AL AMEEN SALARY ${cycleMonthYear}`,
      };
    });
  }, [payslips, employees, autoNormalized, cycleMonthYear]);

  // Validation
  const validation = useMemo(() => {
    return validateWpsPayroll(config, wpsRecords);
  }, [config, wpsRecords]);

  // SIF Output
  const sifResult = useMemo(() => {
    return generateQatarWpsSif(config, cycleMonthYear, wpsRecords);
  }, [config, cycleMonthYear, wpsRecords]);

  // CSV Output
  const csvResult = useMemo(() => {
    return generateQatarWpsCsv(config, cycleMonthYear, wpsRecords);
  }, [config, cycleMonthYear, wpsRecords]);

  const handleDownloadSif = () => {
    const blob = new Blob([sifResult.sifContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = sifResult.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported WPS SIF File: ${sifResult.fileName}`, {
      description: `Ready for direct upload to QCB portal or your corporate banking platform.`,
    });
  };

  const handleDownloadCsv = () => {
    const blob = new Blob([csvResult.csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = csvResult.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported WPS Bank CSV: ${csvResult.fileName}`);
  };

  const handleCopySif = () => {
    navigator.clipboard.writeText(sifResult.sifContent);
    setCopied(true);
    toast.success("WPS SIF raw text copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-600/10 text-teal-600 dark:text-teal-400">
                <Landmark className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  Qatar Central Bank & MoL Wages Protection System (WPS)
                  <Badge
                    variant="outline"
                    className="border-teal-500 text-teal-600 bg-teal-50 dark:bg-teal-950/30 text-[11px]"
                  >
                    SIF Generator v2.1
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Generate official electronic Salary Information Files (.sif) compliant with QCB &
                  Ministry of Labour regulations for {cycleName || cycleMonthYear}.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Employer Configuration Card */}
        <div className="bg-muted/40 p-3.5 rounded-xl border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-teal-600" /> Employer Corporate Credentials
              (QCB Payer Data)
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              Cycle: {cycleMonthYear}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-[11px]">Employer CR Number</Label>
              <Input
                value={config.employerCr}
                onChange={(e) => setConfig({ ...config, employerCr: e.target.value })}
                className="h-8 text-xs font-mono mt-1"
                placeholder="e.g. 90021-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Payer Bank SWIFT / BIC</Label>
              <Select
                value={config.payerBankSwift}
                onValueChange={(v) => setConfig({ ...config, payerBankSwift: v })}
              >
                <SelectTrigger className="h-8 text-xs font-mono mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DKBNQAQA">Dukhan Bank (DKBNQAQA)</SelectItem>
                  <SelectItem value="QNBAQAQA">Qatar National Bank (QNBAQAQA)</SelectItem>
                  <SelectItem value="CBQAQAQA">Commercial Bank of Qatar (CBQAQAQA)</SelectItem>
                  <SelectItem value="QIBKQAQA">Qatar Islamic Bank (QIBKQAQA)</SelectItem>
                  <SelectItem value="DOHBQAQA">Doha Bank (DOHBQAQA)</SelectItem>
                  <SelectItem value="MARKQAQA">Masraf Al Rayan (MARKQAQA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px]">Payer Corporate IBAN</Label>
              <Input
                value={config.payerIban}
                onChange={(e) => setConfig({ ...config, payerIban: e.target.value })}
                className="h-8 text-xs font-mono mt-1"
                placeholder="QA..."
              />
            </div>
          </div>
        </div>

        {/* Validation Summary & Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border bg-card">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Total Personnel
            </span>
            <span className="text-lg font-bold font-mono">{validation.totalEmployees}</span>
          </div>
          <div className="p-3 rounded-lg border bg-card">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Total Net Salary
            </span>
            <span className="text-lg font-bold font-mono text-emerald-600">
              QAR{" "}
              {validation.totalNetSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div
            className={`p-3 rounded-lg border ${validation.errorsCount === 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}
          >
            <span className="text-[10px] uppercase font-semibold block text-muted-foreground">
              Compliance Status
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {validation.errorsCount === 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    100% QCB Ready
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-xs font-bold text-red-700 dark:text-red-400">
                    {validation.errorsCount} Fatal Errors
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="p-3 rounded-lg border bg-card">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Auto-Format Normalization
            </span>
            <Button
              variant={autoNormalized ? "secondary" : "outline"}
              size="sm"
              onClick={() => setAutoNormalized(!autoNormalized)}
              className="h-7 text-xs mt-1 w-full gap-1"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${autoNormalized ? "text-teal-600" : ""}`} />
              {autoNormalized ? "Normalized" : "Auto-Format QID/IBAN"}
            </Button>
          </div>
        </div>

        {/* Validation Issues Alert if Any */}
        {validation.issues.length > 0 && (
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span>Validation Alerts ({validation.issues.length}):</span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1 text-[11px] text-muted-foreground">
              {validation.issues.slice(0, 5).map((iss, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span
                    className={`px-1 py-0.2 rounded text-[9px] font-bold uppercase ${iss.severity === "error" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {iss.severity}
                  </span>
                  <span>
                    <strong>
                      {iss.employeeCode} ({iss.employeeName}):
                    </strong>{" "}
                    {iss.message}
                  </span>
                </div>
              ))}
              {validation.issues.length > 5 && (
                <div className="text-[10px] italic text-muted-foreground pt-0.5">
                  ...and {validation.issues.length - 5} more items. (Use Auto-Format above to
                  normalize missing mock QIDs and IBANs).
                </div>
              )}
            </div>
          </div>
        )}

        {/* Employee Grid Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              SIF Detail Records Preview ({wpsRecords.length} Employees)
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRawPreview(!showRawPreview)}
              className="h-7 text-xs text-teal-600 hover:text-teal-700 gap-1"
            >
              <Eye className="h-3.5 w-3.5" />
              {showRawPreview ? "Hide Raw File" : "View Raw SIF Text"}
            </Button>
          </div>

          {showRawPreview ? (
            <div className="relative">
              <pre className="p-3 rounded-lg bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-48 whitespace-pre border">
                {sifResult.sifContent}
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySif}
                className="absolute top-2 right-2 h-7 text-xs bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 gap-1"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          ) : (
            <div className="rounded-md border max-h-56 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 text-[11px]">
                    <TableHead className="py-1.5">Code</TableHead>
                    <TableHead className="py-1.5">Employee Name</TableHead>
                    <TableHead className="py-1.5 font-mono">QID (11 Digits)</TableHead>
                    <TableHead className="py-1.5 font-mono">IBAN (29 Chars)</TableHead>
                    <TableHead className="py-1.5">Bank</TableHead>
                    <TableHead className="py-1.5 text-right">Basic</TableHead>
                    <TableHead className="py-1.5 text-right font-bold">Net Salary (QAR)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {wpsRecords.slice(0, 8).map((rec, i) => (
                    <TableRow key={i} className="py-1">
                      <TableCell className="font-mono text-[11px] py-1.5">
                        {rec.employeeIdCode}
                      </TableCell>
                      <TableCell className="font-medium py-1.5">{rec.employeeName}</TableCell>
                      <TableCell className="font-mono text-[11px] py-1.5">
                        {rec.employeeQid}
                      </TableCell>
                      <TableCell
                        className="font-mono text-[11px] py-1.5 truncate max-w-[150px]"
                        title={rec.employeeIban}
                      >
                        {rec.employeeIban}
                      </TableCell>
                      <TableCell className="py-1.5">{rec.employeeBankSwift.slice(0, 4)}</TableCell>
                      <TableCell className="text-right py-1.5">
                        {rec.basicSalary.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-700 dark:text-emerald-400 py-1.5">
                        {rec.netSalary.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {wpsRecords.length > 8 && (
                <div className="text-center text-[11px] text-muted-foreground py-1 bg-muted/20 border-t">
                  + {wpsRecords.length - 8} more employee records included in export
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-3 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            <span>
              QCB File:{" "}
              <code className="font-mono text-foreground font-semibold">{sifResult.fileName}</code>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCsv}
              className="text-xs gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Download WPS Bank CSV
            </Button>
            <Button
              size="sm"
              onClick={handleDownloadSif}
              className="text-xs gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow"
            >
              <Download className="h-3.5 w-3.5" /> One-Click Export .SIF File
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
