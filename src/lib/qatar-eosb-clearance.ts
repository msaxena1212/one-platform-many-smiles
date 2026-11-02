/**
 * STATE OF QATAR - MINISTRY OF LABOUR (MADLSA / MOL)
 * FINAL SETTLEMENT & CLEARANCE VOUCHER GENERATOR
 * سند مخالصة مالية وبراءة ذمة نهائية للخدمة
 *
 * Compliant with:
 * - Qatar Labour Law No. 14 of 2004 (Articles 54, 72 & 81)
 * - Qatar Wages Protection System (WPS)
 */

import { AL_AMEEN_PAGE1_HEADER_BASE64 } from "./header-banner-base64";
import { getDocumentBranding } from "./document-branding";

export interface EosbClearanceData {
  voucherNo?: string;
  settlementDate?: string;

  // Employee Details
  employeeIdCode: string;
  employeeName: string;
  employeeNameAr?: string;
  qid: string;
  nationality: string;
  designation: string;
  department: string;
  dateOfJoining: string;
  lastWorkingDate: string;
  serviceYears: number;
  serviceMonths: number;
  serviceDays: number;

  // Salary Base
  basicSalary: number;
  hra?: number;
  tra?: number;
  grossSalary: number;

  // Entitlements
  gratuityAmount: number; // Art. 54: 21 days basic per year
  gratuityCalculationText?: string;
  unpaidSalaryAmount: number;
  leaveEncashmentDays: number;
  leaveEncashmentAmount: number;
  airTicketAllowance: number;
  otherAllowancesAmount?: number;
  totalGrossPayable: number;

  // Deductions
  loanDeduction: number;
  assetRecoveryDeduction: number;
  otherDeductions: number;
  totalDeductions: number;

  // Net Disbursed
  netSettlementPayable: number;
  paymentMethod?: string;
  bankTxRef?: string;
}

