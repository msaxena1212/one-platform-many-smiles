require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fetchAll(table, orderCol, cols) {
  let rows = [], from = 0;
  while (true) {
    const r = await s.from(table).select(cols).order(orderCol, {ascending:true}).range(from, from+999);
    if (!r.data || r.data.length===0) break;
    rows = rows.concat(r.data);
    if (r.data.length < 1000) break;
    from += 1000;
  }
  return rows;
}

async function main() {
  const pdcs = await fetchAll("pdcs","created_at","id,cheque_number,property_code,unit_name,tenant_name,amount");
  console.log("Total pdcs:", pdcs.length);
  
  // Find duplicate cheque_numbers
  const chqMap = new Map();
  for (const p of pdcs) {
    const chq = String(p.cheque_number||"").trim();
    if (!chq) continue;
    const list = chqMap.get(chq) || [];
    list.push(p);
    chqMap.set(chq, list);
  }
  const dupes = [...chqMap.entries()].filter(([k,v]) => v.length > 1);
  console.log("Duplicate cheque_number groups:", dupes.length);
  
  // Show first 5 examples
  console.log("\nFirst 5 duplicate groups:");
  for (const [chq, rows] of dupes.slice(0, 5)) {
    console.log(" Cheque:", chq);
    for (const r of rows) {
      console.log("   id:", r.id, "| unit:", r.unit_name, "| prop:", r.property_code, "| amount:", r.amount);
    }
  }
  
  // Are dupes the same property+unit or cross-unit?
  let sameUnit = 0, diffUnit = 0;
  for (const [chq, rows] of dupes) {
    const units = new Set(rows.map(r=>r.unit_name));
    if (units.size === 1) sameUnit++;
    else diffUnit++;
  }
  console.log("\nDuplicates within same unit:", sameUnit);
  console.log("Duplicates across different units:", diffUnit);
}
main().catch(console.error);
