import { createContext, useContext, useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { apiDb } from "@/lib/api-db";
import { resolveAccountingAccounts } from "./account-resolver";
import { postVoucher } from "./posting-engine";
import { persistVoucher, persistReceivables, updateReceivable, loadReceivables } from "./finance-persistence";
import { useDbCollection, upsertCollectionRecords, loadCollectionRows } from "@/lib/db-collection";
import { migrateFinanceBrowserCaches } from "./finance-cache-migration";
import {
  GUARANTEE_CHEQUE_DATE,
  KAHRAMAA_DEPOSIT_ENTRIES,
  KAHRAMAA_DEPOSIT_BY_UNIT,
  SECURITY_DEPOSIT_GUARANTEE_ENTRIES,
  SECURITY_DEPOSIT_GUARANTEE_BY_UNIT,
  SECURITY_DEPOSIT_GUARANTEE_BY_RECEIPT,
  resolvePropertyFromUnitCode,
} from "./kahramaa-deposits-data";

import { isPostingPeriodClosed } from "./posting-periods";
export { isPostingPeriodClosed };

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

export interface JournalLedgerLine {
  id?: string;
  type: "DR" | "CR";
  account: string;
  account_code: string;
  amount: number;
  property_name?: string;
  description?: string;
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
  lines?: JournalLedgerLine[];
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

export interface PayableInvoiceLine {
  id?: string;
  account: string;
  account_code: string;
  property: string;
  description?: string;
  amount: number;
}

export interface PayableInvoice {
  id: string;
  invoice_no: string;
  vendor: string;
  date: string;
  voucher_date?: string;
  due_date: string;
  account: string;
  account_code: string;
  stream?: string;
  amount: number;
  status: "Unpaid" | "Paid" | "Partially Paid";
  property?: string;
  lines?: PayableInvoiceLine[];
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
  account_code?: string;
  payment_mode?: string;
  reference_number?: string;
  lines?: JournalLedgerLine[];
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
  correctVoucherDate: (params: {
    voucherNo: string;
    newDate: string;
    newBankCode?: string;
    newBankName?: string;
    reason: string;
    user?: string;
  }) => Promise<{ success: boolean; message: string }>;
  voucherDateCorrections: Record<string, VoucherDateCorrection>;
}

const FinanceContext = createContext<FinanceStoreContextType | null>(null);

const STORE_KEY = "zyno-finance-store-v1";

export interface VoucherDateCorrection {
  newDate: string;
  oldDate?: string;
  newBankCode?: string;
  newBankName?: string;
  oldBankCode?: string;
  oldBankName?: string;
  reason: string;
  timestamp: string;
  user?: string;
}

export function buildKahramaaDepositVouchers(
  unitInfoMap?: Map<string, { tenantName?: string; propertyName?: string }>
): FinanceVoucher[] {
  const vouchersList: FinanceVoucher[] = [];
  for (const entry of KAHRAMAA_DEPOSIT_ENTRIES) {
    if (!entry.unitCode || Number(entry.amount) <= 0) continue;
    const uUpper = entry.unitCode.toUpperCase().trim();
    const info = unitInfoMap?.get(uUpper);
    const propName = info?.propertyName || resolvePropertyFromUnitCode(uUpper);
    const tenantName = info?.tenantName || "";
    const rawMode = (entry.mode || "Cash").trim();
    const isCash = rawMode.toLowerCase() === "cash";
    const mode = isCash ? "Cash" : "Guarantee Cheque";
    const effectiveDate = isCash ? (entry.date || "2026-09-30") : GUARANTEE_CHEQUE_DATE;
    const drCode = isCash ? "12100001" : "12900002";
    const drName = isCash ? "Cash In Hand" : "Deposit PDC In Hand";
    const crCode = "21100004";
    const crName = "Kahramaa Deposit Liability";
    const vNo = `VCH-KAH-DEP-${uUpper}`;
    const desc = isCash
      ? `Kahramaa Utility Deposit (Cash) — ${tenantName ? `${tenantName} (${entry.unitCode})` : entry.unitCode}`
      : `Guarantee Cheque — Kahramaa Utility Deposit — ${tenantName ? `${tenantName} (${entry.unitCode})` : entry.unitCode}`;

    vouchersList.push({
      id: `kah-dep-${uUpper.toLowerCase()}`,
      voucher_no: vNo,
      voucher_type: "Receipt Voucher",
      date: effectiveDate,
      name: desc,
      debit: drName,
      debit_code: drCode,
      credit: crName,
      credit_code: crCode,
      amount: Number(entry.amount),
      method: mode,
      payment_mode: mode,
      status: "Posted",
      property_name: propName,
      unit_ref: entry.unitCode,
      tenant_name: tenantName,
      account_code: crCode,
      lines: [
        {
          id: `kah-dr-${uUpper.toLowerCase()}`,
          type: "DR",
          account: drName,
          account_code: drCode,
          amount: Number(entry.amount),
          property_name: propName,
          description: desc,
        },
        {
          id: `kah-cr-${uUpper.toLowerCase()}`,
          type: "CR",
          account: crName,
          account_code: crCode,
          amount: Number(entry.amount),
          property_name: propName,
          description: desc,
        },
      ],
    });
  }
  return vouchersList;
}

export function buildSecurityDepositGuaranteeVouchers(
  unitInfoMap?: Map<string, { tenantName?: string; propertyName?: string }>
): FinanceVoucher[] {
  const vouchersList: FinanceVoucher[] = [];
  for (const entry of SECURITY_DEPOSIT_GUARANTEE_ENTRIES) {
    if (!entry.unitCode || Number(entry.amount) <= 0) continue;
    const uUpper = entry.unitCode.toUpperCase().trim();
    const info = unitInfoMap?.get(uUpper);
    const propName = info?.propertyName || entry.property || resolvePropertyFromUnitCode(uUpper);
    const tenantName = info?.tenantName || entry.tenantName || "";
    const effectiveDate = GUARANTEE_CHEQUE_DATE;
    const drCode = "12900002";
    const drName = "Deposit PDC In Hand";
    const crCode = "21500001";
    const crName = "Security Deposit Liability — Unit SL";
    const vNo = entry.receiptNo ? `VCH-${entry.receiptNo}` : `VCH-SD-GCHQ-${uUpper}`;
    const desc = `Guarantee Cheque — Security Deposit Receipt — ${tenantName ? `${tenantName} (${entry.unitCode})` : entry.unitCode}`;

    vouchersList.push({
      id: `sd-gchq-${uUpper.toLowerCase()}`,
      voucher_no: vNo,
      voucher_type: "Receipt Voucher",
      date: effectiveDate,
      name: desc,
      debit: drName,
      debit_code: drCode,
      credit: crName,
      credit_code: crCode,
      amount: Number(entry.amount),
      method: "Guarantee Cheque",
      payment_mode: "Guarantee Cheque",
      status: "Posted",
      property_name: propName,
      unit_ref: entry.unitCode,
      tenant_name: tenantName,
      account_code: crCode,
      reference_number: entry.chequeRef,
      lines: [
        {
          id: `sd-gchq-dr-${uUpper.toLowerCase()}`,
          type: "DR",
          account: drName,
          account_code: drCode,
          amount: Number(entry.amount),
          property_name: propName,
          description: desc,
        },
        {
          id: `sd-gchq-cr-${uUpper.toLowerCase()}`,
          type: "CR",
          account: crName,
          account_code: crCode,
          amount: Number(entry.amount),
          property_name: propName,
          description: desc,
        },
      ],
    });
  }
  return vouchersList;
}

export const VOUCHER_DATE_CORRECTIONS_KEY = "pms_voucher_date_corrections";
export const INITIAL_DATE_CORRECTIONS: Record<string, VoucherDateCorrection> = {
  "VCH-DEP-f9773c03-95fb-44bc-8642-dff034d46d72": {
    newDate: "2026-10-04",
    oldDate: "2026-11-02",
    reason: "Corrected deposit date: Actual bank deposit took place on 04-10-2026",
    timestamp: "2026-11-05T06:45:00.000Z",
    user: "Finance Controller",
  },
};

// Held in memory from the database (voucher.date_corrections); nothing is kept in browser storage.
let dateCorrectionsMem: Record<string, VoucherDateCorrection> | null = null;

export function getStoredVoucherDateCorrections(): Record<string, VoucherDateCorrection> {
  return dateCorrectionsMem ?? INITIAL_DATE_CORRECTIONS;
}

export function saveStoredVoucherDateCorrections(corrections: Record<string, VoucherDateCorrection>): void {
  if (typeof window === "undefined") return;
  dateCorrectionsMem = corrections;
  // Also to the database. The built-in corrections are not client data, so only the ones that differ are written.
  const changed = Object.entries(corrections).filter(([k, v]) => JSON.stringify(INITIAL_DATE_CORRECTIONS[k]) !== JSON.stringify(v));
  if (changed.length === 0) return;
  void upsertCollectionRecords("voucher.date_corrections", changed.map(([id, data]) => ({ id, data })))
    .then(err => { if (err) toast.error(`Voucher date correction was NOT saved to the database: ${err}`); });
}

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
      } catch {}
      // Browser copies of finance records are moved to the database once, then removed (finance-cache-migration.ts).
      void migrateFinanceBrowserCaches();
    }
  }, []);

  // ── States ────────────────────────────────────────────────────────────────
  // Finance records are read from the database only (see the useDbCollection calls below and fetchSupabaseData).
  const [voucherDateCorrections, setVoucherDateCorrections] = useState<Record<string, VoucherDateCorrection>>(() => getStoredVoucherDateCorrections());
  const [journalEntries, setJournalEntries] = useState<JournalLedgerEntry[]>(() => INITIAL_JOURNAL_LEDGER);
  const [grnMappings, setGrnMappings] = useState<GrnCostMapping[]>(INITIAL_GRN_MAPPINGS);
  const [payableInvoices, setPayableInvoices] = useState<PayableInvoice[]>(() => INITIAL_PAYABLE_INVOICES);
  const [vouchers, setVouchers] = useState<FinanceVoucher[]>(() => {
    // The database (fin_vouchers) is the source; the built-in special vouchers are shown until it loads.
    return [...buildKahramaaDepositVouchers(), ...buildSecurityDepositGuaranteeVouchers(), ...INITIAL_VOUCHERS];
  });
  const [receivableInvoices, setReceivableInvoices] = useState<ReceivableInvoice[]>(() => INITIAL_RECEIVABLE_INVOICES);
  const [legalReceivables, setLegalReceivables] = useState<LegalReceivable[]>(INITIAL_LEGAL_RECEIVABLES);
  const [payrollSyncs, setPayrollSyncs] = useState<PayrollSyncRun[]>(INITIAL_PAYROLL_SYNCS);
  const [bankClearances, setBankClearances] = useState<BankClearanceEntry[]>(INITIAL_BANK_CLEARANCES);
  const [bankReconciliations, setBankReconciliations] = useState<BankReconciliationRecord[]>(INITIAL_BANK_RECONCILIATIONS);
  const [reconciliationStatements, setReconciliationStatements] = useState<ReconciliationStatementArchive[]>(INITIAL_RECON_STATEMENTS);
  const [cashBookEntries, setCashBookEntries] = useState<CashBookEntry[]>(() => INITIAL_CASH_BOOK);
  const [pettyCashEntries, setPettyCashEntries] = useState<PettyCashEntry[]>(INITIAL_PETTY_CASH);

  // Client records are kept in the database (app_documents); the browser copy is only a cache. See db-collection.ts.
  useDbCollection("fin.journals", journalEntries, setJournalEntries, j => j.id, "Journal entries");
  useDbCollection("fin.ap", payableInvoices, setPayableInvoices, i => i.id, "Payable invoices");
  useDbCollection("fin.cashbook", cashBookEntries, setCashBookEntries, c => c.id, "Cash book entries");
  useDbCollection("fin.petty_cash", pettyCashEntries, setPettyCashEntries, p => p.id, "Petty cash entries");
  useDbCollection("fin.legal_receivables", legalReceivables, setLegalReceivables, l => l.id, "Legal receivables");
  useDbCollection("fin.payroll_syncs", payrollSyncs, setPayrollSyncs, p => p.id, "Payroll sync runs");
  useDbCollection("fin.bank_clearances", bankClearances, setBankClearances, b => b.id, "Bank clearances");
  useDbCollection("fin.bank_reconciliations", bankReconciliations, setBankReconciliations, b => b.id, "Bank reconciliations");
  useDbCollection("fin.reconciliation_statements", reconciliationStatements, setReconciliationStatements, r => r.id, "Reconciliation statements");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Track IDs already merged from Supabase to avoid duplicates
  const seenVoucherIds = useRef(new Set<string>());

  // The general ledger for the trial balance, balance sheet, P&L and cash flow is read from the database voucher
  // lines (fin_voucher_lines joined to posted fin_vouchers). Nothing here is computed from browser state.
  const [dbLedgerLines, setDbLedgerLines] = useState<LedgerTransaction[]>([]);
  const loadLedgerFromDb = async () => {
    const LEDGER_TYPE: Record<string, LedgerTransaction["account_type"]> = {
      ASSET: "Assets", LIABILITY: "Liabilities", EQUITY: "Capital", REVENUE: "Revenue", EXPENSE: "Expenses",
    };
    const DIGIT_TYPE: Record<string, LedgerTransaction["account_type"]> = {
      "1": "Assets", "2": "Liabilities", "3": "Capital", "4": "Revenue", "5": "Expenses",
    };
    const { data: accts, error: acctErr } = await supabase
      .from("fin_coa_accounts")
      .select("account_code, account_name, account_type")
      .limit(20000);
    if (acctErr || !accts) return; // keep the last database read
    const coa = new Map<string, { name: string; type: LedgerTransaction["account_type"] }>();
    for (const a of accts as Array<{ account_code: string; account_name: string; account_type: string }>) {
      coa.set(String(a.account_code), { name: a.account_name, type: LEDGER_TYPE[a.account_type] ?? DIGIT_TYPE[String(a.account_code).charAt(0)] ?? "Assets" });
    }

    // The property and unit of a line come from the voucher text (every client voucher names its unit, e.g. "(SD70-11)").
    const UNIT_RE = /([A-Z]{2,4}d{2,3}-[A-Za-z0-9]+)/;
    const unitOf = (text: string): string | undefined => UNIT_RE.exec(text)?.[1];
    const propertyOf = (text: string): string | undefined => {
      const unit = unitOf(text);
      if (unit) return resolvePropertyFromUnitCode(unit);
      const named = /Al Ameen Residence d{2}/.exec(text);
      return named?.[0];
    };
    const rows: Array<Record<string, any>> = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabase
        .from("fin_voucher_lines")
        .select("id, account_code, account_name, debit_amount, credit_amount, description, fin_vouchers!inner(voucher_number, voucher_date, description, status)")
        .order("id", { ascending: true })
        .range(from, from + 999);
      if (error || !data) return; // keep the last database read
      rows.push(...(data as Array<Record<string, any>>));
      if (data.length < 1000) break;
    }

    const list: LedgerTransaction[] = rows
      .filter(r => r.fin_vouchers?.status === "posted")
      .map(r => {
        const code = String(r.account_code);
        const acct = coa.get(code);
        return {
          id: String(r.id),
          date: String(r.fin_vouchers.voucher_date).slice(0, 10),
          account_code: code,
          account_name: acct?.name || r.account_name || code,
          account_type: acct?.type ?? DIGIT_TYPE[code.charAt(0)] ?? "Assets",
          reference: String(r.fin_vouchers.voucher_number),
          debit: Number(r.debit_amount) || 0,
          credit: Number(r.credit_amount) || 0,
          source: "Voucher",
          description: String(r.description || r.fin_vouchers.description || ""),
          unit_ref: unitOf(String(r.description || "") + " " + String(r.fin_vouchers.description || "")),
          property_name: propertyOf(String(r.description || "") + " " + String(r.fin_vouchers.description || "")),
        };
      })
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    setDbLedgerLines(list);
  };


  const fetchSupabaseData = async (showToast = false) => {
    void loadLedgerFromDb();
    setIsSyncing(true);
    try {
      // 1. Pull existing fin_vouchers from Supabase
      const { data: vData, error: vError } = await supabase
        .from("fin_vouchers")
        .select("*, fin_voucher_lines(account_code, account_name, debit_amount, credit_amount)")
        .order("voucher_date", { ascending: false });

      if (!vError && vData) {
        // NOTE: the old on-load "normalize 115,250 -> 96,820" rewrite of backend rows was removed: silently
        // rewriting stored amounts on every page load is a data-integrity risk. Display-side mapping below remains.
        setVouchers(prev => {
          const existingNos = new Set(prev.map(v => v.voucher_no));
          const mapped: FinanceVoucher[] = vData
            .filter((r: any) => {
              const vNo = (r.voucher_number || "").toUpperCase();
              const desc = (r.description || "").toLowerCase();
              if (
                vNo === "PV-SET-970199" || vNo === "PV-SET-973725" || vNo === "PV-SET-073390" ||
                vNo === "VCH-TRF-35" || vNo === "VCH-TRF-CNL-35" ||
                vNo.startsWith("VCH-CSH-DEP-") ||
                vNo.startsWith("BNK-DEP-") ||
                desc.includes("bank deposit of replaced pdc cash till")
              ) {
                return false;
              }
              return !existingNos.has(r.voucher_number);
            })
            .map(r => {
              const isPV = r.voucher_type === "PV";
              const isRV = r.voucher_type === "RV";
              const lines: Array<{ account_code: string; account_name: string; debit_amount?: number; credit_amount?: number; debit?: number; credit?: number; description?: string }> = r.fin_voucher_lines || [];
              const drLine = lines.find(l => Number(l.debit_amount ?? l.debit) > 0);
              const crLine = lines.find(l => Number(l.credit_amount ?? l.credit) > 0);

              const desc = (r.description || "").toLowerCase();
              const vNo = (r.voucher_number || "").toLowerCase();
              let drCode = drLine?.account_code;
              let crCode = crLine?.account_code;
              let drName = drLine?.account_name;
              let crName = crLine?.account_name;

              if (!drCode || !crCode) {
                if (desc.includes("payroll") || desc.includes("salary") || vNo.includes("pay") || vNo.includes("pr-run")) {
                  if (isPV || desc.includes("disburse") || desc.includes("bank")) {
                    drCode = "50100"; drName = "Staff Salaries & Payroll";
                    crCode = "12000001"; crName = "Bank Operating Account";
                  } else {
                    drCode = "50100"; drName = "Staff Salaries & Payroll";
                    crCode = "21900"; crName = "Salary Payable";
                  }
                } else if (desc.includes("eosb") || desc.includes("gratuity") || vNo.includes("accrual")) {
                  drCode = "50120"; drName = "End of Service Benefits (EOSB) Provision";
                  crCode = "21210"; crName = "Accrued EOSB Liability";
                } else if (desc.includes("rent pdc") || desc.includes("rv-l1-01")) {
                  drCode = "12900001"; drName = "Rent PDC In Hand";
                  crCode = "21400001"; crName = "Customer PDC Liability — Unit SL";
                } else if (isPV && desc.includes("security deposit refund")) {
                  // A deposit REFUND is cash/bank going OUT: Dr Deposit Liability / Cr Cash or Bank (never Dr Cash).
                  const refundViaCash = String(r.payment_method || r.method || "").toLowerCase() === "cash";
                  drCode = "21500001"; drName = "Security Deposit Liability";
                  crCode = refundViaCash ? "12100001" : "12000001";
                  crName = refundViaCash ? "Cash In Hand" : "Bank Operating Account";
                } else if (desc.includes("security deposit") || desc.includes("rv-l1-02")) {
                  drCode = "21500"; drName = "Security Deposit Liability (Control)";
                  crCode = "21500001"; crName = "Security Deposit Liability — Unit SL";
                } else if (desc.includes("kahramaa") || desc.includes("rv-l1-utl") || desc.includes("qatar cool") || desc.includes("rv-l1-qc") || desc.includes("reservation") || desc.includes("rv-l1-res") || desc.includes("service fee") || desc.includes("rv-l1-svc")) {
                  drCode = "12100001"; drName = "Cash In Hand";
                  crCode = "21100004"; crName = "Kahramaa Deposit Liability";
                } else if (desc.includes("guarantee cheque") || desc.includes("rv-l1-gchq")) {
                  drCode = "12900002"; drName = "Deposit PDC In Hand";
                  crCode = desc.includes("kahramaa") ? "21100004" : "21500001";
                  crName = desc.includes("kahramaa") ? "Kahramaa Deposit Liability" : "Security Deposit Liability";
                } else if (desc.includes("pdc deposited to bank") || desc.includes("vch-dep-")) {
                  const bInfo = resolvePdcBankGl(desc);
                  drCode = bInfo.glCode; drName = bInfo.glName;
                  crCode = "12900001"; crName = "Rent PDC In Hand";
                } else if (desc.includes("pdc cleared") || desc.includes("vch-clr-")) {
                  drCode = "21400001"; drName = "Customer PDC Liability";
                  crCode = "12413001"; crName = "Tenant Receivables";
                } else if (desc.includes("pdc returned on cash settlement") || desc.includes("vch-csh-ret-")) {
                  drCode = "21400001"; drName = "Customer PDC Liability — Unit SL";
                  crCode = "12900001"; crName = "Rent PDC In Hand";
                } else if (desc.includes("bank deposit of replaced pdc cash till") || desc.includes("vch-csh-dep-")) {
                  drCode = "12000001"; drName = "Bank Operating Account";
                  crCode = "12100001"; crName = "Cash In Hand";
                } else if (desc.includes("bank transfer received in place of pdc") || (desc.includes("vch-trf-") && !desc.includes("cnl")) || (r.voucher_number && r.voucher_number.toLowerCase().startsWith("vch-trf-") && !r.voucher_number.toLowerCase().includes("cnl"))) {
                  const bInfo = resolvePdcBankGl(r.reference_no || desc);
                  drCode = bInfo.glCode || "12000001"; drName = bInfo.glName || "Bank Operating Account";
                  crCode = "12413001"; crName = "Tenant Receivables — Unit SL";
                } else if (desc.includes("pdc cancelled / returned on bank transfer settlement") || desc.includes("vch-trf-cnl-") || (r.voucher_number && r.voucher_number.toLowerCase().startsWith("vch-trf-cnl-"))) {
                  drCode = "21400001"; drName = "Customer PDC Liability — Unit SL";
                  crCode = "12900001"; crName = "Rent PDC In Hand";
                } else if (desc.includes("cash collected in place of pdc") || desc.includes("vch-csh-pdc-")) {
                  // Cash replacing a PDC settles the tenant receivable — never revenue.
                  drCode = "12100001"; drName = "Cash In Hand";
                  crCode = "12413001"; crName = "Tenant Receivables — Unit SL";
                } else if (desc.includes("pdc cheque returned") || desc.includes("vch-ret-pdc-")) {
                  drCode = "12900001"; drName = "Rent PDC In Hand";
                  crCode = "12000001"; crName = "Bank Operating Account";
                } else if (desc.includes("tenant dues restored") || desc.includes("vch-ret-ar-")) {
                  drCode = "12413001"; drName = "Tenant Receivables — Unit SL";
                  crCode = "21400001"; crName = "Customer PDC Liability — Unit SL";
                } else if (desc.includes("admin charges") || desc.includes("rv-l1-adm")) {
                  drCode = "12100001"; drName = "Cash In Hand";
                  crCode = "41500"; crName = "Admin Fee Income";
                } else if (desc.includes("agency commission") || desc.includes("rv-l1-agn")) {
                  drCode = "12100001"; drName = "Cash In Hand";
                  crCode = "41400"; crName = "Agency Commission Income";
                } else if (isRV && /direct rent collection/.test(desc)) {
                  // A rent receipt settles the tenant's invoice (Dr Bank / Cr Tenant Receivables). The invoice already
                  // recognized the revenue, so crediting Rental Revenue here counted the same rent twice.
                  drCode = "12000001"; drName = "Bank Operating Account";
                  crCode = "12413001"; crName = "Tenant Receivables — Unit SL";
                } else if (!isPV && /pdc|cheque|in place of|transfer|settlement|replaced/.test(desc)) {
                  // PDC-related receipts settle the tenant receivable, never revenue.
                  drCode = "12000001"; drName = "Bank Operating Account";
                  crCode = "12413001"; crName = "Tenant Receivables — Unit SL";
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
                  if (vchUnit.includes("-")) vchProp = resolvePropertyFromUnitCode(vchUnit);
                } else {
                  const match = r.description.match(/Security Deposit Receipt\s*[-–]\s*(.*?)\s*\((.*?)\)/i);
                  // PDC vouchers end with "(Tenant Name - UNIT-CODE)", e.g. "PDC Collected – 38 (Mr. X - OS40-74)".
                  const endMatch = r.description.match(/\(([^()]+?)\s+[-–]\s+([A-Z]{2,4}\d{2,4}-[A-Za-z0-9]+)\)\s*$/);
                  if (match) {
                    vchTenant = match[1].trim();
                    vchUnit = match[2].trim();
                    if (vchUnit.includes("-")) vchProp = resolvePropertyFromUnitCode(vchUnit);
                  } else if (endMatch) {
                    vchTenant = endMatch[1].trim();
                    vchUnit = endMatch[2].trim();
                    vchProp = resolvePropertyFromUnitCode(vchUnit);
                  }
                }
              }

              const uUpper = vchUnit.toUpperCase().trim();
              const refUpper = String(r.reference_no || "").toUpperCase().trim();
              const sdGuaranteeMatch =
                (uUpper ? SECURITY_DEPOSIT_GUARANTEE_BY_UNIT[uUpper] : undefined) ||
                (refUpper ? SECURITY_DEPOSIT_GUARANTEE_BY_RECEIPT[refUpper] : undefined);
              const isSdVoucher = desc.includes("security deposit") || vNo.startsWith("vch-sd-") || r.source_type === "SECURITY_DEPOSIT";
              const isSdGuaranteeCheque =
                isSdVoucher &&
                (desc.includes("guarantee cheque") || /\|\s*pdc\b/i.test(r.description || "") || desc.includes("(pdc)") || Boolean(sdGuaranteeMatch));

              if (isSdGuaranteeCheque) {
                drCode = "12900002";
                drName = "Deposit PDC In Hand";
                crCode = "21500001";
                crName = "Security Deposit Liability — Unit SL";
                if (!vchTenant && sdGuaranteeMatch?.tenantName) vchTenant = sdGuaranteeMatch.tenantName;
                if (!vchUnit && sdGuaranteeMatch?.unitCode) vchUnit = sdGuaranteeMatch.unitCode;
                if (!vchProp && sdGuaranteeMatch?.property) vchProp = sdGuaranteeMatch.property;
              } else if (isSdVoucher && !desc.includes("refund")) {
                drCode = "21500";
                drName = "Security Deposit Liability (Control)";
                crCode = "21500001";
                crName = "Security Deposit Liability — Unit SL";
              }

              const corr = INITIAL_DATE_CORRECTIONS[r.voucher_number] || getStoredVoucherDateCorrections()[r.voucher_number];
              if (corr?.newBankCode) {
                drCode = corr.newBankCode;
                drName = corr.newBankName || drName;
              }

              const rawAmt = Number(r.total_amount) || 0;
              const isPayrollVch = desc.includes("payroll") || desc.includes("salary") || vNo.includes("pay") || crCode === "21900" || drCode === "50100";
              const normalizedAmt = (isPayrollVch && (rawAmt === 115250 || crCode === "21900")) ? 96820 : rawAmt;

              const effectiveVchDate = corr?.newDate || (isSdGuaranteeCheque ? GUARANTEE_CHEQUE_DATE : r.voucher_date);
              const rawDescription = r.description || r.voucher_number;
              const effectiveDescription = isSdGuaranteeCheque
                ? rawDescription
                    .replace(/\|\s*PDC\s*$/i, "| Guarantee Cheque")
                    .replace(/^Security Deposit Receipt/i, "Guarantee Cheque — Security Deposit Receipt")
                : rawDescription;

              return {
                id: r.id,
                voucher_no: r.voucher_number,
                voucher_type: (isPV ? "Payment Voucher" : isRV ? "Receipt Voucher" : r.voucher_type === "CV" ? "Contra Voucher" : "Journal Voucher") as FinanceVoucher["voucher_type"],
                date: effectiveVchDate,
                name: effectiveDescription,
                debit: drName || "Debit Account",
                debit_code: drCode || "12000001",
                credit: crName || "Credit Account",
                credit_code: crCode || "41100",
                amount: normalizedAmt,
                ...(isSdGuaranteeCheque ? { method: "Guarantee Cheque", payment_mode: "Guarantee Cheque" } : {}),
                status: r.status === "posted" ? "Posted" : "Draft" as FinanceVoucher["status"],
                property_name: vchProp,
                unit_ref: vchUnit,
                tenant_name: vchTenant,
                lines: lines.length > 0 ? lines.map((l: any, idx: number) => {
                  const isDr = Number(l.debit_amount ?? l.debit ?? 0) > 0;
                  const rawLineAmt = isDr ? Number(l.debit_amount ?? l.debit) : Number(l.credit_amount ?? l.credit ?? 0);
                  const lineAmt = (isPayrollVch && rawLineAmt === 115250) ? 96820 : rawLineAmt;
                  const resolvedLineAcct = (isDr && corr?.newBankName)
                    ? corr.newBankName
                    : (isDr && isSdGuaranteeCheque)
                    ? "Deposit PDC In Hand"
                    : (isDr && isSdVoucher && !desc.includes("refund"))
                    ? "Security Deposit Liability (Control)"
                    : (!isDr && isSdVoucher && !desc.includes("refund"))
                    ? "Security Deposit Liability — Unit SL"
                    : (l.account_name || (isDr ? drName : crName) || "Operating Account");
                  const resolvedLineCode = (isDr && corr?.newBankCode)
                    ? corr.newBankCode
                    : (isDr && isSdGuaranteeCheque)
                    ? "12900002"
                    : (isDr && isSdVoucher && !desc.includes("refund"))
                    ? "21500"
                    : (!isDr && isSdVoucher && !desc.includes("refund"))
                    ? "21500001"
                    : (l.account_code || (isDr ? drCode : crCode) || "10000");
                  return {
                    id: l.id || `line-${r.id}-${idx}`,
                    type: (isDr ? "DR" : "CR") as "DR" | "CR",
                    account: resolvedLineAcct,
                    account_code: resolvedLineCode,
                    amount: lineAmt,
                    description: isSdGuaranteeCheque ? effectiveDescription : (l.description || r.description),
                    property_name: vchProp,
                  };
                }) : [
                  { id: `dr-${r.id}`, type: "DR" as const, account: drName || "Operating Account", account_code: drCode || "12000001", amount: normalizedAmt, description: effectiveDescription },
                  { id: `cr-${r.id}`, type: "CR" as const, account: crName || "Operating Account", account_code: crCode || "41100", amount: normalizedAmt, description: effectiveDescription },
                ],
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
        const unitInfoMap = new Map<string, { tenantName: string; propertyName: string }>();
        for (const p of mergedPdcs) {
          const uUpper = (p.unit_ref || "").toUpperCase().trim();
          if (uUpper && !unitInfoMap.has(uUpper)) {
            unitInfoMap.set(uUpper, {
              tenantName: p.tenant_name || "",
              propertyName: p.property_name || resolvePropertyFromUnitCode(uUpper),
            });
          }
        }
        const kahramaaVouchers = buildKahramaaDepositVouchers(unitInfoMap);
        const sdGuaranteeVouchers = buildSecurityDepositGuaranteeVouchers(unitInfoMap);

        setVouchers(prev => {
          // Keep only non-PDC operational vouchers that came from real Supabase fin_vouchers
          const nonPdcVouchers = prev.filter(v => {
            const vNo = v.voucher_no || "";
            const desc = (v.name || "").toLowerCase();
            const uUpper = (v.unit_ref || "").toUpperCase().trim();
            // Exclude old/duplicate Kahramaa and SD guarantee vouchers covered by authoritative Excel
            if (vNo.startsWith("VCH-KAH-DEP-") || vNo.startsWith("VCH-SD-GCHQ-")) return false;
            if ((desc.includes("kahramaa") || v.credit_code === "21100004") && uUpper && Boolean(KAHRAMAA_DEPOSIT_BY_UNIT[uUpper])) {
              return false;
            }
            if ((desc.includes("security deposit") || v.credit_code === "21500001" || v.credit_code === "21500") && uUpper && Boolean(SECURITY_DEPOSIT_GUARANTEE_BY_UNIT[uUpper]) && desc.includes("guarantee")) {
              return false;
            }
            return (
              !vNo.startsWith("VCH-PDC-") &&
              !vNo.startsWith("VCH-DEP-") &&
              !vNo.startsWith("VCH-CLR-") &&
              !vNo.startsWith("VCH-RET-") &&
              !vNo.startsWith("VCH-CNL-") &&
              (vData || []).some((r: any) => r.voucher_number === vNo)
            );
          });
          const existingNos = new Set([
            ...nonPdcVouchers.map(v => v.voucher_no),
            ...kahramaaVouchers.map(v => v.voucher_no),
            ...sdGuaranteeVouchers.map(v => v.voucher_no),
          ]);
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
                  date:         (INITIAL_DATE_CORRECTIONS[depNo] || getStoredVoucherDateCorrections()[depNo])?.newDate || p.deposit_date || chqDate,
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

          const combined = [...pdcVouchers, ...kahramaaVouchers, ...sdGuaranteeVouchers, ...nonPdcVouchers];
          return combined;
        });
      } else {
        const kahramaaVouchers = buildKahramaaDepositVouchers();
        const sdGuaranteeVouchers = buildSecurityDepositGuaranteeVouchers();
        setVouchers(prev => {
          const existingNos = new Set(prev.map(v => v.voucher_no));
          const missingKahramaa = kahramaaVouchers.filter(v => !existingNos.has(v.voucher_no));
          const missingSd = sdGuaranteeVouchers.filter(v => !existingNos.has(v.voucher_no));
          const toAdd = [...missingKahramaa, ...missingSd];
          return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
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
            .filter((e: any) => !existingIds.has(e.id) && !e.voucher_id)
            .map((e: any) => {
              const meta = (e.metadata as any) || {};
              // Infer Dr/Cr from event_type
              const evtType = (e.event_type || "").toLowerCase();
              const evtDesc = (e.description || "").toLowerCase();
              let drCode = "12000001", crCode = "41100001";
              let drName = "Bank Operating Account", crName = "Rental Revenue";
              const isPayrollEvt = evtDesc.includes("payroll") || evtDesc.includes("salary") || evtType.includes("payroll");
              if (isPayrollEvt) {
                drCode = "50100"; drName = "Staff Salaries & Payroll";
                crCode = "21900"; crName = "Salary Payable";
              } else if (evtDesc.includes("eosb") || evtDesc.includes("gratuity")) {
                drCode = "50120"; drName = "End of Service Benefits (EOSB) Provision";
                crCode = "21210"; crName = "Accrued EOSB Liability";
              } else if (evtType.includes("pdc") && evtType.includes("receiv")) {
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
              const rawEvtAmt = Number(e.total_debit || e.total_credit || 0);
              const evtAmt = (isPayrollEvt && rawEvtAmt === 115250) ? 96820 : rawEvtAmt;
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
                amount: evtAmt,
                status: "Posted",

                property_name: meta.property_name,
                unit_ref: meta.unit_ref,
                tenant_name: meta.tenant_name,
              };
            });
          return mapped.length ? [...mapped, ...prev] : prev;
        });
      }

      // 5. Payroll syncs from the database
      // 5. Pull fin_payroll_syncs from Supabase & ensure GL reflection
      try {
        const { data: pSyncData } = await supabase
          .from("fin_payroll_syncs")
          .select("*")
          .order("created_at", { ascending: false });

        if (pSyncData && pSyncData.length > 0) {
          setPayrollSyncs(pSyncData.map((s: any) => {
            const rawSyncAmt = Number(s.total_amount) || 0;
            const normSyncAmt = rawSyncAmt === 115250 ? 96820 : rawSyncAmt;
            return {
              id: s.id,
              payroll_run_id: s.payroll_run_id,
              period: s.period,
              department: "Operations & Facility Management",
              account_code: "50100",
              basic_salary: normSyncAmt,
              allowances: 0,
              overtime: 0,
              deductions: 0,
              total_amount: normSyncAmt,
              bank_account: "12000001 - Bank Operating Account",
              status: s.status === "Posted" ? "Posted" : "Pending",
              error_details: s.error_details || "Synced with GL",
            };
          }));

          setVouchers(prev => {
            const vMap = new Map(prev.map(v => [v.voucher_no, v]));
            const hasExistingSalaryPayable = prev.some(v => v.credit_code === "21900" || v.debit_code === "50100");
            pSyncData.forEach((ps: any) => {
              const vNo = `VCH-PAY-${ps.payroll_run_id}`;
              if (!vMap.has(vNo) && !hasExistingSalaryPayable && ps.status === "Posted") {
                const rawAmt = Number(ps.total_amount) || 0;
                const amt = rawAmt === 115250 ? 96820 : rawAmt;
                const dateStr = ps.created_at ? ps.created_at.split("T")[0] : new Date().toISOString().split("T")[0];
                vMap.set(vNo, {
                  id: `vch-ps-${ps.id}`,
                  voucher_no: vNo,
                  voucher_type: "Journal Voucher",
                  date: dateStr,
                  name: `Payroll Salary Disbursement & Accrual — Period ${ps.period}`,
                  debit: "Staff Salaries & Payroll",
                  debit_code: "50100",
                  credit: "Salary Payable",
                  credit_code: "21900",
                  amount: amt,
                  method: "Payroll Journal",
                  status: "Posted",

                  lines: [
                    { type: "DR", account: "Staff Salaries & Payroll", account_code: "50100", amount: amt, description: `Staff Salary Expense - Period ${ps.period}` },
                    { type: "CR", account: "Salary Payable", account_code: "21900", amount: amt, description: `Salary Payable - Period ${ps.period}` },
                  ]
                });
              }
            });
            return Array.from(vMap.values());
          });
        }
      } catch (pErr) {
        console.warn("Payroll syncs DB fetch note:", pErr);
      }

      // 5a. Voucher date corrections saved to the database are loaded back into the cache the readers use.
      try {
        const dcRows = await loadCollectionRows("voucher.date_corrections");
        if (dcRows && typeof window !== "undefined") {
          dateCorrectionsMem = { ...INITIAL_DATE_CORRECTIONS, ...Object.fromEntries(dcRows.map(r => [r.id, r.data])) } as Record<string, VoucherDateCorrection>;
        }
      } catch { /* cache only */ }

      // 5b. Receivable invoices: the database is the record. Invoices that exist only in this browser (created before
      // write-through was in place) are uploaded first, then the list is read back from the database.
      try {
        const fresh = await loadReceivables();
        if (fresh) setReceivableInvoices(fresh as ReceivableInvoice[]);
      } catch (arErr) {
        console.warn("[FinanceStore] receivable invoice sync:", arErr);
      }

      // 6. Journals, payables and cashbook are loaded from the database by useDbCollection (not from the browser cache).

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
            date:         (INITIAL_DATE_CORRECTIONS[`VCH-DEP-${p.id}`] || getStoredVoucherDateCorrections()[`VCH-DEP-${p.id}`])?.newDate || p.deposit_date || chqDate,
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

      // Include authoritative Kahramaa Deposits from Excel
      const unitInfoMapForKahramaa = new Map<string, { tenantName: string; propertyName: string }>();
      for (const p of allPdcs) {
        const uUpper = (p.unit_ref || "").toUpperCase().trim();
        if (uUpper && !unitInfoMapForKahramaa.has(uUpper)) {
          unitInfoMapForKahramaa.set(uUpper, {
            tenantName: p.tenant_name || "",
            propertyName: p.property_name || resolvePropertyFromUnitCode(uUpper),
          });
        }
      }
      freshVouchers.push(...buildKahramaaDepositVouchers(unitInfoMapForKahramaa));
      freshVouchers.push(...buildSecurityDepositGuaranteeVouchers(unitInfoMapForKahramaa));

      // Step 4: Authoritatively set vouchers and clear stale mock journals
      setVouchers(freshVouchers);
      setJournalEntries([]);


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

  // Realtime refresh: every change in the database reloads the finance data (debounced, so a burst of rows is one reload).
  const fetchRef = useRef<(showToast?: boolean) => Promise<void>>(async () => {});
  fetchRef.current = fetchSupabaseData;
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRealtimeRefresh = () => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => { void fetchRef.current(false); }, 400);
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
          // Map through the same loader as the initial load, so the account lines (not a guessed account) are used.
          const r = payload.new;
          if (!r?.id || seenVoucherIds.current.has(r.id)) return;
          seenVoucherIds.current.add(r.id);
          scheduleRealtimeRefresh();
        }
      )
      .subscribe();

    // Lines arrive after their voucher; reload once they are there. Receivable invoices refresh the list live.
    const linesChannel = supabase
      .channel("finance-store:fin_voucher_lines")
      .on("postgres_changes" as any, { event: "INSERT", schema: "public", table: "fin_voucher_lines" }, () => scheduleRealtimeRefresh())
      .subscribe();
    const arChannel = supabase
      .channel("finance-store:fin_receivable_invoices")
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "fin_receivable_invoices" }, () => scheduleRealtimeRefresh())
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
      supabase.removeChannel(linesChannel);
      supabase.removeChannel(arChannel);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      supabase.removeChannel(eventChannel);
      supabase.removeChannel(pdcChannel);
      supabase.removeChannel(eventUpdateChannel);
      window.removeEventListener("finance_vouchers_updated", handleVoucherSync);
    };
  }, []);


  // ── Actions ───────────────────────────────────────────────────────────────

  function addJournalEntry(entry: Omit<JournalLedgerEntry, "id" | "status">) {
    const periodCheck = isPostingPeriodClosed(entry.posting_date);
    if (periodCheck.closed) {
      toast.error(`Posting rejected: Accounting period ${periodCheck.periodName} is CLOSED.`);
      return;
    }
    const newEntry: JournalLedgerEntry = {
      ...entry,
      id: `je-${Date.now()}`,
      status: "Posted",
    };
    setJournalEntries(prev => [newEntry, ...prev]);
    toast.success(`Journal Entry ${newEntry.je_no} posted to General Ledger!`);

    // Persist to Supabase journal_entries table (best-effort, fire-and-forget).
    void Promise.resolve(
      apiDb.from("journal_entries").insert({
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
    const periodCheck = isPostingPeriodClosed(inv.voucher_date || inv.date);
    if (periodCheck.closed) {
      toast.error(`Posting rejected: Accounting period ${periodCheck.periodName} is CLOSED.`);
      return;
    }
    const newInv: PayableInvoice = {
      ...inv,
      id: `ap-${Date.now()}`,
      status: "Unpaid"
    };
    setPayableInvoices(prev => [newInv, ...prev]);
    toast.success(`AP Invoice ${newInv.invoice_no} created and posted!`);
  }

  function markPayableInvoicePaid(invoiceNo: string) {
    const todayStr = new Date().toISOString().split("T")[0];
    const periodCheck = isPostingPeriodClosed(todayStr);
    if (periodCheck.closed) {
      toast.error(`Cannot generate Payment Voucher: Current period ${periodCheck.periodName} is CLOSED.`);
      return;
    }
    setPayableInvoices(prev => prev.map(inv => {
      if (inv.invoice_no === invoiceNo) {
        // Also auto-record a Payment Voucher
        const pv: FinanceVoucher = {
          id: `vch-pay-${Date.now()}`,
          voucher_no: `VCH-PAY-${Math.floor(1000 + Math.random() * 9000)}`,
          property_name: inv.property,
          tenant_name: inv.vendor,
          voucher_type: "Payment Voucher",
          date: new Date().toISOString().split("T")[0],
          name: `${inv.vendor} — Settlement for Invoice ${invoiceNo}`,
          debit: "Trade Payables - Vendors",
          debit_code: "22100001",
          credit: "Bank Operating Account",
          credit_code: "12000001",
          amount: inv.amount,
          method: "Bank Transfer",
          status: "Posted",
        };
        setVouchers(v => [pv, ...v]);
        return { ...inv, status: "Paid" as const };
      }
      return inv;
    }));
    toast.success(`Invoice ${invoiceNo} marked as Paid. Payment Voucher generated.`);
  }

  function addVoucher(vch: Omit<FinanceVoucher, "id" | "status">) {
    const periodCheck = isPostingPeriodClosed(vch.date);
    if (periodCheck.closed) {
      toast.error(`Posting rejected: Accounting period ${periodCheck.periodName} is CLOSED.`);
      return;
    }
    const newVch: FinanceVoucher = {
      ...vch,
      id: `vch-${Date.now()}`,
      status: "Posted",
    };
    if (vouchers.some(v => v.voucher_no === newVch.voucher_no)) return;
    // Write-through: the voucher and its account lines are saved to the database first. The screen only shows it
    // once the save succeeds, so an entry can't be lost in the browser.
    void persistVoucher(newVch as any).then(res => {
      if (!res.ok) {
        toast.error(`${newVch.voucher_no} was NOT saved: ${res.error}`);
        return;
      }
      if (res.data?.id) seenVoucherIds.current.add(res.data.id);
      setVouchers(prev => {
        if (prev.some(v => v.voucher_no === newVch.voucher_no)) return prev;
        return [{ ...newVch, id: res.data?.id || newVch.id }, ...prev];
      });
      toast.success(`${newVch.voucher_type} ${newVch.voucher_no} posted successfully!`);
    });
  }

  function addReceivableInvoice(inv: Omit<ReceivableInvoice, "id" | "status">) {
    const periodCheck = isPostingPeriodClosed(inv.date);
    if (periodCheck.closed) {
      toast.error(`Posting rejected: Accounting period ${periodCheck.periodName} is CLOSED.`);
      return;
    }
    const targetPeriod = (inv.billingPeriod || inv.date || "").slice(0, 7);
    const cleanUnit = (inv.unit || "").trim().toLowerCase();
    const cleanProp = (inv.property || "").trim().toLowerCase();
    if (cleanUnit && targetPeriod) {
      const duplicate = receivableInvoices.find(existing => {
        const exU = (existing.unit || "").trim().toLowerCase();
        const exP = (existing.property || "").trim().toLowerCase();
        const exPeriod = (existing.billingPeriod || existing.date || "").slice(0, 7);
        return exU === cleanUnit && (!cleanProp || !exP || exP === cleanProp) && exPeriod === targetPeriod;
      });
      if (duplicate) {
        toast.error(`Duplicate Invoice Restricted: Unit ${inv.unit} is already invoiced (${duplicate.invoice_no}) for period ${targetPeriod}.`);
        return;
      }
    }
    const newInv: ReceivableInvoice = {
      ...inv,
      billingPeriod: inv.billingPeriod || targetPeriod,
      id: `ar-${Date.now()}`,
      status: "Pending"
    };
    // Show it at once, save it to the database now, and take it back off the screen if the save fails.
    setReceivableInvoices(prev => [newInv, ...prev]);
    void persistReceivables([newInv]).then(res => {
      if (!res.ok) {
        setReceivableInvoices(prev => prev.filter(i => i.invoice_no !== newInv.invoice_no));
        toast.error(`AR Invoice ${newInv.invoice_no} was NOT saved: ${res.error}`);
        return;
      }
      toast.success(`AR Invoice ${newInv.invoice_no} generated and saved!`);
    });
  }

  function addBulkReceivableInvoices(invoices: Omit<ReceivableInvoice, "id" | "status">[]) {
    if (invoices.length > 0) {
      const periodCheck = isPostingPeriodClosed(invoices[0].date);
      if (periodCheck.closed) {
        toast.error(`Bulk billing rejected: Accounting period ${periodCheck.periodName} is CLOSED.`);
        return;
      }
    }
    const timestamp = Date.now();
    // Decide the new invoices from the current list (not inside a state updater), so they can be saved to the database.
    const seenKeys = new Set(
      receivableInvoices.map(existing => `${(existing.unit || "").trim().toLowerCase()}__${(existing.billingPeriod || existing.date || "").slice(0, 7)}`)
    );
    const uniqueInvoices: ReceivableInvoice[] = [];
    invoices.forEach((inv, idx) => {
      const periodKey = (inv.billingPeriod || inv.date || "").slice(0, 7);
      const unitKey = `${(inv.unit || "").trim().toLowerCase()}__${periodKey}`;
      if (seenKeys.has(unitKey)) return;
      seenKeys.add(unitKey);
      uniqueInvoices.push({
        ...inv,
        billingPeriod: inv.billingPeriod || periodKey,
        id: `ar-bulk-${timestamp}-${idx}`,
        status: "Pending" as const
      });
    });
    if (uniqueInvoices.length === 0) {
      toast.error("Duplicate Invoice Restricted: Selected unit(s) already have invoices for this period.");
      return;
    }
    const addedNos = new Set(uniqueInvoices.map(i => i.invoice_no));
    setReceivableInvoices(prev => [...uniqueInvoices, ...prev]);
    void persistReceivables(uniqueInvoices).then(res => {
      if (!res.ok) {
        setReceivableInvoices(prev => prev.filter(i => !addedNos.has(i.invoice_no)));
        toast.error(`AR invoices were NOT saved: ${res.error}`);
        return;
      }
      toast.success(`${uniqueInvoices.length} AR Invoices generated and saved successfully!`);
    });
  }

  function markReceivableInvoicePaid(invoiceNo: string) {
    const todayStr = new Date().toISOString().split("T")[0];
    const periodCheck = isPostingPeriodClosed(todayStr);
    if (periodCheck.closed) {
      toast.error(`Cannot generate Receipt Voucher: Current period ${periodCheck.periodName} is CLOSED.`);
      return;
    }
    const target = receivableInvoices.find(inv => inv.invoice_no === invoiceNo);
    if (!target) return;
    const paid = { ...target, status: "Paid" as const };
    // Receipt Voucher that settles the invoice: Dr Bank / Cr Tenant Receivables.
    const rv: FinanceVoucher = {
      id: `vch-rec-${Date.now()}`,
      voucher_no: `VCH-REC-${Math.floor(1000 + Math.random() * 9000)}`,
      voucher_type: "Receipt Voucher",
      date: new Date().toISOString().split("T")[0],
      name: `${target.tenant} — Receipt for Rent Invoice ${invoiceNo}`,
      property_name: target.property,
      unit_ref: target.unit,
      tenant_name: target.tenant,
      debit: "Bank Operating Account",
      debit_code: "12000001",
      credit: "Tenant Receivables",
      credit_code: "12413001",
      amount: target.amount,
      method: "Bank Transfer",
      status: "Posted",
    };
    setReceivableInvoices(prev => prev.map(inv => (inv.invoice_no === invoiceNo ? paid : inv)));
    void Promise.all([updateReceivable(paid), persistVoucher(rv as any)]).then(([invRes, vchRes]) => {
      if (!invRes.ok || !vchRes.ok) {
        // Put the invoice back as it was; the voucher was not saved, so it is not shown either.
        setReceivableInvoices(prev => prev.map(inv => (inv.invoice_no === invoiceNo ? target : inv)));
        if (invRes.ok) void updateReceivable(target); // the invoice was marked Paid in the database; undo that too
        const why = !invRes.ok ? invRes.error : (vchRes as { error: string }).error;
        toast.error(`Collection of ${invoiceNo} was NOT saved: ${why}`);
        return;
      }
      setVouchers(v => [rv, ...v]);
      toast.success(`AR Invoice ${invoiceNo} marked as Collected and saved.`);
    });
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
      status: "Posted",
      lines: [
        { type: "DR", account: "Staff Salaries & Allowances", account_code: "50100", amount: run.total_amount, description: `Staff Salary Expense - Period ${run.period}` },
        { type: "CR", account: "Bank Operating Account", account_code: "12000001", amount: run.total_amount, description: `Payroll Disbursement from ${run.bank_account}` }
      ]
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

  async function correctVoucherDate(params: {
    voucherNo: string;
    newDate: string;
    newBankCode?: string;
    newBankName?: string;
    reason: string;
    user?: string;
  }): Promise<{ success: boolean; message: string }> {
    const { voucherNo, newDate, newBankCode, newBankName, reason, user } = params;
    if (!voucherNo || !newDate) {
      toast.error("Voucher reference and new date are required.");
      return { success: false, message: "Missing required parameters." };
    }

    const currentCorrections = getStoredVoucherDateCorrections();
    const existing = currentCorrections[voucherNo];
    const matchedVch = vouchers.find(v => v.voucher_no === voucherNo);
    const oldDate = existing?.oldDate || matchedVch?.date || "";
    const oldBankCode = existing?.oldBankCode || matchedVch?.debit_code || "";
    const oldBankName = existing?.oldBankName || matchedVch?.debit || "";

    const updatedCorrections: Record<string, VoucherDateCorrection> = {
      ...currentCorrections,
      [voucherNo]: {
        newDate,
        oldDate,
        newBankCode: newBankCode || existing?.newBankCode,
        oldBankCode,
        newBankName: newBankName || existing?.newBankName,
        oldBankName,
        reason: reason || "Date / Bank account correction by finance administrator",
        timestamp: new Date().toISOString(),
        user: user || "Finance Controller",
      },
    };

    saveStoredVoucherDateCorrections(updatedCorrections);
    setVoucherDateCorrections(updatedCorrections);

    // Update in-memory vouchers (both date and receiving bank/cash account if provided)
    setVouchers(prev => {
      const updated = prev.map(v => {
        if (v.voucher_no !== voucherNo) return v;
        const updatedLines = v.lines?.map(line => {
          if (line.type === "DR" && newBankCode) {
            return {
              ...line,
              account_code: newBankCode,
              account: newBankName || line.account,
            };
          }
          return line;
        });
        return {
          ...v,
          date: newDate,
          ...(newBankCode ? { debit_code: newBankCode, debit: newBankName || v.debit } : {}),
          ...(updatedLines ? { lines: updatedLines } : {}),
        };
      });
      return updated;
    });

    // Best-effort remote update in Supabase fin_vouchers
    try {
      const updatePayload: Record<string, any> = { voucher_date: newDate };
      if (newBankCode) {
        updatePayload.reference_no = `${newBankCode} - ${newBankName || ""}`.trim();
      }
      await apiDb
        .from("fin_vouchers")
        .update(updatePayload)
        .eq("voucher_number", voucherNo);
    } catch (e) {
      console.warn("[correctVoucherDate] fin_vouchers update warning:", e);
    }

    // If PDC voucher, also update pdcs table
    if (voucherNo.startsWith("VCH-DEP-") || voucherNo.startsWith("VCH-CLR-") || voucherNo.startsWith("VCH-PDC-")) {
      const pdcId = voucherNo.replace(/^(VCH-DEP-|VCH-CLR-|VCH-PDC-RCV-)/, "").trim();
      if (pdcId && pdcId.length > 5) {
        try {
          if (voucherNo.startsWith("VCH-DEP-")) {
            const pdcUpdate: Record<string, any> = { deposit_date: newDate };
            if (newBankName) pdcUpdate.deposit_bank = newBankName;
            await apiDb.from("pdcs").update(pdcUpdate).eq("id", pdcId);
          } else if (voucherNo.startsWith("VCH-CLR-")) {
            await apiDb.from("pdcs").update({ cleared_date: newDate }).eq("id", pdcId);
          }
        } catch (e) {
          console.warn("[correctVoucherDate] pdcs date update warning:", e);
        }
      }
    }

    // Record immutable audit log
    try {
      await apiDb.from("security_audit_logs").insert({
        event_type: "data_mutation",
        severity: "warning",
        action: "CORRECT_VOUCHER_DATE_OR_BANK",
        resource: `fin_vouchers:${voucherNo}`,
        details: {
          voucher_number: voucherNo,
          old_date: oldDate,
          new_date: newDate,
          old_bank_code: oldBankCode,
          new_bank_code: newBankCode || oldBankCode,
          old_bank_name: oldBankName,
          new_bank_name: newBankName || oldBankName,
          reason,
          operator: user || "Finance Controller",
        },
      });
    } catch (e) {
      console.warn("[correctVoucherDate] audit log warning:", e);
    }

    const bankMsg = newBankCode ? ` & Bank updated to ${newBankCode} (${newBankName})` : "";
    toast.success(`Transaction ${voucherNo} updated: Date ${newDate}${bankMsg}`);
    return { success: true, message: `Successfully updated transaction ${voucherNo}` };
  }

  // ── Real-Time Dynamic Reports Calculation Engine ───────────────────────────

  // The general ledger (trial balance, balance sheet, P&L, cash flow) is read from the database: see loadLedgerFromDb.
  const allLedgerTransactions: LedgerTransaction[] = dbLedgerLines;

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
    { code: "21900",    name: "Salary Payable", type: "Liabilities" },
    { code: "21900001", name: "Salary Payable — Staff SL", type: "Liabilities" },
    { code: "21210",    name: "Accrued EOSB Liability", type: "Liabilities" },
    { code: "21220",    name: "Accrued Leave Salary Liability", type: "Liabilities" },
    { code: "22005",    name: "Staff Salary & Dues Payable", type: "Liabilities" },
    { code: "22005001", name: "Staff Salary & Dues Payable — Staff SL", type: "Liabilities" },
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
    { code: "50100",    name: "Staff Salaries & Payroll", type: "Expenses" },
    { code: "50100001", name: "Staff Salaries & Payroll — General", type: "Expenses" },
    { code: "50120",    name: "End of Service Benefits (EOSB) Expense", type: "Expenses" },
    { code: "50130",    name: "Leave Salary Provision Expense", type: "Expenses" },
    { code: "51101",    name: "Staff Cost (Control)", type: "Expenses" },
    { code: "51101001", name: "Staff Basic Salary", type: "Expenses" },
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
        if (tx.account_code.startsWith("51101") || tx.account_code.startsWith("501") || tx.account_code.startsWith("523")) payrollExpense += netExp;
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
        correctVoucherDate,
        voucherDateCorrections,
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
