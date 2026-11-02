/**
 * QATAR LEGAL & RENTAL DISPUTE COMMITTEE (RDC) ENGINE
 * محرك الإخطارات القانونية وملفات لجنة فض المنازعات الإيجارية - دولة قطر
 *
 * Compliant with:
 * - Qatar Penal Code (Law No. 11 of 2004, Article 357 - Cheques without sufficient funds)
 * - Qatar Tenancy Law (Law No. 4 of 2008 concerning the Lease of Properties)
 * - Rental Dispute Settlement Committee (لجنة فض المنازعات الإيجارية - RDC) Regulations
 * - Qatar National Address Law (Law No. 24 of 2017)
 */

import { AL_AMEEN_PAGE1_HEADER_BASE64 } from "./header-banner-base64";
import { getDocumentBranding } from "./document-branding";

export interface BouncedChequeLegalData {
  caseRef?: string;
  chequeNo: string;
  chequeDate: string;
  bankName: string;
  amount: number;
  returnReason?: string;
  returnSlipDate?: string;
  bankReturnSlipNo?: string;

  // Tenant / Drawer Particulars
  tenantName: string;
  tenantQid?: string;
  tenantCr?: string;
  tenantMobile?: string;
  tenantEmail?: string;
  tenantNationalAddress?: {
    zone?: string;
    street?: string;
    building?: string;
    unit?: string;
    pin?: string;
  };

  // Property / Lease Particulars
  propertyName: string;
  unitRef: string;
  leaseContractNo?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  monthlyRent?: number;

  // Additional Claims / Legal Dues
  totalOutstandingArrears?: number;
  bankReturnFees?: number;
  legalAdminFee?: number;
  noticeIssueDate?: string;
  cureDeadlineDate?: string; // 7 calendar days from issue
}

/**
 * Format Qatar currency with 2 decimals
 */
