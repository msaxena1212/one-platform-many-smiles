// 18-Nov-2026: every revenue line of a receivable invoice is linked to its property, unit, lease and customer,
// so the property P&L reports revenue against the property, not "Corporate Office / Head Office".
// Unit comes from the invoice's unit code; property from the unit; lease and customer from the unit's active lease.
// The run stops, with nothing written, if any invoice's unit is not in the units table.
//   node scripts/finance/2026-11-18-link-revenue-lines-to-property-unit-customer.cjs
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
    const invoices = (await c.query(`
      select v.id as voucher_id, i.invoice_no, i.unit_ref,
             u.id as unit_id, u.property_id,
             l.id as lease_id, l.customer_id
      from fin_vouchers v
      join fin_receivable_invoices i on v.voucher_number = 'VCH-INV-' || i.invoice_no
      left join units u on upper(u.unit_code) = upper(i.unit_ref)
      left join lateral (
        select le.id, le.customer_id from leases le
        where le.unit_id = u.id and le.lease_status = 'ACTIVE'
        order by le.commencement_date desc nulls last limit 1) l on true
      where v.source_type = 'RECEIVABLE_INVOICE'`)).rows;

    const unresolved = invoices.filter(r => !r.unit_id || !r.property_id);
    if (unresolved.length) throw new Error(`${unresolved.length} invoice(s) have no unit or property, e.g. ${unresolved[0].invoice_no} (${unresolved[0].unit_ref})`);
    const withLease = invoices.filter(r => r.lease_id).length;

    let lines = 0;
    for (const r of invoices) {
      const res = await c.query(
        `update fin_voucher_lines set property_id = $1, unit_id = $2, lease_id = $3, customer_id = $4
         where voucher_id = $5`,
        [r.property_id, r.unit_id, r.lease_id, r.customer_id, r.voucher_id],
      );
      lines += res.rowCount;
    }
    console.log(`Invoices linked: ${invoices.length} (with an active lease: ${withLease}). Lines updated: ${lines}.`);
    if (lines !== invoices.length * 2) throw new Error(`expected ${invoices.length * 2} lines, updated ${lines}`);

    await c.query("commit");
    console.log("Committed.");
  } catch (e) {
    await c.query("rollback");
    console.log("Rolled back, nothing changed:", e.message);
    process.exitCode = 1;
  }
  await c.end();
})().catch(e => { console.error("Error:", e.message); process.exit(1); });
