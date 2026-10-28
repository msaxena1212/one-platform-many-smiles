/**
 * customer-statement-pdf.ts
 * Generates an authentic, multi-page, 2-column bilingual (English & Arabic)
 * Customer Statement of Account PDF/Print document for Al Ameen Real Estate.
 * 
 * Features:
 * - 100% full edge-to-edge Al Ameen letterhead banner (uncropped)
 * - 2 columns throughout: English (LTR) on Left, Arabic (RTL) on Right
 * - Complete transaction ledger rows without truncation
 * - Automatic multi-page flow with A4 print styling and page breaks
 * - Bank remittance details and bilingual authentication stamps
 */

import { AL_AMEEN_PAGE1_HEADER_BASE64 } from "./header-banner-base64";

export interface BilingualStatementPayload {
  customer: {
    id: string | number;
    customerId?: string;
    name: string;
    type?: string;
    qatarId?: string;
    crNumber?: string;
    mobile?: string;
    phone?: string;
    email?: string;
  };
  statementDate: string;
  fromDate: string;
  toDate: string;
  leases: Array<{
    property: string;
    unit: string;
    contractNumber?: string;
    monthlyRent: number | string;
  }>;
  summary: {
    openingBalance: number;
    totalDebits: number;
    totalCredits: number;
    closingBalance: number;
  };
  ledgerRows: Array<{
    date: string;
    docType: string;
    refNo: string;
    description: string;
    property: string;
    unit: string;
    debit: number;
    credit: number;
    runningBalance: number;
    status: string;
  }>;
  upcomingPdcs?: Array<{
    chequeNumber: string;
    bank: string;
    dueDate: string;
    amount: number;
  }>;
  branding?: {
    companyName?: string;
    legalEntityName?: string;
    crNumber?: string;
    taxNumber?: string;
    address?: string;
    phone?: string;
    email?: string;
    headerImageUrl?: string | null;
  };
}

function translateDocType(type: string): { en: string; ar: string } {
  switch (type) {
    case "INVOICE":
      return { en: "Rental Invoice", ar: "فاتورة إيجار" };
    case "RECEIPT":
      return { en: "Payment Receipt", ar: "سند قبض" };
    case "PDC_CLEARED":
      return { en: "PDC Realization", ar: "تحصيل شيك آجل" };
    case "SECURITY_DEPOSIT":
      return { en: "Security Deposit", ar: "تأمين إيجاري" };
    case "CREDIT_NOTE":
      return { en: "Credit Adjustment", ar: "إشعار دائن" };
    case "OPENING_BALANCE":
      return { en: "Balance Forward", ar: "رصيد افتتاحي سابق" };
    default:
      return { en: type, ar: type };
  }
}

