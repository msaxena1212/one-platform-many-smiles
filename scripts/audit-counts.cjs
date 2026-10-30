require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fetchAll(table, orderCol, cols) {
  let rows = [], from = 0;
  while (true) {
    const r = await s.from(table).select(cols||"id").order(orderCol||"created_at", {ascending:true}).range(from, from+999);
    if (!r.data || r.data.length===0) break;
    rows = rows.concat(r.data);
    if (r.data.length < 1000) break;
    from += 1000;
  }
  return rows;
}

async function main() {
  const [pdcs, finReg] = await Promise.all([
    fetchAll("pdcs","created_at","id,cheque_number,property_code,unit_name,tenant_name,amount,status"),
    fetchAll("fin_pdc_register","cheque_date","id,cheque_number,property_name,unit_name,tenant_name,amount,status"),
  ]);
  
  console.log("=== DB COUNTS ===");
  console.log("pdcs table rows:", pdcs.length);
  console.log("fin_pdc_register rows:", finReg.length);
  
  // Check for duplicates in pdcs by cheque_number
  const chqMap = new Map();
  for (const p of pdcs) {
    const chq = String(p.cheque_number||"").trim();
    if (chq) {
      const list = chqMap.get(chq) || [];
      list.push(p.id);
      chqMap.set(chq, list);
    }
  }
  const dupes = [...chqMap.entries()].filter(([k,v]) => v.length > 1);
  console.log("\nDuplicate cheque_numbers in pdcs:", dupes.length);
  if (dupes.length > 0 && dupes.length <= 10) {
    for (const [chq, ids] of dupes) console.log("  cheque:", chq, "- ids:", ids.join(", "));
  }
  
  // Distinct props/units/customers in pdcs
  const props = new Set(pdcs.map(p=>p.property_code).filter(Boolean));
  const units = new Set(pdcs.map(p=>p.unit_name).filter(Boolean));
  const tenants = new Set(pdcs.map(p=>p.tenant_name).filter(Boolean));
  console.log("\n=== pdcs DISTINCT ===");
  console.log("Properties:", props.size, "| Units:", units.size, "| Customers:", tenants.size);
  
  // Status breakdown
  const statuses = {};
  for (const p of pdcs) { const s2 = p.status||"unknown"; statuses[s2] = (statuses[s2]||0)+1; }
  console.log("Status breakdown:", JSON.stringify(statuses));
  
  // What the PDC UI would show - simulate the merge
  const dbDataMap = new Map();
  const coveredPdcIds = new Set();
  
  // Step 1: fin_pdc_register rows
  for (const f of finReg) {
    const chq = String(f.cheque_number||f.id||"").trim();
    const finUnit = (f.unit_name||"").trim();
    let matchedPdc = null;
    for (const p of pdcs) {
      const pChq = String(p.cheque_number||"").trim();
      if (pChq && pChq === chq) { matchedPdc = p; break; }
    }
    if (matchedPdc?.id) coveredPdcIds.add(String(matchedPdc.id));
    dbDataMap.set("fin-"+f.id, {id: f.id, _src:"fin_pdc_register"});
  }
  // Step 2: uncovered pdcs rows
  for (const p of pdcs) {
    if (coveredPdcIds.has(String(p.id))) continue;
    const rowKey = "pdc-"+p.id;
    if (!dbDataMap.has(rowKey)) dbDataMap.set(rowKey, {id:p.id, _src:"pdcs_table"});
  }
  
  console.log("\n=== SIMULATED PDC UI MERGE ===");
  console.log("Total rows UI would show:", dbDataMap.size);
  const srcCount = {};
  for (const v of dbDataMap.values()) { srcCount[v._src] = (srcCount[v._src]||0)+1; }
  console.log("By source:", JSON.stringify(srcCount));
  console.log("\nExpected if UI shows 1831:", dbDataMap.size === 1831 ? "MATCHES" : "DOES NOT MATCH - actual is "+dbDataMap.size);
}
main().catch(console.error);
