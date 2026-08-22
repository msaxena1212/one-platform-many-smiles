const { Client } = require('pg');
const { connectionString } = require('./database-config.cjs');

const client = new Client({ connectionString });

function section(title) {
  console.log('');
  console.log('============================================================');
  console.log(` ${title}`);
  console.log('============================================================');
}

function printResult(title, rows) {
  console.log('');
  console.log(`--- ${title} ---`);

  if (!rows.length) {
    console.log('PASS: No issues found.');
    return;
  }

  console.table(rows);
}

async function main() {
  await client.connect();

  console.log('');
  console.log('============================================================');
  console.log(' PRODUCTION ACCOUNTING FLOW AUDIT');
  console.log(' READ-ONLY - NO DATABASE CHANGES');
  console.log('============================================================');

  // ==========================================================
  // 1. ACCOUNTING EVENT SUMMARY
  // ==========================================================

  section('1. ACCOUNTING EVENT SUMMARY');

  const eventSummary = await client.query(`
    SELECT
      event_type::text AS event_type,
      status::text AS status,
      COUNT(*)::int AS event_count,
      COALESCE(SUM(total_debit), 0) AS total_debit,
      COALESCE(SUM(total_credit), 0) AS total_credit
    FROM fin_accounting_events
    GROUP BY event_type, status
    ORDER BY event_type, status;
  `);

  console.table(eventSummary.rows);

  // ==========================================================
  // 2. EVENT TOTALS VS JOURNAL TOTALS
  // ==========================================================

  section('2. EVENT TOTALS VS JOURNAL TOTALS');

  const eventJournalMismatch = await client.query(`
    SELECT
      e.id AS event_id,
      e.event_type::text AS event_type,
      e.status::text AS status,
      e.total_debit AS event_debit,
      e.total_credit AS event_credit,
      COALESCE(SUM(j.debit), 0) AS journal_debit,
      COALESCE(SUM(j.credit), 0) AS journal_credit
    FROM fin_accounting_events e
    LEFT JOIN erp_journal_entries j
      ON j.accounting_event_id = e.id
    GROUP BY
      e.id,
      e.event_type,
      e.status,
      e.total_debit,
      e.total_credit
    HAVING
      e.status::text = 'POSTED'
      AND (
        e.total_debit <> COALESCE(SUM(j.debit), 0)
        OR
        e.total_credit <> COALESCE(SUM(j.credit), 0)
      )
    ORDER BY e.created_at;
  `);

  printResult(
    'POSTED EVENTS WHERE EVENT TOTALS DO NOT MATCH JOURNALS',
    eventJournalMismatch.rows
  );

  // ==========================================================
  // 3. UNBALANCED JOURNAL ENTRIES BY ACCOUNTING EVENT
  // ==========================================================

  section('3. JOURNAL BALANCE AUDIT');

  const unbalancedEvents = await client.query(`
    SELECT
      e.id AS event_id,
      e.event_type::text AS event_type,
      e.status::text AS status,
      COUNT(j.id)::int AS journal_lines,
      COALESCE(SUM(j.debit), 0) AS total_debit,
      COALESCE(SUM(j.credit), 0) AS total_credit,
      COALESCE(SUM(j.debit), 0) - COALESCE(SUM(j.credit), 0) AS difference
    FROM fin_accounting_events e
    JOIN erp_journal_entries j
      ON j.accounting_event_id = e.id
    GROUP BY
      e.id,
      e.event_type,
      e.status
    HAVING
      COALESCE(SUM(j.debit), 0) <>
      COALESCE(SUM(j.credit), 0)
    ORDER BY e.created_at;
  `);

  printResult(
    'UNBALANCED ACCOUNTING EVENTS',
    unbalancedEvents.rows
  );

  // ==========================================================
  // 4. POSTED EVENTS WITHOUT VOUCHERS
  // ==========================================================

  section('4. POSTED EVENTS WITHOUT VOUCHERS');

  const postedWithoutVoucher = await client.query(`
    SELECT
      e.id AS event_id,
      e.event_type::text AS event_type,
      e.event_date,
      e.posting_date,
      e.source_type,
      e.source_id,
      e.total_debit,
      e.total_credit
    FROM fin_accounting_events e
    LEFT JOIN erp_vouchers v
      ON v.accounting_event_id = e.id
    WHERE e.status::text = 'POSTED'
      AND v.id IS NULL
    ORDER BY e.posting_date, e.created_at;
  `);

  printResult(
    'POSTED EVENTS WITHOUT VOUCHER',
    postedWithoutVoucher.rows
  );

  // ==========================================================
  // 5. POSTED EVENTS WITHOUT JOURNAL ENTRIES
  // ==========================================================

  section('5. POSTED EVENTS WITHOUT JOURNAL ENTRIES');

  const postedWithoutJournal = await client.query(`
    SELECT
      e.id AS event_id,
      e.event_type::text AS event_type,
      e.event_date,
      e.posting_date,
      e.source_type,
      e.source_id,
      e.total_debit,
      e.total_credit
    FROM fin_accounting_events e
    LEFT JOIN erp_journal_entries j
      ON j.accounting_event_id = e.id
    WHERE e.status::text = 'POSTED'
      AND j.id IS NULL
    ORDER BY e.posting_date, e.created_at;
  `);

  printResult(
    'POSTED EVENTS WITHOUT JOURNAL ENTRIES',
    postedWithoutJournal.rows
  );

  // ==========================================================
  // 6. VOUCHERS WITHOUT ACCOUNTING EVENTS
  // ==========================================================

  section('6. VOUCHERS WITHOUT ACCOUNTING EVENTS');

  const vouchersWithoutEvents = await client.query(`
    SELECT
      v.id AS voucher_id,
      v.voucher_no,
      v.voucher_type,
      v.voucher_date,
      v.total_amount,
      v.posting_status,
      v.accounting_event_id
    FROM erp_vouchers v
    LEFT JOIN fin_accounting_events e
      ON e.id = v.accounting_event_id
    WHERE v.accounting_event_id IS NOT NULL
      AND e.id IS NULL
    ORDER BY v.voucher_date, v.created_at;
  `);

  printResult(
    'VOUCHERS REFERENCING MISSING ACCOUNTING EVENTS',
    vouchersWithoutEvents.rows
  );

  // ==========================================================
  // 7. JOURNAL ENTRIES WITHOUT VOUCHERS
  // ==========================================================

  section('7. JOURNAL ENTRIES WITHOUT VOUCHERS');

  const journalsWithoutVoucher = await client.query(`
    SELECT
      j.id AS journal_id,
      j.voucher_id,
      j.accounting_event_id,
      j.account_id,
      j.account_name,
      j.debit,
      j.credit,
      j.line_number,
      j.description
    FROM erp_journal_entries j
    LEFT JOIN erp_vouchers v
      ON v.id = j.voucher_id
    WHERE j.voucher_id IS NOT NULL
      AND v.id IS NULL
    ORDER BY j.created_at;
  `);

  printResult(
    'JOURNAL ENTRIES REFERENCING MISSING VOUCHERS',
    journalsWithoutVoucher.rows
  );

  // ==========================================================
  // 8. JOURNAL ENTRIES WITHOUT ACCOUNTING EVENTS
  // ==========================================================

  section('8. JOURNAL ENTRIES WITHOUT ACCOUNTING EVENTS');

  const journalsWithoutEvent = await client.query(`
    SELECT
      j.id AS journal_id,
      j.voucher_id,
      j.accounting_event_id,
      j.account_id,
      j.account_name,
      j.debit,
      j.credit,
      j.line_number,
      j.description
    FROM erp_journal_entries j
    LEFT JOIN fin_accounting_events e
      ON e.id = j.accounting_event_id
    WHERE j.accounting_event_id IS NOT NULL
      AND e.id IS NULL
    ORDER BY j.created_at;
  `);

  printResult(
    'JOURNAL ENTRIES REFERENCING MISSING ACCOUNTING EVENTS',
    journalsWithoutEvent.rows
  );

  // ==========================================================
  // 9. VOUCHER TOTAL VS JOURNAL TOTAL
  // ==========================================================

  section('9. VOUCHER TOTAL VS JOURNAL TOTAL');

  const voucherJournalMismatch = await client.query(`
    SELECT
      v.id AS voucher_id,
      v.voucher_no,
      v.voucher_type,
      v.total_amount,
      COALESCE(SUM(j.debit), 0) AS journal_debit,
      COALESCE(SUM(j.credit), 0) AS journal_credit
    FROM erp_vouchers v
    LEFT JOIN erp_journal_entries j
      ON j.voucher_id = v.id
    GROUP BY
      v.id,
      v.voucher_no,
      v.voucher_type,
      v.total_amount
    HAVING
      COALESCE(SUM(j.debit), 0) <>
      COALESCE(SUM(j.credit), 0)
      OR
      v.total_amount <> COALESCE(SUM(j.debit), 0)
    ORDER BY v.voucher_date, v.created_at;
  `);

  printResult(
    'VOUCHERS WITH JOURNAL/TOTAL AMOUNT MISMATCH',
    voucherJournalMismatch.rows
  );

  // ==========================================================
  // 10. DUPLICATE IDEMPOTENCY KEYS
  // ==========================================================

  section('10. IDEMPOTENCY AUDIT');

  const duplicateIdempotency = await client.query(`
    SELECT
      idempotency_key,
      COUNT(*)::int AS occurrence_count
    FROM fin_accounting_events
    GROUP BY idempotency_key
    HAVING COUNT(*) > 1
    ORDER BY occurrence_count DESC;
  `);

  printResult(
    'DUPLICATE ACCOUNTING EVENT IDEMPOTENCY KEYS',
    duplicateIdempotency.rows
  );

  // ==========================================================
  // 11. REVERSAL INTEGRITY
  // ==========================================================

  section('11. REVERSAL INTEGRITY');

  const invalidReversals = await client.query(`
    SELECT
      e.id AS reversal_event_id,
      e.event_type::text AS reversal_event_type,
      e.status::text AS reversal_status,
      e.reversal_of_event_id,
      original.status::text AS original_status,
      original.event_type::text AS original_event_type
    FROM fin_accounting_events e
    LEFT JOIN fin_accounting_events original
      ON original.id = e.reversal_of_event_id
    WHERE e.reversal_of_event_id IS NOT NULL
      AND original.id IS NULL;
  `);

  printResult(
    'REVERSAL EVENTS WITH MISSING ORIGINAL EVENTS',
    invalidReversals.rows
  );

  const missingReverseLinks = await client.query(`
    SELECT
      e.id AS original_event_id,
      e.event_type::text AS original_event_type,
      e.status::text AS original_status,
      e.reversed_by_event_id
    FROM fin_accounting_events e
    LEFT JOIN fin_accounting_events reversal
      ON reversal.id = e.reversed_by_event_id
    WHERE e.reversed_by_event_id IS NOT NULL
      AND reversal.id IS NULL;
  `);

  printResult(
    'EVENTS WITH MISSING REVERSE EVENT',
    missingReverseLinks.rows
  );

  // ==========================================================
  // 12. POSTED EVENTS WITHOUT POSTED VOUCHERS
  // ==========================================================

  section('12. POSTING STATUS CONSISTENCY');

  const statusMismatch = await client.query(`
    SELECT
      e.id AS event_id,
      e.event_type::text AS event_type,
      e.status::text AS event_status,
      v.id AS voucher_id,
      v.voucher_no,
      v.posting_status AS voucher_status
    FROM fin_accounting_events e
    JOIN erp_vouchers v
      ON v.accounting_event_id = e.id
    WHERE
      (e.status::text = 'POSTED' AND v.posting_status <> 'POSTED')
      OR
      (e.status::text <> 'POSTED' AND v.posting_status = 'POSTED')
    ORDER BY e.created_at;
  `);

  printResult(
    'EVENT/VOUCHER POSTING STATUS MISMATCHES',
    statusMismatch.rows
  );

  // ==========================================================
  // 13. PDC EVENT COVERAGE
  // ==========================================================

  section('13. PDC ACCOUNTING EVENT COVERAGE');

  const pdcEvents = await client.query(`
    SELECT
      event_type::text AS event_type,
      status::text AS status,
      COUNT(*)::int AS count
    FROM fin_accounting_events
    WHERE event_type::text LIKE 'PDC_%'
    GROUP BY event_type, status
    ORDER BY event_type, status;
  `);

  printResult(
    'PDC ACCOUNTING EVENTS',
    pdcEvents.rows
  );

  // ==========================================================
  // 14. SECURITY DEPOSIT EVENT COVERAGE
  // ==========================================================

  section('14. SECURITY DEPOSIT ACCOUNTING EVENT COVERAGE');

  const depositEvents = await client.query(`
    SELECT
      event_type::text AS event_type,
      status::text AS status,
      COUNT(*)::int AS count
    FROM fin_accounting_events
    WHERE event_type::text LIKE 'SECURITY_DEPOSIT_%'
    GROUP BY event_type, status
    ORDER BY event_type, status;
  `);

  printResult(
    'SECURITY DEPOSIT ACCOUNTING EVENTS',
    depositEvents.rows
  );

  // ==========================================================
  // 15. RECEIPT / REFUND EVENT COVERAGE
  // ==========================================================

  section('15. RECEIPT / REFUND ACCOUNTING EVENT COVERAGE');

  const receiptRefundEvents = await client.query(`
    SELECT
      event_type::text AS event_type,
      status::text AS status,
      COUNT(*)::int AS count
    FROM fin_accounting_events
    WHERE event_type::text IN (
      'RECEIPT_CREATED',
      'RECEIPT_CANCELLED',
      'REFUND_CREATED',
      'REFUND_CANCELLED'
    )
    GROUP BY event_type, status
    ORDER BY event_type, status;
  `);

  printResult(
    'RECEIPT / REFUND ACCOUNTING EVENTS',
    receiptRefundEvents.rows
  );

  // ==========================================================
  // 16. POSTING PERIOD AUDIT
  // ==========================================================

  section('16. POSTING PERIOD AUDIT');

  const postingPeriodCoverage = await client.query(`
    SELECT
      e.id AS event_id,
      e.event_type::text AS event_type,
      e.status::text AS status,
      e.posting_date
    FROM fin_accounting_events e
    LEFT JOIN fin_posting_periods p
      ON p.year = EXTRACT(YEAR FROM e.posting_date)::text
     AND p.month = EXTRACT(MONTH FROM e.posting_date)::int
    WHERE e.status::text = 'POSTED'
      AND p.id IS NULL
    ORDER BY e.posting_date;
  `);

  printResult(
    'POSTED EVENTS WITHOUT MATCHING POSTING PERIOD',
    postingPeriodCoverage.rows
  );

  // ==========================================================
  // 17. CLOSED PERIOD POSTINGS
  // ==========================================================

  section('17. CLOSED PERIOD POSTING AUDIT');

  const closedPeriodPostings = await client.query(`
    SELECT
      e.id AS event_id,
      e.event_type::text AS event_type,
      e.posting_date,
      p.period_name,
      p.year,
      p.month,
      p.status AS period_status
    FROM fin_accounting_events e
    JOIN fin_posting_periods p
      ON p.year = EXTRACT(YEAR FROM e.posting_date)::text
     AND p.month = EXTRACT(MONTH FROM e.posting_date)::int
    WHERE e.status::text = 'POSTED'
      AND LOWER(p.status) <> 'open'
    ORDER BY e.posting_date;
  `);

  printResult(
    'POSTED EVENTS IN NON-OPEN PERIODS',
    closedPeriodPostings.rows
  );

  // ==========================================================
  // 18. JOURNAL LINES WITH INVALID DEBIT/CREDIT STATE
  // ==========================================================

  section('18. JOURNAL LINE VALIDATION');

  const invalidJournalLines = await client.query(`
    SELECT
      id AS journal_id,
      voucher_id,
      accounting_event_id,
      account_id,
      debit,
      credit,
      line_number,
      description
    FROM erp_journal_entries
    WHERE
      COALESCE(debit, 0) < 0
      OR
      COALESCE(credit, 0) < 0
      OR
      (
        COALESCE(debit, 0) > 0
        AND COALESCE(credit, 0) > 0
      )
      OR
      (
        COALESCE(debit, 0) = 0
        AND COALESCE(credit, 0) = 0
      )
    ORDER BY created_at;
  `);

  printResult(
    'INVALID JOURNAL LINES',
    invalidJournalLines.rows
  );

  // ==========================================================
  // 19. JOURNAL LINES WITHOUT ACCOUNTS
  // ==========================================================

  section('19. JOURNAL ACCOUNT INTEGRITY');

  const invalidAccounts = await client.query(`
    SELECT
      j.id AS journal_id,
      j.account_id,
      j.account_name,
      j.debit,
      j.credit,
      j.accounting_event_id
    FROM erp_journal_entries j
    LEFT JOIN erp_chart_of_accounts coa
      ON coa.id = j.account_id
    WHERE j.account_id IS NOT NULL
      AND coa.id IS NULL
    ORDER BY j.created_at;
  `);

  printResult(
    'JOURNAL ENTRIES WITH MISSING CHART OF ACCOUNT',
    invalidAccounts.rows
  );

  // ==========================================================
  // 20. FINAL COUNTS
  // ==========================================================

  section('20. FINAL FINANCE COUNTS');

  const counts = await client.query(`
    SELECT 'Accounting Events' AS object, COUNT(*)::int AS count
    FROM fin_accounting_events

    UNION ALL

    SELECT 'Vouchers', COUNT(*)::int
    FROM erp_vouchers

    UNION ALL

    SELECT 'Journal Entries', COUNT(*)::int
    FROM erp_journal_entries

    UNION ALL

    SELECT 'Chart of Accounts', COUNT(*)::int
    FROM erp_chart_of_accounts

    UNION ALL

    SELECT 'PDC Records', COUNT(*)::int
    FROM pdcs

    UNION ALL

    SELECT 'PDC Finance Register', COUNT(*)::int
    FROM fin_pdc_register

    UNION ALL

    SELECT 'Finance Deposits', COUNT(*)::int
    FROM fin_deposits

    UNION ALL

    SELECT 'Collection Receipts', COUNT(*)::int
    FROM collection_receipts;
  `);

  console.table(counts.rows);

  // ==========================================================
  // FINAL
  // ==========================================================

  console.log('');
  console.log('============================================================');
  console.log(' ACCOUNTING FLOW AUDIT COMPLETED');
  console.log(' NO DATABASE CHANGES WERE MADE');
  console.log('============================================================');

  await client.end();
}

main().catch(async (error) => {
  console.error('');
  console.error('============================================================');
  console.error(' ACCOUNTING FLOW AUDIT FAILED');
  console.error('============================================================');
  console.error(error.message);

  try {
    await client.end();
  } catch {}

  process.exit(1);
});
