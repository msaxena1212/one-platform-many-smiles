// 18-Nov-2026, approved by the client.
// A. Billing period is stored in one format, YYYY-MM (e.g. 2026-10). 18 invoices held "October 2026"; they are changed.
// B. The 1,704 active sub-ledgers for other buildings (RP1, RRAS, RRMU; codes 12414xxx and 21401xxx) are deactivated.
//    They are not deleted, so they can be reactivated. They drop out of the journal picker.
// Every check must pass; the run stops, with nothing changed, otherwise.
//   node scripts/finance/2026-11-18-billing-period-and-deactivate-rp1.cjs
const path = require("path");
const fs = require("fs");
const root = path.resolve(__dirname, "..", "..");
const { Client } = require(path.join(root, "node_modules/pg"));
const X = require(path.join(root, "node_modules/xlsx"));
const env = fs.readFileSync(path.join(root, ".env"), "utf8");
const url = (env.match(/^DATABASE_URL="([^"]+)"/m) || [])[1];
const COA = "E:/Port/Property Management System/Documents/New Documents/COA to Simerjith 28092026.xlsx";
const EXPECTED_RP1 = 1704;

const wb = X.readFile(COA);
const clientCodes = new Set();
for (const r of X.utils.sheet_to_json(wb.Sheets["Unit Ac Codes"], { header: 1, defval: "" }).slice(1)) {
  [2, 4, 6].forEach(i => { if (r[i]) clientCodes.add(String(r[i]).trim()); });
}

(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query("begin");
  try {
    // A. billing period
    const oct = await c.query("select id from fin_receivable_invoices where billing_period = 'October 2026'");
    const billing = await c.query(`
      update fin_receivable_invoices
      set billing_period = '2026-10',
          payload = case when payload ? 'billingPeriod' then jsonb_set(payload, '{billingPeriod}', '"2026-10"') else payload end,
          updated_at = now()
      where billing_period = 'October 2026'`);
    if (billing.rowCount !== oct.rowCount) throw new Error("billing period update count mismatch");
    console.log("Billing period changed to 2026-10:", billing.rowCount);

    // B. other-building sub-ledgers
    const rows = (await c.query(`
      select a.account_code, a.is_active, a.account_name,
             (select count(*) from fin_voucher_lines l where l.account_code = a.account_code) postings
      from fin_coa_accounts a
      where a.account_level = 'SL' and a.is_active
        and (a.account_code like '12414%' or a.account_code like '21401%')
        and a.account_name ~* '(RRAS|RRMU|RP1|Apt No)'`)).rows;
    if (rows.length !== EXPECTED_RP1) throw new Error(`found ${rows.length} accounts, expected ${EXPECTED_RP1}`);
    const posted = rows.filter(r => Number(r.postings) > 0);
    if (posted.length) throw new Error(`${posted.length} account(s) have postings, e.g. ${posted[0].account_code}`);
    const inClient = rows.filter(r => clientCodes.has(String(r.account_code)));
    if (inClient.length) throw new Error(`${inClient.length} account(s) are in the client's property list, e.g. ${inClient[0].account_code}`);
    const codes = rows.map(r => r.account_code);
    const off = await c.query("update fin_coa_accounts set is_active = false, updated_at = now() where account_code = any($1::text[]) and is_active", [codes]);
    if (off.rowCount !== EXPECTED_RP1) throw new Error(`deactivated ${off.rowCount}, expected ${EXPECTED_RP1}`);
    console.log("Other-building sub-ledgers deactivated:", off.rowCount);

    await c.query("commit");
    console.log("Committed.");
  } catch (e) {
    await c.query("rollback");
    console.log("Rolled back, nothing changed:", e.message);
    process.exitCode = 1;
  }
  await c.end();
})().catch(e => { console.error("Error:", e.message); process.exit(1); });
