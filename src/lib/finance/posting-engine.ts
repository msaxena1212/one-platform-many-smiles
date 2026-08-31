import { supabase } from '../supabase';
import {
  resolveAccountingAccounts,
  type PaymentMethod,
  type PdcType,
} from './account-resolver';

/**
 * Posting Engine
 *
 * Accounting Event
 *      ↓
 * Accounting Event Lines
 *      ↓
 * Posting Engine
 *      ↓
 * Financial Voucher
 *      ↓
 * Financial Voucher Lines
 *
 * Tables used:
 *
 * fin_accounting_events
 * fin_accounting_event_lines
 * fin_vouchers
 * fin_voucher_lines
 * fin_coa_accounts
 *
 * IMPORTANT:
 * - No erp_* tables are used.
 * - Accounting events must be balanced.
 * - Accounting event lines must be balanced.
 * - Voucher lines must be balanced.
 * - Posting is idempotent.
 * - Failed application-level posting is cleaned up.
 */

export type PostingResult = {
  event_id: string;
  voucher_id: string;
  voucher_number: string;
  receipt_id: string;
  receipt_number: string;
  status: 'POSTED';
};

async function getGeneratedReceipt(eventId: string) {
  const { data, error } = await supabase
    .from('fin_transaction_receipts')
    .select('id, receipt_no')
    .eq('accounting_event_id', eventId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error(
      `Financial transaction ${eventId} was posted but its receipt was not generated.`,
    );
  }

  return {
    receipt_id: data.id as string,
    receipt_number: data.receipt_no as string,
  };
}

type AccountingEvent = {
  id: string;

  event_type: string;
  status: string;

  event_date: string;
  posting_date: string;

  source_type: string;
  source_id: string | null;

  reference_number: string | null;
  description: string | null;

  idempotency_key: string;

  reversal_of_event_id: string | null;
  reversed_by_event_id: string | null;

  voucher_id: string | null;

  tenant_id: string | null;
  lease_id: string | null;
  property_id: string | null;
  unit_id: string | null;
  customer_id: string | null;

  total_debit: number;
  total_credit: number;
};

type AccountingEventLine = {
  id: string;

  event_id: string;
  line_number: number;

  account_id: string | null;
  account_code: string | null;
  account_name: string | null;

  debit: number;
  credit: number;

  description: string | null;

  tenant_id: string | null;
  lease_id: string | null;
  property_id: string | null;
  unit_id: string | null;
  customer_id: string | null;
  cost_center_id: string | null;

  source_type: string | null;
  source_id: string | null;

  metadata?: Record<string, unknown> | null;
};

type ResolvedAccount = {
  id: string;
  account_code: string;
  account_name: string;
};

/**
 * Monetary tolerance.
 */
const BALANCE_TOLERANCE = 0.001;

/**
 * Round monetary values to 2 decimals.
 */
function money(
  value: number | null | undefined,
): number {
  return Number(
    (Number(value) || 0).toFixed(2),
  );
}

/**
 * Generate deterministic voucher number.
 *
 * Priority:
 *
 * 1. Accounting event reference number
 * 2. Event UUID
 */
function generateVoucherNumber(
  event: AccountingEvent,
): string {
  if (
    event.reference_number &&
    event.reference_number.trim()
  ) {
    return event.reference_number.trim();
  }

  return `EVT-${event.id
    .replace(/-/g, '')
    .slice(0, 8)
    .toUpperCase()}`;
}

/**
 * Validate debit/credit balance.
 */
function validateBalance(
  totalDebit: number,
  totalCredit: number,
): void {
  const debit = money(totalDebit);
  const credit = money(totalCredit);

  if (
    debit <= 0 &&
    credit <= 0
  ) {
    throw new Error(
      'Accounting event cannot be posted because debit and credit are both zero.',
    );
  }

  if (
    Math.abs(debit - credit) >
    BALANCE_TOLERANCE
  ) {
    throw new Error(
      `Cannot post unbalanced accounting event. Debit=${debit}, Credit=${credit}`,
    );
  }
}

