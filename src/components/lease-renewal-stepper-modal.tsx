import React, { useState, useEffect, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  RefreshCw,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Calendar,
  Building2,
  Banknote,
  FileText,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Lock,
  Receipt,
  Check,
  FileCheck2,
  Upload,
  FileUp,
  TrendingUp,
  Wallet,
  X,
  Eye,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export interface PdcChequeItem {
  chequeNo: string;
  bank: string;
  date: string;
  amount: number;
  period: string;
  tenureStart: string;
  tenureEnd: string;
  file?: string;
  fileSize?: string;
}

export interface RenewalSubmitData {
  renewalId: string;
  priorLeaseId: string;
  response: "confirm" | "non_renewal";
  // Non-renewal details
  nonRenewal?: {
    noticeDate: string;
    vacateDate: string;
    inspectionDate: string;
    reason: string;
    notes: string;
  };
  // Step 1: Commercial & Terms
  agreedMonthlyRent: number;
  oldRent: number;
  startDate: string;
  endDate: string;
  contractNumber: string;
  termDuration: "6" | "12" | "24" | "custom";
  paymentFrequency: "monthly" | "quarterly" | "half_yearly" | "yearly" | "semi-annual" | "annual";
  gracePeriodDays: number;
  noticePeriodDays: number;
  // Step 2: Security Deposit & Upload
  securityDeposit: {
    type: "carry_forward" | "differential" | "full" | "custom" | "waived";
    existingHeldAmount: number;
    topUpAmount: number;
    newTotalDeposit: number;
    method: string;
    receiptNo: string;
    bank: string;
    chequeNo?: string;
    chequeDate?: string;
    receiptFile?: string;
  };
  // Step 2b: Optional upfront rent / difference
  payIncreasedRent: boolean;
  increasedRent?: {
    amount: number;
    type: "difference" | "first_month" | "custom";
    method: string;
    receiptNo: string;
    bank: string;
    date: string;
    receiptFile?: string;
  };
  // Step 3: PDCs & Uploads
  generatePdcs: boolean;
  requiresFinanceApproval?: boolean;
  financeApprovalReason?: string;
  pdcs: PdcChequeItem[];
  pdcBatchFile?: string;
  vaultLocation: string;
  custodyOfficer: string;
  // Notes
  notes: string;
}

interface LeaseRenewalStepperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renewal: any | null;
  oldLease: any | null | undefined;
  existingLeasesCount?: number;
  onConfirmRenewal: (data: RenewalSubmitData) => void | Promise<void>;
  onConfirmNonRenewal?: (data: {
    renewalId: string;
    leaseId: string;
    noticeDate: string;
    vacateDate: string;
    inspectionDate: string;
    reason: string;
    notes: string;
  }) => void | Promise<void>;
}

const COMMON_BANKS = [
  "Qatar National Bank (QNB)",
  "Commercial Bank of Qatar (CBQ)",
  "Qatar Islamic Bank (QIB)",
  "Doha Bank",
  "Masraf Al Rayan",
  "Dukhan Bank",
  "Ahlibank",
  "Qatar International Islamic Bank (QIIB)",
  "HSBC Qatar",
];

function formatMoney(value: number | string | undefined | null) {
  return `QR ${Number(value || 0).toLocaleString()}`;
}

function addDaysHelper(dateStr: string, days: number): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

function addMonthsHelper(dateStr: string, months: number): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() !== day) {
      d.setDate(0);
    }
    return d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

