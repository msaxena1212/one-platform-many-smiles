// Reverses the 251 correction journals (VCH-COR-CASH-*) posted on 16-Nov-2026.
// Those receipts are PDCs deposited to the banks, so the original bank posting was correct.
//   Reversal (VCH-REV-CASH-*): Dr 12000001 bank / Cr 12100001 Cash In Hand, same amounts and dates.
// The correction journals stay in place for audit; the reversals net them to zero.
// Run once from the project folder:  node scripts/finance/2026-11-17-reverse-cash-reclass-251.cjs
const path = require("path");
const fs = require("fs");
const root = path.resolve(__dirname, "..", "..");
const { Client } = require(path.join(root, "node_modules/pg"));
const env = fs.readFileSync(path.join(root, ".env"), "utf8");
const url = (env.match(/^DATABASE_URL="([^"]+)"/m) || [])[1];

(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const acct = async code => {
    const r = (await c.query("select id, account_name from fin_coa_accounts where account_code=$1 and is_active", [code])).rows[0];
    if (!r) throw new Error("missing account " + code);
    return r;
  };
  const bank = await acct("12000001");
  const cash = await acct("12100001");

  await c.query("begin");
  try {
    const corrections = (await c.query(`
      select v.id, v.voucher_number, v.voucher_date, v.description, l.debit_amount amt,
             l.tenant_id, l.lease_id, l.property_id, l.unit_id, l.customer_id
      from fin_vouchers v join fin_voucher_lines l on l.voucher_id = v.id
      where v.voucher_number like 'VCH-COR-CASH-%' and l.account_code = '12100001' and l.debit_amount > 0
        and not exists (select 1 from fin_vouchers x where x.voucher_number = 'VCH-REV-CASH-' || substr(v.voucher_number, 13))
      order by v.voucher_number`)).rows;

    let n = 0, total = 0;
    for (const s of corrections) {
      const amt = Number(s.amt);
      const num = "VCH-REV-CASH-" + s.voucher_number.slice("VCH-COR-CASH-".length);
      const desc = `Reversal of cash reclass (PDC deposited to bank) – ${s.voucher_number.slice("VCH-COR-CASH-".length)}`;
      const v = (await c.query(
        "insert into fin_vouchers (voucher_number, voucher_date, voucher_type, reference_no, description, total_amount, status, source_type, created_at) values ($1,$2,'JV',$3,$4,$5,'posted','CASH_RECLASS_REVERSAL',now()) returning id",
        [num, s.voucher_date, s.voucher_number, desc, amt],
      )).rows[0];
      const lines = [
        { a: bank, code: "12000001", dr: amt, cr: 0 },
        { a: cash, code: "12100001", dr: 0, cr: amt },
      ];
      for (const l of lines) {
        await c.query(
          "insert into fin_voucher_lines (voucher_id, account_id, account_code, account_name, debit_amount, credit_amount, description, tenant_id, lease_id, property_id, unit_id, customer_id, created_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now())",
          [v.id, l.a.id, l.code, l.a.account_name, l.dr, l.cr, desc, s.tenant_id, s.lease_id, s.property_id, s.unit_id, s.customer_id],
        );
      }
      n++;
      total += amt;
    }
    console.log("Reversals to post:", n, "total:", total.toFixed(2));
    if (n !== 251 || Math.abs(total - 1384125) > 0.01) throw new Error(`expected 251 reversals totalling 1,384,125, found ${n} totalling ${total}`);

    const bad = (await c.query(`select count(*) bad from (select v.id from fin_vouchers v join fin_voucher_lines l on l.voucher_id=v.id where v.source_type='CASH_RECLASS_REVERSAL' group by v.id having sum(l.debit_amount)<>sum(l.credit_amount)) q`)).rows[0];
    if (Number(bad.bad) !== 0) throw new Error("unbalanced reversal");
    await c.query("commit");
    console.log("Committed.");
  } catch (e) {
    await c.query("rollback");
    console.log("Rolled back:", e.message);
    process.exitCode = 1;
  }
  await c.end();
})().catch(e => { console.error("Error:", e.message); process.exit(1); });
