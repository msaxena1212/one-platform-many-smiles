import { createContext, useContext, useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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
  voucher_type: "Journal Voucher" | "Payment Voucher" | "Receipt Voucher";
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
}

const FinanceContext = createContext<FinanceStoreContextType | null>(null);

const STORE_KEY = "zyno-finance-store-v1";

export function FinanceProvider({ children }: { children: ReactNode }) {
  // ── States ────────────────────────────────────────────────────────────────
  const [journalEntries, setJournalEntries] = useState<JournalLedgerEntry[]>(INITIAL_JOURNAL_LEDGER);
  const [grnMappings, setGrnMappings] = useState<GrnCostMapping[]>(INITIAL_GRN_MAPPINGS);
  const [payableInvoices, setPayableInvoices] = useState<PayableInvoice[]>(INITIAL_PAYABLE_INVOICES);
  const [vouchers, setVouchers] = useState<FinanceVoucher[]>(INITIAL_VOUCHERS);
  const [receivableInvoices, setReceivableInvoices] = useState<ReceivableInvoice[]>(INITIAL_RECEIVABLE_INVOICES);
  const [legalReceivables, setLegalReceivables] = useState<LegalReceivable[]>(INITIAL_LEGAL_RECEIVABLES);
  const [payrollSyncs, setPayrollSyncs] = useState<PayrollSyncRun[]>(INITIAL_PAYROLL_SYNCS);
  const [bankClearances, setBankClearances] = useState<BankClearanceEntry[]>(INITIAL_BANK_CLEARANCES);
  const [bankReconciliations, setBankReconciliations] = useState<BankReconciliationRecord[]>(INITIAL_BANK_RECONCILIATIONS);
  const [reconciliationStatements, setReconciliationStatements] = useState<ReconciliationStatementArchive[]>(INITIAL_RECON_STATEMENTS);
  const [cashBookEntries, setCashBookEntries] = useState<CashBookEntry[]>(INITIAL_CASH_BOOK);
  const [pettyCashEntries, setPettyCashEntries] = useState<PettyCashEntry[]>(INITIAL_PETTY_CASH);

  // ── Supabase: initial pull + realtime subscriptions ───────────────────────
  // Track seen fin_voucher IDs to avoid duplicate toasts on startup.
  const seenVoucherIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 1. Pull existing fin_vouchers from Supabase and merge into local vouchers state.
    supabase
      .from("fin_vouchers")
      .select("*")
      .order("voucher_date", { ascending: false })
      .then(({ data }) => {
        if (!data?.length) return;
        setVouchers(prev => {
          const existingNos = new Set(prev.map(v => v.voucher_no));

          const mapped: FinanceVoucher[] = data
            .filter(r => !existingNos.has(r.voucher_number))
            .map(r => {


              const isPV = r.voucher_type === "PV";
              const isRV = r.voucher_type === "RV";
              return {
                id: r.id,
                voucher_no: r.voucher_number,
                voucher_type: (isPV ? "Payment Voucher" : isRV ? "Receipt Voucher" : "Journal Voucher") as FinanceVoucher["voucher_type"],
                date: r.voucher_date,
                name: r.description || r.voucher_number,
                debit: isPV ? "Accounts Payable / Expense" : isRV ? "Bank Operating Account" : "Journal Debit",
                debit_code: isPV ? (r.reference_no && /^\d+$/.test(r.reference_no) ? r.reference_no : "20100") : "12000",
                credit: isPV ? "Bank Operating Account" : isRV ? "Rental Revenue" : "Journal Credit",
                credit_code: isPV ? "12000" : (r.reference_no && /^\d+$/.test(r.reference_no) ? r.reference_no : "41100"),
                amount: Number(r.total_amount) || 0,
                status: r.status === "posted" ? "Posted" : "Draft" as FinanceVoucher["status"],
              };
            });

          return mapped.length ? [...mapped, ...prev] : prev;
        });
        // Mark them as already-known so realtime won't re-toast them.
        data.forEach(r => seenVoucherIds.current.add(r.id));
      });
    // Graceful degradation — local seed data remains if Supabase is unreachable.

    // 2. Pull journal_entries from Supabase and merge.
    supabase
      .from("journal_entries")
      .select("*, journal_lines(*, gl_accounts(code, name_en))")
      .order("posting_date", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (!data?.length) return;
        setJournalEntries(prev => {
          const existingNos = new Set(prev.map(j => j.je_no));
          const mapped: JournalLedgerEntry[] = data
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
      });
    // Graceful degradation — local seed data remains if journal_entries is unreachable.

    // 3. Subscribe to fin_vouchers INSERT events for real-time updates.
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
            debit_code: isPV ? (r.reference_no && /^\d+$/.test(r.reference_no) ? r.reference_no : "20100") : "12000",
            credit: isPV ? "Bank Operating Account" : isRV ? "Rental Revenue" : "Journal Credit",
            credit_code: isPV ? "12000" : (r.reference_no && /^\d+$/.test(r.reference_no) ? r.reference_no : "41100"),
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

    // 4. Subscribe to fin_accounting_events for visibility into posting-engine writes.
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

    return () => {
      supabase.removeChannel(voucherChannel);
      supabase.removeChannel(eventChannel);
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
          debit_code: inv.account_code || "20100",
          credit: "Bank Operating Account",
          credit_code: "12000",
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
    setVouchers(prev => [newVch, ...prev]);
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
          debit_code: "12000",
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
    setLegalReceivables(prev => prev.map(l => {
      if (l.legal_case_id === caseId || l.id === caseId) {
        const newBal = Math.max(0, l.outstanding_balance - amount);
        const isCash = paymentMethod.toLowerCase().includes("cash");
        const isCheque = paymentMethod.toLowerCase().includes("cheque");
        const isPdc = paymentMethod.toLowerCase().includes("pdc");

        const drCode = isCash ? "12100" : isPdc ? "12900" : "12000";
        const drAccount = isCash ? "Cash in Hand / Till" : isPdc ? "PDC In Hand" : isCheque ? `Bank Operating Account (Cheque: ${details?.chequeBank || "Bank"})` : "Bank Operating Account";

        const finalProp = propertyName || l.property_name || "Old Salata - Residence No:23";
        const finalUnit = unitRef || l.unit_ref || "Unit";
        const finalTenant = tenantName || l.tenant_name || "Valued Tenant";
        const entryDate = details?.date || new Date().toISOString().split("T")[0];

        let detailNarration = "";
        if (isCheque) {
          detailNarration = ` [Chq #${details?.chequeNo || bankRef} | ${details?.chequeBank || "Bank"} | Mat: ${details?.maturityDate || entryDate}]`;
        } else if (paymentMethod.includes("Bank")) {
          detailNarration = ` [Tx #${details?.transactionNo || bankRef}]`;
        }

        // Post Receipt Voucher
        const rv: FinanceVoucher = {
          id: `vch-rec-lgl-${Date.now()}`,
          voucher_no: `VCH-REC-${bankRef}`,
          voucher_type: "Receipt Voucher",
          date: entryDate,
          name: `Legal Settlement Recovery — ${finalTenant} (${finalUnit}) [${caseId}]${detailNarration}`,
          debit: drAccount,
          debit_code: drCode,
          credit: "Legal Receivables",
          credit_code: "12411",
          amount: amount,
          method: paymentMethod,
          status: "Posted",
          property_name: finalProp,
          unit_ref: finalUnit,
          tenant_name: finalTenant,
        };
        setVouchers(v => [rv, ...v]);
        return {
          ...l,
          outstanding_balance: newBal,
          status: newBal <= 0 ? ("Fully Recovered" as const) : ("Partially Recovered" as const)
        };
      }
      return l;
    }));
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
      credit_code: "12000",
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
    const lastBal = cashBookEntries[0]?.balance || 24500;
    const newBal = entry.type === "in" ? lastBal + entry.amount : lastBal - entry.amount;
    const newEntry: CashBookEntry = {
      id: `cb-${Date.now()}`,
      date: entry.date,
      voucher: entry.voucher,
      description: entry.description,
      cash_in: entry.type === "in" ? entry.amount : 0,
      cash_out: entry.type === "out" ? entry.amount : 0,
      balance: newBal
    };
    setCashBookEntries(prev => [newEntry, ...prev]);
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

    // Standard Chart of Accounts Master Names Dictionary
    const COA_ACCOUNT_NAMES: Record<string, string> = {
      "10000": "Assets Control Account",
      "10100": "Cash In Hand",
      "12000": "Bank Operating Account",
      "12001": "CBQ Escrow Bank Account",
      "12100": "Cash In Hand / Operating Cash",
      "12400": "Receivables Control",
      "12411": "Legal Receivables (Defaulted / Escalated)",
      "12413": "Tenant Receivables",
      "12900": "PDC In Hand",
      "13000": "Fixed Assets Portfolio",
      "13900": "Accumulated Depreciation",
      "20000": "Liabilities Control Account",
      "20100": "Accounts Payable (Vendors)",
      "21100": "Security Deposit Payable (Refundable)",
      "21300": "Tenant Refund Payable",
      "21400": "Customer PDC Liability",
      "21500": "Security Deposit Liability",
      "21600": "Utility Deposit Liability",
      "30000": "Owner Capital & Equity",
      "40000": "Revenue Control Account",
      "41100": "Rental Revenue / Income",
      "41200": "Parking Revenue",
      "41201": "Agency & Admin Commission",
      "41300": "Utility Recovery Income",
      "41400": "CAM & Maintenance Recovery",
      "41500": "Property Management Fees",
      "41600": "Late Payment Penalty Income",
      "50000": "Expenses Control Account",
      "50100": "Staff Salaries & Payroll",
      "50200": "Repairs & Maintenance Expenses",
      "50300": "Cleaning & Sanitation Services",
      "50500": "Electricity & Water (Kahramaa)",
      "50900": "Depreciation Expense",
    };

    const getCoaName = (name: string | undefined, code: string | undefined, defaultFallback: string) => {
      const trimmedName = (name || "").trim();
      const trimmedCode = (code || "").trim();
      // If the name is missing or is just numeric digits (like "12000" or "21500") or equal to the code:
      if (!trimmedName || /^\d+$/.test(trimmedName) || trimmedName === trimmedCode) {
        if (trimmedCode && COA_ACCOUNT_NAMES[trimmedCode]) return COA_ACCOUNT_NAMES[trimmedCode];
        return defaultFallback;
      }
      return trimmedName;
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
      if ((!derivedProperty || derivedProperty === "Main Portfolio") && derivedUnit) {
        const u = derivedUnit.toLowerCase();
        if (u.includes("flat16") || u.includes("aaa")) {
          derivedProperty = "Old Salata - Residence No:23";
        } else if (u.includes("flat14") || u.includes("flat08") || u.includes("bldg06") || u.includes("mansoura")) {
          derivedProperty = "MANSOURA - BLDG06";
        } else if (u.includes("002") || u.includes("neeman")) {
          derivedProperty = "Neeman's New Building";
        }
      }

      const finalProperty = derivedProperty && derivedProperty !== "Main Portfolio" ? derivedProperty : (derivedUnit && derivedUnit !== "General" ? (derivedUnit.includes("Flat14") ? "MANSOURA - BLDG06" : "Old Salata - Residence No:23") : "Main Portfolio");
      const finalUnit = derivedUnit || "General";
      const finalTenant = derivedTenant || "Corporate / Admin";

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
        account_code: grn.mapped_code || "50200",
        account_name: getCoaName(grn.mapped_gl, grn.mapped_code, "Repairs & Maintenance"),
        account_type: grn.mapped_code?.startsWith("1") ? "Assets" : "Expenses",
        reference: grn.grn_no,
        debit: grn.amount,
        credit: 0,
        source: "GRN Cost Mapping",
        description: `${grn.vendor} - ${grn.description}`,
        property_name: grn.property || "Main Portfolio",
        unit_ref: "Facility Plant & Equip",
        tenant_name: grn.vendor,
      });
      list.push({
        id: `tx-grn-cr-${grn.id}`,
        date: "2026-08-18",
        account_code: "20100",
        account_name: "Accounts Payable",
        account_type: "Liabilities",
        reference: grn.grn_no,
        debit: 0,
        credit: grn.amount,
        source: "GRN Cost Mapping",
        description: `Payable to ${grn.vendor}`,
        property_name: grn.property || "Main Portfolio",
        unit_ref: "Facility Plant & Equip",
        tenant_name: grn.vendor,
      });
    });

    // 3. Payable Invoices (Expense Dr, AP Cr)
    payableInvoices.forEach(ap => {
      list.push({
        id: `tx-ap-dr-${ap.id}`,
        date: ap.date,
        account_code: ap.account_code || "50200",
        account_name: getCoaName(ap.account, ap.account_code, "Repairs & Maintenance"),
        account_type: "Expenses",
        reference: ap.invoice_no,
        debit: ap.amount,
        credit: 0,
        source: "Payable Invoice",
        description: `Invoice from ${ap.vendor}`,
        property_name: "Old Salata - Residence No:23",
        unit_ref: "Building Maintenance",
        tenant_name: ap.vendor,
      });
      list.push({
        id: `tx-ap-cr-${ap.id}`,
        date: ap.date,
        account_code: "20100",
        account_name: "Accounts Payable",
        account_type: "Liabilities",
        reference: ap.invoice_no,
        debit: 0,
        credit: ap.amount,
        source: "Payable Invoice",
        description: `Payable to ${ap.vendor}`,
        property_name: "Old Salata - Residence No:23",
        unit_ref: "Building Maintenance",
        tenant_name: ap.vendor,
      });
    });

    // 4. Vouchers (Journal, Payment, Receipt)
    vouchers.forEach(vch => {
      const isDrExp = vch.debit_code.startsWith("5");
      const isDrAsset = vch.debit_code.startsWith("1");
      const isDrLiab = vch.debit_code.startsWith("2");

      let propName = (vch as any).property_name || (vch as any).property;
      let unitName = (vch as any).unit_ref || (vch as any).unit;
      let tenantName = (vch as any).tenant_name || (vch as any).tenant;

      if ((!tenantName || tenantName === "Corporate / Admin") && vch.name) {
        const slashMatch = vch.name.match(/[—–\-]\s*([^(|—–\-/]+?)\s*\/\s*([^(|—–\-/]+)/);
        if (slashMatch && slashMatch[1]?.trim() && slashMatch[1].trim() !== "Tenant") {
          tenantName = slashMatch[1].trim();
          if (!unitName || unitName === "General") unitName = slashMatch[2].trim();
        } else {
          const parenMatch = vch.name.match(/[—–\-]\s*([^(|—–\-]+?)\s*\(([^)]+)\)/);
          if (parenMatch && parenMatch[1]?.trim() && parenMatch[1].trim() !== "Tenant") {
            tenantName = parenMatch[1].trim();
            if (!unitName || unitName === "General") unitName = parenMatch[2].trim();
          } else {
            const dashMatch = vch.name.match(/[—–\-]\s*([^|—–\-]+)/);
            if (dashMatch && dashMatch[1]?.trim()) {
              tenantName = dashMatch[1].trim();
            }
          }
        }
      }

      if ((!propName || propName === "Main Portfolio") && unitName) {
        const u = unitName.toLowerCase();
        if (u.includes("flat16") || u.includes("aaa")) propName = "Old Salata - Residence No:23";
        else if (u.includes("flat14") || u.includes("flat08") || u.includes("mansoura")) propName = "MANSOURA - BLDG06";
        else if (u.includes("002") || u.includes("neeman")) propName = "Neeman's New Building";
      }

      const finalProp = propName || (vch.name.includes("Depreciation") ? "Main Portfolio (Corporate)" : "Main Portfolio");
      const finalUnit = unitName || (vch.name.includes("Depreciation") ? "Fixed Assets / Depr" : "General");
      const finalTenant = tenantName || (vch.name.includes("Depreciation") ? "Internal Assets Desk" : "Corporate / Admin");

      list.push({
        id: `tx-vch-dr-${vch.id}`,
        date: vch.date,
        account_code: vch.debit_code || "12000",
        account_name: getCoaName(vch.debit, vch.debit_code, "Bank Operating Account"),
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

      const isCrRev = vch.credit_code.startsWith("4");
      const isCrAsset = vch.credit_code.startsWith("1");
      const isCrLiab = vch.credit_code.startsWith("2");

      list.push({
        id: `tx-vch-cr-${vch.id}`,
        date: vch.date,
        account_code: vch.credit_code || "41100",
        account_name: getCoaName(vch.credit, vch.credit_code, "Rental Revenue"),
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
        const drCode = isUtilityOrPayment ? "20100" : "12000";
        const drName = isUtilityOrPayment ? "Accounts Payable (Utility/Disbursement)" : "Bank Operating Account (Cleared Funds)";
        const crCode = isUtilityOrPayment ? "12000" : "12900";
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

  // Derived Trial Balance Summary — 100% computed from allLedgerTransactions
  const trialBalanceSummary = useMemo(() => {
    let assets = 0;
    let liabilities = 0;
    let capital = 0;
    let revenue = 0;
    let expenses = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    allLedgerTransactions.forEach(tx => {
      totalDebit += (tx.debit || 0);
      totalCredit += (tx.credit || 0);

      // In trial balance: normal balance for Assets and Expenses is Debit, Liabilities/Capital/Revenue is Credit
      if (tx.account_type === "Assets") {
        assets += ((tx.debit || 0) - (tx.credit || 0));
      } else if (tx.account_type === "Liabilities") {
        liabilities += ((tx.credit || 0) - (tx.debit || 0));
      } else if (tx.account_type === "Capital") {
        capital += ((tx.credit || 0) - (tx.debit || 0));
      } else if (tx.account_type === "Revenue") {
        revenue += ((tx.credit || 0) - (tx.debit || 0));
      } else if (tx.account_type === "Expenses") {
        expenses += ((tx.debit || 0) - (tx.credit || 0));
      }
    });

    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    return {
      assets,
      liabilities,
      capital,
      revenue,
      expenses,
      totalDebit,
      totalCredit,
      isBalanced
    };
  }, [allLedgerTransactions]);

  // Derived Trial Balance Detailed — 100% computed from allLedgerTransactions
  const trialBalanceDetailed = useMemo(() => {
    const map = new Map<string, { code: string; name: string; type: "Assets" | "Liabilities" | "Capital" | "Revenue" | "Expenses"; debit: number; credit: number }>();

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
  }, [allLedgerTransactions]);

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
        if (tx.account_code.startsWith("411")) rentalRevenue += netRev;
        else otherRevenue += netRev;
      } else if (tx.account_type === "Expenses") {
        const netExp = (tx.debit || 0) - (tx.credit || 0);
        totalExpenses += netExp;
        if (tx.account_code.startsWith("501")) payrollExpense += netExp;
        else if (tx.account_code.startsWith("502")) maintenanceExpense += netExp;
        else if (tx.account_code.startsWith("503")) cleaningExpense += netExp;
        else if (tx.account_code.startsWith("505")) utilitiesExpense += netExp;
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
        if (tx.account_code.startsWith("10") || tx.account_code.startsWith("120")) bankCashAssets += netAsset;
        else if (tx.account_code.startsWith("129")) pdcInHandAssets += netAsset;
        else if (tx.account_code.startsWith("12411")) legalReceivablesAssets += netAsset;
        else if (tx.account_code.startsWith("124")) arReceivablesAssets += netAsset;
        else fixedAssets += netAsset;
      } else if (tx.account_type === "Liabilities") {
        const netLiab = (tx.credit || 0) - (tx.debit || 0);
        totalLiabilities += netLiab;
        if (tx.account_code.startsWith("201")) apLiabilities += netLiab;
        else if (tx.account_code.startsWith("214")) pdcCustomerLiabilities += netLiab;
        else if (tx.account_code.startsWith("215") || tx.account_code.startsWith("211")) securityDepositLiabilities += netLiab;
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


  // Derived Cash Flow Report
  const cashFlowReport = useMemo(() => {
    let operatingInflow = 280000;
    let operatingOutflow = 135000;

    receivableInvoices.forEach(ar => {
      if (ar.status === "Paid") operatingInflow += ar.amount;
    });

    payableInvoices.forEach(ap => {
      if (ap.status === "Paid") operatingOutflow += ap.amount;
    });

    payrollSyncs.forEach(p => {
      operatingOutflow += p.total_amount;
    });

    // Include physical cash transactions from the Cash Book
    cashBookEntries.forEach(cb => {
      operatingInflow  += cb.cash_in  || 0;
      operatingOutflow += cb.cash_out || 0;
    });

    const netOperatingCash = operatingInflow - operatingOutflow;
    const investingCash = -50000;
    const financingCash = 0;
    const netCashChange = netOperatingCash + investingCash + financingCash;
    const endingCashBalance = 1950000 + netCashChange;

    return {
      operatingInflow,
      operatingOutflow,
      netOperatingCash,
      investingCash,
      financingCash,
      netCashChange,
      endingCashBalance
    };
  }, [receivableInvoices, payableInvoices, payrollSyncs, cashBookEntries]);


  // Derived Cash On Hand Position
  const cashOnHandPosition = useMemo(() => {
    let vaultCash = 24500;
    let pettyCashFloat = 1850;
    let siteDesks = 3200;

    cashBookEntries.forEach(cb => {
      vaultCash += (cb.cash_in - cb.cash_out);
    });

    pettyCashEntries.forEach(pc => {
      pettyCashFloat -= pc.amount;
    });

    vaultCash = Math.max(vaultCash, 15000);
    pettyCashFloat = Math.max(pettyCashFloat, 1200);

    return {
      vaultCash,
      pettyCashFloat,
      siteDesks,
      totalCashOnHand: vaultCash + pettyCashFloat + siteDesks
    };
  }, [cashBookEntries, pettyCashEntries]);

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
        cashOnHandPosition
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