export function LeaseRenewalStepperModal({
  open,
  onOpenChange,
  renewal,
  oldLease,
  existingLeasesCount = 1,
  onConfirmRenewal,
  onConfirmNonRenewal,
}: LeaseRenewalStepperModalProps) {
  // Stepper state: 1: Terms, 2: Security Deposit, 3: PDC Collection, 4: Review & Finalize
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Decision & Commercial Terms
  const [responseType, setResponseType] = useState<"confirm" | "non_renewal">("confirm");
  const [termDuration, setTermDuration] = useState<"6" | "12" | "24" | "custom">("12");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [confirmedRent, setConfirmedRent] = useState<number>(0);
  const [contractNumber, setContractNumber] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState<"monthly" | "quarterly" | "half_yearly" | "yearly" | "semi-annual" | "annual">("monthly");
  const [gracePeriodDays, setGracePeriodDays] = useState<number>(5);
  const [noticePeriodDays, setNoticePeriodDays] = useState<number>(60);
  const [renewalNotes, setRenewalNotes] = useState("");

  // Non-renewal details
  const [nonRenewalNoticeDate, setNonRenewalNoticeDate] = useState("");
  const [nonRenewalVacateDate, setNonRenewalVacateDate] = useState("");
  const [nonRenewalInspectionDate, setNonRenewalInspectionDate] = useState("");
  const [nonRenewalReason, setNonRenewalReason] = useState("Contract Expiry / Relocation");
  const [nonRenewalNotes, setNonRenewalNotes] = useState("");

  // Step 2: Security Deposit & Uploads
  const [depositStrategy, setDepositStrategy] = useState<"carry_forward" | "differential" | "full" | "custom" | "waived">("differential");
  const [differentialAmount, setDifferentialAmount] = useState<number>(0);
  const [depositPaymentMode, setDepositPaymentMode] = useState("Bank Transfer");
  const [depositBankName, setDepositBankName] = useState(COMMON_BANKS[0]);
  const [depositChequeNo, setDepositChequeNo] = useState("");
  const [depositChequeDate, setDepositChequeDate] = useState("");
  const [depositReceiptNo, setDepositReceiptNo] = useState("");
  const [depositReceiptFile, setDepositReceiptFile] = useState<string>("");
  const [depositReceiptFileSize, setDepositReceiptFileSize] = useState<string>("");

  // Optional: Pay Increased Rent upfront / 1st month
  const [payIncreasedRent, setPayIncreasedRent] = useState<boolean>(false);
  const [increasedRentType, setIncreasedRentType] = useState<"difference" | "first_month" | "custom">("difference");
  const [increasedRentAmount, setIncreasedRentAmount] = useState<number>(0);
  const [rentPaymentMethod, setRentPaymentMethod] = useState("Bank Transfer");
  const [rentReceiptNo, setRentReceiptNo] = useState("");
  const [rentPayerBank, setRentPayerBank] = useState(COMMON_BANKS[0]);
  const [rentPaymentDate, setRentPaymentDate] = useState("");
  const [rentReceiptFile, setRentReceiptFile] = useState<string>("");

  // Step 3: PDC Collection & Uploads
  const [generatePdcs, setGeneratePdcs] = useState<boolean>(true);
  const [noPdcApprovalRequested, setNoPdcApprovalRequested] = useState<boolean>(false);
  const [noPdcReason, setNoPdcReason] = useState<string>("Standing Order / Direct Bank Transfer Agreement");
  const [noPdcApprovedBy, setNoPdcApprovedBy] = useState<string>("Finance Manager / Controller");
  const [pdcCount, setPdcCount] = useState<number>(12);
  const [pdcAmountPerCheque, setPdcAmountPerCheque] = useState<number>(0);
  const [pdcBank, setPdcBank] = useState<string>(COMMON_BANKS[0]);
  const [startingChequeNo, setStartingChequeNo] = useState<string>("");
  const [firstChequeDate, setFirstChequeDate] = useState<string>("");
  const [pdcBatchFile, setPdcBatchFile] = useState<string>("");
  const [pdcBatchFileSize, setPdcBatchFileSize] = useState<string>("");
  const [pdcCheques, setPdcCheques] = useState<PdcChequeItem[]>([]);
  const [custodyOfficer, setCustodyOfficer] = useState<string>("Finance Cashier & Safe Custodian");
  const [vaultLocation, setVaultLocation] = useState<string>("Main Vault - Safe #02 (Leasing Section)");

  // Initialize form when renewal or oldLease changes
  useEffect(() => {
    if (open && oldLease) {
      setCurrentStep(1);
      const oldRent = Number(oldLease.monthlyRent) || 0;
      const proposed = Number(renewal?.proposedRent) || oldRent;
      const oldSecurity = Number(oldLease.securityDeposit) || oldRent;

      const calcStart = oldLease.endDate ? addDaysHelper(oldLease.endDate, 1) : new Date().toISOString().split("T")[0];
      const calcEnd = addMonthsHelper(calcStart, 12);
      const renewalSeq = existingLeasesCount + 1;
      const contractRef = `${oldLease.contractNumber ? oldLease.contractNumber.replace(/-R\d+$/, "") : ("SLT-" + (oldLease.unit || "Unit").replace(/\s+/g, ""))}-R${renewalSeq}`;

      setResponseType("confirm");
      setTermDuration("12");
      setStartDate(calcStart);
      setEndDate(calcEnd);
      setConfirmedRent(proposed);
      setContractNumber(contractRef);
      setPaymentFrequency((oldLease.paymentFrequency as any) || "monthly");
      setGracePeriodDays(Number(oldLease.gracePeriodDays) || 5);
      setNoticePeriodDays(Number(oldLease.noticePeriodDays) || 60);
      setRenewalNotes("");

      // Non-renewal defaults
      setNonRenewalNoticeDate(new Date().toISOString().split("T")[0]);
      setNonRenewalVacateDate(oldLease.endDate || calcStart);
      setNonRenewalInspectionDate(oldLease.endDate ? addDaysHelper(oldLease.endDate, -2) : calcStart);
      setNonRenewalReason("Contract Expiry / Relocation");
      setNonRenewalNotes("");

      // Security deposit calculation
      const sDiff = Math.max(0, proposed - oldSecurity);
      setDifferentialAmount(sDiff);
      setDepositStrategy(sDiff > 0 ? "differential" : "carry_forward");
      setDepositPaymentMode("Bank Transfer");
      setDepositBankName(COMMON_BANKS[0]);
      setDepositReceiptNo(`REC-SD-${Date.now().toString().slice(-6)}`);
      setDepositChequeNo("");
      setDepositChequeDate(calcStart);
      setDepositReceiptFile("");
      setDepositReceiptFileSize("");

      // Increased rent provision
      const rDiff = Math.max(0, proposed - oldRent);
      setPayIncreasedRent(false);
      setIncreasedRentType("difference");
      setIncreasedRentAmount(rDiff);
      setRentPaymentMethod("Bank Transfer");
      setRentReceiptNo(`REC-RENT-${Date.now().toString().slice(-6)}`);
      setRentPayerBank(COMMON_BANKS[0]);
      setRentPaymentDate(new Date().toISOString().split("T")[0]);
      setRentReceiptFile("");

      // PDCs
      setGeneratePdcs(true);
      setNoPdcApprovalRequested(false);
      setNoPdcReason("Standing Order / Direct Bank Transfer Agreement");
      setNoPdcApprovedBy("Finance Manager / Controller");
      const count = 12;
      setPdcCount(count);
      setPdcAmountPerCheque(proposed);
      setPdcBank(COMMON_BANKS[0]);
      const initialStartCheque = `PDC-${(oldLease.unit || "Unit").replace(/\W/g, "")}-R${renewalSeq}-001`;
      setStartingChequeNo(initialStartCheque);
      setFirstChequeDate(calcStart);
      setPdcBatchFile("");
      setPdcBatchFileSize("");
      setCustodyOfficer("Finance Cashier & Safe Custodian");
      setVaultLocation("Main Vault - Safe #02 (Leasing Section)");

      // Generate initial cheques schedule
      generateChequesSchedule(count, proposed, COMMON_BANKS[0], initialStartCheque, calcStart, "monthly", 12);
    }
  }, [open, renewal, oldLease, existingLeasesCount]);

  // Helper to generate Cheque Schedule
  function generateChequesSchedule(
    count: number,
    amountPerCheque: number,
    bankName: string,
    startChequeNo: string,
    firstDate: string,
    freq: string,
    durationMonths: number
  ) {
    const list: PdcChequeItem[] = [];
    const stepMonths = freq === "quarterly" ? 3 : freq === "semi-annual" || freq === "half_yearly" ? 6 : freq === "annual" || freq === "yearly" ? 12 : 1;
    const matchNum = startChequeNo.match(/\d+$/);
    const baseChequeNum = matchNum ? parseInt(matchNum[0], 10) : 1;
    const prefix = matchNum ? startChequeNo.slice(0, matchNum.index) : "PDC-";
    const padLen = matchNum ? matchNum[0].length : 3;

    for (let i = 0; i < count; i++) {
      const maturity = addMonthsHelper(firstDate, i * stepMonths);
      const tenureStart = addMonthsHelper(firstDate, i * stepMonths);
      const nextTenure = addMonthsHelper(firstDate, (i + 1) * stepMonths);
      const tenureEnd = addDaysHelper(nextTenure, -1);
      const chequeNum = `${prefix}${String(baseChequeNum + i).padStart(padLen, "0")}`;

      list.push({
        chequeNo: chequeNum,
        bank: bankName,
        date: maturity,
        amount: amountPerCheque,
        period: `Renewal Cheque ${i + 1} of ${count}`,
        tenureStart,
        tenureEnd,
        file: "",
      });
    }
    setPdcCheques(list);
  }

  // Recalculate schedule when duration or frequency changes
  function updateDurationAndSchedule(
    dur: "6" | "12" | "24" | "custom",
    customStart?: string,
    customEnd?: string
  ) {
    const durMonths = dur === "6" ? 6 : dur === "24" ? 24 : dur === "custom" ? 12 : 12;
    const sDate = customStart || startDate || new Date().toISOString().split("T")[0];
    const eDate = dur === "custom" ? (customEnd || endDate) : addMonthsHelper(sDate, durMonths);

    setTermDuration(dur);
    setStartDate(sDate);
    setEndDate(eDate);

    // Calculate count and amount
    let count = 12;
    let mult = 1;
    if (paymentFrequency === "quarterly") {
      count = Math.max(1, Math.round(durMonths / 3));
      mult = 3;
    } else if (paymentFrequency === "semi-annual" || paymentFrequency === "half_yearly") {
      count = Math.max(1, Math.round(durMonths / 6));
      mult = 6;
    } else if (paymentFrequency === "annual" || paymentFrequency === "yearly") {
      count = 1;
      mult = durMonths;
    } else {
      count = durMonths;
      mult = 1;
    }

    const amt = confirmedRent * mult;
    setPdcCount(count);
    setPdcAmountPerCheque(amt);
    generateChequesSchedule(count, amt, pdcBank, startingChequeNo, sDate, paymentFrequency, durMonths);
  }

  // Calculations for display
  const oldRent = Number(oldLease?.monthlyRent) || 0;
  const oldSecurity = Number(oldLease?.securityDeposit) || oldRent;
  const rentDiff = Math.max(0, confirmedRent - oldRent);
  const rentPctChange = oldRent > 0 ? Math.round(((confirmedRent - oldRent) / oldRent) * 100) : 0;
  const securityDiff = Math.max(0, confirmedRent - oldSecurity);

  const calculatedDepositAmount = useMemo(() => {
    if (depositStrategy === "carry_forward") return 0;
    if (depositStrategy === "differential") return differentialAmount;
    if (depositStrategy === "full") return confirmedRent;
    if (depositStrategy === "waived") return 0;
    return differentialAmount;
  }, [depositStrategy, differentialAmount, confirmedRent]);

  const totalDepositHeldAfterRenewal = useMemo(() => {
    if (depositStrategy === "waived") return 0;
    if (depositStrategy === "carry_forward") return oldSecurity;
    if (depositStrategy === "full") return confirmedRent;
    return oldSecurity + calculatedDepositAmount;
  }, [depositStrategy, oldSecurity, calculatedDepositAmount, confirmedRent]);

  const totalPdcScheduleValue = useMemo(() => {
    return pdcCheques.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [pdcCheques]);

  // Stepper Header items
  const stepsConfig = [
    { num: 1, title: "Terms & Decision", desc: "Duration, rent & dates", icon: FileText },
    { num: 2, title: "Security Deposit", desc: "Settlement & receipt upload", icon: ShieldCheck },
    { num: 3, title: "PDCs & Cheques", desc: "Schedule & cheque scans", icon: CreditCard },
    { num: 4, title: "Review & Create Lease", desc: "Summary & new agreement", icon: CheckCircle2 },
  ];

  // Navigation handlers
  function handleNextStep() {
    if (currentStep === 1) {
      if (responseType === "non_renewal") {
        setCurrentStep(4);
        return;
      }
      if (!confirmedRent || confirmedRent <= 0) {
        toast.error("Please enter a valid agreed monthly rent.");
        return;
      }
      if (!startDate || !endDate) {
        toast.error("Please ensure valid start and end dates.");
        return;
      }
      if (!contractNumber.trim()) {
        toast.error("Please enter a contract number / reference.");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (generatePdcs && !noPdcApprovalRequested && pdcCheques.length === 0) {
        toast.error("Please provide at least one PDC or enable 'Contract without PDCs (Finance Approval)'.");
        return;
      }
      if (noPdcApprovalRequested && !noPdcReason.trim()) {
        toast.error("Please provide a reason / justification for contract renewal without PDCs.");
        return;
      }
      setCurrentStep(4);
    }
  }

  function handlePrevStep() {
    if (currentStep === 4 && responseType === "non_renewal") {
      setCurrentStep(1);
    } else if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  }

  async function handleFinalSubmit() {
    if (!renewal || !oldLease) return;
    setIsSubmitting(true);
    try {
      if (responseType === "non_renewal") {
        if (onConfirmNonRenewal) {
          await onConfirmNonRenewal({
            renewalId: renewal.id,
            leaseId: oldLease.id,
            noticeDate: nonRenewalNoticeDate,
            vacateDate: nonRenewalVacateDate,
            inspectionDate: nonRenewalInspectionDate,
            reason: nonRenewalReason,
            notes: nonRenewalNotes,
          });
        }
        onOpenChange(false);
        return;
      }

      // Confirmed renewal payload
      const payload: RenewalSubmitData = {
        renewalId: renewal.id,
        priorLeaseId: oldLease.id,
        response: "confirm",
        agreedMonthlyRent: confirmedRent,
        oldRent: oldRent,
        startDate: startDate,
        endDate: endDate,
        contractNumber: contractNumber.trim(),
        termDuration: termDuration,
        paymentFrequency: paymentFrequency,
        gracePeriodDays: gracePeriodDays,
        noticePeriodDays: noticePeriodDays,
        securityDeposit: {
          type: depositStrategy,
          existingHeldAmount: oldSecurity,
          topUpAmount: calculatedDepositAmount,
          newTotalDeposit: totalDepositHeldAfterRenewal,
          method: depositPaymentMode,
          receiptNo: depositReceiptNo,
          bank: depositBankName,
          chequeNo: depositChequeNo,
          chequeDate: depositChequeDate,
          receiptFile: depositReceiptFile,
        },
        payIncreasedRent: payIncreasedRent,
        increasedRent: payIncreasedRent ? {
          amount: increasedRentAmount,
          type: increasedRentType,
          method: rentPaymentMethod,
          receiptNo: rentReceiptNo,
          bank: rentPayerBank,
          date: rentPaymentDate,
          receiptFile: rentReceiptFile,
        } : undefined,
        generatePdcs: !noPdcApprovalRequested && generatePdcs,
        requiresFinanceApproval: noPdcApprovalRequested,
        financeApprovalReason: noPdcApprovalRequested ? `[Finance Approval Required] No PDCs attached. Justification: ${noPdcReason}. Target Approver: ${noPdcApprovedBy}` : undefined,
        pdcs: noPdcApprovalRequested ? [] : pdcCheques,
        pdcBatchFile: noPdcApprovalRequested ? undefined : pdcBatchFile,
        vaultLocation: vaultLocation,
        custodyOfficer: custodyOfficer,
        notes: noPdcApprovalRequested ? `[CONTRACT WITHOUT PDCS - PENDING FINANCE APPROVAL: ${noPdcReason}]\n${renewalNotes}` : renewalNotes,
      };

      await onConfirmRenewal(payload);
      onOpenChange(false);
    } catch (err: any) {
      console.error("Renewal submit error:", err);
      toast.error(err?.message || "Failed to finalize renewal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[840px] max-h-[94vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
        {/* Header with Title and Current Rent Badge */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>Tenant Renewal Workflow</span>
                <Badge variant="outline" className="text-[10px] bg-background font-mono">
                  {contractNumber || "New Agreement"}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Renew lease for <strong>{oldLease?.tenantName || "Tenant"}</strong> — Unit <strong>{oldLease?.unit || "Unit"}</strong> ({oldLease?.property || "Property"}).
              </DialogDescription>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Current Lease</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span>{formatMoney(oldRent)}/mo</span>
              <span className="text-muted-foreground text-[10px]">({oldLease?.contractNumber || "SLT-Prior"})</span>
            </div>
          </div>
        </div>

        {/* ── STEPPER BAR ────────────────────────────────────── */}
        {responseType === "confirm" ? (
          <div className="bg-muted/30 px-6 py-2.5 border-b grid grid-cols-4 gap-2">
            {stepsConfig.map((s) => {
              const Icon = s.icon;
              const isActive = currentStep === s.num;
              const isDone = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (isDone) setCurrentStep(s.num as any);
                  }}
                  disabled={!isDone && currentStep !== s.num}
                  className={`flex items-center gap-2.5 text-left py-1.5 px-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary/15 text-primary border border-primary/30 shadow-xs"
                      : isDone
                      ? "text-foreground hover:bg-muted/50 cursor-pointer"
                      : "text-muted-foreground/60 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground border"
                    }`}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : s.num}
                  </div>
                  <div className="hidden md:block min-w-0">
                    <p className="text-[11px] font-bold truncate leading-tight">{s.title}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{s.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-amber-500/10 border-b px-6 py-2 flex items-center justify-between text-amber-800 dark:text-amber-300 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" /> Non-Renewal &amp; Move-Out Handover Workflow Active
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-primary hover:underline p-0"
              onClick={() => setResponseType("confirm")}
            >
              Switch back to Confirmed Renewal
            </Button>
          </div>
        )}

        {/* ── STEP BODY CONTAINER ───────────────────────────── */}
        <div className="p-6 overflow-y-auto max-h-[calc(94vh-175px)] space-y-5">
          {/* ═══════════════════════════════════════════════════════
              STEP 1: RENEWAL TERMS & DECISION
             ═══════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {/* Formal Response Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Tenant Formal Decision</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setResponseType("confirm")}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      responseType === "confirm"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                        : "border-border hover:bg-muted/20"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${responseType === "confirm" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Confirmed Renewal</h4>
                      <p className="text-[11px] text-muted-foreground">Tenant agrees to extend lease term with revised or same conditions</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResponseType("non_renewal")}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      responseType === "non_renewal"
                        ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 shadow-xs"
                        : "border-border hover:bg-muted/20"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${responseType === "non_renewal" ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground"}`}>
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Non-Renewal (Vacating)</h4>
                      <p className="text-[11px] text-muted-foreground">Tenant declines extension; schedule checkout &amp; unit handover</p>
                    </div>
                  </button>
                </div>
              </div>

              {responseType === "confirm" ? (
                <>
                  {/* Agreed Rent & Variance Badge */}
                  <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Agreed Monthly Rent (QR)
                      </Label>
                      <div className="flex items-center gap-2 text-xs">
                        {rentDiff > 0 ? (
                          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-semibold gap-1">
                            <TrendingUp className="h-3 w-3" /> +{formatMoney(rentDiff)}/mo (+{rentPctChange}%)
                          </Badge>
                        ) : confirmedRent === oldRent ? (
                          <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700 dark:bg-slate-900 font-normal">
                            Maintained unchanged
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 font-normal">
                            Discount: -{formatMoney(Math.abs(confirmedRent - oldRent))}/mo
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">QR</span>
                      <Input
                        type="number"
                        value={confirmedRent || ""}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setConfirmedRent(val);
                          // Sync PDC amount
                          const mult = paymentFrequency === "quarterly" ? 3 : paymentFrequency === "semi-annual" || paymentFrequency === "half_yearly" ? 6 : paymentFrequency === "annual" || paymentFrequency === "yearly" ? 12 : 1;
                          setPdcAmountPerCheque(val * mult);
                          // Sync Differential
                          setDifferentialAmount(Math.max(0, val - oldSecurity));
                          // Update schedule amounts
                          setPdcCheques((prev) => prev.map((p) => ({ ...p, amount: val * mult })));
                        }}
                        placeholder={`Proposed: ${renewal?.proposedRent || oldRent}`}
                        className="pl-10 text-base font-bold bg-background h-10"
                      />
                    </div>
                  </div>

                  {/* Term Duration presets */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground">Term Duration Preset</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "12", label: "1 Year (12 Mo)" },
                        { id: "6", label: "6 Months" },
                        { id: "24", label: "2 Years (24 Mo)" },
                        { id: "custom", label: "Custom Dates" },
                      ].map((opt) => (
                        <Button
                          key={opt.id}
                          type="button"
                          size="sm"
                          variant={termDuration === opt.id ? "default" : "outline"}
                          className="h-8 text-xs font-medium"
                          onClick={() => updateDurationAndSchedule(opt.id as any)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Start & End Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">New Lease Start Date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          const s = e.target.value;
                          setStartDate(s);
                          setFirstChequeDate(s);
                          const durMonths = termDuration === "6" ? 6 : termDuration === "24" ? 24 : 12;
                          const nextEnd = termDuration === "custom" ? endDate : addMonthsHelper(s, durMonths);
                          setEndDate(nextEnd);
                          generateChequesSchedule(pdcCount, pdcAmountPerCheque, pdcBank, startingChequeNo, s, paymentFrequency, durMonths);
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">New Lease End Date</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setTermDuration("custom");
                        }}
                      />
                    </div>
                  </div>

                  {/* Contract Number & Payment Frequency */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold">New Contract Number / Reference</Label>
                        <span className="text-[10px] text-primary font-medium">Auto-generated</span>
                      </div>
                      <Input
                        value={contractNumber}
                        onChange={(e) => setContractNumber(e.target.value)}
                        placeholder="e.g. SLT-OS40-26-R2"
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Payment Frequency</Label>
                      <Select
                        value={paymentFrequency}
                        onValueChange={(val: any) => {
                          setPaymentFrequency(val);
                          const durMonths = termDuration === "6" ? 6 : termDuration === "24" ? 24 : 12;
                          let count = 12;
                          let mult = 1;
                          if (val === "quarterly") {
                            count = Math.max(1, Math.round(durMonths / 3));
                            mult = 3;
                          } else if (val === "semi-annual" || val === "half_yearly") {
                            count = Math.max(1, Math.round(durMonths / 6));
                            mult = 6;
                          } else if (val === "annual" || val === "yearly") {
                            count = 1;
                            mult = durMonths;
                          } else {
                            count = durMonths;
                            mult = 1;
                          }
                          const amt = confirmedRent * mult;
                          setPdcCount(count);
                          setPdcAmountPerCheque(amt);
                          generateChequesSchedule(count, amt, pdcBank, startingChequeNo, startDate, val, durMonths);
                        }}
                      >
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly (12 cheques/yr)</SelectItem>
                          <SelectItem value="quarterly">Quarterly (4 cheques/yr)</SelectItem>
                          <SelectItem value="semi-annual">Semi-Annual (2 cheques/yr)</SelectItem>
                          <SelectItem value="annual">Annual / Lump Sum (1 cheque/yr)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Grace Period & Notice Period */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Grace Period (Days)</Label>
                      <Input
                        type="number"
                        value={gracePeriodDays}
                        onChange={(e) => setGracePeriodDays(Number(e.target.value) || 0)}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Required Notice Period (Days)</Label>
                      <Input
                        type="number"
                        value={noticePeriodDays}
                        onChange={(e) => setNoticePeriodDays(Number(e.target.value) || 0)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Non-renewal fields */
                <div className="rounded-xl border border-amber-300/40 bg-amber-50/30 dark:bg-amber-950/20 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" /> Non-Renewal Settlement &amp; Move-Out Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Notice Date</Label>
                      <Input
                        type="date"
                        value={nonRenewalNoticeDate}
                        onChange={(e) => setNonRenewalNoticeDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Expected Vacate / Handover Date</Label>
                      <Input
                        type="date"
                        value={nonRenewalVacateDate}
                        onChange={(e) => setNonRenewalVacateDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Move-Out Inspection Date</Label>
                      <Input
                        type="date"
                        value={nonRenewalInspectionDate}
                        onChange={(e) => setNonRenewalInspectionDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Vacating Reason</Label>
                      <Select value={nonRenewalReason} onValueChange={setNonRenewalReason}>
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Contract Expiry / Relocation">Contract Expiry / Relocation</SelectItem>
                          <SelectItem value="Rent Adjustment / Higher Rent">Rent Adjustment / Higher Rent</SelectItem>
                          <SelectItem value="Downsizing / Financial Reason">Downsizing / Financial Reason</SelectItem>
                          <SelectItem value="Upgrading Property">Upgrading Property</SelectItem>
                          <SelectItem value="Personal / Leaving Qatar">Personal / Leaving Qatar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Move-Out &amp; Handover Instructions</Label>
                    <Textarea
                      rows={2}
                      value={nonRenewalNotes}
                      onChange={(e) => setNonRenewalNotes(e.target.value)}
                      placeholder="Special handover notes, key return instructions, utility clearance requirements..."
                      className="text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              STEP 2: SECURITY DEPOSIT & UPLOAD
             ═══════════════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <div className="space-y-5">
              {/* Metrics bar */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-muted/40 border">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Current Deposit Held</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(oldSecurity)}</span>
                  <span className="text-[10px] text-muted-foreground block">Held in Trust Account</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">New Target Deposit</span>
                  <span className="text-sm font-bold text-foreground">{formatMoney(confirmedRent)}</span>
                  <span className="text-[10px] text-muted-foreground block">Equivalent to 1 month rent</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Shortfall / Top-up</span>
                  <span className={`text-sm font-bold block ${securityDiff > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {securityDiff > 0 ? `+${formatMoney(securityDiff)}` : "Fully Covered"}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    {securityDiff > 0 ? "Additional collection required" : "No top-up required"}
                  </span>
                </div>
              </div>

              {/* Deposit Handling Preset */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground">Deposit Settlement Strategy</Label>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={depositStrategy === "differential" ? "default" : "outline"}
                    className="h-8 text-xs font-medium"
                    onClick={() => {
                      setDepositStrategy("differential");
                      setDifferentialAmount(securityDiff);
                    }}
                  >
                    Top-Up Shortfall ({formatMoney(securityDiff)})
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={depositStrategy === "full" ? "default" : "outline"}
                    className="h-8 text-xs font-medium"
                    onClick={() => {
                      setDepositStrategy("full");
                      setDifferentialAmount(confirmedRent);
                    }}
                  >
                    Full Deposit ({formatMoney(confirmedRent)})
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={depositStrategy === "carry_forward" ? "default" : "outline"}
                    className="h-8 text-xs font-medium"
                    onClick={() => {
                      setDepositStrategy("carry_forward");
                      setDifferentialAmount(0);
                    }}
                  >
                    Carry Forward (QR 0)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={depositStrategy === "custom" ? "default" : "outline"}
                    className="h-8 text-xs font-medium"
                    onClick={() => setDepositStrategy("custom")}
                  >
                    Custom Amount
                  </Button>
                </div>
              </div>

              {/* Deposit Inputs */}
              {depositStrategy !== "carry_forward" && (
                <div className="rounded-xl border p-4 space-y-3.5 bg-card">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Deposit Amount to Collect (QR)</Label>
                      <Input
                        type="number"
                        value={calculatedDepositAmount}
                        onChange={(e) => {
                          setDifferentialAmount(Number(e.target.value) || 0);
                          setDepositStrategy("custom");
                        }}
                        className="text-sm font-bold font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Payment Mode</Label>
                      <Select value={depositPaymentMode} onValueChange={setDepositPaymentMode}>
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bank Transfer">Bank Transfer / Advice</SelectItem>
                          <SelectItem value="Cheque">Cheque (Security Cheque)</SelectItem>
                          <SelectItem value="Guarantee Cheque">Guarantee Cheque</SelectItem>
                          <SelectItem value="Cash">Cash at Counter</SelectItem>
                          <SelectItem value="Credit Card">Credit Card / POS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Receipt / Reference No.</Label>
                      <Input
                        value={depositReceiptNo}
                        onChange={(e) => setDepositReceiptNo(e.target.value)}
                        placeholder="REC-SD-XXXXXX"
                        className="text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Bank Name</Label>
                      <Select value={depositBankName} onValueChange={setDepositBankName}>
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {COMMON_BANKS.map((b) => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(depositPaymentMode === "Cheque" || depositPaymentMode === "Guarantee Cheque") && (
                    <div className="grid grid-cols-2 gap-3 pt-1 border-t">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Security Cheque No.</Label>
                        <Input
                          value={depositChequeNo}
                          onChange={(e) => setDepositChequeNo(e.target.value)}
                          placeholder="e.g. SEC-009182"
                          className="text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Cheque Maturity / Issue Date</Label>
                        <Input
                          type="date"
                          value={depositChequeDate}
                          onChange={(e) => setDepositChequeDate(e.target.value)}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* ── FILE UPLOAD PROVISION FOR DEPOSIT SLIP / RECEIPT ── */}
                  <div className="pt-2 border-t space-y-2">
                    <Label className="text-xs font-bold text-foreground flex items-center justify-between">
                      <span>Upload Deposit Slip / Cheque Copy / Bank Advice</span>
                      <span className="text-[10px] text-muted-foreground font-normal">PDF, JPG, PNG up to 10MB</span>
                    </Label>

                    {depositReceiptFile ? (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="p-1.5 rounded-md bg-emerald-500 text-white shrink-0">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-semibold truncate">{depositReceiptFile}</p>
                            <p className="text-[10px] text-muted-foreground">Document attached successfully • {depositReceiptFileSize || "Ready"}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setDepositReceiptFile("");
                            setDepositReceiptFileSize("");
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl border-primary/20 hover:border-primary/50 bg-primary/5 hover:bg-primary/10 cursor-pointer transition-colors">
                        <div className="p-2 rounded-full bg-primary/10 text-primary mb-1.5">
                          <Upload className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-semibold text-foreground">Click to upload deposit payment slip or cheque scan</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">Supports scanned receipt, bank transfer screenshot, or cheque copy</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setDepositReceiptFile(f.name);
                              setDepositReceiptFileSize(`${Math.round(f.size / 1024)} KB`);
                              toast.success(`Attached deposit file: ${f.name}`);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Accounting Info Box */}
              <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3 flex items-center gap-2.5 text-xs text-indigo-800 dark:text-indigo-300">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>
                  Security deposit held will be maintained at <strong>{formatMoney(totalDepositHeldAfterRenewal)}</strong> and credited to <strong>Account 21500001 (Security Deposit Liability)</strong>.
                </span>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              STEP 3: PDC COLLECTION & CHEQUE SCANS UPLOAD
             ═══════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <div className="space-y-5">
              {/* Toggle for Contracts without PDCs (Finance Approval Workflow) */}
              <div className="rounded-xl border border-amber-300/80 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-amber-600" />
                      <Label htmlFor="no-pdc-toggle" className="text-xs font-bold text-amber-900 dark:text-amber-200 cursor-pointer">
                        Contract Without PDCs (Finance Approval Route)
                      </Label>
                    </div>
                    <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                      Enable this if the tenant is renewing without post-dated cheques (e.g. standing order, bank transfer, corporate guarantee).
                    </p>
                  </div>
                  <Switch
                    id="no-pdc-toggle"
                    checked={noPdcApprovalRequested}
                    onCheckedChange={(checked) => {
                      setNoPdcApprovalRequested(checked);
                      if (checked) {
                        toast.info("PDC restriction lifted. Renewal will route for Finance Approval.");
                      }
                    }}
                  />
                </div>

                {noPdcApprovalRequested && (
                  <div className="pt-2 border-t border-amber-200 dark:border-amber-900/50 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                        Reason for Renewal Without PDCs <span className="text-destructive">*</span>
                      </Label>
                      <Select value={noPdcReason} onValueChange={setNoPdcReason}>
                        <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standing Order / Direct Bank Transfer Agreement">Standing Order / Direct Bank Transfer Agreement</SelectItem>
                          <SelectItem value="Corporate / Embassy Guaranteed Lease">Corporate / Embassy Guaranteed Lease</SelectItem>
                          <SelectItem value="Upfront Full Year Bank Transfer Received">Upfront Full Year Bank Transfer Received</SelectItem>
                          <SelectItem value="Government Entity / Semi-Government Exemption">Government Entity / Semi-Government Exemption</SelectItem>
                          <SelectItem value="Management Discretion / Special Payment Plan">Management Discretion / Special Payment Plan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                        Finance Approval Authority
                      </Label>
                      <Select value={noPdcApprovedBy} onValueChange={setNoPdcApprovedBy}>
                        <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Finance Manager / Controller">Finance Manager / Controller</SelectItem>
                          <SelectItem value="Chief Financial Officer (CFO)">Chief Financial Officer (CFO)</SelectItem>
                          <SelectItem value="General Manager (GM)">General Manager (GM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-full rounded-md bg-amber-100/70 dark:bg-amber-900/30 p-2.5 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
                      <Info className="h-4 w-4 shrink-0 text-amber-600" />
                      <span>The renewal contract will be created with status <strong>Pending Finance Approval</strong>. Once approved by Finance, the lease becomes Active without blocking the user.</span>
                    </div>
                  </div>
                )}
              </div>

              {!noPdcApprovalRequested && (
                <>
                  {/* PDC Schedule Summary Card */}
                  <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-muted/40 border">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Cheques</span>
                      <span className="text-sm font-bold text-foreground">{pdcCheques.length} Cheques</span>
                      <span className="text-[10px] text-muted-foreground block">{paymentFrequency} schedule</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Amount Per Cheque</span>
                      <span className="text-sm font-bold text-foreground">{formatMoney(pdcAmountPerCheque)}</span>
                      <span className="text-[10px] text-muted-foreground block">Standard instalment</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Schedule Value</span>
                      <span className="text-sm font-bold text-primary">{formatMoney(totalPdcScheduleValue)}</span>
                      <span className="text-[10px] text-muted-foreground block">100% of lease rent</span>
                    </div>
                  </div>

              {/* Schedule Generator Settings */}
              <div className="rounded-xl border p-4 space-y-3 bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <h4 className="text-xs font-bold text-foreground">PDC Schedule Parameters</h4>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => {
                      const durMonths = termDuration === "6" ? 6 : termDuration === "24" ? 24 : 12;
                      generateChequesSchedule(pdcCount, pdcAmountPerCheque, pdcBank, startingChequeNo, firstChequeDate, paymentFrequency, durMonths);
                      toast.success("Regenerated PDC cheque schedule rows.");
                    }}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" /> Reset Schedule
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Number of Cheques</Label>
                    <Input
                      type="number"
                      min="1"
                      max="36"
                      value={pdcCount}
                      onChange={(e) => setPdcCount(Number(e.target.value) || 1)}
                      className="text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Amount per Cheque (QR)</Label>
                    <Input
                      type="number"
                      value={pdcAmountPerCheque}
                      onChange={(e) => setPdcAmountPerCheque(Number(e.target.value) || 0)}
                      className="text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Bank Name</Label>
                    <Select value={pdcBank} onValueChange={setPdcBank}>
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {COMMON_BANKS.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Starting Cheque Number</Label>
                    <Input
                      value={startingChequeNo}
                      onChange={(e) => setStartingChequeNo(e.target.value)}
                      placeholder="e.g. PDC-OS4026-R2-001"
                      className="text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">First Cheque Maturity Date</Label>
                    <Input
                      type="date"
                      value={firstChequeDate}
                      onChange={(e) => setFirstChequeDate(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* ── BATCH CHEQUES ATTACHMENT PROVISION ── */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileUp className="h-4 w-4 text-primary" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Bulk / Batch PDC Upload</h4>
                      <p className="text-[10px] text-muted-foreground">Upload single scanned PDF or multi-cheque bundle for all renewal PDCs</p>
                    </div>
                  </div>
                  {pdcBatchFile ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {pdcBatchFile} ({pdcBatchFileSize})
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setPdcBatchFile("");
                          setPdcBatchFileSize("");
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 bg-background px-3 py-1.5 rounded-lg border border-primary/30 shadow-xs transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Cheques Scan</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setPdcBatchFile(f.name);
                            setPdcBatchFileSize(`${Math.round(f.size / 1024)} KB`);
                            toast.success(`Attached bulk PDCs file: ${f.name}`);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* ── INTERACTIVE CHEQUES TABLE WITH PER-ROW UPLOAD ── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground">Individual Post-Dated Cheques Schedule</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-primary"
                    onClick={() => {
                      const nextIdx = pdcCheques.length + 1;
                      const lastCheque = pdcCheques[pdcCheques.length - 1];
                      const nextMaturity = lastCheque ? addMonthsHelper(lastCheque.date, 1) : firstChequeDate;
                      const nextTenureStart = lastCheque ? addMonthsHelper(lastCheque.tenureStart, 1) : firstChequeDate;
                      const nextTenureEnd = addDaysHelper(addMonthsHelper(nextTenureStart, 1), -1);

                      setPdcCheques((prev) => [
                        ...prev,
                        {
                          chequeNo: `PDC-R${nextIdx.toString().padStart(3, "0")}`,
                          bank: pdcBank,
                          date: nextMaturity,
                          amount: pdcAmountPerCheque,
                          period: `Renewal Cheque ${nextIdx}`,
                          tenureStart: nextTenureStart,
                          tenureEnd: nextTenureEnd,
                          file: "",
                        },
                      ]);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Cheque Row
                  </Button>
                </div>

                <div className="max-h-60 overflow-y-auto border rounded-xl bg-background shadow-xs">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/80 text-muted-foreground border-b sticky top-0 bg-muted">
                      <tr>
                        <th className="px-2.5 py-2 text-left w-32 font-semibold">Cheque No.</th>
                        <th className="px-2.5 py-2 text-left w-28 font-semibold">Bank</th>
                        <th className="px-2.5 py-2 text-left w-28 font-semibold">Maturity</th>
                        <th className="px-2.5 py-2 text-right w-24 font-semibold">Amount</th>
                        <th className="px-2.5 py-2 text-left font-semibold">Coverage Tenure</th>
                        <th className="px-2.5 py-2 text-left w-36 font-semibold">Cheque Scan</th>
                        <th className="px-2 py-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pdcCheques.map((c, i) => (
                        <tr key={i} className="hover:bg-muted/20">
                          {/* Cheque No */}
                          <td className="px-2 py-1.5">
                            <Input
                              value={c.chequeNo}
                              onChange={(e) => {
                                const list = [...pdcCheques];
                                list[i] = { ...list[i], chequeNo: e.target.value };
                                setPdcCheques(list);
                              }}
                              className="h-7 text-xs font-mono"
                            />
                          </td>
                          {/* Bank */}
                          <td className="px-2 py-1.5">
                            <Input
                              value={c.bank}
                              onChange={(e) => {
                                const list = [...pdcCheques];
                                list[i] = { ...list[i], bank: e.target.value };
                                setPdcCheques(list);
                              }}
                              className="h-7 text-xs"
                            />
                          </td>
                          {/* Maturity Date */}
                          <td className="px-2 py-1.5">
                            <Input
                              type="date"
                              value={c.date}
                              onChange={(e) => {
                                const list = [...pdcCheques];
                                list[i] = { ...list[i], date: e.target.value };
                                setPdcCheques(list);
                              }}
                              className="h-7 text-xs font-mono"
                            />
                          </td>
                          {/* Amount */}
                          <td className="px-2 py-1.5 text-right">
                            <Input
                              type="number"
                              value={c.amount || ""}
                              onChange={(e) => {
                                const list = [...pdcCheques];
                                list[i] = { ...list[i], amount: Number(e.target.value) || 0 };
                                setPdcCheques(list);
                              }}
                              className="h-7 text-xs font-mono font-semibold text-right"
                            />
                          </td>
                          {/* Tenure */}
                          <td className="px-2 py-1.5 text-muted-foreground text-[10px] whitespace-nowrap">
                            {c.tenureStart} → {c.tenureEnd}
                          </td>
                          {/* Cheque Scan Upload */}
                          <td className="px-2 py-1.5">
                            {c.file ? (
                              <div className="flex items-center justify-between gap-1 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-300">
                                <span className="text-[10px] truncate max-w-[80px]" title={c.file}>
                                  ✓ {c.file}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = [...pdcCheques];
                                    list[i] = { ...list[i], file: "" };
                                    setPdcCheques(list);
                                  }}
                                  className="text-destructive text-xs hover:font-bold"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <label className="cursor-pointer inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                                <Upload className="h-2.5 w-2.5" />
                                <span>Upload</span>
                                <input
                                  type="file"
                                  accept=".pdf,.png,.jpg,.jpeg"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const list = [...pdcCheques];
                                      list[i] = { ...list[i], file: file.name };
                                      setPdcCheques(list);
                                      toast.success(`Attached scan for Cheque #${c.chequeNo}`);
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </td>
                          {/* Delete row */}
                          <td className="px-1 py-1.5 text-center">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setPdcCheques(pdcCheques.filter((_, idx) => idx !== i));
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Safe Custody Details */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/20 border text-xs">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Safe / Vault Custody Location</Label>
                  <Input
                    value={vaultLocation}
                    onChange={(e) => setVaultLocation(e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Receiving Custodian Officer</Label>
                  <Input
                    value={custodyOfficer}
                    onChange={(e) => setCustodyOfficer(e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
                </>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              STEP 4: REVIEW & CONFIRM (NEW LEASE CREATION)
             ═══════════════════════════════════════════════════════ */}
          {currentStep === 4 && (
            <div className="space-y-4">
              {responseType === "confirm" ? (
                <>
                  {/* Highlight Banner: Guaranteed New Lease Creation */}
                  <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary text-primary-foreground shrink-0 shadow-sm">
                      <FileCheck2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        New Lease Agreement Registration
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Confirming will automatically create a brand new Lease Agreement record <strong>({contractNumber})</strong> in status <strong>documents_pending</strong>, linked to the prior lease. The prior contract will be marked as <strong>renewed</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Contract & Tenant */}
                    <div className="p-3.5 rounded-xl border bg-card space-y-2">
                      <div className="flex items-center gap-2 text-primary font-bold border-b pb-1.5">
                        <FileText className="h-4 w-4" /> Agreement Identity
                      </div>
                      <div className="space-y-1 text-muted-foreground">
                        <p><strong className="text-foreground">Contract Number:</strong> <span className="font-mono">{contractNumber}</span></p>
                        <p><strong className="text-foreground">Tenant:</strong> {oldLease?.tenantName}</p>
                        <p><strong className="text-foreground">Unit:</strong> {oldLease?.unit} ({oldLease?.property})</p>
                        <p><strong className="text-foreground">Period:</strong> {startDate} → {endDate} ({termDuration === "custom" ? "Custom" : `${termDuration} Months`})</p>
                      </div>
                    </div>

                    {/* Commercial Terms */}
                    <div className="p-3.5 rounded-xl border bg-card space-y-2">
                      <div className="flex items-center gap-2 text-primary font-bold border-b pb-1.5">
                        <Banknote className="h-4 w-4" /> Commercial Terms
                      </div>
                      <div className="space-y-1 text-muted-foreground">
                        <p><strong className="text-foreground">Monthly Rent:</strong> {formatMoney(confirmedRent)}</p>
                        <p><strong className="text-foreground">Annual Rent:</strong> {formatMoney(confirmedRent * 12)}</p>
                        <p><strong className="text-foreground">Payment Frequency:</strong> {paymentFrequency}</p>
                        <p><strong className="text-foreground">Grace / Notice:</strong> {gracePeriodDays} days / {noticePeriodDays} days</p>
                      </div>
                    </div>

                    {/* Security Deposit Details */}
                    <div className="p-3.5 rounded-xl border bg-card space-y-2">
                      <div className="flex items-center gap-2 text-indigo-600 font-bold border-b pb-1.5">
                        <ShieldCheck className="h-4 w-4" /> Security Deposit Settlement
                      </div>
                      <div className="space-y-1 text-muted-foreground">
                        <p><strong className="text-foreground">Total Deposit Held:</strong> {formatMoney(totalDepositHeldAfterRenewal)}</p>
                        <p><strong className="text-foreground">Handling Mode:</strong> {depositStrategy === "differential" ? `Top-Up (${formatMoney(calculatedDepositAmount)})` : depositStrategy === "full" ? "Full Deposit Collected" : "Carried Forward (Held in Trust)"}</p>
                        <p><strong className="text-foreground">Payment Method:</strong> {depositPaymentMode} {depositReceiptNo ? `(${depositReceiptNo})` : ""}</p>
                        <p>
                          <strong className="text-foreground">Deposit Proof:</strong>{" "}
                          {depositReceiptFile ? (
                            <span className="text-emerald-600 font-semibold">✓ {depositReceiptFile}</span>
                          ) : (
                            <span className="italic text-muted-foreground">No file attached</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* PDC Details or Finance Approval Details */}
                    <div className="p-3.5 rounded-xl border bg-card space-y-2">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold border-b pb-1.5">
                        {noPdcApprovalRequested ? (
                          <>
                            <ShieldCheck className="h-4 w-4 text-amber-600" />
                            <span className="text-amber-800 dark:text-amber-300">Finance Approval Exemption</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4" /> Post-Dated Cheques (PDCs)
                          </>
                        )}
                      </div>
                      {noPdcApprovalRequested ? (
                        <div className="space-y-1 text-muted-foreground">
                          <p><strong className="text-foreground">Contract Type:</strong> <span className="text-amber-700 dark:text-amber-300 font-semibold">Exempt from PDCs (Approval Required)</span></p>
                          <p><strong className="text-foreground">Reason:</strong> {noPdcReason}</p>
                          <p><strong className="text-foreground">Designated Approver:</strong> {noPdcApprovedBy}</p>
                          <p><strong className="text-foreground">Workflow:</strong> Initial status set to <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-300">Pending Finance Approval</Badge></p>
                        </div>
                      ) : (
                        <div className="space-y-1 text-muted-foreground">
                          <p><strong className="text-foreground">Cheque Schedule:</strong> {pdcCheques.length} Cheques ({formatMoney(totalPdcScheduleValue)})</p>
                          <p><strong className="text-foreground">Bank:</strong> {pdcBank}</p>
                          <p><strong className="text-foreground">Series:</strong> {startingChequeNo} → Maturity: {firstChequeDate}</p>
                          <p>
                            <strong className="text-foreground">Scanned Attachments:</strong>{" "}
                            {pdcBatchFile ? (
                              <span className="text-emerald-600 font-semibold">✓ Bulk Bundle ({pdcBatchFile})</span>
                            ) : (
                              <span>{pdcCheques.filter((c) => c.file).length} of {pdcCheques.length} individual scans</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Accounting Ledger Impact Box */}
                  <div className="p-3.5 rounded-xl bg-muted/30 border space-y-1.5 text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5 text-primary" /> General Ledger Accounting Entries Preview
                    </span>
                    <ul className="text-muted-foreground space-y-1 pl-4 list-disc text-[11px]">
                      {calculatedDepositAmount > 0 && (
                        <li>
                          <strong>Security Deposit Voucher:</strong> Dr 12000001 (Bank Operating) {formatMoney(calculatedDepositAmount)} | Cr 21500001 (Security Deposit Liability) {formatMoney(calculatedDepositAmount)}
                        </li>
                      )}
                      {noPdcApprovalRequested ? (
                        <li className="text-amber-700 dark:text-amber-300">
                          <strong>No PDCs to Register:</strong> Contract submitted for <strong>Finance Approval</strong> prior to general ledger PDC posting.
                        </li>
                      ) : (
                        <li>
                          <strong>PDC Portfolio Registration:</strong> Dr 12900001 (Rent PDC In Hand) {formatMoney(totalPdcScheduleValue)} | Safe Location: {vaultLocation}
                        </li>
                      )}
                      <li>
                        <strong>Contract Renewal Sequence:</strong> Status will advance to {noPdcApprovalRequested ? <code>pending_finance_approval</code> : <code>documents_pending</code>} with counter-signature package prepared.
                      </li>
                    </ul>
                  </div>

                  {/* Negotiation Notes */}
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Confirmation &amp; Audit Notes</Label>
                    <Textarea
                      rows={2}
                      value={renewalNotes}
                      onChange={(e) => setRenewalNotes(e.target.value)}
                      placeholder="Special clauses, discount agreements, or staff counter-signature notes..."
                      className="text-xs"
                    />
                  </div>
                </>
              ) : (
                /* Non-renewal confirmation summary */
                <div className="p-4 rounded-xl border border-amber-300/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" /> Confirm Non-Renewal &amp; Move-Out
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    You are confirming that <strong>{oldLease?.tenantName}</strong> will vacate unit <strong>{oldLease?.unit}</strong> on or before <strong>{nonRenewalVacateDate}</strong>.
                  </p>
                  <div className="space-y-1 text-xs">
                    <p><strong>Move-Out Inspection Date:</strong> {nonRenewalInspectionDate}</p>
                    <p><strong>Reason:</strong> {nonRenewalReason}</p>
                    {nonRenewalNotes && <p><strong>Notes:</strong> {nonRenewalNotes}</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── FOOTER NAVIGATION ──────────────────────────────── */}
        <div className="px-6 py-3.5 bg-muted/40 border-t flex items-center justify-between">
          <div>
            {currentStep > 1 && responseType === "confirm" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="gap-1.5 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Previous Step
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Step {currentStep} of 4 — {stepsConfig[currentStep - 1]?.title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>

            {currentStep < 4 && responseType === "confirm" ? (
              <Button
                type="button"
                size="sm"
                onClick={handleNextStep}
                className="gap-1.5 text-xs"
              >
                Next Step <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className={`gap-1.5 text-xs font-semibold ${
                  responseType === "confirm"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-amber-600 text-white hover:bg-amber-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" /> Finalizing...
                  </>
                ) : responseType === "confirm" ? (
                  noPdcApprovalRequested ? (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-1 text-amber-300" /> Submit for Finance Approval
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="h-4 w-4 mr-1" /> Confirm Renewal &amp; Create New Lease
                    </>
                  )
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-1" /> Confirm Non-Renewal &amp; Schedule Move-Out
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
