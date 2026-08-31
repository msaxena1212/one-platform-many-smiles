// COA audit script — read-only against Supabase anon client
// Verifies Phase 1 state against Finance Master (Parts 13-19)

import { createClient } from '@supabase/supabase-js';

const URL = 'https://rnebpqnzignwjeukgztz.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzU4ODIsImV4cCI6MjA5OTc1MTg4Mn0.maLd6Jgr8uggrfu5uZg9sjRmG0z0r7NlaMB4wIdSRTg';

const sb = createClient(URL, ANON, { auth: { persistSession: false } });

const CRITICAL_GLS = [
  '11000','12000','12100','12410','12411','12412','12413',
  '12500','12700','12900','13000',
  '21000','21100','21200','21400','21500','21600',
  '31000','31100','31500','32000',
  '41100','41101','41201','41301',
  '51001','51002','51003','51004',
  '51101','51102','51103','51104','51105','51106',
];

const EXPECTED_FIXED_SLS = {
  '12000': ['12000001'],
  '12100': ['12100001'],
  '12410': ['12410001'],
  '12411': ['12411001'],
  '12412': ['12412001'],
  '12413': ['12413001'],
  '12500': ['12500001'],
  '12700': ['12700001'],
  '12900': ['12900001','12900002'],
  '13000': ['13000001'],
  '21000': ['21000001'],
  '21100': ['21100001','21100002','21100003','21100004','21100005','21100006'],
  '21200': ['21200001'],
  '21400': [],  // dynamic via fin_resolve_unit_sl
  '21500': [],  // dynamic via fin_resolve_unit_sl
  '21600': ['21600001','21600002','21600003','21600004','21600005','21600006'],
  '31000': [],
  '31100': [],
  '31500': [],
  '32000': [],
  '41100': ['41100001'],
  '41101': ['41101001'],
  '41201': [],
  '41301': [],
};

const EXPECTED_GL_NAMES = {
  '12000': 'Bank',
  '12100': 'Cash',
  '12413': 'Tenant Receivables',
  '12900': 'PDC In Hand',
  '21100': 'Tenant- Refundable Deposit',
  '21200': 'Tenant- Guarantee Cheque',
  '21400': 'PDC Received-Leasing Customers',
  '21500': 'Deposits - Leasing Customers',
};

const EXPECTED_SL_NAMES = {
  '12000001': 'Bank',
  '12100001': 'Cash in Hand',
  '12413001': 'Unit Details',
  '12900001': 'PDC In Hand',
  '12900002': 'Deposit-PDC In Hand',
  '21100001': 'Reservation Advance',
  '21100002': 'Unclaimed Liability-Deposit',
  '21100003': 'Qatar Cool Deposit - Tenant',
  '21100004': 'Kahramaa Deposit - Tenant',
  '21100005': 'Service Fee - Tenant',
  '21100006': 'Refundable Security Deposit - Tenant',
  '21200001': 'Guarantee Cheque Received',
  '41100001': 'Rental Revenue',
  '41101001': 'Property Management Fee',
};

