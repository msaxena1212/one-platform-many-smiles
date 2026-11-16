// 18-Nov-2026: a cleared PDC clears the invoice it pays, when the match is exact.
// A PDC clearing voucher (VCH-CLR-*) names the unit and the amount. Where exactly one Pending invoice for that unit,
// with the same amount, is billed for 2026-10, that invoice is marked Paid.
// Cheque numbers are not unique, so matching uses the clearing voucher's unit and amount, not the cheque number.
// Anything that does not match exactly, or matches more than one invoice, is left Pending and listed in the review file.
//   node scripts/finance/2026-11-18-clear-invoices-from-cleared-pdcs.cjs
const path = require("path");
const fs = require("fs");
const root = path.resolve(__dirname, "..", "..");
const { Client } = require(path.join(root, "node_modules/pg"));
const X = require(path.join(root, "node_modules/xlsx"));
const env = fs.readFileSync(path.join(root, ".env"), "utf8");
const url = (env.match(/^DATABASE_URL="([^"]+)"/m) || [])[1];
const BILLING = "2026-10";

const UNIT = "([A-Z0-9]+-[A-Za-z0-9]+)";
function parseClearing(desc) {
  let m = new RegExp(`^PDC Cleared\\s+[–-]\\s+.+?\\s+\\((.+?) - ${UNIT}\\)\\s*$`).exec(desc);
  if (m) return { tenant: m[1].trim(), unit: m[2].toUpperCase() };
  m = new RegExp(`^PDC Cleared\\s+—\\s+(.+?)\\s+\\(${UNIT}\\)`).exec(desc);
  if (m) return { tenant: m[1].trim(), unit: m[2].toUpperCase() };
  return null;
}

(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query("begin");
  try {
    const clearings = (await c.query("select voucher_number, description, total_amount from fin_vouchers where voucher_number like 'VCH-CLR-%'")).rows;
    const pending = (await c.query("select id, invoice_no, unit_ref, tenant_name, amount from fin_receivable_invoices where status = 'Pending' and billing_period = $1", [BILLING])).rows;

    const applied = [], review = [];
    const used = new Set();
    for (const v of clearings) {
      const p = parseClearing(v.description || "");
      const amt = Number(v.total_amount);
      if (!p) { review.push({ voucher: v.voucher_number, description: v.description, reason: "cannot read unit" }); continue; }
      const candidates = pending.filter(i => i.unit_ref.toUpperCase() === p.unit && Math.abs(Number(i.amount) - amt) < 0.005 && !used.has(i.invoice_no));
      if (candidates.length !== 1) {
        review.push({ voucher: v.voucher_number, description: v.description, reason: candidates.length ? `${candidates.length} matching invoices` : "no pending October invoice with this unit and amount" });
        continue;
      }
      const inv = candidates[0];
      used.add(inv.invoice_no);
      const payload = { amount_paid: amt, balance_due: 0, cleared_by: v.voucher_number };
      await c.query(
        "update fin_receivable_invoices set status = 'Paid', payload = coalesce(payload, '{}'::jsonb) || $1::jsonb, updated_at = now() where id = $2",
        [JSON.stringify(payload), inv.id],
      );
      applied.push({ invoice: inv.invoice_no, unit: p.unit, amount: amt, cleared_by: v.voucher_number });
    }

    const out = X.utils.book_new();
    X.utils.book_append_sheet(out, X.utils.json_to_sheet(applied), "Invoices cleared");
    X.utils.book_append_sheet(out, X.utils.json_to_sheet(review), "Review - not matched");
    X.writeFile(out, path.join(root, "scripts/finance/pdc-invoice-clearing-review.xlsx"));

    console.log(`Cleared ${applied.length} invoices (${applied.reduce((s, r) => s + r.amount, 0).toFixed(2)}). ${review.length} clearing vouchers need review.`);
    await c.query("commit");
    console.log("Committed.");
  } catch (e) {
    await c.query("rollback");
    console.log("Rolled back, nothing changed:", e.message);
    process.exitCode = 1;
  }
  await c.end();
})().catch(e => { console.error("Error:", e.message); process.exit(1); });
