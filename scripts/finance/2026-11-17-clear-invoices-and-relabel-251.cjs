// 17-Nov-2026, approved by the client.
//
// A. Clears five October 2026 rent invoices against receipts already in the ledger, oldest invoice first:
//      INV-2026-ALA-6142 (BO61-42)  5,100 paid  <- VCH-REC-6735 direct rent, bank transfer
//      INV-2026-ALA-4022 (OS40-22)  5,400 paid  <- VCH-REC-3484 direct rent, bank transfer
//      INV-2026-ALA-7011 (SD70-11)  5,000 of 5,080 <- VCH-REC-3391 direct rent, bank transfer (balance 80 outstanding)
//      INV-2026-ALA-7006 (SD70-06)  6,000 paid  <- VCH-REC-2476 direct rent, 18,000 (12,000 left as advance)
//      INV-2026-ALA-6010 (BO60-10)  4,240 paid  <- VCH-DEP-9fce... PDC cheque 31 deposited, 5,300 (1,060 left as advance)
//    Not cleared here: INV-2026-ALA-7004 (SD70-04), because its 6,200 receipt is described as "for July 26";
//    and the 12 PDCs collected but not yet deposited, because a PDC clears invoices only when it is deposited.
//
// B. The 251 security-deposit receipts paid by PDC and deposited to banks are labelled "| Cash" in their
//    descriptions. They are relabelled "| PDC deposited to bank". Amounts and accounts do not change.
//
// Every step checks the expected starting state and the run stops, with nothing written, if anything differs.
//   node scripts/finance/2026-11-17-clear-invoices-and-relabel-251.cjs
const path = require("path");
const fs = require("fs");
const root = path.resolve(__dirname, "..", "..");
const { Client } = require(path.join(root, "node_modules/pg"));
const env = fs.readFileSync(path.join(root, ".env"), "utf8");
const url = (env.match(/^DATABASE_URL="([^"]+)"/m) || [])[1];

const CLEARINGS = [
  { invoice: "INV-2026-ALA-6142", amount: 5100, paid: 5100, receipt: "VCH-REC-6735", advance: 0 },
  { invoice: "INV-2026-ALA-4022", amount: 5400, paid: 5400, receipt: "VCH-REC-3484", advance: 0 },
  { invoice: "INV-2026-ALA-7011", amount: 5080, paid: 5000, receipt: "VCH-REC-3391", advance: 0 },
  { invoice: "INV-2026-ALA-7006", amount: 6000, paid: 6000, receipt: "VCH-REC-2476", advance: 12000 },
  { invoice: "INV-2026-ALA-6010", amount: 4240, paid: 4240, receipt: "VCH-DEP-9fce4877-75b4-48de-969c-fe41ee834b33", advance: 1060 },
];

(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query("begin");
  try {
    for (const k of CLEARINGS) {
      const inv = (await c.query("select id, amount, status, payload from fin_receivable_invoices where invoice_no=$1", [k.invoice])).rows[0];
      if (!inv) throw new Error("invoice not found " + k.invoice);
      if (Number(inv.amount) !== k.amount) throw new Error(`${k.invoice} amount is ${inv.amount}, expected ${k.amount}`);
      if (inv.status !== "Pending") throw new Error(`${k.invoice} status is ${inv.status}, expected Pending`);
      const rec = (await c.query("select 1 from fin_vouchers where voucher_number=$1", [k.receipt])).rows[0];
      if (!rec) throw new Error("receipt not found " + k.receipt);
      const status = k.paid >= k.amount - 0.005 ? "Paid" : "Partially Paid";
      const payload = { ...inv.payload, amount_paid: k.paid, balance_due: Math.round((k.amount - k.paid) * 100) / 100, cleared_by: k.receipt, advance_unallocated: k.advance };
      await c.query("update fin_receivable_invoices set status=$1, payload=$2, updated_at=now() where id=$3", [status, payload, inv.id]);
      console.log(`${k.invoice}: ${status}, paid ${k.paid} of ${k.amount}, advance ${k.advance}`);
    }

    const rel = await c.query(`
      update fin_vouchers set description = replace(description, '| Cash', '| PDC deposited to bank')
      where voucher_number like 'VCH-SD-RV-DEP-%' and description like '%| Cash'`);
    console.log("Receipts relabelled:", rel.rowCount);
    if (rel.rowCount !== 251) throw new Error("expected 251 receipts relabelled, found " + rel.rowCount);

    await c.query("commit");
    console.log("Committed.");
  } catch (e) {
    await c.query("rollback");
    console.log("Rolled back:", e.message);
    process.exitCode = 1;
  }
  await c.end();
})().catch(e => { console.error("Error:", e.message); process.exit(1); });
