require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  // 1. Count each table
  const [r1,r2,r3,r4,r5] = await Promise.all([
    s.from("pdcs").select("id", {count:"exact",head:true}),
    s.from("fin_pdc_register").select("id", {count:"exact",head:true}),
    s.from("fin_journal_entries").select("id", {count:"exact",head:true}),
    s.from("fin_vouchers").select("id", {count:"exact",head:true}),
    s.from("fin_ledger_entries").select("id", {count:"exact",head:true}),
  ]);
  console.log("=== TABLE COUNTS ===");
  console.log("pdcs:", r1.count, r1.error?.message||"");
  console.log("fin_pdc_register:", r2.count, r2.error?.message||"");
  console.log("fin_journal_entries:", r3.count, r3.error?.message||"");
  console.log("fin_vouchers:", r4.count, r4.error?.message||"");
  console.log("fin_ledger_entries:", r5.count, r5.error?.message||"");

  // 2. PDC uniqueness in fin_pdc_register
  const {data: pdcDistinct} = await s.from("fin_pdc_register")
    .select("property_id, unit_id, tenant_id")
    .limit(1);
  
  const {data: pdcStats} = await s.rpc ? null : null;

  // 3. Count distinct props/units/customers in each source
  const {data: pdcsData} = await s.from("pdcs").select("property_id, unit_id, customer_id").limit(5000);
  const {data: finPdcData} = await s.from("fin_pdc_register").select("property_id, unit_id, tenant_id").limit(5000);
  
  console.log("\n=== pdcs table distinct ===");
  if (pdcsData) {
    const props = new Set(pdcsData.map(r=>r.property_id).filter(Boolean));
    const units = new Set(pdcsData.map(r=>r.unit_id).filter(Boolean));
    const custs = new Set(pdcsData.map(r=>r.customer_id).filter(Boolean));
    console.log("Properties:", props.size, "| Units:", units.size, "| Customers:", custs.size);
  }

  console.log("\n=== fin_pdc_register distinct ===");
  if (finPdcData) {
    const props = new Set(finPdcData.map(r=>r.property_id).filter(Boolean));
    const units = new Set(finPdcData.map(r=>r.unit_id).filter(Boolean));
    const custs = new Set(finPdcData.map(r=>r.tenant_id).filter(Boolean));
    console.log("Properties:", props.size, "| Units:", units.size, "| Customers:", custs.size);
  }
  
  // 4. Get GL journal entries source breakdown
  const {data: glData} = await s.from("fin_journal_entries").select("source_type, property_id, unit_id, customer_id").limit(5000);
  if (glData) {
    console.log("\n=== fin_journal_entries distinct ===");
    const props = new Set(glData.map(r=>r.property_id).filter(Boolean));
    const units = new Set(glData.map(r=>r.unit_id).filter(Boolean));
    const custs = new Set(glData.map(r=>r.customer_id).filter(Boolean));
    const sources = {};
    for (const r of glData) { sources[r.source_type] = (sources[r.source_type]||0)+1; }
    console.log("GL total:", glData.length, "| Props:", props.size, "| Units:", units.size, "| Customers:", custs.size);
    console.log("By source:", JSON.stringify(sources));
  }
}
main().catch(console.error);
