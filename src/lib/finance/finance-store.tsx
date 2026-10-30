import { createContext, useContext, useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { resolveAccountingAccounts } from "./account-resolver";
import { postVoucher } from "./posting-engine";

// ── Types ───────────────────────────────────────────────────────────────────

export interface LedgerTransaction {
  id: string;
  date: string;
  account_code: string;
  account_name: string;
  account_type: "Assets" | "Liabilities" | "Capital" | "Revenue" | "Expenses";
  reference: string;
  debit: number;
  credit: number;
  source: string;
  description: string;
  // Dimensional metadata for filtering
  property_name?: string;
  unit_ref?: string;
  tenant_name?: string;
}

export interface JournalLedgerEntry {
  id: string;
  je_no: string;
  posting_date: string;
  reference: string;
  narration: string;
  dr_account: string;
  dr_code: string;
  cr_account: string;
  cr_code: string;
  amount: number;
  status: string;
  property_name?: string;
  unit_ref?: string;
  tenant_name?: string;
}

export interface GrnCostMapping {
  id: string;
  grn_no: string;
  po_ref: string;
  vendor: string;
  description: string;
  amount: number;
  mapped_gl: string;
  mapped_code: string;
  property: string;
  status: "Mapped" | "Pending" | "Approved";
}

export interface PayableInvoice {
  id: string;
  invoice_no: string;
  vendor: string;
  date: string;
  due_date: string;
  account: string;
  account_code: string;
  amount: number;
  status: "Unpaid" | "Paid" | "Partially Paid";
}

export interface FinanceVoucher {
  id: string;
  voucher_no: string;
  voucher_type: "Journal Voucher" | "Payment Voucher" | "Receipt Voucher" | "Contra Voucher";
  date: string;
  name: string;
  debit: string;
  debit_code: string;
  credit: string;
  credit_code: string;
  amount: number;
  method?: string;
  status: "Posted" | "Draft" | "Approved";
  property_name?: string;
  unit_ref?: string;
  tenant_name?: string;
}

export interface ReceivableInvoice {
  id: string;
  invoice_no: string;
  tenant: string;
  property: string;
  unit: string;
  date: string;
  due_date: string;
  stream: string;
  account_code: string;
  amount: number;
  status: "Pending" | "Paid" | "Overdue";
  customerId?: string;
  billingPeriod?: string;
  leaseId?: string;
  notes?: string;
  paidAmount?: number;
}

export interface LegalReceivable {
  id: string;
  legal_case_id: string;
  tenant_name: string;
  property_name: string;
  unit_ref: string;
  original_amount: number;
  outstanding_balance: number;
  escalation_date: string;
  reason: string;
  status: "Legal Notice Sent" | "Court Case Filed" | "Partially Recovered" | "Fully Recovered";
}

export interface PayrollSyncRun {
  id: string;
  payroll_run_id: string;
  period: string;
  department: string;
  account_code: string;
  basic_salary: number;
  allowances: number;
  overtime: number;
  deductions: number;
  total_amount: number;
  bank_account: string;
  status: "Posted" | "Pending" | "Failed";
  error_details?: string;
}

export interface BankClearanceEntry {
  id: string;
  ref: string;
  bank: string;
  type: string;
  amount: number;
  date: string;
  status: "Cleared" | "Pending Clearance" | "Returned";
}

export interface BankReconciliationRecord {
  id: string;
  account_number: string;
  statement_date: string;
  book_balance: number;
  statement_balance: number;
  difference: number;
  status: "Reconciled" | "Discrepancy";
}

export interface ReconciliationStatementArchive {
  id: string;
  title: string;
  period: string;
  balance: string;
  auditor: string;
}

export interface CashBookEntry {
  id: string;
  date: string;
  voucher: string;
  description: string;
  cash_in: number;
  cash_out: number;
  balance: number;
}

export interface PettyCashEntry {
  id: string;
  date: string;
  expense: string;
  paid_to: string;
  amount: number;
}

// ── Baseline Initial Data (Clean State for Real Entry) ──────────────────────

const INITIAL_JOURNAL_LEDGER: JournalLedgerEntry[] = [];
const INITIAL_GRN_MAPPINGS: GrnCostMapping[] = [];
const INITIAL_PAYABLE_INVOICES: PayableInvoice[] = [];
const INITIAL_VOUCHERS: FinanceVoucher[] = [];
const INITIAL_RECEIVABLE_INVOICES: ReceivableInvoice[] = [];
const INITIAL_LEGAL_RECEIVABLES: LegalReceivable[] = [];
const INITIAL_PAYROLL_SYNCS: PayrollSyncRun[] = [];
const INITIAL_BANK_CLEARANCES: BankClearanceEntry[] = [];
const INITIAL_BANK_RECONCILIATIONS: BankReconciliationRecord[] = [];
const INITIAL_RECON_STATEMENTS: ReconciliationStatementArchive[] = [];
const INITIAL_CASH_BOOK: CashBookEntry[] = [];
const INITIAL_PETTY_CASH: PettyCashEntry[] = [];


// ── Finance Context Interface ───────────────────────────────────────────────

export interface FinanceStoreContextType {
  journalEntries: JournalLedgerEntry[];
  addJournalEntry: (entry: Omit<JournalLedgerEntry, "id" | "status">) => void;

  grnMappings: GrnCostMapping[];
  addGrnMapping: (mapping: Omit<GrnCostMapping, "id">) => void;

  payableInvoices: PayableInvoice[];
  addPayableInvoice: (inv: Omit<PayableInvoice, "id" | "status">) => void;
  markPayableInvoicePaid: (invoiceNo: string) => void;

  vouchers: FinanceVoucher[];
  addVoucher: (vch: Omit<FinanceVoucher, "id" | "status">) => void;

  receivableInvoices: ReceivableInvoice[];
  addReceivableInvoice: (inv: Omit<ReceivableInvoice, "id" | "status">) => void;
  addBulkReceivableInvoices: (invoices: Omit<ReceivableInvoice, "id" | "status">[]) => void;
  markReceivableInvoicePaid: (invoiceNo: string) => void;

  legalReceivables: LegalReceivable[];
  addLegalEscalation: (esc: Omit<LegalReceivable, "id">) => void;
  recoverLegalReceivable: (
    caseId: string,
    amount: number,
    bankRef: string,
    paymentMethod?: string,
    propertyName?: string,
    unitRef?: string,
    tenantName?: string,
    details?: {
      date?: string;
      transactionNo?: string;
      chequeNo?: string;
      chequeBank?: string;
      maturityDate?: string;
    }
  ) => void;

  payrollSyncs: PayrollSyncRun[];
  addPayrollSync: (run: Omit<PayrollSyncRun, "id" | "status">) => void;

  bankClearances: BankClearanceEntry[];
  addBankClearance: (entry: Omit<BankClearanceEntry, "id">) => void;

  bankReconciliations: BankReconciliationRecord[];
  addBankReconciliation: (rec: Omit<BankReconciliationRecord, "id">) => void;

  reconciliationStatements: ReconciliationStatementArchive[];
  addReconciliationStatement: (stmt: Omit<ReconciliationStatementArchive, "id">) => void;

  cashBookEntries: CashBookEntry[];
  addCashBookEntry: (entry: { date: string; voucher: string; description: string; type: "in" | "out"; amount: number }) => void;

  pettyCashEntries: PettyCashEntry[];
  addPettyCashEntry: (entry: Omit<PettyCashEntry, "id">) => void;

  // Real-Time Derived Reports & Ledgers
  allLedgerTransactions: LedgerTransaction[];
  trialBalanceSummary: {
    assets: number;
    liabilities: number;
    capital: number;
    revenue: number;
    expenses: number;
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
  };
  trialBalanceDetailed: {
    code: string;
    name: string;
    type: "Assets" | "Liabilities" | "Capital" | "Revenue" | "Expenses";
    debit: number;
    credit: number;
    balance: number;
  }[];
  profitAndLossReport: {
    rentalRevenue: number;
    otherRevenue: number;
    totalRevenue: number;
    maintenanceExpense: number;
    payrollExpense: number;
    utilitiesExpense: number;
    cleaningExpense: number;
    totalExpenses: number;
    netProfit: number;
  };
  balanceSheetReport: {
    bankCashAssets: number;
    pdcInHandAssets: number;
    arReceivablesAssets: number;
    legalReceivablesAssets: number;
    fixedAssets: number;
    totalAssets: number;

    apLiabilities: number;
    securityDepositLiabilities: number;
    pdcCustomerLiabilities: number;
    totalLiabilities: number;

    ownerCapital: number;
    retainedNetProfit: number;
    totalEquity: number;
    totalLiabilitiesAndEquity: number;
    isBalanced: boolean;
  };
  cashFlowReport: {
    operatingInflow: number;
    operatingOutflow: number;
    netOperatingCash: number;
    investingCash: number;
    financingCash: number;
    netCashChange: number;
    endingCashBalance: number;
  };
  cashOnHandPosition: {
    vaultCash: number;
    pettyCashFloat: number;
    siteDesks: number;
    totalCashOnHand: number;
  };

  isSyncing: boolean;
  refreshFinanceData: () => Promise<void>;
  resetAndInitializeGLFromPDCs: () => Promise<{ created: number; cleared: number }>;
}

const FinanceContext = createContext<FinanceStoreContextType | null>(null);

const STORE_KEY = "zyno-finance-store-v1";

export function resolvePdcBankGl(bank?: string | number | null): { glCode: string; glName: string } {
  if (!bank) {
    return { glCode: "12000001", glName: "Commercial Bank of Qatar (CBQ)" };
  }
  const str = String(bank).toLowerCase().trim();

  // Al Ameen (Oryx) - Dukhan Bank (100001011781 / 12000006)
  if (
    str.includes("oryx") ||
    str.includes("100001011781") ||
    str === "12000006" ||
    str === "9"
  ) {
    return { glCode: "12000006", glName: "Al Ameen (Oryx) - Dukhan Bank" };
  }

  // Dukhan Bank / Al Ameen Dukhan Bank
  if (
    str.includes("dukhan") ||
    str.includes("al ameen") ||
    str.includes("100001761798") ||
    str === "12000002" ||
    str === "8" ||
    str === "10"
  ) {
    return { glCode: "12000002", glName: "Al Ameen Dukhan Bank" };
  }

  // QNB
  if (
    str.includes("qnb") ||
    str.includes("qatar national bank") ||
    str.includes("0013-128940-001") ||
    str === "12000003" ||
    str === "5"
  ) {
    return { glCode: "12000003", glName: "Bank Operating Account (QNB)" };
  }

  // Doha Bank
  if (
    str.includes("doha") ||
    str.includes("0078-439201-003") ||
    str === "12000004" ||
    str === "7"
  ) {
    return { glCode: "12000004", glName: "Doha Bank Operating Account" };
  }

  // QIB
  if (
    str.includes("qib") ||
    str.includes("islamic") ||
    str.includes("0091-554210-004") ||
    str === "12000005" ||
    str === "8"
  ) {
    return { glCode: "12000005", glName: "Qatar Islamic Bank (QIB)" };
  }

  // Commercial Bank of Qatar (CBQ)
  if (
    str.includes("cbq") ||
    str.includes("commercial bank") ||
    str.includes("4060692533001") ||
    str === "12000001" ||
    str === "6"
  ) {
    return { glCode: "12000001", glName: "Commercial Bank of Qatar (CBQ)" };
  }

  // Fallback: If it's already an 8-digit code
  if (/^1200\d{4}$/.test(str)) {
    return { glCode: str, glName: String(bank) };
  }

  return { glCode: "12000001", glName: "Commercial Bank of Qatar (CBQ)" };
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const FINANCE_STORAGE_KEY = "zyno-pms-finance-data-v6";

  // One-time cleanup of legacy/stale local caches that cause amount discrepancies
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const legacyKeys = [
          "zyno-pms-finance-data-v5-vouchers",
          "zyno-pms-finance-data-v5-journals",
          "zyno-pms-finance-data-v5-ap",
          "zyno-pms-finance-data-v5-ar",
          "zyno-pms-finance-data-v5-cashbook",
          "pms_finance_vouchers_v3",
          "pms_finance_vouchers_v2",
          "pms_journal_ledger_v3",
          "pms_journal_ledger_v2",
          "pms_general_ledger_entries_v3",
          "pms_general_ledger_entries_v2",
          "pms_cash_book_v2"
        ];
        legacyKeys.forEach(k => localStorage.removeItem(k));

        // Deduplicate stored vouchers (e.g. redundant PV-SET vouchers for same tenant and unit)
        const vKey = `${FINANCE_STORAGE_KEY}-vouchers`;
        const raw = localStorage.getItem(vKey);
        if (raw) {
          const list: FinanceVoucher[] = JSON.parse(raw);
          if (Array.isArray(list)) {
            const seenPvSet = new Set<string>();
            const deduped = list.filter(v => {
              if (v.voucher_no && v.voucher_no.startsWith("PV-SET-")) {
                const key = `${v.tenant_name || ""}_${v.unit_ref || ""}_${v.amount}`;
                if (seenPvSet.has(key)) return false;
                seenPvSet.add(key);
              }
              return true;
            });
            if (deduped.length !== list.length) {
              localStorage.setItem(vKey, JSON.stringify(deduped));
            }
          }
        }
      } catch {}
    }
  }, []);

  // ── States ────────────────────────────────────────────────────────────────
  const [journalEntries, setJournalEntries] = useState<JournalLedgerEntry[]>(() => {
    if (typeof window === "undefined") return INITIAL_JOURNAL_LEDGER;
    try {
      const saved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-journals`);
      return saved ? JSON.parse(saved) : INITIAL_JOURNAL_LEDGER;
    } catch { return INITIAL_JOURNAL_LEDGER; }
  });
  const [grnMappings, setGrnMappings] = useState<GrnCostMapping[]>(INITIAL_GRN_MAPPINGS);
  const [payableInvoices, setPayableInvoices] = useState<PayableInvoice[]>(() => {
    if (typeof window === "undefined") return INITIAL_PAYABLE_INVOICES;
    try {
      const saved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-ap`);
      return saved ? JSON.parse(saved) : INITIAL_PAYABLE_INVOICES;
    } catch { return INITIAL_PAYABLE_INVOICES; }
  });
  const [vouchers, setVouchers] = useState<FinanceVoucher[]>(() => {
    if (typeof window === "undefined") return INITIAL_VOUCHERS;
    try {
      const saved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-vouchers`);
      if (!saved) return INITIAL_VOUCHERS;
      const list: FinanceVoucher[] = JSON.parse(saved);
      if (Array.isArray(list)) {
        const seenPvSet = new Set<string>();
        return list.filter(v => {
          const vNo = (v.voucher_no || "").toUpperCase();
          const vName = (v.name || "").toLowerCase();
          const uRef = (v.unit_ref || "").toUpperCase();

          // Purge testing transactions for OA22-10 / OA24-10 / Cheque 35
          if (
            vNo.includes("TRF-35") ||
            vNo.includes("TRF-CNL-35") ||
            uRef.includes("OA22-10") ||
            uRef.includes("OA24-10") ||
            vName.includes("oa22-10") ||
            vName.includes("oa24-10") ||
            vName.includes("devadas melitta") ||
            vName.includes("devadas pappu")
          ) {
            return false;
          }

          if (v.voucher_no && v.voucher_no.startsWith("PV-SET-")) {
            const key = `${v.tenant_name || ""}_${v.unit_ref || ""}_${v.amount}`;
            if (seenPvSet.has(key)) return false;
            seenPvSet.add(key);
          }
          return true;
        }).map(v => {
          const vNo = (v.voucher_no || "").toUpperCase();
          const vName = (v.name || "").toLowerCase();
          if (vNo.startsWith("VCH-TRF-CNL-") || vName.includes("pdc cancelled") || vName.includes("returned on bank transfer")) {
            return {
              ...v,
              debit: "Customer PDC Liability",
              debit_code: "21400",
              credit: "PDC In Hand",
              credit_code: "12900",
            };
          }
          if (vNo.startsWith("VCH-TRF-") || vName.includes("bank transfer received in place of pdc")) {
            return {
              ...v,
              debit: v.debit && !v.debit.includes("Revenue") ? v.debit : "Bank Operating Account",
              debit_code: v.debit_code && v.debit_code !== "41100" ? v.debit_code : "12000001",
              credit: "Tenant Receivables",
              credit_code: "12413",
            };
          }
          return v;
        });
      }
      return INITIAL_VOUCHERS;
    } catch { return INITIAL_VOUCHERS; }
  });
  const [receivableInvoices, setReceivableInvoices] = useState<ReceivableInvoice[]>(() => {
    if (typeof window === "undefined") return INITIAL_RECEIVABLE_INVOICES;
    try {
      const saved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-ar`);
      return saved ? JSON.parse(saved) : INITIAL_RECEIVABLE_INVOICES;
    } catch { return INITIAL_RECEIVABLE_INVOICES; }
  });
  const [legalReceivables, setLegalReceivables] = useState<LegalReceivable[]>(INITIAL_LEGAL_RECEIVABLES);
  const [payrollSyncs, setPayrollSyncs] = useState<PayrollSyncRun[]>(INITIAL_PAYROLL_SYNCS);
  const [bankClearances, setBankClearances] = useState<BankClearanceEntry[]>(INITIAL_BANK_CLEARANCES);
  const [bankReconciliations, setBankReconciliations] = useState<BankReconciliationRecord[]>(INITIAL_BANK_RECONCILIATIONS);
  const [reconciliationStatements, setReconciliationStatements] = useState<ReconciliationStatementArchive[]>(INITIAL_RECON_STATEMENTS);
  const [cashBookEntries, setCashBookEntries] = useState<CashBookEntry[]>(() => {
    if (typeof window === "undefined") return INITIAL_CASH_BOOK;
    try {
      const saved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-cashbook`);
      return saved ? JSON.parse(saved) : INITIAL_CASH_BOOK;
    } catch { return INITIAL_CASH_BOOK; }
  });
  const [pettyCashEntries, setPettyCashEntries] = useState<PettyCashEntry[]>(INITIAL_PETTY_CASH);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sync to local storage on changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${FINANCE_STORAGE_KEY}-vouchers`, JSON.stringify(vouchers));
        localStorage.setItem(`${FINANCE_STORAGE_KEY}-journals`, JSON.stringify(journalEntries));
        localStorage.setItem(`${FINANCE_STORAGE_KEY}-ar`, JSON.stringify(receivableInvoices));
        localStorage.setItem(`${FINANCE_STORAGE_KEY}-ap`, JSON.stringify(payableInvoices));
        localStorage.setItem(`${FINANCE_STORAGE_KEY}-cashbook`, JSON.stringify(cashBookEntries));
      } catch { /* ignore */ }
    }
  }, [vouchers, journalEntries, receivableInvoices, payableInvoices, cashBookEntries]);

  // Track IDs already merged from Supabase to avoid duplicates
  const seenVoucherIds = useRef(new Set<string>());

  const fetchSupabaseData = async (showToast = false) => {
    setIsSyncing(true);
    try {
      // 1. Pull existing fin_vouchers from Supabase
      const { data: vData, error: vError } = await supabase
        .from("fin_vouchers")
        .select("*, fin_voucher_lines(account_code, account_name, debit_amount, credit_amount)")
        .order("voucher_date", { ascending: false });

      if (!vError && vData) {
        // Asynchronously purge testing vouchers for OA22-10 / OA24-10 / Cheque 35
        void supabase
          .from("fin_vouchers")
          .delete()
          .or("voucher_number.ilike.%TRF-35%,voucher_number.ilike.%TRF-CNL-35%,description.ilike.%OA22-10%,description.ilike.%OA24-10%,description.ilike.%Devadas%");

        setVouchers(prev => {
          const existingNos = new Set(prev.map(v => v.voucher_no));
          const mapped: FinanceVoucher[] = vData
            .filter((r: any) => {
              const vNo = (r.voucher_number || "").toUpperCase();
              const desc = (r.description || "").toLowerCase();
              if (
                vNo.includes("TRF-35") ||
                vNo.includes("TRF-CNL-35") ||
                desc.includes("oa22-10") ||
                desc.includes("oa24-10") ||
                desc.includes("devadas melitta") ||
                desc.includes("devadas pappu")
              ) {
                return false;
              }
              return !existingNos.has(r.voucher_number);
            })
            .map(r => {
              const isPV = r.voucher_type === "PV";
              const isRV = r.voucher_type === "RV";
              const lines: Array<{ account_code: string; account_name: string; debit_amount?: number; credit_amount?: number; debit?: number; credit?: number }> = r.fin_voucher_lines || [];
              const drLine = lines.find(l => Number(l.debit_amount ?? l.debit) > 0);
              const crLine = lines.find(l => Number(l.credit_amount ?? l.credit) > 0);

              const desc = (r.description || "").toLowerCase();
              let drCode = drLine?.account_code;
              let crCode = crLine?.account_code;
              let drName = drLine?.account_name;
              let crName = crLine?.account_name;

              if (!drCode || !crCode) {
                if (desc.includes("rent pdc") || desc.includes("rv-l1-01")) {
                  drCode = "12900"; drName = "PDC In Hand";
                  crCode = "21400"; crName = "Customer (PDC) Liability";
                } else if (desc.includes("security deposit") || desc.includes("rv-l1-02")) {
                  drCode = "12100001"; drName = "Cash In Hand";
                  crCode = "21500"; crName = "Security Deposit Liability";
                } else if (desc.includes("kahramaa") || desc.includes("rv-l1-utl") || desc.includes("qatar cool") || desc.includes("rv-l1-qc") || desc.includes("reservation") || desc.includes("rv-l1-res") || desc.includes("service fee") || desc.includes("rv-l1-svc")) {
                  drCode = "12100001"; drName = "Cash In Hand";
                  crCode = "21100"; crName = "Refundable Deposit Liability";
                } else if (desc.includes("guarantee cheque") || desc.includes("rv-l1-gchq")) {
                  drCode = "12900"; drName = "PDC In Hand (Guarantee)";
                  crCode = "21200"; crName = "Guarantee Cheque Liability";
                } else if (desc.includes("pdc deposited to bank") || desc.includes("vch-dep-")) {
                  const bInfo = resolvePdcBankGl(desc);
                  drCode = bInfo.glCode; drName = bInfo.glName;
                  crCode = "12900001"; crName = "Rent PDC In Hand";
                } else if (desc.includes("pdc cleared") || desc.includes("vch-clr-")) {
                  drCode = "21400001"; drName = "Customer PDC Liability";
                  crCode = "12413001"; crName = "Tenant Receivables";
                } else if (desc.includes("pdc returned on cash settlement") || desc.includes("vch-csh-ret-")) {
                  drCode = "21400"; drName = "Customer (PDC) Liability";
                  crCode = "12900"; crName = "PDC In Hand";
                } else if (desc.includes("bank deposit of replaced pdc cash till") || desc.includes("vch-csh-dep-")) {
                  drCode = "12000001"; drName = "Bank Operating Account";
                  crCode = "12100001"; drName = "Cash In Hand";
                } else if (desc.includes("bank transfer received in place of pdc") || (desc.includes("vch-trf-") && !desc.includes("cnl")) || (r.voucher_number && r.voucher_number.toLowerCase().startsWith("vch-trf-") && !r.voucher_number.toLowerCase().includes("cnl"))) {
                  const bInfo = resolvePdcBankGl(desc);
                  drCode = bInfo.glCode || "12000001"; drName = bInfo.glName || "Bank Operating Account";
                  crCode = "12413"; crName = "Tenant Receivables";
                } else if (desc.includes("pdc cancelled / returned on bank transfer settlement") || desc.includes("vch-trf-cnl-") || (r.voucher_number && r.voucher_number.toLowerCase().startsWith("vch-trf-cnl-"))) {
                  drCode = "21400"; drName = "Customer PDC Liability";
                  crCode = "12900"; crName = "PDC In Hand";
                } else if (desc.includes("cash collected in place of pdc") || desc.includes("vch-csh-pdc-")) {
                  drCode = "12100001"; drName = "Cash In Hand";
                  crCode = "41100"; crName = "Rental Revenue";
                } else if (desc.includes("pdc cheque returned") || desc.includes("vch-ret-pdc-")) {
                  drCode = "12900"; drName = "PDC In Hand";
                  crCode = "12000001"; drName = "Bank Operating Account";
                } else if (desc.includes("tenant dues restored") || desc.includes("vch-ret-ar-")) {
                  drCode = "12413"; drName = "Tenant Receivables";
                  crCode = "21400"; crName = "Customer (PDC) Liability";
                } else if (desc.includes("admin charges") || desc.includes("rv-l1-adm")) {
                  drCode = "12100001"; drName = "Cash In Hand";
                  crCode = "41500"; crName = "Admin Fee Income";
                } else if (desc.includes("agency commission") || desc.includes("rv-l1-agn")) {
                  drCode = "12100001"; drName = "Cash In Hand";
                  crCode = "41400"; crName = "Agency Commission Income";
                } else {
                  drCode = isPV ? "22100001" : "12000001";
                  drName = isPV ? "Accounts Payable / Expense" : "Bank Operating Account";
                  crCode = isPV ? "12000001" : "41100";
                  crName = isPV ? "Bank Operating Account" : "Rental Revenue";
                }
              }

              let vchTenant = "";
              let vchUnit = "";
              let vchProp = "";
              if (r.description) {
                const trfMatch = r.description.match(/(?:Bank Transfer Received in Place of PDC|PDC Cancelled \/ Returned on Bank Transfer Settlement)\s*[-–]\s*\w+\s*\((.*?)\s*[-–]\s*(.*?)\)/i);
                if (trfMatch) {
                  vchTenant = trfMatch[1].trim();
                  vchUnit = trfMatch[2].trim();
                  if (vchUnit.includes("-")) vchProp = vchUnit.split("-")[0].trim();
                } else {
                  const match = r.description.match(/Security Deposit Receipt\s*[-–]\s*(.*?)\s*\((.*?)\)/i);
                  if (match) {
                    vchTenant = match[1].trim();
                    vchUnit = match[2].trim();
                    if (vchUnit.includes("-")) vchProp = vchUnit.split("-")[0].trim();
                  }
                }
              }

              return {
                id: r.id,
                voucher_no: r.voucher_number,
                voucher_type: (isPV ? "Payment Voucher" : isRV ? "Receipt Voucher" : "Journal Voucher") as FinanceVoucher["voucher_type"],
                date: r.voucher_date,
                name: r.description || r.voucher_number,
                debit: drName || "Debit Account",
                debit_code: drCode || "12000001",
                credit: crName || "Credit Account",
                credit_code: crCode || "41100",
                amount: Number(r.total_amount) || 0,
                status: r.status === "posted" ? "Posted" : "Draft" as FinanceVoucher["status"],
                property_name: vchProp,
                unit_ref: vchUnit,
                tenant_name: vchTenant,
              };
            });

          return mapped.length ? [...mapped, ...prev] : prev;
        });
        vData.forEach((r: { id: string }) => seenVoucherIds.current.add(r.id));
      }

      // 2. Pull journal_entries from Supabase
      const { data: jData, error: jError } = await supabase
        .from("journal_entries")
        .select("*, journal_lines(*, gl_accounts(code, name_en))")
        .order("posting_date", { ascending: false })
        .limit(50);

      if (!jError && jData?.length) {
        setJournalEntries(prev => {
          const existingNos = new Set(prev.map(j => j.je_no));
          const mapped: JournalLedgerEntry[] = jData
            .filter(r => !existingNos.has(r.je_no))
            .map(r => {
              const drLine = r.journal_lines?.find((l: any) => l.debit > 0);
              const crLine = r.journal_lines?.find((l: any) => l.credit > 0);
              return {
                id: r.id,
                je_no: r.je_no,
                posting_date: r.posting_date,
                reference: r.source_id || r.je_no,
                narration: r.narration || "",
                dr_account: drLine?.gl_accounts?.name_en || "General Account",
                dr_code: drLine?.gl_accounts?.code || "10000",
                cr_account: crLine?.gl_accounts?.name_en || "General Account",
                cr_code: crLine?.gl_accounts?.code || "10000",
                amount: drLine?.debit || 0,
                status: r.status || "Posted",
              };
            });
          return mapped.length ? [...mapped, ...prev] : prev;
        });
      }

      // 3. Synthesize "PDC Received" (Entry 1 only) for every PDC in the system.
      //
      // KEY DESIGN DECISIONS:
      //   a) Only Entry 1 (RCV — Dr 12900001 PDC In Hand / Cr 21400001 Customer PDC Liability)
      //      is synthesized here. Entries 2 (DEP), 3 (CLR), 4 (RET) are written to fin_vouchers
      //      by actual user actions in PDC Management and are already loaded by Section 1 above.
      //      Synthesizing DEP/CLR here was causing ALL PDCs to show as "Contra Vouchers".
      //
      //   b) ID-based deduplication (same strategy as PDC Management component):
      //      • Primary map keyed by pdcs.id (guarantees uniqueness)
      //      • cheque_number → id lookup for matching fin_pdc_register rows
      //      • pdcs table is authoritative for property/unit/tenant names
      //      This fixes "Property / Unit / Customer showing —".

      // Paginated fetch helper — avoids PostgREST 1,000-row default limit
      async function fetchAllPagesFSD<T = any>(
        queryFn: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>
      ): Promise<T[]> {
        let rows: T[] = [];
        let from = 0;
        const pageSize = 1000;
        while (true) {
          const res = await Promise.resolve(queryFn(from, from + pageSize - 1));
          if (res.error || !res.data || res.data.length === 0) break;
          rows = rows.concat(res.data);
          if (res.data.length < pageSize) break;
          from += pageSize;
        }
        return rows;
      }

      const [finPdcRows2, pdcsRows2] = await Promise.all([
        fetchAllPagesFSD((from, to) =>
          supabase.from("fin_pdc_register").select("*").order("cheque_date", { ascending: true }).range(from, to)
        ),
        fetchAllPagesFSD((from, to) =>
          supabase.from("pdcs").select("*").order("created_at", { ascending: true }).range(from, to)
        ),
      ]);
      const finPdcRes = { data: finPdcRows2 };
      const pdcsTableRes = { data: pdcsRows2 };

      // Helper to normalize date strings to YYYY-MM-DD
      const toYmdFSD = (d: any) => {
        if (!d) return "";
        if (typeof d === "string") return d.split("T")[0];
        try {
          return new Date(d).toISOString().split("T")[0];
        } catch {
          return "";
        }
      };

      const daysDiffFSD = (d1: string, d2: string): number => {
        if (!d1 || !d2) return 9999;
        const t1 = new Date(d1).getTime();
        const t2 = new Date(d2).getTime();
        if (isNaN(t1) || isNaN(t2)) return 9999;
        return Math.abs(Math.round((t1 - t2) / (86400000)));
      };

      // Step A: Build primary map from pdcs table keyed by row ID
      const pdcIdMap = new Map<string, any>();   // rowKey → merged row
      const pdcsByChq = new Map<string, string[]>(); // cheque_number → list of rowKeys
      const pdcsBySlNo = new Map<number, string>(); // sl_no → rowKey

      for (const p of (pdcsTableRes.data || [])) {
        const rowKey  = String(p.id);
        const chqNo   = p.cheque_number ? String(p.cheque_number).trim() : null;
        const cDate   = toYmdFSD(p.maturity_date || p.cheque_date || p.created_at);

        const row = {
          id:            p.id,
          cheque_number: chqNo || rowKey,
          property_name: p.property_code || p.property_name || "",
          unit_ref:      p.unit_name || p.unit_ref || "",
          tenant_name:   p.tenant_name || p.drawer_name || "",
          cheque_date:   cDate || "",
          deposit_date:  toYmdFSD(p.deposit_date),
          cleared_date:  "",
          returned_date: "",
          amount:        Number(p.amount || 0),
          bank:          p.bank || p.bank_name || p.deposit_bank || "",
          bank_id:       p.bank_id || null,
          status:        (p.status || "").toLowerCase().replace(/_/g, " ").trim(),
        };

        pdcIdMap.set(rowKey, row);
        if (p.sl_no != null) {
          pdcsBySlNo.set(Number(p.sl_no), rowKey);
        }
        if (chqNo) {
          const list = pdcsByChq.get(chqNo) || [];
          list.push(rowKey);
          pdcsByChq.set(chqNo, list);
        }
      }

      // Step B: Merge fin_pdc_register into the map (update status / date; never overwrite display fields)
      const usedPdcKeys = new Set<string>();

      for (const p of (finPdcRes.data || [])) {
        const chqNo      = p.cheque_number ? String(p.cheque_number).trim() : null;
        const pDate      = toYmdFSD(p.cheque_date || p.maturity_date);
        const pAmt       = Number(p.amount || 0);
        const origId     = p.original_pdc_id != null ? Number(p.original_pdc_id) : null;

        let matchedKey: string | null = null;
        // 1. Try deterministic match via original_pdc_id === pdcs.sl_no
        if (origId != null && pdcsBySlNo.has(origId)) {
          const key = pdcsBySlNo.get(origId)!;
          if (!usedPdcKeys.has(key)) {
            matchedKey = key;
          }
        }

        // 2. Fall back to cheque_number candidates
        if (!matchedKey && chqNo && pdcsByChq.has(chqNo)) {
          const candidateKeys = pdcsByChq.get(chqNo)!;
          const availableKeys = candidateKeys.filter(k => !usedPdcKeys.has(k));

          // 2a. Try exact amount + close date (within 2 days for timezone tolerance)
          matchedKey = availableKeys.find(k => {
            const row = pdcIdMap.get(k);
            return Math.abs(row.amount - pAmt) < 0.01 && daysDiffFSD(row.cheque_date, pDate) <= 2;
          }) || null;

          // 2b. If only 1 candidate available and amounts match, match it
          if (!matchedKey && availableKeys.length === 1 && Math.abs(pdcIdMap.get(availableKeys[0])?.amount - pAmt) < 0.01) {
            matchedKey = availableKeys[0];
          }
        }

        if (matchedKey && pdcIdMap.has(matchedKey)) {
          usedPdcKeys.add(matchedKey);
          // Update the existing pdcs row — take the more advanced status, keep pdcs display fields
          const existing      = pdcIdMap.get(matchedKey)!;
          const rawFinStatus  = (p.status || "").toLowerCase().replace(/_/g, " ").trim();
          const rawPdcStatus  = existing.status;

          const isFinal = (s: string) => ["cleared", "returned", "bounced", "cancelled", "replaced", "partial cash"].includes(s);
          let mergedStatus = rawPdcStatus || rawFinStatus || "in hand";
          if (isFinal(rawPdcStatus))                                           mergedStatus = rawPdcStatus;
          else if (isFinal(rawFinStatus))                                      mergedStatus = rawFinStatus;
          else if (rawPdcStatus === "deposited" || rawFinStatus === "deposited") mergedStatus = "deposited";

          pdcIdMap.set(matchedKey, {
            ...existing,
            // Take cheque_date from fin_pdc_register if pdcs table had it empty
            cheque_date: existing.cheque_date || pDate || "",
            deposit_date: existing.deposit_date || toYmdFSD(p.deposit_date) || "",
            cleared_date: toYmdFSD(p.cleared_date) || "",
            returned_date: toYmdFSD(p.returned_date) || "",
            bank: existing.bank || p.bank_name || p.bank || "",
            bank_id: existing.bank_id || p.bank_id || null,
            status: mergedStatus,
          });
        }
      }

      const mergedPdcs = Array.from(pdcIdMap.values()).filter(p => Number(p.amount || 0) > 0);

      if (mergedPdcs.length > 0) {
        setVouchers(prev => {
          // Keep only non-PDC operational vouchers that came from real Supabase fin_vouchers
          const nonPdcVouchers = prev.filter(v =>
            !v.voucher_no.startsWith("VCH-PDC-") &&
            !v.voucher_no.startsWith("VCH-DEP-") &&
            !v.voucher_no.startsWith("VCH-CLR-") &&
            !v.voucher_no.startsWith("VCH-RET-") &&
            !v.voucher_no.startsWith("VCH-CNL-") &&
            (vData || []).some((r: any) => r.voucher_number === v.voucher_no)
          );
          const existingNos = new Set(nonPdcVouchers.map(v => v.voucher_no));
          const pdcVouchers: FinanceVoucher[] = [];

          for (const p of mergedPdcs) {
            const chequeNo     = String(p.cheque_number);
            const amount       = Number(p.amount || 0);
            const chqDate      = p.cheque_date || new Date().toISOString().split("T")[0];
            const tenantName   = p.tenant_name || "";
            const unitRef      = p.unit_ref    || "";
            const propertyName = p.property_name || "";
            const desc         = unitRef ? `${tenantName} (${unitRef})` : tenantName || `Cheque #${chequeNo}`;
            const st           = (p.status || "").toLowerCase();

            // ── Entry 1: PDC Collection / In Hand ──────────────────────────────
            // Dr 12900001 Rent PDC In Hand  /  Cr 21400001 Customer PDC Liability
            const rcvNo = `VCH-PDC-RCV-${p.id ?? chequeNo}`;
            if (!existingNos.has(rcvNo)) {
              existingNos.add(rcvNo);
              pdcVouchers.push({
                id:           `pdc-rcv-${p.id ?? chequeNo}`,
                voucher_no:   rcvNo,
                voucher_type: "Receipt Voucher",
                date:         chqDate,
                name:         `PDC Received — ${desc} [Cheque #${chequeNo}]`,
                debit:        "Rent PDC In Hand",
                debit_code:   "12900001",
                credit:       "Customer PDC Liability",
                credit_code:  "21400001",
                amount,
                method:       "PDC",
                status:       "Posted",
                property_name: propertyName,
                unit_ref:     unitRef,
                tenant_name:  tenantName,
              });
            }

            // ── Entry 2: PDC Deposited to Bank ──────────────────────────────────
            // Dr [Bank GL Code] [Bank Title]  /  Cr 12900001 Rent PDC In Hand
            if (st === "deposited" || st === "cleared") {
              const depNo = `VCH-DEP-${p.id ?? chequeNo}`;
              const bankInfo = resolvePdcBankGl(p.bank || p.bank_name || p.bank_id);
              if (!existingNos.has(depNo)) {
                existingNos.add(depNo);
                pdcVouchers.push({
                  id:           `pdc-dep-${p.id ?? chequeNo}`,
                  voucher_no:   depNo,
                  voucher_type: "Receipt Voucher",
                  date:         p.deposit_date || chqDate,
                  name:         `PDC Deposited to ${bankInfo.glName} — ${desc} [Cheque #${chequeNo}]`,
                  debit:        bankInfo.glName,
                  debit_code:   bankInfo.glCode,
                  credit:       "Rent PDC In Hand",
                  credit_code:  "12900001",
                  amount,
                  method:       "Cheque Deposit",
                  status:       "Posted",
                  property_name: propertyName,
                  unit_ref:     unitRef,
                  tenant_name:  tenantName,
                });
              }
            }

            // ── Entry 3: PDC Cleared by Bank ────────────────────────────────────
            // Dr 21400001 Customer PDC Liability  /  Cr 12413001 Tenant Receivables
            if (st === "cleared") {
              const clrNo = `VCH-CLR-${p.id ?? chequeNo}`;
              if (!existingNos.has(clrNo)) {
                existingNos.add(clrNo);
                pdcVouchers.push({
                  id:           `pdc-clr-${p.id ?? chequeNo}`,
                  voucher_no:   clrNo,
                  voucher_type: "Journal Voucher",
                  date:         p.cleared_date || chqDate,
                  name:         `PDC Cleared — ${desc} [Cheque #${chequeNo}]`,
                  debit:        "Customer PDC Liability",
                  debit_code:   "21400001",
                  credit:       "Tenant Receivables",
                  credit_code:  "12413001",
                  amount,
                  method:       "Cheque Clearance",
                  status:       "Posted",
                  property_name: propertyName,
                  unit_ref:     unitRef,
                  tenant_name:  tenantName,
                });
              }
            }

            // ── Entry 4: PDC Returned / Bounced ─────────────────────────────────
            if (st === "bounced" || st === "returned") {
              const retNo = `VCH-RET-${p.id ?? chequeNo}`;
              const bankInfo = resolvePdcBankGl(p.bank || p.bank_name || p.bank_id);
              if (!existingNos.has(retNo)) {
                existingNos.add(retNo);
                pdcVouchers.push({
                  id:           `pdc-ret-${p.id ?? chequeNo}`,
                  voucher_no:   retNo,
                  voucher_type: "Journal Voucher",
                  date:         p.returned_date || chqDate,
                  name:         `PDC Cheque Returned / Dishonoured — ${desc} [Cheque #${chequeNo}]`,
                  debit:        "Rent PDC In Hand",
                  debit_code:   "12900001",
                  credit:       bankInfo.glName,
                  credit_code:  bankInfo.glCode,
                  amount,
                  method:       "Cheque Return",
                  status:       "Posted",
                  property_name: propertyName,
                  unit_ref:     unitRef,
                  tenant_name:  tenantName,
                });
              }
              const retArNo = `VCH-RET-AR-${p.id ?? chequeNo}`;
              if (!existingNos.has(retArNo)) {
                existingNos.add(retArNo);
                pdcVouchers.push({
                  id:           `pdc-ret-ar-${p.id ?? chequeNo}`,
                  voucher_no:   retArNo,
                  voucher_type: "Journal Voucher",
                  date:         p.returned_date || chqDate,
                  name:         `Tenant Dues Restored on Dishonour — ${desc} [Cheque #${chequeNo}]`,
                  debit:        "Tenant Receivables",
                  debit_code:   "12413001",
                  credit:       "Customer PDC Liability",
                  credit_code:  "21400001",
                  amount,
                  method:       "Cheque Return",
                  status:       "Posted",
                  property_name: propertyName,
                  unit_ref:     unitRef,
                  tenant_name:  tenantName,
                });
              }
            }

            // ── Entry 5: PDC Cancelled ──────────────────────────────────────────
            if (st === "cancelled") {
              const cnlNo = `VCH-CNL-${p.id ?? chequeNo}`;
              if (!existingNos.has(cnlNo)) {
                existingNos.add(cnlNo);
                pdcVouchers.push({
                  id:           `pdc-cnl-${p.id ?? chequeNo}`,
                  voucher_no:   cnlNo,
                  voucher_type: "Journal Voucher",
                  date:         chqDate,
                  name:         `PDC Cancelled — ${desc} [Cheque #${chequeNo}]`,
                  debit:        "Customer PDC Liability",
                  debit_code:   "21400001",
                  credit:       "Rent PDC In Hand",
                  credit_code:  "12900001",
                  amount,
                  method:       "Cancellation",
                  status:       "Posted",
                  property_name: propertyName,
                  unit_ref:     unitRef,
                  tenant_name:  tenantName,
                });
              }
            }
          }

          const combined = [...pdcVouchers, ...nonPdcVouchers];
          try {
            localStorage.setItem(`${FINANCE_STORAGE_KEY}-vouchers`, JSON.stringify(combined));
          } catch {}
          return combined;
        });
      }




      // 4. Pull fin_accounting_events for security deposits, utility deposits, and other

      // in-app posting-engine events that were written to the DB but not via fin_vouchers.
      const { data: evtData } = await supabase
        .from("fin_accounting_events")
        .select("*")
        .order("event_date", { ascending: true });

      if (evtData && evtData.length > 0) {
        setJournalEntries(prev => {
          const existingIds = new Set(prev.map(j => j.id));
          const mapped: JournalLedgerEntry[] = evtData
            .filter((e: any) => !existingIds.has(e.id))
            .map((e: any) => {
              const meta = (e.metadata as any) || {};
              // Infer Dr/Cr from event_type
              const evtType = (e.event_type || "").toLowerCase();
              let drCode = "12000001", crCode = "41100001";
              let drName = "Bank Operating Account", crName = "Rental Revenue";
              if (evtType.includes("pdc") && evtType.includes("receiv")) {
                drCode = "12900001"; drName = "Rent PDC In Hand";
                crCode = "21400001"; crName = "Customer PDC Liability";
              } else if (evtType.includes("deposit") && evtType.includes("security")) {
                drCode = "12000001"; drName = "Bank Operating Account";
                crCode = "21500001"; crName = "Security Deposit Liability";
              } else if (evtType.includes("deposit") && evtType.includes("pdc")) {
                drCode = "12000001"; drName = "Bank Operating Account";
                crCode = "12900001"; crName = "Rent PDC In Hand";
              } else if (evtType.includes("clear")) {
                drCode = "21400001"; drName = "Customer PDC Liability";
                crCode = "41100001"; crName = "Rental Revenue";
              }
              return {
                id: e.id,
                je_no: e.reference_number || `EVT-${String(e.id).slice(0, 8).toUpperCase()}`,
                posting_date: e.event_date || e.posting_date || new Date().toISOString().split("T")[0],
                reference: e.source_id || e.reference_number || e.id,
                narration: e.description || e.event_type || "Accounting Event",
                dr_account: drName,
                dr_code: drCode,
                cr_account: crName,
                cr_code: crCode,
                amount: Number(e.total_debit || e.total_credit || 0),
                status: "Posted",
                property_name: meta.property_name,
                unit_ref: meta.unit_ref,
                tenant_name: meta.tenant_name,
              };
            });
          return mapped.length ? [...mapped, ...prev] : prev;
        });
      }

      // 5. Reload localStorage caches for AP/AR/Cashbook (vouchers are maintained authoritatively above)
      if (typeof window !== "undefined") {
        try {
          const jDataSaved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-journals`);
          if (jDataSaved) {
            const parsed = JSON.parse(jDataSaved);
            if (Array.isArray(parsed) && parsed.length) setJournalEntries(parsed);
          }
          const arDataSaved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-ar`);
          if (arDataSaved) {
            const parsed = JSON.parse(arDataSaved);
            if (Array.isArray(parsed) && parsed.length) setReceivableInvoices(parsed);
          }
          const apDataSaved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-ap`);
          if (apDataSaved) {
            const parsed = JSON.parse(apDataSaved);
            if (Array.isArray(parsed) && parsed.length) setPayableInvoices(parsed);
          }
          const cbDataSaved = localStorage.getItem(`${FINANCE_STORAGE_KEY}-cashbook`);
          if (cbDataSaved) {
            const parsed = JSON.parse(cbDataSaved);
            if (Array.isArray(parsed) && parsed.length) setCashBookEntries(parsed);
          }
        } catch { /* ignore */ }
      }

      if (showToast) {
        toast.success("Financial records & reports refreshed successfully");
      }
    } catch (err: any) {
      if (showToast) {
        toast.error("Failed to refresh financial records: " + (err?.message || "Error"));
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const refreshFinanceData = async () => {
    await fetchSupabaseData(true);
  };

  // ── One-time GL Initializer from PDCs ─────────────────────────────────────
  // Clears ALL synthetic PDC vouchers, re-fetches PDC data fresh, then generates:
  //   Entry 1 (RCV) for every PDC — Dr PDC In Hand / Cr Customer PDC Liability
  //   Entry 2 (DEP) for PDCs where cheque_date ≤ today — Dr Bank / Cr PDC In Hand  (Journal, NOT Contra)
  //   Entry 3 (CLR) for PDCs where cheque_date ≤ today — Dr Customer PDC Liability / Cr Rental Revenue
  // This is intended as a one-time bulk initialisation, not run on every refresh.
  const resetAndInitializeGLFromPDCs = async (): Promise<{ created: number; cleared: number }> => {
    setIsSyncing(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];

      // Paginated fetch helper — avoids PostgREST 1,000-row default limit
      async function fetchAllPages<T = any>(
        queryFn: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>
      ): Promise<T[]> {
        let rows: T[] = [];
        let from = 0;
        const pageSize = 1000;
        while (true) {
          const res = await Promise.resolve(queryFn(from, from + pageSize - 1));
          if (res.error || !res.data || res.data.length === 0) break;
          rows = rows.concat(res.data);
          if (res.data.length < pageSize) break;
          from += pageSize;
        }
        return rows;
      }

      // Step 1: Fetch ALL PDC rows (paginated past the 1,000-row PostgREST limit)
      // + customers + leases for full name resolution
      const [finPdcRows, pdcsRows, customersRes, leasesRes] = await Promise.all([
        fetchAllPages((from, to) =>
          supabase.from("fin_pdc_register").select("*").order("cheque_date", { ascending: true }).range(from, to)
        ),
        fetchAllPages((from, to) =>
          supabase.from("pdcs").select("*").order("created_at", { ascending: true }).range(from, to)
        ),
        supabase.from("customers").select("id, name"),
        supabase.from("leases").select("id, customer_id, tenant_name, tenantName"),
      ]);

      // Wrap in same shape for compatibility
      const finPdcRes  = { data: finPdcRows };
      const pdcsTableRes = { data: pdcsRows };

      // Build customer id → name lookup
      const customerById = new Map<string, string>();
      for (const c of (customersRes.data || [])) {
        if (c.id && c.name) customerById.set(String(c.id), String(c.name));
      }

      // Build lease id → tenant name lookup (prefer lease.tenant_name, then customers table)
      const tenantByLeaseId = new Map<string, string>();
      for (const l of (leasesRes.data || [])) {
        if (!l.id) continue;
        const tName = (l as any).tenant_name || (l as any).tenantName ||
          (l.customer_id ? customerById.get(String(l.customer_id)) : "") || "";
        if (tName) tenantByLeaseId.set(String(l.id), tName);
      }

      // Helper: resolve best tenant name from a raw pdcs row
      function resolveTenant(p: any): string {
        // Priority: tenant_name field → drawer_name → tenant_id in customers → lease_id in leases
        if (p.tenant_name && p.tenant_name !== "—") return String(p.tenant_name).trim();
        if (p.drawer_name  && p.drawer_name  !== "—") return String(p.drawer_name).trim();
        if (p.tenant_id) {
          const fromCustomer = customerById.get(String(p.tenant_id));
          if (fromCustomer) return fromCustomer;
        }
        if (p.lease_id) {
          const fromLease = tenantByLeaseId.get(String(p.lease_id));
          if (fromLease) return fromLease;
        }
        return "";
      }

      // Step 2: Build authoritative PDC list directly from pdcs table
      const pdcIdMap = new Map<string, any>();

      for (const p of (pdcsTableRes.data || [])) {
        const rowKey = String(p.id);
        const chqNo  = p.cheque_number ? String(p.cheque_number).trim() : null;
        pdcIdMap.set(rowKey, {
          id:            p.id,
          cheque_number: chqNo || rowKey,
          property_name: p.property_code || p.property_name || "",
          unit_ref:      p.unit_name || p.unit_ref || "",
          tenant_name:   resolveTenant(p),
          cheque_date:   p.maturity_date || p.cheque_date || (p.created_at ? String(p.created_at).split("T")[0] : ""),
          deposit_date:  p.deposit_date ? String(p.deposit_date).split("T")[0] : "",
          amount:        Number(p.amount || 0),
          bank:          p.bank || p.bank_name || p.deposit_bank || "",
          bank_id:       p.bank_id || null,
          status:        (p.status || "").toLowerCase().replace(/_/g, " ").trim(),
        });
      }

      for (const p of (finPdcRes.data || [])) {
        const rowKey = String(p.id);
        if (!pdcIdMap.has(rowKey) && (!p.original_pdc_id || !pdcIdMap.has(String(p.original_pdc_id)))) {
          const chqNo = p.cheque_number ? String(p.cheque_number).trim() : null;
          pdcIdMap.set(`fin-${p.id}`, {
            id:            p.id,
            cheque_number: chqNo || String(p.id),
            property_name: p.property_name || p.property_code || "",
            unit_ref:      p.unit_name || p.unit_ref || "",
            tenant_name:   resolveTenant(p),
            cheque_date:   p.cheque_date || p.maturity_date || "",
            deposit_date:  p.deposit_date ? String(p.deposit_date).split("T")[0] : "",
            amount:        Number(p.amount || 0),
            bank:          p.bank_name || p.bank || "",
            bank_id:       p.bank_id || null,
            status:        (p.status || "").toLowerCase().replace(/_/g, " ").trim(),
          });
        }
      }

      const allPdcs = Array.from(pdcIdMap.values()).filter(p => Number(p.amount || 0) > 0);

      // Step 3: Build clean PDC In Hand voucher set (1:1 with PDC Register & Leasing Vouchers)
      const freshVouchers: FinanceVoucher[] = [];
      let clearedCount = 0;

      for (const p of allPdcs) {
        const chequeNo     = String(p.cheque_number);
        const amount       = Number(p.amount || 0);
        const chqDate      = p.cheque_date || todayStr;
        const tenantName   = p.tenant_name || "";
        const unitRef      = p.unit_ref    || "";
        const propertyName = p.property_name || "";
        const desc         = unitRef ? `${tenantName} (${unitRef})` : tenantName || `Cheque #${chequeNo}`;
        const rawStatus    = (p.status || "").toLowerCase().trim();

        // ── Entry 1: PDC Received (In Hand) — always posted for all valid cheques ────
        freshVouchers.push({
          id:           `pdc-rcv-${p.id}`,
          voucher_no:   `VCH-PDC-RCV-${p.id}`,
          voucher_type: "Receipt Voucher",
          date:         chqDate,
          name:         `PDC Received — ${desc} [Cheque #${chequeNo}]`,
          debit:        "Rent PDC In Hand",
          debit_code:   "12900001",
          credit:       "Customer PDC Liability",
          credit_code:  "21400001",
          amount,
          method:       "PDC",
          status:       "Posted",
          property_name: propertyName,
          unit_ref:     unitRef,
          tenant_name:  tenantName,
        });

        const isDeposited = rawStatus === "deposited";
        const isCleared = rawStatus === "cleared";

        if (isDeposited || isCleared) {
          const bankInfo = resolvePdcBankGl(p.bank || p.bank_name || p.bank_id);
          // ── Entry 2: PDC Deposited to Bank — Journal / Receipt Voucher ──
          freshVouchers.push({
            id:           `pdc-dep-${p.id}`,
            voucher_no:   `VCH-DEP-${p.id}`,
            voucher_type: "Receipt Voucher",
            date:         p.deposit_date || chqDate,
            name:         `PDC Deposited to ${bankInfo.glName} — ${desc} [Cheque #${chequeNo}]`,
            debit:        bankInfo.glName,
            debit_code:   bankInfo.glCode,
            credit:       "Rent PDC In Hand",
            credit_code:  "12900001",
            amount,
            method:       "Cheque Deposit",
            status:       "Posted",
            property_name: propertyName,
            unit_ref:     unitRef,
            tenant_name:  tenantName,
          });
        }

        if (isCleared) {
          clearedCount++;
          // ── Entry 3: PDC Cleared — Realized into Tenant Receivables / Revenue ──
          freshVouchers.push({
            id:           `pdc-clr-${p.id}`,
            voucher_no:   `VCH-CLR-${p.id}`,
            voucher_type: "Receipt Voucher",
            date:         chqDate,
            name:         `PDC Cleared — ${desc} [Cheque #${chequeNo}]`,
            debit:        "Customer PDC Liability",
            debit_code:   "21400001",
            credit:       "Tenant Receivables",
            credit_code:  "12413001",
            amount,
            method:       "PDC Clearance",
            status:       "Posted",
            property_name: propertyName,
            unit_ref:     unitRef,
            tenant_name:  tenantName,
          });
        }
      }

      // Step 4: Authoritatively set vouchers and clear stale mock journals
      setVouchers(freshVouchers);
      setJournalEntries([]);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`${FINANCE_STORAGE_KEY}-vouchers`, JSON.stringify(freshVouchers));
          localStorage.setItem(`${FINANCE_STORAGE_KEY}-journals`, JSON.stringify([]));
        } catch {}
      }

      const totalAmt = freshVouchers
        .filter(v => v.voucher_no.startsWith("VCH-PDC-RCV-"))
        .reduce((s, v) => s + v.amount, 0);

      toast.success(
        `GL Initialised: ${freshVouchers.length} PDC vouchers created totaling QAR ${totalAmt.toLocaleString()}. All PDCs reconciled In Hand.`
      );
      return { created: freshVouchers.length, cleared: clearedCount };
    } catch (err: any) {
      toast.error("GL initialisation failed: " + (err?.message || "Unknown error"));
      return { created: 0, cleared: 0 };
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull and subscribe to Supabase data on mount
  useEffect(() => {
    void fetchSupabaseData(false);

    // Subscribe to fin_vouchers INSERT events for real-time updates.
    const voucherChannel = supabase
      .channel("finance-store:fin_vouchers")
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "fin_vouchers" },
        (payload: any) => {
          const r = payload.new;
          if (!r?.id || seenVoucherIds.current.has(r.id)) return;
          seenVoucherIds.current.add(r.id);
          const isPV = r.voucher_type === "PV";
          const isRV = r.voucher_type === "RV";
          const mapped: FinanceVoucher = {
            id: r.id,
            voucher_no: r.voucher_number,
            voucher_type: (isPV ? "Payment Voucher" : isRV ? "Receipt Voucher" : "Journal Voucher") as FinanceVoucher["voucher_type"],
            date: r.voucher_date,
            name: r.description || r.voucher_number,
            debit: isPV ? "Accounts Payable / Expense" : isRV ? "Bank Operating Account" : "Journal Debit",
            debit_code: isPV ? (r.reference_no && /^\d+$/.test(r.reference_no) ? r.reference_no : "22100001") : "12000001",
            credit: isPV ? "Bank Operating Account" : isRV ? "Rental Revenue" : "Journal Credit",
            credit_code: isPV ? "12000001" : (r.reference_no && /^\d+$/.test(r.reference_no) ? r.reference_no : "41100"),
            amount: Number(r.total_amount) || 0,
            status: "Posted",
          };

          setVouchers(prev => {
            if (prev.some(v => v.id === r.id || v.voucher_no === r.voucher_number)) return prev;
            return [mapped, ...prev];
          });
          toast.info(`Voucher ${r.voucher_number} posted to GL via Supabase.`);
        }
      )
      .subscribe();

    // Subscribe to fin_accounting_events for visibility into posting-engine writes.
    const eventChannel = supabase
      .channel("finance-store:fin_accounting_events")
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "fin_accounting_events" },
        (payload: any) => {
          const r = payload.new;
          if (!r?.id) return;
          // Merge into journal entries for GL view.
          const entry: JournalLedgerEntry = {
            id: r.id,
            je_no: r.reference_number || `EVT-${r.id.slice(0, 8).toUpperCase()}`,
            posting_date: r.posting_date || r.event_date,
            reference: r.source_id || r.reference_number || r.id,
            narration: r.description || r.event_type,
            dr_account: "Various (see lines)",
            dr_code: "10000",
            cr_account: "Various (see lines)",
            cr_code: "10000",
            amount: r.total_debit || 0,
            status: "Posted",
            property_name: (r.metadata as any)?.property_name,
            unit_ref: (r.metadata as any)?.unit_ref,
            tenant_name: (r.metadata as any)?.tenant_name,
          };
          setJournalEntries(prev => {
            if (prev.some(j => j.id === r.id || j.je_no === entry.je_no)) return prev;
            return [entry, ...prev];
          });
        }
      )
      .subscribe();

    // Listen for cross-module voucher sync events (e.g. from procurement AP payments)
    const handleVoucherSync = () => {
      const STORE_KEY_V = `${FINANCE_STORAGE_KEY}-vouchers`;
      const STORE_KEY_AP = `${FINANCE_STORAGE_KEY}-ap`;
      try {
        const vData: FinanceVoucher[] = JSON.parse(localStorage.getItem(STORE_KEY_V) || "[]");
        setVouchers(prev => {
          const existingNos = new Set(prev.map(v => v.voucher_no));
          const newOnes = vData.filter(v => !existingNos.has(v.voucher_no));
          return newOnes.length ? [...newOnes, ...prev] : prev;
        });
        const apData: PayableInvoice[] = JSON.parse(localStorage.getItem(STORE_KEY_AP) || "[]");
        setPayableInvoices(prev => {
          const existingNos = new Set(prev.map(i => i.invoice_no));
          const newOnes = apData.filter(i => !existingNos.has(i.invoice_no));
          const updates = apData.filter(i => existingNos.has(i.invoice_no));
          let merged = newOnes.length ? [...newOnes, ...prev] : [...prev];
          if (updates.length) {
            merged = merged.map(i => {
              const u = updates.find(u => u.invoice_no === i.invoice_no);
              return u ? { ...i, status: u.status } : i;
            });
          }
          return merged;
        });
      } catch { /* ignore */ }
      // Trigger a full supabase re-fetch so any PDC/deposit written by any module
      // (pdc-manager, leasing, cashier) shows up in GL immediately
      void fetchSupabaseData(false);
    };
    window.addEventListener("finance_vouchers_updated", handleVoucherSync);
    // Run once on mount to pick up any payments made before this render
    handleVoucherSync();

    // ── Realtime: pdcs table (INSERT + UPDATE) ──────────────────────────────
    // Any module that writes a PDC (pdc-manager, leasing-module addVoucher,
    // cashier, bulk-pdc-deposit-modal) triggers this. We immediately synthesize
    // Entry 1 (PDC Received: Dr 12900001 PDC In Hand / Cr 21400001 Customer PDC
    // Liability) so the GL & Trial Balance update without needing a manual refresh.
    const pdcChannel = supabase
      .channel("finance-store:pdcs")
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "pdcs" },
        (payload: any) => {
          const r = payload.new;
          if (!r?.id || Number(r.amount || 0) <= 0) return;

          const chequeNo     = String(r.cheque_number || r.id);
          const amount       = Number(r.amount || 0);
          const chqDate      = r.maturity_date || r.cheque_date ||
            (r.created_at ? String(r.created_at).split("T")[0] : new Date().toISOString().split("T")[0]);
          const tenantName   = r.tenant_name || r.drawer_name || "";
          const unitRef      = r.unit_name   || r.unit_ref    || "";
          const propertyName = r.property_code || r.property_name || "";
          const desc         = unitRef ? `${tenantName} (${unitRef})` : tenantName || `Cheque #${chequeNo}`;
          const rcvNo        = `VCH-PDC-RCV-${chequeNo}`;

          setVouchers(prev => {
            if (prev.some(v => v.voucher_no === rcvNo)) return prev;
            const newVch: FinanceVoucher = {
              id:            `pdc-rcv-${r.id}`,
              voucher_no:    rcvNo,
              voucher_type:  "Receipt Voucher",
              date:          chqDate,
              name:          `PDC Received — ${desc} [Cheque #${chequeNo}]`,
              debit:         "Rent PDC In Hand",
              debit_code:    "12900001",
              credit:        "Customer PDC Liability",
              credit_code:   "21400001",
              amount,
              method:        "PDC",
              status:        "Posted",
              property_name: propertyName,
              unit_ref:      unitRef,
              tenant_name:   tenantName,
            };
            return [newVch, ...prev];
          });
        }
      )
      .subscribe();

    // ── Realtime: fin_accounting_events UPDATE ──────────────────────────────
    // Security deposit settlements and PDC status changes produce UPDATEs on
    // existing event rows. The INSERT listener above doesn't catch these,
    // so we trigger a silent re-fetch on any event update.
    const eventUpdateChannel = supabase
      .channel("finance-store:fin_accounting_events:update")
      .on(
        "postgres_changes" as any,
        { event: "UPDATE", schema: "public", table: "fin_accounting_events" },
        () => { void fetchSupabaseData(false); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(voucherChannel);
      supabase.removeChannel(eventChannel);
      supabase.removeChannel(pdcChannel);
      supabase.removeChannel(eventUpdateChannel);
      window.removeEventListener("finance_vouchers_updated", handleVoucherSync);
    };
  }, []);


  // ── Actions ───────────────────────────────────────────────────────────────

  function addJournalEntry(entry: Omit<JournalLedgerEntry, "id" | "status">) {
    const newEntry: JournalLedgerEntry = {
      ...entry,
      id: `je-${Date.now()}`,
      status: "Posted"
    };
    setJournalEntries(prev => [newEntry, ...prev]);
    toast.success(`Journal Entry ${newEntry.je_no} posted to General Ledger!`);

    // Persist to Supabase journal_entries table (best-effort, fire-and-forget).
    void Promise.resolve(
      supabase.from("journal_entries").insert({
        je_no: newEntry.je_no,
        posting_date: newEntry.posting_date,
        period: newEntry.posting_date?.slice(0, 7) ?? new Date().toISOString().slice(0, 7),
        source_module: "Finance Store",
        source_id: newEntry.reference || null,
        narration: newEntry.narration || null,
        status: "posted",
      })
    ).then(({ error }: any) => {
      if (error) console.warn("[FinanceStore] journal_entries persist warn:", error.message);
    });
  }

  function addGrnMapping(mapping: Omit<GrnCostMapping, "id">) {
    const newGrn: GrnCostMapping = {
      ...mapping,
      id: `grn-${Date.now()}`
    };
    setGrnMappings(prev => [newGrn, ...prev]);
    toast.success(`GRN ${newGrn.grn_no} cost allocated & posted to ${newGrn.mapped_gl}!`);
  }

  function addPayableInvoice(inv: Omit<PayableInvoice, "id" | "status">) {
    const newInv: PayableInvoice = {
      ...inv,
      id: `ap-${Date.now()}`,
      status: "Unpaid"
    };
    setPayableInvoices(prev => [newInv, ...prev]);
    toast.success(`AP Invoice ${newInv.invoice_no} created and posted!`);
  }

  function markPayableInvoicePaid(invoiceNo: string) {
    setPayableInvoices(prev => prev.map(inv => {
      if (inv.invoice_no === invoiceNo) {
        // Also auto-record a Payment Voucher
        const pv: FinanceVoucher = {
          id: `vch-pay-${Date.now()}`,
          voucher_no: `VCH-PAY-${Math.floor(1000 + Math.random() * 9000)}`,
          voucher_type: "Payment Voucher",
          date: new Date().toISOString().split("T")[0],
          name: `Settlement for Invoice ${invoiceNo}`,
          debit: inv.account,
          debit_code: inv.account_code || "22100001",
          credit: "Bank Operating Account",
          credit_code: "12000001",
          amount: inv.amount,
          method: "Bank Transfer",
          status: "Posted"
        };
        setVouchers(v => [pv, ...v]);
        return { ...inv, status: "Paid" as const };
      }
      return inv;
    }));
    toast.success(`Invoice ${invoiceNo} marked as Paid. Payment Voucher generated.`);
  }

  function addVoucher(vch: Omit<FinanceVoucher, "id" | "status">) {
    const newVch: FinanceVoucher = {
      ...vch,
      id: `vch-${Date.now()}`,
      status: "Posted"
    };
    setVouchers(prev => {
      if (prev.some(v => v.voucher_no === newVch.voucher_no)) return prev;
      return [newVch, ...prev];
    });
    toast.success(`${newVch.voucher_type} ${newVch.voucher_no} posted successfully!`);

    // Persist to Supabase fin_vouchers (best-effort, fire-and-forget).
    const typeCode = newVch.voucher_type === "Payment Voucher" ? "PV" : newVch.voucher_type === "Receipt Voucher" ? "RV" : "JV";
    void Promise.resolve(
      supabase.from("fin_vouchers").insert({
        voucher_number: newVch.voucher_no,
        voucher_date: newVch.date,
        voucher_type: typeCode,
        reference_no: newVch.debit_code || null,
        description: newVch.name,
        total_amount: newVch.amount,
        status: "posted",
        posted_at: new Date().toISOString(),
      }).select("id")
    ).then(({ error, data }: any) => {
      if (error) {
        console.warn("[FinanceStore] fin_vouchers persist warn:", error.message);
        return;
      }
      // Mark the newly inserted row as seen so realtime won't toast it again.
      const insertedId = Array.isArray(data) ? data[0]?.id : (data as any)?.id;
      if (insertedId) seenVoucherIds.current.add(String(insertedId));
    });
  }

  function addReceivableInvoice(inv: Omit<ReceivableInvoice, "id" | "status">) {
    const newInv: ReceivableInvoice = {
      ...inv,
      id: `ar-${Date.now()}`,
      status: "Pending"
    };
    setReceivableInvoices(prev => [newInv, ...prev]);
    toast.success(`AR Invoice ${newInv.invoice_no} generated and posted!`);
  }

  function addBulkReceivableInvoices(invoices: Omit<ReceivableInvoice, "id" | "status">[]) {
    const timestamp = Date.now();
    const newItems: ReceivableInvoice[] = invoices.map((inv, idx) => ({
      ...inv,
      id: `ar-bulk-${timestamp}-${idx}`,
      status: "Pending" as const
    }));
    setReceivableInvoices(prev => [...newItems, ...prev]);
    toast.success(`${newItems.length} AR Invoices generated and posted successfully!`);
  }

  function markReceivableInvoicePaid(invoiceNo: string) {
    setReceivableInvoices(prev => prev.map(inv => {
      if (inv.invoice_no === invoiceNo) {
        // Also record a Receipt Voucher
        const rv: FinanceVoucher = {
          id: `vch-rec-${Date.now()}`,
          voucher_no: `VCH-REC-${Math.floor(1000 + Math.random() * 9000)}`,
          voucher_type: "Receipt Voucher",
          date: new Date().toISOString().split("T")[0],
          name: `Receipt for Rent Invoice ${invoiceNo}`,
          debit: "Bank Operating Account",
          debit_code: "12000001",
          credit: "Rental Revenue",
          credit_code: inv.account_code || "41100",
          amount: inv.amount,
          method: "Bank Transfer",
          status: "Posted"
        };
        setVouchers(v => [rv, ...v]);
        return { ...inv, status: "Paid" as const };
      }
      return inv;
    }));
    toast.success(`AR Invoice ${invoiceNo} marked as Collected.`);
  }

  function addLegalEscalation(esc: Omit<LegalReceivable, "id">) {
    const newLgl: LegalReceivable = {
      ...esc,
      id: `lgl-${Date.now()}`
    };
    setLegalReceivables(prev => [newLgl, ...prev]);
    toast.success(`Legal Case ${newLgl.legal_case_id} escalated and posted to Legal Receivables (12411).`);
  }

  function recoverLegalReceivable(
    caseId: string,
    amount: number,
    bankRef: string,
    paymentMethod: string = "Bank Transfer",
    propertyName?: string,
    unitRef?: string,
    tenantName?: string,
    details?: {
      date?: string;
      transactionNo?: string;
      chequeNo?: string;
      chequeBank?: string;
      maturityDate?: string;
    }
  ) {
    const isCash = paymentMethod.toLowerCase().includes("cash");
    const isCheque = paymentMethod.toLowerCase().includes("cheque");
    const isPdc = paymentMethod.toLowerCase().includes("pdc");
    const methodType = isCash ? "CASH" : isPdc ? "PDC" : "BANK";

    const entryDate = details?.date || new Date().toISOString().split("T")[0];
    const finalTenant = tenantName || "Valued Tenant";
    const finalUnit = unitRef || "General";
    const finalProp = propertyName || "Main Portfolio";
    const detailNarration = isCheque && details?.chequeNo ? ` [Cheque #${details.chequeNo} - ${details.chequeBank || "Bank"}]` : "";

    // 1. Update legal receivables balances
    setLegalReceivables(prev => prev.map(l => {
      if (l.legal_case_id === caseId || l.id === caseId) {
        const newBal = Math.max(0, l.outstanding_balance - amount);
        return {
          ...l,
          outstanding_balance: newBal,
          status: newBal <= 0 ? ("Fully Recovered" as const) : ("Partially Recovered" as const)
        };
      }
      return l;
    }));

    // 2. Add single local voucher entry if not already present
    const drCode = isCash ? "12100001" : isPdc ? "12900" : "12000001";
    const drAccount = isCash ? "Cash In Hand" : isPdc ? "PDC In Hand" : isCheque ? `Bank Account (${details?.chequeBank || "Bank"})` : "Bank Operating Account";

    const voucherNumber = `VCH-REC-${bankRef}`;
    setVouchers(prev => {
      if (prev.some(v => v.voucher_no === voucherNumber)) return prev;
      const rv: FinanceVoucher = {
        id: `vch-rec-lgl-${Date.now()}`,
        voucher_no: voucherNumber,
        voucher_type: "Receipt Voucher",
        date: entryDate,
        name: `Legal Settlement Recovery — ${finalTenant} (${finalUnit}) [${caseId}]${detailNarration}`,
        debit: drAccount,
        debit_code: drCode,
        credit: "Legal Receivables (12411)",
        credit_code: "12411",
        amount: amount,
        method: paymentMethod,
        status: "Posted",
        property_name: finalProp,
        unit_ref: finalUnit,
        tenant_name: finalTenant,
      };
      return [rv, ...prev];
    });

    // 3. Trigger authoritative posting engine in background
    void resolveAccountingAccounts({
      transactionType: 'LEGAL_RECOVERY',
      paymentMethod: methodType as any,
      propertyId: propertyName || "1",
      unitName: unitRef,
    }).then(({ debit: drAcct, credit: crAcct }) => {
      return postVoucher({
        voucher_date: entryDate,
        voucher_type: "Receipt",
        description: `Legal Settlement Recovery — ${finalTenant} (${finalUnit}) [${caseId}]${detailNarration}`,
        reference_no: bankRef,
        lines: [
          { account_code: drAcct.slCode, account_name: `${drAcct.glName} / ${drAcct.slName}`, debit: amount, credit: 0, description: drAcct.slName },
          { account_code: crAcct.slCode, account_name: `${crAcct.glName} / ${crAcct.slName}`, debit: 0, credit: amount, description: crAcct.slName },
        ],
      });
    }).catch(err => {
      console.warn("[FinanceStore] Legal recovery posting note:", err?.message);
    });

    toast.success(`Recovered QR ${amount.toLocaleString()} for Legal Case ${caseId}.`);
  }

  function addPayrollSync(run: Omit<PayrollSyncRun, "id" | "status">) {
    const newRun: PayrollSyncRun = {
      ...run,
      id: `pr-${Date.now()}`,
      status: "Posted",
      error_details: `Successfully mapped & posted net QR ${run.total_amount.toLocaleString()} from ${run.bank_account}`
    };
    setPayrollSyncs(prev => [newRun, ...prev]);

    // Post to General Ledger as Voucher
    const pv: FinanceVoucher = {
      id: `vch-pr-${Date.now()}`,
      voucher_no: `VCH-PAY-${run.payroll_run_id}`,
      voucher_type: "Payment Voucher",
      date: new Date().toISOString().split("T")[0],
      name: `Payroll Disbursement for Period ${run.period} - ${run.department}`,
      debit: "Staff Salaries & Allowances",
      debit_code: "50100",
      credit: "Bank Operating Account",
      credit_code: "12000001",
      amount: run.total_amount,
      method: "Bank Transfer",
      status: "Posted"
    };
    setVouchers(v => [pv, ...v]);
    toast.success(`Payroll Run ${run.payroll_run_id} synced & posted to General Ledger!`);
  }

  function addBankClearance(entry: Omit<BankClearanceEntry, "id">) {
    const newClr: BankClearanceEntry = {
      ...entry,
      id: `bc-${Date.now()}`
    };
    setBankClearances(prev => [newClr, ...prev]);
    toast.success(`Clearance recorded for ${newClr.ref}`);
  }

  function addBankReconciliation(rec: Omit<BankReconciliationRecord, "id">) {
    const newRec: BankReconciliationRecord = {
      ...rec,
      id: `br-${Date.now()}`
    };
    setBankReconciliations(prev => [newRec, ...prev]);
    toast.success(`Bank Reconciliation for ${newRec.statement_date} completed!`);
  }

  function addReconciliationStatement(stmt: Omit<ReconciliationStatementArchive, "id">) {
    const newStmt: ReconciliationStatementArchive = {
      ...stmt,
      id: `rs-${Date.now()}`
    };
    setReconciliationStatements(prev => [newStmt, ...prev]);
    toast.success(`Reconciliation Statement ${newStmt.title} archived.`);
  }

  function addCashBookEntry(entry: { date: string; voucher: string; description: string; type: "in" | "out"; amount: number }) {
    setCashBookEntries(prev => {
      const currentIn = prev.reduce((s, r) => s + (r.cash_in || 0), 0);
      const currentOut = prev.reduce((s, r) => s + (r.cash_out || 0), 0);
      const newTotalIn = currentIn + (entry.type === "in" ? entry.amount : 0);
      const newTotalOut = currentOut + (entry.type === "out" ? entry.amount : 0);
      const newBal = newTotalIn - newTotalOut;

      const newEntry: CashBookEntry = {
        id: `cb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: entry.date,
        voucher: entry.voucher,
        description: entry.description,
        cash_in: entry.type === "in" ? entry.amount : 0,
        cash_out: entry.type === "out" ? entry.amount : 0,
        balance: newBal
      };
      return [newEntry, ...prev];
    });
    toast.success("Cash Book entry recorded.");
  }

  function addPettyCashEntry(entry: Omit<PettyCashEntry, "id">) {
    const newPetty: PettyCashEntry = {
      ...entry,
      id: `pc-${Date.now()}`
    };
    setPettyCashEntries(prev => [newPetty, ...prev]);
    toast.success("Petty Cash expense recorded.");
  }

  // ── Real-Time Dynamic Reports Calculation Engine ───────────────────────────

  const allLedgerTransactions: LedgerTransaction[] = useMemo(() => {
    const list: LedgerTransaction[] = [];

        // Authoritative Official ERP Chart of Accounts Master Names Dictionary
    const COA_ACCOUNT_NAMES: Record<string, string> = {
      // ── Type 1: Assets ──
      "10000": "Assets Control Account",
      "12000": "Bank Accounts",
      "12000001": "Commercial Bank of Qatar (CBQ)",
      "12000002": "Al Ameen Dukhan Bank",
      "12000003": "Bank Operating Account (QNB)",
      "12000004": "Doha Bank Operating Account",
      "12000005": "Qatar Islamic Bank (QIB)",
      "12000006": "Al Ameen (Oryx) - Dukhan Bank",
      "12100": "Cash Accounts",
      "12100001": "Cash in Hand / Operating Cash",
      "12300001": "Advance to Vendors",
      "12400": "Receivables Control",
      "12411001": "Legal Receivables (Defaulted / Escalated)",
      "12413001": "Tenant Receivables",
      "12900001": "Rent PDC In Hand",
      "12900002": "Guarantee Cheque In Hand",
      "13000": "Fixed Assets Portfolio",
      "13900": "Accumulated Depreciation",

      // ── Type 2: Liabilities ──
      "20000": "Liabilities Control Account",
      "22100": "Trade Payables",
      "22100001": "Trade Payables - Vendors",
      "22100002": "Vendor Retention Payable",
      "21100001": "Reservation Advance Deposit",
      "21100003": "Kahramaa Utility Deposit",
      "21100004": "Qatar Cool Deposit",
      "21100005": "Service Fee Deposit",
      "21100006": "Guarantee Cheque Liability",
      "21200001": "Guarantee Cheque Received",
      "21300001": "Tenant Refund Payable",
      "21400001": "Customer PDC Liability",
      "21500001": "Security Deposit Liability",
      "21600001": "Utility Deposit Liability",

      // ── Type 3: Equity / Capital ──
      "30000": "Owner Capital & Equity",

      // ── Type 4: Revenue ──
      "40000": "Revenue Control Account",
      "41100001": "Rental Revenue",
      "41201001": "Parking Revenue",
      "41201002": "Agency & Admin Commission",
      "41201003": "Utility Recovery Income",
      "41201004": "CAM & Maintenance Recovery",
      "41201005": "Late Payment Penalty Revenue",
      "41201006": "Lease Transfer Fee Revenue",
      "41201007": "Cheque Dishonour Recovery",

      // ── Type 5: Expenditure (Direct Expenses 510) ──
      "51001": "Labour Outsource",
      "51001001": "CMEP-Labor Cost-Facilities Mgt",
      "51001002": "House Keeping Labor Cost",
      "51001003": "Security Staff Labor Cost",

      "51002": "Annual Maintenance Contract",
      "51002001": "CMEP-Facilities Mgt AMC",
      "51002002": "Swimming Pool Maintenance",
      "51002003": "CCTV AMC Charges",
      "51002004": "Landscaping AMC Charges",
      "51002005": "Fire Fighting AMC Charges",
      "51002006": "Fire Alarm AMC Charges",

      "51003": "Utilities & Other Direct Exp",
      "51003001": "Electricity & Water-Common Area",
      "51003002": "Electricity & Water-Vacant Period",
      "51003003": "Electricity & Water- Inclusive",
      "51003004": "Telephone & Internet Expenses",
      "51003005": "Master Community Charges",
      "51003006": "Common Area Maintenance Cost",

      "51004": "Repairs & Maintenance",
      "51004001": "Repair and Maintenance Cost",
      "51004002": "Bathtub, Kitchen Zinc & WC Charges",
      "51004003": "Sewage & Waste Removal Charges",
      "51004004": "Sweet Water Charges",
      "51004005": "Sports&Gym Equipment Maintenance",
      "51004006": "Cost of CMEP Materials",
      "51004007": "Cost of House Keeping Materials",
      "51004008": "Cost of Landscaping Material",
      "51004009": "Check Out Expenses",

      // ── Type 5: Expenditure (Indirect Expenses 511) ──
      "51101": "Staff Cost",
      "51101001": "Staff Basic Salary",
      "51101002": "Staff Accommodation Allowance",
      "51101003": "Staff Transportation Allowance",
      "51101004": "Staff Mobile & Telephone Allowance",
      "51101005": "Staff Overtime - Fixed",
      "51101006": "Staff Leave Salary",
      "51101007": "Staff Air Ticket",
      "51101008": "Staff End of Service Benefits",
      "51101009": "Staff Bonus",
      "51101010": "Staff Special Allowance",
      "51101011": "Staff Food Allowance",
      "51101012": "Staff Other Allowance",
      "51101013": "Staff Laundry Cost",
      "51101014": "Staff Medical & Insurance Cost",
      "51101015": "Staff Uniform Cost",
      "51101016": "Staff Visa & Immigration Cost",

      "51102": "General and Administrative Expenses",
      "51102001": "Vehicles & Other Insurance Expenses",
      "51102002": "Government & Municipal Charges",
      "51102003": "Legal Charges",
      "51102004": "Other General & Administration Expenses",
      "51102005": "Commission & Brokerage Expenses",
      "51102006": "Printing & Stationary Expenses",
      "51102007": "Subscription Fees",
      "51102008": "Audit Fees",
      "51102009": "Vehicle Hire Expenses",
      "51102010": "Vehicle Maintenance Cost",
      "51102011": "Miscellaneous Expense",
      "51102012": "Generator Maintenance Expenses",
      "51102013": "Brokerage Leasing",
      "51102014": "IT Expenses",
      "51102015": "Recruitment Charges",

      "51103": "Head office expenses",
      "51103001": "Head office expenses",

      "51104": "Selling and Marketing Expenses",
      "51104001": "Sales Promotion Expenses",
      "51104002": "Other Advertisement Expenses",

      "51105": "Finance Cost",
      "51105001": "Other Bank Charges",

      "51106": "Depreciation&Amortization",
      "51106001": "Machinery (Light) - Depreciation",
      "51106002": "Furniture & Fixtures - Depreciation",
      "51106003": "Office Equipment - Depreciation",
      "51106004": "Commercial Kitchen Equipment - Depreciation",
      "51106005": "Appliances - Depreciation",
      "51106006": "IT Software Amortization",
      "51106007": "Sports And Gym Equipment - Depreciation",
      "51106008": "Tools And Equipment - Depreciation",
      "51106009": "CCTV Systems - Depreciation",
      "51106010": "Access Control - Depreciation",
      "51106011": "Vehicles - Depreciation",
    };

    const getCoaName = (name: string | undefined, code: string | undefined, defaultFallback: string) => {
      const trimmedCode = (code || "").trim();
      // Always prefer the authoritative COA dictionary first — it is ground truth for account names.
      if (trimmedCode && COA_ACCOUNT_NAMES[trimmedCode]) return COA_ACCOUNT_NAMES[trimmedCode];
      const trimmedName = (name || "").trim();
      // Strip leading account-code prefix if present (e.g. "12000 - Bank Operating Account (QNB/CBQ)" → "Bank Operating Account (QNB/CBQ)")
      const strippedName = trimmedName.replace(/^\d{4,6}\s*[-–—]\s*/, "");
      if (strippedName && !/^\d+$/.test(strippedName) && strippedName !== trimmedCode) {
        return strippedName;
      }
      return defaultFallback;
    };

    // 1. Journal Ledger Entries
    journalEntries.forEach(je => {
      const isExpense = je.dr_code.startsWith("5");
      const isAsset = je.dr_code.startsWith("1");
      const isLiab = je.dr_code.startsWith("2");
      const isRev = je.dr_code.startsWith("4");

      // Extract / resolve tenant, unit, and property
      let derivedTenant = je.tenant_name;
      let derivedUnit = je.unit_ref;
      let derivedProperty = je.property_name;

      if ((!derivedTenant || derivedTenant === "Corporate / Admin") && je.narration) {
        // e.g. "Security Deposit reclassified as Refundable — Mr. Hafeez Shaik (AAA - Flat16)"
        // or "Refundable Deposit Settlement (Reservation Advance Deposit) — Vipind (Flat14)"
        // or "Security Deposit Receipt — Mr. Hafeez Shaik / AAA - Flat16 via Cash"
        const slashMatch = je.narration.match(/[—–\-]\s*([^(|—–\-/]+?)\s*\/\s*([^(|—–\-/]+)/);
        if (slashMatch && slashMatch[1]?.trim() && slashMatch[1].trim() !== "Tenant") {
          derivedTenant = slashMatch[1].trim();
          if (!derivedUnit || derivedUnit === "General") derivedUnit = slashMatch[2].trim().replace(/\s+via.*$/i, "");
        } else {
          const parenMatch = je.narration.match(/[—–\-]\s*([^(|—–\-]+?)\s*\(([^)]+)\)/);
          if (parenMatch && parenMatch[1]?.trim() && parenMatch[1].trim() !== "Tenant") {
            derivedTenant = parenMatch[1].trim();
            if (!derivedUnit || derivedUnit === "General") derivedUnit = parenMatch[2].trim();
          } else {
            const dashMatch = je.narration.match(/[—–\-]\s*([^|—–\-]+)/);
            if (dashMatch && dashMatch[1]?.trim() && dashMatch[1].trim() !== "Tenant") {
              const cand = dashMatch[1].trim();
              if (cand.startsWith("Flat") || cand.startsWith("AAA") || cand.includes("Unit")) {
                if (!derivedUnit || derivedUnit === "General") derivedUnit = cand;
              } else {
                derivedTenant = cand;
              }
            }
          }
        }
      }

      // Unit to property map fallback
      if ((!derivedProperty || derivedProperty === "Main Portfolio" || derivedProperty === "Unassigned") && derivedUnit) {
        const u = derivedUnit.toLowerCase();
        if (u.includes("flat16") || u.includes("aaa")) {
          derivedProperty = "Old Salata - Residence No:23";
        } else if (u.includes("flat14") || u.includes("flat08") || u.includes("bldg06") || u.includes("mansoura")) {
          derivedProperty = "MANSOURA - BLDG06";
        } else if (u.includes("002") || u.includes("neeman")) {
          derivedProperty = "Neeman's New Building";
        }
      }

      if (derivedTenant && derivedTenant.toLowerCase().includes("ashutosh")) {
        if (!derivedProperty || derivedProperty === "Main Portfolio" || derivedProperty === "Unassigned") {
          derivedProperty = "MANSOURA - BLDG06";
        }
        if (!derivedUnit || derivedUnit === "General" || derivedUnit === "Unassigned") {
          derivedUnit = "Flat14";
        }
      }

      const finalProperty = derivedProperty && derivedProperty !== "Main Portfolio" ? derivedProperty : "Unassigned";
      const finalUnit = derivedUnit && derivedUnit !== "General" ? derivedUnit : "Unassigned";
      const finalTenant = derivedTenant && derivedTenant !== "Corporate / Admin" ? derivedTenant : "Unassigned";

      list.push({
        id: `tx-je-dr-${je.id}`,
        date: je.posting_date,
        account_code: je.dr_code,
        account_name: getCoaName(je.dr_account, je.dr_code, "Operating Account"),
        account_type: isExpense ? "Expenses" : isAsset ? "Assets" : isLiab ? "Liabilities" : isRev ? "Revenue" : "Assets",
        reference: je.je_no,
        debit: je.amount,
        credit: 0,
        source: "Journal Ledger",
        description: je.narration,
        property_name: finalProperty,
        unit_ref: finalUnit,
        tenant_name: finalTenant,
      });

      const isCrRev = je.cr_code.startsWith("4");
      const isCrLiab = je.cr_code.startsWith("2");
      const isCrAsset = je.cr_code.startsWith("1");
      const isCrExp = je.cr_code.startsWith("5");

      list.push({
        id: `tx-je-cr-${je.id}`,
        date: je.posting_date,
        account_code: je.cr_code,
        account_name: getCoaName(je.cr_account, je.cr_code, "Operating Account"),
        account_type: isCrRev ? "Revenue" : isCrLiab ? "Liabilities" : isCrAsset ? "Assets" : isCrExp ? "Expenses" : "Capital",
        reference: je.je_no,
        debit: 0,
        credit: je.amount,
        source: "Journal Ledger",
        description: je.narration,
        property_name: finalProperty,
        unit_ref: finalUnit,
        tenant_name: finalTenant,
      });
    });

    // 2. GRN Mappings (Expense / Asset Dr, AP Cr)
    grnMappings.forEach(grn => {
      list.push({
        id: `tx-grn-dr-${grn.id}`,
        date: "2026-08-18",
        account_code: grn.mapped_code || "51004001",
        account_name: getCoaName(grn.mapped_gl, grn.mapped_code, "Repairs & Maintenance"),
        account_type: grn.mapped_code?.startsWith("1") ? "Assets" : "Expenses",
        reference: grn.grn_no,
        debit: grn.amount,
        credit: 0,
        source: "GRN Cost Mapping",
        description: `${grn.vendor} - ${grn.description}`,
        property_name: grn.property || "Unassigned",
        unit_ref: "Facility Plant & Equip",
        tenant_name: grn.vendor,
      });
      list.push({
        id: `tx-grn-cr-${grn.id}`,
        date: "2026-08-18",
        account_code: "22100001",
        account_name: "Accounts Payable",
        account_type: "Liabilities",
        reference: grn.grn_no,
        debit: 0,
        credit: grn.amount,
        source: "GRN Cost Mapping",
        description: `Payable to ${grn.vendor}`,
        property_name: grn.property || "Unassigned",
        unit_ref: "Facility Plant & Equip",
        tenant_name: grn.vendor,
      });
    });

    // 3. Payable Invoices (Expense Dr, AP Cr)
    payableInvoices.forEach(ap => {
      list.push({
        id: `tx-ap-dr-${ap.id}`,
        date: ap.date,
        account_code: ap.account_code || "51004001",
        account_name: getCoaName(ap.account, ap.account_code, "Repairs & Maintenance"),
        account_type: "Expenses",
        reference: ap.invoice_no,
        debit: ap.amount,
        credit: 0,
        source: "Payable Invoice",
        description: `Invoice from ${ap.vendor}`,
        property_name: "Unassigned",
        unit_ref: "Building Maintenance",
        tenant_name: ap.vendor,
      });
      list.push({
        id: `tx-ap-cr-${ap.id}`,
        date: ap.date,
        account_code: "22100001",
        account_name: "Accounts Payable",
        account_type: "Liabilities",
        reference: ap.invoice_no,
        debit: 0,
        credit: ap.amount,
        source: "Payable Invoice",
        description: `Payable to ${ap.vendor}`,
        property_name: "Unassigned",
        unit_ref: "Building Maintenance",
        tenant_name: ap.vendor,
      });
    });

    // 4. Vouchers (Journal, Payment, Receipt)
    vouchers.forEach(vch => {
      const vchNo = (vch.voucher_no || "").toUpperCase();
      const vchDesc = (vch.name || "").toLowerCase();
      const vchUnit = (vch.unit_ref || "").toUpperCase();

      // Purge/exclude test transactions for OA22-10 / OA24-10 / Cheque 35
      if (
        vchNo.includes("TRF-35") ||
        vchNo.includes("TRF-CNL-35") ||
        vchUnit.includes("OA22-10") ||
        vchUnit.includes("OA24-10") ||
        vchDesc.includes("oa22-10") ||
        vchDesc.includes("oa24-10") ||
        vchDesc.includes("devadas melitta") ||
        vchDesc.includes("devadas pappu")
      ) {
        return;
      }

      let debitCode = vch.debit_code || "12000001";
      let debitName = vch.debit || "Bank Operating Account";
      let creditCode = vch.credit_code || "12413";
      let creditName = vch.credit || "Tenant Receivables";

      // CRITICAL GUARD: PDC cancellation or bank transfer replacement must NEVER hit Rental Revenue (41100).
      // Leg 1 (VCH-TRF): Receiving Bank Account (DR) / Tenant Receivables (CR 12413)
      // Leg 2 (VCH-TRF-CNL): Customer PDC Liability (DR 21400) / PDC In Hand (CR 12900)
      if (vchNo.startsWith("VCH-TRF-CNL-") || vchDesc.includes("pdc cancelled") || vchDesc.includes("returned on bank transfer")) {
        debitCode = "21400";
        debitName = "Customer PDC Liability";
        creditCode = "12900";
        creditName = "PDC In Hand";
      } else if (vchNo.startsWith("VCH-TRF-") || vchDesc.includes("bank transfer received in place of pdc") || vchDesc.includes("bank transfer settlement")) {
        if (!debitCode || debitCode === "41100") debitCode = "12000001";
        if (!debitName || debitName.includes("Revenue")) debitName = "Bank Operating Account";
        creditCode = "12413";
        creditName = "Tenant Receivables";
      }

      const isDrExp = debitCode.startsWith("5");
      const isDrAsset = debitCode.startsWith("1");
      const isDrLiab = debitCode.startsWith("2");

      let propName = (vch as any).property_name || (vch as any).property;
      let unitName = (vch as any).unit_ref || (vch as any).unit;
      let tenantName = (vch as any).tenant_name || (vch as any).tenant;

      // Only attempt regex extraction from the voucher name when the fields are truly empty.
      // Do NOT override already-populated values (e.g. from PDC synthesis) with fallback strings.
      const hasProp   = propName   && propName   !== "Main Portfolio" && propName   !== "Unassigned";
      const hasUnit   = unitName   && unitName   !== "General"        && unitName   !== "Unassigned";
      const hasTenant = tenantName && tenantName !== "Corporate / Admin" && tenantName !== "Tenant" && tenantName !== "Unassigned";

      if (!hasTenant && vch.name) {
        const trfPdcMatch = vch.name.match(/(?:Bank Transfer|PDC Cancelled).*?[-–]\s*\w+\s*\((.*?)\s*[-–]\s*(.*?)\)/i);
        if (trfPdcMatch) {
          tenantName = trfPdcMatch[1].trim();
          if (!hasUnit) unitName = trfPdcMatch[2].trim();
          if (!hasProp && unitName.includes("-")) propName = unitName.split("-")[0].trim();
        } else {
          const slashMatch = vch.name.match(/[—–\-]\s*([^(|—–\-/]+?)\s*\/\s*([^(|—–\-/]+)/);
          if (slashMatch && slashMatch[1]?.trim() && slashMatch[1].trim() !== "Tenant") {
            tenantName = slashMatch[1].trim();
            if (!hasUnit) unitName = slashMatch[2].trim();
          } else {
            const parenMatch = vch.name.match(/[—–\-]\s*([^(|—–\-]+?)\s*\(([^)]+)\)/);
            if (parenMatch && parenMatch[1]?.trim() && parenMatch[1].trim() !== "Tenant") {
              if (/^\d+$/.test(parenMatch[1].trim()) && parenMatch[2].includes("-")) {
                const parts = parenMatch[2].split("-");
                tenantName = parts[0].trim();
                if (!hasUnit) unitName = parts.slice(1).join("-").trim();
              } else {
                tenantName = parenMatch[1].trim();
                if (!hasUnit) unitName = parenMatch[2].trim();
              }
            } else {
              const dashMatch = vch.name.match(/[—–\-]\s*([^|—–\-[\]]+)/);
              if (dashMatch && dashMatch[1]?.trim() && dashMatch[1].trim() !== "Tenant") {
                tenantName = dashMatch[1].trim();
              }
            }
          }
        }
      }

      if (!hasProp && unitName) {
        const u = unitName.toLowerCase();
        if (u.includes("flat16") || u.includes("aaa")) propName = "Old Salata - Residence No:23";
        else if (u.includes("flat14") || u.includes("flat08") || u.includes("mansoura")) propName = "MANSOURA - BLDG06";
        else if (u.includes("002") || u.includes("neeman")) propName = "Neeman's New Building";
        else if (unitName.includes("-")) propName = unitName.split("-")[0].trim();
        else if (!hasProp && propName) propName = propName; // keep existing
      }

      if (tenantName && tenantName.toLowerCase().includes("ashutosh")) {
        if (!hasProp) propName = "MANSOURA - BLDG06";
        if (!hasUnit) unitName = "Flat14";
      }

      // Finalise — use real values if available, generic fallback only when truly unknown
      const finalProp   = propName   || (vch.name.includes("Depreciation") ? "Main Portfolio (Corporate)" : "");
      const finalUnit   = unitName   || (vch.name.includes("Depreciation") ? "Fixed Assets / Depr"       : "");
      const finalTenant = tenantName || (vch.name.includes("Depreciation") ? "Internal Assets Desk"       : "");

      list.push({
        id: `tx-vch-dr-${vch.id}`,
        date: vch.date,
        account_code: debitCode,
        account_name: getCoaName(debitName, debitCode, "Bank Operating Account"),
        account_type: isDrExp ? "Expenses" : isDrAsset ? "Assets" : isDrLiab ? "Liabilities" : "Assets",
        reference: vch.voucher_no,
        debit: vch.amount,
        credit: 0,
        source: vch.voucher_type,
        description: vch.name,
        property_name: finalProp,
        unit_ref: finalUnit,
        tenant_name: finalTenant,
      });

      const isCrRev = creditCode.startsWith("4");
      const isCrAsset = creditCode.startsWith("1");
      const isCrLiab = creditCode.startsWith("2");

      list.push({
        id: `tx-vch-cr-${vch.id}`,
        date: vch.date,
        account_code: creditCode,
        account_name: getCoaName(creditName, creditCode, "Tenant Receivables"),
        account_type: isCrRev ? "Revenue" : isCrAsset ? "Assets" : isCrLiab ? "Liabilities" : "Capital",
        reference: vch.voucher_no,
        debit: 0,
        credit: vch.amount,
        source: vch.voucher_type,
        description: vch.name,
        property_name: finalProp,
        unit_ref: finalUnit,
        tenant_name: finalTenant,
      });
    });

    // 5. Receivable Invoices (AR Dr, Revenue Cr)
    receivableInvoices.forEach(ar => {
      list.push({
        id: `tx-ar-dr-${ar.id}`,
        date: ar.date,
        account_code: "12413",
        account_name: "Tenant Receivables",
        account_type: "Assets",
        reference: ar.invoice_no,
        debit: ar.amount,
        credit: 0,
        source: "Receivable Invoice",
        description: `Rent Invoice for ${ar.tenant}`,
        property_name: ar.property,
        unit_ref: ar.unit,
        tenant_name: ar.tenant,
      });
      list.push({
        id: `tx-ar-cr-${ar.id}`,
        date: ar.date,
        account_code: ar.account_code || "41100",
        account_name: "Rental Revenue",
        account_type: "Revenue",
        reference: ar.invoice_no,
        debit: 0,
        credit: ar.amount,
        source: "Receivable Invoice",
        description: `${ar.stream} - ${ar.tenant}`,
        property_name: ar.property,
        unit_ref: ar.unit,
        tenant_name: ar.tenant,
      });
    });

    // 6. Legal Receivables (Legal Rec 12411 Dr, Tenant Rec 12413 Cr)
    legalReceivables.forEach(lgl => {
      list.push({
        id: `tx-lgl-dr-${lgl.id}`,
        date: lgl.escalation_date,
        account_code: "12411",
        account_name: "Legal Receivables (Defaulted)",
        account_type: "Assets",
        reference: lgl.legal_case_id,
        debit: lgl.original_amount,
        credit: 0,
        source: "Legal Receivables",
        description: `Legal Escalation: ${lgl.tenant_name}`,
        property_name: lgl.property_name,
        unit_ref: lgl.unit_ref,
        tenant_name: lgl.tenant_name,
      });
      list.push({
        id: `tx-lgl-cr-${lgl.id}`,
        date: lgl.escalation_date,
        account_code: "12413",
        account_name: "Tenant Receivables",
        account_type: "Assets",
        reference: lgl.legal_case_id,
        debit: 0,
        credit: lgl.original_amount,
        source: "Legal Receivables",
        description: `Transferred to Legal: ${lgl.tenant_name}`,
        property_name: lgl.property_name,
        unit_ref: lgl.unit_ref,
        tenant_name: lgl.tenant_name,
      });
    });

    // 7. Bank Clearances (Cleared: DR 12000 Bank Operating / CR 12900 PDC In Hand or AP)
    bankClearances.forEach(clr => {
      if (clr.status === "Cleared") {
        const isUtilityOrPayment = clr.type.toLowerCase().includes("utility") || clr.type.toLowerCase().includes("transfer") || clr.type.toLowerCase().includes("payment");
        const drCode = isUtilityOrPayment ? "22100001" : "12000001";
        const drName = isUtilityOrPayment ? "Accounts Payable (Utility/Disbursement)" : "Bank Operating Account (Cleared Funds)";
        const crCode = isUtilityOrPayment ? "12000001" : "12900";
        const crName = isUtilityOrPayment ? "Bank Operating Account" : "PDC In Hand / Cheques Held";

        list.push({
          id: `tx-clr-dr-${clr.id}`,
          date: clr.date,
          account_code: drCode,
          account_name: drName,
          account_type: isUtilityOrPayment ? "Liabilities" : "Assets",
          reference: clr.ref,
          debit: clr.amount,
          credit: 0,
          source: "Bank Clearance",
          description: `Bank Clearance for ${clr.ref} (${clr.bank})`,
          property_name: "Corporate Treasury",
          unit_ref: "Bank Operations",
          tenant_name: clr.bank,
        });

        list.push({
          id: `tx-clr-cr-${clr.id}`,
          date: clr.date,
          account_code: crCode,
          account_name: crName,
          account_type: isUtilityOrPayment ? "Assets" : "Assets",
          reference: clr.ref,
          debit: 0,
          credit: clr.amount,
          source: "Bank Clearance",
          description: `Bank Clearance for ${clr.ref} (${clr.bank})`,
          property_name: "Corporate Treasury",
          unit_ref: "Bank Operations",
          tenant_name: clr.bank,
        });
      }
    });

    // Sort ascending by date (oldest first)
    return list.sort((a, b) => new Date(a.date || "").getTime() - new Date(b.date || "").getTime());
  }, [journalEntries, grnMappings, payableInvoices, vouchers, receivableInvoices, legalReceivables, bankClearances]);

  // Full Chart of Accounts — every GL account in the PMS, used to seed the
  // Trial Balance so zero-balance accounts are always visible.
  const FULL_COA: { code: string; name: string; type: "Assets" | "Liabilities" | "Capital" | "Revenue" | "Expenses" }[] = [
    // ── 1000x Assets ──────────────────────────────────────────────────────────
    { code: "12000001", name: "Commercial Bank of Qatar (CBQ)", type: "Assets" },
    { code: "12000002", name: "Al Ameen Dukhan Bank", type: "Assets" },
    { code: "12000003", name: "Bank Operating Account (QNB)", type: "Assets" },
    { code: "12000004", name: "Doha Bank Operating Account", type: "Assets" },
    { code: "12000005", name: "Qatar Islamic Bank (QIB)", type: "Assets" },
    { code: "12000006", name: "Al Ameen (Oryx) - Dukhan Bank", type: "Assets" },
    { code: "12100001", name: "Cash In Hand", type: "Assets" },
    { code: "12100002", name: "Petty Cash", type: "Assets" },
    { code: "12413",    name: "Tenant Receivables (Control)", type: "Assets" },
    { code: "12413001", name: "Tenant Receivables — Unit SL", type: "Assets" },
    { code: "12414",    name: "Legal Receivables", type: "Assets" },
    { code: "12900",    name: "PDC In Hand (Control)", type: "Assets" },
    { code: "12900001", name: "Rent PDC In Hand", type: "Assets" },
    { code: "12900002", name: "Deposit PDC In Hand", type: "Assets" },
    { code: "13100",    name: "Prepaid Expenses", type: "Assets" },
    { code: "13200",    name: "VAT Recoverable (Input Tax)", type: "Assets" },
    { code: "14100",    name: "Fixed Assets — Buildings", type: "Assets" },
    { code: "14200",    name: "Fixed Assets — Furniture & Fixtures", type: "Assets" },
    { code: "14300",    name: "Fixed Assets — Office Equipment", type: "Assets" },
    { code: "14900",    name: "Accumulated Depreciation", type: "Assets" },
    { code: "15100",    name: "CWIP — Construction in Progress", type: "Assets" },
    // ── 2000x Liabilities ────────────────────────────────────────────────────
    { code: "21100",    name: "Refundable Deposit Liability (Control)", type: "Liabilities" },
    { code: "21100001", name: "Reservation Advance Deposit", type: "Liabilities" },
    { code: "21100002", name: "Admin Charges Liability", type: "Liabilities" },
    { code: "21100003", name: "Qatar Cool Deposit Liability", type: "Liabilities" },
    { code: "21100004", name: "Kahramaa Deposit Liability", type: "Liabilities" },
    { code: "21100005", name: "Service Fee Deposit Liability", type: "Liabilities" },
    { code: "21200",    name: "Guarantee Cheque Liability", type: "Liabilities" },
    { code: "21200001", name: "Guarantee Cheque Liability — Unit SL", type: "Liabilities" },
    { code: "21300",    name: "Accounts Payable (Control)", type: "Liabilities" },
    { code: "21300001", name: "Vendor Payable — Trade", type: "Liabilities" },
    { code: "21400",    name: "Customer PDC Liability (Control)", type: "Liabilities" },
    { code: "21400001", name: "Customer PDC Liability — Unit SL", type: "Liabilities" },
    { code: "21500",    name: "Security Deposit Liability (Control)", type: "Liabilities" },
    { code: "21500001", name: "Security Deposit Liability — Unit SL", type: "Liabilities" },
    { code: "22100001", name: "Accounts Payable / Expense Accrual", type: "Liabilities" },
    { code: "22200",    name: "VAT Payable (Output Tax)", type: "Liabilities" },
    { code: "22300",    name: "Payroll Payable", type: "Liabilities" },
    { code: "22400",    name: "Unclaimed Deposits", type: "Liabilities" },
    { code: "22500",    name: "Advance Rent Received", type: "Liabilities" },
    // ── 3000x Capital / Equity ───────────────────────────────────────────────
    { code: "31000",    name: "Owner / Investor Capital", type: "Capital" },
    { code: "31100",    name: "Retained Earnings", type: "Capital" },
    { code: "31200",    name: "Current Year Net Profit", type: "Capital" },
    { code: "31300",    name: "Owner Drawings", type: "Capital" },
    // ── 4000x Revenue ────────────────────────────────────────────────────────
    { code: "41100",    name: "Rental Revenue", type: "Revenue" },
    { code: "41200",    name: "Parking Revenue", type: "Revenue" },
    { code: "41300",    name: "Utility Recovery Income", type: "Revenue" },
    { code: "41400",    name: "Agency Commission Income", type: "Revenue" },
    { code: "41500",    name: "Admin Fee Income", type: "Revenue" },
    { code: "41600",    name: "Late Payment Penalty Income", type: "Revenue" },
    { code: "41700",    name: "Lease Transfer Fee Income", type: "Revenue" },
    { code: "41800",    name: "Reservation Forfeiture Income", type: "Revenue" },
    { code: "41900",    name: "Other Income / Miscellaneous", type: "Revenue" },
    // ── 5000x Expenses ───────────────────────────────────────────────────────
    { code: "52100001", name: "Building Maintenance Expense", type: "Expenses" },
    { code: "52100002", name: "Electrical Works Expense", type: "Expenses" },
    { code: "52100003", name: "Plumbing Works Expense", type: "Expenses" },
    { code: "52100004", name: "Civil Works Expense", type: "Expenses" },
    { code: "52100005", name: "HVAC / AC Maintenance Expense", type: "Expenses" },
    { code: "52100006", name: "Landscaping Expense", type: "Expenses" },
    { code: "52100007", name: "Cleaning Services Expense", type: "Expenses" },
    { code: "52100008", name: "General Maintenance Expense", type: "Expenses" },
    { code: "52200",    name: "Utilities Expense", type: "Expenses" },
    { code: "52300",    name: "Payroll / Salaries Expense", type: "Expenses" },
    { code: "52400",    name: "Management Fee Expense", type: "Expenses" },
    { code: "52500",    name: "Bank Charges Expense", type: "Expenses" },
    { code: "52600",    name: "Depreciation Expense", type: "Expenses" },
    { code: "52700",    name: "Legal & Professional Fees", type: "Expenses" },
    { code: "52800",    name: "Insurance Expense", type: "Expenses" },
    { code: "52900",    name: "Cheque Dishonour Charges", type: "Expenses" },
    { code: "53000",    name: "Rent Discount / Waiver Expense", type: "Expenses" },
    { code: "53100",    name: "Vendor Advance Applied", type: "Expenses" },
    { code: "53200",    name: "Other Operating Expenses", type: "Expenses" },
  ];

  // Derived Trial Balance Detailed — seeded from full COA so zero-balance
  // accounts always appear, then overlaid with actual transaction totals.
  const trialBalanceDetailed = useMemo(() => {
    // 1. Seed map with every account in the COA at zero debit/credit
    const map = new Map<string, { code: string; name: string; type: "Assets" | "Liabilities" | "Capital" | "Revenue" | "Expenses"; debit: number; credit: number }>();
    FULL_COA.forEach(acct => {
      map.set(acct.code, { code: acct.code, name: acct.name, type: acct.type, debit: 0, credit: 0 });
    });

    // 2. Overlay actual ledger transaction totals (adds accounts not in static COA too)
    allLedgerTransactions.forEach(tx => {
      const existing = map.get(tx.account_code) || {
        code: tx.account_code,
        name: tx.account_name,
        type: tx.account_type,
        debit: 0,
        credit: 0
      };
      existing.debit += (tx.debit || 0);
      existing.credit += (tx.credit || 0);
      map.set(tx.account_code, existing);
    });

    return Array.from(map.values()).map(a => ({
      ...a,
      balance: a.debit - a.credit
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLedgerTransactions]);

  // Derived Trial Balance Summary — 100% computed by grouping account-level balances from trialBalanceDetailed
  const trialBalanceSummary = useMemo(() => {
    let assetsDr = 0;
    let liabilitiesCr = 0;
    let capitalCr = 0;
    let revenueCr = 0;
    let expensesDr = 0;

    trialBalanceDetailed.forEach(acc => {
      const netDr = acc.debit - acc.credit;
      const netCr = acc.credit - acc.debit;

      if (acc.type === "Assets") {
        assetsDr += netDr;
      } else if (acc.type === "Liabilities") {
        liabilitiesCr += netCr;
      } else if (acc.type === "Capital") {
        capitalCr += netCr;
      } else if (acc.type === "Revenue") {
        revenueCr += netCr;
      } else if (acc.type === "Expenses") {
        expensesDr += netDr;
      }
    });

    const totalDebit = (assetsDr > 0 ? assetsDr : 0) + (expensesDr > 0 ? expensesDr : 0) + (liabilitiesCr < 0 ? -liabilitiesCr : 0) + (capitalCr < 0 ? -capitalCr : 0) + (revenueCr < 0 ? -revenueCr : 0);
    const totalCredit = (liabilitiesCr > 0 ? liabilitiesCr : 0) + (capitalCr > 0 ? capitalCr : 0) + (revenueCr > 0 ? revenueCr : 0) + (assetsDr < 0 ? -assetsDr : 0) + (expensesDr < 0 ? -expensesDr : 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    return {
      assets: assetsDr,
      liabilities: liabilitiesCr,
      capital: capitalCr,
      revenue: revenueCr,
      expenses: expensesDr,
      totalDebit,
      totalCredit,
      isBalanced
    };
  }, [trialBalanceDetailed]);

  // Derived Profit & Loss — 100% computed from allLedgerTransactions
  const profitAndLossReport = useMemo(() => {
    let rentalRevenue = 0;
    let otherRevenue = 0;
    let maintenanceExpense = 0;
    let payrollExpense = 0;
    let utilitiesExpense = 0;
    let cleaningExpense = 0;
    let totalRevenue = 0;
    let totalExpenses = 0;

    allLedgerTransactions.forEach(tx => {
      if (tx.account_type === "Revenue") {
        const netRev = (tx.credit || 0) - (tx.debit || 0);
        totalRevenue += netRev;
        // 41100xxx = Rental Revenue, 41201xxx+ = Other Revenue
        if (tx.account_code.startsWith("411")) rentalRevenue += netRev;
        else otherRevenue += netRev;
      } else if (tx.account_type === "Expenses") {
        const netExp = (tx.debit || 0) - (tx.credit || 0);
        totalExpenses += netExp;
        // 51101xxx = Staff Cost / Payroll
        if (tx.account_code.startsWith("51101")) payrollExpense += netExp;
        // 51003xxx = Utilities & Other Direct Exp
        else if (tx.account_code.startsWith("51003")) utilitiesExpense += netExp;
        // 51004007 = Housekeeping Materials, 51002002 = Pool AMC → Cleaning
        else if (
          tx.account_code === "51004007" ||
          tx.account_code === "51001002" ||
          tx.account_code === "51002002"
        ) cleaningExpense += netExp;
        // 51001xxx = Labour Outsource, 51002xxx = AMC, 51004xxx = R&M, 51102xxx = G&A, 51103-51106 = Other
        else maintenanceExpense += netExp;
      }
    });

    const netProfit = totalRevenue - totalExpenses;

    return {
      rentalRevenue,
      otherRevenue,
      totalRevenue,
      maintenanceExpense,
      payrollExpense,
      utilitiesExpense,
      cleaningExpense,
      totalExpenses,
      netProfit
    };
  }, [allLedgerTransactions]);

  // Derived Balance Sheet — 100% computed from allLedgerTransactions & P&L
  const balanceSheetReport = useMemo(() => {
    let bankCashAssets = 0;
    let pdcInHandAssets = 0;
    let arReceivablesAssets = 0;
    let legalReceivablesAssets = 0;
    let fixedAssets = 0;
    let totalAssets = 0;

    let apLiabilities = 0;
    let securityDepositLiabilities = 0;
    let pdcCustomerLiabilities = 0;
    let totalLiabilities = 0;
    let ownerCapital = 0;

    allLedgerTransactions.forEach(tx => {
      if (tx.account_type === "Assets") {
        const netAsset = (tx.debit || 0) - (tx.credit || 0);
        totalAssets += netAsset;
        // 12000001 = Bank Operating (QNB), 12000002 = CBQ Escrow, 12100001 = Cash in Hand
        if (
          tx.account_code.startsWith("121") ||
          tx.account_code.startsWith("12000") ||
          tx.account_code === "10000"
        ) bankCashAssets += netAsset;
        // 12900001 = Rent PDC In Hand, 12900002 = Guarantee Cheque In Hand
        else if (tx.account_code.startsWith("129")) pdcInHandAssets += netAsset;
        // 12411001 = Legal Receivables
        else if (tx.account_code.startsWith("12411")) legalReceivablesAssets += netAsset;
        // 12413001 = Tenant Receivables, 12300001 = Advance to Vendors, 12400 = Receivables Control
        else if (tx.account_code.startsWith("124") || tx.account_code.startsWith("123")) arReceivablesAssets += netAsset;
        // 13000 = Fixed Assets, 13900 = Accumulated Depreciation
        else if (tx.account_code.startsWith("13")) fixedAssets += netAsset;
        else bankCashAssets += netAsset; // fallback to bank/cash bucket
      } else if (tx.account_type === "Liabilities") {
        const netLiab = (tx.credit || 0) - (tx.debit || 0);
        totalLiabilities += netLiab;
        // 22100xxx = Trade Payables / AP
        if (tx.account_code.startsWith("221")) apLiabilities += netLiab;
        // 21400001 = Customer PDC Liability
        else if (tx.account_code.startsWith("214")) pdcCustomerLiabilities += netLiab;
        // 21500001 = Security Deposit, 21100xxx = Reservation / Utility Deposits, 21100006 = Guarantee Cheque Liability
        else if (
          tx.account_code.startsWith("215") ||
          tx.account_code.startsWith("211") ||
          tx.account_code.startsWith("213")
        ) securityDepositLiabilities += netLiab;
        // Other liabilities default to AP bucket
        else apLiabilities += netLiab;
      } else if (tx.account_type === "Capital") {
        ownerCapital += ((tx.credit || 0) - (tx.debit || 0));
      }
    });

    const netProfit = profitAndLossReport.netProfit;
    const totalEquity = ownerCapital + netProfit;
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    return {
      bankCashAssets,
      pdcInHandAssets,
      arReceivablesAssets,
      legalReceivablesAssets,
      fixedAssets,
      totalAssets,

      apLiabilities,
      securityDepositLiabilities,
      pdcCustomerLiabilities,
      totalLiabilities,

      ownerCapital,
      retainedNetProfit: netProfit,
      totalEquity,
      totalLiabilitiesAndEquity,
      isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01
    };
  }, [allLedgerTransactions, profitAndLossReport]);


  // Derived Cash Flow Report — calculated only from posted ledger transactions.
  const cashFlowReport = useMemo(() => {
    const CASH_CODES = new Set(["10100", "12000001", "12001", "12100001"]);
    let operatingInflow = 0;
    let operatingOutflow = 0;
    let investingCash = 0;
    let financingCash = 0;

    const byReference = new Map<string, LedgerTransaction[]>();
    allLedgerTransactions.forEach(tx => {
      const bucket = byReference.get(tx.reference) || [];
      bucket.push(tx);
      byReference.set(tx.reference, bucket);
    });

    byReference.forEach(lines => {
      const cashLines = lines.filter(tx => CASH_CODES.has(tx.account_code));
      if (!cashLines.length) return;
      const narration = lines.map(tx => tx.description || "").join(" ").toLowerCase();
      // Transfers between cash/bank accounts are not cash-flow activity.
      const nonCash = lines.filter(tx => !CASH_CODES.has(tx.account_code));
      if (!nonCash.length) return;

      const cashNet = cashLines.reduce((sum, tx) => sum + (tx.debit || 0) - (tx.credit || 0), 0);
      if (Math.abs(cashNet) < 0.005) return;

      // A PDC deposit is a movement from PDC custody to bank, not a new customer cash receipt.
      if (narration.includes("pdc deposited")) return;

      const hasFixedAsset = nonCash.some(tx => tx.account_code.startsWith("13"));
      const hasCapital = nonCash.some(tx => tx.account_code.startsWith("3"));
      if (hasFixedAsset) investingCash += cashNet;
      else if (hasCapital) financingCash += cashNet;
      else if (cashNet > 0) operatingInflow += cashNet;
      else operatingOutflow += Math.abs(cashNet);
    });

    const netOperatingCash = operatingInflow - operatingOutflow;
    const netCashChange = netOperatingCash + investingCash + financingCash;
    const endingCashBalance = allLedgerTransactions
      .filter(tx => CASH_CODES.has(tx.account_code))
      .reduce((sum, tx) => sum + (tx.debit || 0) - (tx.credit || 0), 0);

    return { operatingInflow, operatingOutflow, netOperatingCash, investingCash, financingCash, netCashChange, endingCashBalance };
  }, [allLedgerTransactions]);

  // Derived Cash On Hand Position — no fabricated opening balances or minimum floors.
  const cashOnHandPosition = useMemo(() => {
    const CASH_ON_HAND_CODES = new Set(["10100", "12100001"]);
    const PETTY_CASH_CODES = new Set(["12101", "12102"]);
    let vaultCash = 0;
    let pettyCashFloat = 0;
    allLedgerTransactions.forEach(tx => {
      const net = (tx.debit || 0) - (tx.credit || 0);
      if (CASH_ON_HAND_CODES.has(tx.account_code)) vaultCash += net;
      if (PETTY_CASH_CODES.has(tx.account_code)) pettyCashFloat += net;
    });
    return { vaultCash, pettyCashFloat, siteDesks: 0, totalCashOnHand: vaultCash + pettyCashFloat };
  }, [allLedgerTransactions]);

  return (
    <FinanceContext.Provider
      value={{
        journalEntries,
        addJournalEntry,
        grnMappings,
        addGrnMapping,
        payableInvoices,
        addPayableInvoice,
        markPayableInvoicePaid,
        vouchers,
        addVoucher,
        receivableInvoices,
        addReceivableInvoice,
        addBulkReceivableInvoices,
        markReceivableInvoicePaid,
        legalReceivables,
        addLegalEscalation,
        recoverLegalReceivable,
        payrollSyncs,
        addPayrollSync,
        bankClearances,
        addBankClearance,
        bankReconciliations,
        addBankReconciliation,
        reconciliationStatements,
        addReconciliationStatement,
        cashBookEntries,
        addCashBookEntry,
        pettyCashEntries,
        addPettyCashEntry,

        allLedgerTransactions,
        trialBalanceSummary,
        trialBalanceDetailed,
        profitAndLossReport,
        balanceSheetReport,
        cashFlowReport,
        cashOnHandPosition,
        isSyncing,
        refreshFinanceData,
        resetAndInitializeGLFromPDCs,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinanceStore() {
  const ctx = useContext(FinanceContext);
  if (!ctx) {
    throw new Error("useFinanceStore must be used within a FinanceProvider");
  }
  return ctx;
}
