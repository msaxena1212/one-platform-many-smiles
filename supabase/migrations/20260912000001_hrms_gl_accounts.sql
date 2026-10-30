-- HRMS General Ledger Accounts
-- Safe insert into fin_coa_accounts if not exists

INSERT INTO fin_coa_accounts (account_code, account_name, account_type, account_level, group_name, class_name, is_active)
SELECT '54100', 'Gratuity Expense', 'EXPENSE', 'GL', 'Expenses', 'Direct Expenses', true
WHERE NOT EXISTS (SELECT 1 FROM fin_coa_accounts WHERE account_code = '54100');

INSERT INTO fin_coa_accounts (account_code, account_name, account_type, account_level, group_name, class_name, is_active)
SELECT '54200', 'Leave Encashment Expense', 'EXPENSE', 'GL', 'Expenses', 'Direct Expenses', true
WHERE NOT EXISTS (SELECT 1 FROM fin_coa_accounts WHERE account_code = '54200');

INSERT INTO fin_coa_accounts (account_code, account_name, account_type, account_level, group_name, class_name, is_active)
SELECT '55000', 'Staff Expense Claims', 'EXPENSE', 'GL', 'Expenses', 'Indirect Expenses', true
WHERE NOT EXISTS (SELECT 1 FROM fin_coa_accounts WHERE account_code = '55000');

INSERT INTO fin_coa_accounts (account_code, account_name, account_type, account_level, group_name, class_name, is_active)
SELECT '13100', 'Employee Loans Receivable', 'ASSET', 'GL', 'Assets', 'Current Assets', true
WHERE NOT EXISTS (SELECT 1 FROM fin_coa_accounts WHERE account_code = '13100');