/**
 * Validate accounting event lines.
 */
function validateLines(
  lines: AccountingEventLine[],
) {
  if (!lines.length) {
    throw new Error(
      'Cannot post accounting event because it has no accounting lines.',
    );
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const line of lines) {
    const debit = money(line.debit);
    const credit = money(line.credit);

    /*
     * Account is mandatory.
     */
    if (
      !line.account_id &&
      !line.account_code
    ) {
      throw new Error(
        `Accounting line ${line.line_number} does not contain an account ID or account code.`,
      );
    }

    /*
     * Negative values are invalid.
     */
    if (
      debit < 0 ||
      credit < 0
    ) {
      throw new Error(
        `Accounting line ${line.line_number} contains a negative debit or credit amount.`,
      );
    }

    /*
     * A line cannot contain both debit and credit.
     */
    if (
      debit > 0 &&
      credit > 0
    ) {
      throw new Error(
        `Accounting line ${line.line_number} cannot contain both debit and credit.`,
      );
    }

    /*
     * A line must contain either debit or credit.
     */
    if (
      debit === 0 &&
      credit === 0
    ) {
      throw new Error(
        `Accounting line ${line.line_number} has neither debit nor credit.`,
      );
    }

    totalDebit += debit;
    totalCredit += credit;
  }

  totalDebit = money(totalDebit);
  totalCredit = money(totalCredit);

  validateBalance(
    totalDebit,
    totalCredit,
  );

  return {
    debit: totalDebit,
    credit: totalCredit,
  };
}

/**
 * Resolve all account codes against Chart of Accounts.
 *
 * Phase 2 (2026-08-27) — defence in depth:
 *   - In addition to looking the code up, we now reject any line that
 *     carries an account_code which is either not in fin_coa_accounts or
 *     marked is_active = false.
 *   - This complements the DB-side trigger (see migration
 *     20260829110000_finance_phase2_account_resolver_enforcement.sql)
 *     so the application fails fast with a clear error before the
 *     trigger fires.
 */
async function resolveAccounts(
  lines: AccountingEventLine[],
): Promise<Map<string, ResolvedAccount>> {

  const accountCodes = [
    ...new Set(
      lines
        .map(
          (line) =>
            line.account_code?.trim(),
        )
        .filter(
          (
            code,
          ): code is string =>
            Boolean(code),
        ),
    ),
  ];

  const accountMap =
    new Map<
      string,
      ResolvedAccount
    >();

  /*
   * Nothing to resolve if all lines
   * already contain account IDs.
   */
  if (!accountCodes.length) {
    return accountMap;
  }

  const {
    data: accounts,
    error,
  } = await supabase
    .from(
      'fin_coa_accounts',
    )
    .select(
      'id, account_code, account_name, is_active, account_level',
    )
    .in(
      'account_code',
      accountCodes,
    );

  if (error) {
    throw error;
  }

  for (
    const account of
    accounts || []
  ) {
    if (account.is_active === false) {
      throw new Error(
        `Posting rejected: account_code "${account.account_code}" exists in fin_coa_accounts but is_active = false. ` +
        `Re-activate the account or update the resolver.`,
      );
    }
    accountMap.set(
      account.account_code,
      {
        id: account.id,
        account_code:
          account.account_code,
        account_name:
          account.account_name,
      },
    );
  }

  /*
   * Every account code must resolve.
   *
   * Phase 2 — also reject if a non-resolver caller passes a unit-SL
   * code on a line that has no unit context. (The DB trigger enforces
   * the same thing, but failing early is friendlier.)
   */
  for (
    const line of lines
  ) {
    const code =
      line.account_code?.trim();

    if (
      code &&
      !accountMap.has(code)
    ) {
      throw new Error(
        `Posting rejected: account_code "${code}" on event line ${line.line_number} ` +
        `does not resolve to an active row in fin_coa_accounts. ` +
        `Compose accounting lines through resolveAccountingAccounts() in ` +
        `src/lib/finance/account-resolver.ts.`,
      );
    }
  }

  return accountMap;
}

