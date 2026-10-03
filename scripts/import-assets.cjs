/**
 * import-assets.cjs
 * Bulk-import assets from an Excel file directly into Supabase.
 * Usage: node scripts/import-assets.cjs <path-to-excel-file>
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const CHUNK_SIZE = 50;

function sanitizeDate(value) {
  if (!value) return null;
  const str = String(value).trim();
  if (!str || str === '[NULL]' || str.toLowerCase() === 'null' || str === '—') return null;
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return value.toISOString().split('T')[0];
  }
  const ymd = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymd) return ymd[1]+'-'+ymd[2].padStart(2,'0')+'-'+ymd[3].padStart(2,'0');
  const dmy = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmy) return dmy[3]+'-'+dmy[2].padStart(2,'0')+'-'+dmy[1].padStart(2,'0');
  const num = Number(str);
  if (!isNaN(num) && num > 20000 && num < 80000) {
    const d = new Date(Date.UTC(1899, 11, 30) + num * 86400000);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }
  try { const p = new Date(str); if (!isNaN(p.getTime())) return p.toISOString().split('T')[0]; } catch {}
  return null;
}

function getVal(row, ...keys) {
  for (const k of keys) {
    if (!k) continue;
    if (k in row && row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') return row[k];
    const ks = k+' *';
    if (ks in row && row[ks] !== undefined && row[ks] !== null && String(row[ks]).trim() !== '') return row[ks];
  }
  const nk = keys.filter(Boolean).map(k => k.toLowerCase().replace(/[\s*_/:().-]+/g,''));
  for (const ak of Object.keys(row)) {
    const na = ak.toLowerCase().replace(/[\s*_/:().-]+/g,'');
    if (nk.includes(na)) { const v=row[ak]; if (v!==undefined&&v!==null&&String(v).trim()!=='') return v; }
  }
  return undefined;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) { console.error('Usage: node scripts/import-assets.cjs <excel-file>'); process.exit(1); }
  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) { console.error('File not found:', absPath); process.exit(1); }

  console.log('\n=== ASSET BULK IMPORT ===\nFile:', absPath);
  const wb = XLSX.readFile(absPath, { cellDates: true, raw: false });
  const sn = wb.SheetNames.find(s => !s.toLowerCase().includes('instruction') && !s.toLowerCase().includes('master')) || wb.SheetNames[0];
  const rawRows = XLSX.utils.sheet_to_json(wb.Sheets[sn], { defval: '' });
  console.log('Sheet:', sn, '| Rows:', rawRows.length);

  const { data: propRows } = await supabase.from('properties').select('id, property_code');
  const propMap = new Map();
  for (const p of (propRows||[])) if (p.property_code) propMap.set(p.property_code.trim().toLowerCase(), p.id);
  console.log('Properties loaded:', propMap.size);

  const { data: ea } = await supabase.from('assets').select('asset_code');
  const existing = new Set((ea||[]).map(a=>a.asset_code?.trim().toUpperCase()));
  console.log('Existing assets:', existing.size);

  const toInsert=[], skipped=[];
  for (let i=0; i<rawRows.length; i++) {
    const row=rawRows[i];
    const code=String(getVal(row,'Asset ID / Code','Asset ID','Asset Code','asset_code','asset_id')??'').trim();
    if (!code||code.toLowerCase()==='asset id'||code.toLowerCase()==='asset id / code') { skipped.push({i:i+2,r:'Empty/header asset code'}); continue; }
    const uc=code.toUpperCase();
    if (existing.has(uc)) { skipped.push({i:i+2,r:'Duplicate: '+code}); continue; }
    const name=String(getVal(row,'Asset Name','asset_name')??'').trim();
    if (!name) { skipped.push({i:i+2,r:'Missing Asset Name for '+code}); continue; }
    const pc=String(getVal(row,'Assigned Property Code','assigned_property_code')??'').trim();
    const pid=pc?propMap.get(pc.toLowerCase()):null;
    const payload={
      asset_code:code, asset_name:name,
      category:String(getVal(row,'Asset Category','category')??'').trim()||null,
      subcategory:String(getVal(row,'Asset Subcategory','subcategory')??'').trim()||null,
      brand:String(getVal(row,'Brand','brand')??'').trim()||null,
      model:String(getVal(row,'Model','model')??'').trim()||null,
      serial_number:String(getVal(row,'Serial / IMEI No.','Serial No.','serial_number')??'').trim()||null,
      ownership_type:String(getVal(row,'Ownership Type','ownership_type')??'').trim()||'Company Owned',
      purchase_date:sanitizeDate(getVal(row,'Purchase Date','purchase_date')),
      supplier:String(getVal(row,'Supplier','supplier')??'').trim()||null,
      purchase_cost:Number(String(getVal(row,'Purchase Cost (QAR)','Purchase Cost','purchase_cost')??'0').replace(/,/g,''))||0,
      warranty_expiry_date:sanitizeDate(getVal(row,'Warranty Expiry Date','warranty_expiry_date')),
      warranty_status:String(getVal(row,'Warranty Status','warranty_status')??'').trim()||null,
      department:String(getVal(row,'Department','department')??'').trim()||null,
      assigned_property_id:pid||null, assigned_property_code:pc||null,
      assigned_unit_code:String(getVal(row,'Assigned Unit Code','assigned_unit_code')??'').trim()||null,
      assigned_employee_name:String(getVal(row,'Assigned Employee Name','assigned_employee_name')??'').trim()||null,
      assignment_date:sanitizeDate(getVal(row,'Assignment Date','assignment_date')),
      asset_condition:String(getVal(row,'Asset Condition','asset_condition')??'').trim()||'Good',
      asset_status:String(getVal(row,'Asset Status','asset_status')??'').trim()||'Available',
      life_of_asset:Number(String(getVal(row,'Life Of Asset','life_of_asset')??'').replace(/,/g,''))||null,
      depreciation_method:String(getVal(row,'Depreciation Method','depreciation_method')??'').trim()||null,
      depreciation_rate:Number(String(getVal(row,'Depreciation Rate (%)','depreciation_rate')??'').replace(/,/g,''))||null,
      opening_cost:Number(String(getVal(row,'Opening Cost','opening_cost')??'').replace(/,/g,''))||null,
      last_service_date:sanitizeDate(getVal(row,'Last Service Date','last_service_date')),
      addition_during_year:Number(String(getVal(row,'Addition during the year','addition_during_year')??'').replace(/,/g,''))||null,
      total_asset_value:Number(String(getVal(row,'Total Asset Value','total_asset_value')??'').replace(/,/g,''))||null,
      disposal_value:Number(String(getVal(row,'Disposal Value','disposal_value')??'').replace(/,/g,''))||null,
      opening_accumulated_depreciation:Number(String(getVal(row,'Opening Accumulated Depreciation','opening_accumulated_depreciation')??'').replace(/,/g,''))||null,
      current_year_depreciation:Number(String(getVal(row,'Current Year Depreciation','current_year_depreciation')??'').replace(/,/g,''))||null,
      closing_accumulated_depreciation:Number(String(getVal(row,'Closing Accumulated Depreciation','closing_accumulated_depreciation')??'').replace(/,/g,''))||null,
      net_book_value:Number(String(getVal(row,'Net Book Value','net_book_value')??'').replace(/,/g,''))||null,
      next_service_date:sanitizeDate(getVal(row,'Next Service Date','next_service_date')),
      return_date:sanitizeDate(getVal(row,'Return Date','return_date')),
      disposal_date:sanitizeDate(getVal(row,'Disposal Date','disposal_date')),
      remarks:String(getVal(row,'Remarks','remarks')??'').trim()||null,
    };
    for (const k of Object.keys(payload)) if (typeof payload[k]==='number'&&isNaN(payload[k])) payload[k]=null;
    toInsert.push(payload);
    existing.add(uc);
  }

  console.log('\nReady to insert:', toInsert.length, '| Skipped:', skipped.length);
  if (skipped.length>0) { for(const s of skipped.slice(0,15)) console.log('  Row',s.i,':',s.r); if(skipped.length>15) console.log('  ...and',skipped.length-15,'more'); }
  if (toInsert.length===0) { console.log('\nNothing to insert.'); process.exit(0); }

  console.log('\nInserting in chunks of', CHUNK_SIZE, '...');
  let ins=0, fail=0;
  for (let i=0; i<toInsert.length; i+=CHUNK_SIZE) {
    const chunk=toInsert.slice(i,i+CHUNK_SIZE);
    const {error}=await supabase.from('assets').insert(chunk);
    if (error) {
      console.error('Chunk error:', error.message, '- retrying row by row...');
      for (const r of chunk) {
        const {error:re}=await supabase.from('assets').insert(r);
        if (re) { console.error('  FAIL',r.asset_code,':', re.message); fail++; }
        else ins++;
      }
    } else {
      ins+=chunk.length;
      process.stdout.write('\r  Inserted: '+ins+'/'+toInsert.length+'   ');
    }
  }
  console.log('\n\nDone! Inserted:', ins, '| Failed:', fail, '| Skipped:', skipped.length);
  const {count}=await supabase.from('assets').select('id',{count:'exact',head:true});
  console.log('Total assets in DB:', count);
}

main().catch(e=>{console.error(e);process.exit(1);});
