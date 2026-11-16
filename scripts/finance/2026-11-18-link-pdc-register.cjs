// 18-Nov-2026, approved by the client: links each PDC in fin_pdc_register to its property, unit and customer.
//
// The register holds only cheque number, amount and dates, so the unit and customer come from the legacy PDC table
// (pdcs), which holds the unit, tenant and lease for each cheque. A register row is linked when its cheque number,
// amount and date match exactly one legacy row. Where that is not possible:
//   - same cheque number and amount, but a different date: linked only if that is the single candidate;
//   - several candidates: linked only if they all name the same unit and tenant;
//   - anything else, or a legacy row already used by another register row: left unlinked and listed for review.
// Customer comes from the lease on that unit. Units with no lease (staff accommodation) take the customer by name
// from the customer list, if the name matches one customer exactly; otherwise the customer is left blank.
// Nothing is written for a row that is listed for review.
//   node scripts/finance/2026-11-18-link-pdc-register.cjs
const path = require("path");
const fs = require("fs");
const root = path.resolve(__dirname, "..", "..");
const { Client } = require(path.join(root, "node_modules/pg"));
const X = require(path.join(root, "node_modules/xlsx"));
const env = fs.readFileSync(path.join(root, ".env"), "utf8");
const url = (env.match(/^DATABASE_URL="([^"]+)"/m) || [])[1];
const MIGRATION = path.join(root, "supabase/migrations/20261118000000_pdc_register_property_unit_customer.sql");

const norm = s => String(s || "").toLowerCase().replace(/^(ms\.|mr\.|mrs\.|dr\.|m\/s\.?)\s*/, "").replace(/[^a-z0-9]/g, "");
const sameUnitTenant = list => list.every(p => p.unit_name === list[0].unit_name && norm(p.tenant_name) === norm(list[0].tenant_name));

(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query("begin");
  try {
    await c.query(fs.readFileSync(MIGRATION, "utf8"));

    const reg = (await c.query("select id, cheque_number, amount::numeric amt, cheque_date::date d, status from fin_pdc_register order by id")).rows;
    const legacy = (await c.query("select id, cheque_number, amount::numeric amt, maturity_date::date d, unit_name, property_code, tenant_name, lease_id from pdcs")).rows;
    const units = new Map((await c.query("select id, upper(unit_code) code, property_id from units")).rows.map(u => [u.code, u]));
    const leases = new Map((await c.query("select id, customer_id from leases where lease_status = 'ACTIVE'")).rows.map(l => [String(l.id), l]));
    const custByName = new Map();
    for (const cu of (await c.query("select id, display_name, full_name from customers")).rows) {
      for (const nm of [cu.display_name, cu.full_name]) {
        const k = norm(nm);
        if (!k) continue;
        if (!custByName.has(k)) custByName.set(k, new Set());
        custByName.get(k).add(cu.id);
      }
    }
    const legacyByChq = new Map();
    for (const p of legacy) {
      const k = String(p.cheque_number);
      if (!legacyByChq.has(k)) legacyByChq.set(k, []);
      legacyByChq.get(k).push(p);
    }

    const used = new Map();
    const linked = [], review = [];
    for (const r of reg) {
      const cands = (legacyByChq.get(String(r.cheque_number)) || []).filter(p => Math.abs(Number(p.amt) - Number(r.amt)) < 0.005);
      const dateExact = cands.filter(p => String(p.d).slice(0, 10) === String(r.d).slice(0, 10));
      let pick = null, note = "";
      if (dateExact.length === 1) pick = dateExact[0];
      else if (dateExact.length > 1) { if (sameUnitTenant(dateExact)) { pick = dateExact[0]; note = "several legacy rows, same unit and tenant"; } else note = `${dateExact.length} legacy rows with different units or tenants`; }
      else if (cands.length === 1) { pick = cands[0]; note = "date differs from legacy row"; }
      else if (cands.length > 1) { if (sameUnitTenant(cands)) { pick = cands[0]; note = "several legacy rows with other dates, same unit and tenant"; } else note = `${cands.length} legacy rows with different units or tenants`; }
      else note = "no legacy row with this cheque number and amount";

      const base = { register_id: String(r.id), cheque_number: r.cheque_number, amount: Number(r.amt), cheque_date: String(r.d).slice(0, 10), status: r.status };
      if (!pick) { review.push({ ...base, reason: note }); continue; }
      if (used.has(String(pick.id))) { review.push({ ...base, reason: "legacy row already linked to another register row" }); continue; }
      const unit = units.get(String(pick.unit_name || "").toUpperCase());
      if (!unit) { review.push({ ...base, reason: `unit ${pick.unit_name} not in units table` }); continue; }
      let customer = null, lease = null;
      if (pick.lease_id && leases.has(String(pick.lease_id))) { lease = leases.get(String(pick.lease_id)); customer = lease.customer_id; }
      if (!customer) {
        // no lease, or a lease with no customer on record: take the customer by name, if it matches exactly one customer
        const set = custByName.get(norm(pick.tenant_name));
        if (set && set.size === 1) customer = [...set][0];
      }
      used.set(String(pick.id), r.id);
      linked.push({ ...base, legacy: pick, unit, customer, lease, note });
    }

    for (const l of linked) {
      await c.query(
        "update fin_pdc_register set property_ref=$1, unit_ref_id=$2, customer_ref=$3, lease_ref=$4, legacy_pdc_id=$5 where id=$6",
        [l.unit.property_id, l.unit.id, l.customer, l.lease ? l.lease.id : null, l.legacy.id, l.register_id],
      );
    }

    const noCustomer = linked.filter(l => !l.customer).length;
    const book = X.utils.book_new();
    X.utils.book_append_sheet(book, X.utils.json_to_sheet(linked.map(l => ({
      "Register id": l.register_id, "Cheque": l.cheque_number, "Amount": l.amount, "Cheque date": l.cheque_date, "Status": l.status,
      "Unit": l.legacy.unit_name, "Property code": l.legacy.property_code, "Customer (legacy name)": l.legacy.tenant_name,
      "Customer linked": l.customer ? "Yes" : "No", "Link note": l.note,
    }))), "Linked");
    X.utils.book_append_sheet(book, X.utils.json_to_sheet(review), "Review - not linked");
    X.writeFile(book, path.join(root, "scripts/finance/pdc-register-link-review.xlsx"));

    console.log(`Linked ${linked.length} PDC register rows (${noCustomer} without a customer). ${review.length} left for review.`);
    await c.query("commit");
    console.log("Committed.");
  } catch (e) {
    await c.query("rollback");
    console.log("Rolled back, nothing changed:", e.message);
    process.exitCode = 1;
  }
  await c.end();
})().catch(e => { console.error("Error:", e.message); process.exit(1); });
