/**
 * update-coa-master.cjs
 * Fixes COA data:
 * 1. Changes PDC In Hand (12900xxx) accounts from "Assets" → "Liabilities" type
 * 2. Adds Cash In Hand (12100001) as an Asset
 * 3. Upserts complete Liabilities, Capital, Revenue, Expenditure COA
 */
const { Client } = require('pg');

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

function mkRow(type, type_code, type_name, group_code, group_name, class_code, class_name, gl_code, gl_name, sl_code, sl_name) {
  return [String(sl_code), sl_name, type, String(type_code), type_name, String(group_code), group_name, String(class_code), class_name, String(gl_code), gl_name, String(sl_code), sl_name];
}

// [code, name, type, type_code, type_name, group_code, group_name, class_code, class_name, gl_code, gl_name, sl_code, sl_name]
const COA_RECORDS = [
  // ASSETS
  mkRow('Assets', 1, 'Assets', 12, 'Current Assets', 120, 'Cash In Hand', 12000, 'Cash In Hand', '12100001', 'Cash In Hand'),

  // LIABILITIES
  mkRow('Liabilities', 2, 'Liabilities', 21, 'Current Liabilities', 210, 'Accounts Payables', 21000, 'Sundry Creditors', '21000001', 'Account Name'),
  mkRow('Liabilities', 2, 'Liabilities', 21, 'Current Liabilities', 211, 'Security Deposit Received', 21100, 'Tenant- Refundable Deposit', '21100001', 'Reservation Advance'),
  mkRow('Liabilities', 2, 'Liabilities', 21, 'Current Liabilities', 211, 'Security Deposit Received', 21100, 'Tenant- Refundable Deposit', '21100002', 'Unclaimed Liability-Deposit'),
  mkRow('Liabilities', 2, 'Liabilities', 21, 'Current Liabilities', 211, 'Security Deposit Received', 21100, 'Tenant- Refundable Deposit', '21100003', 'Qatar Cool Deposit - Tenant'),
  mkRow('Liabilities', 2, 'Liabilities', 21, 'Current Liabilities', 211, 'Security Deposit Received', 21100, 'Tenant- Refundable Deposit', '21100004', 'Kahramaa Deposit - Tenant'),
  mkRow('Liabilities', 2, 'Liabilities', 21, 'Current Liabilities', 211, 'Security Deposit Received', 21100, 'Tenant- Refundable Deposit', '21100005', 'Service Fee - Tenant'),
  mkRow('Liabilities', 2, 'Liabilities', 21, 'Current Liabilities', 212, 'Guarantee Received', 21200, 'Tenant- Guarantee Cheque', '21200001', 'Guarantee Cheque Received'),
  mkRow('Liabilities', 2, 'Liabilities', 21, 'Current Liabilities', 214, 'PDC Received', 21400, 'PDC Received-Leasing Customers', '21400001', 'Units-Properties'),
  mkRow('Liabilities', 2, 'Liabilities', 21, 'Current Liabilities', 215, 'Deposits Received', 21500, 'Deposits - Leasing Customers', '21500001', 'Units-Properties'),
  mkRow('Liabilities', 2, 'Liabilities', 21, 'Current Liabilities', 216, 'Accruals', 21600, 'Accruals', '21600001', 'Accrued Expense-General'),
  mkRow('Liabilities', 2, 'Liabilities', 21, 'Current Liabilities', 216, 'Accruals', 21600, 'Accruals', '21600002', 'Accrued Expense-Travel'),
  mkRow('Liabilities', 2, 'Liabilities', 21, 'Current Liabilities', 216, 'Accruals', 21600, 'Accruals', '21600003', 'Accrued Expense-Immigration'),
  mkRow('Liabilities', 2, 'Liabilities', 21, 'Current Liabilities', 216, 'Accruals', 21600, 'Accruals', '21600004', 'Accrued Expense-Insurance'),
  mkRow('Liabilities', 2, 'Liabilities', 21, 'Current Liabilities', 216, 'Accruals', 21600, 'Accruals', '21600005', 'Accrued Expense-Garbage Rent'),
  mkRow('Liabilities', 2, 'Liabilities', 21, 'Current Liabilities', 216, 'Accruals', 21600, 'Accruals', '21600006', 'Accrued Expense-Lift Maintenance'),
  mkRow('Liabilities', 2, 'Liabilities', 22, 'Non Current Liabilities', 220, 'Provisions', 22001, 'Provision for Leave Salary', '22001001', 'Staff Name-LS'),
  mkRow('Liabilities', 2, 'Liabilities', 22, 'Non Current Liabilities', 220, 'Provisions', 22002, 'Provision for End of Service', '22002001', 'Staff Name-EOS'),
  mkRow('Liabilities', 2, 'Liabilities', 22, 'Non Current Liabilities', 220, 'Provisions', 22003, 'Provision for Air Ticket', '22003001', 'Staff Name-Airfare'),
  mkRow('Liabilities', 2, 'Liabilities', 22, 'Non Current Liabilities', 220, 'Provisions', 22004, 'Provision for Contingent Liabilities', '22004001', 'Provision for Doubtful Debts'),
  mkRow('Liabilities', 2, 'Liabilities', 22, 'Non Current Liabilities', 220, 'Provisions', 22005, 'Other Provisions (Liability)', '22005001', 'Salary Payables'),
  mkRow('Liabilities', 2, 'Liabilities', 22, 'Non Current Liabilities', 220, 'Provisions', 22005, 'Other Provisions (Liability)', '22005002', 'Suspense Account'),
  mkRow('Liabilities', 2, 'Liabilities', 22, 'Non Current Liabilities', 220, 'Provisions', 22005, 'Other Provisions (Liability)', '22005003', 'Water & Electricity-Payable'),
  mkRow('Liabilities', 2, 'Liabilities', 22, 'Non Current Liabilities', 220, 'Provisions', 22005, 'Other Provisions (Liability)', '22005004', 'Lift Maintenance-Payable'),
  mkRow('Liabilities', 2, 'Liabilities', 22, 'Non Current Liabilities', 220, 'Provisions', 22005, 'Other Provisions (Liability)', '22005005', 'Operations Exp-Payable'),
  mkRow('Liabilities', 2, 'Liabilities', 22, 'Non Current Liabilities', 220, 'Provisions', 22005, 'Other Provisions (Liability)', '22005006', 'Accrued Expense'),
  mkRow('Liabilities', 2, 'Liabilities', 22, 'Non Current Liabilities', 221, 'Long Term Loans', 22100, 'Long Term from Related Parties', '22100001', 'Longterm Loan-Related Name'),
  mkRow('Liabilities', 2, 'Liabilities', 22, 'Non Current Liabilities', 221, 'Long Term Loans', 22101, 'Long Term Bank Loans', '22101001', 'Bank/Loan Account Number'),

  // CAPITAL
  mkRow('Capital', 3, 'Capital', 31, 'Capital', 310, 'Capital', 31000, 'Capital', '31000001', 'Account Name'),
  mkRow('Capital', 3, 'Capital', 31, 'Capital', 310, 'Capital', 31000, 'Capital', '31000002', 'Account Name'),
  mkRow('Capital', 3, 'Capital', 31, 'Capital', 310, 'Capital', 31100, 'Owners Current Account', '31100001', 'Account Name'),
  mkRow('Capital', 3, 'Capital', 31, 'Capital', 310, 'Capital', 31100, 'Owners Current Account', '31100002', 'Account Name'),
  mkRow('Capital', 3, 'Capital', 31, 'Capital', 315, 'Retained Earnings', 31500, 'Retained Earnings Account', '31500001', 'Retained Earnings'),
  mkRow('Capital', 3, 'Capital', 31, 'Capital', 315, 'Retained Earnings', 31500, 'Retained Earnings Account', '31500002', 'Minority Interest'),
  mkRow('Capital', 3, 'Capital', 32, 'Reserve', 320, 'Reserve', 32000, 'Reserve', '32000001', 'Statutory Reserve'),

  // REVENUE
  mkRow('Revenue', 4, 'Revenue', 41, 'Revenue', 411, 'Direct Income', 41100, 'Rental Revenue', '41100001', 'Rental Revenue'),
  mkRow('Revenue', 4, 'Revenue', 41, 'Revenue', 411, 'Direct Income', 41101, 'Property Management Fee', '41101001', 'M.I-Beverly Hills Garden-1'),
  mkRow('Revenue', 4, 'Revenue', 41, 'Revenue', 412, 'Other Income', 41201, 'Other Income', '41201001', 'Other Income'),
  mkRow('Revenue', 4, 'Revenue', 41, 'Revenue', 412, 'Other Income', 41201, 'Other Income', '41201002', 'Other Income-Penalty'),
  mkRow('Revenue', 4, 'Revenue', 41, 'Revenue', 412, 'Other Income', 41201, 'Other Income', '41201003', 'Other Income-Damages'),
  mkRow('Revenue', 4, 'Revenue', 41, 'Revenue', 412, 'Other Income', 41201, 'Other Income', '41201004', 'Other Income-Scrape Sale'),
  mkRow('Revenue', 4, 'Revenue', 41, 'Revenue', 412, 'Other Income', 41201, 'Other Income', '41201005', 'Insurance Claim Received'),
  mkRow('Revenue', 4, 'Revenue', 41, 'Revenue', 413, 'Non Operating Income', 41301, 'Gain/Loss of Sale of Fixed Assets', '41301001', 'Profit on Sale Of Property'),

  // EXPENDITURE
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51001, 'Labour Outsource', '51001001', 'CMEP-Labor Cost-Facilities Mgt'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51001, 'Labour Outsource', '51001002', 'House Keeping Labor Cost'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51001, 'Labour Outsource', '51001003', 'Security Staff Labor Cost'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51002, 'Annual Maintenance Contract', '51002001', 'CMEP-Facilities Mgt AMC'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51002, 'Annual Maintenance Contract', '51002002', 'Swimming Pool Maintenance'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51002, 'Annual Maintenance Contract', '51002003', 'CCTV AMC Charges'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51002, 'Annual Maintenance Contract', '51002004', 'Landscaping AMC Charges'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51002, 'Annual Maintenance Contract', '51002005', 'Fire Fighting AMC Charges'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51002, 'Annual Maintenance Contract', '51002006', 'Fire Alarm AMC Charges'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51003, 'Utilities & Other Direct Exp', '51003001', 'Electricity & Water-Common Area'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51003, 'Utilities & Other Direct Exp', '51003002', 'Electricity & Water-Vacant Period'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51003, 'Utilities & Other Direct Exp', '51003003', 'Electricity & Water- Inclusive'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51003, 'Utilities & Other Direct Exp', '51003004', 'Telephone & Internet Expenses'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51003, 'Utilities & Other Direct Exp', '51003005', 'Master Community Charges'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51003, 'Utilities & Other Direct Exp', '51003006', 'Common Area Maintenance Cost'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51004, 'Repairs & Maintenance', '51004001', 'Repair and Maintenance Cost'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51004, 'Repairs & Maintenance', '51004002', 'Bathtub, Kitchen Zinc & WC Charges'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51004, 'Repairs & Maintenance', '51004003', 'Sewage & Waste Removal Charges'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51004, 'Repairs & Maintenance', '51004004', 'Sweet Water Charges'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51004, 'Repairs & Maintenance', '51004005', 'Sports&Gym Equipment Maintenance'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51004, 'Repairs & Maintenance', '51004006', 'Cost of CMEP Materials'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51004, 'Repairs & Maintenance', '51004007', 'Cost of House Keeping Materials'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51004, 'Repairs & Maintenance', '51004008', 'Cost of Landscaping Material'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 510, 'Direct Expenses', 51004, 'Repairs & Maintenance', '51004009', 'Check Out Expenses'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51101, 'Staff Cost', '51101001', 'Staff Basic Salary'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51101, 'Staff Cost', '51101002', 'Staff Accommodation Allowance'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51101, 'Staff Cost', '51101003', 'Staff Transportation Allowance'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51101, 'Staff Cost', '51101004', 'Staff Mobile & Telephone Allowance'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51101, 'Staff Cost', '51101005', 'Staff Overtime - Fixed'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51101, 'Staff Cost', '51101006', 'Staff Leave Salary'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51101, 'Staff Cost', '51101007', 'Staff Air Ticket'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51101, 'Staff Cost', '51101008', 'Staff End of Service Benefits'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51101, 'Staff Cost', '51101009', 'Staff Bonus'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51101, 'Staff Cost', '51101010', 'Staff Special Allowance'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51101, 'Staff Cost', '51101011', 'Staff Food Allowance'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51101, 'Staff Cost', '51101012', 'Staff Other Allowance'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51101, 'Staff Cost', '51101013', 'Staff Laundry Cost'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51101, 'Staff Cost', '51101014', 'Staff Medical & Insurance Cost'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51101, 'Staff Cost', '51101015', 'Staff Uniform Cost'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51101, 'Staff Cost', '51101016', 'Staff Visa & Immigration Cost'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51102, 'General and Administrative Expenses', '51102001', 'Vehicles & Other Insurance Expenses'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51102, 'General and Administrative Expenses', '51102002', 'Government & Municipal Charges'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51102, 'General and Administrative Expenses', '51102003', 'Legal Charges'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51102, 'General and Administrative Expenses', '51102004', 'Other General & Administration Expenses'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51102, 'General and Administrative Expenses', '51102005', 'Commission & Brokerage Expenses'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51102, 'General and Administrative Expenses', '51102006', 'Printing & Stationary Expenses'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51102, 'General and Administrative Expenses', '51102007', 'Subscription Fees'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51102, 'General and Administrative Expenses', '51102008', 'Audit Fees'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51102, 'General and Administrative Expenses', '51102009', 'Vehicle Hire Expenses'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51102, 'General and Administrative Expenses', '51102010', 'Vehicle Maintenance Cost'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51102, 'General and Administrative Expenses', '51102011', 'Miscellaneous Expense'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51102, 'General and Administrative Expenses', '51102012', 'Generator Maintenance Expenses'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51102, 'General and Administrative Expenses', '51102013', 'Brokerage Leasing'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51102, 'General and Administrative Expenses', '51102014', 'IT Expenses'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51102, 'General and Administrative Expenses', '51102015', 'Recruitment Charges'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51103, 'Head office expenses', '51103001', 'Head office expenses'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51104, 'Selling and Marketing Expenses', '51104001', 'Sales Promotion Expenses'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51104, 'Selling and Marketing Expenses', '51104002', 'Other Advertisement Expenses'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51105, 'Finance Cost', '51105001', 'Other Bank Charges'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51106, 'Depreciation&Amortization', '51106001', 'Machinery (Light) - Depreciation'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51106, 'Depreciation&Amortization', '51106002', 'Furniture & Fixtures - Depreciation'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51106, 'Depreciation&Amortization', '51106003', 'Office Equipment - Depreciation'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51106, 'Depreciation&Amortization', '51106004', 'Commercial Kitchen Equipment - Depreciation'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51106, 'Depreciation&Amortization', '51106005', 'Appliances - Depreciation'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51106, 'Depreciation&Amortization', '51106006', 'IT Software Amortization'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51106, 'Depreciation&Amortization', '51106007', 'Sports And Gym Equipment - Depreciation'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51106, 'Depreciation&Amortization', '51106008', 'Tools And Equipment - Depreciation'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51106, 'Depreciation&Amortization', '51106009', 'CCTV Systems - Depreciation'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51106, 'Depreciation&Amortization', '51106010', 'Access Control - Depreciation'),
  mkRow('Expenditure', 5, 'Expenditure', 51, 'Expenditure', 511, 'Indirect Expenses', 51106, 'Depreciation&Amortization', '51106011', 'Vehicles - Depreciation'),
];

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to PostgreSQL\n');

  try {
    await client.query('BEGIN');

    // Step 1: Fix PDC In Hand (12900xxx) — reclassify from Assets → Liabilities
    console.log('Step 1: Reclassifying 12900xxx PDC In Hand accounts → Liabilities...');
    const fixPdc12900 = await client.query(`
      UPDATE public.erp_chart_of_accounts
      SET type='Liabilities', type_code='2', type_name='Liabilities',
          group_code='21', group_name='Current Liabilities',
          class_code='214', class_name='PDC Received',
          gl_code='21400', gl_name='PDC Received-Leasing Customers'
      WHERE code LIKE '129%'
      RETURNING code, name
    `);
    console.log(`  ✓ Updated ${fixPdc12900.rowCount} accounts (12900xxx) to Liabilities`);

    // Step 2: Also ensure 21400xxx unit PDC accounts have correct classification
    console.log('Step 2: Confirming 214xxxxx unit PDC accounts are typed Liabilities...');
    const fix214 = await client.query(`
      UPDATE public.erp_chart_of_accounts
      SET type='Liabilities', type_code='2', type_name='Liabilities',
          group_code='21', group_name='Current Liabilities',
          class_code='214', class_name='PDC Received',
          gl_code='21400', gl_name='PDC Received-Leasing Customers'
      WHERE code LIKE '214%' AND type != 'Liabilities'
      RETURNING code
    `);
    console.log(`  ✓ Updated ${fix214.rowCount} stale 214xxxxx accounts`);

    // Step 3: Upsert master COA records
    console.log(`\nStep 3: Upserting ${COA_RECORDS.length} COA records...`);
    let ok = 0, fail = 0;
    for (const r of COA_RECORDS) {
      const [code, name, type, type_code, type_name, group_code, group_name, class_code, class_name, gl_code, gl_name, sl_code, sl_name] = r;
      try {
        await client.query(`
          INSERT INTO public.erp_chart_of_accounts
            (code, name, type, type_code, type_name, group_code, group_name, class_code, class_name, gl_code, gl_name, sl_code, sl_name)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
          ON CONFLICT (code) DO UPDATE SET
            name=EXCLUDED.name, type=EXCLUDED.type, type_code=EXCLUDED.type_code, type_name=EXCLUDED.type_name,
            group_code=EXCLUDED.group_code, group_name=EXCLUDED.group_name,
            class_code=EXCLUDED.class_code, class_name=EXCLUDED.class_name,
            gl_code=EXCLUDED.gl_code, gl_name=EXCLUDED.gl_name,
            sl_code=EXCLUDED.sl_code, sl_name=EXCLUDED.sl_name
        `, [code, name, type, type_code, type_name, group_code, group_name, class_code, class_name, gl_code, gl_name, sl_code, sl_name]);
        ok++;
      } catch (e) {
        console.error(`  ✗ Failed ${code} - ${name}: ${e.message}`);
        fail++;
      }
    }
    console.log(`  ✓ ${ok} records upserted, ${fail} failed`);

    await client.query('COMMIT');

    // Verify
    const verify = await client.query(`SELECT type, COUNT(*) as cnt FROM public.erp_chart_of_accounts GROUP BY type ORDER BY type`);
    console.log('\n=== COA Breakdown After Update ===');
    verify.rows.forEach(r => console.log(`  ${r.type}: ${r.cnt} accounts`));

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Transaction rolled back:', e.message);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
