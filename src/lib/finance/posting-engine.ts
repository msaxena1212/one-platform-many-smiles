import { supabase } from '../supabase';

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
      'id, account_code, account_name',
    )
    .in(
      'account_code',
      accountCodes,
    )
    .eq(
      'is_active',
      true,
    );

  if (error) {
    throw error;
  }

  for (
    const account of
    accounts || []
  ) {
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
        `Active COA account ${code} does not exist in fin_coa_accounts.`,
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
 * Main posting engine.
 */
export async function postAccountingEvent(
  eventId: string,
): Promise<PostingResult> {

  /*
   * ============================================================
   * 1. Load accounting event
   * ============================================================
   */

  const {
    data: event,
    error: eventError,
  } = await supabase
    .from(
      'fin_accounting_events',
    )
    .select('*')
    .eq(
      'id',
      eventId,
    )
    .single();

  if (
    eventError ||
    !event
  ) {
    throw (
      eventError ||
      new Error(
        `Accounting event ${eventId} was not found.`,
      )
    );
  }

  const accountingEvent =
    event as AccountingEvent;

  /*
   * ============================================================
   * 2. Existing POSTED event
   * ============================================================
   */

  if (
    accountingEvent.status ===
    'POSTED' &&
    accountingEvent.voucher_id
  ) {

    const {
      data: existingVoucher,
      error:
      existingVoucherError,
    } = await supabase
      .from(
        'fin_vouchers',
      )
      .select(
        'id, voucher_number',
      )
      .eq(
        'id',
        accountingEvent.voucher_id,
      )
      .maybeSingle();

    if (
      existingVoucherError
    ) {
      throw existingVoucherError;
    }

    if (
      existingVoucher
    ) {
      const receipt = await getGeneratedReceipt(accountingEvent.id);

      return {
        event_id: accountingEvent.id,
        voucher_id: existingVoucher.id,
        voucher_number: existingVoucher.voucher_number,
        ...receipt,
        status: 'POSTED',
      };
    }

    /*
     * Event says POSTED but voucher does not exist.
     *
     * This is an accounting integrity problem.
     * Do NOT silently create another voucher.
     */
    throw new Error(
      `Accounting event ${eventId} is marked POSTED but voucher ${accountingEvent.voucher_id} was not found.`,
    );
  }

  /*
   * ============================================================
   * 3. Validate event status
   * ============================================================
   */

  if (
    accountingEvent.status ===
    'POSTING'
  ) {
    throw new Error(
      `Accounting event ${eventId} is already being posted.`,
    );
  }

  if (
    accountingEvent.status ===
    'REVERSED'
  ) {
    throw new Error(
      `Accounting event ${eventId} has already been reversed.`,
    );
  }

  if (
    accountingEvent.status ===
    'CANCELLED'
  ) {
    throw new Error(
      `Accounting event ${eventId} has been cancelled.`,
    );
  }

  /*
   * ============================================================
   * 4. Load accounting event lines
   * ============================================================
   */

  const {
    data: rawLines,
    error: linesError,
  } = await supabase
    .from(
      'fin_accounting_event_lines',
    )
    .select('*')
    .eq(
      'event_id',
      eventId,
    )
    .order(
      'line_number',
      {
        ascending: true,
      },
    );

  if (linesError) {
    throw linesError;
  }

  if (
    !rawLines ||
    !rawLines.length
  ) {
    throw new Error(
      `Accounting event ${eventId} has no journal lines.`,
    );
  }

  const lines =
    rawLines as AccountingEventLine[];

  /*
   * ============================================================
   * 5. Validate journal lines
   * ============================================================
   */

  const lineTotals =
    validateLines(
      lines,
    );

  /*
   * ============================================================
   * 6. Validate event totals
   * ============================================================
   */

  const eventDebit =
    money(
      accountingEvent.total_debit,
    );

  const eventCredit =
    money(
      accountingEvent.total_credit,
    );

  validateBalance(
    eventDebit,
    eventCredit,
  );

  if (
    Math.abs(
      eventDebit -
      lineTotals.debit,
    ) >
    BALANCE_TOLERANCE
  ) {
    throw new Error(
      `Accounting event total debit does not match journal lines. Event=${eventDebit}, Lines=${lineTotals.debit}`,
    );
  }

  if (
    Math.abs(
      eventCredit -
      lineTotals.credit,
    ) >
    BALANCE_TOLERANCE
  ) {
    throw new Error(
      `Accounting event total credit does not match journal lines. Event=${eventCredit}, Lines=${lineTotals.credit}`,
    );
  }

  /*
   * ============================================================
   * 7. Resolve COA accounts
   * ============================================================
   */

  const accountMap =
    await resolveAccounts(
      lines,
    );

  /*
   * ============================================================
   * 8. Check for existing voucher
   * ============================================================
   *
   * This catches cases where voucher creation
   * succeeded but the event update did not.
   */

  const existingVoucher =
    await findExistingVoucher(
      eventId,
    );

  if (
    existingVoucher
  ) {

    /*
     * Ensure event points to the voucher.
     */
    await supabase
      .from(
        'fin_accounting_events',
      )
      .update({
        status: 'POSTED',
        voucher_id:
          existingVoucher.id,
        posted_at:
          new Date().toISOString(),
      })
      .eq(
        'id',
        eventId,
      );

    const receipt = await getGeneratedReceipt(eventId);

    return {
      event_id: eventId,
      voucher_id: existingVoucher.id,
      voucher_number: existingVoucher.voucher_number,
      ...receipt,
      status: 'POSTED',
    };
  }

  /*
   * ============================================================
   * 9. Acquire posting lock
   * ============================================================
   */

  const postingLock =
    await markEventPosting(
      eventId,
    );

  if (!postingLock) {

    /*
     * Another process may have posted
     * the event.
     */

    const {
      data: latestEvent,
      error: latestError,
    } = await supabase
      .from(
        'fin_accounting_events',
      )
      .select(
        'id, status, voucher_id',
      )
      .eq(
        'id',
        eventId,
      )
      .single();

    if (latestError) {
      throw latestError;
    }

    if (
      latestEvent?.status ===
      'POSTED' &&
      latestEvent?.voucher_id
    ) {

      const {
        data: voucher,
        error:
        voucherError,
      } = await supabase
        .from(
          'fin_vouchers',
        )
        .select(
          'id, voucher_number',
        )
        .eq(
          'id',
          latestEvent.voucher_id,
        )
        .single();

      if (
        voucherError ||
        !voucher
      ) {
        throw (
          voucherError ||
          new Error(
            `Accounting event ${eventId} is POSTED but its voucher could not be found.`,
          )
        );
      }

      const receipt = await getGeneratedReceipt(eventId);

      return {
        event_id: eventId,
        voucher_id: voucher.id,
        voucher_number: voucher.voucher_number,
        ...receipt,
        status: 'POSTED',
      };
    }

    throw new Error(
      `Accounting event ${eventId} could not be locked for posting.`,
    );
  }

  let voucherId:
    string | null = null;

  try {

    /*
     * ==========================================================
     * 10. Generate voucher number
     * ==========================================================
     */

    const voucherNumber =
      generateVoucherNumber(
        accountingEvent,
      );

    /*
     * ==========================================================
     * 11. Create financial voucher
     * ==========================================================
     *
     * ACTUAL TABLE:
     *
     * fin_vouchers
     *
     * Columns used:
     *
     * voucher_number
     * voucher_date
     * voucher_type
     * reference_no
     * description
     * total_amount
     * status
     * accounting_event_id
     * posted_at
     *
     * NOTE:
     * source_type and source_id are NOT columns
     * in fin_vouchers.
     */

    const {
      data: voucher,
      error: voucherError,
    } = await supabase
      .from(
        'fin_vouchers',
      )
      .insert({
        voucher_number:
          voucherNumber,

        voucher_date:
          accountingEvent.posting_date,

        voucher_type:
          'Journal',

        reference_no:
          accountingEvent.reference_number ||
          accountingEvent.source_id ||
          null,

        description:
          accountingEvent.description ||
          `${accountingEvent.event_type} - ${accountingEvent.source_type}`,

        total_amount:
          lineTotals.debit,

        status:
          'Posted',

        accounting_event_id:
          accountingEvent.id,

        posted_at:
          new Date().toISOString(),
      })
      .select(
        'id, voucher_number',
      )
      .single();

    if (
      voucherError ||
      !voucher
    ) {
      throw (
        voucherError ||
        new Error(
          'Failed to create financial voucher.',
        )
      );
    }

    voucherId =
      voucher.id;

    /*
     * ==========================================================
     * 12. Build voucher lines
     * ==========================================================
     */

    const voucherLines =
      lines.map(
        (line) => {

          const account =
            line.account_code
              ? accountMap.get(
                line.account_code.trim(),
              )
              : undefined;

          const resolvedAccountId =
            account?.id ||
            line.account_id ||
            null;

          if (
            !resolvedAccountId
          ) {
            throw new Error(
              `Voucher line ${line.line_number} could not resolve a COA account.`,
            );
          }

          return {
            voucher_id:
              voucher.id,

            account_id:
              resolvedAccountId,

            account_code:
              account?.account_code ||
              line.account_code ||
              null,

            account_name:
              account?.account_name ||
              line.account_name ||
              null,

            debit_amount:
              money(
                line.debit,
              ),

            credit_amount:
              money(
                line.credit,
              ),

            description:
              line.description ||
              account?.account_name ||
              line.account_name ||
              null,

            tenant_id:
              line.tenant_id ||
              accountingEvent.tenant_id ||
              null,

            lease_id:
              line.lease_id ||
              accountingEvent.lease_id ||
              null,

            property_id:
              line.property_id ||
              accountingEvent.property_id ||
              null,

            unit_id:
              line.unit_id ||
              accountingEvent.unit_id ||
              null,

            customer_id:
              line.customer_id ||
              accountingEvent.customer_id ||
              null,

            cost_center_id:
              line.cost_center_id ||
              null,

            source_type:
              line.source_type ||
              accountingEvent.source_type ||
              null,

            source_id:
              line.source_id ||
              accountingEvent.source_id ||
              null,
          };
        },
      );

    /*
     * ==========================================================
     * 13. Validate voucher lines before insertion
     * ==========================================================
     */

    let voucherDebit = 0;
    let voucherCredit = 0;

    for (
      const line of voucherLines
    ) {
      voucherDebit +=
        money(
          line.debit_amount,
        );

      voucherCredit +=
        money(
          line.credit_amount,
        );
    }

    voucherDebit =
      money(voucherDebit);

    voucherCredit =
      money(voucherCredit);

    validateBalance(
      voucherDebit,
      voucherCredit,
    );

    if (
      Math.abs(
        voucherDebit -
        lineTotals.debit,
      ) >
      BALANCE_TOLERANCE
    ) {
      throw new Error(
        `Voucher debit total does not match accounting event. Voucher=${voucherDebit}, Event=${lineTotals.debit}`,
      );
    }

    if (
      Math.abs(
        voucherCredit -
        lineTotals.credit,
      ) >
      BALANCE_TOLERANCE
    ) {
      throw new Error(
        `Voucher credit total does not match accounting event. Voucher=${voucherCredit}, Event=${lineTotals.credit}`,
      );
    }

    /*
     * ==========================================================
     * 14. Insert voucher lines
     * ==========================================================
     */

    const {
      error:
      voucherLinesError,
    } = await supabase
      .from(
        'fin_voucher_lines',
      )
      .insert(
        voucherLines,
      );

    if (
      voucherLinesError
    ) {
      throw voucherLinesError;
    }

    /*
     * ==========================================================
     * 15. Mark accounting event POSTED
     * ==========================================================
     */

    const {
      data:
      updatedEvent,
      error:
      postedError,
    } = await supabase
      .from(
        'fin_accounting_events',
      )
      .update({
        status:
          'POSTED',

        voucher_id:
          voucher.id,

        posted_at:
          new Date().toISOString(),
      })
      .eq(
        'id',
        accountingEvent.id,
      )
      .eq(
        'status',
        'POSTING',
      )
      .select(
        'id, status, voucher_id',
      )
      .maybeSingle();

    if (
      postedError
    ) {
      throw postedError;
    }

    if (
      !updatedEvent
    ) {
      throw new Error(
        `Accounting event ${accountingEvent.id} could not be marked POSTED.`,
      );
    }

    /*
     * ==========================================================
     * 16. Return result
     * ==========================================================
     */

    const receipt = await getGeneratedReceipt(accountingEvent.id);

    return {
      event_id: accountingEvent.id,
      voucher_id: voucher.id,
      voucher_number: voucher.voucher_number,
      ...receipt,
      status: 'POSTED',
    };

  } catch (error) {

    /*
     * ==========================================================
     * 17. Failure cleanup
     * ==========================================================
     *
     * Remove voucher lines first because they
     * reference fin_vouchers.
     */

    if (
      voucherId
    ) {

      await supabase
        .from(
          'fin_voucher_lines',
        )
        .delete()
        .eq(
          'voucher_id',
          voucherId,
        );

      await supabase
        .from(
          'fin_vouchers',
        )
        .delete()
        .eq(
          'id',
          voucherId,
        );
    }

    /*
     * Return event to DRAFT.
     */

    await restoreDraftStatus(
      accountingEvent.id,
    );

    /*
     * Preserve original error.
     */

    throw error;
  }
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
): Promise<PostingResult> {

  const cashOrBankAccount =
    mode === 'Cash'
      ? '10100'
      : '12000';

  return postVoucher({
    voucher_date:
      new Date()
        .toISOString()
        .split('T')[0],

    voucher_type:
      'Receipt',

    description:
      'Security Deposit Received',

    reference_no:
      reference,

    tenant_id:
      tenantId,

    property_id:
      propertyId,

    unit_id:
      unitId,

    lines: [
      {
        account_code:
          cashOrBankAccount,

        debit:
          amount,

        credit:
          0,

        description:
          'Security Deposit Received',
      },

      {
        account_code:
          '21500',

        debit:
          0,

        credit:
          amount,

        description:
          'Security Deposit Liability',
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
): Promise<PostingResult> {

  return postVoucher({
    voucher_type: 'Receipt',

    voucher_date:
      new Date()
        .toISOString()
        .split('T')[0],

    reference_no:
      chequeNumber,

    description:
      `PDC Received - ${chequeNumber}${unitCode ? ` - ${unitCode}` : ''}`,

    tenant_id:
      tenantId,

    property_id:
      propertyId,

    unit_id:
      unitId,

    lines: [
      {
        account_code:
          '12900',

        debit:
          amount,

        credit:
          0,

        description:
          'PDC In Hand',
      },

      {
        account_code:
          '21400',

        debit:
          0,

        credit:
          amount,

        description:
          'Customer PDC Liability',
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
): Promise<PostingResult> {

  return postVoucher({
    voucher_type: 'Receipt',

    voucher_date:
      new Date()
        .toISOString()
        .split('T')[0],

    reference_no:
      chequeNumber,

    description:
      `PDC Deposited to Bank - ${chequeNumber}`,

    tenant_id:
      tenantId,

    property_id:
      propertyId,

    unit_id:
      unitId,

    lines: [
      {
        account_code:
          '12000',

        debit:
          amount,

        credit:
          0,

        description:
          'Bank Account',
      },

      {
        account_code:
          '12900',

        debit:
          0,

        credit:
          amount,

        description:
          'PDC In Hand',
      },
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
): Promise<PostingResult> {

  return postVoucher({
    voucher_type: 'Journal',

    voucher_date:
      new Date()
        .toISOString()
        .split('T')[0],

    reference_no:
      chequeNumber,

    description:
      `PDC Cleared - ${chequeNumber}${unitCode ? ` - ${unitCode}` : ''}`,

    tenant_id:
      tenantId,

    property_id:
      propertyId,

    unit_id:
      unitId,

    lines: [
      {
        account_code:
          '21400',

        debit:
          amount,

        credit:
          0,

        description:
          'Customer PDC Liability',
      },

      {
        account_code:
          '12413',

        debit:
          0,

        credit:
          amount,

        description:
          'Tenant Receivable',
      },
    ],
  });
}

export async function postPdcReturn(
  amount: number,
  tenantId: string | number,
  propertyId: string | number,
  unitId: string | number,
  chequeNumber: string,
  unitCode?: string,
): Promise<PostingResult> {

  return postVoucher({
    voucher_type: 'Journal',

    voucher_date:
      new Date()
        .toISOString()
        .split('T')[0],

    reference_no:
      chequeNumber,

    description:
      `PDC Returned / Bounced - ${chequeNumber}${unitCode ? ` - ${unitCode}` : ''}`,

    tenant_id:
      tenantId,

    property_id:
      propertyId,

    unit_id:
      unitId,

    lines: [
      {
        account_code:
          '12900',

        debit:
          amount,

        credit:
          0,

        description:
          'PDC In Hand',
      },

      {
        account_code:
          '12413',

        debit:
          amount,

        credit:
          0,

        description:
          'Tenant Receivable',
      },

      {
        account_code:
          '12000',

        debit:
          0,

        credit:
          amount,

        description:
          'Bank Account',
      },

      {
        account_code:
          '21400',

        debit:
          0,

        credit:
          amount,

        description:
          'Customer PDC Liability',
      },
    ],
  });
}


export async function postCashDepositInPlaceOfPdc(
  amount: number,
  tenantId: string | number,
  propertyId: string | number,
  unitId: string | number,
  chequeNumber: string,
): Promise<PostingResult> {

  return postVoucher({
    voucher_type: 'Receipt',

    voucher_date:
      new Date()
        .toISOString()
        .split('T')[0],

    reference_no:
      chequeNumber,

    description:
      `Cash Deposit in Place of PDC - ${chequeNumber}`,

    tenant_id:
      tenantId,

    property_id:
      propertyId,

    unit_id:
      unitId,

    lines: [
      {
        account_code:
          '12000',

        debit:
          amount,

        credit:
          0,

        description:
          'Bank Account',
      },

      {
        account_code:
          '12100',

        debit:
          0,

        credit:
          amount,

        description:
          'Cash In Hand',
      },
    ],
  });
}

export async function postPdcCancel(
  amount: number,
  tenantId: string | number,
  propertyId: string | number,
  unitId: string | number,
  chequeNumber: string,
  reason?: string,
): Promise<PostingResult> {
  return postVoucher({
    voucher_type: 'Journal',
    voucher_date: new Date().toISOString().split('T')[0],
    reference_no: chequeNumber,
    description: `PDC Cancelled - ${chequeNumber}${reason ? ` - ${reason}` : ''}`,
    tenant_id: tenantId,
    property_id: propertyId,
    unit_id: unitId,
    lines: [
      {
        account_code: '21400',
        debit: amount,
        credit: 0,
        description: 'Customer PDC Liability',
      },
      {
        account_code: '12900',
        debit: 0,
        credit: amount,
        description: 'PDC In Hand',
      },
    ],
  });
}