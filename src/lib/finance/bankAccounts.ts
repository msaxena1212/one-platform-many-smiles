import { supabase } from '../supabase';

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
  swiftCode?: string;
  isDefault?: boolean;
  status?: string;
}

export const DEFAULT_COMPANY_BANK_ACCOUNTS: CompanyBankAccount[] = [
  {
    id: "7",
    bankName: "Commercial Bank of Qatar (CBQ)",
    accountTitle: "Commercial Bank of Qatar (CBQ)",
    accountNumber: "4060692533001",
    iban: "QA40CBQK000000004060692533001",
    glCode: "12000001",
    glName: "Commercial Bank of Qatar (CBQ)",
    currency: "QAR",
    branch: "Grand Hamad Main Branch",
    swiftCode: "CBQKQAQA",
    isDefault: true,
    status: "Active",
  },
  {
    id: "8",
    bankName: "Dukhan Bank",
    accountTitle: "Al Ameen Dukhan Bank",
    accountNumber: "100001761798",
    iban: "QA88BARQ00000000100001761798",
    glCode: "12000002",
    glName: "Al Ameen Dukhan Bank",
    currency: "QAR",
    branch: "Main Branch",
    swiftCode: "BARQQAQA",
    status: "Active",
  },
  {
    id: "9",
    bankName: "Dukhan Bank",
    accountTitle: "Al Ameen (Oryx)",
    accountNumber: "100001011781",
    iban: "QA88BARQ00000000100001011781",
    glCode: "12000006",
    glName: "Al Ameen (Oryx) - Dukhan Bank",
    currency: "QAR",
    branch: "Main Branch",
    swiftCode: "BARQQAQA",
    status: "Active",
  },
];

const BANK_ACCOUNTS_STORAGE_KEY = "zyno-company-bank-accounts-v2";
const PMS_FIN_STORAGE_KEY = "pms_fin_bank_accounts_override_v2";

/**
 * Retrieve custom/updated bank accounts from local storage.
 */
export function getStoredCompanyBankAccounts(): CompanyBankAccount[] {
  if (typeof window === "undefined") return DEFAULT_COMPANY_BANK_ACCOUNTS;
  try {
    const raw = localStorage.getItem(BANK_ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(a => a.status !== 'Inactive' && a.status !== 'inactive');
      }
    }
    // Also check PMS finance module override storage key
    const rawPms = localStorage.getItem(PMS_FIN_STORAGE_KEY);
    if (rawPms) {
      const parsedPms = JSON.parse(rawPms);
      if (Array.isArray(parsedPms) && parsedPms.length > 0) {
        return parsedPms
          .filter((a: any) => a.status !== 'Inactive' && a.status !== 'inactive')
          .map((a: any, idx: number) => {
            const accNum = String(a.account_number || '');
            const rawTitle = String(a.account_title || '');
            const isCbq = accNum.includes('4060692533001') || rawTitle.toLowerCase().includes('cbq');
            const isOryx = accNum.includes('100001011781') || rawTitle.toLowerCase().includes('oryx');
            const isDukhan = !isOryx && (accNum.includes('100001761798') || rawTitle.toLowerCase().includes('dukhan'));

            const glCode = isCbq ? '12000001' : isOryx ? '12000006' : isDukhan ? '12000002' : (a.gl_code || `1200000${idx + 1}`);
            const glName = isCbq ? 'Commercial Bank of Qatar (CBQ)' : isOryx ? 'Al Ameen (Oryx) - Dukhan Bank' : isDukhan ? 'Al Ameen Dukhan Bank' : (a.account_title || 'Operating Account');

            return {
              id: String(a.id || `pms-acc-${idx}`),
              bankName: a.bank_name || (isCbq ? 'Commercial Bank of Qatar (CBQ)' : 'Dukhan Bank'),
              accountTitle: isOryx ? 'Al Ameen (Oryx)' : (a.account_title || 'Operating Account'),
              accountNumber: accNum,
              iban: a.iban || accNum,
              glCode,
              glName,
              currency: a.currency || 'QAR',
              isDefault: idx === 0 || isCbq,
              status: a.status || 'Active',
            };
          });
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_COMPANY_BANK_ACCOUNTS;
}

/**
 * Save or update a bank account in local storage and persist to Supabase where possible.
 */
export async function saveCompanyBankAccount(acc: CompanyBankAccount): Promise<CompanyBankAccount[]> {
  const current = getStoredCompanyBankAccounts();
  const existingIdx = current.findIndex(a => a.id === acc.id || (a.accountNumber && a.accountNumber === acc.accountNumber));
  let updated: CompanyBankAccount[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...updated[existingIdx], ...acc };
  } else {
    updated = [...current, acc];
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BANK_ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage quota issues
    }
  }

  // Attempt to sync to Supabase database if fin_bank_accounts table is accessible
  try {
    await (supabase as any)
      .from('fin_bank_accounts')
      .upsert({
        account_number: acc.accountNumber,
        account_title: acc.accountTitle,
        currency: acc.currency || 'QAR',
      }, { onConflict: 'account_number' });
  } catch {
    // Non-blocking fallback
  }

  return updated.filter(a => a.status !== 'Inactive' && a.status !== 'inactive');
}

