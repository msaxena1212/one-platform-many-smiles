// 18-Nov-2026, approved by the client: deletes the unit sub-ledgers listed on the "Inactive - to delete" sheet of
// unit-sub-ledgers-review.xlsx. These units do not belong to the client.
//
// Before anything is deleted, every listed code must exist, be inactive, and have no postings in the ledger.
// The run stops, with nothing deleted, if any check fails. Deletion removes the account from the chart of accounts
// (fin_coa_accounts), its display row (erp_chart_of_accounts) and its legacy row (coa_sl).
//   node scripts/finance/2026-11-18-delete-foreign-unit-accounts.cjs
const path = require("path");
const fs = require("fs");
const root = path.resolve(__dirname, "..", "..");
const { Client } = require(path.join(root, "node_modules/pg"));
const X = require(path.join(root, "node_modules/xlsx"));
const env = fs.readFileSync(path.join(root, ".env"), "utf8");
const url = (env.match(/^DATABASE_URL="([^"]+)"/m) || [])[1];
const SHEET_FILE = "C:/Users/mindz/Downloads/unit-sub-ledgers-review.xlsx";
const EXPECTED = 2757;

const wb = X.readFile(SHEET_FILE);
const codes = [...new Set(X.utils.sheet_to_json(wb.Sheets["Inactive - to delete"], { defval: "" }).map(r => String(r["Account code"]).trim()).filter(Boolean))];

(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query("begin");
  try {
    if (codes.length !== EXPECTED) throw new Error(`sheet lists ${codes.length} codes, expected ${EXPECTED}`);
    const found = (await c.query(
      `select account_code, is_active, (select count(*) from fin_voucher_lines l where l.account_code = a.account_code) postings
       from fin_coa_accounts a where account_code = any($1::text[])`, [codes])).rows;
    if (found.length !== codes.length) throw new Error(`${codes.length - found.length} listed code(s) are not in the chart`);
    const active = found.filter(r => r.is_active);
    if (active.length) throw new Error(`${active.length} listed account(s) are active, e.g. ${active[0].account_code}`);
    const posted = found.filter(r => Number(r.postings) > 0);
    if (posted.length) throw new Error(`${posted.length} listed account(s) have postings, e.g. ${posted[0].account_code}`);
    const children = (await c.query(
      `select count(*) n from fin_coa_accounts child join fin_coa_accounts p on p.id = child.parent_account_id where p.account_code = any($1::text[])`, [codes])).rows[0];
    if (Number(children.n) > 0) throw new Error(`${children.n} child account(s) sit under the listed accounts`);

    const erp = await c.query("delete from erp_chart_of_accounts where code = any($1::text[])", [codes]);
    const legacy = await c.query("delete from coa_sl where code = any($1::text[])", [codes]);
    const del = await c.query("delete from fin_coa_accounts where account_code = any($1::text[]) and is_active = false", [codes]);
    if (del.rowCount !== codes.length) throw new Error(`deleted ${del.rowCount}, expected ${codes.length}`);

    await c.query("commit");
    console.log(`Deleted ${del.rowCount} unit sub-ledgers from the chart; erp rows removed: ${erp.rowCount}; legacy rows removed: ${legacy.rowCount}.`);
  } catch (e) {
    await c.query("rollback");
    console.log("Rolled back, nothing deleted:", e.message);
    process.exitCode = 1;
  }
  await c.end();
})().catch(e => { console.error("Error:", e.message); process.exit(1); });
