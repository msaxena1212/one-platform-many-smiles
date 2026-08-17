import { supabase } from '../supabase';

export type VoucherLinePayload = {
  account_code: string;
  debit: number;
  credit: number;
  cost_center_id?: number;
  property_id?: number;
  unit_id?: number;
  tenant_id?: number;
  vendor_id?: number;
  description?: string;
};

export type PostVoucherPayload = {
  voucher_date: string;
  voucher_type: 'Journal' | 'Receipt' | 'Payment' | 'Contra' | 'Sales' | 'Purchase';
  reference_no?: string;
  description: string;
  posted_by?: string;
  lines: VoucherLinePayload[];
};

/**
 * Core Finance Posting Engine
 * Enforces balanced journal entries and interacts with Supabase using the new fin_vouchers schema.
 */
export async function postVoucher(payload: PostVoucherPayload) {
  // 1. Enforce balance
  const totalDebit = payload.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = payload.lines.reduce((sum, line) => sum + line.credit, 0);

  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error(`Unbalanced voucher entry. Debits: ${totalDebit}, Credits: ${totalCredit}`);
  }

  // 2. Fetch Account IDs based on Account Codes
  const accountCodes = payload.lines.map(l => l.account_code);
  const { data: accounts, error: accError } = await supabase
    .from('fin_coa_accounts')
    .select('id, account_code')
    .in('account_code', accountCodes);

  if (accError) throw accError;

  const accountMap = new Map(accounts.map(a => [a.account_code, a.id]));

  // Ensure all accounts exist
  for (const line of payload.lines) {
    if (!accountMap.has(line.account_code)) {
      throw new Error(`COA Account code ${line.account_code} not found in database.`);
    }
  }

  // 3. Generate a Voucher Number
  const voucher_number = `VCH-${Date.now()}`;

  // 4. Create the Voucher
  const { data: voucher, error: voucherError } = await supabase
    .from('fin_vouchers')
    .insert({
      voucher_number,
      voucher_date: payload.voucher_date,
      voucher_type: payload.voucher_type,
      reference_no: payload.reference_no,
      description: payload.description,
      total_amount: totalDebit,
      status: 'Posted',
      posted_by: payload.posted_by,
      posted_at: new Date().toISOString()
    })
    .select()
    .single();

  if (voucherError) throw voucherError;

  // 5. Create the Voucher Lines
  const vchLines = payload.lines.map((line) => ({
    voucher_id: voucher.id,
    account_id: accountMap.get(line.account_code),
    cost_center_id: line.cost_center_id,
    property_id: line.property_id,
    unit_id: line.unit_id,
    tenant_id: line.tenant_id,
    vendor_id: line.vendor_id,
    debit_amount: line.debit,
    credit_amount: line.credit,
    description: line.description,
  }));

  const { error: lineError } = await supabase
    .from('fin_voucher_lines')
    .insert(vchLines);

  if (lineError) {
    // Rollback voucher if lines fail to insert
    await supabase.from('fin_vouchers').delete().eq('id', voucher.id);
    throw lineError;
  }

  return voucher;
}

// ── Standard Accounting Flows ──────────────────────────────────────────────────

export async function postRentDue(amount: number, tenant_id: number, property_id: number, unit_id: number, period: string) {
  const today = new Date().toISOString().split('T')[0];
  return postVoucher({
    voucher_date: today,
    voucher_type: 'Journal',
    description: `Rent generation for period ${period}`,
    reference_no: period,
    lines: [
      { account_code: '12413', debit: amount, credit: 0, tenant_id, property_id, unit_id, description: 'Tenant Receivable' },
      { account_code: '41100', debit: 0, credit: amount, tenant_id, property_id, unit_id, description: 'Rental Revenue' }
    ]
  });
}

export async function postPdcCollection(amount: number, tenant_id: number, property_id: number, unit_id: number, cheque_number: string) {
  const today = new Date().toISOString().split('T')[0];
  return postVoucher({
    voucher_date: today,
    voucher_type: 'Receipt',
    description: `PDC Collection for Chq ${cheque_number}`,
    reference_no: cheque_number,
    lines: [
      { account_code: '12900', debit: amount, credit: 0, tenant_id, property_id, unit_id, description: 'PDC In Hand' },
      { account_code: '21400', debit: 0, credit: amount, tenant_id, property_id, unit_id, description: 'PDC Received - Leasing Customers' }
    ]
  });
}

export async function postPdcDeposit(amount: number, tenant_id: number, property_id: number, unit_id: number, cheque_number: string) {
  const today = new Date().toISOString().split('T')[0];
  return postVoucher({
    voucher_date: today,
    voucher_type: 'Journal',
    description: `PDC Deposited for Chq ${cheque_number}`,
    reference_no: cheque_number,
    lines: [
      { account_code: '12000', debit: amount, credit: 0, tenant_id, property_id, unit_id, description: 'Bank' },
      { account_code: '12900', debit: 0, credit: amount, tenant_id, property_id, unit_id, description: 'PDC In Hand' },
      { account_code: '21400', debit: amount, credit: 0, tenant_id, property_id, unit_id, description: 'Customer PDC Liability' },
      { account_code: '12413', debit: 0, credit: amount, tenant_id, property_id, unit_id, description: 'Tenant Receivable' }
    ]
  });
}

export async function postPdcReturn(amount: number, tenant_id: number, property_id: number, unit_id: number, cheque_number: string) {
  const today = new Date().toISOString().split('T')[0];
  return postVoucher({
    voucher_date: today,
    voucher_type: 'Journal',
    description: `PDC Returned for Chq ${cheque_number}`,
    reference_no: cheque_number,
    lines: [
      { account_code: '12900', debit: amount, credit: 0, tenant_id, property_id, unit_id, description: 'PDC In Hand' },
      { account_code: '12000', debit: 0, credit: amount, tenant_id, property_id, unit_id, description: 'Bank' },
      { account_code: '12413', debit: amount, credit: 0, tenant_id, property_id, unit_id, description: 'Tenant Receivable' },
      { account_code: '21400', debit: 0, credit: amount, tenant_id, property_id, unit_id, description: 'Customer PDC Liability' }
    ]
  });
}

export async function postLeaseDepositReceipt(amount: number, tenant_id: number, property_id: number, unit_id: number, mode: 'Bank' | 'Cash', ref: string) {
  const today = new Date().toISOString().split('T')[0];
  const debitAccount = mode === 'Bank' ? '12000' : '10100'; // Assuming 10100 is Cash in Hand
  
  return postVoucher({
    voucher_date: today,
    voucher_type: 'Receipt',
    description: `Security Deposit Receipt via ${mode}`,
    reference_no: ref,
    lines: [
      { account_code: debitAccount, debit: amount, credit: 0, tenant_id, property_id, unit_id, description: mode },
      { account_code: '21500', debit: 0, credit: amount, tenant_id, property_id, unit_id, description: 'Deposits - Leasing Customers' }
    ]
  });
}

export async function postDamageCharge(amount: number, tenant_id: number, property_id: number, unit_id: number, desc: string) {
  const today = new Date().toISOString().split('T')[0];
  return postVoucher({
    voucher_date: today,
    voucher_type: 'Journal',
    description: `Damage Charge: ${desc}`,
    lines: [
      { account_code: '12413', debit: amount, credit: 0, tenant_id, property_id, unit_id, description: 'Tenant Receivable' },
      { account_code: '41201003', debit: 0, credit: amount, tenant_id, property_id, unit_id, description: 'Other Income - Damages' }
    ]
  });
}
