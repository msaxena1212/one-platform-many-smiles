// Posts every receivable invoice in fin_receivable_invoices to the general ledger, so that revenue exists in the
// database and the trial balance, balance sheet and P&L can be built from the database account lines.
//   Per invoice (voucher VCH-INV-<invoice no>):  Dr 12413001 Tenant Receivables – Unit SL / Cr 41100 Rental Revenue
// Run AFTER scripts/finance/2026-11-16-deposit-reclass-and-kahramaa.cjs (that run sets INV-2026-ALA-7011 to 5,080).
// The run stops, and commits nothing, unless the ledger total of the invoices posted equals the invoice total in
// fin_receivable_invoices. Already-posted invoices are skipped, so the script is safe to re-run.
//   node scripts/finance/2026-11-17-post-receivable-invoices-to-ledger.cjs
const path = require("path");
const fs = require("fs");
const root = path.resolve(__dirname, "..", "..");
const { Client } = require(path.join(root, "node_modules/pg"));
const env = fs.readFileSync(path.join(root, ".env"), "utf8");
const url = (env.match(/^DATABASE_URL="([^"]+)"/m) || [])[1];

(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const ar = (await c.query("select id, account_name from fin_coa_accounts where account_code='12413001' and is_active")).rows[0];
  if (!ar) throw new Error("missing account 12413001");
  const rev = (await c.query("select id, account_name from fin_coa_accounts where account_code='41100' and is_active")).rows[0];
  if (!rev) throw new Error("missing account 41100");

  const sd = (await c.query("select amount from fin_receivable_invoices where invoice_no='INV-2026-ALA-7011'")).rows[0];
  if (!sd || Number(sd.amount) !== 5080) throw new Error("INV-2026-ALA-7011 must be 5,080 before posting (run the 16-Nov script first)");

  const invoiceTotal = Number((await c.query("select sum(amount) t from fin_receivable_invoices")).rows[0].t);

  await c.query("begin");
  try {
    const invoices = (await c.query(`
      select id, invoice_no, invoice_date, billing_period, property_name, unit_ref, tenant_name, stream, amount
      from fin_receivable_invoices
      where not exists (select 1 from fin_vouchers v where v.voucher_number = 'VCH-INV-' || fin_receivable_invoices.invoice_no)
      order by invoice_date, invoice_no`)).rows;

    let n = 0, posted = 0;
    for (const inv of invoices) {
      const amt = Number(inv.amount);
      if (!(amt > 0)) continue;
      const num = "VCH-INV-" + inv.invoice_no;
      const desc = `Rental revenue – ${inv.tenant_name || ""} – ${inv.unit_ref || ""} – ${inv.property_name || ""} – ${inv.billing_period || ""} (${inv.invoice_no})`;
      const v = (await c.query(
        "insert into fin_vouchers (voucher_number, voucher_date, voucher_type, reference_no, description, total_amount, status, source_type, source_id, created_at) values ($1,$2,'JV',$3,$4,$5,'posted','RECEIVABLE_INVOICE',$6,now()) returning id",
        [num, inv.invoice_date, inv.invoice_no, desc, amt, String(inv.id)],
      )).rows[0];
      const lines = [
        { a: ar, code: "12413001", dr: amt, cr: 0, d: `Receivable – ${inv.unit_ref || ""} – ${inv.tenant_name || ""}` },
        { a: rev, code: "41100", dr: 0, cr: amt, d: `Rental revenue – ${inv.unit_ref || ""} – ${inv.billing_period || ""}` },
      ];
      for (const l of lines) {
        await c.query(
          "insert into fin_voucher_lines (voucher_id, account_id, account_code, account_name, debit_amount, credit_amount, description, created_at) values ($1,$2,$3,$4,$5,$6,$7,now())",
          [v.id, l.a.id, l.code, l.a.account_name, l.dr, l.cr, l.d],
        );
      }
      n++;
      posted += amt;
    }

    // Sync check: ledger revenue for all invoices must equal the invoice total in the database
    const ledgerRev = Number((await c.query(`
      select coalesce(sum(l.credit_amount - l.debit_amount),0) t
      from fin_voucher_lines l join fin_vouchers v on v.id = l.voucher_id
      where v.source_type = 'RECEIVABLE_INVOICE' and l.account_code = '41100'`)).rows[0].t);
    console.log("Invoices posted this run:", n, "amount:", posted.toFixed(2));
    console.log("Invoice total in database:", invoiceTotal.toFixed(2), "| revenue in ledger:", ledgerRev.toFixed(2));
    if (Math.abs(ledgerRev - invoiceTotal) > 0.005) throw new Error(`ledger revenue ${ledgerRev.toFixed(2)} does not match invoice total ${invoiceTotal.toFixed(2)}`);

    const bad = (await c.query(`select count(*) bad from (select v.id from fin_vouchers v join fin_voucher_lines l on l.voucher_id=v.id where v.source_type='RECEIVABLE_INVOICE' group by v.id having sum(l.debit_amount)<>sum(l.credit_amount)) q`)).rows[0];
    if (Number(bad.bad) !== 0) throw new Error("unbalanced invoice voucher(s): " + bad.bad);

    await c.query("commit");
    console.log("Committed.");
  } catch (e) {
    await c.query("rollback");
    console.log("Rolled back:", e.message);
    process.exitCode = 1;
  }
  await c.end();
})().catch(e => { console.error("Error:", e.message); process.exit(1); });
