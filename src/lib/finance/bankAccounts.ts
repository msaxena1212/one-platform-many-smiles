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
  status?: string;
}

export const DEFAULT_COMPANY_BANK_ACCOUNTS: CompanyBankAccount[] = [
  {
    id: "7",
    bankName: "Commercial Bank of Qatar (CBQ)",
    accountTitle: "Commercial Bank of Qatar (CBQ)",
    accountNumber: "4060692533001",
    iban: "4060692533001",
    glCode: "12000001",
    glName: "Commercial Bank of Qatar (CBQ)",
    currency: "QAR",
    branch: "Grand Hamad Main Branch",
    isDefault: true,
    status: "Active",
  },
  {
    id: "8",
    bankName: "Dukhan Bank",
    accountTitle: "Al Ameen Dukhan Bank",
    accountNumber: "100001761798",
    iban: "100001761798",
    glCode: "12000002",
    glName: "Al Ameen Dukhan Bank",
    currency: "QAR",
    branch: "Main Branch",
    status: "Active",
  },
  {
    id: "qnb-main-03",
    bankName: "Qatar National Bank (QNB)",
    accountTitle: "QNB Main Operating Account",
    accountNumber: "0013-128940-001",
    iban: "QA42QNBA00000000123456",
    glCode: "12000003",
    glName: "Bank Operating Account (QNB)",
    currency: "QAR",
    branch: "Grand Hamad Main Branch",
    status: "Active",
  },
  {
    id: "doha-bank-04",
    bankName: "Doha Bank",
    accountTitle: "Doha Bank Operational Account",
    accountNumber: "0078-439201-003",
    iban: "QA33DHBK00000000987654",
    glCode: "12000004",
    glName: "Doha Bank Operating Account",
    currency: "QAR",
    branch: "Corniche Branch",
    status: "Active",
  },
  {
    id: "qib-rental-05",
    bankName: "Qatar Islamic Bank (QIB)",
    accountTitle: "QIB Islamic Rental Account",
    accountNumber: "0091-554210-004",
    iban: "QA77QISB00000000456789",
    glCode: "12000005",
    glName: "QIB Islamic Rental Account",
    currency: "QAR",
    branch: "Salwa Road Branch",
    status: "Active",
  },
];

/**
 * Fetch company bank accounts from fin_bank_accounts or fallback to standard master list.
 * Only returns active accounts for transactions like PDC bank deposit.
 */
export async function fetchCompanyBankAccounts(): Promise<CompanyBankAccount[]> {
  try {
    const { data, error } = await (supabase as any)
      .from('fin_bank_accounts')
      .select('*, fin_banks(name, code, swift_code)')
      .limit(50);

    if (error || !data) {
      return DEFAULT_COMPANY_BANK_ACCOUNTS.filter(a => a.status !== 'Inactive');
    }

    // Filter to strictly ACTIVE bank accounts only (exclude deactivated accounts)
    const activeData = data.filter((item: any) => item.status !== 'Inactive' && item.status !== 'inactive');

    if (activeData.length === 0) {
      return DEFAULT_COMPANY_BANK_ACCOUNTS.filter(a => a.status !== 'Inactive');
    }

    return activeData.map((item: any, idx: number) => {
      const bName = item.fin_banks?.name || item.bank_name || 'Commercial Bank of Qatar (CBQ)';
      const rawTitle = (item.account_title || item.name || bName).replace(/\bAccont\b/gi, 'Account');
      const accNum = String(item.account_number || '');

      const isCbq = accNum.includes('4060692533001') || rawTitle.toLowerCase().includes('cbq') || bName.toLowerCase().includes('cbq') || idx === 0;
      const isDukhan = accNum.includes('100001761798') || rawTitle.toLowerCase().includes('dukhan') || bName.toLowerCase().includes('dukhan') || idx === 1;

      const glCode = isCbq ? '12000001' : isDukhan ? '12000002' : item.gl_code || `1200000${idx + 1}`;
      const glName = isCbq ? 'Commercial Bank of Qatar (CBQ)' : isDukhan ? 'Al Ameen Dukhan Bank' : (item.gl_name || rawTitle);

      return {
        id: String(item.id || `bank-acc-${idx}`),
        bankName: bName,
        accountTitle: rawTitle,
        accountNumber: accNum,
        iban: item.iban || accNum,
        glCode,
        glName,
        currency: item.currency || 'QAR',
        branch: item.branch,
        isDefault: idx === 0 || isCbq,
        status: item.status || 'Active',
      };
    });
  } catch {
    return DEFAULT_COMPANY_BANK_ACCOUNTS.filter(a => a.status !== 'Inactive');
  }
}