/**
 * Fetch company bank accounts from fin_bank_accounts merged with stored/default accounts.
 * Always returns active accounts for transactions like PDC bank deposit or bank transfer.
 */
export async function fetchCompanyBankAccounts(): Promise<CompanyBankAccount[]> {
  const stored = getStoredCompanyBankAccounts();

  try {
    const { data, error } = await (supabase as any)
      .from('fin_bank_accounts')
      .select('*, fin_banks(name, code, swift_code)')
      .limit(50);

    if (error || !data || data.length === 0) {
      return stored.filter(a => a.status !== 'Inactive' && a.status !== 'inactive');
    }

    // Filter to strictly ACTIVE bank accounts only (exclude deactivated accounts)
    const activeData = data.filter((item: any) => item.status !== 'Inactive' && item.status !== 'inactive');

    if (activeData.length === 0) {
      return stored.filter(a => a.status !== 'Inactive' && a.status !== 'inactive');
    }

    const dbMapped: CompanyBankAccount[] = activeData.map((item: any, idx: number) => {
      const bName = item.fin_banks?.name || item.bank_name || (idx === 0 ? 'Commercial Bank of Qatar (CBQ)' : 'Dukhan Bank');
      const rawTitle = (item.account_title || item.name || bName).replace(/\bAccont\b/gi, 'Account');
      const accNum = String(item.account_number || '');

      const isCbq = accNum.includes('4060692533001') || rawTitle.toLowerCase().includes('cbq') || bName.toLowerCase().includes('cbq');
      const isOryx = accNum.includes('100001011781') || rawTitle.toLowerCase().includes('oryx');
      const isDukhan = !isOryx && (accNum.includes('100001761798') || rawTitle.toLowerCase().includes('dukhan') || bName.toLowerCase().includes('dukhan'));

      const glCode = isCbq ? '12000001' : isOryx ? '12000006' : isDukhan ? '12000002' : item.gl_code || `1200000${idx + 1}`;
      const glName = isCbq ? 'Commercial Bank of Qatar (CBQ)' : isOryx ? 'Al Ameen (Oryx) - Dukhan Bank' : isDukhan ? 'Al Ameen Dukhan Bank' : (item.gl_name || rawTitle);

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
        swiftCode: item.fin_banks?.swift_code,
        isDefault: idx === 0 || isCbq,
        status: item.status || 'Active',
      };
    });

    // When active DB bank accounts are returned, strictly return DB accounts only
    return dbMapped.filter(a => a.status !== 'Inactive' && a.status !== 'inactive');
  } catch {
    return stored.filter(a => a.status !== 'Inactive' && a.status !== 'inactive');
  }
}
