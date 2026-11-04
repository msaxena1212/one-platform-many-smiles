/**
 * Printable monthly salary slip (Qatar WPS format) with the Al Ameen letterhead.
 */
import { AL_AMEEN_PAGE1_HEADER_BASE64 } from "./header-banner-base64";
import { getDocumentBranding } from "./document-branding";

export interface PayslipPrintPayload {
  payslip: any;
  cycleName: string;
  periodStart?: string;
  periodEnd?: string;
}

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

const money = (n: unknown) =>
  Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function wordsBelow1000(n: number): string {
  const parts: string[] = [];
  if (n >= 100) {
    parts.push(`${ONES[Math.floor(n / 100)]} Hundred`);
    n %= 100;
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : ""));
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(" ");
}

export function qarInWords(amount: number): string {
  const riyals = Math.floor(Math.max(0, amount));
  const dirhams = Math.round((Math.max(0, amount) - riyals) * 100);
  const scales: [number, string][] = [[1_000_000, "Million"], [1_000, "Thousand"], [1, ""]];
  let rest = riyals;
  const parts: string[] = [];
  for (const [size, label] of scales) {
    const chunk = Math.floor(rest / size);
    if (chunk > 0) parts.push(`${wordsBelow1000(chunk)}${label ? ` ${label}` : ""}`);
    rest %= size;
  }
  let text = `${parts.join(" ") || "Zero"} Qatari Riyal${riyals === 1 ? "" : "s"}`;
  if (dirhams > 0) text += ` and ${wordsBelow1000(dirhams)} Dirham${dirhams === 1 ? "" : "s"}`;
  return `${text} Only`;
}

