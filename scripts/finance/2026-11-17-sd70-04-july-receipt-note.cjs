// 17-Nov-2026: SD70-04 receipt VCH-REC-7527 (6,200) is July 2026 rent paid in October. October 2026 stays open.
// Records that on the October invoice. Status and amounts do not change.
//   node scripts/finance/2026-11-17-sd70-04-july-receipt-note.cjs
const path = require("path");
const fs = require("fs");
const root = path.resolve(__dirname, "..", "..");
const { Client } = require(path.join(root, "node_modules/pg"));
const env = fs.readFileSync(path.join(root, ".env"), "utf8");
const url = (env.match(/^DATABASE_URL="([^"]+)"/m) || [])[1];
(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query("begin");
  try {
    const inv = (await c.query("select id, amount, status from fin_receivable_invoices where invoice_no='INV-2026-ALA-7004'")).rows[0];
    if (!inv) throw new Error("invoice not found");
    if (Number(inv.amount) !== 6200 || inv.status !== "Pending") throw new Error(`unexpected state: ${inv.amount} ${inv.status}`);
    const rec = (await c.query("select 1 from fin_vouchers where voucher_number='VCH-REC-7527'")).rows[0];
    if (!rec) throw new Error("receipt VCH-REC-7527 not found");
    await c.query(
      "update fin_receivable_invoices set payload = jsonb_set(coalesce(payload,'{}'::jsonb), '{note}', to_jsonb($1::text)), updated_at=now() where id=$2",
      ["October 2026 open. Receipt VCH-REC-7527 (6,200) is July 2026 rent paid in October; not applied to this invoice.", inv.id],
    );
    await c.query("commit");
    console.log("Note recorded on INV-2026-ALA-7004; status stays Pending.");
  } catch (e) {
    await c.query("rollback");
    console.log("Rolled back:", e.message);
    process.exitCode = 1;
  }
  await c.end();
})().catch(e => { console.error("Error:", e.message); process.exit(1); });