function fmtQar(amt: number): string {
  return Number(amt || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Generates the official bilingual 7-Day Legal Notice HTML
 * (إخطار قانوني نهائي بالسداد خلال سبعة أيام وفقاً للمادة 357 من قانون العقوبات وقانون إيجار العقارات)
 */
export function generate7DayLegalNoticeHtml(data: BouncedChequeLegalData): string {
  const branding = getDocumentBranding();
  const issueDate = data.noticeIssueDate || new Date().toISOString().split("T")[0];

  // Calculate 7-day cure deadline
  const curDt = new Date(issueDate);
  curDt.setDate(curDt.getDate() + 7);
  const deadlineDate = data.cureDeadlineDate || curDt.toISOString().split("T")[0];

  const caseRef = data.caseRef || `LGL-NTC-${data.chequeNo}-${issueDate.replace(/-/g, "")}`;
  const totalDue = (data.amount || 0) + (data.bankReturnFees || 200) + (data.legalAdminFee || 500);

  const zone = data.tenantNationalAddress?.zone || "60";
  const street = data.tenantNationalAddress?.street || "840";
  const bldg = data.tenantNationalAddress?.building || "42";
  const unit = data.tenantNationalAddress?.unit || data.unitRef;
  const pin = data.tenantNationalAddress?.pin || "41020304";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>7-Day Legal Notice - Cheque #${data.chequeNo} - Al Ameen Real Estate</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm 15mm 15mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", "Traditional Arabic", sans-serif;
      color: #111827;
      background: #ffffff;
      font-size: 11pt;
      line-height: 1.5;
      margin: 0;
      padding: 0;
    }
    .header-banner { width: 100%; max-height: 130px; object-fit: contain; margin-bottom: 12px; }
    .badge-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fef2f2;
      border: 1.5px solid #dc2626;
      border-radius: 6px;
      padding: 8px 14px;
      margin-bottom: 14px;
    }
    .badge-bar .ref-no { font-family: monospace; font-weight: bold; color: #991b1b; font-size: 10pt; }
    .badge-bar .title-ar { font-weight: 900; color: #b91c1c; font-size: 13pt; }
    .badge-bar .title-en { font-weight: 800; color: #7f1d1d; font-size: 10pt; font-family: sans-serif; }
    .notice-box {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: #fafafa;
      padding: 10px 14px;
      margin-bottom: 14px;
      font-size: 10pt;
    }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field-label { font-weight: bold; color: #4b5563; font-size: 9pt; }
    .field-val { font-weight: 600; color: #111827; font-family: monospace; }
    .cheque-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 10pt;
    }
    .cheque-table th, .cheque-table td {
      border: 1px solid #d1d5db;
      padding: 6px 10px;
      text-align: right;
    }
    .cheque-table th { background: #fee2e2; color: #991b1b; font-weight: bold; }
    .warning-box {
      background: #fff1f2;
      border-right: 4px solid #e11d48;
      border-left: 4px solid #e11d48;
      padding: 10px 14px;
      margin: 14px 0;
      font-size: 9.5pt;
      line-height: 1.6;
    }
    .deadline-highlight {
      display: inline-block;
      background: #dc2626;
      color: #ffffff;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: bold;
    }
    .sig-section {
      margin-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-top: 1px dashed #d1d5db;
      padding-top: 12px;
      font-size: 10pt;
    }
    .stamp-box {
      width: 130px;
      height: 90px;
      border: 1.5px dashed #9ca3af;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      font-size: 8.5pt;
      text-align: center;
    }
    .no-print-bar {
      background: #1e293b;
      color: #ffffff;
      padding: 10px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      font-family: sans-serif;
      font-size: 10pt;
    }
    .btn-print {
      background: #dc2626;
      color: #ffffff;
      border: none;
      padding: 6px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }
    @media print {
      .no-print-bar { display: none !important; }
      body { margin: 0; padding: 0; }
    }
  </style>
</head>
<body>

  <div class="no-print-bar">
    <div>
      <strong>QATAR 7-DAY STATUTORY LEGAL NOTICE</strong> (إخطار قانوني نهائي بالسداد قبل اتخاذ الإجراءات الجنائية وقيد دعوى فض المنازعات)
    </div>
    <div>
      <button class="btn-print" onclick="window.print()">طباعة الإخطار القانوني (Print Notice)</button>
    </div>
  </div>

  <img src="${AL_AMEEN_PAGE1_HEADER_BASE64}" class="header-banner" alt="Al Ameen Letterhead" />

  <div class="badge-bar">
    <div style="text-align: right;">
      <div class="title-ar">إخطار قانوني نهائي بالسداد خلال سبعة (7) أيام</div>
      <div class="title-en">FINAL 7-DAY LEGAL DEMAND NOTICE (ARTICLE 357 PENAL CODE)</div>
    </div>
    <div style="text-align: left;" dir="ltr">
      <div class="ref-no">REF: ${caseRef}</div>
      <div style="font-size: 9pt; color: #6b7280;">Date: ${issueDate}</div>
    </div>
  </div>

  <div class="notice-box">
    <div class="grid-2">
      <div>
        <span class="field-label">المدعى عليه / المنذر إليه (Tenant / Drawer):</span>
        <div class="field-val" style="font-size: 11pt;">${data.tenantName}</div>
        <div style="font-size: 9pt; color: #4b5563;">
          الرقم الشخصي (QID): <strong>${data.tenantQid || "—"}</strong> | جوال: <strong>${data.tenantMobile || "—"}</strong>
        </div>
        <div style="font-size: 9pt; color: #4b5563; margin-top: 3px;">
          العنوان الوطني: مبنى <strong>${bldg}</strong>، شارع <strong>${street}</strong>، منطقة <strong>${zone}</strong>، وحدة <strong>${unit}</strong> (PIN: ${pin})
        </div>
      </div>
      <div style="border-right: 1px solid #e5e7eb; padding-right: 12px;">
        <span class="field-label">العين المؤجرة وعقد الإيجار (Leased Unit & Contract):</span>
        <div class="field-val" style="font-size: 10pt;">${data.propertyName} — وحدة رقم: ${data.unitRef}</div>
        <div style="font-size: 9pt; color: #4b5563;">
          رقم العقد: <strong>${data.leaseContractNo || "LS-6010"}</strong> | القيمة الإيجارية الشهرية: <strong>QAR ${fmtQar(data.monthlyRent || data.amount)}</strong>
        </div>
        <div style="font-size: 9pt; color: #4b5563;">
          تاريخ الإخطار: <strong>${issueDate}</strong> | المهلة النهائية: <strong class="deadline-highlight">${deadlineDate}</strong>
        </div>
      </div>
    </div>
  </div>

  <p style="margin: 8px 0; text-align: justify; font-size: 10pt;">
    <strong>تحية طيبة وبعد،،،</strong><br>
    تخطركم شركة <strong>${branding.companyNameAr || "الأمين للعقارات والاستثمارات ذ.م.م"}</strong>، بصفتها المؤجر والمدير العقاري المعتمد للعقار المذكور أعلاه، بأنه بموجب عقد الإيجار المبرم بيننا وبينكم، قد قمتم بتحرير وتسليم الشيك الآجل الموضح بياناته أدناه وفاءً للقيمة الإيجارية المستحقة، إلا أنه ولدى تقديمه للبنك المسحوب عليه، ارتد مردوداً دون صرف للسبب المبين قرينه:
  </p>

  <table class="cheque-table">
    <thead>
      <tr>
        <th>رقم الشيك<br><span style="font-size: 8pt; font-weight: normal;">Cheque #</span></th>
        <th>تاريخ الاستحقاق<br><span style="font-size: 8pt; font-weight: normal;">Due Date</span></th>
        <th>البنك المسحوب عليه<br><span style="font-size: 8pt; font-weight: normal;">Drawee Bank</span></th>
        <th>سبب الارتجاع<br><span style="font-size: 8pt; font-weight: normal;">Return Reason</span></th>
        <th>رقم إشعار الرفض<br><span style="font-size: 8pt; font-weight: normal;">Bank Memo #</span></th>
        <th>قيمة الشيك (ر.ق)<br><span style="font-size: 8pt; font-weight: normal;">Cheque Amount</span></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="font-family: monospace; font-weight: bold;">${data.chequeNo}</td>
        <td>${data.chequeDate}</td>
        <td>${data.bankName}</td>
        <td style="color: #b91c1c; font-weight: bold;">${data.returnReason || "عدم كفاية الرصيد (Insufficient Funds)"}</td>
        <td style="font-family: monospace;">${data.bankReturnSlipNo || "MEMO-" + data.chequeNo}</td>
        <td style="font-weight: bold; font-family: monospace; color: #b91c1c;">QAR ${fmtQar(data.amount)}</td>
      </tr>
      <tr style="background: #fdf2f8;">
        <td colspan="5" style="text-align: left; font-weight: bold;">مصاريف الارتجاع البنكية والأتعاب الإدارية (Bank Return & Administrative Costs):</td>
        <td style="font-weight: bold; font-family: monospace;">QAR ${fmtQar((data.bankReturnFees || 200) + (data.legalAdminFee || 500))}</td>
      </tr>
      <tr style="background: #fee2e2; font-weight: bold;">
        <td colspan="5" style="text-align: left; font-size: 11pt; color: #991b1b;">إجمالي المبلغ المستحق السداد فوراً (TOTAL AMOUNT IMMEDIATELY DUE):</td>
        <td style="font-size: 12pt; color: #991b1b; font-family: monospace;">QAR ${fmtQar(totalDue)}</td>
      </tr>
    </tbody>
  </table>

  <div class="warning-box">
    <div style="font-weight: bold; font-size: 11pt; color: #9f1239; margin-bottom: 4px;">
      ⚠️ التكليف بالسداد والتحذير القانوني الصارم (LEGAL DEMAND & STATUTORY NOTICE):
    </div>
    بناءً عليه، ننذركم رسمياً بضرورة سداد المبلغ الإجمالي المستحق وقدره <strong>(${fmtQar(totalDue)} ر.ق)</strong> نقداً أو بموجب تحويل بنكي معتمد لحساب الشركة لدى بنك دخان، وذلك خلال مهلة أقصاها <span class="deadline-highlight">سبعة (7) أيام تقويمية</span> تبدأ من تاريخ استلامكم هذا الإخطار وتنتهي بتاريخ <strong>${deadlineDate}</strong>.
    <br><br>
    وفي حال فوات هذه المهلة دون السداد التام، فإن الشركة ستباشر فوراً وبدون أي إشعار آخر الإجراءات القانونية التالية:
    <ol style="margin: 4px 0 0 16px; padding: 0;">
      <li><strong>تحريك الدعوى الجنائية</strong> ضدكم بتهمة إصدار شيك بدون رصيد قائم وقابل للسحب وفقاً لنص <strong>المادة (357) من قانون العقوبات القطري رقم (11) لسنة 2004</strong>، والتي تعاقب بالحبس مدة تصل إلى ثلاث سنوات والغرامة، وطلب منعكم من السفر فوراً.</li>
      <li><strong>قيد دعوى قضائية عاجلة أمام لجنة فض المنازعات الإيجارية (RDC)</strong> بطلب فسخ عقد الإيجار فوراً وإخلائكم جبراً من العين المؤجرة، مع إلزامكم بكامل المتأخرات الإيجارية ومقابل الانتفاع والتعويض عن الأضرار ومصاريف التقاضي.</li>
    </ol>
  </div>

  <div class="sig-section">
    <div>
      <div style="font-weight: bold; color: #1e3a8a;">شركة الأمين للعقارات والاستثمارات ذ.م.م</div>
      <div style="font-size: 9pt; color: #4b5563;">الإدارة القانونية والتحصيل المالي</div>
      <div style="margin-top: 28px; font-weight: bold;">التوقيع: _______________________</div>
      <div style="font-size: 8.5pt; color: #6b7280; margin-top: 4px;">التاريخ: ${issueDate}</div>
    </div>
    <div class="stamp-box">
      خاتم الشركة الرسمي<br>(Official Company Seal)
    </div>
    <div style="text-align: left;" dir="ltr">
      <div style="font-weight: bold; color: #1e3a8a;">Al Ameen Real Estate & Investments LLC</div>
      <div style="font-size: 9pt; color: #4b5563;">Legal & Financial Collections Department</div>
      <div style="margin-top: 28px; font-weight: bold;">Authorized Signatory: ______________</div>
      <div style="font-size: 8.5pt; color: #6b7280; margin-top: 4px;">Doha, State of Qatar</div>
    </div>
  </div>

</body>
</html>`;
}

/**
 * Generates official Rental Dispute Settlement Committee (لجنة فض المنازعات الإيجارية - RDC) Filing Pack HTML
 * (ملف قيد دعوى إخلاء وفسخ عقد ومطالبة مالية لشيك مرتجع)
 */
export function generateRdcFilingPackHtml(data: BouncedChequeLegalData): string {
  const branding = getDocumentBranding();
  const issueDate = data.noticeIssueDate || new Date().toISOString().split("T")[0];
  const caseRef = data.caseRef || `RDC-CLAIM-${data.chequeNo}-${Date.now().toString().slice(-4)}`;
  const totalClaim = (data.amount || 0) + (data.totalOutstandingArrears || 0) + 1200; // includes filing fees

  const zone = data.tenantNationalAddress?.zone || "60";
  const street = data.tenantNationalAddress?.street || "840";
  const bldg = data.tenantNationalAddress?.building || "42";
  const unit = data.tenantNationalAddress?.unit || data.unitRef;
  const pin = data.tenantNationalAddress?.pin || "41020304";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>RDC Filing Dossier - Case ${caseRef} - Al Ameen Real Estate</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm 15mm 15mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Cairo", "Traditional Arabic", sans-serif;
      color: #111827;
      background: #ffffff;
      font-size: 10.5pt;
      line-height: 1.5;
      margin: 0;
      padding: 0;
    }
    .header-banner { width: 100%; max-height: 130px; object-fit: contain; margin-bottom: 12px; }
    .court-header {
      text-align: center;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 8px;
      margin-bottom: 14px;
    }
    .court-header .state { font-size: 13pt; font-weight: bold; color: #1e3a8a; }
    .court-header .committee { font-size: 15pt; font-weight: 900; color: #831843; }
    .court-header .sub { font-size: 10pt; color: #4b5563; }
    .case-badge {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f0fdf4;
      border: 1px solid #16a34a;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 12px;
    }
    .section-title {
      font-size: 11pt;
      font-weight: bold;
      color: #1e3a8a;
      background: #f1f5f9;
      border-right: 4px solid #1e3a8a;
      padding: 4px 10px;
      margin: 12px 0 6px 0;
    }
    .table-parties {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    .table-parties td {
      border: 1px solid #e2e8f0;
      padding: 6px 10px;
      vertical-align: top;
      font-size: 9.5pt;
    }
    .table-parties th {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 6px 10px;
      text-align: right;
      width: 28%;
      color: #475569;
    }
    .checklist-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
      font-size: 9.5pt;
    }
    .checklist-table th, .checklist-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
    }
    .checklist-table th { background: #f1f5f9; font-weight: bold; color: #1e293b; text-align: right; }
    .status-attached { color: #15803d; font-weight: bold; }
    .prayers-box {
      background: #f8fafc;
      border: 1.5px solid #0284c7;
      border-radius: 6px;
      padding: 10px 14px;
      margin-top: 10px;
      font-size: 10pt;
    }
    .no-print-bar {
      background: #0f172a;
      color: #ffffff;
      padding: 10px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-family: sans-serif;
    }
    .btn-print {
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 6px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }
    @media print {
      .no-print-bar { display: none !important; }
    }
  </style>
</head>
<body>

  <div class="no-print-bar">
    <div>
      <strong>QATAR RDC LEGAL FILING DOSSIER</strong> (صحيفة افتتاح دعوى أمام لجنة فض المنازعات الإيجارية)
    </div>
    <div>
      <button class="btn-print" onclick="window.print()">طباعة ملف الدعوى (Print Dossier)</button>
    </div>
  </div>

  <img src="${AL_AMEEN_PAGE1_HEADER_BASE64}" class="header-banner" alt="Al Ameen Letterhead" />

  <div class="court-header">
    <div class="state">دولة قطر • وزارة البلدية والبيئة</div>
    <div class="committee">لجنة فض المنازعات الإيجارية (RDC)</div>
    <div class="sub">صحيفة قيد دعوى إخلاء وفسخ عقد إيجار ومطالبة مالية (ارتجاع شيكات إيجارية)</div>
  </div>

  <div class="case-badge">
    <div>
      <strong>رقم مرجع ملف الدعوى:</strong> <span style="font-family: monospace; font-size: 11pt; color: #15803d; font-weight: bold;">${caseRef}</span>
    </div>
    <div>
      <strong>تاريخ إعداد الملف:</strong> <span style="font-family: monospace;">${issueDate}</span>
    </div>
    <div>
      <strong>إجمالي المطالبة المالية:</strong> <span style="font-family: monospace; font-weight: bold; color: #b91c1c;">QAR ${fmtQar(totalClaim)}</span>
    </div>
  </div>

  <div class="section-title">أولاً: بيانات أطراف النزاع الإيجاري (Parties to the Dispute)</div>
  <table class="table-parties">
    <tr>
      <th>المدعي (المؤجر / المدير العقاري):</th>
      <td>
        <strong>شركة الأمين للعقارات والاستثمارات ذ.م.م</strong> (سجل تجاري: ${branding.crNumber || "90021-1"})<br>
        العنوان الوطني: مبنى 42، شارع حمد الكبير (840)، منطقة 60، الدوحة - قطر | هاتف: ${branding.phone || "+974 4492 8800"}
      </td>
    </tr>
    <tr>
      <th>المدعى عليه (المستأجر / محرر الشيك):</th>
      <td>
        <strong>${data.tenantName}</strong> (البطاقة الشخصية: <strong>${data.tenantQid || "—"}</strong> | هاتف: <strong>${data.tenantMobile || "—"}</strong>)<br>
        العنوان الوطني: مبنى <strong>${bldg}</strong>، شارع <strong>${street}</strong>، منطقة <strong>${zone}</strong>، وحدة <strong>${unit}</strong> (الرقم المساحي PIN: ${pin})
      </td>
    </tr>
    <tr>
      <th>بيانات العين المؤجرة:</th>
      <td>
        العقار: <strong>${data.propertyName}</strong> — وحدة: <strong>${data.unitRef}</strong> (عقد إيجار رقم: <strong>${data.leaseContractNo || "LS-6010"}</strong>)<br>
        الأجرة الشهرية: <strong>QAR ${fmtQar(data.monthlyRent || data.amount)}</strong>
      </td>
    </tr>
  </table>

  <div class="section-title">ثانياً: وقائع النزاع والأساس القانوني (Case Facts & Legal Grounds)</div>
  <p style="font-size: 9.5pt; text-align: justify; margin: 4px 0 8px 0;">
    1. بموجب عقد إيجار موثق، استأجر المدعى عليه من المدعي العين المؤجرة المذكورة أعلاه. وحيث إن المدعى عليه قد سلم المدعي الشيك رقم <strong>(${data.chequeNo})</strong> المسحوب على بنك <strong>(${data.bankName})</strong> بقيمة <strong>(${fmtQar(data.amount)} ر.ق)</strong> وفاءً للقيمة الإيجارية.<br>
    2. ولدى تقديم الشيك للصرف، ارتد مرفوضاً دون صرف لسبب: <strong>"${data.returnReason || "عدم كفاية الرصيد"}"</strong> بموجب إشعار البنك المرفق.<br>
    3. قام المدعي بتوجيه إخطار قانوني مسجل إلى العنوان الوطني للمدعى عليه مانحاً إياه مهلة 7 أيام للسداد التزاماً بالمادة (357) من قانون العقوبات وقانون الإيجارات القطري، إلا أنه امتنع دون مسوغ قانوني.
  </p>

  <div class="section-title">ثالثاً: فهرس المستندات المرفقة بملف الدعوى (RDC Evidentiary Dossier)</div>
  <table class="checklist-table">
    <thead>
      <tr>
        <th style="width: 8%;">م</th>
        <th>المستند المؤيد للدعوى</th>
        <th>رقم الوثيقة / المرجع</th>
        <th style="width: 20%;">حالة المستند</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center;">1</td>
        <td>نسخة عقد الإيجار الموثق المبرم بين الطرفين</td>
        <td style="font-family: monospace;">${data.leaseContractNo || "LS-6010"}</td>
        <td class="status-attached">✔ مرفق معتمد</td>
      </tr>
      <tr>
        <td style="text-align: center;">2</td>
        <td>أصل الشيك المرتجع وإشعار البنك بالرفض (Bank Return Slip)</td>
        <td style="font-family: monospace;">CHQ #${data.chequeNo}</td>
        <td class="status-attached">✔ مرفق أصل الشيك</td>
      </tr>
      <tr>
        <td style="text-align: center;">3</td>
        <td>نسخة الإخطار القانوني النهائي (7 أيام) وإشعار الاستلام / العنوان الوطني</td>
        <td style="font-family: monospace;">${data.caseRef || "LGL-NTC-" + data.chequeNo}</td>
        <td class="status-attached">✔ إخطار 7 أيام مستوفى</td>
      </tr>
      <tr>
        <td style="text-align: center;">4</td>
        <td>كشف حساب العميل والذمم المدينة المعتمد من الإدارة المالية</td>
        <td style="font-family: monospace;">SOA-${data.tenantQid || "TENANT"}</td>
        <td class="status-attached">✔ كشف حساب مدقق</td>
      </tr>
      <tr>
        <td style="text-align: center;">5</td>
        <td>السجل التجاري وقيد المنشأة والتفويض بالتوقيع للمدعي</td>
        <td style="font-family: monospace;">CR ${branding.crNumber || "90021-1"}</td>
        <td class="status-attached">✔ مرفق رسمي ساري</td>
      </tr>
    </tbody>
  </table>

  <div class="prayers-box">
    <div style="font-weight: bold; color: #0369a1; font-size: 11pt; margin-bottom: 4px;">
      رابعاً: الطلبات الختامية للمدعي (Statutory Prayers for Relief):
    </div>
    يلتمس المدعي من اللجنة الموقرة وبصفة مستعجلة الحكم بما يلي:
    <ol style="margin: 4px 0 0 16px; padding: 0;">
      <li><strong>الحكم بفسخ عقد الإيجار</strong> المبرم بين الطرفين وبإلزام المدعى عليه بإخلاء العين المؤجرة فوراً وتسليمها للمدعي خالية من الشواغل والأشخاص.</li>
      <li><strong>إلزام المدعى عليه بسداد إجمالي المبالغ المستحقة</strong> البالغة <strong>(${fmtQar(totalClaim)} ر.ق)</strong> شاملة قيمة الشيك المرتجع ومقابل الانتفاع حتى تاريخ الإخلاء الفعلي.</li>
      <li><strong>إلزام المدعى عليه بالمصاريف القضائية وأتعاب المحاماة والرسوم.</strong></li>
    </ol>
  </div>

  <div style="margin-top: 24px; display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 12px; font-size: 9.5pt;">
    <div>
      <strong>مقدمه لعدالة اللجنة:</strong><br>
      شركة الأمين للعقارات والاستثمارات ذ.م.م<br>
      عنها الممثل القانوني / مدير التحصيل المالي: ___________________
    </div>
    <div style="width: 120px; height: 75px; border: 1.5px dashed #94a3b8; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 8pt; text-align: center;">
      خاتم الشركة المعتمد
    </div>
    <div style="text-align: left;" dir="ltr">
      <strong>Rental Dispute Committee Dossier</strong><br>
      Prepared on: ${issueDate}<br>
      Doha, State of Qatar
    </div>
  </div>

</body>
</html>`;
}

/**
 * Helper to open and print 7-Day Legal Notice in a new window
 */
export function openPrintable7DayLegalNotice(data: BouncedChequeLegalData) {
  const html = generate7DayLegalNoticeHtml(data);
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

/**
 * Helper to open and print RDC Filing Pack in a new window
 */
export function openPrintableRdcFilingPack(data: BouncedChequeLegalData) {
  const html = generateRdcFilingPackHtml(data);
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