export function generatePayslipHtml({ payslip: p, cycleName, periodStart, periodEnd }: PayslipPrintPayload): string {
  const branding = getDocumentBranding();
  const banner = branding?.headerImageUrl || AL_AMEEN_PAGE1_HEADER_BASE64;
  const emp = p.employees || {};
  const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "Employee";
  const dept = emp.departments?.name || "—";
  const desig = emp.designations?.title || "—";
  const maskedIban = emp.iban ? String(emp.iban) : "—";

  const earnings: [string, string, number][] = [
    ["Basic Salary", "الراتب الأساسي", p.basic_pay],
    ["Allowances (Housing / Transport / Other)", "البدلات", p.allowances],
    ["Overtime Pay", "العمل الإضافي", p.overtime_pay],
    ["Leave Salary", "راتب الإجازة", p.leave_salary],
    ["Incentives", "الحوافز", p.incentives],
  ];
  const deductions: [string, string, number][] = [
    ["Unpaid Leave / Absence", "خصم الغياب", p.fines_deductions],
    ["Loan / Advance Recovery", "سداد السلف", p.loan_deductions],
    ["Statutory (GRSA Pension)", "التقاعد", p.statutory_deductions],
  ];
  const rows = (items: [string, string, number][]) =>
    items
      .filter(([, , v]) => Number(v || 0) > 0)
      .map(([en, ar, v]) => `<tr><td>${esc(en)} <span class="ar">${esc(ar)}</span></td><td class="num">${money(v)}</td></tr>`)
      .join("") || `<tr><td class="muted">None</td><td class="num">0.00</td></tr>`;

  const net = Number(p.net_salary || 0);
  const issued = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" />
<title>Payslip - ${esc(fullName)} - ${esc(cycleName)}</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #1a1a1a; font-size: 12px; margin: 0; background: #fff; }
  .sheet { max-width: 190mm; margin: 0 auto; }
  .banner { width: 100%; display: block; }
  h1 { text-align: center; font-size: 16px; margin: 10px 0 2px; letter-spacing: .5px; }
  .sub { text-align: center; color: #555; margin-bottom: 10px; }
  .ar { font-family: "Segoe UI", Tahoma, Arial, sans-serif; color: #666; margin-left: 6px; font-size: 11px; direction: rtl; }
  table { width: 100%; border-collapse: collapse; }
  .info td { padding: 4px 8px; border: 1px solid #d5d5d5; }
  .info td.l { background: #f4f6f6; font-weight: 600; width: 17%; }
  .cols { display: flex; gap: 10px; margin-top: 10px; }
  .cols > div { flex: 1; }
  .box th { background: #0f4c4a; color: #fff; text-align: left; padding: 5px 8px; font-size: 11px; text-transform: uppercase; }
  .box td { padding: 5px 8px; border-bottom: 1px solid #e3e3e3; }
  .box tr.total td { font-weight: 700; background: #f4f6f6; border-top: 1px solid #999; }
  .num { text-align: right; font-family: Consolas, monospace; white-space: nowrap; }
  .muted { color: #888; }
  .net { margin-top: 10px; display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #e7f3f2; border: 1px solid #0f4c4a; border-radius: 4px; }
  .net .amt { font-size: 18px; font-weight: 700; font-family: Consolas, monospace; color: #0f4c4a; }
  .words { margin-top: 6px; font-style: italic; color: #333; }
  .sign { display: flex; justify-content: space-between; margin-top: 36px; }
  .sign div { width: 40%; border-top: 1px solid #333; text-align: center; padding-top: 4px; font-size: 11px; }
  .foot { margin-top: 14px; font-size: 10px; color: #666; text-align: center; border-top: 1px solid #ddd; padding-top: 6px; }
  .noprint { text-align: center; margin: 10px; }
  @media print { .noprint { display: none; } }
</style></head>
<body><div class="sheet">
  <div class="noprint"><button onclick="window.print()">Print / Save as PDF</button></div>
  <img class="banner" src="${banner}" alt="Al Ameen Real Estate" />
  <h1>SALARY SLIP <span class="ar">قسيمة الراتب</span></h1>
  <div class="sub">${esc(cycleName)}${periodStart && periodEnd ? ` &bull; ${esc(periodStart)} to ${esc(periodEnd)}` : ""} &bull; Currency: QAR</div>

  <table class="info">
    <tr><td class="l">Employee Name</td><td>${esc(fullName)}</td><td class="l">Employee ID</td><td>${esc(emp.employee_id_code || "—")}</td></tr>
    <tr><td class="l">Designation</td><td>${esc(desig)}</td><td class="l">Department</td><td>${esc(dept)}</td></tr>
    <tr><td class="l">QID / Passport</td><td>${esc(emp.qid_passport_no || "—")}</td><td class="l">Nationality</td><td>${esc(emp.nationality || "—")}</td></tr>
    <tr><td class="l">Date of Joining</td><td>${esc(emp.date_of_joining || "—")}</td><td class="l">Payment Mode</td><td>Bank Transfer (WPS)</td></tr>
    <tr><td class="l">Bank</td><td>${esc(emp.bank_name || "—")}</td><td class="l">IBAN</td><td style="font-family:Consolas,monospace">${esc(maskedIban)}</td></tr>
  </table>

  <table class="info" style="margin-top:10px">
    <tr><td class="l">Working Days</td><td>${esc(p.working_days ?? 30)}</td><td class="l">Present Days</td><td>${esc(p.present_days ?? 0)}</td>
        <td class="l">Paid Leave</td><td>${esc(p.paid_leaves ?? 0)}</td><td class="l">Unpaid / Absent</td><td>${esc(p.unpaid_leaves ?? 0)}</td>
        <td class="l">OT Hours</td><td>${esc(p.overtime_hours ?? 0)}</td></tr>
  </table>

  <div class="cols">
    <div class="box"><table>
      <tr><th>Earnings <span class="ar" style="color:#cfe">المستحقات</span></th><th class="num">QAR</th></tr>
      ${rows(earnings)}
      <tr class="total"><td>Gross Earnings</td><td class="num">${money(p.gross_earnings)}</td></tr>
    </table></div>
    <div class="box"><table>
      <tr><th>Deductions <span class="ar" style="color:#cfe">الاستقطاعات</span></th><th class="num">QAR</th></tr>
      ${rows(deductions)}
      <tr class="total"><td>Total Deductions</td><td class="num">${money(p.total_deductions)}</td></tr>
    </table></div>
  </div>

  <div class="net">
    <div><strong>NET PAY <span class="ar">صافي الراتب</span></strong><br /><span class="muted">Credited via Qatar WPS to the bank account above</span></div>
    <div class="amt">QAR ${money(net)}</div>
  </div>
  <div class="words">${esc(qarInWords(net))}</div>

  <div class="sign"><div>Prepared by (HR / Payroll)</div><div>Employee Signature</div></div>
  <div class="foot">
    ${esc(branding?.legalEntityName || "Al Ameen Real Estate W.L.L")} &bull; CR ${esc(branding?.crNumber || "CR-90821-QA")}
    &bull; ${esc(branding?.address || "Doha, State of Qatar")} &bull; ${esc(branding?.phone || "")}<br />
    Computer-generated salary slip issued on ${issued}. Salary paid under the Qatar Wage Protection System (WPS). Confidential.
  </div>
</div></body></html>`;
}

export function printPayslip(payload: PayslipPrintPayload): void {
  const html = generatePayslipHtml(payload);
  const w = window.open("", "_blank", "width=900,height=1000");
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
    return;
  }
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    window.setTimeout(() => document.body.removeChild(iframe), 2000);
  }
}