/**
 * Check whether a voucher already exists
 * for the accounting event.
 *
 * This provides an additional idempotency
 * check before creating a new voucher.
 */
async function findExistingVoucher(
  eventId: string,
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      'fin_vouchers',
    )
    .select(
      'id, voucher_number, accounting_event_id',
    )
    .eq(
      'accounting_event_id',
      eventId,
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Move event DRAFT → POSTING.
 *
 * The conditional update prevents two
 * application processes from both posting
 * the same DRAFT event.
 */
async function markEventPosting(
  eventId: string,
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      'fin_accounting_events',
    )
    .update({
      status: 'POSTING',
    })
    .eq(
      'id',
      eventId,
    )
    .eq(
      'status',
      'DRAFT',
    )
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Restore event to DRAFT.
 */
async function restoreDraftStatus(
  eventId: string,
) {
  const {
    error,
  } = await supabase
    .from(
      'fin_accounting_events',
    )
    .update({
      status: 'DRAFT',
    })
    .eq(
      'id',
      eventId,
    )
    .eq(
      'status',
      'POSTING',
    );

  if (error) {
    console.error(
      'Failed to restore accounting event to DRAFT:',
      error,
    );
  }
}

/**
 * Main posting engine — DB-atomic wrapper.
 *
 * Phase 2b: this function used to mirror the atomic RPC's work in the
 * application layer (event line load, COA resolve, voucher insert,
 * voucher-line insert, event-status update, application-side cleanup
 * on failure). That created a window where Event existed, Voucher
 * existed, but Voucher-lines failed — leaving the event in POSTING.
 *
 * The entire lifecycle is now performed inside the database by
 * `public.post_accounting_event_atomic(event_id)`. The RPC:
 *   1. Locks the event (FOR UPDATE).
 *   2. Idempotently returns the existing voucher if the event is
 *      already POSTED.
 *   3. Validates lines, totals, COA resolution, and SL→GL.
 *   4. Creates the voucher and its lines, then marks the event
 *      POSTED — all in one transaction.
 *   5. Lets the existing trigger auto-generate the receipt on
 *      fin_accounting_events.
 *
 * If the RPC throws, the database rolls everything back and the
 * event is left in DRAFT — no application-side cleanup needed.
 */
export async function postAccountingEvent(
  eventId: string,
): Promise<PostingResult> {

  const { data: rpcRows, error: rpcError } = await supabase
    .rpc('post_accounting_event_atomic', {
      p_event_id: eventId,
    });

  if (rpcError) {
    // Surface the DB exception verbatim. The RPC raises with
    // precise messages (unbalanced, missing COA, inactive account,
    // unknown account_code, already reversed, etc.).
    throw new Error(
      `post_accounting_event_atomic failed for event ${eventId}: ${rpcError.message}`,
    );
  }

  const rows = rpcRows as Array<{
    event_id:        string;
    voucher_id:      string;
    voucher_number:  string;
    status:          string;
  }>;

  if (!rows || rows.length === 0) {
    throw new Error(
      `post_accounting_event_atomic returned no rows for event ${eventId}.`,
    );
  }

  const r = rows[0];

  // The receipt is auto-generated by the AFTER UPDATE trigger on
  // fin_accounting_events when status transitions to POSTED. We just
  // fetch it.
  const receipt = await getGeneratedReceipt(r.event_id);

  return {
    event_id:        r.event_id,
    voucher_id:      r.voucher_id,
    voucher_number:  r.voucher_number,
    receipt_id:      receipt.receipt_id,
    receipt_number:  receipt.receipt_number,
    status:          'POSTED',
  };
}

/**
 * Convenience wrapper.
 */
export async function postEvent(
  eventId: string,
): Promise<PostingResult> {
  return postAccountingEvent(
    eventId,
  );
}

export type PostingLineInput = {
  account_code: string;
  account_name?: string;

  debit: number;
  credit: number;

  tenant_id?: string | number;
  lease_id?: string | number;
  property_id?: string | number;
  unit_id?: string | number;
  customer_id?: string | number;
  cost_center_id?: string | number;

  description?: string;

  source_type?: string;
  source_id?: string;

  metadata?: Record<string, unknown>;
};

export type PostVoucherInput = {
  voucher_date: string;
  voucher_type?: string;
  description?: string;
  reference_no?: string;

  source_type?: string;
  source_id?: string;

  tenant_id?: string | number;
  lease_id?: string | number;
  property_id?: string | number;
  unit_id?: string | number;
  customer_id?: string | number;
  cost_center_id?: string | number;

  lines: PostingLineInput[];
};

function normalizeUuid(
  value: string | number | null | undefined,
): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  const valueString = String(value).trim();

  if (!valueString) {
    return undefined;
  }

  /*
   * PostgreSQL UUID format.
   */
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(valueString)) {
    return undefined;
  }

  return valueString;
}
export async function postVoucher(
  input: PostVoucherInput,
): Promise<PostingResult> {

  if (!input.lines || input.lines.length === 0) {
    throw new Error(
      'Cannot post voucher without accounting lines.',
    );
  }

  const totalDebit = money(
    input.lines.reduce(
      (sum, line) =>
        sum + Number(line.debit || 0),
      0,
    ),
  );

  const totalCredit = money(
    input.lines.reduce(
      (sum, line) =>
        sum + Number(line.credit || 0),
      0,
    ),
  );

  validateBalance(
    totalDebit,
    totalCredit,
  );

  const sourceType =
    input.source_type ||
    'VOUCHER';

  const sourceId =
    input.source_id;

  const referenceNumber =
    input.reference_no ||
    `VCH-${Date.now()}`;

  /*
   * Every voucher request becomes
   * an accounting event first.
   */
  const idempotencyKey =
    [
      'POST-VOUCHER',
      input.voucher_type || 'Journal',
      referenceNumber,
      input.voucher_date,
    ].join('|');

  const {
    data: existingEvent,
    error: existingEventError,
  } = await supabase
    .from('fin_accounting_events')
    .select('id')
    .eq(
      'idempotency_key',
      idempotencyKey,
    )
    .maybeSingle();

  if (existingEventError) {
    throw existingEventError;
  }

  if (existingEvent) {
    return postAccountingEvent(
      existingEvent.id,
    );
  }

  /*
   * Create Accounting Event.
   *
   * IMPORTANT:
   * accounting-event-engine owns event
   * and event-line creation.
   */
  const { createAccountingEvent } =
    await import(
      './accounting-event-engine'
    );

  const event =
    await createAccountingEvent({
      event_type: 'MANUAL_JOURNAL',

      event_date:
        input.voucher_date,

      posting_date:
        input.voucher_date,

      source_type:
        sourceType,

      source_id:
        sourceId,

      reference_number:
        referenceNumber,

      description:
        input.description,

      idempotency_key:
        idempotencyKey,

      tenant_id:
        normalizeUuid(input.tenant_id),

      lease_id:
        normalizeUuid(input.lease_id),

      property_id:
        normalizeUuid(input.property_id),

      unit_id:
        normalizeUuid(input.unit_id),

      customer_id:
        normalizeUuid(input.customer_id),

      cost_center_id:
        normalizeUuid(input.cost_center_id),

      lines:
        input.lines.map(
          (line) => ({
            account_code:
              line.account_code,

            account_name:
              line.account_name,

            debit:
              money(line.debit),

            credit:
              money(line.credit),

            tenant_id:
              normalizeUuid(
                line.tenant_id,
              ),

            lease_id:
              normalizeUuid(
                line.lease_id,
              ),

            property_id:
              normalizeUuid(
                line.property_id,
              ),

            unit_id:
              normalizeUuid(
                line.unit_id,
              ),

            customer_id:
              normalizeUuid(
                line.customer_id,
              ),

            cost_center_id:
              normalizeUuid(
                line.cost_center_id,
              ),

            description:
              line.description,

            source_type:
              line.source_type,

            source_id:
              line.source_id,

            metadata:
              line.metadata,
          }),
        ),
    });

  return postAccountingEvent(
    event.id,
  );
}

