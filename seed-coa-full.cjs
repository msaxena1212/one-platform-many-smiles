/**
 * seed-coa-full.cjs
 * Seeds the complete Chart of Accounts (COA) for all 5 types:
 * 1 = Assets, 2 = Liabilities, 3 = Capital, 4 = Revenue, 5 = Expenditure
 */
const { Client } = require('pg');

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

// ─────────────────────────────────────────────────────────────────────────────
// Full COA Master Data
// Format: [type_code, type_name, group_code, group_name, class_code, class_name,
//          gl_code, gl_name, sl_code, sl_name]
// ─────────────────────────────────────────────────────────────────────────────
const COA_DATA = [
  // ── 1. ASSETS ──────────────────────────────────────────────────────────────
  ["1","Assets","12","Current Assets","120","Cash In Hand","12000","Cash In Hand","12100001","Cash In Hand"],

  ["1","Assets","12","Current Assets","121","Cash At Bank","12100","Cash At Bank","12100001","Main Bank Account"],
  ["1","Assets","12","Current Assets","122","PDC Receivable","12200","Tenant-Post Dated Cheques","12200001","PDC Receivable - Tenant"],

  ["1","Assets","12","Current Assets","123","Accounts Receivables","12300","Tenant Receivables","12300001","Accounts Receivable - Tenant"],
  ["1","Assets","12","Current Assets","123","Accounts Receivables","12300","Tenant Receivables","12300002","Utility Receivable - Tenant"],

  ["1","Assets","12","Current Assets","124","Prepaid Expenses","12400","Prepaid Expenses","12400001","Prepaid Rent"],
  ["1","Assets","12","Current Assets","124","Prepaid Expenses","12400","Prepaid Expenses","12400002","Prepaid Insurance"],
  ["1","Assets","12","Current Assets","124","Prepaid Expenses","12400","Prepaid Expenses","12400003","Prepaid Maintenance"],

  ["1","Assets","13","Non-Current Assets","130","Property, Plant & Equipment","13000","Property & Equipment","13000001","Buildings"],
  ["1","Assets","13","Non-Current Assets","130","Property, Plant & Equipment","13000","Property & Equipment","13000002","Furniture & Fixtures"],
  ["1","Assets","13","Non-Current Assets","130","Property, Plant & Equipment","13000","Property & Equipment","13000003","Office Equipment"],
  ["1","Assets","13","Non-Current Assets","130","Property, Plant & Equipment","13000","Property & Equipment","13000004","Vehicles"],
  ["1","Assets","13","Non-Current Assets","130","Property, Plant & Equipment","13000","Property & Equipment","13000005","Land"],
  ["1","Assets","13","Non-Current Assets","131","Accumulated Depreciation","13100","Accum Depreciation","13100001","Accumulated Depr - Buildings"],
  ["1","Assets","13","Non-Current Assets","131","Accumulated Depreciation","13100","Accum Depreciation","13100002","Accumulated Depr - Furniture"],
  ["1","Assets","13","Non-Current Assets","131","Accumulated Depreciation","13100","Accum Depreciation","13100003","Accumulated Depr - Equipment"],
  ["1","Assets","13","Non-Current Assets","132","Long-Term Investments","13200","Long-Term Investments","13200001","Investment in Subsidiaries"],
  ["1","Assets","13","Non-Current Assets","133","Security Deposits Paid","13300","Security Deposits Paid","13300001","Qatar Cool Deposit Paid"],
  ["1","Assets","13","Non-Current Assets","133","Security Deposits Paid","13300","Security Deposits Paid","13300002","Kahramaa Deposit Paid"],

  // ── 2. LIABILITIES ─────────────────────────────────────────────────────────
  ["2","Liabilities","21","Current Liabilities","210","Accounts Payables","21000","Sundry Creditors","21000001","Account Name"],

  ["2","Liabilities","21","Current Liabilities","211","Security Deposit Received","21100","Tenant- Refundable Deposit","21100001","Reservation Advance"],
  ["2","Liabilities","21","Current Liabilities","211","Security Deposit Received","21100","Tenant- Refundable Deposit","21100002","Unclaimed Liability-Deposit"],
  ["2","Liabilities","21","Current Liabilities","211","Security Deposit Received","21100","Tenant- Refundable Deposit","21100003","Qatar Cool Deposit - Tenant"],
  ["2","Liabilities","21","Current Liabilities","211","Security Deposit Received","21100","Tenant- Refundable Deposit","21100004","Kahramaa Deposit - Tenant"],

  ["2","Liabilities","21","Current Liabilities","212","Unearned Revenue","21200","Advance Rent Received","21200001","Advance Rent - Tenant"],
  ["2","Liabilities","21","Current Liabilities","212","Unearned Revenue","21200","Advance Rent Received","21200002","Booking Advance - Tenant"],

  ["2","Liabilities","21","Current Liabilities","213","Accrued Liabilities","21300","Accrued Expenses","21300001","Accrued Salaries"],
  ["2","Liabilities","21","Current Liabilities","213","Accrued Liabilities","21300","Accrued Expenses","21300002","Accrued Maintenance"],
  ["2","Liabilities","21","Current Liabilities","213","Accrued Liabilities","21300","Accrued Expenses","21300003","VAT Payable"],

  ["2","Liabilities","21","Current Liabilities","214","PDC In Hand","21400","Tenant PDC Cheques In Hand","21400001","PDC In Hand - Tenant"],
  ["2","Liabilities","21","Current Liabilities","214","PDC In Hand","21400","Tenant PDC Cheques In Hand","21400002","PDC In Hand - Municipality"],
  ["2","Liabilities","21","Current Liabilities","214","PDC In Hand","21400","Tenant PDC Cheques In Hand","21400003","PDC In Hand - Utility"],

  ["2","Liabilities","22","Non-Current Liabilities","220","Long-Term Loans","22000","Long-Term Borrowings","22000001","Bank Loan - Long Term"],
  ["2","Liabilities","22","Non-Current Liabilities","221","Mortgage Payable","22100","Mortgage Payable","22100001","Mortgage - Building 1"],

  // ── 3. CAPITAL ─────────────────────────────────────────────────────────────
  ["3","Capital","31","Owner's Equity","310","Share Capital","31000","Paid-Up Capital","31000001","Ordinary Share Capital"],
  ["3","Capital","31","Owner's Equity","310","Share Capital","31000","Paid-Up Capital","31000002","Preference Share Capital"],
  ["3","Capital","31","Owner's Equity","311","Retained Earnings","31100","Retained Earnings","31100001","Retained Earnings - Prior Year"],
  ["3","Capital","31","Owner's Equity","311","Retained Earnings","31100","Retained Earnings","31100002","Current Year Profit/Loss"],
  ["3","Capital","31","Owner's Equity","312","Reserves","31200","General Reserves","31200001","General Reserve Fund"],
  ["3","Capital","31","Owner's Equity","312","Reserves","31200","General Reserves","31200002","Capital Reserve"],
  ["3","Capital","31","Owner's Equity","313","Owner's Drawings","31300","Owner Drawings","31300001","Owner Drawings Account"],

  // ── 4. REVENUE ─────────────────────────────────────────────────────────────
  ["4","Revenue","41","Operating Revenue","410","Rental Income","41000","Residential Rent Income","41000001","Annual Rent - Residential"],
  ["4","Revenue","41","Operating Revenue","410","Rental Income","41000","Residential Rent Income","41000002","Monthly Rent - Residential"],
  ["4","Revenue","41","Operating Revenue","410","Rental Income","41100","Commercial Rent Income","41100001","Annual Rent - Commercial"],
  ["4","Revenue","41","Operating Revenue","410","Rental Income","41100","Commercial Rent Income","41100002","Monthly Rent - Commercial"],
  ["4","Revenue","41","Operating Revenue","411","Service Charges","41100","Service Charge Income","41100101","AC/Cooling Charges"],
  ["4","Revenue","41","Operating Revenue","411","Service Charges","41100","Service Charge Income","41100102","Water Charges"],
  ["4","Revenue","41","Operating Revenue","411","Service Charges","41100","Service Charge Income","41100103","Electricity Charges"],
  ["4","Revenue","41","Operating Revenue","411","Service Charges","41100","Service Charge Income","41100104","Parking Charges"],
  ["4","Revenue","41","Operating Revenue","411","Service Charges","41100","Service Charge Income","41100105","General Service Charges"],
  ["4","Revenue","41","Operating Revenue","412","Deposit Forfeiture Income","41200","Forfeited Deposits","41200001","Security Deposit Forfeited"],
  ["4","Revenue","41","Operating Revenue","413","Late Payment Fees","41300","Penalty Income","41300001","Late Payment Penalty"],
  ["4","Revenue","41","Operating Revenue","413","Late Payment Fees","41300","Penalty Income","41300002","Cheque Bounce Penalty"],
  ["4","Revenue","42","Non-Operating Revenue","420","Interest Income","42000","Interest Income","42000001","Bank Interest Income"],
  ["4","Revenue","42","Non-Operating Revenue","421","Gain on Asset Disposal","42100","Asset Disposal Gain","42100001","Gain on Sale of Property"],
  ["4","Revenue","42","Non-Operating Revenue","422","Other Income","42200","Miscellaneous Income","42200001","Miscellaneous Income"],

  // ── 5. EXPENDITURE ─────────────────────────────────────────────────────────
  ["5","Expenditure","51","Operating Expenses","510","Maintenance & Repairs","51000","Building Maintenance","51000001","General Maintenance"],
  ["5","Expenditure","51","Operating Expenses","510","Maintenance & Repairs","51000","Building Maintenance","51000002","Electrical Maintenance"],
  ["5","Expenditure","51","Operating Expenses","510","Maintenance & Repairs","51000","Building Maintenance","51000003","Plumbing Maintenance"],
  ["5","Expenditure","51","Operating Expenses","510","Maintenance & Repairs","51000","Building Maintenance","51000004","AC Maintenance"],
  ["5","Expenditure","51","Operating Expenses","510","Maintenance & Repairs","51000","Building Maintenance","51000005","Elevator Maintenance"],
  ["5","Expenditure","51","Operating Expenses","511","Utilities","51100","Utility Expenses","51100001","Electricity Expense"],
  ["5","Expenditure","51","Operating Expenses","511","Utilities","51100","Utility Expenses","51100002","Water Expense"],
  ["5","Expenditure","51","Operating Expenses","511","Utilities","51100","Utility Expenses","51100003","District Cooling Expense"],
  ["5","Expenditure","51","Operating Expenses","511","Utilities","51100","Utility Expenses","51100004","Internet & Telecom Expense"],
  ["5","Expenditure","51","Operating Expenses","512","Salary & Staff Costs","51200","Salary Expenses","51200001","Basic Salaries"],
  ["5","Expenditure","51","Operating Expenses","512","Salary & Staff Costs","51200","Salary Expenses","51200002","Allowances"],
  ["5","Expenditure","51","Operating Expenses","512","Salary & Staff Costs","51200","Salary Expenses","51200003","End of Service Benefits"],
  ["5","Expenditure","51","Operating Expenses","513","Administrative Expenses","51300","Admin Expenses","51300001","Office Supplies"],
  ["5","Expenditure","51","Operating Expenses","513","Administrative Expenses","51300","Admin Expenses","51300002","Legal & Professional Fees"],
  ["5","Expenditure","51","Operating Expenses","513","Administrative Expenses","51300","Admin Expenses","51300003","Audit Fees"],
  ["5","Expenditure","51","Operating Expenses","513","Administrative Expenses","51300","Admin Expenses","51300004","Municipality Fees"],
  ["5","Expenditure","51","Operating Expenses","514","Insurance","51400","Insurance Expenses","51400001","Property Insurance"],
  ["5","Expenditure","51","Operating Expenses","514","Insurance","51400","Insurance Expenses","51400002","Staff Insurance"],
  ["5","Expenditure","51","Operating Expenses","515","Marketing & Advertising","51500","Marketing Expenses","51500001","Advertising Expense"],
  ["5","Expenditure","51","Operating Expenses","515","Marketing & Advertising","51500","Marketing Expenses","51500002","Promotional Expense"],
  ["5","Expenditure","52","Non-Operating Expenses","520","Depreciation","52000","Depreciation Expense","52000001","Depr - Buildings"],
  ["5","Expenditure","52","Non-Operating Expenses","520","Depreciation","52000","Depreciation Expense","52000002","Depr - Furniture & Fixtures"],
  ["5","Expenditure","52","Non-Operating Expenses","520","Depreciation","52000","Depreciation Expense","52000003","Depr - Office Equipment"],
  ["5","Expenditure","52","Non-Operating Expenses","521","Finance Costs","52100","Interest & Bank Charges","52100001","Bank Charges"],
  ["5","Expenditure","52","Non-Operating Expenses","521","Finance Costs","52100","Interest & Bank Charges","52100002","Loan Interest Expense"],
  ["5","Expenditure","52","Non-Operating Expenses","522","Loss on Asset Disposal","52200","Asset Disposal Loss","52200001","Loss on Sale of Property"],
  ["5","Expenditure","52","Non-Operating Expenses","523","Bad Debt Expense","52300","Bad Debts","52300001","Bad Debt Written Off"],
  ["5","Expenditure","52","Non-Operating Expenses","524","VAT Expense","52400","VAT & Tax Expense","52400001","VAT Expense"],
];

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to PostgreSQL');

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  try {
    await client.query('BEGIN');

    for (const row of COA_DATA) {
      const [type_code, type_name, group_code, group_name, class_code, class_name,
             gl_code, gl_name, sl_code, sl_name] = row;

      // Use SL code as the unique code for each sub-ledger entry
      const code = sl_code;
      const name = sl_name;

      // Map type_code to type string
      const typeMap = {
        '1': 'Assets',
        '2': 'Liabilities',
        '3': 'Capital',
        '4': 'Revenue',
        '5': 'Expenditure',
      };
      const typeStr = typeMap[type_code] || type_name;

      try {
        const res = await client.query(`
          INSERT INTO public.erp_chart_of_accounts
            (code, name, type, type_code, type_name, group_code, group_name,
             class_code, class_name, gl_code, gl_name, sl_code, sl_name)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
          ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            type = EXCLUDED.type,
            type_code = EXCLUDED.type_code,
            type_name = EXCLUDED.type_name,
            group_code = EXCLUDED.group_code,
            group_name = EXCLUDED.group_name,
            class_code = EXCLUDED.class_code,
            class_name = EXCLUDED.class_name,
            gl_code = EXCLUDED.gl_code,
            gl_name = EXCLUDED.gl_name,
            sl_code = EXCLUDED.sl_code,
            sl_name = EXCLUDED.sl_name
          RETURNING (xmax = 0) AS is_insert
        `, [code, name, typeStr, type_code, type_name, group_code, group_name,
            class_code, class_name, gl_code, gl_name, sl_code, sl_name]);

        if (res.rows[0]?.is_insert) inserted++;
        else updated++;
      } catch (e) {
        console.error(`Error on code ${code}:`, e.message);
        errors++;
      }
    }

    await client.query('COMMIT');
    console.log(`\n✅ Done! Inserted: ${inserted}, Updated: ${updated}, Errors: ${errors}`);
    console.log(`Total COA data rows processed: ${COA_DATA.length}`);

    // Verify distinct types
    const check = await client.query("SELECT type, COUNT(*) FROM public.erp_chart_of_accounts GROUP BY type ORDER BY type");
    console.log('\n📊 COA Breakdown by Type:');
    check.rows.forEach(r => console.log(`  ${r.type}: ${r.count} accounts`));
    const total = await client.query("SELECT COUNT(*) FROM public.erp_chart_of_accounts");
    console.log(`  TOTAL: ${total.rows[0].count} accounts`);

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Transaction rolled back due to error:', e.message);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
