/**
 * customer-statement-pdf.ts
 * Generates an authentic, multi-page, 2-column bilingual (English & Arabic)
 * Customer Statement of Account PDF/Print document for Al Ameen Real Estate.
 * 
 * Features:
 * - Page 1: 100% full edge-to-edge Al Ameen letterhead banner (uncropped)
 * - Page 2+: Compact header with official Al Ameen Golden Key Logo (Logo_Al Ameen.png)
 * - 2 columns throughout: English (LTR) on Left, Arabic (RTL) on Right
 * - Complete transaction ledger rows cleanly distributed across pages
 * - Balance Carried Forward and Balance Brought Forward on page transitions
 * - PDCs in vault, bank remittance details, and bilingual authentication stamps
 * - Rock-solid A4 print styling and pagination (page-break-after: always)
 */

import {
  AL_AMEEN_PAGE1_HEADER_BASE64,
  AL_AMEEN_PAGE2_PLUS_HEADER_BASE64,
} from "./header-banner-base64";

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

interface StatementPageChunk {
  pageNumber: number;
  totalPages: number;
  rows: BilingualStatementPayload["ledgerRows"];
  openingBalance: number;
  closingBalance: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  showPdcs: boolean;
  showFooterBlocks: boolean;
}

export function generateBilingualStatementHtml(payload: BilingualStatementPayload): string {
  const { customer, statementDate, fromDate, toDate, leases, summary, ledgerRows, upcomingPdcs = [], branding } = payload;
  const banner = branding?.headerImageUrl || AL_AMEEN_PAGE1_HEADER_BASE64;
  const logoP2 = AL_AMEEN_PAGE2_PLUS_HEADER_BASE64;
  const companyEn = branding?.companyName || "Al Ameen Real Estate";
  const legalEntityEn = branding?.legalEntityName || "Al Ameen Real Estate W.L.L";
  const cr = branding?.crNumber || "CR-90821-QA";
  const tax = branding?.taxNumber || "TAX-300912-QA";
  const phone = branding?.phone || "+974 4492 8800";
  const email = branding?.email || "finance@alameen.qa";
  const addressEn = branding?.address || "Grand Hamad Avenue, Building 42, Floor 7, Doha, State of Qatar";

  const totalPdcAmount = upcomingPdcs.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const effectiveClosing = summary.closingBalance - totalPdcAmount;

  // Multi-Page Chunking Algorithm
  const pages: StatementPageChunk[] = [];
  
  if (ledgerRows.length <= 6) {
    // Fits on a single comprehensive sheet
    pages.push({
      pageNumber: 1,
      totalPages: 1,
      rows: ledgerRows,
      openingBalance: summary.openingBalance,
      closingBalance: summary.closingBalance,
      isFirstPage: true,
      isLastPage: true,
      showPdcs: true,
      showFooterBlocks: true,
    });
  } else {
    // Page 1 takes the top dossier and first 7 rows
    const PAGE_1_ROWS = 7;
    const p1Rows = ledgerRows.slice(0, PAGE_1_ROWS);
    const p1Closing = p1Rows[p1Rows.length - 1]?.runningBalance ?? summary.openingBalance;

    pages.push({
      pageNumber: 1,
      totalPages: 1, // Will update below
      rows: p1Rows,
      openingBalance: summary.openingBalance,
      closingBalance: p1Closing,
      isFirstPage: true,
      isLastPage: false,
      showPdcs: false,
      showFooterBlocks: false,
    });

    let currentIdx = PAGE_1_ROWS;
    let pageNum = 2;

    while (currentIdx < ledgerRows.length) {
      const remainingCount = ledgerRows.length - currentIdx;
      // If remaining rows fit comfortably on final page with PDCs and footer (<= 14 rows)
      if (remainingCount <= 14) {
        const slice = ledgerRows.slice(currentIdx);
        const prevClosing = pages[pages.length - 1].closingBalance;
        const pageClosing = slice[slice.length - 1]?.runningBalance ?? prevClosing;
        pages.push({
          pageNumber: pageNum,
          totalPages: pageNum,
          rows: slice,
          openingBalance: prevClosing,
          closingBalance: pageClosing,
          isFirstPage: false,
          isLastPage: true,
          showPdcs: true,
          showFooterBlocks: true,
        });
        currentIdx += slice.length;
      } else {
        // Intermediate page: holds up to 18 rows
        const slice = ledgerRows.slice(currentIdx, currentIdx + 18);
        const prevClosing = pages[pages.length - 1].closingBalance;
        const pageClosing = slice[slice.length - 1]?.runningBalance ?? prevClosing;
        pages.push({
          pageNumber: pageNum,
          totalPages: pageNum,
          rows: slice,
          openingBalance: prevClosing,
          closingBalance: pageClosing,
          isFirstPage: false,
          isLastPage: false,
          showPdcs: false,
          showFooterBlocks: false,
        });
        currentIdx += slice.length;
        pageNum++;
      }
    }

    const totalPages = pages.length;
    pages.forEach(p => { p.totalPages = totalPages; });
  }

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
      margin: 8mm 10mm 10mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #e2e8f0;
      color: #0f172a;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 8.3pt;
      line-height: 1.32;
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

    /* Top Action Bar on Screen */
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

    /* Page Sheet (Each A4 Page) */
    .page-sheet {
      width: 210mm;
      max-width: 210mm;
      margin: 15px auto;
      background: #ffffff;
      padding: 10mm 12mm 10mm 12mm;
      border-radius: 6px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      min-height: 297mm;
    }
    .page-content-wrapper {
      flex: 1;
    }

    /* Page 1: Official Header Banner (Full Width, Uncropped) */
    .letterhead-banner {
      width: 100%;
      margin: 0 0 8px 0;
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

    /* Page 1: Bilingual Corporate Entity Header */
    .bilingual-header {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      border-bottom: 2px solid #0f766e;
      padding-bottom: 6px;
    }
    .bilingual-header td {
      vertical-align: top;
      padding: 1px 4px 4px 4px;
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
      font-size: 12.5pt;
      font-weight: 800;
      color: #0f766e;
      letter-spacing: -0.2px;
    }
    .company-title-ar {
      font-family: 'Cairo', sans-serif;
      font-size: 13pt;
      font-weight: 800;
      color: #0f766e;
    }
    .company-sub-en, .company-sub-ar {
      font-size: 7.5pt;
      color: #475569;
      margin-top: 1px;
    }

    /* Page 2+: Compact Header with Logo_Al Ameen.png */
    .page-header-secondary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 0 6px 0;
      border-bottom: 2px solid #0f766e;
      margin-bottom: 6px;
    }
    .sec-col-en {
      width: 36%;
      text-align: left;
    }
    .sec-logo-container {
      width: 28%;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .sec-logo-img {
      height: 48px;
      max-width: 100%;
      object-fit: contain;
      display: block;
    }
    .sec-col-ar {
      width: 36%;
      text-align: right;
      direction: rtl;
    }
    .sec-company-title {
      font-size: 11pt;
      font-weight: 800;
      color: #0f766e;
      line-height: 1.1;
    }
    .sec-company-title-ar {
      font-family: 'Cairo', sans-serif;
      font-size: 11.5pt;
      font-weight: 800;
      color: #0f766e;
      line-height: 1.1;
    }
    .sec-company-sub, .sec-company-sub-ar {
      font-size: 7.2pt;
      color: #475569;
      font-weight: 600;
      margin-top: 1px;
    }
    .sec-company-meta, .sec-company-meta-ar {
      font-size: 7pt;
      color: #334155;
      margin-top: 1px;
    }

    /* Secondary Header Subbar */
    .sec-subbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f0fdfa;
      border: 1px solid #ccfbf1;
      border-radius: 3px;
      padding: 3px 8px;
      font-size: 7.2pt;
      font-weight: 700;
      color: #0f766e;
      margin-bottom: 8px;
    }
    .sec-badge {
      font-size: 7.5pt;
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    /* Document Title Badge (Page 1) */
    .document-title-badge {
      text-align: center;
      background: #f0fdfa;
      border: 1px solid #ccfbf1;
      border-radius: 4px;
      padding: 5px 8px;
      margin-bottom: 8px;
    }
    .doc-main-title {
      font-size: 11.5pt;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #0f766e;
    }
    .doc-sub-meta {
      font-size: 7.2pt;
      color: #475569;
      margin-top: 2px;
    }

    /* 2-Column Customer Dossier Table */
    .two-col-grid {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      margin-bottom: 8px;
      background: #ffffff;
    }
    .two-col-grid td {
      width: 50%;
      vertical-align: top;
      padding: 5px 8px;
    }
    .two-col-grid td.left-border {
      border-left: 1px solid #e2e8f0;
    }
    .info-heading {
      font-size: 7.8pt;
      font-weight: 800;
      color: #0f766e;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 2px;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
    }
    .info-line {
      display: flex;
      justify-content: space-between;
      padding: 1.5px 0;
      font-size: 7.2pt;
      border-bottom: 1px dashed #f1f5f9;
    }
    .info-label {
      color: #64748b;
      font-weight: 600;
    }
    .info-value {
      font-weight: 600;
      color: #0f172a;
    }

    /* Leased Premises Container */
    .leased-premises-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 4px 8px;
      margin-bottom: 8px;
    }
    .leased-premises-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 2px;
      margin-bottom: 3px;
      font-size: 7.2pt;
      font-weight: 800;
      color: #0f766e;
    }
    .leased-premises-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .premise-tag {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 3px;
      padding: 2px 6px;
      font-size: 6.8pt;
    }

    /* 4 Bilingual Metrics Cards */
    .metrics-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 5px;
      margin-bottom: 8px;
    }
    .metric-cell {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 4px 6px;
      text-align: center;
      width: 25%;
    }
    .metric-cell.highlight {
      background: #f0fdfa;
      border-color: #0f766e;
    }
    .metric-cell.danger {
      background: #fef2f2;
      border-color: #ef4444;
    }
    .metric-title-en {
      font-size: 6.5pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .metric-title-ar {
      font-family: 'Cairo', sans-serif;
      font-size: 6.8pt;
      font-weight: 700;
      color: #64748b;
    }
    .metric-amount {
      font-family: monospace;
      font-size: 8.8pt;
      font-weight: 800;
      color: #0f172a;
      margin-top: 1px;
    }
    .metric-amount.credit { color: #059669; }
    .metric-amount.due { color: #b91c1c; }

    /* Ledger Table */
    .ledger-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
    }
    .ledger-table th {
      background: #0f766e;
      color: #ffffff;
      padding: 3.5px 5px;
      font-size: 6.8pt;
      font-weight: 700;
      border: 1px solid #0d9488;
      text-align: left;
      vertical-align: middle;
      line-height: 1.15;
    }
    .ledger-table th .th-ar {
      display: block;
      font-family: 'Cairo', sans-serif;
      font-size: 6.3pt;
      font-weight: 600;
      direction: rtl;
      opacity: 0.95;
    }
    .ledger-table td {
      padding: 3px 5px;
      font-size: 6.8pt;
      border: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    .ledger-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .ledger-table .right { text-align: right; }
    .ledger-table .center { text-align: center; }
    .ledger-table .total-row {
      background: #f1f5f9;
      font-weight: 800;
      border-top: 2px solid #0f766e;
    }
    .ledger-table .carry-row {
      background: #f0fdfa;
      font-weight: 700;
      border-top: 1.5px solid #0f766e;
      color: #0f766e;
    }

    .badge-status {
      display: inline-block;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 6pt;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-paid { background: #dcfce7; color: #166534; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-cleared { background: #e0e7ff; color: #3730a3; }

    /* PDCs Box */
    .pdc-section {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 4px 6px;
      margin-bottom: 6px;
      background: #ffffff;
    }
    .pdc-title {
      font-size: 7.2pt;
      font-weight: 800;
      color: #0f766e;
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }
    .pdc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 6.5pt;
    }
    .pdc-table th {
      background: #f1f5f9;
      color: #475569;
      padding: 2px 4px;
      border: 1px solid #e2e8f0;
    }
    .pdc-table td {
      padding: 2px 4px;
      border: 1px solid #e2e8f0;
    }

    /* Remittance & Signatures Table */
    .footer-blocks {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      background: #ffffff;
    }
    .footer-blocks td {
      width: 50%;
      padding: 6px 8px;
      vertical-align: top;
    }
    .footer-blocks td.right-col {
      border-left: 1px solid #e2e8f0;
    }
    .stamp-box {
      border: 1px dashed #94a3b8;
      border-radius: 3px;
      padding: 4px;
      text-align: center;
      color: #64748b;
      font-family: monospace;
      font-size: 6.5pt;
      margin-top: 4px;
      background: #f8fafc;
    }

    /* Page Footer */
    .page-legal-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 4px;
      margin-top: 6px;
      font-size: 6.5pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Print Overrides */
    @media print {
      html, body {
        background: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
      }
      .screen-action-bar {
        display: none !important;
      }
      .page-sheet {
        margin: 0 !important;
        padding: 6mm 8mm 8mm 8mm !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
        min-height: 290mm !important;
        page-break-after: always !important;
        break-after: page !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .page-sheet:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
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
      <span style="margin-left: 14px; font-size: 12px; opacity: 0.8;">Customer: ${customer.name} | Total Pages: ${pages.length}</span>
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
        Print / Save as PDF (A4)
      </button>
      <button class="close-btn" onclick="window.close()">Close</button>
    </div>
  </div>

  <!-- Render Every Page Sheet -->
  ${pages.map(page => `
    <div class="page-sheet">
      <div class="page-content-wrapper">
        ${page.isFirstPage ? `
          <!-- ================= PAGE 1 HEADER ================= -->
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
                  <span style="font-size: 6.8pt; color: #64748b;">PARTICULARS</span>
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
                  <span style="font-size: 6.8pt; color: #64748b;">بيانات السجل</span>
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
              <td class="en" colspan="2" style="padding: 4px 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-bottom: 3px;">
                  <span style="font-size: 7.2pt; font-weight: 700; color: #0f766e;">ASSIGNED LEASED UNITS &amp; PREMISES</span>
                  <span class="ar" style="font-size: 7.2pt; font-weight: 700; color: #0f766e;">الوحدات والعقارات المؤجرة المسجلة للعميل</span>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${leases.length > 0 ? leases.map(l => `
                    <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 2px 6px; font-size: 6.8pt;">
                      <strong>${l.property}</strong> &bull; Unit: <span class="font-mono" style="color: #0f766e; font-weight: 700;">${l.unit}</span>
                      <span style="color: #64748b;">(Contract #${l.contractNumber || '—'} &bull; Rent: QAR ${Number(l.monthlyRent).toLocaleString()}/mo)</span>
                    </div>
                  `).join('') : '<span style="font-size: 6.8pt; color: #64748b; font-style: italic;">No active lease contracts directly linked.</span>'}
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
        ` : `
          <!-- ================= PAGE 2+ HEADER (Logo_Al Ameen.png) ================= -->
          <div class="page-header-secondary">
            <!-- Left: English Corporate Info -->
            <div class="sec-col-en en">
              <div class="sec-company-title">AL AMEEN REAL ESTATE</div>
              <div class="sec-company-sub">Statement of Account &bull; Client Dossier</div>
              <div class="sec-company-meta">Client: <strong>${customer.name}</strong> (${customer.customerId || customer.id})</div>
            </div>

            <!-- Center: Official Al Ameen Logo (Logo_Al Ameen.png) -->
            <div class="sec-logo-container">
              <img src="${logoP2}" alt="Al Ameen Real Estate" class="sec-logo-img" />
            </div>

            <!-- Right: Arabic Corporate Info -->
            <div class="sec-col-ar ar" dir="rtl">
              <div class="sec-company-title-ar">شركة الأمين للعقارات</div>
              <div class="sec-company-sub-ar">كشف حساب العميل &bull; قسم التحصيل المالي</div>
              <div class="sec-company-meta-ar">التاريخ: <strong>${statementDate}</strong> &bull; الفترة: ${fromDate} إلى ${toDate}</div>
            </div>
          </div>

          <!-- Secondary Subbar -->
          <div class="sec-subbar">
            <span class="en">Statement Ref: <strong>${customer.customerId || customer.id}</strong></span>
            <span class="sec-badge">CONTINUED STATEMENT OF ACCOUNT &bull; كشف حساب العميل (تــابـــع)</span>
            <span class="ar">صفحة <strong>${page.pageNumber}</strong> من <strong>${page.totalPages}</strong></span>
          </div>
        `}

        <!-- Ledger Table for this Page -->
        <table class="ledger-table">
          <thead>
            <tr>
              <th style="width: 70px;">
                Date
                <span class="th-ar">التاريخ</span>
              </th>
              <th style="width: 78px;">
                Doc Type
                <span class="th-ar">نوع السند</span>
              </th>
              <th style="width: 85px;">
                Ref Number
                <span class="th-ar">رقم المرجع</span>
              </th>
              <th>
                Description / Particulars
                <span class="th-ar">البيان والتفاصيل</span>
              </th>
              <th style="width: 105px;">
                Premise / Unit
                <span class="th-ar">العقار / الوحدة</span>
              </th>
              <th class="right" style="width: 75px;">
                Debit (QAR)
                <span class="th-ar">مدين (ر.ق)</span>
              </th>
              <th class="right" style="width: 75px;">
                Credit (QAR)
                <span class="th-ar">دائن (ر.ق)</span>
              </th>
              <th class="right" style="width: 82px;">
                Balance (QAR)
                <span class="th-ar">الرصيد (ر.ق)</span>
              </th>
              <th class="center" style="width: 52px;">
                Status
                <span class="th-ar">الحالة</span>
              </th>
            </tr>
          </thead>
          <tbody>
            ${page.isFirstPage ? `
              <!-- Opening Balance Line on Page 1 -->
              <tr style="background: #f1f5f9; font-weight: 600;">
                <td class="font-mono">${fromDate}</td>
                <td><span style="font-size: 6.8pt; font-weight: 700; color: #475569;">BWD / افتتاح</span></td>
                <td class="font-mono">—</td>
                <td>Balance Brought Forward from Previous Period / رصيد مرحل من الفترة السابقة</td>
                <td>—</td>
                <td class="right font-mono">—</td>
                <td class="right font-mono">—</td>
                <td class="right font-mono" style="font-weight: 700;">${summary.openingBalance.toFixed(2)}</td>
                <td class="center"><span class="badge-status badge-paid">Brought</span></td>
              </tr>
            ` : `
              <!-- Balance Brought Forward on Subsequent Pages -->
              <tr class="carry-row">
                <td class="font-mono">${fromDate}</td>
                <td><span style="font-size: 6.8pt; font-weight: 700;">FWD / منقول</span></td>
                <td class="font-mono">—</td>
                <td><strong>Balance Brought Forward from Page ${page.pageNumber - 1} / رصيد منقول من الصفحة السابقة</strong></td>
                <td>—</td>
                <td class="right font-mono">—</td>
                <td class="right font-mono">—</td>
                <td class="right font-mono" style="font-weight: 800;">${page.openingBalance.toFixed(2)}</td>
                <td class="center"><span class="badge-status badge-cleared">Page ${page.pageNumber - 1}</span></td>
              </tr>
            `}

            <!-- Rows on this page -->
            ${page.rows.map(row => {
              const t = translateDocType(row.docType);
              const isDebit = row.debit > 0;
              const isCredit = row.credit > 0;
              return `<tr>
                <td class="font-mono">${row.date}</td>
                <td>
                  <div style="font-weight: 700; color: #0f766e; font-size: 6.8pt;">${t.en}</div>
                  <div class="ar" style="font-size: 6.3pt; color: #64748b;">${t.ar}</div>
                </td>
                <td class="font-mono" style="font-weight: 600;">${row.refNo}</td>
                <td>${row.description}</td>
                <td style="font-size: 6.8pt; color: #475569;">${row.property} - <strong>${row.unit}</strong></td>
                <td class="right font-mono" style="font-weight: ${isDebit ? '700' : '400'}; color: ${isDebit ? '#0f172a' : '#94a3b8'};">
                  ${isDebit ? row.debit.toFixed(2) : '—'}
                </td>
                <td class="right font-mono" style="font-weight: ${isCredit ? '700' : '400'}; color: ${isCredit ? '#059669' : '#94a3b8'};">
                  ${isCredit ? row.credit.toFixed(2) : '—'}
                </td>
                <td class="right font-mono" style="font-weight: 700; color: ${row.runningBalance > 0 ? '#b91c1c' : '#0f172a'};">
                  ${row.runningBalance.toFixed(2)}
                </td>
                <td class="center">
                  <span class="badge-status ${row.status === 'Paid' || row.status === 'Settled' ? 'badge-paid' : row.status === 'Cleared' ? 'badge-cleared' : 'badge-pending'}">
                    ${row.status}
                  </span>
                </td>
              </tr>`;
            }).join('')}

            ${page.isLastPage ? `
              <!-- Final Total Closing Row -->
              <tr class="total-row">
                <td colspan="5" style="text-align: right; padding-right: 10px;">
                  <span>TOTALS &amp; CLOSING LEDGER BALANCE / الإجمالي والرصيد الختامي المستحق:</span>
                </td>
                <td class="right font-mono">${summary.totalDebits.toFixed(2)}</td>
                <td class="right font-mono" style="color: #059669;">${summary.totalCredits.toFixed(2)}</td>
                <td class="right font-mono" style="color: #b91c1c; font-size: 8.8pt;">${summary.closingBalance.toFixed(2)}</td>
                <td class="center font-mono" style="font-size: 6.8pt; font-weight: 700;">QAR</td>
              </tr>
            ` : `
              <!-- Carry Forward Row to Next Page -->
              <tr class="carry-row">
                <td colspan="5" style="text-align: right; padding-right: 10px;">
                  <span>BALANCE CARRIED FORWARD TO PAGE ${page.pageNumber + 1} / الرصيد المنقول للصفحة التالية:</span>
                </td>
                <td class="right font-mono">—</td>
                <td class="right font-mono">—</td>
                <td class="right font-mono" style="font-weight: 800; font-size: 8.5pt;">${page.closingBalance.toFixed(2)}</td>
                <td class="center"><span class="badge-status badge-cleared">&rarr; P.${page.pageNumber + 1}</span></td>
              </tr>
            `}
          </tbody>
        </table>

        <!-- PDCs Section (on last page) -->
        ${page.showPdcs && upcomingPdcs.length > 0 ? `
          <div class="pdc-section">
            <div class="pdc-title">
              <span>POST-DATED CHEQUES (PDC) CURRENTLY IN VAULT (${upcomingPdcs.length} cheques)</span>
              <span class="ar">شيكات مؤجلة مودعة في الخزينة قيد التحصيل (${upcomingPdcs.length} شيك)</span>
            </div>
            <table class="pdc-table">
              <thead>
                <tr>
                  <th style="width: 100px;">Cheque # / رقم الشيك</th>
                  <th>Drawee Bank / البنك المسحوب عليه</th>
                  <th style="width: 110px;">Due Date / تاريخ الاستحقاق</th>
                  <th class="right" style="width: 110px;">Amount (QAR) / المبلغ</th>
                  <th class="center" style="width: 80px;">Status / الحالة</th>
                </tr>
              </thead>
              <tbody>
                ${upcomingPdcs.map(p => `
                  <tr>
                    <td class="font-mono" style="font-weight: 700;">${p.chequeNumber}</td>
                    <td>${p.bank || 'Qatar National Bank (QNB)'}</td>
                    <td class="font-mono">${p.dueDate}</td>
                    <td class="right font-mono" style="font-weight: 700;">${Number(p.amount).toFixed(2)}</td>
                    <td class="center"><span class="badge-status badge-pending">In Vault</span></td>
                  </tr>
                `).join('')}
                <tr style="background: #f8fafc; font-weight: 700;">
                  <td colspan="3" style="text-align: right; padding-right: 8px;">
                    Total In-Hand PDCs / إجمالي الشيكات المؤجلة:
                  </td>
                  <td class="right font-mono" style="color: #0f766e;">QAR ${totalPdcAmount.toFixed(2)}</td>
                  <td class="center font-mono" style="font-size: 6.2pt;">PROJECTED: QAR ${effectiveClosing.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ` : ''}

        <!-- Remittance & Signatures Table (on last page) -->
        ${page.showFooterBlocks ? `
          <table class="footer-blocks">
            <tr>
              <!-- English Remittance Details -->
              <td class="en">
                <div style="font-size: 7.2pt; font-weight: 800; color: #0f766e; margin-bottom: 3px;">
                  REMITTANCE &amp; BANK SETTLEMENT PARTICULARS
                </div>
                <div style="font-size: 6.8pt; color: #334155; line-height: 1.35;">
                  <div>Beneficiary: <strong>${legalEntityEn}</strong></div>
                  <div>Bank: <strong>Commercial Bank of Qatar (CBQ) / Dukhan Bank</strong></div>
                  <div class="font-mono">IBAN: <strong>QA52 CBQA 0000 0000 1289 4012 34</strong></div>
                  <div class="font-mono">SWIFT: <strong>CBQAQAQA</strong> &bull; Currency: <strong>QAR</strong></div>
                  <div style="margin-top: 3px; color: #64748b;">* Please quote Customer Code (${customer.customerId || customer.id}) as payment reference.</div>
                </div>
                <div style="margin-top: 5px;">
                  <div style="font-size: 6.5pt; font-weight: 700; color: #475569;">PREPARED BY / FINANCE CONTROLLER</div>
                  <div class="stamp-box">
                    <div>AL AMEEN REAL ESTATE W.L.L</div>
                    <div>ACCOUNTS RECEIVABLE AUDIT &bull; DOHA-QATAR</div>
                  </div>
                </div>
              </td>

              <!-- Arabic Remittance Details -->
              <td class="ar right-col" dir="rtl">
                <div style="font-size: 7.2pt; font-weight: 800; color: #0f766e; margin-bottom: 3px;">
                  تـعـلـيـمـات الـتـحـويـل الـبـنـكـي والـسـداد
                </div>
                <div style="font-size: 6.8pt; color: #334155; line-height: 1.35;">
                  <div>المستفيد: <strong>شركة الأمين للعقارات ذ.م.م</strong></div>
                  <div>البنك: <strong>البنك التجاري (CBQ) / بنك دخان</strong></div>
                  <div class="font-mono">الآيبان: <strong>QA52 CBQA 0000 0000 1289 4012 34</strong></div>
                  <div class="font-mono">سويفت: <strong>CBQAQAQA</strong> &bull; العملة: <strong>ريال قطري</strong></div>
                  <div style="margin-top: 3px; color: #64748b;">* يرجى تدوين رمز العميل (${customer.customerId || customer.id}) في إشعار التحويل البنكي.</div>
                </div>
                <div style="margin-top: 5px;">
                  <div style="font-size: 6.5pt; font-weight: 700; color: #475569;">اعـتـمـاد الإدارة الـمـالـيـة والـتـدقـيـق</div>
                  <div class="stamp-box">
                    <div>شركة الأمين للعقارات ذ.م.م</div>
                    <div>ختم الاعتماد والتدقيق المالي &bull; الدوحة - قطر</div>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        ` : ''}
      </div>

      <!-- Legal Page Footer -->
      <div class="page-legal-footer">
        <div class="en">
          ${legalEntityEn} &bull; Customer Statement Ref: <strong class="font-mono">${customer.customerId || customer.id}</strong>
        </div>
        <div style="font-weight: 700; font-size: 7pt; color: #0f766e;">
          Page ${page.pageNumber} of ${page.totalPages} &bull; صفحة ${page.pageNumber} من ${page.totalPages}
        </div>
        <div class="ar" dir="rtl">
          شركة الأمين للعقارات ذ.م.م &bull; كشف حساب رسمي صادر إلكترونياً
        </div>
      </div>
    </div>
  `).join('')}

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
