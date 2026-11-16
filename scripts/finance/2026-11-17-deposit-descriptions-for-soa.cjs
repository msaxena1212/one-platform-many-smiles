// 17-Nov-2026: adds the tenant and unit to the descriptions of the deposit PDC, guarantee-cheque and Kahramaa
// deposit vouchers, so the Customer statement of account can show them for the right customer.
//   Format: "<description> (<Tenant> - <UNIT>)"  (the statement reads the last bracket).
// Only descriptions change. Amounts, dates and accounts do not.
//   node scripts/finance/2026-11-17-deposit-descriptions-for-soa.cjs
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
    // 1. Correction journals for deposit PDCs and guarantee cheques (VCH-COR-SD-*)
    const cor = (await c.query(`
      select cv.id, cv.voucher_number, ov.description orig
      from fin_vouchers cv
      join fin_vouchers ov on ov.voucher_number = substr(cv.voucher_number, 12)
      where cv.voucher_number like 'VCH-COR-SD-%' and cv.source_type = 'DEPOSIT_RECLASS'`)).rows;
    let corN = 0;
    for (const r of cor) {
      const m = /Receipt - (.+?) \(([^()]+)\) \| (RV-DEP-\d+) \| (PDC|Guarantee Cheque)/.exec(r.orig || "");
      if (!m) throw new Error("cannot read tenant/unit from " + r.voucher_number);
      const [, tenant, unit, rv, kind] = m;
      const label = kind === "PDC" ? "Deposit PDC" : "Guarantee cheque";
      await c.query("update fin_vouchers set description=$1 where id=$2",
        [`${label} – ${rv} (${tenant.trim()} - ${unit.trim().toUpperCase()})`, r.id]);
      corN++;
    }
    console.log("Correction journals described:", corN);

    // 2. Kahramaa deposit vouchers (VCH-KAH-DEP-*): tenant from the unit's current tenant
    const kah = (await c.query(`
      select v.id, v.voucher_number, v.description, u.current_tenant
      from fin_vouchers v
      left join units u on upper(u.unit_code) = upper(substr(v.voucher_number, 13))
      where v.voucher_number like 'VCH-KAH-DEP-%'`)).rows;
    // Vacant units have no tenant: their deposit is labelled Unassigned until the client says whose it is.
    const unassigned = kah.filter(r => !r.current_tenant).map(r => r.voucher_number);
    console.log("Kahramaa vouchers without a tenant (labelled Unassigned):", unassigned.join(", ") || "none");
    for (const r of kah) {
      const unit = r.voucher_number.slice("VCH-KAH-DEP-".length);
      await c.query("update fin_vouchers set description=$1 where id=$2",
        [`${r.description.replace(/ – [^–]+$/, "")} (${r.current_tenant ? String(r.current_tenant).trim() : "Unassigned"} - ${unit})`, r.id]);
    }
    console.log("Kahramaa vouchers described:", kah.length);
    if (cor.length !== 90 || kah.length !== 233) throw new Error(`expected 90 corrections and 233 Kahramaa vouchers, found ${cor.length} and ${kah.length}`);

    await c.query("commit");
    console.log("Committed.");
  } catch (e) {
    await c.query("rollback");
    console.log("Rolled back:", e.message);
    process.exitCode = 1;
  }
  await c.end();
})().catch(e => { console.error("Error:", e.message); process.exit(1); });
