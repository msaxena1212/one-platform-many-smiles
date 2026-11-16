const path=require("path");const fs=require("fs");const root=path.resolve(__dirname,"..","..");
const {Client}=require(path.join(root,"node_modules/pg"));const env=fs.readFileSync(path.join(root,".env"),"utf8");
const url=(env.match(/^DATABASE_URL="([^"]+)"/m)||[])[1];
(async()=>{const c=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});await c.connect();
const q=async s=>(await c.query(s)).rows;
const rec=await q(`select v.voucher_number, v.voucher_date::date d, v.description, v.total_amount amt from fin_vouchers v where v.voucher_number like 'VCH-PDC-REC%' or v.voucher_number like 'VCH-PDC-RCV%'`);
const clr=await q(`select v.voucher_number, v.voucher_date::date d, v.description from fin_vouchers v where v.voucher_number like 'VCH-CLR%'`);
const clrSet=new Set(clr.map(r=>r.voucher_number.replace("VCH-CLR-","")));
const parsed=rec.map(r=>{const m=/PDC Collected – (\S+) \((.+) - ([A-Z0-9]+-[A-Za-z0-9]+)\)/.exec(r.description||"");return m?{chq:m[1],tenant:m[2],unit:m[3],amt:Number(r.amt),date:String(r.d).slice(0,10),voucher:r.voucher_number,cleared:clrSet.has(m[1])}:null;}).filter(Boolean);
const inv=await q(`select invoice_no, unit_ref, amount::numeric amt, billing_period, invoice_date::date d from fin_receivable_invoices where status='Pending'`);
const matches=[];const none=[];
for(const p of parsed.filter(x=>x.cleared)){
  const ms=inv.filter(i=>i.unit_ref===p.unit && Number(i.amt)===p.amt && String(p.date).slice(0,7)===String(i.billing_period).slice(0,7).replace(/^(\d{4})-(\d{2})$/,"$1-$2"));
  (ms.length===1?matches:none).push({chq:p.chq,unit:p.unit,amt:p.amt,date:p.date,inv:ms[0]?.invoice_no||null,candidates:ms.length});
}
console.log(JSON.stringify({recVouchers:rec.length,parsed:parsed.length,clearedParsed:parsed.filter(x=>x.cleared).length,clearVouchers:clr.length,exactMatches:matches.length,unmatchedCleared:none.length}));
console.log("MATCH sample:",JSON.stringify(matches.slice(0,6)));
console.log("UNMATCHED sample:",JSON.stringify(none.slice(0,8)));
await c.end();})().catch(e=>{console.error("ERR",e.message);process.exit(1)});
