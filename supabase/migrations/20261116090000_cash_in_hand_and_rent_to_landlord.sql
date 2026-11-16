-- Cash In Hand account (cash receipts were posted to the bank account because the account did not exist)
-- and a posting-level Rent to Landlord sub-ledger under the existing 51005 GL head.

insert into public.fin_coa_accounts (id, account_code, account_name, account_type, parent_id, is_active, created_at, updated_at, parent_account_id, group_name, class_name, account_level)
select gen_random_uuid(), '12100', 'Cash In Hand', 'ASSET', null, true, now(), now(), null, 'Current Assets', 'Cash In Hand', 'GL'
where not exists (select 1 from public.fin_coa_accounts where account_code = '12100');

insert into public.fin_coa_accounts (id, account_code, account_name, account_type, parent_id, is_active, created_at, updated_at, parent_account_id, group_name, class_name, account_level)
select gen_random_uuid(), '12100001', 'Cash In Hand - Office Vault', 'ASSET', null, true, now(), now(),
       (select id from public.fin_coa_accounts where account_code = '12100'), 'Current Assets', 'Cash In Hand', 'SL'
where not exists (select 1 from public.fin_coa_accounts where account_code = '12100001');

insert into public.erp_chart_of_accounts (id, code, name, type, created_at, type_code, type_name, group_code, group_name, class_code, class_name, gl_code, gl_name, sl_code, sl_name)
select gen_random_uuid(), v.code, v.name, 'Assets', now(), '1', 'Assets', '12', 'Current Assets', '121', 'Cash In Hand', '12100', 'Cash In Hand', v.sl, v.name
from (values ('12100', 'Cash In Hand', '12100'), ('12100001', 'Cash In Hand - Office Vault', '12100001')) as v(code, name, sl)
where not exists (select 1 from public.erp_chart_of_accounts e where e.code = v.code);

update public.fin_transaction_account_rules
set debit_gl_code = '12100', debit_sl_code = '12100001',
    description = replace(description, 'via Cash', 'via Cash (Cash In Hand)')
where payment_method = 'CASH' and debit_sl_code = '12000001';

insert into public.fin_coa_accounts (id, account_code, account_name, account_type, parent_id, is_active, created_at, updated_at, parent_account_id, group_name, class_name, account_level)
select gen_random_uuid(), '51005001', 'Rent to Landlord', 'EXPENSE', null, true, now(), now(),
       (select id from public.fin_coa_accounts where account_code = '51005'), 'Expenditure', 'Direct Expenses', 'SL'
where not exists (select 1 from public.fin_coa_accounts where account_code = '51005001');

insert into public.erp_chart_of_accounts (id, code, name, type, created_at, type_code, type_name, group_code, group_name, class_code, class_name, gl_code, gl_name, sl_code, sl_name)
select gen_random_uuid(), '51005001', 'Rent to Landlord', 'Expenditure', now(), '5', 'Expenditure', '51', 'Expenditure', '510', 'Direct Expenses', '51005', 'Rent to Landlord', '51005001', 'Rent to Landlord'
where not exists (select 1 from public.erp_chart_of_accounts where code = '51005001');

-- Kahramaa deposit liability (GL 21501) for direct receipt of Kahramaa deposits.
-- Note: 21501xxx sub-ledgers already exist as inactive legacy RP1 apartment accounts, so no new sub-ledger is added.
insert into public.fin_coa_accounts (id, account_code, account_name, account_type, parent_id, is_active, created_at, updated_at, parent_account_id, group_name, class_name, account_level)
select gen_random_uuid(), '21501', 'Kahramaa Deposits - Leasing Customers', 'LIABILITY', null, true, now(), now(), null, 'Current Liabilities', 'Deposits Received', 'GL'
where not exists (select 1 from public.fin_coa_accounts where account_code = '21501');

insert into public.erp_chart_of_accounts (id, code, name, type, created_at, type_code, type_name, group_code, group_name, class_code, class_name, gl_code, gl_name, sl_code, sl_name)
select gen_random_uuid(), '21501', 'Kahramaa Deposits - Leasing Customers', 'Liabilities', now(), '2', 'Liabilities', '21', 'Current Liabilities', '215', 'Deposits Received', '21501', 'Kahramaa Deposits - Leasing Customers', '21501', 'Kahramaa Deposits - Leasing Customers'
where not exists (select 1 from public.erp_chart_of_accounts e where e.code = '21501');
