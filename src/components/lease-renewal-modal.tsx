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
import { Checkbox } from "@/components/ui/checkbox";
import {
  RefreshCw,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  Banknote,
  FileText,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Lock,
  LogOut,
  Receipt,
  Check,
  Wand2,
  FileSignature,
  FileBadge,
} from "lucide-react";
import { toast } from "sonner";

export interface RenewalCaseData {
  id: string;
  leaseId: string;
  noticeDate?: string;
  status: string;
  proposedRent: number;
  proposedPeriod: string;
  revisedTerms?: string;
  expiryDate?: string;
  requiredNoticePeriod?: string;
  lastConfirmationDate?: string;
  outstandingObligations?: string;
  recipients?: string;
  followUpOwner?: string;
}

export interface RenewalLeaseData {
  id: string;
  customerId?: string;
  property: string;
  unit: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  pdcCount?: number;
  paymentFrequency?: string;
  gracePeriodDays?: number;
  penalties?: string;
  maintenanceResponsibility?: string;
  utilityResponsibility?: string;
  specialConditions?: string;
  status?: string;
  phone?: string;
  email?: string;
  qatarId?: string;
}

export interface PdcChequeItem {
  chequeNo: string;
  bank: string;
  date: string;
  amount: number;
  period: string;
  status: "received";
}

export interface RenewalSubmitData {
  renewalCaseId: string;
  leaseId: string;
  response: "confirm" | "non_renewal";
  nonRenewal?: {
    noticeDate: string;
    vacateDate: string;
    inspectionDate: string;
    reason: string;
    notes: string;
  };
  confirmedRent: number;
  oldRent: number;
  annualRent: number;
  startDate: string;
  endDate: string;
  periodMonths: number;
  periodLabel: string;
  paymentFrequency: "monthly" | "quarterly" | "half_yearly" | "yearly" | "annual";
  gracePeriodDays: number;
  notes: string;
  securityDeposit: {
    handlingType: "carry_forward" | "differential" | "new_full" | "waived";
    existingDepositAmount: number;
    differentialAmount: number;
    totalDepositHeld: number;
    paymentMode: string;
    bankName: string;
    chequeNo: string;
    maturityDate: string;
    receiptNo: string;
  };
  pdcs: PdcChequeItem[];
  drawerName: string;
  custodyOfficer: string;
  vaultLocation: string;
  targetLeaseStatus: string;
  postVouchers: boolean;
}

interface LeaseRenewalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renewalCase: RenewalCaseData | null;
  lease: RenewalLeaseData | null | undefined;
  customerDocuments?: Array<{ id: string; name: string; expiryDate?: string; mandatory?: boolean }>;
  onConfirmRenewal: (data: RenewalSubmitData) => void | Promise<void>;
  onConfirmNonRenewal?: (data: {
    renewalCaseId: string;
    leaseId: string;
    noticeDate: string;
    vacateDate: string;
    inspectionDate: string;
    reason: string;
    notes: string;
  }) => void | Promise<void>;
}

const COMMON_BANKS = [
  "Commercial Bank of Qatar (CBQ)",
  "Qatar National Bank (QNB)",
  "Qatar Islamic Bank (QIB)",
  "Doha Bank",
  "Masraf Al Rayan",
  "Dukhan Bank",
  "Ahli Bank",
  "Qatar International Islamic Bank (QIIB)",
  "HSBC Qatar",
];

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
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