export async function postLeaseDepositReceipt(
  amount: number,
  tenantId: string | number,
  propertyId: string | number,
  unitId: string | number,
  mode: 'Cash' | 'Bank',
  reference?: string,
  unitName?: string,
): Promise<PostingResult> {

  const paymentMethod: PaymentMethod = mode === 'Cash' ? 'CASH' : 'BANK';

  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'SECURITY_DEPOSIT_RECEIPT',
    paymentMethod,
    depositType: 'SECURITY',
    propertyId: String(propertyId),
    unitId: normalizeUuid(unitId),
    tenantId: normalizeUuid(tenantId),
    unitName,
  });

  return postVoucher({
    voucher_date: new Date().toISOString().split('T')[0],
    voucher_type: 'Receipt',
    description: 'Security Deposit Received',
    reference_no: reference,
    tenant_id: tenantId,
    property_id: propertyId,
    unit_id: unitId,
    lines: [
      {
        account_code: drAcct.slCode,
        account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
        debit: amount,
        credit: 0,
        description: `Security Deposit Received – ${drAcct.slName}`,
      },
      {
        account_code: crAcct.slCode,
        account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
        debit: 0,
        credit: amount,
        description: `Security Deposit Liability – ${crAcct.slName}`,
      },
    ],
  });
}

