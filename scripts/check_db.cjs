const { Client } = require('pg');

async function main() {
  const c = new Client({ connectionString: 'postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });
  await c.connect();
  const tables = ['erp_chart_of_accounts', 'erp_journal_entries', 'erp_vouchers', 'fin_legal_receivables', 'fin_payroll_syncs', 'fin_contracts', 'fin_banks', 'fin_bank_accounts', 'fin_bank_reconciliations'];
  for (const t of tables) {
    const res = await c.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position', [t]);
    console.log(`=== ${t} ===\n` + res.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
  }
  await c.end();
}

main().catch(console.error);
