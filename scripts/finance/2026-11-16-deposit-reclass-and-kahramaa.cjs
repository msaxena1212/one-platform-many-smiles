// One-time finance correction, approved 16-Nov-2026. Run once, from the project folder:
//   node scripts/finance/2026-11-16-deposit-reclass-and-kahramaa.cjs
//
// 1. INV-2026-ALA-7011 (SD70-11, Oct 2026) -> 5,080 (4,080 for 1–24 Oct + 1,000 for 25–31 Oct renewal).
// 2. Security deposit PDCs (43) and guarantee cheques (47) that were debited to the bank:
//      PDC:        Dr 12900002 Deposit PDC In Hand      / Cr 12000001 bank      (correction voucher VCH-COR-SD-*)
//      Guarantee:  Dr 12900002 Deposit PDC In Hand      / Cr 12000001 bank
//                  Dr 21500    Security deposit liab.   / Cr 21200001 Guarantee cheque received
// 3. Kahramaa utility deposits (from kahramaa-deposits-data.ts), posted as database vouchers VCH-KAH-DEP-<UNIT>:
//      Cash (382,000):       Dr 12100001 Cash In Hand  / Cr 21501 Kahramaa deposit liability (control)
//      PDC (82,000):         Dr 12900002 Deposit PDC   / Cr 21501
//      Guarantee (2,000):    Dr 12900002 Deposit PDC   / Cr 21200001 Guarantee cheque received
//    Non-cash entries keep the date 2036-12-31 from the data file.
//
// Everything runs in one transaction: any failure or unbalanced voucher rolls the whole run back.
// Already-posted items are skipped, so the script is safe to re-run.
const path = require("path");
const fs = require("fs");
const root = path.resolve(__dirname, "..", "..");
const { Client } = require(path.join(root, "node_modules/pg"));

const env = fs.readFileSync(path.join(root, ".env"), "utf8");
const url = (env.match(/^DATABASE_URL="([^"]+)"/m) || [])[1];
const t = fs.readFileSync(path.join(root, "src/lib/finance/kahramaa-deposits-data.ts"), "utf8").replace(/\r/g, "");

function arr(name) {
  const i = t.indexOf("export const " + name);
  const s = t.indexOf("= [", i) + 2;
  let d = 0, j = s;
  for (; j < t.length; j++) {
    if (t[j] === "[") d++;
    else if (t[j] === "]") { d--; if (d === 0) break; }
  }
  return JSON.parse(t.slice(s, j + 1));
}

const kah = arr("KAHRAMAA_DEPOSIT_ENTRIES").filter(e => e.unitCode && Number(e.amount) > 0);
const GCHQ_DATE = "2036-12-31";