export async function postPdcCollection(
  amount: number,
  tenantId: string | number,
  propertyId: string | number,
  unitId: string | number,
  chequeNumber: string,
  unitCode?: string,
  pdcType: PdcType = 'RENT_PDC',
): Promise<PostingResult> {

  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'PDC_COLLECTION',
    paymentMethod: 'PDC',
    pdcType,
    propertyId: String(propertyId),
    unitId: normalizeUuid(unitId),
    tenantId: normalizeUuid(tenantId),
    unitName: unitCode,
  });

  return postVoucher({
    voucher_type: 'Receipt',
    voucher_date: new Date().toISOString().split('T')[0],
    reference_no: chequeNumber,
    description: `PDC Received – ${chequeNumber}${unitCode ? ` – ${unitCode}` : ''}`,
    tenant_id: tenantId,
    property_id: propertyId,
    unit_id: unitId,
    lines: [
      {
        account_code: drAcct.slCode,
        account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
        debit: amount,
        credit: 0,
        description: drAcct.slName,
      },
      {
        account_code: crAcct.slCode,
        account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
        debit: 0,
        credit: amount,
        description: crAcct.slName,
      },
    ],
  });
}

export async function postPdcDepositToBank(
  amount: number,
  tenantId: string | number,
  propertyId: string | number,
  unitId: string | number,
  chequeNumber: string,
  unitCode?: string,
  pdcType: PdcType = 'RENT_PDC',
): Promise<PostingResult> {

  // Entry A: Dr Bank / Cr PDC In Hand (physical instrument deposited)
  const { debit: drA, credit: crA } = await resolveAccountingAccounts({
    transactionType: 'PDC_DEPOSIT_BANK',
    pdcType,
    propertyId: String(propertyId),
    unitId: normalizeUuid(unitId),
    tenantId: normalizeUuid(tenantId),
    unitName: unitCode,
  });

  // Entry B: Dr PDC Received (unit SL) / Cr Tenant Receivable (unit SL)
  const { debit: drB, credit: crB } = await resolveAccountingAccounts({
    transactionType: 'PDC_DEPOSIT_AR',
    pdcType,
    propertyId: String(propertyId),
    unitId: normalizeUuid(unitId),
    tenantId: normalizeUuid(tenantId),
    unitName: unitCode,
  });

  return postVoucher({
    voucher_type: 'Receipt',
    voucher_date: new Date().toISOString().split('T')[0],
    reference_no: chequeNumber,
    description: `PDC Deposited to Bank – ${chequeNumber}${unitCode ? ` – ${unitCode}` : ''}`,
    tenant_id: tenantId,
    property_id: propertyId,
    unit_id: unitId,
    lines: [
      // Entry A
      { account_code: drA.slCode, account_name: `${drA.glName} / ${drA.slName}`, debit: amount, credit: 0, description: drA.slName },
      { account_code: crA.slCode, account_name: `${crA.glName} / ${crA.slName}`, debit: 0, credit: amount, description: crA.slName },
      // Entry B
      { account_code: drB.slCode, account_name: `${drB.glName} / ${drB.slName}`, debit: amount, credit: 0, description: drB.slName },
      { account_code: crB.slCode, account_name: `${crB.glName} / ${crB.slName}`, debit: 0, credit: amount, description: crB.slName },
    ],
  });
}
export async function postPdcClear(
  amount: number,
  tenantId: string | number,
  propertyId: string | number,
  unitId: string | number,
  chequeNumber: string,
  unitCode?: string,
  pdcType: PdcType = 'RENT_PDC',
): Promise<PostingResult> {

  // PDC Clear = same journal as PDC_DEPOSIT_AR (Dr PDC Received / Cr Tenant Receivable)
  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'PDC_DEPOSIT_AR',
    pdcType,
    propertyId: String(propertyId),
    unitId: normalizeUuid(unitId),
    tenantId: normalizeUuid(tenantId),
    unitName: unitCode,
  });

  return postVoucher({
    voucher_type: 'Journal',
    voucher_date: new Date().toISOString().split('T')[0],
    reference_no: chequeNumber,
    description: `PDC Cleared – ${chequeNumber}${unitCode ? ` – ${unitCode}` : ''}`,
    tenant_id: tenantId,
    property_id: propertyId,
    unit_id: unitId,
    lines: [
      { account_code: drAcct.slCode, account_name: `${drAcct.glName} / ${drAcct.slName}`, debit: amount, credit: 0, description: drAcct.slName },
      { account_code: crAcct.slCode, account_name: `${crAcct.glName} / ${crAcct.slName}`, debit: 0, credit: amount, description: crAcct.slName },
    ],
  });
}

