import { supabase } from '../supabase';

export type PostEventPayload = {
  event_code: string;
  source_module: string;
  source_id: string;
  narration: string;
  date: string;
  period: string;
  lines: {
    account_code: string;
    debit: number;
    credit: number;
    property_id?: string;
    unit_id?: string;
    owner_id?: string;
  }[];
};

/**
 * Core Finance Posting Engine
 * Enforces balanced journal entries and interacts with Supabase.
 */
export async function postJournalEntry(payload: PostEventPayload) {
  // 1. Enforce balance
  const totalDebit = payload.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = payload.lines.reduce((sum, line) => sum + line.credit, 0);

  // Use a small epsilon for floating point inaccuracies, though numeric is better.
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error(`Unbalanced journal entry. Debits: ${totalDebit}, Credits: ${totalCredit}`);
  }

  // 2. Fetch Account IDs based on Account Codes
  const accountCodes = payload.lines.map(l => l.account_code);
  const { data: accounts, error: accError } = await supabase
    .from('gl_accounts')
    .select('id, code')
    .in('code', accountCodes);

  if (accError) throw accError;

  const accountMap = new Map(accounts.map(a => [a.code, a.id]));

  // Ensure all accounts exist
  for (const line of payload.lines) {
    if (!accountMap.has(line.account_code)) {
      throw new Error(`GL Account code ${line.account_code} not found in database.`);
    }
  }

  // 3. Generate a JE Number
  const je_no = `JE-${Date.now()}`;

  // 4. Create the Journal Entry
  const { data: je, error: jeError } = await supabase
    .from('journal_entries')
    .insert({
      je_no,
      posting_date: payload.date,
      period: payload.period,
      source_module: payload.source_module,
      source_id: payload.source_id,
      narration: payload.narration,
      status: 'posted'
    })
    .select()
    .single();

  if (jeError) throw jeError;

  // 5. Create the Journal Lines
  const jeLines = payload.lines.map((line, index) => ({
    je_id: je.id,
    line_no: index + 1,
    account_id: accountMap.get(line.account_code),
    debit: line.debit,
    credit: line.credit,
    property_id: line.property_id,
    unit_id: line.unit_id,
    owner_id: line.owner_id,
  }));

  const { error: lineError } = await supabase
    .from('journal_lines')
    .insert(jeLines);

  if (lineError) {
    // Ideally we would wrap this in a postgres transaction via an RPC. 
    // Since we are client-side, we must manually rollback the JE if lines fail to insert.
    await supabase.from('journal_entries').delete().eq('id', je.id);
    throw lineError;
  }

  return je;
}

export async function processReceipt(
  amount: number, 
  payment_mode: string, 
  customer_id: string | null, 
  ref: string,
  property_id?: string
) {
  // Insert Receipt
  const { data: receipt, error: recError } = await supabase
    .from('receipts')
    .insert({
      customer_id,
      payment_mode,
      amount,
      ref,
      status: 'completed'
    })
    .select()
    .single();

  if (recError) throw recError;

  // Post to Ledger
  // Standard receipt posting: Dr Bank (1010) / Cr AR (1100)
  const today = new Date();
  const period = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  await postJournalEntry({
    event_code: 'RECEIPT_POSTED',
    source_module: 'receipts',
    source_id: receipt.id,
    narration: `Receipt ${receipt.id.substring(0, 8)} via ${payment_mode}`,
    date: today.toISOString().split('T')[0],
    period,
    lines: [
      {
        account_code: '1010', // Operating Bank Account
        debit: amount,
        credit: 0,
        property_id
      },
      {
        account_code: '1100', // Accounts Receivable
        debit: 0,
        credit: amount,
        property_id
      }
    ]
  });

  return receipt;
}