async function main() {
  console.log('=== COA LIVE AUDIT — ' + new Date().toISOString() + ' ===\n');

  // 1. Pull all rows
  const { data: coa, error } = await sb
    .from('fin_coa_accounts')
    .select('id, account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id, parent_id, is_active')
    .order('account_code');

  if (error) {
    console.error('FATAL: ' + error.message);
    return;
  }

  console.log(`Total COA rows: ${coa.length}\n`);

  // 2. Count by level
  const byLevel = coa.reduce((acc, r) => {
    acc[r.account_level] = (acc[r.account_level] || 0) + 1;
    return acc;
  }, {});
  console.log('Rows by level:', byLevel);

  // 3. Critical GLs
  console.log('\n--- CRITICAL GL CHECK ---');
  let missing = 0;
  for (const gl of CRITICAL_GLS) {
    const row = coa.find(r => r.account_code === gl);
    if (!row) {
      console.log(`MISSING GL: ${gl}`);
      missing++;
    } else {
      const expectedName = EXPECTED_GL_NAMES[gl];
      const nameOk = expectedName ? row.account_name === expectedName : true;
      const hasGroup = !!row.group_name;
      const hasClass = !!row.class_name;
      const hasParent = !!row.parent_account_id || !!row.parent_id;
      const flag = (nameOk && hasGroup && hasClass) ? 'OK' : 'GAP';
      if (flag === 'GAP') missing++;
      console.log(`${flag}  GL ${gl}: "${row.account_name}" [${row.account_type}] lvl=${row.account_level} g=${row.group_name} c=${row.class_name} parent=${row.parent_account_id ? 'Y' : (row.parent_id ? 'legacy' : 'N')}`);
      if (expectedName && row.account_name !== expectedName) {
        console.log(`      !! name mismatch: expected "${expectedName}"`);
      }
    }
  }
  console.log(`\nGL gaps: ${missing}`);

  // 4. Fixed SLs under each critical GL
  console.log('\n--- FIXED SL CHECK ---');
  let slGaps = 0;
  for (const [gl, expectedSls] of Object.entries(EXPECTED_FIXED_SLS)) {
    const actualSls = coa
      .filter(r => r.account_level === 'SL' && (r.parent_account_id === coa.find(c => c.account_code === gl)?.id || r.account_code.startsWith(gl)))
      .map(r => r.account_code);
    const actualSlsByParent = coa
      .filter(r => r.account_level === 'SL' && r.parent_account_id === coa.find(c => c.account_code === gl)?.id)
      .map(r => r.account_code);
    if (expectedSls.length === 0) {
      console.log(`GL ${gl}: dynamic only — ${actualSlsByParent.length} fixed SL(s) currently: [${actualSlsByParent.join(',')}]`);
      continue;
    }
    for (const expected of expectedSls) {
      const found = coa.find(r => r.account_code === expected);
      if (!found) {
        console.log(`MISSING SL: ${expected}`);
        slGaps++;
      } else {
        const expectedName = EXPECTED_SL_NAMES[expected];
        const nameOk = expectedName ? found.account_name === expectedName : true;
        const flag = nameOk ? 'OK' : 'NAME-GAP';
        if (flag === 'NAME-GAP') slGaps++;
        console.log(`${flag}  SL ${expected}: "${found.account_name}" parent=${found.parent_account_id ? 'Y' : 'N'}`);
        if (!nameOk) {
          console.log(`      !! name mismatch: expected "${expectedName}"`);
        }
      }
    }
  }
  console.log(`\nSL gaps: ${slGaps}`);

  // 5. Duplicate SL check (the 21100001 problem)
  console.log('\n--- DUPLICATE ACCOUNT_CODE / SL_NAME CHECK ---');
  const byCode = {};
  const byParentAndCode = {};
  for (const r of coa) {
    byCode[r.account_code] = (byCode[r.account_code] || []);
    byCode[r.account_code].push(r);
    if (r.account_level === 'SL' && r.parent_account_id) {
      const k = `${r.parent_account_id}|${r.account_code}`;
      byParentAndCode[k] = (byParentAndCode[k] || []);
      byParentAndCode[k].push(r);
    }
  }
  let dupes = 0;
  for (const [code, rows] of Object.entries(byCode)) {
    if (rows.length > 1) {
      console.log(`DUPLICATE code ${code} (${rows.length} rows):`);
      rows.forEach(r => console.log(`  - id=${r.id} name="${r.account_name}" level=${r.account_level}`));
      dupes++;
    }
  }
  if (dupes === 0) console.log('No duplicate account_codes.');
  else console.log(`\nDuplicate account_code count: ${dupes}`);

  // 6. Rules
  console.log('\n--- TRANSACTION RULES CHECK ---');
  const { data: rules, error: rulesErr } = await sb
    .from('fin_transaction_account_rules')
    .select('*')
    .eq('is_active', true)
    .order('transaction_type');
  if (rulesErr) {
    console.log('FATAL rules: ' + rulesErr.message);
  } else {
    console.log(`Active rules: ${rules.length}`);
    const byTxn = rules.reduce((a, r) => { a[r.transaction_type] = (a[r.transaction_type] || 0) + 1; return a; }, {});
    for (const [k, v] of Object.entries(byTxn)) {
      console.log(`  ${k}: ${v} rule(s)`);
    }
  }

  // 7. fin_unit_sl_accounts
  console.log('\n--- fin_unit_sl_accounts ---');
  const { data: usl, error: uslErr } = await sb
    .from('fin_unit_sl_accounts')
    .select('*');
  if (uslErr) {
    console.log('NOTE: cannot read fin_unit_sl_accounts (RLS): ' + uslErr.message);
  } else {
    console.log(`Rows: ${usl.length}`);
  }

  // 8. Account-level coverage
  console.log('\n--- account_level COVERAGE ---');
  const noLevel = coa.filter(r => !r.account_level);
  console.log(`Rows missing account_level: ${noLevel.length}`);

  // 9. Output JSON for downstream analysis
  const fs = await import('fs');
  fs.writeFileSync('audit-coa-result.json', JSON.stringify({ coa, rules, ts: new Date().toISOString() }, null, 2));
  console.log('\nWrote audit-coa-result.json');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