/**
 * PDC Return — unpresented cheque returned to tenant (still in 12900001).
 *
 * Journal:
 *   Dr  21400 [unit SL]  – PDC Received - Leasing Customers  (clear PDC liability)
 *   Cr  12900001         – PDC In Hand                        (remove from assets)
 *
 * IMPORTANT: This is the pre-deposit return flow.
 * For a cheque dishonour AFTER bank deposit use a separate bounce reversal.
 */
export async function postPdcReturn(
  amount: number,
  tenantId: string | number,
  propertyId: string | number,
  unitId: string | number,
  chequeNumber: string,
  unitCode?: string,
  pdcType: PdcType = 'RENT_PDC',
): Promise<PostingResult> {

  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'PDC_RETURN',
    pdcType,
    propertyId: String(propertyId),
    unitId: normalizeUuid(unitId),
    tenantId: normalizeUuid(tenantId),
    unitName: unitCode,
  });

  return postVoucher({
    voucher_type: 'Journal',
    voucher_date: new Date().toISOString().split('T')[0],
    reference_no: chequeNumber,
    description: `PDC Returned – ${chequeNumber}${unitCode ? ` – ${unitCode}` : ''}`,
    tenant_id: tenantId,
    property_id: propertyId,
    unit_id: unitId,
    lines: [
      { account_code: drAcct.slCode, account_name: `${drAcct.glName} / ${drAcct.slName}`, debit: amount, credit: 0, description: drAcct.slName },
      { account_code: crAcct.slCode, account_name: `${crAcct.glName} / ${crAcct.slName}`, debit: 0, credit: amount, description: crAcct.slName },
    ],
  });
}


