import { supabase } from '../supabase';

export async function syncAccountingEventToErp(
    eventId: string,
) {
    /*
     * 1. Load event
     */
    const { data: event, error: eventError } =
        await supabase
            .from('fin_accounting_events')
            .select('*')
            .eq('id', eventId)
            .single();

    if (eventError || !event) {
        throw eventError || new Error(
            'Accounting event not found.',
        );
    }

    /*
     * Already linked.
     */
    if (event.voucher_id) {
        return event.voucher_id;
    }

    /*
     * 2. Load event lines
     */
    const { data: lines, error: linesError } =
        await supabase
            .from('fin_accounting_event_lines')
            .select('*')
            .eq('event_id', eventId)
            .order('line_number');

    if (linesError || !lines?.length) {
        throw linesError || new Error(
            'Accounting event has no journal lines.',
        );
    }

    /*
     * 3. Resolve COA
     */
    const accountCodes = [
        ...new Set(
            lines
                .map((line) => line.account_code)
                .filter(Boolean),
        ),
    ];

    const { data: accounts, error: accountsError } =
        await supabase
            .from('erp_chart_of_accounts')
            .select('id, code, name')
            .in('code', accountCodes);

    if (accountsError) {
        throw accountsError;
    }

    const accountMap = new Map<
        string,
        { id: string; name: string }
    >();

    for (const account of accounts || []) {
        accountMap.set(account.code, {
            id: account.id,
            name: account.name,
        });
    }

    /*
     * Every accounting line must resolve to a COA.
     */
    for (const line of lines) {
        if (!accountMap.has(line.account_code)) {
            throw new Error(
                `COA account ${line.account_code} does not exist.`,
            );
        }
    }

    /*
     * 4. Create ERP voucher.
     *
     * Keep the event as the source document.
     */
    const voucherNo =
        event.reference_number ||
        `EVT-${String(event.id).slice(0, 8)}`;

    const { data: voucher, error: voucherError } =
        await supabase
            .from('erp_vouchers')
            .insert({
                voucher_no: voucherNo,
                voucher_type: 'Journal',
                voucher_date: event.posting_date,
                total_amount: event.total_debit,
                notes: event.description,

                accounting_event_id: event.id,
                source_type: event.source_type,
                source_id: event.source_id,

                posting_status: 'POSTED',
            })
            .select()
            .single();

    if (voucherError || !voucher) {
        throw voucherError || new Error(
            'Failed to create ERP voucher.',
        );
    }

    /*
     * 5. Create ERP journal entries.
     */
    const journalLines = lines.map((line) => {
        const account = accountMap.get(
            line.account_code,
        );

        return {
            voucher_id: voucher.id,

            accounting_event_id: event.id,

            account_id: account?.id || null,
            account_name:
                account?.name ||
                line.account_name ||
                `Account ${line.account_code}`,

            account_code: line.account_code,
            sl_code: line.sl_code || null,

            debit: line.debit,
            credit: line.credit,

            description: line.description || null,

            property_id: line.property_id || null,
            unit_id: line.unit_id || null,
            tenant_id: line.tenant_id || null,
            lease_id: line.lease_id || null,
            customer_id: line.customer_id || null,
            cost_center_id: line.cost_center_id || null,
        };
    });

    const { error: journalError } =
        await supabase
            .from('erp_journal_entries')
            .insert(journalLines);

    if (journalError) {
        /*
         * Cleanup orphan voucher.
         */
        await supabase
            .from('erp_vouchers')
            .delete()
            .eq('id', voucher.id);

        throw journalError;
    }

    /*
     * 6. Mark accounting event posted.
     */
    const { error: updateError } =
        await supabase
            .from('fin_accounting_events')
            .update({
                status: 'POSTED',
                voucher_id: voucher.id,
                posted_at: new Date().toISOString(),
            })
            .eq('id', event.id);

    if (updateError) {
        throw updateError;
    }

    return voucher.id;
}