(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const acct = async code => {
    const r = (await c.query("select id, account_name from fin_coa_accounts where account_code=$1 and is_active", [code])).rows[0];
    if (!r) throw new Error("missing account " + code);
    return r;
  };
  const A = {
    cash: await acct("12100001"), pdc: await acct("12900002"), bank: await acct("12000001"),
    sd: await acct("21500"), kah: await acct("21501"), gchq: await acct("21200001"),
  };

  await c.query("begin");
  try {
    // 1. SD70-11 invoice
    const inv = await c.query(
      "update fin_receivable_invoices set amount=5080, payload = jsonb_set(payload,'{amount}','5080'), updated_at=now() where invoice_no='INV-2026-ALA-7011' returning amount",
    );
    if (inv.rowCount !== 1) throw new Error("invoice rows " + inv.rowCount);

    // 2. Security deposit PDCs and guarantee cheques that were debited to the bank
    const sd = (await c.query(`
      select v.voucher_number, v.voucher_date, v.description,
             case when v.description like '%| PDC%' then 'PDC' when v.description like '%Guarantee%' then 'GUAR' else 'OTHER' end kind,
             l.debit_amount amt, l.tenant_id, l.lease_id, l.property_id, l.unit_id, l.customer_id
      from fin_vouchers v join fin_voucher_lines l on l.voucher_id = v.id
      where l.account_code='12000001' and l.debit_amount > 0 and v.voucher_number like 'VCH-SD-RV-DEP-%'
        and (v.description like '%| PDC%' or v.description like '%Guarantee%')
        and not exists (select 1 from fin_vouchers x where x.voucher_number = 'VCH-COR-SD-' || v.voucher_number)
      order by v.voucher_number`)).rows;

    const counts = { PDC: [0, 0], GUAR: [0, 0] };
    const post = async (num, date, desc, lines, dims) => {
      const v = (await c.query(
        "insert into fin_vouchers (voucher_number, voucher_date, voucher_type, reference_no, description, total_amount, status, source_type, created_at) values ($1,$2,'JV',$3,$4,$5,'posted','DEPOSIT_RECLASS',now()) returning id",
        [num, date, dims.ref, desc, dims.total],
      )).rows[0];
      for (const l of lines) {
        await c.query(
          "insert into fin_voucher_lines (voucher_id, account_id, account_code, account_name, debit_amount, credit_amount, description, tenant_id, lease_id, property_id, unit_id, customer_id, created_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now())",
          [v.id, l.a.id, l.code, l.a.account_name, l.dr, l.cr, l.desc, dims.tenant_id, dims.lease_id, dims.property_id, dims.unit_id, dims.customer_id],
        );
      }
    };

    for (const s of sd) {
      const amt = Number(s.amt);
      const dims = { tenant_id: s.tenant_id, lease_id: s.lease_id, property_id: s.property_id, unit_id: s.unit_id, customer_id: s.customer_id, ref: s.voucher_number, total: amt };
      const lines = [
        { a: A.pdc, code: "12900002", dr: amt, cr: 0, desc: "Deposit PDC In Hand (reclass from bank)" },
        { a: A.bank, code: "12000001", dr: 0, cr: amt, desc: "Reclass out of bank" },
      ];
      if (s.kind === "GUAR") {
        lines.push(
          { a: A.sd, code: "21500", dr: amt, cr: 0, desc: "Reclass out of security deposit liability (guarantee cheque)" },
          { a: A.gchq, code: "21200001", dr: 0, cr: amt, desc: "Guarantee cheque received (reclass from security deposit)" },
        );
      }
      const label = s.kind === "PDC" ? "deposit PDC" : "guarantee cheque";
      await post("VCH-COR-SD-" + s.voucher_number, s.voucher_date, `Correction: ${label} posted to bank – ${s.voucher_number}`, lines, dims);
      counts[s.kind][0]++;
      counts[s.kind][1] += amt;
    }
    console.log("Security deposit corrections:", JSON.stringify(counts));

    // 3. Kahramaa deposits
    const existing = new Set((await c.query("select voucher_number from fin_vouchers where voucher_number like 'VCH-KAH-DEP-%'")).rows.map(r => r.voucher_number));
    let kn = 0, kt = 0;
    for (const e of kah) {
      const u = e.unitCode.toUpperCase().trim();
      const num = "VCH-KAH-DEP-" + u;
      if (existing.has(num)) continue;
      const amt = Number(e.amount);
      const isCash = e.mode === "Cash";
      const isGuar = e.rawMode === "Guarantee Cheque";
      const date = isCash ? e.date : GCHQ_DATE;
      const dr = isCash ? A.cash : A.pdc;
      const drCode = isCash ? "12100001" : "12900002";
      const cr = isGuar ? A.gchq : A.kah;
      const crCode = isGuar ? "21200001" : "21501";
      const label = isCash ? "Kahramaa utility deposit (cash)" : isGuar ? "Guarantee cheque – Kahramaa utility deposit" : "Kahramaa utility deposit (PDC)";
      const desc = `${label} – ${u} (${e.property || ""})`;
      await post(num, date, desc, [
        { a: dr, code: drCode, dr: amt, cr: 0, desc },
        { a: cr, code: crCode, dr: 0, cr: amt, desc },
      ], { ref: num, total: amt, tenant_id: null, lease_id: null, property_id: null, unit_id: null, customer_id: null });
      kn++;
      kt += amt;
    }
    console.log("Kahramaa vouchers posted:", kn, "total:", kt);

    // Every voucher written by this run must balance
    const bad = (await c.query(`
      select count(*) bad from (
        select v.id from fin_vouchers v join fin_voucher_lines l on l.voucher_id = v.id
        where v.source_type = 'DEPOSIT_RECLASS' or v.voucher_number like 'VCH-KAH-DEP-%'
        group by v.id having sum(l.debit_amount) <> sum(l.credit_amount)) q`)).rows[0];
    if (Number(bad.bad) !== 0) throw new Error("unbalanced voucher(s): " + bad.bad);

    await c.query("commit");
    console.log("Committed.");
  } catch (e) {
    await c.query("rollback");
    console.log("Rolled back:", e.message);
    process.exitCode = 1;
  }
  await c.end();
})().catch(e => { console.error("Error:", e.message); process.exit(1); });
