import { supabase } from './supabase';

// ── Extended Finance Data Types & API Helpers ─────────────────────────────────

export type FinFinancialYear = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'Active' | 'Closed' | 'Upcoming';
};

export type FinRegion = {
  id: string;
  code: string;
  name: string;
  currency?: string;
  country?: string;
  status?: string;
};

export type FinVendor = {
  id: string;
  code: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  tax_number?: string;
  status: 'Active' | 'Inactive';
  vendor_type?: string;
  payment_terms?: string;
  settlement_mode?: string;
  currency?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
};

export type FinCustomer = {
  id: string;
  code: string;
  name: string;
  type: string;
  email?: string;
  phone?: string;
  credit_limit: number;
};

export type FinCostCenter = {
  id: string;
  code: string;
  name: string;
  manager?: string;
};

export type FinPostingPeriod = {
  id: string;
  period_name: string;
  year: number | string;
  month: number;
  status: 'Open' | 'Closed';
};

export type FinBank = {
  id: string;
  code: string;
  name: string;
  swift_code?: string;
};

export type FinBankAccount = {
  id: string;
  bank_id?: string;
  account_number: string;
  account_title: string;
  currency: string;
  opening_balance: number;
};

export type FinBankReconciliation = {
  id: string;
  account_number: string;
  statement_date: string;
  statement_balance: number;
  book_balance: number;
  status: string;
};

export type FinContract = {
  id: string;
  contract_number: string;
  title: string;
  party_name: string;
  type: 'Expense' | 'Revenue';
  total_value: number;
  start_date: string;
  end_date: string;
  status: string;
};

export type FinCoaAccount = {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  parent_id?: number;
  is_active: boolean;
};

export type FinVoucher = {
  id: string;
  voucher_number: string;
  voucher_date: string;
  voucher_type: string;
  reference_no?: string;
  description?: string;
  total_amount: number;
  status: string;
  posted_by?: string;
  posted_at?: string;
};

export type FinVoucherLine = {
  id: string;
  voucher_id: string;
  account_id: string;
  cost_center_id?: string;
  property_id?: string;
  unit_id?: string;
  tenant_id?: string;
  vendor_id?: string;
  debit_amount: number;
  credit_amount: number;
  description?: string;
};

export type FinPdcRegister = {
  id: string;
  cheque_number: string;
  bank_id?: string;
  cheque_date: string;
  amount: number;
  tenant_id?: string;
  property_id?: string;
  unit_id?: string;
  lease_id?: string;
  status: string;
  deposit_date?: string;
  cleared_date?: string;
  returned_date?: string;
  original_pdc_id?: number;
};

export type FinLegalReceivable = {
  id: string;
  tenant_id: string;
  property_id?: string;
  unit_id?: string;
  lease_id?: string;
  original_amount: number;
  outstanding_balance: number;
  escalation_date: string;
  reason?: string;
  legal_case_id?: string;
  status: string;
};

export type FinDeposit = {
  id: string;
  deposit_type: string;
  coa_account_code: string;
  amount: number;
  tenant_id: string;
  property_id?: string;
  unit_id?: string;
  lease_id?: string;
  status: string;
  receipt_ref?: string;
  deduction_amount?: number;
  refund_amount?: number;
  settled_at?: string;
};

export type FinPayrollSync = {
  id: string;
  payroll_run_id: string;
  period: string;
  status: string;
  total_amount?: number;
  error_details?: string;
};

// Generic CRUD helper generator
function createFinanceCrud<T extends { id: string }>(tableName: string, defaultSort = 'id') {
  return {
    fetchAll: async (): Promise<T[]> => {
      const { data, error } = await supabase.from(tableName).select('*').order(defaultSort);
      if (error) throw error;
      return data || [];
    },
    create: async (payload: Omit<T, 'id'>): Promise<T> => {
      const { data, error } = await supabase.from(tableName).insert(payload as any).select().single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, payload: Partial<Omit<T, 'id'>>): Promise<void> => {
      const { error } = await supabase.from(tableName).update(payload as any).eq('id', id);
      if (error) throw error;
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
    }
  };
}

export const FinFinancialYearsApi = createFinanceCrud<FinFinancialYear>('fin_financial_years', 'name');
export const FinRegionsApi = createFinanceCrud<FinRegion>('fin_regions', 'code');
export const FinVendorsApi = createFinanceCrud<FinVendor>('fin_vendors', 'code');
export const FinCustomersApi = createFinanceCrud<FinCustomer>('fin_customers', 'code');
export const FinCostCentersApi = createFinanceCrud<FinCostCenter>('fin_cost_centers', 'code');
export const FinPostingPeriodsApi = createFinanceCrud<FinPostingPeriod>('fin_posting_periods', 'period_name');
export const FinBanksApi = createFinanceCrud<FinBank>('fin_banks', 'name');
export const FinBankAccountsApi = createFinanceCrud<FinBankAccount>('fin_bank_accounts', 'account_number');
export const FinBankReconciliationsApi = createFinanceCrud<FinBankReconciliation>('fin_bank_reconciliations', 'statement_date');
export const FinContractsApi = createFinanceCrud<FinContract>('fin_contracts', 'contract_number');
export const FinCoaAccountsApi = createFinanceCrud<FinCoaAccount>('fin_coa_accounts', 'account_code');
export const FinVouchersApi = createFinanceCrud<FinVoucher>('fin_vouchers', 'voucher_date');
export const FinVoucherLinesApi = createFinanceCrud<FinVoucherLine>('fin_voucher_lines', 'id');
export const FinPdcRegisterApi = createFinanceCrud<FinPdcRegister>('fin_pdc_register', 'cheque_date');
export const FinLegalReceivablesApi = createFinanceCrud<FinLegalReceivable>('fin_legal_receivables', 'escalation_date');
export const FinDepositsApi = createFinanceCrud<FinDeposit>('fin_deposits', 'id');
export const FinPayrollSyncsApi = createFinanceCrud<FinPayrollSync>('fin_payroll_syncs', 'period');