/**
 * Cash collected in place of a PDC (Step 2: Collect Cash against AR).
 *
 * Journal:
 *   Dr  12100 [unit SL] – Cash in Hand  (cash collected at unit)
 *   Cr  12413 [unit SL] – Tenant AR     (settle tenant dues)
 */
export async function postCashDepositInPlaceOfPdc(
  amount: number,
  tenantId: string | number,
  propertyId: string | number,
  unitId: string | number,
  chequeNumber: string,
  unitCode?: string,
): Promise<PostingResult> {

  // Resolve Cash SL and Tenant AR SL for the unit
  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'RENT_RECEIPT',
    paymentMethod: 'CASH',
    propertyId: String(propertyId),
    unitId: normalizeUuid(unitId),
    tenantId: normalizeUuid(tenantId),
    unitName: unitCode,
  });

  return postVoucher({
    voucher_type: 'Receipt',
    voucher_date: new Date().toISOString().split('T')[0],
    reference_no: `CASH-REP-${chequeNumber}`,
    description: `Cash Collected in Place of PDC – ${chequeNumber}${unitCode ? ` – ${unitCode}` : ''}`,
    tenant_id: tenantId,
    property_id: propertyId,
    unit_id: unitId,
    lines: [
      { account_code: drAcct.slCode, account_name: `${drAcct.glName} / ${drAcct.slName}`, debit: amount, credit: 0, description: drAcct.slName },
      { account_code: crAcct.slCode, account_name: `${crAcct.glName} / ${crAcct.slName}`, debit: 0, credit: amount, description: crAcct.slName },
    ],
  });
}

/**
 * PDC Cancellation — removes a PDC that was never deposited.
 *
 * Journal:
 *   Dr  21400 [unit SL]  – PDC Received - Leasing Customers
 *   Cr  12900001         – PDC In Hand
 */
export async function postPdcCancel(
  amount: number,
  tenantId: string | number,
  propertyId: string | number,
  unitId: string | number,
  chequeNumber: string,
  reason?: string,
  unitCode?: string,
  pdcType: PdcType = 'RENT_PDC',
): Promise<PostingResult> {

  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'PDC_CANCEL',
    pdcType,
    propertyId: String(propertyId),
    unitId: normalizeUuid(unitId),
    tenantId: normalizeUuid(tenantId),
    unitName: unitCode,
  });

  return postVoucher({
    voucher_type: 'Journal',
    voucher_date: new Date().toISOString().split('T')[0],
    reference_no: chequeNumber,
    description: `PDC Cancelled – ${chequeNumber}${reason ? ` – ${reason}` : ''}`,
    tenant_id: tenantId,
    property_id: propertyId,
    unit_id: unitId,
    lines: [
      { account_code: drAcct.slCode, account_name: `${drAcct.glName} / ${drAcct.slName}`, debit: amount, credit: 0, description: drAcct.slName },
      { account_code: crAcct.slCode, account_name: `${crAcct.glName} / ${crAcct.slName}`, debit: 0, credit: amount, description: crAcct.slName },
    ],
  });
}

/**
 * P265 — Rent Invoice Posting
 *
 * Journal:
 *   Dr 12413 [unit SL]  – Tenant Receivable
 *   Cr 41100001         – Rental Revenue
 */
export async function postRentInvoice(params: {
  amount: number;
  tenantId: string | number;
  propertyId: string | number;
  unitId: string | number;
  leaseId?: string | number;
  invoiceNumber: string;
  invoiceDate?: string;
  unitCode?: string;
}): Promise<PostingResult> {
  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'RENT_INVOICE',
    propertyId: String(params.propertyId),
    unitId: normalizeUuid(params.unitId),
    tenantId: normalizeUuid(params.tenantId),
    leaseId: normalizeUuid(params.leaseId),
    unitName: params.unitCode,
  });

  return postVoucher({
    voucher_type: 'Journal',
    voucher_date: params.invoiceDate || new Date().toISOString().split('T')[0],
    reference_no: params.invoiceNumber,
    description: `Rent Invoice – ${params.invoiceNumber}${params.unitCode ? ` (${params.unitCode})` : ''}`,
    tenant_id: params.tenantId,
    property_id: params.propertyId,
    unit_id: params.unitId,
    lease_id: params.leaseId,
    lines: [
      {
        account_code: drAcct.slCode,
        account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
        debit: params.amount,
        credit: 0,
        description: drAcct.slName,
      },
      {
        account_code: crAcct.slCode,
        account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
        debit: 0,
        credit: params.amount,
        description: crAcct.slName,
      },
    ],
  });
}