export function generateBilingualStatementHtml(payload: BilingualStatementPayload): string {
  const { customer, statementDate, fromDate, toDate, leases, summary, ledgerRows, upcomingPdcs = [], branding } = payload;
  const banner = branding?.headerImageUrl || AL_AMEEN_PAGE1_HEADER_BASE64;
  const companyEn = branding?.companyName || "Al Ameen Real Estate";
  const legalEntityEn = branding?.legalEntityName || "Al Ameen Real Estate W.L.L";
  const cr = branding?.crNumber || "CR-90821-QA";
  const tax = branding?.taxNumber || "TAX-300912-QA";
  const phone = branding?.phone || "+974 4492 8800";
  const email = branding?.email || "finance@alameen.qa";
  const addressEn = branding?.address || "Grand Hamad Avenue, Building 42, Floor 7, Doha, State of Qatar";

  const totalPdcAmount = upcomingPdcs.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const effectiveClosing = summary.closingBalance - totalPdcAmount;

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <title>Customer Statement of Account - ${customer.name} - Al Ameen Real Estate</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm 12mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      color: #0f172a;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 8.5pt;
      line-height: 1.35;
    }
    .ar {
      font-family: 'Cairo', 'Amiri', Tahoma, sans-serif;
      direction: rtl;
      text-align: right;
    }
    .en {
      direction: ltr;
      text-align: left;
    }

    /* Screen Action Bar */
    .screen-action-bar {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #ffffff;
      padding: 10px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
    }
    .screen-action-bar button {
      background: #0f766e;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease;
    }
    .screen-action-bar button:hover {
      background: #115e59;
    }
    .screen-action-bar button.close-btn {
      background: #475569;
    }
    .screen-action-bar button.close-btn:hover {
      background: #334155;
    }

    /* Document Sheet Wrapper */
    .document-wrapper {
      max-width: 210mm;
      margin: 15px auto;
      background: #ffffff;
      padding: 12mm 14mm;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    /* Header Banner Image (Edge-to-Edge full natural aspect ratio) */
    .letterhead-banner {
      width: 100%;
      margin: 0 0 10px 0;
      padding: 0;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      background: #ffffff;
    }
    .letterhead-banner img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
    }

    /* Two-Column Bilingual Header */
    .bilingual-header {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      border-bottom: 2px solid #0f766e;
      padding-bottom: 8px;
    }
    .bilingual-header td {
      vertical-align: top;
      padding: 2px 4px 6px 4px;
    }
    .header-col-en {
      width: 50%;
      text-align: left;
    }
    .header-col-ar {
      width: 50%;
      text-align: right;
      direction: rtl;
    }
    .company-title-en {
      font-size: 13pt;
      font-weight: 800;
      color: #0f766e;
      letter-spacing: -0.2px;
    }
    .company-title-ar {
      font-family: 'Cairo', sans-serif;
      font-size: 13.5pt;
      font-weight: 800;
      color: #0f766e;
    }
    .company-sub-en, .company-sub-ar {
      font-size: 8pt;
      color: #475569;
      margin-top: 1px;
    }

    /* Centered Title Badge */
    .document-title-badge {
      text-align: center;
      background: #f0fdfa;
      border: 1px solid #ccfbf1;
      padding: 6px 12px;
      border-radius: 6px;
      margin-bottom: 14px;
    }
    .doc-main-title {
      font-size: 12pt;
      font-weight: 800;
      color: #0f766e;
      letter-spacing: 0.5px;
    }
    .doc-sub-meta {
      font-size: 7.8pt;
      color: #475569;
      margin-top: 2px;
    }

    /* Two-Column Info Dossier */
    .two-col-grid {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }
    .two-col-grid td {
      width: 50%;
      vertical-align: top;
      padding: 8px 10px;
    }
    .two-col-grid td.left-border {
      border-left: 1px solid #e2e8f0;
    }
    .info-heading {
      font-size: 8.5pt;
      font-weight: 700;
      color: #0f766e;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3px;
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
    }
    .info-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
      font-size: 8pt;
    }
    .info-label {
      color: #64748b;
      font-weight: 500;
    }
    .info-value {
      color: #0f172a;
      font-weight: 700;
    }

    /* 4 Summary Metric Boxes */
    .metrics-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 6px;
      margin-bottom: 14px;
    }
    .metric-cell {
      width: 25%;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px 8px;
      text-align: center;
    }
    .metric-cell.highlight {
      border-color: #0f766e;
      background: #f0fdfa;
    }
    .metric-cell.danger {
      border-color: #e11d48;
      background: #fff1f2;
    }
    .metric-title-en {
      font-size: 7pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
    }
    .metric-title-ar {
      font-family: 'Cairo', sans-serif;
      font-size: 7.5pt;
      color: #64748b;
      direction: rtl;
    }
    .metric-amount {
      font-size: 10.5pt;
      font-weight: 800;
      font-family: 'Inter', monospace;
      margin-top: 3px;
      color: #0f172a;
    }
    .metric-amount.credit {
      color: #059669;
    }
    .metric-amount.due {
      color: #e11d48;
    }

    /* Transaction Ledger Table */
    .ledger-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 7.8pt;
    }
    .ledger-table th {
      background: #0f766e;
      color: #ffffff;
      font-weight: 700;
      padding: 5px 6px;
      border: 1px solid #0f766e;
      text-align: left;
    }
    .ledger-table th.right {
      text-align: right;
    }
    .ledger-table th.center {
      text-align: center;
    }
    .ledger-table th .th-ar {
      font-family: 'Cairo', sans-serif;
      font-size: 7pt;
      font-weight: 600;
      display: block;
      opacity: 0.92;
    }
    .ledger-table td {
      padding: 4.5px 6px;
      border: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    .ledger-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .ledger-table tr.total-row {
      background: #f1f5f9;
      font-weight: 800;
      border-top: 2px solid #0f766e;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-mono { font-family: monospace; }
    .badge-status {
      display: inline-block;
      padding: 1.5px 5px;
      border-radius: 3px;
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-paid { background: #dcfce7; color: #166534; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-cleared { background: #e0e7ff; color: #3730a3; }

    /* Remittance & Signatures Table */
    .footer-blocks {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #ffffff;
    }
    .footer-blocks td {
      width: 50%;
      padding: 8px 12px;
      vertical-align: top;
    }
    .footer-blocks td.right-col {
      border-left: 1px solid #e2e8f0;
    }
    .stamp-box {
      border: 1px dashed #94a3b8;
      border-radius: 4px;
      padding: 6px;
      text-align: center;
      color: #64748b;
      font-family: monospace;
      font-size: 7pt;
      margin-top: 6px;
      background: #f8fafc;
    }

    /* Page Footer */
    .page-legal-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 6px;
      margin-top: 12px;
      font-size: 6.8pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }

    /* Print Overrides */
    @media print {
      body {
        background: #ffffff !important;
      }
      .screen-action-bar {
        display: none !important;
      }
      .document-wrapper {
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        max-width: 100% !important;
        border-radius: 0 !important;
      }
      .ledger-table tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .footer-blocks {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  </style>
</head>
<body>

  <!-- Screen Top Bar -->
  <div class="screen-action-bar">
    <div>
      <span style="font-weight: 700; font-size: 14px;">Al Ameen Real Estate &bull; Bilingual Customer Statement of Account</span>
      <span style="margin-left: 14px; font-size: 12px; opacity: 0.8;">Customer: ${customer.name} | Code: ${customer.customerId || customer.id}</span>
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
        Print / Save as PDF (A4)
      </button>
      <button class="close-btn" onclick="window.close()">Close</button>
    </div>
  </div>

  <div class="document-wrapper">
    <!-- Official Header Banner (Full Width, Uncropped) -->
    <div class="letterhead-banner">
      <img src="${banner}" alt="${companyEn}" />
    </div>

    <!-- Bilingual Corporate Entity Header -->
    <table class="bilingual-header">
      <tr>
        <td class="header-col-en en">
          <div class="company-title-en">${companyEn}</div>
          <div class="company-sub-en"><strong>${legalEntityEn}</strong></div>
          <div class="company-sub-en">Corporate Accounting &bull; Accounts Receivable Department</div>
          <div class="company-sub-en">${addressEn}</div>
          <div class="company-sub-en font-mono">CR No: ${cr} &bull; Tax ID: ${tax} &bull; Tel: ${phone}</div>
        </td>
        <td class="header-col-ar ar">
          <div class="company-title-ar">شركة الأمين للعقارات</div>
          <div class="company-sub-ar"><strong>شركة الأمين للعقارات ذ.م.م</strong></div>
          <div class="company-sub-ar">إدارة الحسابات العامة والتحصيل المالي</div>
          <div class="company-sub-ar">شارع حمد الكبير، مبنى 42، الطابق 7، الدوحة - دولة قطر</div>
          <div class="company-sub-ar font-mono">سجل تجاري: ${cr} &bull; الرقم الضريبي: ${tax} &bull; هاتف: ${phone}</div>
        </td>
      </tr>
    </table>

    <!-- Document Title Badge -->
    <div class="document-title-badge">
      <div class="doc-main-title">
        <span>STATEMENT OF ACCOUNT</span>
        <span style="margin: 0 10px; opacity: 0.5;">&bull;</span>
        <span class="ar">كـــشــــف حـــســــاب الــعــمــيـــل</span>
      </div>
      <div class="doc-sub-meta">
        <strong>Statement Date / تاريخ الإصدار:</strong> ${statementDate} &nbsp;&bull;&nbsp;
        <strong>Period Covered / الفترة المغطاة:</strong> ${fromDate} to ${toDate}
      </div>
    </div>

    <!-- Two-Column Bilingual Customer Dossier -->
    <table class="two-col-grid">
      <tr>
        <!-- English Column -->
        <td class="en">
          <div class="info-heading">
            <span>CUSTOMER INFORMATION</span>
            <span style="font-size: 7pt; color: #64748b;">PARTICULARS</span>
          </div>
          <div class="info-line">
            <span class="info-label">Customer Name:</span>
            <span class="info-value">${customer.name}</span>
          </div>
          <div class="info-line">
            <span class="info-label">Customer Code:</span>
            <span class="info-value font-mono">${customer.customerId || customer.id}</span>
          </div>
          <div class="info-line">
            <span class="info-label">Account Classification:</span>
            <span class="info-value">${customer.type === "company" ? "Corporate Tenant" : "Individual Tenant"}</span>
          </div>
          <div class="info-line">
            <span class="info-label">QID / CR Registration:</span>
            <span class="info-value font-mono">${customer.qatarId || customer.crNumber || "—"}</span>
          </div>
          <div class="info-line">
            <span class="info-label">Mobile / Telephone:</span>
            <span class="info-value">${customer.mobile || customer.phone || "—"}</span>
          </div>
          <div class="info-line">
            <span class="info-label">Registered Email:</span>
            <span class="info-value">${customer.email || "—"}</span>
          </div>
        </td>

        <!-- Arabic Column -->
        <td class="ar left-border">
          <div class="info-heading">
            <span style="font-size: 7pt; color: #64748b;">بيانات السجل</span>
            <span>بــيـــانـــات الــعــمــيـــل</span>
          </div>
          <div class="info-line">
            <span class="info-value">${customer.name}</span>
            <span class="info-label">:اسم العميل / المستأجر</span>
          </div>
          <div class="info-line">
            <span class="info-value font-mono">${customer.customerId || customer.id}</span>
            <span class="info-label">:رمز الحساب المالي</span>
          </div>
          <div class="info-line">
            <span class="info-value">${customer.type === "company" ? "مستأجر تجاري (شركة)" : "مستأجر فردي"}</span>
            <span class="info-label">:تصنيف الحساب</span>
          </div>
          <div class="info-line">
            <span class="info-value font-mono">${customer.qatarId || customer.crNumber || "—"}</span>
            <span class="info-label">:البطاقة الشخصية / السجل</span>
          </div>
          <div class="info-line">
            <span class="info-value">${customer.mobile || customer.phone || "—"}</span>
            <span class="info-label">:رقم الهاتف / الجوال</span>
          </div>
          <div class="info-line">
            <span class="info-value">${customer.email || "—"}</span>
            <span class="info-label">:البريد الإلكتروني المعتمد</span>
          </div>
        </td>
      </tr>

      <!-- Leased Units Row -->
      <tr style="border-top: 1px solid #e2e8f0;">
        <td class="en" colspan="2" style="padding: 6px 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
            <span style="font-size: 8pt; font-weight: 700; color: #0f766e;">ASSIGNED LEASED UNITS &amp; PREMISES</span>
            <span class="ar" style="font-size: 8pt; font-weight: 700; color: #0f766e;">الوحدات والعقارات المؤجرة المسجلة للعميل</span>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${leases.length > 0 ? leases.map(l => `
              <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 8px; font-size: 7.5pt;">
                <strong>${l.property}</strong> &bull; Unit: <span class="font-mono" style="color: #0f766e; font-weight: 700;">${l.unit}</span>
                <span style="color: #64748b;">(Contract #${l.contractNumber || '—'} &bull; Rent: QAR ${Number(l.monthlyRent).toLocaleString()}/mo)</span>
              </div>
            `).join('') : '<span style="font-size: 7.5pt; color: #64748b; font-style: italic;">No active lease contracts directly linked.</span>'}
          </div>
        </td>
      </tr>
    </table>

    <!-- 4 Bilingual Summary Cards -->
    <table class="metrics-table">
      <tr>
        <td class="metric-cell">
          <div class="metric-title-en">Opening Balance</div>
          <div class="metric-title-ar">الرصيد السابق المنقول</div>
          <div class="metric-amount">QAR ${summary.openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </td>
        <td class="metric-cell">
          <div class="metric-title-en">Total Invoiced (Debits)</div>
          <div class="metric-title-ar">إجمالي الفواتير (مدين)</div>
          <div class="metric-amount" style="color: #0f766e;">+ QAR ${summary.totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </td>
        <td class="metric-cell">
          <div class="metric-title-en">Total Paid (Credits)</div>
          <div class="metric-title-ar">إجمالي المسدد (دائن)</div>
          <div class="metric-amount credit">- QAR ${summary.totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </td>
        <td class="metric-cell highlight ${summary.closingBalance > 0 ? 'danger' : ''}">
          <div class="metric-title-en">Net Closing Due</div>
          <div class="metric-title-ar">صافي الرصيد المستحق</div>
          <div class="metric-amount due">QAR ${summary.closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </td>
      </tr>
    </table>

    <!-- Complete Transaction Statement Ledger Table (Never Truncated) -->
    <table class="ledger-table">
      <thead>
        <tr>
          <th style="width: 75px;">
            Date
            <span class="th-ar">التاريخ</span>
          </th>
          <th style="width: 80px;">
            Doc Type
            <span class="th-ar">نوع السند</span>
          </th>
          <th style="width: 90px;">
            Ref Number
            <span class="th-ar">رقم المرجع</span>
          </th>
          <th>
            Description / Particulars
            <span class="th-ar">البيان والتفاصيل</span>
          </th>
          <th style="width: 110px;">
            Premise / Unit
            <span class="th-ar">العقار / الوحدة</span>
          </th>
          <th class="right" style="width: 78px;">
            Debit (QAR)
            <span class="th-ar">مدين (ر.ق)</span>
          </th>
          <th class="right" style="width: 78px;">
            Credit (QAR)
            <span class="th-ar">دائن (ر.ق)</span>
          </th>
          <th class="right" style="width: 88px;">
            Balance (QAR)
            <span class="th-ar">الرصيد (ر.ق)</span>
          </th>
          <th class="center" style="width: 55px;">
            Status
            <span class="th-ar">الحالة</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- Opening Balance Line -->
        <tr style="background: #f1f5f9; font-weight: 600;">
          <td class="font-mono">${fromDate}</td>
          <td><span style="font-size: 7pt; font-weight: 700; color: #475569;">BWD / افتتاح</span></td>
          <td class="font-mono">—</td>
          <td>Balance Brought Forward from Previous Period / رصيد مرحل من الفترة السابقة</td>
          <td>—</td>
          <td class="text-right font-mono">—</td>
          <td class="text-right font-mono">—</td>
          <td class="text-right font-mono" style="font-weight: 700;">${summary.openingBalance.toFixed(2)}</td>
          <td class="text-center"><span class="badge-status badge-paid">Brought</span></td>
        </tr>

        ${ledgerRows.map(row => {
          const t = translateDocType(row.docType);
          const isDebit = row.debit > 0;
          const isCredit = row.credit > 0;
          return `<tr>
            <td class="font-mono">${row.date}</td>
            <td>
              <div style="font-weight: 700; color: #0f766e; font-size: 7.2pt;">${t.en}</div>
              <div class="ar" style="font-size: 6.8pt; color: #64748b;">${t.ar}</div>
            </td>
            <td class="font-mono" style="font-weight: 600;">${row.refNo}</td>
            <td>${row.description}</td>
            <td style="font-size: 7.2pt; color: #475569;">${row.property} - <strong>${row.unit}</strong></td>
            <td class="text-right font-mono" style="font-weight: ${isDebit ? '700' : '400'}; color: ${isDebit ? '#0f172a' : '#94a3b8'};">
              ${isDebit ? row.debit.toFixed(2) : '—'}
            </td>
            <td class="text-right font-mono" style="font-weight: ${isCredit ? '700' : '400'}; color: ${isCredit ? '#059669' : '#94a3b8'};">
              ${isCredit ? row.credit.toFixed(2) : '—'}
            </td>
            <td class="text-right font-mono" style="font-weight: 700; color: ${row.runningBalance > 0 ? '#b91c1c' : '#0f172a'};">
              ${row.runningBalance.toFixed(2)}
            </td>
            <td class="text-center">
              <span class="badge-status ${row.status === 'Paid' || row.status === 'Settled' ? 'badge-paid' : row.status === 'Cleared' ? 'badge-cleared' : 'badge-pending'}">
                ${row.status}
              </span>
            </td>
          </tr>`;
        }).join('')}

        <!-- Total Closing Row -->
        <tr class="total-row">
          <td colspan="5" style="text-align: right; padding-right: 12px;">
            <span>TOTALS &amp; CLOSING LEDGER BALANCE / الإجمالي والرصيد الختامي المستحق:</span>
          </td>
          <td class="text-right font-mono">${summary.totalDebits.toFixed(2)}</td>
          <td class="text-right font-mono" style="color: #059669;">${summary.totalCredits.toFixed(2)}</td>
          <td class="text-right font-mono" style="color: #b91c1c; font-size: 9pt;">${summary.closingBalance.toFixed(2)}</td>
          <td class="text-center font-mono" style="font-size: 7pt; font-weight: 700;">QAR</td>
        </tr>
      </tbody>
    </table>

    <!-- PDCs in Hand Box (if any) -->
    ${upcomingPdcs.length > 0 ? `
      <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; margin-bottom: 12px; background: #ffffff;">
        <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 7.8pt; color: #0f766e; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
          <span>POST-DATED CHEQUES (PDCs) IN SAFE UNDER COLLECTION</span>
          <span class="ar">شيكات آجلة مودعة بالخزينة تحت التحصيل البنكي</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 7.5pt;">
          <tr style="color: #64748b; border-bottom: 1px solid #e2e8f0;">
            <th class="en" style="padding: 2px;">Cheque # / رقم الشيك</th>
            <th class="en" style="padding: 2px;">Drawn Bank / البنك المسحوب عليه</th>
            <th class="en" style="padding: 2px;">Maturity Date / تاريخ الاستحقاق</th>
            <th class="text-right" style="padding: 2px;">Amount / المبلغ (ر.ق)</th>
          </tr>
          ${upcomingPdcs.map(p => `
            <tr style="border-bottom: 1px dashed #e2e8f0;">
              <td class="font-mono" style="padding: 3px 2px; font-weight: 600;">#${p.chequeNumber}</td>
              <td style="padding: 3px 2px;">${p.bank}</td>
              <td class="font-mono" style="padding: 3px 2px;">${p.dueDate}</td>
              <td class="text-right font-mono" style="padding: 3px 2px; font-weight: 700; color: #0f766e;">QAR ${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          `).join('')}
          <tr style="font-weight: 700;">
            <td colspan="3" style="padding: 4px 2px; text-align: right;">Total Unrealized PDCs in Hand / إجمالي الشيكات الآجلة:</td>
            <td class="text-right font-mono" style="color: #0f766e; padding: 4px 2px;">QAR ${totalPdcAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr style="font-weight: 800; background: #f0fdfa;">
            <td colspan="3" style="padding: 4px 2px; text-align: right; color: #0f766e;">Effective Balance After Cheque Realization / الرصيد الفعلي المتبقي بعد تحصيل الشيكات:</td>
            <td class="text-right font-mono" style="color: #0f766e; font-size: 8.5pt; padding: 4px 2px;">QAR ${effectiveClosing.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>
    ` : ''}

    <!-- Bilingual Remittance & Signatures Section (2 Columns) -->
    <table class="footer-blocks">
      <tr>
        <!-- Left: Remittance Instructions -->
        <td class="en">
          <div style="font-weight: 700; font-size: 8pt; color: #0f766e; margin-bottom: 3px; display: flex; align-items: center; gap: 4px;">
            <span>BANK REMITTANCE &amp; WIRE TRANSFER</span>
          </div>
          <div style="font-size: 7.5pt; line-height: 1.45; color: #334155;">
            <div>Bank: <strong>Commercial Bank of Qatar (CBQ) / Dukhan Bank</strong></div>
            <div>Account Name: <strong>${legalEntityEn}</strong></div>
            <div class="font-mono">IBAN: <strong>QA52 CBQA 0000 0000 1289 4012 34</strong></div>
            <div class="font-mono">SWIFT: <strong>CBQAQAQA</strong></div>
            <div style="margin-top: 3px; font-size: 7pt; color: #64748b; font-style: italic;">
              * Quote Customer ID <strong>${customer.customerId || customer.id}</strong> in all transfer remarks.
            </div>
          </div>
        </td>

        <!-- Right: Arabic Remittance & Signatures -->
        <td class="ar right-col">
          <div style="font-weight: 700; font-size: 8pt; color: #0f766e; margin-bottom: 3px;">
            <span>بـيـانـات الـتـحـويـل الـبـنـكـي والـسـداد</span>
          </div>
          <div style="font-size: 7.5pt; line-height: 1.45; color: #334155;">
            <div>البنك: <strong>البنك التجاري القطري (CBQ) / بنك دخان</strong></div>
            <div>اسم الحساب: <strong>شركة الأمين للعقارات ذ.م.م</strong></div>
            <div class="font-mono">الآيبان: <strong>QA52 CBQA 0000 0000 1289 4012 34</strong></div>
            <div class="font-mono">السويفت كود: <strong>CBQAQAQA</strong></div>
            <div style="margin-top: 3px; font-size: 7pt; color: #64748b; font-style: italic;">
              * يُرجى ذكر رمز العميل <strong>${customer.customerId || customer.id}</strong> في خانة تفاصيل التحويل.
            </div>
          </div>
        </td>
      </tr>

      <!-- Dual Authorization Stamps -->
      <tr style="border-top: 1px solid #e2e8f0;">
        <td class="en" style="padding-top: 10px;">
          <div style="font-size: 7.5pt; font-weight: 700; color: #475569;">For ${companyEn}</div>
          <div style="font-size: 7pt; color: #64748b;">Corporate Accounts &amp; Financial Oversight</div>
          <div class="stamp-box">
            [OFFICIAL FINANCE &amp; AUDIT STAMP]
          </div>
          <div style="font-size: 7pt; color: #64748b; margin-top: 4px;">Authorized Financial Controller</div>
        </td>
        <td class="ar right-col" style="padding-top: 10px;">
          <div style="font-size: 7.5pt; font-weight: 700; color: #475569;">عن شركة الأمين للعقارات</div>
          <div style="font-size: 7pt; color: #64748b;">إدارة الرقابة المالية والتحصيل</div>
          <div class="stamp-box">
            [خـتـم الإدارة الـمـالـيـة والـتـدقـيـق الـمـعـتـمـد]
          </div>
          <div style="font-size: 7pt; color: #64748b; margin-top: 4px;">المدير المالي والتحصيل المعتمد</div>
        </td>
      </tr>
    </table>

    <!-- Legal Page Footer -->
    <div class="page-legal-footer">
      <div class="en">
        This is an official computer-generated statement of account issued by <strong>${legalEntityEn}</strong> under Qatar electronic commerce law. Please report discrepancies within 15 days.
      </div>
      <div class="ar">
        كشف حساب رسمي صادر آلياً من <strong>شركة الأمين للعقارات ذ.م.م</strong> وفقاً للأنظمة واللوائح المعتمدة بدولة قطر. يُرجى مراجعة الحسابات خلال 15 يوماً في حال وجود أي ملاحظات.
      </div>
    </div>
  </div>

  <script>
    // Automatically trigger print on load
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 500);
    });
  </script>
</body>
</html>`;
}

export function printBilingualCustomerStatement(payload: BilingualStatementPayload): void {
  const html = generateBilingualStatementHtml(payload);
  const printWindow = window.open("", "_blank", "width=960,height=1000,menubar=no,toolbar=no,location=no,status=no");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    // Fallback if popup is blocked: use hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      window.setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }
  }
}