function fmt(n: number): string {
  return Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function generateEosbClearanceHtml(data: EosbClearanceData): string {
  const branding = getDocumentBranding();
  const vNo = data.voucherNo || `EOSB-${data.employeeIdCode}-${Date.now().toString().slice(-4)}`;
  const date = data.settlementDate || new Date().toISOString().split("T")[0];

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>Final Settlement & Clearance Voucher - ${data.employeeName}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm 14mm 12mm 14mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", "Traditional Arabic", sans-serif;
      color: #111827;
      background: #ffffff;
      font-size: 10pt;
      line-height: 1.45;
      margin: 0;
      padding: 0;
    }
    .header-banner { width: 100%; max-height: 120px; object-fit: contain; margin-bottom: 8px; }
    .badge-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1.5px solid #0284c7;
      border-radius: 6px;
      padding: 6px 14px;
      margin-bottom: 10px;
    }
    .title-ar { font-weight: 900; color: #0369a1; font-size: 13pt; }
    .title-en { font-weight: 800; color: #075985; font-size: 9.5pt; font-family: sans-serif; }
    .ref-no { font-family: monospace; font-weight: bold; color: #0284c7; font-size: 10pt; }
    .grid-emp {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: 9.5pt;
    }
    .grid-emp th, .grid-emp td {
      border: 1px solid #e2e8f0;
      padding: 5px 8px;
    }
    .grid-emp th { background: #f1f5f9; color: #334155; font-weight: bold; width: 22%; text-align: right; }
    .table-calc {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
      font-size: 9.5pt;
    }
    .table-calc th, .table-calc td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
    }
    .table-calc th { background: #e0f2fe; color: #0369a1; font-weight: bold; text-align: right; }
    .text-mono { font-family: monospace; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .discharge-box {
      background: #fafaf9;
      border: 1px solid #d6d3d1;
      border-right: 4px solid #0284c7;
      padding: 8px 12px;
      margin: 10px 0;
      font-size: 9pt;
      line-height: 1.5;
      text-align: justify;
    }
    .sig-section {
      display: grid;
      grid-template-columns: 1fr 120px 1fr;
      gap: 12px;
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1px dashed #cbd5e1;
      font-size: 9pt;
    }
    .thumbprint-box {
      width: 110px;
      height: 95px;
      border: 1.5px dashed #94a3b8;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      font-size: 7.5pt;
      text-align: center;
      margin: 0 auto;
    }
    .no-print-bar {
      background: #0f172a;
      color: #ffffff;
      padding: 8px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-family: sans-serif;
    }
    .btn-print {
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 6px 14px;
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
      <strong>QATAR HRMS END-OF-SERVICE (EOSB) FINAL CLEARANCE VOUCHER</strong>
    </div>
    <div>
      <button class="btn-print" onclick="window.print()">طباعة سند المخالصة (Print Clearance)</button>
    </div>
  </div>

  <img src="${AL_AMEEN_PAGE1_HEADER_BASE64}" class="header-banner" alt="Al Ameen Letterhead" />

  <div class="badge-bar">
    <div>
      <div class="title-ar">سند مخالصة مالية وإبراء ذمة نهائي (نهاية الخدمة)</div>
      <div class="title-en">FINAL SETTLEMENT & END-OF-SERVICE CLEARANCE VOUCHER (QATAR LABOUR LAW)</div>
    </div>
    <div style="text-align: left;" dir="ltr">
      <div class="ref-no">REF: ${vNo}</div>
      <div style="font-size: 8.5pt; color: #64748b;">Date: ${date}</div>
    </div>
  </div>

  <!-- Employee Dossier Particulars -->
  <table class="grid-emp">
    <tr>
      <th>اسم الموظف (Name):</th>
      <td style="font-weight: bold; font-size: 10pt;">${data.employeeName}</td>
      <th>الرقم الشخصي (QID):</th>
      <td class="text-mono" style="font-weight: bold;">${data.qid}</td>
    </tr>
    <tr>
      <th>الكود الوظيفي (ID Code):</th>
      <td class="text-mono">${data.employeeIdCode}</td>
      <th>الجنسية (Nationality):</th>
      <td>${data.nationality}</td>
    </tr>
    <tr>
      <th>المسمى الوظيفي (Designation):</th>
      <td>${data.designation}</td>
      <th>القسم / الإدارة (Department):</th>
      <td>${data.department}</td>
    </tr>
    <tr>
      <th>تاريخ مباشرة العمل (Joining):</th>
      <td class="text-mono">${data.dateOfJoining}</td>
      <th>آخر يوم عمل (Last Working Date):</th>
      <td class="text-mono" style="font-weight: bold; color: #dc2626;">${data.lastWorkingDate}</td>
    </tr>
    <tr>
      <th>إجمالي مدة الخدمة (Service Period):</th>
      <td colspan="3">
        <strong>${data.serviceYears} سنة</strong> و <strong>${data.serviceMonths} شهر</strong> و <strong>${data.serviceDays} يوم</strong>
        <span style="color: #64748b; font-size: 8.5pt; margin-right: 8px;">(مستحق لمكافأة نهاية الخدمة وفقاً للمادة 54)</span>
      </td>
    </tr>
    <tr>
      <th>الراتب الأساسي الأخير (Last Basic):</th>
      <td class="text-mono" style="font-weight: bold; color: #0284c7;">QAR ${fmt(data.basicSalary)}</td>
      <th>إجمالي الراتب الشامل (Gross):</th>
      <td class="text-mono">QAR ${fmt(data.grossSalary)}</td>
    </tr>
  </table>

  <!-- Entitlements & Deductions Breakdown -->
  <table class="table-calc">
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th>البيان والتفاصيل (Entitlement &amp; Deduction Particulars)</th>
        <th style="width: 25%;" class="text-left">السند القانوني (Basis)</th>
        <th style="width: 20%;" class="text-left">المبلغ (QAR)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="text-center">1</td>
        <td><strong>مكافأة نهاية الخدمة (End-of-Service Gratuity)</strong></td>
        <td class="text-left" style="font-size: 8.5pt; color: #475569;">المادة 54: 21 يوم أساسي / سنة</td>
        <td class="text-left text-mono" style="font-weight: bold; color: #0284c7;">QAR ${fmt(data.gratuityAmount)}</td>
      </tr>
      <tr>
        <td class="text-center">2</td>
        <td><strong>بدل رصيد الإجازات السنوية المستحقة (Leave Encashment)</strong></td>
        <td class="text-left" style="font-size: 8.5pt; color: #475569;">${data.leaveEncashmentDays} يوم إجازة غير مستنفذة</td>
        <td class="text-left text-mono">QAR ${fmt(data.leaveEncashmentAmount)}</td>
      </tr>
      <tr>
        <td class="text-center">3</td>
        <td><strong>الراتب المستحق عن الشهر الأخير (Final Pro-Rata Salary)</strong></td>
        <td class="text-left" style="font-size: 8.5pt; color: #475569;">أيام العمل الفعلية للشهر الأخير</td>
        <td class="text-left text-mono">QAR ${fmt(data.unpaidSalaryAmount)}</td>
      </tr>
      <tr>
        <td class="text-center">4</td>
        <td><strong>بدل تذكرة السفر للعودة (Repatriation Air Ticket Allowance)</strong></td>
        <td class="text-left" style="font-size: 8.5pt; color: #475569;">المادة 57: إعادة الموظف لموطنه</td>
        <td class="text-left text-mono">QAR ${fmt(data.airTicketAllowance)}</td>
      </tr>
      <tr style="background: #f8fafc; font-weight: bold;">
        <td colspan="3" class="text-right">إجمالي المستحقات الإجمالية (TOTAL GROSS ENTITLEMENTS):</td>
        <td class="text-left text-mono" style="color: #0369a1;">QAR ${fmt(data.totalGrossPayable)}</td>
      </tr>
      ${
        data.totalDeductions > 0
          ? `
      <tr>
        <td class="text-center">5</td>
        <td style="color: #b91c1c;">خصم: قروض وسلفيات متبقية (Loan / Advance Deductions)</td>
        <td class="text-left" style="font-size: 8.5pt; color: #475569;">أقساط السلف القائمة</td>
        <td class="text-left text-mono" style="color: #b91c1c;">- QAR ${fmt(data.loanDeduction)}</td>
      </tr>
      <tr>
        <td class="text-center">6</td>
        <td style="color: #b91c1c;">خصم: عهد عينية / تسوية أصول (Asset Recovery Deductions)</td>
        <td class="text-left" style="font-size: 8.5pt; color: #475569;">تسوية استلام العهد</td>
        <td class="text-left text-mono" style="color: #b91c1c;">- QAR ${fmt(data.assetRecoveryDeduction)}</td>
      </tr>
      <tr style="background: #fef2f2; font-weight: bold;">
        <td colspan="3" class="text-right" style="color: #991b1b;">إجمالي الاستقطاعات والخصومات (TOTAL DEDUCTIONS):</td>
        <td class="text-left text-mono" style="color: #991b1b;">- QAR ${fmt(data.totalDeductions)}</td>
      </tr>
      `
          : ""
      }
      <tr style="background: #ecfdf5; font-size: 11pt; font-weight: bold;">
        <td colspan="3" class="text-right" style="color: #065f46;">صافي المستحق النهائي للصرف (NET FINAL SETTLEMENT PAYABLE):</td>
        <td class="text-left text-mono" style="color: #047857; font-size: 12pt;">QAR ${fmt(data.netSettlementPayable)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Official Legal Discharge & Waiver Clause -->
  <div class="discharge-box">
    <strong>إقرار وتعهد مخالصة وبراءة ذمة نهائية (EMPLOYEE STATUTORY ACKNOWLEDGMENT & DISCHARGE):</strong><br>
    أقر أنا الموقع أدناه <strong>${data.employeeName}</strong>، حامل البطاقة الشخصية القطرية رقم <strong>(${data.qid})</strong>، بأنني قد استلمت من شركة <strong>${branding.companyNameAr || "الأمين للعقارات والاستثمارات ذ.م.م"}</strong> كامل حقوقي ومستحقاتي العمالية والمالية المترتبة على عقد عملي وفترة خدمتي المبينة أعلاه، بما في ذلك الراتب الشهري، وبدل الإجازات السنوية، ومكافأة نهاية الخدمة، وبدل تذكرة العودة، وسائر البدلات دون أي استثناء.<br>
    وبموجب هذا السند، أبرئ ذمة الشركة إبراءً شاملاً ونهائياً ومانعاً لأي مطالبة حالية أو مستقبلية، وأتنازل عن أي دعوى أو شكوى عمالية لدى وزارة العمل أو المحاكم المختصة بدولة قطر، وأؤكد أنني لم أعد أطالب الشركة بأي حق مالي أو قانوني كان.
  </div>

  <!-- Signatures & Thumbprint Section -->
  <div class="sig-section">
    <div>
      <strong>الموظف المقر بما فيه (Employee):</strong><br>
      الاسم: ${data.employeeName}<br>
      التوقيع: _______________________<br>
      التاريخ: ${date}
    </div>

    <div>
      <div class="thumbprint-box">
        بصمة الإبهام<br>(Thumbprint)<br><br>
        [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]
      </div>
    </div>

    <div style="text-align: left;" dir="ltr">
      <strong>For Al Ameen Real Estate &amp; Investments:</strong><br>
      HR &amp; Finance Management<br>
      Signature: _______________________<br>
      Seal: [ Official Stamp ]
    </div>
  </div>

</body>
</html>`;
}

export function openPrintableEosbClearance(data: EosbClearanceData) {
  const html = generateEosbClearanceHtml(data);
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
