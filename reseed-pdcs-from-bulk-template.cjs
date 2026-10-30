// Reseed public.pdcs from Bulk_PDC_CREATE_Template (3).xlsx
// Usage:
//   node reseed-pdcs-from-bulk-template.cjs            -> dry run (parse + validate only)
//   $env:DATABASE_URL="postgresql://..." ; node reseed-pdcs-from-bulk-template.cjs --apply
const XLSX = require('xlsx');
const path = require('path');

const FILE = path.resolve('Documents/New Documents/Bulk_PDC_CREATE_Template (3).xlsx');
const APPLY = process.argv.includes('--apply');

function toISO(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'string' && v.trim() === '07-10-.206') v = '07-10-2026'; // typo in SL.No 738 (OS40-24, cheque 1000114); rent period is Oct-2026
  if (typeof v === 'number') {
    const d = XLSX.SSF.parse_date_code(v);
    return d ? `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}` : null;
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{2})[-./](\d{2})[-./](\d{4})$/); // DD-MM-YYYY / DD.MM.YYYY
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/); // YYYY-MM-DD
  return m ? s : null;
}

const wb = XLSX.readFile(FILE);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
const entries = [];
const problems = [];
for (const r of rows) {
  const e = {
    sl_no: parseInt(r['SL.No']) || null,
    unit_name: String(r['Unit Name'] || '').trim(),
    property_code: String(r['Property Code'] || '').trim(),
    tenant_name: String(r['Tenant Name'] || '').trim(),
    cheque_number: String(r['Cheque Number'] ?? '').trim(),
    bank: String(r['Bank'] || '').trim(),
    maturity_date: toISO(r['Maturity Date']),
    amount: parseFloat(r['Amount']) || 0,
    rent_from_date: toISO(r['Rent From Date']),
    rent_to_date: toISO(r['Rent To Date']),
  };
  if (!e.cheque_number || !e.unit_name || !e.maturity_date) problems.push(e);
  entries.push(e);
}

// Duplicate check: same tenant + same cheque number + same bank
const seen = new Map();
const dups = [];
for (const e of entries) {
  const k = `${e.tenant_name}|${e.bank}|${e.cheque_number}`;
  if (seen.has(k)) dups.push([seen.get(k), e]); else seen.set(k, e);
}
console.log(`Rows parsed: ${entries.length}`);
console.log(`Rows with missing cheque/unit/maturity: ${problems.length}`);
console.log(`Duplicate (tenant, bank, cheque) groups: ${dups.length}`);
if (problems.length) console.log(problems.slice(0, 5));
if (dups.length) console.log(dups.slice(0, 5));

if (!APPLY) { console.log('Dry run only. Re-run with --apply and DATABASE_URL set.'); process.exit(problems.length || dups.length ? 1 : 0); }
if (problems.length || dups.length) { console.error('Refusing to apply: fix the issues above first.'); process.exit(1); }
if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is required.'); process.exit(1); }

(async () => {
  const { Client } = require('pg');
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    await c.query('BEGIN');
    const before = await c.query('SELECT COUNT(*) FROM public.pdcs');
    await c.query('DELETE FROM public.pdcs');
    const cols = ['sl_no', 'unit_name', 'property_code', 'tenant_name', 'cheque_number', 'bank', 'maturity_date', 'amount', 'rent_from_date', 'rent_to_date'];
    const CH = 100;
    for (let i = 0; i < entries.length; i += CH) {
      const chunk = entries.slice(i, i + CH);
      const params = [];
      const vals = chunk.map((e, ri) => {
        const ph = cols.map((col, ci) => { params.push(e[col]); return `$${ri * (cols.length + 2) + ci + 1}`; });
        params.push('In Hand', 'In Hand');
        ph.push(`$${ri * (cols.length + 2) + cols.length + 1}`, `$${ri * (cols.length + 2) + cols.length + 2}`);
        return `(${ph.join(',')})`;
      });
      await c.query(`INSERT INTO public.pdcs (${cols.join(',')}, status, status_pdc) VALUES ${vals.join(',')}`, params);
    }
    await c.query('COMMIT');
    const after = await c.query('SELECT COUNT(*) FROM public.pdcs');
    console.log(`Replaced ${before.rows[0].count} rows with ${after.rows[0].count}.`);
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    console.error('Failed, rolled back:', err);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
})();
