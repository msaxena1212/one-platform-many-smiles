import { supabase } from '@/lib/supabase';

export interface CompanyBankAccount {
  id: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  glCode: string;
  glName: string;
  currency: string;
  branch?: string;
  isDefault?: boolean;
}

export const DEFAULT_COMPANY_BANK_ACCOUNTS: CompanyBankAccount[] = [
  {
    id: "qnb-main-01",
    bankName: "Qatar National Bank (QNB)",
    accountTitle: "QNB Main Operating Account",
    accountNumber: "0013-128940-001",
    iban: "QA42QNBA00000000123456",
    glCode: "12000001",
    glName: "Bank Operating Account (QNB)",
    currency: "QAR",
    branch: "Grand Hamad Main Branch",
    isDefault: true,
  },
  {
    id: "cbq-escrow-02",
    bankName: "Commercial Bank of Qatar (CBQ)",
    accountTitle: "CBQ Rental Collection & Escrow",
    accountNumber: "0045-882319-002",
    iban: "QA99CBQA00000000654321",
    glCode: "12000002",
    glName: "CBQ Escrow Bank Account",
    currency: "QAR",
    branch: "West Bay Corporate Branch",
  },
  {
    id: "doha-bank-03",
    bankName: "Doha Bank",
    accountTitle: "Doha Bank Operational Account",
    accountNumber: "0078-439201-003",
    iban: "QA33DHBK00000000987654",
    glCode: "12000003",
    glName: "Doha Bank Operating Account",
    currency: "QAR",
    branch: "Corniche Branch",
  },
  {
    id: "qib-rental-04",
    bankName: "Qatar Islamic Bank (QIB)",
    accountTitle: "QIB Islamic Rental Account",
    accountNumber: "0091-554210-004",
    iban: "QA77QISB00000000456789",
    glCode: "12000004",
    glName: "QIB Islamic Rental Account",
    currency: "QAR",
    branch: "Salwa Road Branch",
  },
  {
    id: "ahlibank-corp-05",
    bankName: "Ahlibank Qatar",
    accountTitle: "Ahlibank Corporate Treasury",
    accountNumber: "0033-671290-005",
    iban: "QA55AHLI00000000321654",
    glCode: "12000005",
    glName: "Ahlibank Corporate Account",
    currency: "QAR",
    branch: "Al Sadd Branch",
  },
];

/**
 * Fetch company bank accounts from fin_bank_accounts or fallback to standard master list.
 */
export async function fetchCompanyBankAccounts(): Promise<CompanyBankAccount[]> {
  try {
    const { data, error } = await (supabase as any)
      .from('fin_bank_accounts')
      .select('*, fin_banks(name, code, swift_code)')
      .limit(50);

    if (error || !data || data.length === 0) {
      return DEFAULT_COMPANY_BANK_ACCOUNTS;
    }

    return data.map((item: any, idx: number) => ({
      id: String(item.id || `bank-acc-${idx}`),
      bankName: item.fin_banks?.name || item.bank_name || 'Operating Bank',
      accountTitle: item.account_title || item.name || 'Bank Operating Account',
      accountNumber: item.account_number || '',
      iban: item.iban || item.account_number || '',
      glCode: item.gl_code || (idx === 0 ? '12000001' : `1200000${idx + 1}`),
      glName: item.gl_name || item.account_title || 'Bank Account',
      currency: item.currency || 'QAR',
      branch: item.branch,
      isDefault: idx === 0,
    }));
  } catch {
    return DEFAULT_COMPANY_BANK_ACCOUNTS;
  }
}
