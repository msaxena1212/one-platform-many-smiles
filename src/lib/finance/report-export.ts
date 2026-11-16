/**
 * Excel export for the finance reports. Each report is built from the same figures the screen shows, and dates are
 * written as dd-mm-yyyy.
 */
import * as XLSX from "xlsx";
import { formatDDMMYYYYHyphen } from "@/lib/date-utils";

export type ExportableReport = "trial_balance" | "profit_and_loss" | "balance_sheet" | "general_ledger";

type LedgerLine = {
  date: string;
  reference: string;
  account_code: string;
  account_name: string;
  account_type: string;
  property_name?: string;
  unit_ref?: string;
  tenant_name?: string;
  debit: number;
  credit: number;
  description: string;
};

type TrialRow = { code: string; name: string; type: string; debit: number; credit: number };

export type ReportData = {
  trialBalance: TrialRow[];
  profitAndLoss: Record<string, number>;
  balanceSheet: Record<string, number>;
  ledger: LedgerLine[];
};

const money = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

function sheetFromRows(rows: (string | number)[][]): XLSX.WorkSheet {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = rows[0]?.map((_, i) => ({ wch: i === 0 ? 14 : i === 1 ? 40 : 18 })) ?? [];
  return ws;
}

function trialBalanceSheet(data: ReportData): XLSX.WorkSheet {
  const rows: (string | number)[][] = [["Code", "Account", "Type", "Debit (QAR)", "Credit (QAR)", "Net (QAR)"]];
  let dr = 0, cr = 0;
  for (const a of data.trialBalance) {
    dr += a.debit; cr += a.credit;
    rows.push([a.code, a.name, a.type, money(a.debit), money(a.credit), money(a.debit - a.credit)]);
  }
  rows.push(["", "TOTAL", "", money(dr), money(cr), money(dr - cr)]);
  return sheetFromRows(rows);
}

function profitAndLossSheet(data: ReportData, ledger: LedgerLine[]): XLSX.WorkSheet {
  const p = data.profitAndLoss;
  const rows: (string | number)[][] = [
    ["Line", "Amount (QAR)"],
    ["Rental revenue", money(p.rentalRevenue)],
    ["Other revenue", money(p.otherRevenue)],
    ["Total revenue", money(p.totalRevenue)],
    ["Maintenance", money(p.maintenanceExpense)],
    ["Payroll", money(p.payrollExpense)],
    ["Utilities", money(p.utilitiesExpense)],
    ["Cleaning", money(p.cleaningExpense)],
    ["Total expenses", money(p.totalExpenses)],
    ["Net profit / (loss)", money(p.netProfit)],
  ];
  return sheetFromRows(rows);
}

function propertyPnlSheet(ledger: LedgerLine[]): XLSX.WorkSheet {
  const byProp = new Map<string, { revenue: number; expense: number }>();
  for (const l of ledger) {
    const key = l.property_name || "Corporate Office / Head Office";
    const cur = byProp.get(key) || { revenue: 0, expense: 0 };
    if (l.account_type === "Revenue") cur.revenue += l.credit - l.debit;
    if (l.account_type === "Expenses") cur.expense += l.debit - l.credit;
    byProp.set(key, cur);
  }
  const rows: (string | number)[][] = [["Property", "Revenue (QAR)", "Expenses (QAR)", "Net (QAR)"]];
  for (const [name, v] of [...byProp.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    rows.push([name, money(v.revenue), money(v.expense), money(v.revenue - v.expense)]);
  }
  return sheetFromRows(rows);
}

function balanceSheetSheet(data: ReportData): XLSX.WorkSheet {
  const b = data.balanceSheet;
  const rows: (string | number)[][] = [
    ["Line", "Amount (QAR)"],
    ["Bank and cash", money(b.bankCashAssets)],
    ["PDC in hand", money(b.pdcInHandAssets)],
    ["Tenant receivables", money(b.arReceivablesAssets)],
    ["Legal receivables", money(b.legalReceivablesAssets)],
    ["Fixed assets", money(b.fixedAssets)],
    ["Total assets", money(b.totalAssets)],
    ["Accounts payable", money(b.apLiabilities)],
    ["Security deposit liabilities", money(b.securityDepositLiabilities)],
    ["Customer PDC liabilities", money(b.pdcCustomerLiabilities)],
    ["Total liabilities", money(b.totalLiabilities)],
    ["Owner capital", money(b.ownerCapital)],
    ["Retained net profit", money(b.retainedNetProfit)],
    ["Total equity", money(b.totalEquity)],
    ["Total liabilities and equity", money(b.totalLiabilitiesAndEquity)],
  ];
  return sheetFromRows(rows);
}

function ledgerSheet(ledger: LedgerLine[]): XLSX.WorkSheet {
  const rows: (string | number)[][] = [["Date", "Reference", "Account code", "Account", "Property", "Unit", "Tenant", "Debit (QAR)", "Credit (QAR)", "Description"]];
  for (const l of ledger) {
    rows.push([
      formatDDMMYYYYHyphen(l.date), l.reference, l.account_code, l.account_name,
      l.property_name || "", l.unit_ref || "", l.tenant_name || "",
      money(l.debit), money(l.credit), l.description,
    ]);
  }
  return sheetFromRows(rows);
}

const TITLES: Record<ExportableReport, string> = {
  trial_balance: "Trial Balance",
  profit_and_loss: "Profit and Loss",
  balance_sheet: "Balance Sheet",
  general_ledger: "General Ledger",
};

/** Build the workbook for a report and download it. */
export function exportFinanceReport(report: ExportableReport, data: ReportData): void {
  const wb = XLSX.utils.book_new();
  if (report === "trial_balance") {
    XLSX.utils.book_append_sheet(wb, trialBalanceSheet(data), "Trial Balance");
  } else if (report === "profit_and_loss") {
    XLSX.utils.book_append_sheet(wb, profitAndLossSheet(data, data.ledger), "Profit and Loss");
    XLSX.utils.book_append_sheet(wb, propertyPnlSheet(data.ledger), "By property");
  } else if (report === "balance_sheet") {
    XLSX.utils.book_append_sheet(wb, balanceSheetSheet(data), "Balance Sheet");
  } else {
    XLSX.utils.book_append_sheet(wb, ledgerSheet(data.ledger), "General Ledger");
  }
  const stamp = formatDDMMYYYYHyphen(new Date().toISOString().slice(0, 10)).replace(/-/g, "");
  XLSX.writeFile(wb, `${TITLES[report].replace(/\s+/g, "-")}-${stamp}.xlsx`);
}
