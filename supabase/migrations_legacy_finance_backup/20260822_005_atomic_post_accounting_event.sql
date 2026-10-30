create or replace function public.post_accounting_event_atomic(
    p_event_id uuid
)
returns table (
    event_id uuid,
    voucher_id uuid,
    voucher_number text,
    status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_event fin_accounting_events%rowtype;
    v_voucher fin_vouchers%rowtype;

    v_total_debit numeric(18,2);
    v_total_credit numeric(18,2);

    v_voucher_number text;
begin

    /*
     * ============================================================
     * 1. Lock accounting event
     * ============================================================
     */

    select *
    into v_event
    from public.fin_accounting_events
    where id = p_event_id
    for update;

    if not found then
        raise exception
            'Accounting event % was not found.',
            p_event_id;
    end if;


    /*
     * ============================================================
     * 2. Already POSTED
     * ============================================================
     */

    if v_event.status = 'POSTED' then

        if v_event.voucher_id is null then
            raise exception
                'Accounting event % is POSTED but voucher_id is null.',
                p_event_id;
        end if;

        select *
        into v_voucher
        from public.fin_vouchers
        where id = v_event.voucher_id;

        if not found then
            raise exception
                'Accounting event % is POSTED but voucher % was not found.',
                p_event_id,
                v_event.voucher_id;
        end if;

        return query
        select
            v_event.id,
            v_voucher.id,
            v_voucher.voucher_number,
            'POSTED'::text;

        return;
    end if;


    /*
     * ============================================================
     * 3. Invalid statuses
     * ============================================================
     */

    if v_event.status = 'REVERSED' then
        raise exception
            'Accounting event % has already been reversed.',
            p_event_id;
    end if;

    if v_event.status = 'CANCELLED' then
        raise exception
            'Accounting event % has been cancelled.',
            p_event_id;
    end if;


    /*
     * ============================================================
     * 4. Validate accounting lines
     * ============================================================
     */

    select
        coalesce(sum(debit), 0),
        coalesce(sum(credit), 0)
    into
        v_total_debit,
        v_total_credit
    from public.fin_accounting_event_lines
    where event_id = p_event_id;

    v_total_debit := round(v_total_debit, 2);
    v_total_credit := round(v_total_credit, 2);

    if v_total_debit <= 0
       and v_total_credit <= 0 then

        raise exception
            'Accounting event % contains zero-value accounting lines.',
            p_event_id;

    end if;

/*
 * ============================================================
 * 4A. Validate COA account resolution
 * ============================================================
 *
 * Every accounting line must resolve to an active COA account.
 * Resolution can happen through:
 *
 * 1. account_id
 * 2. account_code
 *
 * An inactive or missing COA account is not permitted.
 */

if exists (
    select 1
    from public.fin_accounting_event_lines l
    where l.event_id = p_event_id
      and not exists (
          select 1
          from public.fin_coa_accounts coa
          where coa.is_active = true
            and (
                coa.id = l.account_id
                or (
                    l.account_id is null
                    and coa.account_code = l.account_code
                )
            )
      )
) then

    raise exception
        'Accounting event % contains an unresolved or inactive COA account.',
        p_event_id;

end if;

    /*
     * ============================================================
     * 5. Ensure balanced entry
     * ============================================================
     */

    if abs(v_total_debit - v_total_credit) > 0.001 then
        raise exception
            'Accounting event % is unbalanced. Debit=%, Credit=%.',
            p_event_id,
            v_total_debit,
            v_total_credit;
    end if;


    /*
     * ============================================================
     * 6. Validate event totals
     * ============================================================
     */

    if abs(
        round(coalesce(v_event.total_debit, 0), 2)
        - v_total_debit
    ) > 0.001 then

        raise exception
            'Accounting event % debit total does not match event lines.',
            p_event_id;

    end if;


    if abs(
        round(coalesce(v_event.total_credit, 0), 2)
        - v_total_credit
    ) > 0.001 then

        raise exception
            'Accounting event % credit total does not match event lines.',
            p_event_id;

    end if;


    /*
     * ============================================================
     * 7. Existing voucher / idempotency protection
     * ============================================================
     */

    select *
    into v_voucher
    from public.fin_vouchers
    where accounting_event_id = p_event_id
    limit 1;

    if found then

        update public.fin_accounting_events
        set
            status = 'POSTED',
            voucher_id = v_voucher.id,
            posted_at = coalesce(posted_at, now()),
            updated_at = now()
        where id = p_event_id;

        return query
        select
            p_event_id,
            v_voucher.id,
            v_voucher.voucher_number,
            'POSTED'::text;

        return;

    end if;


    /*
     * ============================================================
     * 8. Generate voucher number
     * ============================================================
     */

    if nullif(trim(v_event.reference_number), '') is not null then

        v_voucher_number := trim(v_event.reference_number);

    else

        v_voucher_number :=
            'EVT-' ||
            upper(
                substring(
                    replace(v_event.id::text, '-', '')
                    from 1 for 8
                )
            );

    end if;


    /*
     * ============================================================
     * 9. Create voucher
     * ============================================================
     */

    insert into public.fin_vouchers (
        voucher_number,
        voucher_date,
        voucher_type,
        reference_no,
        description,
        total_amount,
        status,
        accounting_event_id,
        posted_at,
        source_type,
        source_id,
        created_by
    )
    values (
        v_voucher_number,
        v_event.posting_date,
        'Journal',
        coalesce(
            v_event.reference_number,
            v_event.source_id::text
        ),
        coalesce(
            v_event.description,
            v_event.event_type::text || ' - ' ||
            v_event.source_type
        ),
        v_total_debit,
        'Posted',
        v_event.id,
        now(),
        v_event.source_type,
        v_event.source_id,
        v_event.created_by
    )
    returning *
    into v_voucher;


    /*
     * ============================================================
     * 10. Create voucher lines
     * ============================================================
     */

    insert into public.fin_voucher_lines (
        voucher_id,
        account_id,
        account_code,
        account_name,
        debit_amount,
        credit_amount,
        description,
        tenant_id,
        lease_id,
        property_id,
        unit_id,
        customer_id,
        cost_center_id,
        source_type,
        source_id
    )
    select
        v_voucher.id,

        coalesce(
            l.account_id,
            coa.id
        ),

        coalesce(
            coa.account_code,
            l.account_code
        ),

        coalesce(
            coa.account_name,
            l.account_name
        ),

        round(l.debit, 2),
        round(l.credit, 2),

        coalesce(
            l.description,
            coa.account_name,
            l.account_name
        ),

        coalesce(
            l.tenant_id,
            v_event.tenant_id
        ),

        coalesce(
            l.lease_id,
            v_event.lease_id
        ),

        coalesce(
            l.property_id,
            v_event.property_id
        ),

        coalesce(
            l.unit_id,
            v_event.unit_id
        ),

        coalesce(
            l.customer_id,
            v_event.customer_id
        ),

        l.cost_center_id,

        coalesce(
            l.source_type,
            v_event.source_type
        ),

        coalesce(
            l.source_id,
            v_event.source_id
        )

    from public.fin_accounting_event_lines l

    left join public.fin_coa_accounts coa
        on coa.id = l.account_id
        or (
            l.account_id is null
            and coa.account_code = l.account_code
            and coa.is_active = true
        )

    where l.event_id = p_event_id;


    /*
     * ============================================================
     * 11. Ensure voucher line count matches event line count
     * ============================================================
     */

    if (
        select count(*)
        from public.fin_voucher_lines
        where voucher_id = v_voucher.id
    ) <> (
        select count(*)
        from public.fin_accounting_event_lines
        where event_id = p_event_id
    ) then

        raise exception
            'Voucher lines could not be created correctly for accounting event %.',
            p_event_id;

    end if;


    /*
     * ============================================================
     * 12. Mark event POSTED
     * ============================================================
     */

    update public.fin_accounting_events
    set
        status = 'POSTED',
        voucher_id = v_voucher.id,
        posted_at = now(),
        updated_at = now()
    where id = p_event_id;


    /*
     * ============================================================
     * 13. Return result
     * ============================================================
     */

    return query
    select
        p_event_id,
        v_voucher.id,
        v_voucher.voucher_number,
        'POSTED'::text;

end;
$$;