export function LeaseRenewalModal({
  open,
  onOpenChange,
  renewalCase,
  lease,
  customerDocuments = [],
  onConfirmRenewal,
  onConfirmNonRenewal,
}: LeaseRenewalModalProps) {
  // Stepper state: 1: Terms, 2: Security Deposit, 3: PDC Collection, 4: Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Decision & Terms
  const [responseType, setResponseType] = useState<"confirm" | "non_renewal">("confirm");
  const [periodPreset, setPeriodPreset] = useState<"12_months" | "6_months" | "24_months" | "custom">("12_months");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [confirmedRent, setConfirmedRent] = useState<number>(0);
  const [paymentFrequency, setPaymentFrequency] = useState<"monthly" | "quarterly" | "half_yearly" | "yearly" | "annual">("monthly");
  const [gracePeriodDays, setGracePeriodDays] = useState<number>(5);
  const [renewalNotes, setRenewalNotes] = useState("");

  // Non-renewal details
  const [nonRenewalForm, setNonRenewalForm] = useState({
    noticeDate: new Date().toISOString().split("T")[0],
    vacateDate: "",
    inspectionDate: "",
    reason: "Contract Expiry / Relocation",
    notes: "",
  });

  // Step 2: Security Deposit
  const [depositStrategy, setDepositStrategy] = useState<"carry_forward" | "differential" | "new_full" | "waived">("carry_forward");
  const [differentialAmount, setDifferentialAmount] = useState<number>(0);
  const [depositPaymentMode, setDepositPaymentMode] = useState("Cheque / PDC");
  const [depositBankName, setDepositBankName] = useState(COMMON_BANKS[0]);
  const [depositChequeNo, setDepositChequeNo] = useState("");
  const [depositMaturityDate, setDepositMaturityDate] = useState("");
  const [depositReceiptNo, setDepositReceiptNo] = useState("");

  // Step 3: PDC Collection
  const [pdcCount, setPdcCount] = useState<number>(12);
  const [pdcBank, setPdcBank] = useState<string>(COMMON_BANKS[0]);
  const [drawerName, setDrawerName] = useState<string>("");
  const [startingChequeNo, setStartingChequeNo] = useState<string>("00108501");
  const [firstChequeDate, setFirstChequeDate] = useState<string>("");
  const [chequeIntervalDays, setChequeIntervalDays] = useState<number>(30);
  const [pdcCheques, setPdcCheques] = useState<PdcChequeItem[]>([]);
  const [custodyOfficer, setCustodyOfficer] = useState<string>("Finance Cashier & Safe Custodian");
  const [vaultLocation, setVaultLocation] = useState<string>("Main Vault - Safe #02 (Leasing Section)");
  const [chequesVerified, setChequesVerified] = useState<boolean>(true);

  // Step 4: Finalize
  const [targetLeaseStatus, setTargetLeaseStatus] = useState<string>("collection_completed");
  const [postVouchers, setPostVouchers] = useState<boolean>(true);
  const [generateAgreement, setGenerateAgreement] = useState<boolean>(true);

  // Initialize form when renewalCase or lease changes
  useEffect(() => {
    if (open && lease) {
      setCurrentStep(1);
      setResponseType("confirm");
      const defaultRent = renewalCase?.proposedRent || lease.monthlyRent || 5000;
      setConfirmedRent(defaultRent);

      const oldEnd = lease.endDate || new Date().toISOString().split("T")[0];
      const newStart = addDaysHelper(oldEnd, 1);
      const newEnd = addDaysHelper(oldEnd, 366);

      setStartDate(newStart);
      setEndDate(newEnd);
      setPeriodPreset("12_months");
      setPaymentFrequency((lease.paymentFrequency as any) || "monthly");
      setGracePeriodDays(lease.gracePeriodDays ?? 5);
      setRenewalNotes(renewalCase?.revisedTerms || "");

      // Non-renewal defaults
      setNonRenewalForm({
        noticeDate: new Date().toISOString().split("T")[0],
        vacateDate: oldEnd,
        inspectionDate: addDaysHelper(oldEnd, -3),
        reason: "Contract Expiry / Normal Move-Out",
        notes: "",
      });

      // Security deposit defaults
      const existingDeposit = lease.securityDeposit || defaultRent;
      const rentDiff = Math.max(0, defaultRent - (lease.monthlyRent || defaultRent));
      setDepositStrategy("carry_forward");
      setDifferentialAmount(rentDiff);
      setDepositPaymentMode("Cheque / PDC");
      setDepositBankName(COMMON_BANKS[0]);
      setDepositChequeNo(`SEC-PDC-${lease.unit?.replace(/\W/g, "") || "101"}`);
      setDepositMaturityDate(newStart);
      setDepositReceiptNo(`REC-SD-${Date.now().toString().slice(-6)}`);

      // PDC defaults
      const defaultCount = lease.paymentFrequency === "quarterly" ? 4 : 12;
      setPdcCount(defaultCount);
      setPdcBank(COMMON_BANKS[0]);
      setDrawerName(lease.tenantName || "Tenant Principal");
      setStartingChequeNo(`00${Math.floor(100000 + Math.random() * 800000)}`);
      setFirstChequeDate(newStart);
      setChequeIntervalDays(30);
      setCustodyOfficer("Finance Cashier & Safe Custodian");
      setVaultLocation(`Main Vault - Safe #02 / Binder ${lease.unit || "PM"}`);
      setChequesVerified(true);
      setTargetLeaseStatus("collection_completed");

      // Generate initial cheques
      generateChequeSchedule(defaultCount, defaultRent, newStart, 30, COMMON_BANKS[0], `00${Math.floor(100000 + Math.random() * 800000)}`);
    }
  }, [open, renewalCase, lease]);

  // Recalculate end date on preset change
  const handlePeriodPresetChange = (preset: "12_months" | "6_months" | "24_months" | "custom") => {
    setPeriodPreset(preset);
    if (!startDate) return;
    if (preset === "12_months") {
      setEndDate(addDaysHelper(startDate, 365));
      setPdcCount(paymentFrequency === "quarterly" ? 4 : 12);
    } else if (preset === "6_months") {
      setEndDate(addDaysHelper(startDate, 182));
      setPdcCount(paymentFrequency === "quarterly" ? 2 : 6);
    } else if (preset === "24_months") {
      setEndDate(addDaysHelper(startDate, 730));
      setPdcCount(paymentFrequency === "quarterly" ? 8 : 24);
    }
  };

  // Auto-generate sequential PDC Cheques
  function generateChequeSchedule(
    count: number,
    amountPerCheque: number,
    firstDate: string,
    interval: number,
    bank: string,
    startNo: string
  ) {
    const list: PdcChequeItem[] = [];
    const baseNo = parseInt(startNo.replace(/\D/g, "") || "100001", 10);
    const validFirst = firstDate || new Date().toISOString().split("T")[0];

    for (let i = 0; i < count; i++) {
      const chequeDate = addDaysHelper(validFirst, i * interval);
      const d = new Date(chequeDate);
      const monthLabel = !isNaN(d.getTime())
        ? d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : `Month ${i + 1}`;

      const chequeNumStr = String(baseNo + i).padStart(startNo.length || 6, "0");

      list.push({
        chequeNo: chequeNumStr,
        bank: bank || COMMON_BANKS[0],
        date: chequeDate,
        amount: Math.round(amountPerCheque),
        period: `Instalment #${i + 1} (${monthLabel})`,
        status: "received",
      });
    }
    setPdcCheques(list);
  }

  // Calculate rent economics
  const oldRent = lease?.monthlyRent || 0;
  const rentDifference = confirmedRent - oldRent;
  const rentPercentChange = oldRent > 0 ? ((rentDifference / oldRent) * 100).toFixed(1) : "0";
  const annualContractRent = confirmedRent * (periodPreset === "6_months" ? 6 : periodPreset === "24_months" ? 24 : 12);

  // Security deposit total held
  const existingHeldDeposit = lease?.securityDeposit || oldRent || 0;
  const totalDepositHeld = useMemo(() => {
    if (depositStrategy === "carry_forward") return existingHeldDeposit;
    if (depositStrategy === "differential") return existingHeldDeposit + (differentialAmount || 0);
    if (depositStrategy === "new_full") return confirmedRent;
    if (depositStrategy === "waived") return 0;
    return existingHeldDeposit;
  }, [depositStrategy, existingHeldDeposit, differentialAmount, confirmedRent]);

  // Total PDC value
  const totalPdcAmount = useMemo(() => {
    return pdcCheques.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [pdcCheques]);

  const pdcMatchesContract = Math.abs(totalPdcAmount - annualContractRent) < 2;

  // Handle individual cheque modification
  const handleUpdateCheque = (index: number, field: keyof PdcChequeItem, value: any) => {
    setPdcCheques((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveCheque = (index: number) => {
    setPdcCheques((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCheque = () => {
    const last = pdcCheques[pdcCheques.length - 1];
    const nextDate = last ? addDaysHelper(last.date, 30) : startDate;
    const baseNo = last ? parseInt(last.chequeNo.replace(/\D/g, "") || "0", 10) + 1 : 100001;
    setPdcCheques((prev) => [
      ...prev,
      {
        chequeNo: String(baseNo).padStart(last?.chequeNo.length || 6, "0"),
        bank: pdcBank,
        date: nextDate,
        amount: confirmedRent,
        period: `Additional Cheque #${prev.length + 1}`,
        status: "received",
      },
    ]);
  };

  // Submit Handler
  const handleFinalSubmit = async () => {
    if (!lease || !renewalCase) return;

    setIsSubmitting(true);
    try {
      if (responseType === "non_renewal") {
        if (onConfirmNonRenewal) {
          await onConfirmNonRenewal({
            renewalCaseId: renewalCase.id,
            leaseId: lease.id,
            noticeDate: nonRenewalForm.noticeDate,
            vacateDate: nonRenewalForm.vacateDate || lease.endDate,
            inspectionDate: nonRenewalForm.inspectionDate,
            reason: nonRenewalForm.reason,
            notes: nonRenewalForm.notes,
          });
        }
        toast.success(`Non-Renewal confirmed for ${lease.tenantName}. Move-out checkout scheduled.`);
        onOpenChange(false);
        return;
      }

      // Validations for confirm
      if (!confirmedRent || confirmedRent <= 0) {
        toast.error("Please enter a valid confirmed monthly rent.");
        setCurrentStep(1);
        setIsSubmitting(false);
        return;
      }

      if (pdcCheques.length === 0) {
        toast.error("At least one post-dated cheque must be registered for renewal.");
        setCurrentStep(3);
        setIsSubmitting(false);
        return;
      }

      if (!chequesVerified) {
        toast.error("Please verify physical custody of post-dated cheques.");
        setCurrentStep(3);
        setIsSubmitting(false);
        return;
      }

      const submission: RenewalSubmitData = {
        renewalCaseId: renewalCase.id,
        leaseId: lease.id,
        response: "confirm",
        confirmedRent,
        oldRent,
        annualRent: annualContractRent,
        startDate,
        endDate,
        periodMonths: periodPreset === "6_months" ? 6 : periodPreset === "24_months" ? 24 : 12,
        periodLabel:
          periodPreset === "6_months"
            ? "6 Months"
            : periodPreset === "24_months"
            ? "24 Months (2 Years)"
            : "12 Months (1 Year)",
        paymentFrequency,
        gracePeriodDays,
        notes: renewalNotes,
        securityDeposit: {
          handlingType: depositStrategy,
          existingDepositAmount: existingHeldDeposit,
          differentialAmount: depositStrategy === "differential" ? differentialAmount : 0,
          totalDepositHeld,
          paymentMode: depositPaymentMode,
          bankName: depositBankName,
          chequeNo: depositChequeNo,
          maturityDate: depositMaturityDate,
          receiptNo: depositReceiptNo,
        },
        pdcs: pdcCheques,
        drawerName: drawerName || lease.tenantName,
        custodyOfficer,
        vaultLocation,
        targetLeaseStatus,
        postVouchers,
      };

      await onConfirmRenewal(submission);
      toast.success(
        `Lease Renewal successfully confirmed for ${lease.tenantName}! ${pdcCheques.length} PDCs and Security Deposit registered.`
      );
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred while confirming renewal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lease || !renewalCase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl border-border">
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 border-b border-indigo-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
                <RefreshCw className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Lease Renewal & Payment Handover
                  <Badge variant="outline" className="text-[11px] font-normal border-indigo-400/40 text-indigo-200 bg-indigo-500/10">
                    Step {currentStep} of 4
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-indigo-200/80 text-xs mt-0.5">
                  Confirm terms, carry-forward/collect security deposit, and register post-dated cheques (PDCs) into safe custody.
                </DialogDescription>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs text-indigo-300/80 block">Current Lease Reference</span>
              <span className="text-sm font-mono font-semibold text-white">{lease.id.toUpperCase()}</span>
            </div>
          </div>

          {/* Lease Context Pill Bar */}
          <div className="mt-4 pt-3 border-t border-indigo-800/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-indigo-100/90">
              <User className="w-3.5 h-3.5 text-indigo-300" />
              <span className="truncate font-medium">{lease.tenantName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-100/90">
              <Building2 className="w-3.5 h-3.5 text-indigo-300" />
              <span className="truncate font-medium">{lease.property} — {lease.unit}</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-100/90">
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              <span className="text-indigo-200">Expires: <strong className="text-white">{lease.endDate}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-100/90">
              <Banknote className="w-3.5 h-3.5 text-indigo-300" />
              <span className="text-indigo-200">Current Rent: <strong className="text-emerald-400">QR {lease.monthlyRent?.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* STEPPER PROGRESS BAR */}
        <div className="bg-muted/40 border-b border-border px-6 py-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, label: "Renewal Terms", desc: "Decision & Dates", icon: FileText },
              { num: 2, label: "Security Deposit", desc: "Carry Forward / Top-Up", icon: ShieldCheck },
              { num: 3, label: "PDC Collection", desc: "Cheque Schedule", icon: CreditCard },
              { num: 4, label: "Review & Confirm", desc: "Finalize & Post", icon: CheckCircle2 },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;
              const StepIcon = step.icon;

              return (
                <button
                  key={step.num}
                  type="button"
                  disabled={responseType === "non_renewal" && step.num > 1}
                  onClick={() => {
                    if (responseType !== "non_renewal") {
                      setCurrentStep(step.num as any);
                    }
                  }}
                  className={`flex items-center gap-2.5 p-2 rounded-lg text-left transition-all ${
                    isActive
                      ? "bg-background border border-primary/30 shadow-xs"
                      : isCompleted
                      ? "hover:bg-muted/60 opacity-90 cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs transition-colors ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isActive
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.num}
                  </div>
                  <div className="min-w-0 hidden md:block">
                    <p className={`text-xs font-semibold leading-none truncate ${isActive ? "text-primary" : ""}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{step.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP CONTENT BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ─────────────────────────────────────────────────────────── */}
          {/* STEP 1: RENEWAL TERMS & DECISION                            */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Tenant Decision Selector */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Tenant Renewal Intent</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setResponseType("confirm")}
                    className={`cursor-pointer rounded-xl border p-4 transition-all flex items-start gap-3.5 ${
                      responseType === "confirm"
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20 shadow-xs"
                        : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        responseType === "confirm"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm flex items-center gap-1.5">
                        Confirm Renewal & Extension
                        {responseType === "confirm" && (
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] py-0">
                            Selected
                          </Badge>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Tenant extends lease. Proceed with terms, security deposit retention, and collection of 12 PDCs.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setResponseType("non_renewal")}
                    className={`cursor-pointer rounded-xl border p-4 transition-all flex items-start gap-3.5 ${
                      responseType === "non_renewal"
                        ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-2 ring-rose-500/20 shadow-xs"
                        : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        responseType === "non_renewal"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <LogOut className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                        Non-Renewal / Vacating Notice
                        {responseType === "non_renewal" && (
                          <Badge variant="outline" className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] py-0">
                            Move-Out
                          </Badge>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Tenant is vacating. Record move-out schedule and transition directly to unit inspection & checkout.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* IF NON-RENEWAL IS SELECTED */}
              {responseType === "non_renewal" ? (
                <Card className="border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/10">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-sm">
                      <AlertCircle className="h-4 w-4" /> Non-Renewal & Move-Out Schedule
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">Notice Received Date</Label>
                        <Input
                          type="date"
                          value={nonRenewalForm.noticeDate}
                          onChange={(e) => setNonRenewalForm((f) => ({ ...f, noticeDate: e.target.value }))}
                          className="mt-1 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Expected Vacating Date</Label>
                        <Input
                          type="date"
                          value={nonRenewalForm.vacateDate}
                          onChange={(e) => setNonRenewalForm((f) => ({ ...f, vacateDate: e.target.value }))}
                          className="mt-1 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Move-Out Inspection Date</Label>
                        <Input
                          type="date"
                          value={nonRenewalForm.inspectionDate}
                          onChange={(e) => setNonRenewalForm((f) => ({ ...f, inspectionDate: e.target.value }))}
                          className="mt-1 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Primary Reason for Vacating</Label>
                      <Select
                        value={nonRenewalForm.reason}
                        onValueChange={(val) => setNonRenewalForm((f) => ({ ...f, reason: val }))}
                      >
                        <SelectTrigger className="mt-1 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Contract Expiry / Normal Move-Out">Contract Expiry / Normal Move-Out</SelectItem>
                          <SelectItem value="Rent Adjustment / Budget Constraints">Rent Adjustment / Budget Constraints</SelectItem>
                          <SelectItem value="Tenant Relocation / Job Transfer">Tenant Relocation / Job Transfer</SelectItem>
                          <SelectItem value="Upgrading to Larger Property">Upgrading to Larger Property</SelectItem>
                          <SelectItem value="Corporate Lease Termination">Corporate Lease Termination</SelectItem>
                          <SelectItem value="Other / Personal Circumstances">Other / Personal Circumstances</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Move-Out Notes & Handover Instructions</Label>
                      <Textarea
                        rows={2}
                        value={nonRenewalForm.notes}
                        onChange={(e) => setNonRenewalForm((f) => ({ ...f, notes: e.target.value }))}
                        placeholder="Key return instructions, clearance certificates needed from Kahramaa/Ooredoo..."
                        className="mt-1 text-xs"
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* CONFIRMED RENEWAL TERMS FORM */
                <div className="space-y-5">
                  {/* Renewal Duration Presets */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Renewal Term / Duration
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        Commences day following current expiry ({addDaysHelper(lease.endDate, 1)})
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "12_months", label: "1 Year (12 Mos)", sub: "Standard Renewal" },
                        { id: "6_months", label: "6 Months", sub: "Short Extension" },
                        { id: "24_months", label: "2 Years (24 Mos)", sub: "Long-term Lock" },
                        { id: "custom", label: "Custom Dates", sub: "Manual Range" },
                      ].map((item) => (
                        <Button
                          key={item.id}
                          type="button"
                          variant={periodPreset === item.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePeriodPresetChange(item.id as any)}
                          className="h-auto py-2 px-3 flex flex-col items-start gap-0.5 text-left border"
                        >
                          <span className="font-semibold text-xs">{item.label}</span>
                          <span className="text-[10px] opacity-75">{item.sub}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Start & End Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border">
                    <div>
                      <Label className="text-xs font-medium">New Lease Start Date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          if (periodPreset === "12_months") {
                            setEndDate(addDaysHelper(e.target.value, 365));
                          }
                        }}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">New Lease End Date</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setPeriodPreset("custom");
                        }}
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>

                  {/* Rental Amount & Economics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <Label className="text-xs font-medium">Confirmed Monthly Rent (QR)</Label>
                      <div className="relative mt-1">
                        <Input
                          type="number"
                          value={confirmedRent}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setConfirmedRent(val);
                            // Also adjust cheques
                            generateChequeSchedule(pdcCount, val, firstChequeDate || startDate, chequeIntervalDays, pdcBank, startingChequeNo);
                          }}
                          className="text-sm font-bold pl-8"
                          placeholder="e.g. 5500"
                        />
                        <span className="absolute left-2.5 top-2.5 text-xs font-medium text-muted-foreground">QR</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {rentDifference === 0 ? (
                          <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            No Rent Change
                          </Badge>
                        ) : rentDifference > 0 ? (
                          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300">
                            +{rentDifference.toLocaleString()} QR (+{rentPercentChange}%)
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                            {rentDifference.toLocaleString()} QR ({rentPercentChange}%) Discount
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-medium">Payment Frequency</Label>
                      <Select
                        value={paymentFrequency}
                        onValueChange={(val: any) => {
                          setPaymentFrequency(val);
                          const count = val === "quarterly" ? 4 : val === "half_yearly" ? 2 : val === "yearly" || val === "annual" ? 1 : 12;
                          setPdcCount(count);
                          const chequeAmt = count === 12 ? confirmedRent : (annualContractRent / count);
                          generateChequeSchedule(count, chequeAmt, firstChequeDate || startDate, 365 / count, pdcBank, startingChequeNo);
                        }}
                      >
                        <SelectTrigger className="mt-1 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly (12 Cheques)</SelectItem>
                          <SelectItem value="quarterly">Quarterly (4 Cheques)</SelectItem>
                          <SelectItem value="half_yearly">Semi-Annual (2 Cheques)</SelectItem>
                          <SelectItem value="yearly">Annual (1 Cheque / Full Pay)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Determines default number of rent PDCs to collect.
                      </p>
                    </div>

                    <div>
                      <Label className="text-xs font-medium">Grace Period (Days)</Label>
                      <Input
                        type="number"
                        value={gracePeriodDays}
                        onChange={(e) => setGracePeriodDays(Number(e.target.value) || 0)}
                        className="mt-1 text-xs"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">Days allowed before late penalty applies.</p>
                    </div>
                  </div>

                  {/* Document & Compliance status */}
                  <div className="rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/30 p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileBadge className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <span className="font-semibold text-foreground">Tenant KYC & Documentation Check</span>
                        <p className="text-muted-foreground text-[11px]">
                          {customerDocuments.length > 0
                            ? `${customerDocuments.length} mandatory documents verified on file for this tenant.`
                            : "Tenant credentials verified under previous lease term."}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 text-[10px]">
                      ✓ Active Status
                    </Badge>
                  </div>

                  {/* Special Terms & Notes */}
                  <div>
                    <Label className="text-xs font-medium">Renewal Notes & Special Clauses</Label>
                    <Textarea
                      rows={2}
                      value={renewalNotes}
                      onChange={(e) => setRenewalNotes(e.target.value)}
                      placeholder="e.g. Free AC maintenance included for 1 year, rent price lock, parking bay #14 reallocated..."
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* STEP 2: SECURITY DEPOSIT HANDLING                           */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-semibold text-emerald-900 dark:text-emerald-300">
                    Security Deposit Handling for Renewing Lease
                  </h4>
                  <p className="text-emerald-800/80 dark:text-emerald-400/80 mt-0.5 leading-relaxed">
                    By default, continuous tenancies carry forward the existing security deposit held in trust. If the monthly rent has increased, you may collect a top-up differential to match the new rent rate.
                  </p>
                </div>
              </div>

              {/* Strategy Cards */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                  Select Deposit Treatment
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1: Carry Forward */}
                  <div
                    onClick={() => setDepositStrategy("carry_forward")}
                    className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                      depositStrategy === "carry_forward"
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20 shadow-xs"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm">Carry Forward Existing</span>
                        {depositStrategy === "carry_forward" && <Check className="h-4 w-4 text-emerald-600" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Retain existing deposit held in trust. No additional collection required from tenant.
                      </p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Held Amount:</span>
                      <strong className="font-mono text-emerald-700 dark:text-emerald-400">QR {existingHeldDeposit.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Option 2: Top-Up Differential */}
                  <div
                    onClick={() => {
                      setDepositStrategy("differential");
                      if (rentDifference > 0) setDifferentialAmount(rentDifference);
                    }}
                    className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                      depositStrategy === "differential"
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20 shadow-xs"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm">Collect Top-Up Differential</span>
                        {depositStrategy === "differential" && <Check className="h-4 w-4 text-indigo-600" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Keep existing deposit and collect the rent increase difference (top-up) from tenant.
                      </p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Difference Needed:</span>
                      <strong className="font-mono text-indigo-700 dark:text-indigo-400">
                        +QR {Math.max(0, rentDifference).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {/* Option 3: Full New Deposit */}
                  <div
                    onClick={() => setDepositStrategy("new_full")}
                    className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                      depositStrategy === "new_full"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm">Collect Full New Deposit</span>
                        {depositStrategy === "new_full" && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Collect full 1-month deposit afresh (e.g. if previous deposit was refunded or reset).
                      </p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Full Deposit:</span>
                      <strong className="font-mono">QR {confirmedRent.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Differential / Collection Details Form if needed */}
              {(depositStrategy === "differential" || depositStrategy === "new_full") && (
                <Card className="border-border bg-muted/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {depositStrategy === "differential" ? "Top-Up Payment Details" : "New Deposit Payment Details"}
                      </span>
                      <Badge variant="outline" className="text-xs font-mono font-bold text-primary">
                        Amount to Collect: QR{" "}
                        {depositStrategy === "differential"
                          ? differentialAmount.toLocaleString()
                          : confirmedRent.toLocaleString()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {depositStrategy === "differential" && (
                        <div>
                          <Label className="text-xs">Top-Up Amount (QR)</Label>
                          <Input
                            type="number"
                            value={differentialAmount}
                            onChange={(e) => setDifferentialAmount(Number(e.target.value) || 0)}
                            className="mt-1 text-xs font-semibold"
                          />
                        </div>
                      )}
                      <div>
                        <Label className="text-xs">Payment Method</Label>
                        <Select value={depositPaymentMode} onValueChange={setDepositPaymentMode}>
                          <SelectTrigger className="mt-1 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cheque / PDC">Cheque / Security PDC</SelectItem>
                            <SelectItem value="Bank Transfer">Bank Transfer / Wire</SelectItem>
                            <SelectItem value="Cash">Cash Receipt</SelectItem>
                            <SelectItem value="Credit Card">Card / POS Terminal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Bank Name</Label>
                        <Select value={depositBankName} onValueChange={setDepositBankName}>
                          <SelectTrigger className="mt-1 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMON_BANKS.map((b) => (
                              <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Cheque / Transaction Ref #</Label>
                        <Input
                          value={depositChequeNo}
                          onChange={(e) => setDepositChequeNo(e.target.value)}
                          placeholder="e.g. CHQ-99014"
                          className="mt-1 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Maturity / Receipt Date</Label>
                        <Input
                          type="date"
                          value={depositMaturityDate}
                          onChange={(e) => setDepositMaturityDate(e.target.value)}
                          className="mt-1 text-xs"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Generated Receipt Ref</Label>
                        <Input
                          value={depositReceiptNo}
                          readOnly
                          className="mt-1 text-xs font-mono bg-muted"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Deposit Summary Banner */}
              <div className="rounded-xl border border-border bg-slate-900 text-white p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Total Security Deposit Held Under Renewed Lease</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      QR {totalDepositHeld.toLocaleString()}
                    </span>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 text-[10px] bg-emerald-500/10">
                      Escrow Secured
                    </Badge>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-300">
                  <p>Method: <strong className="text-white">{depositStrategy === "carry_forward" ? "Carried from Old Lease" : depositPaymentMode}</strong></p>
                  <p className="text-[11px] text-slate-400">Liability Account: Security Deposit Liability</p>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* STEP 3: PDC COLLECTION & SCHEDULE                           */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Toolbar & Generator */}
              <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-primary" /> Post-Dated Cheques (PDC) Collection Setup
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Generate and customize sequential cheques for the renewal period.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      generateChequeSchedule(
                        pdcCount,
                        paymentFrequency === "monthly" ? confirmedRent : annualContractRent / pdcCount,
                        firstChequeDate || startDate,
                        chequeIntervalDays,
                        pdcBank,
                        startingChequeNo
                      )
                    }
                    className="gap-1.5 text-xs h-8"
                  >
                    <Wand2 className="h-3.5 w-3.5 text-indigo-600" /> Regenerate Schedule
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <Label className="text-xs">Number of Cheques</Label>
                    <Select
                      value={String(pdcCount)}
                      onValueChange={(val) => {
                        const count = Number(val);
                        setPdcCount(count);
                        const chequeAmt = annualContractRent / count;
                        generateChequeSchedule(count, chequeAmt, firstChequeDate || startDate, chequeIntervalDays, pdcBank, startingChequeNo);
                      }}
                    >
                      <SelectTrigger className="mt-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 Cheques (Monthly)</SelectItem>
                        <SelectItem value="6">6 Cheques (Bi-Monthly)</SelectItem>
                        <SelectItem value="4">4 Cheques (Quarterly)</SelectItem>
                        <SelectItem value="2">2 Cheques (Semi-Annual)</SelectItem>
                        <SelectItem value="1">1 Cheque (Annual)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Bank Name</Label>
                    <Select
                      value={pdcBank}
                      onValueChange={(val) => {
                        setPdcBank(val);
                        setPdcCheques((prev) => prev.map((p) => ({ ...p, bank: val })));
                      }}
                    >
                      <SelectTrigger className="mt-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_BANKS.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Starting Cheque #</Label>
                    <Input
                      value={startingChequeNo}
                      onChange={(e) => {
                        setStartingChequeNo(e.target.value);
                      }}
                      className="mt-1 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">First Cheque Date</Label>
                    <Input
                      type="date"
                      value={firstChequeDate || startDate}
                      onChange={(e) => setFirstChequeDate(e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Drawer / Payer Name</Label>
                    <Input
                      value={drawerName}
                      onChange={(e) => setDrawerName(e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Cheque Schedule Table */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-muted/40 px-4 py-2.5 flex items-center justify-between border-b border-border text-xs font-semibold">
                  <span>Registered Cheques Schedule ({pdcCheques.length} Cheques)</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleAddCheque}
                    className="h-7 text-xs gap-1 text-primary hover:bg-primary/10"
                  >
                    <Plus className="h-3 w-3" /> Add Cheque Row
                  </Button>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/20 border-b border-border text-muted-foreground uppercase text-[10px] sticky top-0 backdrop-blur-xs">
                      <tr>
                        <th className="px-3 py-2 text-left w-12">#</th>
                        <th className="px-3 py-2 text-left w-28">Cheque No.</th>
                        <th className="px-3 py-2 text-left">Bank</th>
                        <th className="px-3 py-2 text-left w-32">Due Date</th>
                        <th className="px-3 py-2 text-left">Tenure / Period</th>
                        <th className="px-3 py-2 text-right w-28">Amount (QR)</th>
                        <th className="px-3 py-2 text-center w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pdcCheques.map((item, index) => (
                        <tr key={index} className="hover:bg-muted/20 transition-colors">
                          <td className="px-3 py-1.5 font-mono text-muted-foreground">{index + 1}</td>
                          <td className="px-3 py-1.5">
                            <Input
                              value={item.chequeNo}
                              onChange={(e) => handleUpdateCheque(index, "chequeNo", e.target.value)}
                              className="h-7 text-xs font-mono"
                            />
                          </td>
                          <td className="px-3 py-1.5">
                            <Input
                              value={item.bank}
                              onChange={(e) => handleUpdateCheque(index, "bank", e.target.value)}
                              className="h-7 text-xs"
                            />
                          </td>
                          <td className="px-3 py-1.5">
                            <Input
                              type="date"
                              value={item.date}
                              onChange={(e) => handleUpdateCheque(index, "date", e.target.value)}
                              className="h-7 text-xs font-mono"
                            />
                          </td>
                          <td className="px-3 py-1.5">
                            <Input
                              value={item.period}
                              onChange={(e) => handleUpdateCheque(index, "period", e.target.value)}
                              className="h-7 text-xs"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-right">
                            <Input
                              type="number"
                              value={item.amount}
                              onChange={(e) => handleUpdateCheque(index, "amount", Number(e.target.value) || 0)}
                              className="h-7 text-xs text-right font-mono font-semibold"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveCheque(index)}
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals & Reconciliation Bar */}
                <div className="bg-muted/40 border-t border-border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      Cheques Registered: <strong className="text-foreground">{pdcCheques.length}</strong>
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>
                      Total Cheque Value: <strong className="font-mono text-primary font-bold">QR {totalPdcAmount.toLocaleString()}</strong>
                    </span>
                  </div>
                  <div>
                    {pdcMatchesContract ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 gap-1 text-[11px]">
                        <Check className="w-3 h-3" /> Matches Annual Rent (QR {annualContractRent.toLocaleString()})
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 gap-1 text-[11px]">
                        <AlertCircle className="w-3 h-3" /> Difference of QR {Math.abs(totalPdcAmount - annualContractRent).toLocaleString()} vs contract
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Physical Custody & Vault Verification */}
              <Card className="border-border bg-slate-50/50 dark:bg-slate-900/40">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Lock className="h-3.5 w-3.5 text-indigo-600" /> Physical Custody & Register Location
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <Label className="text-xs">Custody Received By</Label>
                      <Input
                        value={custodyOfficer}
                        onChange={(e) => setCustodyOfficer(e.target.value)}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Safe / Vault Storage Reference</Label>
                      <Input
                        value={vaultLocation}
                        onChange={(e) => setVaultLocation(e.target.value)}
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-start gap-2.5">
                    <Checkbox
                      id="verify-chqs"
                      checked={chequesVerified}
                      onCheckedChange={(checked: boolean) => setChequesVerified(checked)}
                      className="mt-0.5"
                    />
                    <label htmlFor="verify-chqs" className="text-xs text-foreground cursor-pointer leading-relaxed">
                      <strong>I confirm physical receipt & custody</strong>: All {pdcCheques.length} post-dated cheques have been physically examined, verified against drawer account, and secured in the finance safe/vault.
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* STEP 4: REVIEW & CONFIRM                                    */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 1: Lease Terms */}
                <Card className="border-border">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="font-semibold text-xs flex items-center gap-1.5 text-primary">
                        <FileText className="h-4 w-4" /> Renewed Tenancy Terms
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary">
                        {periodPreset === "6_months" ? "6 Mos" : periodPreset === "24_months" ? "2 Years" : "1 Year"}
                      </Badge>
                    </div>
                    <div className="text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property & Unit:</span>
                        <span className="font-medium">{lease.property} — {lease.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tenant Name:</span>
                        <span className="font-medium">{lease.tenantName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Term Dates:</span>
                        <span className="font-medium">{startDate} to {endDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Rent:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">QR {confirmedRent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annual Contract Value:</span>
                        <span className="font-bold">QR {annualContractRent.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 2: Security Deposit */}
                <Card className="border-border">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="font-semibold text-xs flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="h-4 w-4" /> Security Deposit Arrangement
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        {depositStrategy === "carry_forward" ? "Carried Forward" : depositStrategy === "differential" ? "Top-Up Collected" : "New Full Deposit"}
                      </Badge>
                    </div>
                    <div className="text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Treatment:</span>
                        <span className="font-medium capitalize">{depositStrategy.replace("_", " ")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Previous Deposit:</span>
                        <span className="font-mono">QR {existingHeldDeposit.toLocaleString()}</span>
                      </div>
                      {depositStrategy === "differential" && (
                        <div className="flex justify-between text-indigo-600">
                          <span>Top-Up Collected:</span>
                          <span className="font-mono font-bold">+QR {differentialAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-border">
                        <span className="font-semibold">Total Deposit Held:</span>
                        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          QR {totalDepositHeld.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 3: PDCs Schedule */}
                <Card className="border-border">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="font-semibold text-xs flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                        <CreditCard className="h-4 w-4" /> Post-Dated Cheques Registry
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                        {pdcCheques.length} Cheques
                      </Badge>
                    </div>
                    <div className="text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cheque Range:</span>
                        <span className="font-mono font-medium">
                          {pdcCheques[0]?.chequeNo || "-"} → {pdcCheques[pdcCheques.length - 1]?.chequeNo || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Primary Bank:</span>
                        <span className="font-medium truncate max-w-[180px]">{pdcBank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">First Cheque Date:</span>
                        <span className="font-medium">{pdcCheques[0]?.date || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vault Reference:</span>
                        <span className="font-medium truncate max-w-[180px]">{vaultLocation}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-border">
                        <span className="font-semibold">Total PDCs Value:</span>
                        <span className="font-bold font-mono text-primary">QR {totalPdcAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 4: Accounting & Integration Preview */}
                <Card className="border-border">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="font-semibold text-xs flex items-center gap-1.5 text-amber-600">
                        <Receipt className="h-4 w-4" /> Accounting & System Postings
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300">
                        Auto ERP Posting
                      </Badge>
                    </div>
                    <div className="text-xs space-y-1.5 text-muted-foreground">
                      <p className="flex items-center gap-1.5 text-foreground">
                        <Check className="h-3 w-3 text-emerald-600" /> Rent PDCs in Hand Receipt Voucher
                      </p>
                      <p className="text-[11px] font-mono pl-4.5 text-muted-foreground">
                        DR PDC In Hand (12900) / CR Customer PDC Liability (21400)
                      </p>
                      <p className="flex items-center gap-1.5 text-foreground">
                        <Check className="h-3 w-3 text-emerald-600" /> Security Deposit Status Recorded
                      </p>
                      <p className="flex items-center gap-1.5 text-foreground">
                        <Check className="h-3 w-3 text-emerald-600" /> Old Lease marked as <Badge variant="secondary" className="text-[9px] py-0">RENEWED</Badge>
                      </p>
                      <p className="flex items-center gap-1.5 text-foreground">
                        <Check className="h-3 w-3 text-emerald-600" /> Renewal Case marked as <Badge variant="secondary" className="text-[9px] py-0">RENEWAL_CONFIRMED</Badge>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status & Options */}
              <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Renewed Lease Target Status</Label>
                    <Select value={targetLeaseStatus} onValueChange={setTargetLeaseStatus}>
                      <SelectTrigger className="mt-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collection_completed">Collection Completed (Ready for Signatures)</SelectItem>
                        <SelectItem value="active">Active (Immediate Tenancy Activation)</SelectItem>
                        <SelectItem value="tenant_signed_pending_collection">Pending Final Document Signing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Custody Receipt Issued By</Label>
                    <Input value={custodyOfficer} readOnly className="mt-1 text-xs bg-muted" />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="opt-post"
                      checked={postVouchers}
                      onCheckedChange={(c: boolean) => setPostVouchers(c)}
                    />
                    <label htmlFor="opt-post" className="cursor-pointer">Post Financial Vouchers to General Ledger</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="opt-agr"
                      checked={generateAgreement}
                      onCheckedChange={(c: boolean) => setGenerateAgreement(c)}
                    />
                    <label htmlFor="opt-agr" className="cursor-pointer">Generate Renewal Agreement PDF Record</label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <DialogFooter className="bg-muted/40 border-t border-border px-6 py-3.5 flex items-center justify-between sm:justify-between w-full">
          <div>
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
          </div>

          <div className="flex items-center gap-2">
            {responseType === "non_renewal" ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="text-xs gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" /> Confirm Non-Renewal & Transition to Checkout
              </Button>
            ) : (
              <>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep((s) => (s - 1) as any)}
                    disabled={isSubmitting}
                    className="text-xs gap-1.5"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </Button>
                )}

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (currentStep === 1 && (!confirmedRent || confirmedRent <= 0)) {
                        toast.error("Please enter confirmed monthly rent.");
                        return;
                      }
                      setCurrentStep((s) => (s + 1) as any);
                    }}
                    className="text-xs gap-1.5"
                  >
                    Next Step <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {isSubmitting ? "Processing Renewal..." : "Confirm Renewal & Register PDCs & Deposit"}
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