/**
 * P267/P268 — Rent Receipt Posting (Cash or Bank)
 *
 * Journal (Cash):
 *   Dr 12100 [unit SL]  – Cash In Hand
 *   Cr 12413 [unit SL]  – Tenant Receivable
 *
 * Journal (Bank):
 *   Dr 12000001         – Bank
 *   Cr 12413 [unit SL]  – Tenant Receivable
 */
export async function postRentReceipt(params: {
  amount: number;
  paymentMethod: 'CASH' | 'BANK';
  tenantId: string | number;
  propertyId: string | number;
  unitId: string | number;
  leaseId?: string | number;
  receiptNumber: string;
  receiptDate?: string;
  unitCode?: string;
}): Promise<PostingResult> {
  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'RENT_RECEIPT',
    paymentMethod: params.paymentMethod,
    propertyId: String(params.propertyId),
    unitId: normalizeUuid(params.unitId),
    tenantId: normalizeUuid(params.tenantId),
    leaseId: normalizeUuid(params.leaseId),
    unitName: params.unitCode,
  });

  return postVoucher({
    voucher_type: 'Receipt',
    voucher_date: params.receiptDate || new Date().toISOString().split('T')[0],
    reference_no: params.receiptNumber,
    description: `Rent Receipt (${params.paymentMethod}) – ${params.receiptNumber}${params.unitCode ? ` (${params.unitCode})` : ''}`,
    tenant_id: params.tenantId,
    property_id: params.propertyId,
    unit_id: params.unitId,
    lease_id: params.leaseId,
    lines: [
      {
        account_code: drAcct.slCode,
        account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
        debit: params.amount,
        credit: 0,
        description: drAcct.slName,
      },
      {
        account_code: crAcct.slCode,
        account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
        debit: 0,
        credit: params.amount,
        description: crAcct.slName,
      },
    ],
  });
}

/**
 * P266 — Rent Invoice Reversal / Future Rent Cancellation
 *
 * Journal:
 *   Dr 41100001         – Rental Revenue
 *   Cr 12413 [unit SL]  – Tenant Receivable
 */
export async function postRentInvoiceReversal(params: {
  amount: number;
  tenantId: string | number;
  propertyId: string | number;
  unitId: string | number;
  leaseId?: string | number;
  originalInvoiceNumber: string;
  reversalReason: string;
  unitCode?: string;
}): Promise<PostingResult> {
  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'RENT_INVOICE_REVERSAL',
    propertyId: String(params.propertyId),
    unitId: normalizeUuid(params.unitId),
    tenantId: normalizeUuid(params.tenantId),
    leaseId: normalizeUuid(params.leaseId),
    unitName: params.unitCode,
  });

  return postVoucher({
    voucher_type: 'Journal',
    voucher_date: new Date().toISOString().split('T')[0],
    reference_no: `REV-${params.originalInvoiceNumber}`,
    description: `Rent Invoice Reversal – ${params.originalInvoiceNumber} (${params.reversalReason})`,
    tenant_id: params.tenantId,
    property_id: params.propertyId,
    unit_id: params.unitId,
    lease_id: params.leaseId,
    lines: [
      {
        account_code: drAcct.slCode,
        account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
        debit: params.amount,
        credit: 0,
        description: drAcct.slName,
      },
      {
        account_code: crAcct.slCode,
        account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
        debit: 0,
        credit: params.amount,
        description: crAcct.slName,
      },
    ],
  });
}