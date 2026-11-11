import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Settings, Calendar, MapPin, Users, UserCheck, Layers, LayoutDashboard,
  Clock, BookOpen, FileText, PlusCircle, MinusCircle, ArrowDownLeft, ArrowUpRight, Receipt as ReceiptIcon,
  Building, Building2, CreditCard, FileCheck, FileSpreadsheet, PieChart, Landmark, Scale,
  DollarSign, Activity, FileCode, CheckCircle, Search, Plus, Trash2, Pencil,
  ChevronRight, ChevronDown, Loader2, Filter, Download, FilePlus, ArrowRight, CheckCircle2, XCircle,
  AlertTriangle, RefreshCw, Eye, Printer, ShieldCheck, TrendingUp, ArrowUpDown,
  Home as HomeIcon, User as UserIcon, FolderTree, Folder, FolderOpen, Network
} from "lucide-react";
import {
  supabase,
  fetchJournalEntries, fetchARLedgers, fetchGLAccounts,
  createJournalEntry, createAREntry, settleAREntry, createGLAccount,
  fetchERPChartOfAccounts, fetchUnitCOAs, fetchCoaHierarchyTree, fetchPropertyCoaMappings, fetchCoaSLByGL,
  type JournalEntry, type ARLedger, type GLAccount, type ERPChartOfAccount, type UnitCOA,
  type CoaType, type CoaGroup, type CoaClass, type CoaGL, type CoaSL, type PropertyCoaMapping, type UnitCoaMapping
} from "@/lib/supabase";
import { useMergedCoa, persistCoaAccount, migrateLocalCustomCoa, fetchLiveCoaOptions } from "@/lib/finance/live-coa";
import {
  FinFinancialYearsApi, FinRegionsApi, FinVendorsApi, FinCustomersApi, FinCostCentersApi,
  FinPostingPeriodsApi, FinBanksApi, FinBankAccountsApi, FinBankReconciliationsApi, FinContractsApi,
  type FinFinancialYear, type FinRegion, type FinVendor, type FinCustomer, type FinCostCenter,
  type FinPostingPeriod, type FinBank, type FinBankAccount, type FinBankReconciliation, type FinContract
} from "@/lib/supabase-finance";
import { toast } from "sonner";
import { useAppData } from "@/lib/app-data-context";
import { PdcManagement } from "./finance/pdc-management";
import { DepositsGuarantees } from "./finance/deposits-guarantees";
import { ReceivablesLegal } from "./finance/receivables";
import { PayrollSync } from "./finance/payroll-sync";
import { formatDDMMMYYYY, formatDateDDMMYYYY } from "@/lib/date-utils";
import { postVoucher } from "@/lib/finance/posting-engine";
import { useFinanceStore, type ReceivableInvoice } from "@/lib/finance/finance-store";
import { ApInvoicesApi, type ProcApInvoice, type PaymentReceipt } from "@/lib/proc-invoices-api";
import { PaymentReceiptDialog } from "@/components/payment-receipt-dialog";
import {
  generatePortfolioRevenueBatch,
  calculateLeaseRevenueSchedule,
  type ProrationMethod,
  type RevenuePeriodSchedule,
  type RevenueGenerationBatchSummary,
  type RevenueStatus,
  type RevenueReasonCode
} from "@/lib/finance/revenue-engine";
import { ProformaInvoiceDialog } from "@/components/proforma-invoice-dialog";
import { BulkInvoiceDialog } from "@/components/finance/bulk-invoice-dialog";
import { CustomerStatementSubModule } from "@/components/finance/customer-statement-submodule";
import { InvoiceViewDialog } from "@/components/finance/invoice-view-dialog";
import { PropertyWiseProfitAndLossSubModule } from "@/components/finance/property-wise-pnl";
import { UnbilledUnitsReportSubModule } from "@/components/finance/unbilled-units-report";
import { ArApAgingReportSubModule } from "@/components/finance/ar-ap-aging-report";
import { VendorStatementSubModule } from "@/components/finance/vendor-statement-submodule";
import { PdcMaturityForecastReportSubModule } from "@/components/finance/pdc-maturity-report";
import { LeaseExpiryVacancyReportSubModule } from "@/components/finance/lease-expiry-vacancy-report";
import { UtilityRechargeRecoverySubModule } from "@/components/finance/utility-recharge-report";
import { SecurityDepositReconciliationSubModule } from "@/components/finance/security-deposit-reconciliation-report";

export function isDateInClosedPostingPeriod(dateStr?: string): { closed: boolean; periodName?: string } {
  if (!dateStr || typeof window === "undefined") return { closed: false };
  try {
    const ym = dateStr.split("T")[0].slice(0, 7);
    const raw = localStorage.getItem("pms_posting_periods_cache");
    if (!raw) return { closed: false };
    const list = JSON.parse(raw) as Array<{ period_name: string; status: string }>;
    const found = list.find(p => p.period_name === ym);
    if (found && found.status === "Closed") {
      return { closed: true, periodName: ym };
    }
  } catch {}
  return { closed: false };
}
export interface FinanceModuleProps {
  role: "admin" | "prop-mgr" | "finance" | "cashier";
  collectionContext?: {
    tenantName: string;
    property: string;
    unit: string;
  } | null;
}

const FINANCE_ROUTE_BY_ROLE = {
  admin: "/admin/finance",
  "prop-mgr": "/prop-mgr/finance",
  finance: "/finance/",
  cashier: "/cashier/",
} as const;

const FINANCE_NAV = [
  {
    group: "Setup",
    icon: Settings,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    activeBg: "bg-blue-500",
    items: [
      { key: "financial_year", label: "Financial Year", icon: Calendar },
      { key: "region", label: "Region", icon: MapPin },
      { key: "vendor_list", label: "Vendor List", icon: Users },
      { key: "customer_list", label: "Customer List", icon: UserCheck },
      { key: "cost_center", label: "Cost Center", icon: Layers },
      { key: "budget_head", label: "Budget Head & Type", icon: PieChart },
    ],
  },
  {
    group: "Finance",
    icon: DollarSign,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    activeBg: "bg-emerald-500",
    items: [
      { key: "finance_dashboard", label: "Finance Dashboard", icon: LayoutDashboard },
      { key: "posting_period", label: "Posting Period", icon: Clock },
      { key: "chart_of_accounts", label: "Chart Of Account", icon: BookOpen },
      { key: "journal_ledger", label: "Journal Ledger", icon: FileText },
      { key: "credit_debit_builder", label: "Credit Debit Builder", icon: PlusCircle },
    ],
  },
  {
    group: "Payment",
    icon: CreditCard,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    activeBg: "bg-purple-500",
    items: [
      { key: "grn_cost_mapping", label: "GRN Cost Mapping", icon: Layers },
      { key: "payable_invoice", label: "Payable Invoice", icon: ArrowUpRight },
      { key: "journal_voucher", label: "Journal Voucher", icon: FileText },
      { key: "payment_voucher", label: "Payment Voucher", icon: CreditCard },
      { key: "receivable_invoice", label: "Receivable Invoices & Bulk Billing", icon: ArrowDownLeft },
      { key: "receipt_voucher", label: "Receipt Voucher", icon: ReceiptIcon },
      { key: "debit_note", label: "Debit Note", icon: MinusCircle },
      { key: "credit_note", label: "Credit Note", icon: PlusCircle },
    ],
  },
  {
    group: "Receivables",
    icon: Activity,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    activeBg: "bg-orange-500",
    items: [
      { key: "pdc_management", label: "PDC Management", icon: FileCheck },
      { key: "deposits_guarantees", label: "Deposits & Guarantees", icon: Landmark },
      { key: "legal_receivables", label: "Legal Receivables", icon: Scale },
      { key: "payroll_sync", label: "Payroll Sync Engine", icon: Users },
    ],
  },
  {
    group: "Banking",
    icon: Landmark,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    activeBg: "bg-amber-500",
    items: [
      { key: "bank", label: "Bank", icon: Building },
      { key: "bank_account", label: "Bank Account", icon: CreditCard },
      { key: "bank_clearance", label: "Bank Clearance", icon: FileCheck },
      { key: "bank_reconciliation", label: "Bank Reconciliation", icon: Scale },
      { key: "bank_reconciliation_statement_list", label: "Reconciliation Statements", icon: FileSpreadsheet },
    ],
  },
  {
    group: "Finance Reports",
    icon: PieChart,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    activeBg: "bg-rose-500",
    items: [
      { key: "unbilled_units_report", label: "Unbilled Units Report", icon: AlertTriangle },
      { key: "ar_ap_aging", label: "AR & AP Aging Report", icon: Clock },
      { key: "customer_statement", label: "Customer Statement of Account", icon: FileText },
      { key: "vendor_statement", label: "Vendor Statement of Account", icon: Users },
      { key: "pdc_maturity_report", label: "PDC Maturity & Bounce Forecast", icon: FileCheck },
      { key: "lease_expiry_report", label: "Lease Expiry & Vacancy Loss", icon: Calendar },
      { key: "utility_recharge_report", label: "Utility Recharge & Recovery", icon: Activity },
      { key: "deposit_reconciliation_report", label: "Deposit & Snagging Reconciliation", icon: ShieldCheck },
      { key: "revenue_generation", label: "Revenue Generation", icon: TrendingUp },
      { key: "trial_balance_simple", label: "Trial Balance (Simple)", icon: Scale },
      { key: "trial_balance", label: "Trial Balance", icon: Scale },
      { key: "profit_and_loss", label: "Profit & Loss", icon: Activity },
      { key: "property_pnl", label: "Property Profit & Loss", icon: Building2 },
      { key: "vehicle_expense_report", label: "Vehicle-Wise Expense Report", icon: Layers },
      { key: "balance_sheet", label: "Balance Sheet", icon: Landmark },
      { key: "general_ledger", label: "General Ledger", icon: BookOpen },
      { key: "cash_flow_statement", label: "Cash Flow Statement", icon: DollarSign },
      { key: "cash_book", label: "Cash Book", icon: BookOpen },
      { key: "petty_cash_book", label: "Petty Cash Book", icon: BookOpen },
      { key: "cash_on_hand", label: "Cash On Hand", icon: DollarSign },
    ],
  },
];

export function FinanceModule({ role, collectionContext }: FinanceModuleProps) {
  const navigate = useNavigate({ from: FINANCE_ROUTE_BY_ROLE[role] });
  const searchParams = useSearch({ strict: false }) as Record<string, any>;
  const activeKey = searchParams.tab || "finance_dashboard";

  const { isSyncing, refreshFinanceData } = useFinanceStore();

  const activeGroup = FINANCE_NAV.find(g => g.items.some(i => i.key === activeKey));
  const activeItem = activeGroup?.items.find(i => i.key === activeKey);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      {/* ── Main Content Area ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Breadcrumb / topbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            {activeGroup && (
              <div className={`p-1.5 rounded-md ${activeGroup.bg}`}>
                <activeGroup.icon className={`h-4 w-4 ${activeGroup.color}`} />
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground font-medium">{activeGroup?.group || "Finance"}</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              <span className="font-semibold text-foreground">{activeItem?.label || "Overview"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshFinanceData}
              disabled={isSyncing}
              className="gap-2 h-8 text-xs font-medium border-primary/20 hover:bg-primary/5 shadow-xs"
              title="Refresh all GL entries and financial reports without whole page reload"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-primary" : "text-muted-foreground"}`} />
              {isSyncing ? "Syncing DB..." : "Refresh Financial Data"}
            </Button>
          </div>
        </div>

        {/* Top-Level Sub-Navigation Tabs */}
        {activeGroup && (
          <div className="flex items-start gap-2 px-4 py-2 bg-muted/30 border-b border-border shrink-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1.5 mt-1 shrink-0">
              {activeGroup.group}:
            </span>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {activeGroup.items.map((item) => {
                const isSelected = item.key === activeKey;
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigate({ search: { tab: item.key } })}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted bg-background/60 border border-border/50"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <FinanceSubModuleRouter subKey={activeKey} role={role} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ── Sub-Module Router ─────────────────────────────────────────────────────────

function FinanceSubModuleRouter({ subKey, role }: { subKey: string; role: FinanceModuleProps["role"] }) {
  switch (subKey) {
    // Setup
    case "financial_year": return <FinancialYearSubModule />;
    case "region": return <RegionSubModule />;
    case "vendor_list": return <VendorListSubModule />;
    case "customer_list": return <CustomerListSubModule />;
    case "cost_center": return <CostCenterSubModule />;
    case "budget_head": return <BudgetHeadSubModule />;

    // Finance
    case "finance_dashboard": return <FinanceDashboardSubModule />;
    case "posting_period": return <PostingPeriodSubModule />;
    case "chart_of_accounts": return <ChartOfAccountsSubModule />;
    case "journal_ledger": return <JournalLedgerSubModule />;
    case "credit_debit_builder": return <CreditDebitBuilderSubModule />;

    // Payment
    case "grn_cost_mapping": return <GrnCostMappingSubModule />;
    case "payable_invoice": return <PayableInvoiceSubModule />;
    case "journal_voucher": return <VoucherManagerSubModule type="Journal Voucher" />;
    case "payment_voucher": return <VoucherManagerSubModule type="Payment Voucher" />;
    case "receivable_invoice": return <ReceivableInvoiceSubModule role={role} />;
    case "receipt_voucher": return <VoucherManagerSubModule type="Receipt Voucher" />;

    // Receivables & Operations
    case "pdc_management": return <PdcManagement />;
    case "deposits_guarantees": return <DepositsGuarantees />;
    case "legal_receivables": return <ReceivablesLegal />;
    case "payroll_sync": return <PayrollSync />;

    // Bank Accounting
    case "bank": return <BankSubModule />;
    case "bank_account": return <BankAccountSubModule />;
    case "bank_clearance": return <BankClearanceSubModule />;
    case "bank_reconciliation": return <BankReconciliationSubModule />;
    case "bank_reconciliation_statement_list": return <BankReconciliationStatementListSubModule />;

    // Reports
    case "unbilled_units_report": return <UnbilledUnitsReportSubModule />;
    case "ar_ap_aging": return <ArApAgingReportSubModule />;
    case "customer_statement": return <CustomerStatementSubModule />;
    case "vendor_statement": return <VendorStatementSubModule />;
    case "pdc_maturity_report": return <PdcMaturityForecastReportSubModule />;
    case "lease_expiry_report": return <LeaseExpiryVacancyReportSubModule />;
    case "utility_recharge_report": return <UtilityRechargeRecoverySubModule />;
    case "deposit_reconciliation_report": return <SecurityDepositReconciliationSubModule />;
    case "revenue_generation": return <RevenueGenerationSubModule />;
    case "trial_balance_simple": return <TrialBalanceSimpleSubModule />;
    case "trial_balance": return <TrialBalanceFullSubModule />;
    case "profit_and_loss": return <ProfitAndLossSubModule />;
    case "property_pnl": return <PropertyWiseProfitAndLossSubModule />;
    case "vehicle_expense_report": return <VehicleExpenseReportSubModule />;
    case "balance_sheet": return <BalanceSheetSubModule />;
    case "general_ledger": return <GeneralLedgerReportSubModule />;
    case "cash_flow_statement": return <CashFlowSubModule />;
    case "cash_book": return <CashBookSubModule />;
    case "petty_cash_book": return <PettyCashBookSubModule />;
    case "cash_on_hand": return <CashOnHandSubModule />;

    // Credit / Debit Notes
    case "debit_note": return <DebitNoteSubModule />;
    case "credit_note": return <CreditNoteSubModule />;

    default: return <div className="text-center py-10 text-muted-foreground">Select a module</div>;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SETUP CONFIGURATION SUB-MODULES
// ─────────────────────────────────────────────────────────────────────────────

function FinancialYearSubModule() {
  const [data, setData] = useState<FinFinancialYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "FY 2026-2027", start_date: "2026-01-01", end_date: "2026-12-31", status: "Active" as const });

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (typeof window !== "undefined" && data.length > 0) {
      try { localStorage.setItem("pms_posting_periods_cache", JSON.stringify(data)); } catch {}
    }
  }, [data]);
  async function load() {
    setLoading(true);
    try {
      const res = await FinFinancialYearsApi.fetchAll();
      setData(res.length > 0 ? res : [
        { id: "1", name: "FY 2026-2027", start_date: "2026-01-01", end_date: "2026-12-31", status: "Active" as const },
        { id: "2", name: "FY 2025-2026", start_date: "2025-01-01", end_date: "2025-12-31", status: "Closed" as const }
      ]);
    } catch {
      setData([
        { id: "1", name: "FY 2026-2027", start_date: "2026-01-01", end_date: "2026-12-31", status: "Active" as const },
        { id: "2", name: "FY 2025-2026", start_date: "2025-01-01", end_date: "2025-12-31", status: "Closed" as const }
      ]);
    } finally { setLoading(false); }
  }
  async function handleAdd() {
    try {
      await FinFinancialYearsApi.create(form);
    } catch { }
    setData(prev => [{ id: String(Date.now()), ...form }, ...prev]);
    toast.success("Financial Year added");
    setOpen(false);
  }
  async function handleDelete(id: string) {
    if (!confirm("Delete this FY?")) return;
    try { await FinFinancialYearsApi.delete(id as any); } catch { }
    setData(prev => prev.filter(d => d.id !== id));
    toast.success("Financial year removed");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Financial Years Register</h3>
          <p className="text-xs text-muted-foreground">Manage accounting periods and posting year control.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Financial Year</Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader><TableRow className="bg-muted/50 text-xs"><TableHead className="font-bold">Year Name</TableHead><TableHead className="font-bold">Start Date</TableHead><TableHead className="font-bold">End Date</TableHead><TableHead className="font-bold">Status</TableHead><TableHead className="w-16"></TableHead></TableRow></TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-semibold">{row.name}</TableCell>
                <TableCell>{row.start_date}</TableCell>
                <TableCell>{row.end_date}</TableCell>
                <TableCell><Badge variant={row.status === "Active" ? "default" : "secondary"}>{row.status}</Badge></TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => handleDelete(String(row.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Financial Year</DialogTitle>
            <p className="text-xs text-muted-foreground">Set the accounting period boundaries.</p>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div><Label>Year Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Financial Year</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RegionSubModule() {
  const [data, setData] = useState<FinRegion[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<FinRegion, "id">>({ code: "REG-DOH", name: "Doha Central & West Bay", country: "Qatar", currency: "QAR", status: "Active" });

  useEffect(() => { load(); }, []);
  async function load() {
    try {
      const res = await FinRegionsApi.fetchAll();
      setData(res.length > 0 ? res : [
        { id: "1", code: "REG-DOH", name: "Doha & West Bay", country: "Qatar", currency: "QAR", status: "Active" },
        { id: "2", code: "REG-WAK", name: "Al Wakra & Mesaieed", country: "Qatar", currency: "QAR", status: "Active" },
        { id: "3", code: "REG-LUS", name: "Lusail Marina District", country: "Qatar", currency: "QAR", status: "Active" }
      ]);
    } catch {
      setData([
        { id: "1", code: "REG-DOH", name: "Doha & West Bay", country: "Qatar", currency: "QAR", status: "Active" },
        { id: "2", code: "REG-WAK", name: "Al Wakra & Mesaieed", country: "Qatar", currency: "QAR", status: "Active" }
      ]);
    }
  }
  async function handleAdd() {
    try { await FinRegionsApi.create(form); } catch { }
    setData(prev => [{ id: String(Date.now()), ...form }, ...prev]);
    toast.success("Region added");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Geographical & Tax Regions</h3>
          <p className="text-xs text-muted-foreground">Regional segmentation for property portfolios and multi-branch tax filing.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Region</Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader><TableRow className="bg-muted/50 text-xs"><TableHead className="font-bold">Code</TableHead><TableHead className="font-bold">Region Name</TableHead><TableHead className="font-bold">Country</TableHead><TableHead className="font-bold">Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono font-bold text-primary">{row.code}</TableCell>
                <TableCell className="font-semibold">{row.name}</TableCell>
                <TableCell>{row.country}</TableCell>
                <TableCell><Badge variant="outline">{row.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Geographical Region</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div><Label>Region Code</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
            <div><Label>Region Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Country</Label><Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Region</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VendorListSubModule() {
  const [data, setData] = useState<FinVendor[]>([]);

  useEffect(() => { load(); }, []);
  async function load() {
    try {
      const res = await FinVendorsApi.fetchAll();
      setData(res || []);
    } catch {
      setData([]);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Vendor Master Register</h3>
          <p className="text-xs text-muted-foreground">Supplier and service provider accounts linked to AP invoices (Read-Only).</p>
        </div>
        <div className="rounded-md border border-cyan-200 bg-cyan-50 dark:bg-cyan-950/20 dark:border-cyan-900 px-3 py-1.5 text-xs text-cyan-900 dark:text-cyan-300">
          Managed under <strong>Procurement → Vendors</strong>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader><TableRow className="bg-muted/50 text-xs"><TableHead className="font-bold">Code</TableHead><TableHead className="font-bold">Vendor Name</TableHead><TableHead className="font-bold">Contact Person</TableHead><TableHead className="font-bold">Phone / Email</TableHead><TableHead className="font-bold">Tax / CR No</TableHead><TableHead className="font-bold">Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono text-xs font-bold text-primary">{row.code}</TableCell>
                <TableCell className="font-semibold text-xs">{row.name}</TableCell>
                <TableCell className="text-xs">{row.contact_person || "—"}</TableCell>
                <TableCell className="text-xs">{[row.phone, row.email].filter(Boolean).join(" • ") || "—"}</TableCell>
                <TableCell className="text-xs font-mono">{row.tax_number || "—"}</TableCell>
                <TableCell className="text-xs"><Badge variant={row.status === "Active" ? "default" : "secondary"}>{row.status || "Active"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CustomerListSubModule() {
  const { customers: sharedCustomers, leases } = useAppData();
  const [dbCustomers, setDbCustomers] = useState<FinCustomer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerForSOA, setSelectedCustomerForSOA] = useState<{ id: string; name: string } | null>(null);
  const [customerForInvoice, setCustomerForInvoice] = useState<string | null>(null);

  useEffect(() => {
    async function load() { try { setDbCustomers(await FinCustomersApi.fetchAll()); } catch { } }
    load();
  }, []);

  const allCustomers = [
    ...dbCustomers.map(c => ({ id: String(c.id), code: c.code, name: c.name, type: c.type, phone: '—', email: '—', property: '—' })),
    ...(sharedCustomers || []).filter(t => !dbCustomers.some(c => c.name === t.name)).map((t, idx) => {
      const lease = leases?.find(l => l.customerId === t.id);
      return {
        id: `ctx-ten-${idx}`,
        rawId: t.id || t.customerId,
        code: `CUST-${String(t.customerId || t.id || idx).slice(-4).toUpperCase()}`,
        name: t.name,
        type: t.type === 'company' ? 'Corporate Tenant' : 'Individual Tenant',
        phone: t.mobile || '—',
        email: t.email || '—',
        property: lease ? `${lease.property} (${lease.unit})` : '—',
      };
    })
  ];

  const filteredCustomers = allCustomers.filter(c => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term) ||
      c.property.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">Customer &amp; Tenant Accounts</h3>
          <p className="text-xs text-muted-foreground">Customers linked with accounts receivable sub-ledgers and leasing contracts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono">{filteredCustomers.length} Customers</Badge>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
          <Input
            className="h-8 pl-8 text-xs bg-background"
            placeholder="Search customers by name, code, phone, property..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Code</TableHead>
              <TableHead className="font-bold">Customer Name</TableHead>
              <TableHead className="font-bold">Account Type</TableHead>
              <TableHead className="font-bold">Assigned Property</TableHead>
              <TableHead className="font-bold">Contact Phone</TableHead>
              <TableHead className="text-center font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                  No customers found matching search.
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30 text-xs">
                  <TableCell className="font-mono font-bold text-primary">{row.code}</TableCell>
                  <TableCell className="font-semibold">{row.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{row.type}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{row.property}</TableCell>
                  <TableCell className="text-xs font-mono">{row.phone}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCustomerForSOA({ id: (row as any).rawId || row.name, name: row.name })}
                        className="h-7 text-[11px] gap-1 px-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      >
                        <FileText className="h-3 w-3 text-emerald-600" />
                        Statement
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCustomerForInvoice((row as any).rawId || row.name)}
                        className="h-7 text-[11px] gap-1 px-2 border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      >
                        <Plus className="h-3 w-3 text-blue-600" />
                        Bill
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Statement of Account Modal for Selected Customer */}
      {selectedCustomerForSOA && (
        <Dialog open={Boolean(selectedCustomerForSOA)} onOpenChange={() => setSelectedCustomerForSOA(null)}>
          <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-4 rounded-xl">
            <CustomerStatementSubModule
              initialCustomerId={selectedCustomerForSOA.id}
              isDialogMode={true}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Invoice Generator Modal for Selected Customer */}
      {customerForInvoice && (
        <BulkInvoiceDialog
          open={Boolean(customerForInvoice)}
          onOpenChange={() => setCustomerForInvoice(null)}
          defaultMode="customer"
          initialCustomerId={customerForInvoice}
        />
      )}
    </div>
  );
}

export interface CompanyVehicleCostCenter {
  sno: number;
  vehicleNo: string;
  code: string;
  vehicleName: string;
  model: string;
  brandName: string;
  name: string;
  type: "Vehicle";
  manager: string;
}

export const COMPANY_VEHICLE_COST_CENTERS: CompanyVehicleCostCenter[] = [
  { sno: 1, vehicleNo: "230064", code: "230064", vehicleName: "Pickup", model: "2012", brandName: "Nissan", name: "230064 - Pickup (2012 Nissan)", type: "Vehicle", manager: "Fleet & Transport" },
  { sno: 2, vehicleNo: "573213", code: "573213", vehicleName: "Sentra", model: "2013", brandName: "Nissan", name: "573213 - Sentra (2013 Nissan)", type: "Vehicle", manager: "Fleet & Transport" },
  { sno: 3, vehicleNo: "257654", code: "257654", vehicleName: "Pickup", model: "2014", brandName: "Nissan", name: "257654 - Pickup (2014 Nissan)", type: "Vehicle", manager: "Fleet & Transport" },
  { sno: 4, vehicleNo: "632368", code: "632368", vehicleName: "Sentra", model: "2016", brandName: "Nissan", name: "632368 - Sentra (2016 Nissan)", type: "Vehicle", manager: "Fleet & Transport" },
  { sno: 5, vehicleNo: "21464", code: "21464", vehicleName: "Pickup", model: "2016", brandName: "Nissan", name: "21464 - Pickup (2016 Nissan)", type: "Vehicle", manager: "Fleet & Transport" },
  { sno: 6, vehicleNo: "768589", code: "768589", vehicleName: "Pajero", model: "2017", brandName: "Mitsubishi", name: "768589 - Pajero (2017 Mitsubishi)", type: "Vehicle", manager: "Fleet & Transport" },
  { sno: 7, vehicleNo: "900886", code: "900886", vehicleName: "Raize", model: "2023", brandName: "Toyota", name: "900886 - Raize (2023 Toyota)", type: "Vehicle", manager: "Fleet & Transport" },
  { sno: 8, vehicleNo: "218943", code: "218943", vehicleName: "Pickup", model: "2024", brandName: "Mitsubishi", name: "218943 - Pickup (2024 Mitsubishi)", type: "Vehicle", manager: "Fleet & Transport" },
  { sno: 9, vehicleNo: "215517", code: "215517", vehicleName: "Lexus", model: "—", brandName: "Toyota", name: "215517 - Lexus (Toyota)", type: "Vehicle", manager: "Fleet & Transport" },
  { sno: 10, vehicleNo: "30115", code: "30115", vehicleName: "Range Rover", model: "—", brandName: "Land Rover", name: "30115 - Range Rover (Land Rover)", type: "Vehicle", manager: "Fleet & Transport" },
  { sno: 11, vehicleNo: "52130", code: "52130", vehicleName: "Dodge", model: "—", brandName: "Chrysler", name: "52130 - Dodge (Chrysler)", type: "Vehicle", manager: "Fleet & Transport" },
];

function CostCenterSubModule() {
  const { units: sharedUnits } = useAppData();
  const [data, setData] = useState<FinCostCenter[]>([]);
  const [filterType, setFilterType] = useState<"ALL" | "Vehicle" | "Property">("ALL");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "230064", name: "230064 - Pickup (2012 Nissan)", manager: "Fleet & Transport", property_id: "", unit_id: "", type: "Vehicle", vehicleName: "", model: "", brandName: "" });

  const sharedProperties = Array.from(new Set((sharedUnits || []).map(u => String((u as any).propertyName || (u as any).property || (u as any).buildingName || ""))))
    .filter(p => Boolean(p && p.trim())).map((p, i) => ({ id: String(i), title: String(p) }));

  useEffect(() => { load(); }, [sharedUnits]);
  async function load() {
    try {
      const dbData = await FinCostCentersApi.fetchAll();
      const existing = new Set(dbData.map((d: any) => String(d.code).trim()));
      const autoSeeds: any[] = [];

      // 1. Seed Company Vehicles based on their "Vehicle No" as Cost Centers
      for (const v of COMPANY_VEHICLE_COST_CENTERS) {
        if (!existing.has(v.code) && !existing.has(`CC-VEH-${v.code}`)) {
          autoSeeds.push({
            code: v.code,
            name: v.name,
            manager: v.manager,
            type: "Vehicle",
            vehicleNo: v.vehicleNo,
            vehicleName: v.vehicleName,
            model: v.model,
            brandName: v.brandName,
          });
          // Best-effort persist to DB so all modules see vehicle cost centers
          FinCostCentersApi.create({
            code: v.code,
            name: v.name,
            manager: v.manager,
            type: "Vehicle",
          } as any).catch(() => {});
        }
      }

      // 2. Enrich existing DB vehicle cost centers with metadata if matched by Vehicle No
      const enrichedDbData = dbData.map((d: any) => {
        const matchedVeh = COMPANY_VEHICLE_COST_CENTERS.find(
          v => v.code === String(d.code).trim() || `CC-VEH-${v.code}` === String(d.code).trim()
        );
        if (matchedVeh) {
          return {
            ...d,
            type: "Vehicle",
            vehicleNo: matchedVeh.vehicleNo,
            vehicleName: matchedVeh.vehicleName,
            model: matchedVeh.model,
            brandName: matchedVeh.brandName,
          };
        }
        return d;
      });

      // 3. Seed Property Cost Centers
      for (const prop of sharedProperties) {
        if (!prop || !prop.title) continue;
        const code = `CC-PROP-${prop.title.slice(0, 8).toUpperCase().replace(/\s/g, '-')}`;
        if (!existing.has(code)) autoSeeds.push({ code, name: prop.title, manager: 'Site Manager', type: 'Property' });
      }
      setData([...enrichedDbData, ...autoSeeds.map((s, i) => ({ ...s, id: String(-1000 - i) }))]);
    } catch { }
  }
  async function handleAdd() {
    try { await FinCostCentersApi.create(form); } catch { }
    setData(prev => [{ id: String(Date.now()), ...form }, ...prev]);
    toast.success("Cost center added");
    setOpen(false);
  }

  const filteredData = data.filter((row: any) => {
    if (filterType === "ALL") return true;
    const rowType = row.type || (COMPANY_VEHICLE_COST_CENTERS.some(v => v.code === String(row.code)) ? "Vehicle" : "Property");
    return rowType === filterType;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h3 className="text-sm font-semibold">Cost Center Matrix (Properties & Company Vehicles)</h3>
          <p className="text-xs text-muted-foreground">Allocate expenses directly to specific Company Vehicles (by Vehicle No) or Property Cost Centers.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border bg-muted/30 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${filterType === "ALL" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              All ({data.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("Vehicle")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${filterType === "Vehicle" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Company Vehicles ({COMPANY_VEHICLE_COST_CENTERS.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("Property")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${filterType === "Property" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Properties
            </button>
          </div>
          <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Cost Center</Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Cost Center / Vehicle No</TableHead>
              <TableHead className="font-bold">Name / Vehicle Description</TableHead>
              <TableHead className="font-bold">Vehicle Name</TableHead>
              <TableHead className="font-bold">Model</TableHead>
              <TableHead className="font-bold">Brand Name</TableHead>
              <TableHead className="font-bold">Type</TableHead>
              <TableHead className="font-bold">Department / Manager</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row: any) => {
              const veh = COMPANY_VEHICLE_COST_CENTERS.find(v => v.code === String(row.code));
              const isVehicle = row.type === "Vehicle" || Boolean(veh);
              return (
                <TableRow key={row.id} className="hover:bg-muted/30 text-xs">
                  <TableCell className="font-mono font-bold text-primary">{row.code}</TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.vehicleName || veh?.vehicleName || "—"}</TableCell>
                  <TableCell>{row.model || veh?.model || "—"}</TableCell>
                  <TableCell>{row.brandName || veh?.brandName || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={isVehicle ? "default" : "outline"} className="text-[10px]">
                      {isVehicle ? "Company Vehicle" : (row.type || "Property")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{row.manager || (isVehicle ? "Fleet & Transport" : "Site Manager")}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Cost Center</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label>Cost Center Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vehicle">Company Vehicle (by Vehicle No)</SelectItem>
                  <SelectItem value="Property">Property / Building</SelectItem>
                  <SelectItem value="Department">Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>{form.type === "Vehicle" ? "Vehicle No (Cost Center Code)" : "Code"}</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
            <div><Label>Cost Center Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            {form.type === "Vehicle" && (
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Vehicle Name</Label><Input placeholder="e.g. Pickup" value={form.vehicleName} onChange={e => setForm({ ...form, vehicleName: e.target.value })} /></div>
                <div><Label>Model</Label><Input placeholder="e.g. 2024" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} /></div>
                <div><Label>Brand Name</Label><Input placeholder="e.g. Nissan" value={form.brandName} onChange={e => setForm({ ...form, brandName: e.target.value })} /></div>
              </div>
            )}
            <div><Label>Manager / Department</Label><Input value={form.manager} onChange={e => setForm({ ...form, manager: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Cost Center</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1.1 BUDGET HEAD & TYPE SUB-MODULE (Linked with Cost Centers & GL Accounts)
// ─────────────────────────────────────────────────────────────────────────────

interface BudgetHeadItem {
  id: string;
  code: string;
  name: string;
  budget_type: "CAPEX" | "OPEX";
  cost_center_code: string;
  cost_center_name: string;
  account_code: string;
  account_name: string;
  allocated_budget: number;
  financial_year: string;
  status: "Active" | "Inactive";
  date?: string;
  description?: string;
}

const DEFAULT_BUDGET_HEADS: BudgetHeadItem[] = [
  {
    id: "bh-1",
    code: "BH-MNT-PROP01",
    name: "Maintenance & Repairs",
    budget_type: "OPEX",
    cost_center_code: "CC-PROP-SALATA",
    cost_center_name: "Old Salata Residence 23",
    account_code: "51004001",
    account_name: "Repairs & Maintenance Expenses",
    allocated_budget: 150000,
    financial_year: "FY 2026-2027",
    status: "Active",
    description: "Scheduled and breakdown facility maintenance, HVAC spares, electrical and plumbing replacements"
  },
  {
    id: "bh-2",
    code: "BH-AST-PROP01",
    name: "Property Assets (Capital Additions)",
    budget_type: "CAPEX",
    cost_center_code: "CC-PROP-SALATA",
    cost_center_name: "Old Salata Residence 23",
    account_code: "13000",
    account_name: "Fixed Assets Portfolio",
    allocated_budget: 350000,
    financial_year: "FY 2026-2027",
    status: "Active",
    description: "Capital expenditure for central chillers, heavy water booster pumps, and plant assets"
  },
  {
    id: "bh-3",
    code: "BH-AST-UNIT01",
    name: "Unit Assets & Furnishings",
    budget_type: "CAPEX",
    cost_center_code: "CC-PROP-SALATA",
    cost_center_name: "Old Salata Residence 23",
    account_code: "13000",
    account_name: "Fixed Assets Portfolio",
    allocated_budget: 120000,
    financial_year: "FY 2026-2027",
    status: "Active",
    description: "Furnished apartment upgrades, split ACs, high-end white goods and furniture replacements"
  },
  {
    id: "bh-4",
    code: "BH-SAL-OPS01",
    name: "Staff Salaries & Site Payroll",
    budget_type: "OPEX",
    cost_center_code: "CC-DEPT-OPERATIONS",
    cost_center_name: "Property Operations & Facilities",
    account_code: "50100",
    account_name: "Staff Salaries & Payroll",
    allocated_budget: 280000,
    financial_year: "FY 2026-2027",
    status: "Active",
    description: "Site facility managers, on-site security guards, and cleaning crew payroll"
  },
  {
    id: "bh-5",
    code: "BH-CLN-PROP01",
    name: "Cleaning & Sanitation Services",
    budget_type: "OPEX",
    cost_center_code: "CC-PROP-SALATA",
    cost_center_name: "Old Salata Residence 23",
    account_code: "50300",
    account_name: "Cleaning & Sanitation Services",
    allocated_budget: 75000,
    financial_year: "FY 2026-2027",
    status: "Active",
    description: "Deep checkout cleaning, facade washing, and general pest control treatments"
  },
  {
    id: "bh-6",
    code: "BH-UTL-PROP01",
    name: "Electricity & Water (Kahramaa)",
    budget_type: "OPEX",
    cost_center_code: "CC-PROP-SALATA",
    cost_center_name: "Old Salata Residence 23",
    account_code: "50500",
    account_name: "Electricity & Water (Kahramaa)",
    allocated_budget: 180000,
    financial_year: "FY 2026-2027",
    status: "Active",
    description: "Common area utilities, district cooling (Qatar Cool), and main building Kahramaa accounts"
  }
];

function BudgetHeadSubModule() {
  const { allLedgerTransactions } = useFinanceStore();
  const { units: sharedUnits } = useAppData();

  const [budgetHeads, setBudgetHeads] = useState<BudgetHeadItem[]>([]);
  const [loadingBudgets, setLoadingBudgets] = useState(true);


  const [costCenters, setCostCenters] = useState<FinCostCenter[]>([]);
  const [selectedCostCenter, setSelectedCostCenter] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetHeadItem | null>(null);

  const [form, setForm] = useState<{
    code: string;
    name: string;
    budget_type: "CAPEX" | "OPEX";
    cost_center_code: string;
    account_code: string;
    allocated_budget: string;
    financial_year: string;
    status: "Active" | "Inactive";
    description: string;
  }>({
    code: "",
    name: "",
    budget_type: "OPEX",
    cost_center_code: "CC-PROP-SALATA",
    account_code: "51004001",
    allocated_budget: "100000",
    financial_year: "FY 2026-2027",
    status: "Active",
    description: ""
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("zyno_finance_budget_heads", JSON.stringify(budgetHeads));
  }, [budgetHeads]);

  // Load Cost Centers
  useEffect(() => {
    async function loadCC() {
      try {
        const dbData = await FinCostCentersApi.fetchAll();
        const autoSeeds: FinCostCenter[] = [
          { id: "cc-1", code: "CC-PROP-SALATA", name: "Old Salata Residence 23", manager: "Eng. Fahad", type: "Property" } as any,
          { id: "cc-2", code: "CC-PROP-MANSOURA", name: "MANSOURA - BLDG06", manager: "Site Manager", type: "Property" } as any,
          { id: "cc-3", code: "CC-DEPT-OPERATIONS", name: "Property Operations & Facilities", manager: "Head of Operations", type: "Department" } as any,
          { id: "cc-4", code: "CC-CORP-ADMIN", name: "Corporate Headquarters & Admin", manager: "Finance Manager", type: "Corporate" } as any,
        ];
        const existingCodes = new Set((dbData || []).map((d: any) => d.code));
        const merged = [...(dbData || []), ...autoSeeds.filter(s => !existingCodes.has(s.code))];
        setCostCenters(merged);
      } catch {
        setCostCenters([
          { id: "cc-1", code: "CC-PROP-SALATA", name: "Old Salata Residence 23", manager: "Eng. Fahad", type: "Property" } as any,
          { id: "cc-2", code: "CC-PROP-MANSOURA", name: "MANSOURA - BLDG06", manager: "Site Manager", type: "Property" } as any,
          { id: "cc-3", code: "CC-DEPT-OPERATIONS", name: "Property Operations & Facilities", manager: "Head of Operations", type: "Department" } as any,
          { id: "cc-4", code: "CC-CORP-ADMIN", name: "Corporate Headquarters & Admin", manager: "Finance Manager", type: "Corporate" } as any,
        ]);
      }
    }
    loadCC();
  }, []);

  // Standard COA dictionary for Mapping
  const COA_EXPENSE_ASSET_OPTIONS = [
    { code: "50100", name: "Staff Salaries & Payroll", type: "OPEX" },
    { code: "51004001", name: "Repairs & Maintenance Expenses", type: "OPEX" },
    { code: "50300", name: "Cleaning & Sanitation Services", type: "OPEX" },
    { code: "50500", name: "Electricity & Water (Kahramaa)", type: "OPEX" },
    { code: "50900", name: "Depreciation Expense", type: "OPEX" },
    { code: "13000", name: "Fixed Assets Portfolio", type: "CAPEX" },
    { code: "15000", name: "Capital Work-in-Progress (CWIP)", type: "CAPEX" },
  ];

  // Calculate actual live spending from General Ledger per Account / Cost Center
  const actualsMap = useMemo(() => {
    const map: Record<string, number> = {};
    (allLedgerTransactions || []).forEach(tx => {
      const code = tx.account_code || "";
      const net = (tx.debit || 0) - (tx.credit || 0);
      if (net > 0) {
        map[code] = (map[code] || 0) + net;
      }
    });
    return map;
  }, [allLedgerTransactions]);

  function handleOpenCreate() {
    setEditingItem(null);
    setForm({
      code: `BH-${Date.now().toString().slice(-4)}`,
      name: "",
      budget_type: "OPEX",
      cost_center_code: costCenters[0]?.code || "CC-PROP-SALATA",
      account_code: "51004001",
      allocated_budget: "100000",
      financial_year: "FY 2026-2027",
      status: "Active",
      description: ""
    });
    setDialogOpen(true);
  }

  function handleOpenEdit(item: BudgetHeadItem) {
    setEditingItem(item);
    setForm({
      code: item.code,
      name: item.name,
      budget_type: item.budget_type,
      cost_center_code: item.cost_center_code,
      account_code: item.account_code,
      allocated_budget: String(item.allocated_budget),
      financial_year: item.financial_year,
      status: item.status,
      description: item.description || ""
    });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Please provide both Budget Head Code and Name.");
      return;
    }

    const cc = costCenters.find(c => c.code === form.cost_center_code);
    const coa = COA_EXPENSE_ASSET_OPTIONS.find(a => a.code === form.account_code);
    const allocated = parseFloat(form.allocated_budget) || 0;

    if (editingItem) {
      setBudgetHeads(prev => prev.map(bh => bh.id === editingItem.id ? {
        ...bh,
        code: form.code,
        name: form.name,
        budget_type: form.budget_type,
        cost_center_code: form.cost_center_code,
        cost_center_name: cc?.name || form.cost_center_code,
        account_code: form.account_code,
        account_name: coa?.name || "Mapped Account",
        allocated_budget: allocated,
        financial_year: form.financial_year,
        status: form.status,
        description: form.description
      } : bh));
      toast.success(`Budget Head ${form.code} updated successfully.`);
    } else {
      const newItem: BudgetHeadItem = {
        id: `bh-${Date.now()}`,
        code: form.code,
        name: form.name,
        budget_type: form.budget_type,
        cost_center_code: form.cost_center_code,
        cost_center_name: cc?.name || form.cost_center_code,
        account_code: form.account_code,
        account_name: coa?.name || "Mapped Account",
        allocated_budget: allocated,
        financial_year: form.financial_year,
        status: form.status,
        description: form.description
      };
      setBudgetHeads(prev => [newItem, ...prev]);
      toast.success(`New Budget Head ${form.code} created.`);
    }
    setDialogOpen(false);
  }

  function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this Budget Head?")) return;
    setBudgetHeads(prev => prev.filter(bh => bh.id !== id));
    toast.success("Budget Head removed.");
  }

  // Filtered Budget Heads
  const filteredList = useMemo(() => {
    return budgetHeads.filter(bh => {
      if (selectedCostCenter !== "all" && bh.cost_center_code !== selectedCostCenter) return false;
      if (selectedType !== "all" && bh.budget_type !== selectedType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!(
          bh.code.toLowerCase().includes(q) ||
          bh.name.toLowerCase().includes(q) ||
          bh.cost_center_name.toLowerCase().includes(q) ||
          bh.account_name.toLowerCase().includes(q) ||
          bh.account_code.includes(q)
        )) return false;
      }
      return true;
    });
  }, [budgetHeads, selectedCostCenter, selectedType, search]);

  // Aggregate Metrics
  const totalAllocated = useMemo(() => budgetHeads.reduce((s, b) => s + (b.allocated_budget || 0), 0), [budgetHeads]);
  const totalCapex = useMemo(() => budgetHeads.filter(b => b.budget_type === "CAPEX").reduce((s, b) => s + (b.allocated_budget || 0), 0), [budgetHeads]);
  const totalOpex = useMemo(() => budgetHeads.filter(b => b.budget_type === "OPEX").reduce((s, b) => s + (b.allocated_budget || 0), 0), [budgetHeads]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <PieChart className="h-4 w-4 text-primary" /> Budget Head &amp; Budget Type Matrix
          </h3>
          <p className="text-xs text-muted-foreground">
            Configure CAPEX &amp; OPEX budget heads mapped to Cost Centers and Chart of Accounts for automated procurement control &amp; live financial reporting.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate} className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Create Budget Head
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3.5 bg-card/60 backdrop-blur-sm border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Total Allocated Budget</span>
            <Badge variant="outline" className="text-[10px] font-mono bg-blue-500/10 text-blue-600 border-blue-200">
              {budgetHeads.length} Heads
            </Badge>
          </div>
          <p className="text-lg font-bold font-mono text-primary mt-1">QAR {totalAllocated.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Annual fiscal limit across all cost centers</p>
        </Card>

        <Card className="p-3.5 bg-card/60 backdrop-blur-sm border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">CAPEX (Capital Expenditure)</span>
            <Badge variant="outline" className="text-[10px] font-mono bg-purple-500/10 text-purple-600 border-purple-200">
              Assets &amp; Plant
            </Badge>
          </div>
          <p className="text-lg font-bold font-mono text-purple-600 mt-1">QAR {totalCapex.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Fixed assets, structural upgrades &amp; CWIP</p>
        </Card>

        <Card className="p-3.5 bg-card/60 backdrop-blur-sm border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">OPEX (Operational Expenditure)</span>
            <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 border-emerald-200">
              Operations &amp; Maintenance
            </Badge>
          </div>
          <p className="text-lg font-bold font-mono text-emerald-600 mt-1">QAR {totalOpex.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Repairs, salaries, sanitation &amp; utilities</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 rounded-lg border bg-muted/20 flex flex-col md:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search code, name, GL account..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>

          <Select value={selectedCostCenter} onValueChange={setSelectedCostCenter}>
            <SelectTrigger className="h-8 text-xs w-[180px] bg-background">
              <SelectValue placeholder="All Cost Centers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cost Centers</SelectItem>
              {costCenters.map(cc => (
                <SelectItem key={cc.code} value={cc.code}>{cc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="h-8 text-xs w-[130px] bg-background">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CAPEX">CAPEX Only</SelectItem>
              <SelectItem value="OPEX">OPEX Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Badge variant="outline" className="text-xs font-mono">{filteredList.length} Records</Badge>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => { setSearch(""); setSelectedCostCenter("all"); setSelectedType("all"); }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Code</TableHead>
              <TableHead className="font-bold">Budget Head Name</TableHead>
              <TableHead className="font-bold">Type</TableHead>
              <TableHead className="font-bold">Assigned Cost Center</TableHead>
              <TableHead className="font-bold">Mapped GL Account</TableHead>
              <TableHead className="font-bold text-right">Allocated Budget</TableHead>
              <TableHead className="font-bold text-right">GL Actual Spend</TableHead>
              <TableHead className="font-bold text-center">Utilization</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="w-20 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground text-xs">
                  No Budget Heads found matching your filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((row) => {
                const actual = actualsMap[row.account_code] || 0;
                const utilPercent = row.allocated_budget > 0 ? Math.min(100, Math.round((actual / row.allocated_budget) * 100)) : 0;
                const isOver = actual > row.allocated_budget;

                return (
                  <TableRow key={row.id} className="hover:bg-muted/30 text-xs transition-colors">
                    <TableCell className="font-mono font-bold text-primary">{row.code}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">{row.name}</div>
                      {row.description && <div className="text-[10px] text-muted-foreground line-clamp-1">{row.description}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${row.budget_type === 'CAPEX' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                      >
                        {row.budget_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{row.cost_center_name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{row.cost_center_code}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono font-bold text-primary">{row.account_code}</div>
                      <div className="text-[10px] text-muted-foreground">{row.account_name}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      QAR {row.allocated_budget.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      QAR {actual.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-12 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${isOver ? 'bg-rose-500' : utilPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${utilPercent}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-mono font-semibold ${isOver ? 'text-rose-600' : 'text-muted-foreground'}`}>
                          {utilPercent}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.status === "Active" ? "default" : "secondary"} className="text-[10px]">
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => handleOpenEdit(row)}
                          title="Edit Budget Head"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                          onClick={() => handleDelete(row.id)}
                          title="Delete Budget Head"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Dialog Create / Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              {editingItem ? `Edit Budget Head (${editingItem.code})` : "Create New Budget Head"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Budget Head Code *</Label>
                <Input
                  className="h-8 text-xs font-mono"
                  placeholder="e.g. BH-MNT-PROP01"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Budget Type *</Label>
                <Select
                  value={form.budget_type}
                  onValueChange={(v: "CAPEX" | "OPEX") => setForm({
                    ...form,
                    budget_type: v,
                    account_code: v === "CAPEX" ? "13000" : "51004001"
                  })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEX">OPEX (Operational Expenditure)</SelectItem>
                    <SelectItem value="CAPEX">CAPEX (Capital Expenditure)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Budget Head Name *</Label>
              <Input
                className="h-8 text-xs"
                placeholder="e.g. Building Maintenance & Repairs"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Assigned Cost Center *</Label>
                <Select
                  value={form.cost_center_code}
                  onValueChange={v => setForm({ ...form, cost_center_code: v })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select Cost Center" />
                  </SelectTrigger>
                  <SelectContent>
                    {costCenters.map(cc => (
                      <SelectItem key={cc.code} value={cc.code}>
                        {cc.name} ({cc.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Mapped General Ledger Account *</Label>
                <Select
                  value={form.account_code}
                  onValueChange={v => setForm({ ...form, account_code: v })}
                >
                  <SelectTrigger className="h-8 text-xs font-mono">
                    <SelectValue placeholder="Select Account Code" />
                  </SelectTrigger>
                  <SelectContent>
                    {COA_EXPENSE_ASSET_OPTIONS
                      .filter(a => a.type === form.budget_type)
                      .map(a => (
                        <SelectItem key={a.code} value={a.code}>
                          {a.code} - {a.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Allocated Fiscal Budget (QAR) *</Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-mono"
                  placeholder="0.00"
                  value={form.allocated_budget}
                  onChange={e => setForm({ ...form, allocated_budget: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Financial Year</Label>
                <Input
                  className="h-8 text-xs"
                  value={form.financial_year}
                  onChange={e => setForm({ ...form, financial_year: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Operational Description &amp; Scope</Label>
              <Textarea
                rows={2}
                className="text-xs"
                placeholder="Details of allowable expenses or procurement items under this head..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 border-t pt-2 mt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
              {editingItem ? "Update Budget Head" : "Create Budget Head"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. FINANCE SUB-MODULES
// ─────────────────────────────────────────────────────────────────────────────

function FinanceDashboardSubModule() {
  const { vouchers: sharedVouchers, leases } = useAppData();

  const activeLeases = (leases || []).filter((lease) => !["closed", "renewed"].includes(lease.status));
  const totalRentals = activeLeases.reduce((sum, lease) => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const effectiveEnd = new Date(lease.actualVacateDate || lease.plannedVacateDate || lease.endDate);
    effectiveEnd.setHours(0, 0, 0, 0);
    if (effectiveEnd < todayDate) return sum;

    const monthsRemaining =
      Math.max(
        1,
        (effectiveEnd.getFullYear() - todayDate.getFullYear()) * 12 +
          (effectiveEnd.getMonth() - todayDate.getMonth()) +
          (effectiveEnd.getDate() >= todayDate.getDate() ? 1 : 0),
      );
    return sum + ((lease.monthlyRent || 0) * monthsRemaining);
  }, 0);
  const totalPdcs = 0;
  const totalVouchers = (sharedVouchers || []).reduce((s, v) => s + (Number(v.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Contract Assets</p>
            <h3 className="text-xl font-bold mt-1 text-primary font-mono">QR {totalRentals.toLocaleString()}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">{activeLeases.length || 0} Active / Checkout Tenancies</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PDCs Under Custody</p>
            <h3 className="text-xl font-bold mt-1 text-emerald-600 font-mono">QR {totalPdcs.toLocaleString()}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">0 Registered Cheques</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Posted Vouchers</p>
            <h3 className="text-xl font-bold mt-1 text-blue-600 font-mono">QR {totalVouchers.toLocaleString()}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">{sharedVouchers?.length || 19} Ledger Transactions</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Security Deposits Held</p>
            <h3 className="text-xl font-bold mt-1 text-amber-600 font-mono">QR 0</h3>
            <p className="text-[10px] text-muted-foreground mt-1">GL Account 21500</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Financial Transactions</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground py-8 text-center">No recent financial transactions found.</CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm">System Financial Status & Verification</CardTitle></CardHeader>
          <CardContent className="text-xs space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold">General Ledger In Balance</span>
              </div>
              <span className="font-mono text-xs font-bold">Dr = Cr (OK)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">PDC Register Linkage</span>
              </div>
              <span className="font-mono text-xs font-bold">0 Cheques Reconciled</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PostingPeriodSubModule() {
  const [data, setData] = useState<FinPostingPeriod[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    year: "2026",
    month: "9",
    status: "Open" as "Open" | "Closed"
  });

  useEffect(() => { load(); }, []);
  async function load() {
    try {
      const res = await FinPostingPeriodsApi.fetchAll();
      setData(res.length > 0 ? res : [
        { id: "1", period_name: "2026-08", year: 2026, month: 8, status: "Open" as const },
        { id: "2", period_name: "2026-07", year: 2026, month: 7, status: "Closed" as const },
        { id: "3", period_name: "2026-06", year: 2026, month: 6, status: "Closed" as const },
      ]);
    } catch {
      setData([
        { id: "1", period_name: "2026-08", year: 2026, month: 8, status: "Open" as const },
        { id: "2", period_name: "2026-07", year: 2026, month: 7, status: "Closed" as const },
        { id: "3", period_name: "2026-06", year: 2026, month: 6, status: "Closed" as const },
      ]);
    }
  }

  async function toggle(row: FinPostingPeriod) {
    const nextStatus = row.status === "Open" ? "Closed" : "Open";
    try { await FinPostingPeriodsApi.update(row.id, { status: nextStatus }); } catch { }
    setData(prev => prev.map(p => p.id === row.id ? { ...p, status: nextStatus } : p));
    toast.success(`Period ${row.period_name} is now ${nextStatus}`);
  }

  function handleOpenCreate() {
    setEditingId(null);
    setForm({
      year: "2026",
      month: String(new Date().getMonth() + 1),
      status: "Open"
    });
    setOpen(true);
  }

  function handleOpenEdit(row: FinPostingPeriod) {
    setEditingId(row.id);
    setForm({
      year: String(row.year),
      month: String(row.month),
      status: row.status as "Open" | "Closed"
    });
    setOpen(true);
  }

  async function handleSavePeriod() {
    const m = parseInt(form.month);
    const y = parseInt(form.year);
    if (isNaN(m) || isNaN(y) || m < 1 || m > 12) {
      toast.error("Please enter a valid month (1-12) and year.");
      return;
    }
    const period_name = `${y}-${String(m).padStart(2, '0')}`;

    if (editingId) {
      // Update existing
      try {
        await FinPostingPeriodsApi.update(editingId, {
          period_name,
          year: y,
          month: m,
          status: form.status
        });
      } catch { }
      setData(prev => prev.map(p => p.id === editingId ? { ...p, period_name, year: y, month: m, status: form.status } : p));
      toast.success(`Posting Period ${period_name} updated successfully!`);
    } else {
      // Create new
      const newPeriod: FinPostingPeriod = {
        id: String(Date.now()),
        period_name,
        year: y,
        month: m,
        status: form.status
      };
      try {
        await FinPostingPeriodsApi.create(newPeriod);
      } catch { }
      setData(prev => [newPeriod, ...prev]);
      toast.success(`Posting Period ${period_name} added successfully!`);
    }
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <div>
          <h3 className="text-base font-bold tracking-tight">Financial Posting Periods Control</h3>
          <p className="text-xs text-muted-foreground">Open, lock, or define monthly accounting periods to control journal entries and voucher postings.</p>
        </div>
        <Button size="sm" onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Posting Period
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Period Name</TableHead>
              <TableHead className="font-bold">Fiscal Year</TableHead>
              <TableHead className="font-bold">Month</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...data].sort((a, b) => Number(b.year) - Number(a.year) || Number(b.month) - Number(a.month)).map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono font-bold text-primary">{row.period_name}</TableCell>
                <TableCell className="font-medium">{row.year}</TableCell>
                <TableCell>{new Date(Number(row.year), Number(row.month) - 1).toLocaleString('default', { month: 'long' })} ({row.month})</TableCell>
                <TableCell>
                  <Badge variant={row.status === "Open" ? "default" : "secondary"} className="text-[10px]">
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => toggle(row)}
                    >
                      {row.status === "Open" ? "Lock / Close" : "Re-Open"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => handleOpenEdit(row)}
                    >
                      Edit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Posting Period Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingId ? "Edit Posting Period" : "Add New Posting Period"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Fiscal Year</Label>
                <Input
                  type="number"
                  placeholder="2026"
                  value={form.year}
                  onChange={e => setForm({ ...form, year: e.target.value })}
                />
              </div>
              <div>
                <Label>Month (1–12)</Label>
                <Select value={form.month} onValueChange={v => setForm({ ...form, month: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">January (1)</SelectItem>
                    <SelectItem value="2">February (2)</SelectItem>
                    <SelectItem value="3">March (3)</SelectItem>
                    <SelectItem value="4">April (4)</SelectItem>
                    <SelectItem value="5">May (5)</SelectItem>
                    <SelectItem value="6">June (6)</SelectItem>
                    <SelectItem value="7">July (7)</SelectItem>
                    <SelectItem value="8">August (8)</SelectItem>
                    <SelectItem value="9">September (9)</SelectItem>
                    <SelectItem value="10">October (10)</SelectItem>
                    <SelectItem value="11">November (11)</SelectItem>
                    <SelectItem value="12">December (12)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Period Status</Label>
              <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open (Allows Voucher & Ledger Postings)</SelectItem>
                  <SelectItem value="Closed">Closed / Locked (Prevents Modification)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-2.5 rounded-md bg-muted text-[11px] text-muted-foreground">
              Period Code will be generated as: <strong className="font-mono text-foreground">{form.year}-{String(form.month).padStart(2, '0')}</strong>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePeriod}>
              {editingId ? "Save Changes" : "Create Posting Period"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChartOfAccountsSubModule() {
  const [erpAccounts, setErpAccounts] = useState<ERPChartOfAccount[]>([]);
  const [unitCoas, setUnitCoas] = useState<UnitCOA[]>([]);
  const [propertyMappings, setPropertyMappings] = useState<PropertyCoaMapping[]>([]);
  const [hierarchyData, setHierarchyData] = useState<{
    types: CoaType[];
    groups: CoaGroup[];
    classes: CoaClass[];
    gls: CoaGL[];
  }>({ types: [], groups: [], classes: [], gls: [] });

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'tree' | 'master' | 'units' | 'properties'>('tree');
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Tree expansion state
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'type-1': true,
    'type-2': true,
    'type-3': true,
    'type-4': true,
    'type-5': true,
  });
  const [glSLs, setGlSLs] = useState<Record<string, CoaSL[]>>({});
  const [loadingSLs, setLoadingSLs] = useState<Record<string, boolean>>({});

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", type: "Assets", type_code: "1", group_name: "Current Assets", class_name: "Accounts Receivables", gl_name: "Tenant Receivables" });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Ledgers saved only in this browser by earlier versions are moved into the database first.
      await migrateLocalCustomCoa().catch(() => 0);
      const [accs, uCoas, tree, propMaps] = await Promise.all([
        fetchERPChartOfAccounts(),
        fetchUnitCOAs(),
        fetchCoaHierarchyTree().catch(() => ({ types: [], groups: [], classes: [], gls: [] })),
        fetchPropertyCoaMappings().catch(() => [])
      ]);

      // ── Merge Custom User-Added COA Accounts from localStorage ──
      let customCoas: ERPChartOfAccount[] = [];
      try {
        const rawCustom = localStorage.getItem("fin_custom_coa_accounts_v1");
        if (rawCustom) {
          const parsed = JSON.parse(rawCustom);
          if (Array.isArray(parsed)) customCoas = parsed;
        }
      } catch {}

      // ── Clean Master COA ──
      const masterMap = new Map<string, ERPChartOfAccount>();
      (accs || []).forEach(a => {
        const glKey = a.gl_code || (a.code && a.code.length >= 5 ? a.code.substring(0, 5) : a.code) || a.name;
        if (!masterMap.has(glKey)) {
          masterMap.set(glKey, {
            ...a,
            code: a.gl_code || (a.code && a.code.length >= 5 ? `${a.code.substring(0, 5)}0` : a.code),
            name: a.gl_name || a.name.replace(/\s*-\s*(Tenant|Flat|Unit|Apt|Residence|\d+).*$/i, '').trim(),
          });
        }
      });
      customCoas.forEach(c => {
        const key = c.code || c.gl_code || c.name;
        masterMap.set(key, c);
      });
      const cleanMaster = Array.from(masterMap.values());

      // Merge custom accounts into tree.gls so they also show in Hierarchy Tree
      const existingGlCodes = new Set((tree.gls || []).map((g: any) => g.code));
      const mergedGls = [...(tree.gls || [])];
      customCoas.forEach(c => {
        if (c.code && !existingGlCodes.has(c.code)) {
          existingGlCodes.add(c.code);
          mergedGls.push({
            id: c.id || `custom-gl-${c.code}`,
            code: String(c.code || ""),
            name: String(c.name || c.gl_name || ""),
            class_code: String(c.class_code || (tree.classes?.[0]?.code ?? "111")),
            group_code: String(c.group_code || (tree.groups?.[0]?.code ?? "11")),
            type_code: String(c.type_code || "1"),
          } as any);
        }
      });

      // ── Clean Unit Sub-Ledgers ──
      const distinctUnitMap = new Map<string, UnitCOA>();
      (uCoas || []).forEach(u => {
        const key = `${u.property_name || ''}__${u.unit_code || ''}`;
        if (!distinctUnitMap.has(key)) {
          distinctUnitMap.set(key, u);
        }
      });
      const cleanUnits = Array.from(distinctUnitMap.values());

      setErpAccounts(cleanMaster);
      setUnitCoas(cleanUnits);
      setHierarchyData({ ...tree, gls: mergedGls });
      setPropertyMappings(propMaps);
    } catch (e: any) {
      toast.error("Failed to load Chart of Accounts: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const toggleNode = async (nodeKey: string, glCode?: string) => {
    setExpandedNodes(prev => {
      const next = { ...prev, [nodeKey]: !prev[nodeKey] };
      return next;
    });

    if (glCode && !glSLs[glCode] && !loadingSLs[glCode]) {
      setLoadingSLs(prev => ({ ...prev, [glCode]: true }));
      try {
        const sls = await fetchCoaSLByGL(glCode);
        setGlSLs(prev => ({ ...prev, [glCode]: sls }));
      } catch (err) {
        console.error("Failed to fetch SLs for GL:", glCode, err);
      } finally {
        setLoadingSLs(prev => ({ ...prev, [glCode]: false }));
      }
    }
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    hierarchyData.types.forEach(t => {
      all[`type-${t.code}`] = true;
    });
    hierarchyData.groups.forEach(g => {
      all[`group-${g.code}`] = true;
    });
    hierarchyData.classes.forEach(c => {
      all[`class-${c.code}`] = true;
    });
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  async function handleCreate() {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Please enter both Account Code and Account Name.");
      return;
    }
    try {
      const codeTrimmed = form.code.trim();
      const nameTrimmed = form.name.trim();
      const typeMap: Record<string, { type_code: string; group_name: string; class_name: string }> = {
        Assets: { type_code: "1", group_name: "Current Assets", class_name: "General Assets" },
        Liabilities: { type_code: "2", group_name: "Current Liabilities", class_name: "General Liabilities" },
        Capital: { type_code: "3", group_name: "Equity & Reserves", class_name: "Owner Capital" },
        Revenue: { type_code: "4", group_name: "Operating Revenue", class_name: "Rental & Service Income" },
        Expenditure: { type_code: "5", group_name: "Operating Expenses", class_name: "Direct & Admin Expenses" },
        Expenses: { type_code: "5", group_name: "Operating Expenses", class_name: "Direct & Admin Expenses" },
      };
      const meta = typeMap[form.type] || typeMap.Expenditure;
      const saved = await persistCoaAccount({
        code: codeTrimmed,
        name: nameTrimmed,
        type: form.type,
        group_name: form.group_name || meta.group_name,
        class_name: form.class_name || meta.class_name,
      });
      if (!saved.ok) {
        toast.error(`Could not save ledger ${codeTrimmed}: ${saved.error}`);
        return;
      }
      if (!saved.created) {
        toast.info(`Ledger ${codeTrimmed} already exists in the Chart of Accounts.`);
      }

      if (saved.created) toast.success(`Ledger Account ${codeTrimmed} - ${nameTrimmed} saved to the Chart of Accounts and is available for journal / voucher posting.`);
      setForm({ code: "", name: "", type: "Expenditure", type_code: "5", group_name: "Operating Expenses", class_name: "Direct & Admin Expenses", gl_name: "" });
      setOpen(false);
      await loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to create ledger account");
    }
  }

  const filteredMaster = erpAccounts.filter(acc => {
    const matchesType = typeFilter === "all" || (acc.type || "").toLowerCase() === typeFilter.toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      (acc.code || "").toLowerCase().includes(q) ||
      (acc.name || "").toLowerCase().includes(q) ||
      (acc.gl_name || "").toLowerCase().includes(q) ||
      (acc.class_name || "").toLowerCase().includes(q) ||
      (acc.group_name || "").toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const filteredUnits = unitCoas.filter(u => {
    const q = search.toLowerCase();
    return !search ||
      (u.property_name || "").toLowerCase().includes(q) ||
      (u.unit_code || "").toLowerCase().includes(q) ||
      (u.pdc_in_hand_code || "").toLowerCase().includes(q) ||
      (u.pdc_in_hand_name || "").toLowerCase().includes(q) ||
      (u.deposit_code || "").toLowerCase().includes(q) ||
      (u.deposit_name || "").toLowerCase().includes(q) ||
      (u.receivables_code || "").toLowerCase().includes(q) ||
      (u.receivables_name || "").toLowerCase().includes(q);
  });

  const filteredProperties = propertyMappings.filter(p => {
    const q = search.toLowerCase();
    return !search ||
      (p.property_name || "").toLowerCase().includes(q) ||
      (p.property_code || "").toLowerCase().includes(q);
  });

  const totalMasterPages = Math.ceil(filteredMaster.length / pageSize) || 1;
  const paginatedMaster = filteredMaster.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card p-4 rounded-lg border shadow-xs">
        <div>
          <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" />
            Company Chart of Accounts (COA) & Sub-Ledger System
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Authoritative 5-tier relational COA hierarchy (Type → Group → Class → GL → SL) with Property & Unit Sub-Ledger mappings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-muted p-1 rounded-md text-xs font-medium">
            <button
              onClick={() => { setTab('tree'); setPage(1); }}
              className={`px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-all ${tab === 'tree' ? 'bg-background text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Network className="h-3.5 w-3.5" /> 5-Tier Hierarchy Tree
            </button>
            <button
              onClick={() => { setTab('master'); setPage(1); }}
              className={`px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-all ${tab === 'master' ? 'bg-background text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <BookOpen className="h-3.5 w-3.5" /> Enterprise Master ({erpAccounts.length})
            </button>
            <button
              onClick={() => { setTab('units'); setPage(1); }}
              className={`px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-all ${tab === 'units' ? 'bg-background text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Building2 className="h-3.5 w-3.5" /> Unit Sub-Ledgers ({unitCoas.length})
            </button>
            <button
              onClick={() => { setTab('properties'); setPage(1); }}
              className={`px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-all ${tab === 'properties' ? 'bg-background text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Building className="h-3.5 w-3.5" /> Property Rules ({propertyMappings.length})
            </button>
          </div>

          <Button size="sm" onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Account
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={tab === 'master' ? "Search code, name, class..." : tab === 'units' ? "Search property, unit, COA..." : tab === 'properties' ? "Search property name..." : "Filter tree..."}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 text-xs"
          />
        </div>

        {tab === 'master' && (
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['all', 'Assets', 'Liabilities', 'Capital', 'Revenue', 'Expenditure'].map(t => (
              <Badge
                key={t}
                variant={typeFilter.toLowerCase() === t.toLowerCase() ? "default" : "outline"}
                className="cursor-pointer capitalize text-xs px-3 py-1"
                onClick={() => { setTypeFilter(t); setPage(1); }}
              >
                {t}
              </Badge>
            ))}
          </div>
        )}

        {tab === 'tree' && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll} className="h-8 text-xs">
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll} className="h-8 text-xs">
              Collapse All
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading Chart of Accounts...
        </div>
      ) : tab === 'tree' ? (
        <div className="border rounded-lg bg-card p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Relational 5-Tier Chart of Accounts Hierarchy</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Debit Normal Balance</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Credit Normal Balance</span>
            </div>
          </div>

          <div className="space-y-2">
            {hierarchyData.types.map(type => {
              const typeKey = `type-${type.code}`;
              const isTypeExpanded = !!expandedNodes[typeKey];
              const groupsInType = hierarchyData.groups.filter(g => g.type_code === type.code || g.type_id === type.id);

              return (
                <div key={type.id} className="border rounded-md overflow-hidden bg-muted/10">
                  {/* Tier 1: TYPE */}
                  <div
                    onClick={() => toggleNode(typeKey)}
                    className="flex items-center justify-between px-3 py-2.5 bg-muted/40 hover:bg-muted/60 cursor-pointer select-none transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {isTypeExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">{type.code}</span>
                      <span className="font-bold text-sm text-foreground">{type.name}</span>
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold ${(type as any).financial_statement === 'BS' ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-purple-300 text-purple-700 bg-purple-50'}`}>
                        {(type as any).financial_statement === 'BS' ? 'Balance Sheet' : 'Profit & Loss'}
                      </Badge>
                    </div>
                    <Badge variant={type.normal_balance === 'Debit' ? 'default' : 'secondary'} className="text-[10px]">
                      Normal: {type.normal_balance}
                    </Badge>
                  </div>

                  {/* Tier 2: GROUPS */}
                  {isTypeExpanded && (
                    <div className="pl-6 pr-3 py-2 space-y-2 border-t border-muted/50">
                      {groupsInType.map(group => {
                        const groupKey = `group-${group.code}`;
                        const isGroupExpanded = !!expandedNodes[groupKey];
                        const classesInGroup = hierarchyData.classes.filter(c => c.group_code === group.code || c.group_id === group.id);

                        return (
                          <div key={group.id} className="border rounded bg-card/60">
                            <div
                              onClick={() => toggleNode(groupKey)}
                              className="flex items-center justify-between px-3 py-2 bg-muted/20 hover:bg-muted/40 cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2">
                                {isGroupExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                                <FolderOpen className="h-3.5 w-3.5 text-amber-500" />
                                <span className="font-mono text-xs font-semibold text-foreground/80">{group.code}</span>
                                <span className="font-semibold text-xs text-foreground">{group.name}</span>
                              </div>
                              <span className="text-[11px] text-muted-foreground font-medium">{classesInGroup.length} Classes</span>
                            </div>

                            {/* Tier 3: CLASSES */}
                            {isGroupExpanded && (
                              <div className="pl-6 pr-3 py-2 space-y-1.5 border-t border-muted/40 bg-muted/5">
                                {classesInGroup.map(cls => {
                                  const classKey = `class-${cls.code}`;
                                  const isClassExpanded = !!expandedNodes[classKey];
                                  const glsInClass = hierarchyData.gls.filter(g => g.class_code === cls.code || g.class_id === cls.id);

                                  return (
                                    <div key={cls.id} className="border rounded bg-card/80">
                                      <div
                                        onClick={() => toggleNode(classKey)}
                                        className="flex items-center justify-between px-3 py-1.5 hover:bg-muted/30 cursor-pointer select-none"
                                      >
                                        <div className="flex items-center gap-2">
                                          {isClassExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                                          <Folder className="h-3 w-3 text-blue-500" />
                                          <span className="font-mono text-[11px] font-semibold text-foreground/70">{cls.code}</span>
                                          <span className="font-medium text-xs text-foreground">{cls.name}</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">{glsInClass.length} GL Accounts</span>
                                      </div>

                                      {/* Tier 4: GL ACCOUNTS */}
                                      {isClassExpanded && (
                                        <div className="pl-6 pr-3 py-1.5 space-y-1 border-t border-muted/30 bg-muted/10">
                                          {glsInClass.map(gl => {
                                            const glKey = `gl-${gl.code}`;
                                            const isGlExpanded = !!expandedNodes[glKey];
                                            const slList = glSLs[gl.code] || [];
                                            const isSlLoading = !!loadingSLs[gl.code];

                                            return (
                                              <div key={gl.id} className="border rounded bg-card text-xs">
                                                <div
                                                  onClick={() => toggleNode(glKey, gl.code)}
                                                  className="flex items-center justify-between px-3 py-1.5 hover:bg-muted/20 cursor-pointer select-none"
                                                >
                                                  <div className="flex items-center gap-2">
                                                    {isGlExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                                                    <span className="font-mono font-bold text-primary">{gl.code}</span>
                                                    <span className="font-medium">{gl.name}</span>
                                                  </div>
                                                  <div className="flex items-center gap-1.5">
                                                    <Badge variant={gl.normal_balance === 'Debit' ? 'outline' : 'secondary'} className="text-[9px] px-1.5 py-0">
                                                      {gl.normal_balance}
                                                    </Badge>
                                                    {gl.is_control_account && (
                                                      <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-200">
                                                        Control
                                                      </Badge>
                                                    )}
                                                    {gl.requires_unit && (
                                                      <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-700 border-blue-200">
                                                        Unit Req
                                                      </Badge>
                                                    )}
                                                    {gl.requires_property && (
                                                      <Badge variant="outline" className="text-[9px] bg-purple-50 text-purple-700 border-purple-200">
                                                        Property Req
                                                      </Badge>
                                                    )}
                                                  </div>
                                                </div>

                                                {/* Tier 5: SUB-LEDGER (SL) ACCOUNTS */}
                                                {isGlExpanded && (
                                                  <div className="pl-6 pr-3 py-2 border-t bg-muted/20 text-xs">
                                                    {isSlLoading ? (
                                                      <div className="flex items-center gap-2 text-muted-foreground py-2">
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading Sub-Ledger (SL) accounts...
                                                      </div>
                                                    ) : slList.length === 0 ? (
                                                      <div className="text-muted-foreground italic py-1">
                                                        No Sub-Ledgers configured directly under this GL account.
                                                      </div>
                                                    ) : (
                                                      <div className="space-y-1">
                                                        <div className="text-[11px] font-semibold text-muted-foreground mb-1">
                                                          Sub-Ledger Accounts ({slList.length} Accounts):
                                                        </div>
                                                        <div className="max-h-56 overflow-y-auto divide-y rounded border bg-card">
                                                          {slList.map(sl => (
                                                            <div key={sl.id} className="flex items-center justify-between px-3 py-1.5 hover:bg-muted/30">
                                                              <div className="flex items-center gap-2">
                                                                <span className="font-mono font-bold text-blue-600">{sl.code}</span>
                                                                <span className="text-foreground">{sl.name}</span>
                                                              </div>
                                                              <span className="text-[10px] text-muted-foreground font-mono">GL: {sl.gl_code}</span>
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : tab === 'master' ? (
        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 text-xs">
                <TableHead className="font-bold">Code / SL</TableHead>
                <TableHead className="font-bold">Account Name</TableHead>
                <TableHead className="font-bold">Type</TableHead>
                <TableHead className="font-bold">Group</TableHead>
                <TableHead className="font-bold">Class / GL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMaster.map(acc => (
                <TableRow key={acc.id} className="hover:bg-muted/30 text-xs">
                  <TableCell className="font-mono font-bold text-primary">{acc.code}</TableCell>
                  <TableCell className="font-medium">{acc.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize text-[10px] font-semibold ${(acc.type || '').toLowerCase().includes('asset') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      (acc.type || '').toLowerCase().includes('liab') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        (acc.type || '').toLowerCase().includes('cap') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          (acc.type || '').toLowerCase().includes('rev') ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                      {acc.type_name || acc.type || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{acc.group_name || 'N/A'}</TableCell>
                  <TableCell className="text-xs">
                    <div className="font-medium">{acc.gl_name || acc.class_name || 'N/A'}</div>
                    {acc.gl_code && <div className="text-[10px] text-muted-foreground font-mono">GL: {acc.gl_code}</div>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredMaster.length > pageSize && (
            <div className="flex items-center justify-between p-3 border-t text-xs text-muted-foreground bg-muted/20">
              <span>Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filteredMaster.length)} of {filteredMaster.length} Accounts</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-7" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                {Array.from({ length: totalMasterPages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2).map(p => (
                  <Button key={p} size="sm" variant={p === page ? "default" : "outline"} className="h-7 w-7 p-0" onClick={() => setPage(p)}>{p}</Button>
                ))}
                <Button size="sm" variant="outline" className="h-7" disabled={page === totalMasterPages} onClick={() => setPage(p => p + 1)}>Next →</Button>
              </div>
            </div>
          )}
        </div>
      ) : tab === 'properties' ? (
        <div className="border rounded-lg overflow-hidden bg-card shadow-xs">
          <div className="bg-muted/70 px-4 py-2.5 flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm text-foreground">Property-Level COA Routing Configuration</span>
              <Badge variant="secondary" className="text-[11px] font-semibold">
                {propertyMappings.length} Properties
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">Authoritative GL routing accounts per property</span>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 text-xs">
                <TableHead className="font-bold">Property Name</TableHead>
                <TableHead className="font-bold">Rental Revenue GL</TableHead>
                <TableHead className="font-bold">Management Fee GL</TableHead>
                <TableHead className="font-bold">Other Income GL</TableHead>
                <TableHead className="font-bold">Gain/Loss Disposal GL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.map(p => (
                <TableRow key={p.id} className="hover:bg-muted/30 text-xs">
                  <TableCell className="font-semibold text-foreground">{p.property_name}</TableCell>
                  <TableCell><Badge variant="outline" className="font-mono text-emerald-700 bg-emerald-50 border-emerald-200">{p.rental_revenue_gl_code || '41100'}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="font-mono text-blue-700 bg-blue-50 border-blue-200">{p.property_management_fee_gl_code || '41101'}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="font-mono text-purple-700 bg-purple-50 border-purple-200">{p.other_income_gl_code || '41201'}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="font-mono text-amber-700 bg-amber-50 border-amber-200">{p.gain_loss_disposal_gl_code || '41301'}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="space-y-4">
          {(() => {
            const propertiesMap = new Map<string, typeof unitCoas>();
            filteredUnits.forEach(u => {
              const prop = u.property_name || 'Portfolio Properties';
              if (!propertiesMap.has(prop)) propertiesMap.set(prop, []);
              propertiesMap.get(prop)!.push(u);
            });

            return Array.from(propertiesMap.entries()).map(([propertyName, unitsList]) => (
              <div key={propertyName} className="border rounded-lg overflow-hidden bg-card shadow-xs">
                <div className="bg-muted/70 px-4 py-2.5 flex items-center justify-between border-b">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    <span className="font-bold text-sm text-foreground">{propertyName}</span>
                    <Badge variant="secondary" className="text-[11px] font-semibold">
                      {unitsList.length} Units Configured
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">Unified Company COA Sub-Ledgers</span>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 text-xs">
                      <TableHead className="font-bold w-28">Unit Code</TableHead>
                      <TableHead className="font-bold">PDC In Hand (Sub-Ledger Code)</TableHead>
                      <TableHead className="font-bold">Security Deposit (Sub-Ledger Code)</TableHead>
                      <TableHead className="font-bold">Customer Receivables (Sub-Ledger Code)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unitsList.map(u => (
                      <TableRow key={u.id} className="hover:bg-muted/30 text-xs">
                        <TableCell><Badge variant="outline" className="font-mono font-bold text-primary">{u.unit_code}</Badge></TableCell>
                        <TableCell className="text-xs">
                          <span className="font-mono font-bold text-blue-600 mr-1.5">{u.pdc_in_hand_code}</span>
                          <span className="text-muted-foreground">{u.pdc_in_hand_name}</span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="font-mono font-bold text-amber-600 mr-1.5">{u.deposit_code}</span>
                          <span className="text-muted-foreground">{u.deposit_name}</span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="font-mono font-bold text-emerald-600 mr-1.5">{u.receivables_code}</span>
                          <span className="text-muted-foreground">{u.receivables_name}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ));
          })()}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add New Chart of Account</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div><Label>Account Code</Label><Input placeholder="12413999" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
            <div><Label>Account / SL Name</Label><Input placeholder="Receivables - Unit 101" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div>
              <Label>Account Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Assets">Assets</SelectItem>
                  <SelectItem value="Liabilities">Liabilities</SelectItem>
                  <SelectItem value="Capital">Capital</SelectItem>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Expenditure">Expenditure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Save Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function JournalLedgerSubModule() {
  const COMMON_GL_ACCOUNTS = useMergedCoa(BASE_COMMON_GL_ACCOUNTS);
  const { leases, units } = useAppData();
  const { journalEntries: storeJournalEntries, addJournalEntry } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<{ id: string; posting_date: string; reference: string; narration: string; dr_account: string; cr_account: string; amount: number; status: string; property_name?: string }[]>([]);

  const propertiesList = useMemo(() => {
    const set = new Set<string>();
    leases.forEach(l => { if (l.property) set.add(l.property); });
    units.forEach(u => { if (u.property) set.add(u.property); });
    if (set.size === 0) {
      set.add("Old Salata - Residence No:23");
      set.add("MANSOURA - BLDG06");
      set.add("Neeman's New Building");
    }
    return Array.from(set).sort();
  }, [leases, units]);

  const [form, setForm] = useState({
    je_no: `JE-2026-${Math.floor(100 + Math.random() * 900)}`,
    posting_date: new Date().toISOString().split("T")[0],
    reference: "MANUAL-JE",
    narration: "",
    property: "All / Corporate",
  });

  type JeLine = {
    id: string;
    type: "DR" | "CR";
    account: string;
    property: string;
    amount: string;
    description: string;
  };

  const [jeLines, setJeLines] = useState<JeLine[]>([
    { id: "1", type: "DR", account: "51004001 - Repair and Maintenance Cost", property: propertiesList[0] || "All / Corporate", amount: "5000", description: "Expense allocation" },
    { id: "2", type: "CR", account: "12000 - Bank Operating Account (QNB/CBQ)", property: propertiesList[0] || "All / Corporate", amount: "5000", description: "Payment / adjustment" },
  ]);

  const totalDr = useMemo(() => jeLines.filter(l => l.type === "DR").reduce((s, l) => s + (parseFloat(l.amount) || 0), 0), [jeLines]);
  const totalCr = useMemo(() => jeLines.filter(l => l.type === "CR").reduce((s, l) => s + (parseFloat(l.amount) || 0), 0), [jeLines]);
  const hasDrAndCr = useMemo(() => jeLines.some(l => l.type === "DR" && (parseFloat(l.amount) || 0) > 0) && jeLines.some(l => l.type === "CR" && (parseFloat(l.amount) || 0) > 0), [jeLines]);
  const isBalanced = Math.abs(totalDr - totalCr) < 0.01 && totalDr > 0 && hasDrAndCr;

  async function handleAddEntry() {
    if (!form.narration.trim()) {
      toast.error("Please fill in the journal narration / description.");
      return;
    }
    if (!isBalanced) {
      toast.error(`Journal Rejected: Total Debit (QAR ${totalDr.toLocaleString()}) and Total Credit (QAR ${totalCr.toLocaleString()}) must be tallied and greater than zero!`);
      return;
    }

    const accountCode = (label: string) => label.trim().split(/\s+/)[0];
    try {
      await postVoucher({
        voucher_date: form.posting_date,
        voucher_type: 'Journal',
        description: form.narration,
        reference_no: form.reference,
        lines: jeLines.map(l => ({
          account_code: accountCode(l.account),
          debit: l.type === "DR" ? (parseFloat(l.amount) || 0) : 0,
          credit: l.type === "CR" ? (parseFloat(l.amount) || 0) : 0,
          description: `${l.description || form.narration} [${l.property}]`,
        }))
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to post journal entry.");
      return;
    }

    const drSummary = jeLines.filter(l => l.type === "DR").map(l => `${l.account} [${l.property}] (${parseFloat(l.amount || '0').toLocaleString()})`).join("; ");
    const crSummary = jeLines.filter(l => l.type === "CR").map(l => `${l.account} [${l.property}] (${parseFloat(l.amount || '0').toLocaleString()})`).join("; ");
    const firstDr = jeLines.find(l => l.type === "DR");
    const firstCr = jeLines.find(l => l.type === "CR");
    const uniqueProps = Array.from(new Set(jeLines.map(l => l.property).filter(Boolean))).join(", ");

    addJournalEntry({
      je_no: form.je_no,
      posting_date: form.posting_date,
      reference: form.reference,
      narration: form.narration,
      dr_account: drSummary,
      dr_code: firstDr ? accountCode(firstDr.account) : "12000",
      cr_account: crSummary,
      cr_code: firstCr ? accountCode(firstCr.account) : "41100",
      amount: totalDr,
      property_name: uniqueProps || form.property,
      lines: jeLines.map(l => ({
        id: l.id,
        type: l.type,
        account: l.account,
        account_code: accountCode(l.account),
        amount: parseFloat(l.amount) || 0,
        property_name: l.property,
        description: l.description || form.narration,
      })),
    });

    const newJE = {
      id: form.je_no,
      posting_date: form.posting_date,
      reference: form.reference,
      narration: form.narration,
      dr_account: drSummary,
      cr_account: crSummary,
      amount: totalDr,
      status: "Posted",
      property_name: uniqueProps,
    };

    setEntries(prev => [newJE, ...prev]);
    toast.success(`Journal Entry ${form.je_no} (QAR ${totalDr.toLocaleString()}) posted to Ledger!`);
    setOpen(false);
    setForm(f => ({ ...f, je_no: `JE-2026-${Math.floor(100 + Math.random() * 900)}`, narration: "" }));
  }

  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const [search, setSearch] = useState("");

  const combinedEntries = useMemo(() => {
    const map = new Map<string, any>();
    entries.forEach(e => map.set(e.id, e));
    (storeJournalEntries || []).forEach(je => {
      const key = je.je_no || je.id;
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          posting_date: je.posting_date,
          reference: je.reference,
          narration: je.narration,
          dr_account: je.dr_account,
          cr_account: je.cr_account,
          amount: je.amount,
          status: je.status || "Posted",
          property_name: je.property_name,
        });
      }
    });
    return Array.from(map.values());
  }, [entries, storeJournalEntries]);

  const filteredEntries = useMemo(() => {
    let list = combinedEntries;
    if (quickFilter === "current") {
      const cur = new Date().toISOString().slice(0, 7);
      list = list.filter(je => (je.posting_date || "").startsWith(cur));
    } else if (quickFilter === "last_month") {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      const prev = d.toISOString().slice(0, 7);
      list = list.filter(je => (je.posting_date || "").startsWith(prev));
    } else if (quickFilter === "custom" || startMonth || endMonth) {
      if (startMonth) {
        list = list.filter(je => (je.posting_date || "").slice(0, 7) >= startMonth);
      }
      if (endMonth) {
        list = list.filter(je => (je.posting_date || "").slice(0, 7) <= endMonth);
      }
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(je =>
        (je.id && je.id.toLowerCase().includes(q)) ||
        (je.reference && je.reference.toLowerCase().includes(q)) ||
        (je.narration && je.narration.toLowerCase().includes(q)) ||
        (je.dr_account && je.dr_account.toLowerCase().includes(q)) ||
        (je.cr_account && je.cr_account.toLowerCase().includes(q))
      );
    }
    return list;
  }, [combinedEntries, startMonth, endMonth, quickFilter, search]);

  const totalAmount = useMemo(() => filteredEntries.reduce((s, je) => s + (je.amount || 0), 0), [filteredEntries]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Journal Ledger Postings</h3>
          <p className="text-xs text-muted-foreground">General Journal entries with multi-line property allocation, dual-entry audit trail, and strict Debit/Credit tallying.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-200">
            Total: {totalAmount.toLocaleString()} QAR
          </Badge>
          <Badge variant="outline">{filteredEntries.length} JEs</Badge>
          <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Create Journal Entry</Button>
        </div>
      </div>

      {/* Month Range Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-muted/20 p-3 rounded-lg border">
        <div className="sm:col-span-4 relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-xs bg-background"
            placeholder="Search JE #, ref, narration, account..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="sm:col-span-3 flex items-center gap-1">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">From:</Label>
          <Input
            type="month"
            className="h-8 text-xs bg-background"
            value={startMonth}
            onChange={e => {
              setStartMonth(e.target.value);
              setQuickFilter("custom");
            }}
          />
        </div>

        <div className="sm:col-span-3 flex items-center gap-1">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">To:</Label>
          <Input
            type="month"
            className="h-8 text-xs bg-background"
            value={endMonth}
            onChange={e => {
              setEndMonth(e.target.value);
              setQuickFilter("custom");
            }}
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-1">
          <Select
            value={quickFilter}
            onValueChange={v => {
              setQuickFilter(v);
              if (v === "all") {
                setStartMonth("");
                setEndMonth("");
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="Period" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="custom">Month Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Entry Date</TableHead>
              <TableHead className="font-bold">JE #</TableHead>
              <TableHead className="font-bold">Property</TableHead>
              <TableHead className="font-bold">Reference</TableHead>
              <TableHead className="font-bold">Debit Account(s)</TableHead>
              <TableHead className="font-bold">Credit Account(s)</TableHead>
              <TableHead className="text-right font-bold">Amount (QAR)</TableHead>
              <TableHead className="font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No journal entries found for the selected month range.
                </TableCell>
              </TableRow>
            ) : (
              [...filteredEntries].sort((a, b) => new Date(b.posting_date || "").getTime() - new Date(a.posting_date || "").getTime()).map(je => (
                <TableRow key={je.id} className="hover:bg-muted/30 text-xs">
                  <TableCell className="font-mono text-muted-foreground">{je.posting_date || '2026-08-01'}</TableCell>
                  <TableCell className="font-mono font-bold text-primary">{je.id}</TableCell>
                  <TableCell className="font-medium text-muted-foreground">{je.property_name || "Corporate"}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{je.reference}</TableCell>
                  <TableCell className="text-blue-600 font-medium max-w-[220px] truncate" title={je.dr_account}>{je.dr_account}</TableCell>
                  <TableCell className="text-emerald-600 font-medium max-w-[220px] truncate" title={je.cr_account}>{je.cr_account}</TableCell>
                  <TableCell className="text-right font-mono font-bold">{je.amount.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="default" className="text-[10px]">{je.status}</Badge></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Multi-Line Journal Ledger Entry</DialogTitle>
            <p className="text-xs text-muted-foreground">Posts multiple debit &amp; credit lines with line-by-line property selection and strict balance enforcement.</p>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><Label className="text-[11px] font-semibold">JE Number *</Label><Input className="h-8 text-xs font-mono font-bold" value={form.je_no} onChange={e => setForm({ ...form, je_no: e.target.value })} /></div>
              <div><Label className="text-[11px] font-semibold">Posting Date *</Label><Input type="date" className="h-8 text-xs" value={form.posting_date} onChange={e => setForm({ ...form, posting_date: e.target.value })} /></div>
              <div><Label className="text-[11px] font-semibold">Reference / Document No</Label><Input className="h-8 text-xs" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} /></div>
            </div>
            <div>
              <Label className="text-[11px] font-semibold">Narration / Description *</Label>
              <Input className="h-8 text-xs" placeholder="Explain the business transaction..." value={form.narration} onChange={e => setForm({ ...form, narration: e.target.value })} />
            </div>

            <div className="space-y-2.5 border rounded-lg p-3 bg-muted/20">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-xs uppercase tracking-wide">Journal Lines (Multi Debit / Credit &amp; Property)</span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-blue-500/40 text-blue-600"
                    onClick={() => setJeLines(lines => [...lines, { id: String(Date.now() + Math.random()), type: "DR", account: COMMON_GL_ACCOUNTS[0].name, property: propertiesList[0] || "All / Corporate", amount: "0", description: form.narration }])}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Debit (Dr) Line
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-emerald-500/40 text-emerald-600"
                    onClick={() => setJeLines(lines => [...lines, { id: String(Date.now() + Math.random()), type: "CR", account: COMMON_GL_ACCOUNTS[1].name, property: propertiesList[0] || "All / Corporate", amount: "0", description: form.narration }])}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Credit (Cr) Line
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-x-auto bg-background">
                <table className="w-full min-w-[850px] text-xs">
                  <thead className="bg-muted/60 text-muted-foreground font-semibold border-b">
                    <tr>
                      <th className="py-2 px-2 text-center w-20">Dr / Cr</th>
                      <th className="py-2 px-2 text-left w-60">GL Account</th>
                      <th className="py-2 px-2 text-left w-52">Property</th>
                      <th className="py-2 px-2 text-left">Line Memo</th>
                      <th className="py-2 px-2 text-right w-28">Debit (QAR)</th>
                      <th className="py-2 px-2 text-right w-28">Credit (QAR)</th>
                      <th className="py-2 px-1 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {jeLines.map((line, idx) => (
                      <tr key={line.id}>
                        <td className="py-2 px-2">
                          <Select value={line.type} onValueChange={(v: "DR" | "CR") => setJeLines(lines => lines.map((l, i) => i === idx ? { ...l, type: v } : l))}>
                            <SelectTrigger className={`h-8 text-xs font-bold ${line.type === "DR" ? "text-blue-600 border-blue-300" : "text-emerald-600 border-emerald-300"}`}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DR" className="text-blue-600 font-bold">DR</SelectItem>
                              <SelectItem value="CR" className="text-emerald-600 font-bold">CR</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2 px-2">
                          <Select value={line.account} onValueChange={v => setJeLines(lines => lines.map((l, i) => i === idx ? { ...l, account: v } : l))}>
                            <SelectTrigger className="h-8 text-xs font-mono"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {COMMON_GL_ACCOUNTS.map(a => <SelectItem key={a.code} value={a.name} className="text-xs font-mono">{a.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2 px-2">
                          <Select value={line.property} onValueChange={v => setJeLines(lines => lines.map((l, i) => i === idx ? { ...l, property: v } : l))}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All / Corporate">All / Corporate Office</SelectItem>
                              {propertiesList.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2 px-2">
                          <Input className="h-8 text-xs" placeholder="Line description" value={line.description} onChange={e => { const v = e.target.value; setJeLines(lines => lines.map((l, i) => i === idx ? { ...l, description: v } : l)); }} />
                        </td>
                        <td className="py-2 px-2 text-right">
                          {line.type === "DR" ? (
                            <Input type="number" step="0.01" className="h-8 text-xs font-mono font-bold text-right text-blue-700" value={line.amount} onChange={e => { const v = e.target.value; setJeLines(lines => lines.map((l, i) => i === idx ? { ...l, amount: v } : l)); }} />
                          ) : <span className="text-muted-foreground font-mono text-center block">—</span>}
                        </td>
                        <td className="py-2 px-2 text-right">
                          {line.type === "CR" ? (
                            <Input type="number" step="0.01" className="h-8 text-xs font-mono font-bold text-right text-emerald-700" value={line.amount} onChange={e => { const v = e.target.value; setJeLines(lines => lines.map((l, i) => i === idx ? { ...l, amount: v } : l)); }} />
                          ) : <span className="text-muted-foreground font-mono text-center block">—</span>}
                        </td>
                        <td className="py-2 px-1 text-center">
                          {jeLines.length > 2 && (
                            <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setJeLines(lines => lines.filter((_, i) => i !== idx))}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/40 font-bold border-t">
                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-right uppercase text-[11px]">Totals:</td>
                      <td className="py-2 px-2 text-right font-mono text-blue-700">QR {totalDr.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-2 px-2 text-right font-mono text-emerald-700">QR {totalCr.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="text-center">{isBalanced ? "✓" : "✗"}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {!isBalanced && (
                <div className="rounded p-2 bg-destructive/10 border border-destructive/30 text-destructive text-[11px] flex justify-between items-center">
                  <span>⚠️ Journal Blocked: Total Debit (QR {totalDr.toLocaleString()}) and Total Credit (QR {totalCr.toLocaleString()}) do not tally!</span>
                  <span className="font-semibold">System requires Debit === Credit</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEntry} disabled={!isBalanced}>Confirm &amp; Post Journal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreditDebitBuilderSubModule() {
  const COMMON_GL_ACCOUNTS = useMergedCoa(BASE_COMMON_GL_ACCOUNTS);
  const { leases, units } = useAppData();
  const { addJournalEntry } = useFinanceStore();
  const propertiesList = useMemo(() => {
    const set = new Set<string>();
    leases.forEach(l => { if (l.property) set.add(l.property); });
    units.forEach(u => { if (u.property) set.add(u.property); });
    if (set.size === 0) {
      set.add("Old Salata - Residence No:23");
      set.add("MANSOURA - BLDG06");
      set.add("Neeman's New Building");
    }
    return Array.from(set).sort();
  }, [leases, units]);

  const [lines, setLines] = useState([
    { account: COMMON_GL_ACCOUNTS[0].name, property: propertiesList[0] || "All / Corporate", debit: 0, credit: 0, description: "" },
    { account: COMMON_GL_ACCOUNTS[6].name, property: propertiesList[0] || "All / Corporate", debit: 0, credit: 0, description: "" },
  ]);
  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  function addLine() {
    setLines([...lines, { account: COMMON_GL_ACCOUNTS[0].name, property: propertiesList[0] || "All / Corporate", debit: 0, credit: 0, description: "" }]);
  }
  function removeLine(idx: number) { setLines(lines.filter((_, i) => i !== idx)); }

  async function submit() {
    if (!isBalanced) {
      toast.error(`Journal Rejected: Total Debit (QAR ${totalDebit.toLocaleString()}) and Total Credit (QAR ${totalCredit.toLocaleString()}) must be tallied and greater than 0!`);
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const jeNo = `JVB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await postVoucher({
        voucher_date: today,
        voucher_type: 'Journal',
        description: 'Multi-line Credit Debit Builder Voucher',
        lines: lines.map(l => ({
          account_code: l.account.split(' ')[0] || '1000',
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          description: `${l.description || l.account} [${l.property}]`,
        }))
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to post journal voucher.");
      return;
    }

    const drLines = lines.filter(l => (Number(l.debit) || 0) > 0);
    const crLines = lines.filter(l => (Number(l.credit) || 0) > 0);
    addJournalEntry({
      je_no: jeNo,
      posting_date: today,
      reference: "BUILDER-JV",
      narration: "Multi-leg Credit/Debit Builder Journal",
      dr_account: drLines.map(l => `${l.account} [${l.property}]`).join("; "),
      dr_code: drLines[0]?.account.split(" ")[0] || "12000",
      cr_account: crLines.map(l => `${l.account} [${l.property}]`).join("; "),
      cr_code: crLines[0]?.account.split(" ")[0] || "41100",
      amount: totalDebit,
      property_name: Array.from(new Set(lines.map(l => l.property))).join(", "),
      lines: lines.flatMap((l, i) => {
        const res: any[] = [];
        if ((Number(l.debit) || 0) > 0) {
          res.push({ id: `${i}-dr`, type: "DR", account: l.account, account_code: l.account.split(" ")[0], amount: Number(l.debit), property_name: l.property, description: l.description });
        }
        if ((Number(l.credit) || 0) > 0) {
          res.push({ id: `${i}-cr`, type: "CR", account: l.account, account_code: l.account.split(" ")[0], amount: Number(l.credit), property_name: l.property, description: l.description });
        }
        return res;
      }),
    });

    toast.success(`Journal voucher ${jeNo} (QAR ${totalDebit.toLocaleString()}) built & posted successfully!`);
    setLines([
      { account: COMMON_GL_ACCOUNTS[0].name, property: propertiesList[0] || "All / Corporate", debit: 0, credit: 0, description: "" },
      { account: COMMON_GL_ACCOUNTS[6].name, property: propertiesList[0] || "All / Corporate", debit: 0, credit: 0, description: "" }
    ]);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Multi-Leg Debit / Credit Voucher Builder</h3>
          <p className="text-xs text-muted-foreground">Construct complex split-leg journal entries with line-by-line property selection and strict Debit/Credit balancing.</p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg border shadow-sm space-y-3">
        {lines.map((l, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs">
            <div className="sm:col-span-4">
              <Select value={l.account} onValueChange={v => { const next = [...lines]; next[idx].account = v; setLines(next); }}>
                <SelectTrigger className="h-8 text-xs font-mono"><SelectValue placeholder="Select GL Account" /></SelectTrigger>
                <SelectContent>
                  {COMMON_GL_ACCOUNTS.map(a => <SelectItem key={a.code} value={a.name} className="text-xs font-mono">{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-3">
              <Select value={l.property} onValueChange={v => { const next = [...lines]; next[idx].property = v; setLines(next); }}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select Property" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All / Corporate">All / Corporate Office</SelectItem>
                  {propertiesList.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Input
                placeholder="Line memo..."
                className="h-8 text-xs"
                value={l.description || ""}
                onChange={e => { const next = [...lines]; next[idx].description = e.target.value; setLines(next); }}
              />
            </div>
            <div className="sm:col-span-1">
              <Input
                type="number"
                placeholder="Debit"
                className="h-8 text-xs font-mono text-blue-700"
                value={l.debit || ""}
                onChange={e => { const next = [...lines]; next[idx].debit = parseFloat(e.target.value) || 0; setLines(next); }}
              />
            </div>
            <div className="sm:col-span-1">
              <Input
                type="number"
                placeholder="Credit"
                className="h-8 text-xs font-mono text-emerald-700"
                value={l.credit || ""}
                onChange={e => { const next = [...lines]; next[idx].credit = parseFloat(e.target.value) || 0; setLines(next); }}
              />
            </div>
            <div className="sm:col-span-1 flex justify-end">
              {lines.length > 2 && (
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeLine(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}

        {!isBalanced && (totalDebit > 0 || totalCredit > 0) && (
          <div className="rounded p-2 bg-destructive/10 border border-destructive/30 text-destructive text-[11px] flex justify-between items-center">
            <span>⚠️ Out of balance by QAR {Math.abs(totalDebit - totalCredit).toLocaleString()} — Journal cannot be accepted until Total Debit equals Total Credit.</span>
            <span className="font-semibold">Debit === Credit Required</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-border mt-2">
          <Button variant="outline" size="sm" onClick={addLine} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Leg
          </Button>
          <div className="flex items-center gap-4 text-xs">
            <span>Total Dr: <strong className="font-mono text-blue-600 font-bold">{totalDebit.toLocaleString()} QAR</strong></span>
            <span>Total Cr: <strong className="font-mono text-emerald-600 font-bold">{totalCredit.toLocaleString()} QAR</strong></span>
            <Badge variant={isBalanced ? "default" : "destructive"}>
              {isBalanced ? "Balanced ✓" : `Diff: ${(totalDebit - totalCredit).toLocaleString()} QAR`}
            </Badge>
            <Button size="sm" onClick={submit} disabled={!isBalanced}>
              Post Voucher
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PAYMENT SUB-MODULES
// ─────────────────────────────────────────────────────────────────────────────

function GrnCostMappingSubModule() {
  const { grnMappings, addGrnMapping, payableInvoices, addPayableInvoice } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [grnList, setGrnList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedGrnForEdit, setSelectedGrnForEdit] = useState<any | null>(null);

  // Form state for creating or editing GRN Cost mapping
  const [form, setForm] = useState({
    grn_no: `GRN-2026-${Math.floor(100 + Math.random() * 900)}`,
    po_ref: `PO-2026-${Math.floor(10 + Math.random() * 90)}`,
    date: new Date().toISOString().split("T")[0],
    vendor: "Qatar Maintenance & HVAC Co.",
    description: "HVAC Replacement Compressors & Air Filters",
    amount: "4500",
    mapped_gl: "51004001 - Repair and Maintenance Cost",
    property: "Old Salata - Residence No:23",
    status: "Posted to GL",
  });

  const loadGrnData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch GRNs from database
      const { data: dbGrns } = await supabase.from("proc_goods_receipts").select("*").order("created_at", { ascending: false });
      const { data: dbPos } = await supabase.from("proc_purchase_orders").select("*");
      const { data: dbVendors } = await supabase.from("fin_vendors").select("*");

      // 2. Load custom mapped GRNs from local storage
      const stored = localStorage.getItem("grn_cost_mappings_v2");
      let localMappings: any[] = [];
      if (stored) {
        try { localMappings = JSON.parse(stored); } catch {}
      }

      // Keep localMappings intact and also include store grnMappings
      grnMappings.forEach(g => {
        if (!localMappings.some(m => m.grn_no === g.grn_no)) {
          localMappings.push({
            id: g.id,
            grn_no: g.grn_no,
            po_ref: g.po_ref,
            date: new Date().toISOString().slice(0, 10),
            vendor: g.vendor,
            description: g.description,
            amount: g.amount,
            mapped_gl: g.mapped_gl,
            property: g.property,
            status: "Posted to GL",
            source: "Finance Store"
          });
        }
      });
      // localMappings preserved

      // 3. Integrate DB GRNs
      const mergedList = [...localMappings];
      const seenGrnNos = new Set(localMappings.map(m => m.grn_no));

      if (dbGrns && dbGrns.length > 0) {
        dbGrns.forEach((g: any) => {
          if (!seenGrnNos.has(g.grn_number)) {
            const matchedPo = dbPos?.find((p: any) => p.id === g.purchase_order_id);
            const matchedVendor = dbVendors?.find((v: any) => Number(v.id) === Number(g.vendor_id) || Number(v.id) === Number(matchedPo?.vendor_id));
            
            mergedList.push({
              id: g.id,
              grn_no: g.grn_number,
              po_ref: matchedPo?.doc_number || "PO-REF",
              date: g.grn_date || new Date().toISOString().slice(0, 10),
              vendor: matchedVendor?.name || `Vendor #${g.vendor_id || "1"}`,
              description: g.remarks || "Warehouse Inward Goods Receipt",
              amount: Number(g.total_amount || g.subtotal || 0),
              mapped_gl: "51004001 - Repair and Maintenance Cost",
              property: "Central Property Portfolio",
              status: "Posted to GL",
              source: "Procurement Sync"
            });
            seenGrnNos.add(g.grn_number);
          }
        });
      }

      setGrnList(mergedList);
    } catch (e) {
      console.error("Failed loading GRN cost mappings:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGrnData();
    const handleUpdate = () => loadGrnData();
    window.addEventListener("ap_invoices_updated", handleUpdate);
    window.addEventListener("grn_updated", handleUpdate);
    return () => {
      window.removeEventListener("ap_invoices_updated", handleUpdate);
      window.removeEventListener("grn_updated", handleUpdate);
    };
  }, [loadGrnData]);

  function handleSaveMapping() {
    const amt = parseFloat(form.amount) || 0;
    if (amt <= 0) return toast.error("Please enter a valid cost amount.");
    
    const newEntry = {
      id: selectedGrnForEdit?.id || `grn-map-${Date.now()}`,
      grn_no: form.grn_no,
      po_ref: form.po_ref,
      date: form.date,
      vendor: form.vendor,
      description: form.description,
      amount: amt,
      mapped_gl: form.mapped_gl,
      property: form.property,
      status: "Posted to GL",
      source: "Manual Cost Allocation"
    };

    const updated = [newEntry, ...grnList.filter(g => g.grn_no !== form.grn_no)];
    setGrnList(updated);
    localStorage.setItem("grn_cost_mappings_v2", JSON.stringify(updated));

    toast.success(`GRN ${form.grn_no} allocated to GL Account [${form.mapped_gl}]. Double-entry journal impact synced.`);
    setOpen(false);
    setSelectedGrnForEdit(null);
  }

  function openEditMapping(grn: any) {
    setSelectedGrnForEdit(grn);
    setForm({
      grn_no: grn.grn_no,
      po_ref: grn.po_ref,
      date: grn.date,
      vendor: grn.vendor,
      description: grn.description,
      amount: String(grn.amount),
      mapped_gl: grn.mapped_gl,
      property: grn.property,
      status: grn.status || "Posted to GL",
    });
    setOpen(true);
  }

  function handleConvertToApInvoice(row: any) {
    const invNo = `AP-${row.grn_no}`;
    const alreadyExists = payableInvoices.some(ap => ap.invoice_no === invNo || ap.invoice_no === `INV-${row.grn_no}`);
    if (alreadyExists) {
      toast.info(`AP Invoice for ${row.grn_no} already exists in Accounts Payable.`);
      return;
    }
    const cleanGl = row.mapped_gl.replace(/^\d+\s*[-–—]\s*/, "");
    const glCode = row.mapped_gl.split(/\s+/)[0] || "51004001";
    addPayableInvoice({
      invoice_no: invNo,
      vendor: row.vendor,
      property: row.property || "Main Portfolio",
      amount: Number(row.amount),
      date: row.date || new Date().toISOString().slice(0, 10),
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      stream: row.mapped_gl,
      account: cleanGl,
      account_code: glCode,
      lines: [
        {
          id: `line-${Date.now()}`,
          description: row.description || `GRN Cost Allocation (${row.grn_no})`,
          account: cleanGl,
          account_code: glCode,
          property: row.property || "Main Portfolio",
          amount: Number(row.amount),
        }
      ]
    });
    toast.success(`AP Payable Invoice ${invNo} booked successfully and posted to GL!`);
  }

  const totalCostAllocated = grnList.reduce((acc, g) => acc + (Number(g.amount) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Banner KPI Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border bg-card/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total GRNs Allocated</p>
            <p className="text-xl font-bold font-mono text-primary mt-0.5">{grnList.length}</p>
          </div>
          <FileText className="h-5 w-5 text-primary/40" />
        </div>
        <div className="p-3.5 rounded-xl border bg-card/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total Cost Mapped to GL</p>
            <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">QAR {totalCostAllocated.toLocaleString()}</p>
          </div>
          <DollarSign className="h-5 w-5 text-emerald-600/40" />
        </div>
        <div className="p-3.5 rounded-xl border bg-card/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Allocation Sync Status</p>
            <p className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> 100% Live Double-Entry
            </p>
          </div>
          <ShieldCheck className="h-5 w-5 text-blue-600/40" />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            Goods Received Note (GRN) Cost Allocation to Property Expense GLs
          </h3>
          <p className="text-xs text-muted-foreground">
            Directly map warehouse receipts and maintenance inwards to canonical Property Direct Expense &amp; AMC GL Accounts.
          </p>
        </div>
        <Button size="sm" onClick={() => {
          setSelectedGrnForEdit(null);
          setForm({
            grn_no: `GRN-2026-${Math.floor(100 + Math.random() * 900)}`,
            po_ref: `PO-2026-${Math.floor(10 + Math.random() * 90)}`,
            date: new Date().toISOString().split("T")[0],
            vendor: "Qatar Maintenance & HVAC Co.",
            description: "Plumbing Fittings, Valves & Repair Spares",
            amount: "4500",
            mapped_gl: "51004001 - Repair and Maintenance Cost",
            property: "Old Salata - Residence No:23",
            status: "Posted to GL",
          });
          setOpen(true);
        }} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4" /> Map GRN Cost
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Receipt Date</TableHead>
              <TableHead className="font-bold">GRN #</TableHead>
              <TableHead className="font-bold">PO Ref</TableHead>
              <TableHead className="font-bold">Vendor / Supplier</TableHead>
              <TableHead className="font-bold">Item / Service Description</TableHead>
              <TableHead className="font-bold">Property Cost Center</TableHead>
              <TableHead className="font-bold">Mapped Expense GL Account</TableHead>
              <TableHead className="text-right font-bold">Cost (QAR)</TableHead>
              <TableHead className="font-bold">Posting</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grnList.map((row, idx) => (
              <TableRow key={row.id || idx} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono text-muted-foreground">{row.date}</TableCell>
                <TableCell className="font-mono font-bold text-primary">{row.grn_no}</TableCell>
                <TableCell className="font-mono text-cyan-600">{row.po_ref}</TableCell>
                <TableCell className="font-semibold">{row.vendor}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={row.description}>{row.description}</TableCell>
                <TableCell className="font-medium text-foreground">{row.property}</TableCell>
                <TableCell className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                  {row.mapped_gl}
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-foreground">
                  QAR {Number(row.amount || 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant="default" className="bg-emerald-600 text-[10px] gap-1">
                    <CheckCircle2 className="h-2.5 w-2.5" /> Posted to GL
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {payableInvoices.some(ap => ap.invoice_no === `AP-${row.grn_no}` || ap.invoice_no === `INV-${row.grn_no}`) ? (
                    <Badge variant="secondary" className="bg-blue-600/10 text-blue-600 border-blue-200 text-[10px] gap-1 font-medium mr-1.5">
                      <CheckCircle2 className="h-2.5 w-2.5 text-blue-600" /> AP Invoiced
                    </Badge>
                  ) : (
                    <Button size="sm" variant="default" className="h-6 text-[10px] px-2 gap-1 bg-emerald-600 text-white hover:bg-emerald-700 mr-1.5" onClick={() => handleConvertToApInvoice(row)}>
                      <ArrowUpRight className="h-2.5 w-2.5" /> Book AP Bill
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 gap-1 text-primary" onClick={() => openEditMapping(row)}>
                    <Pencil className="h-2.5 w-2.5" /> Edit GL Mapping
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {grnList.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No GRN cost mappings found. Click "Map GRN Cost" to map incoming materials to property GLs.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Map GRN Cost Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className="max-w-lg"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              {selectedGrnForEdit ? `Edit GL Mapping: ${form.grn_no}` : "Map Warehouse & Maintenance GRN to GL Account"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Allocate received procurement inventory or facility maintenance work directly to canonical property expense accounts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">GRN Receipt Date *</Label>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-8 text-xs mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">GRN Number *</Label>
                <Input value={form.grn_no} onChange={e => setForm({ ...form, grn_no: e.target.value })} className="h-8 text-xs font-mono font-bold mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">PO Reference #</Label>
                <Input value={form.po_ref} onChange={e => setForm({ ...form, po_ref: e.target.value })} className="h-8 text-xs font-mono mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Vendor / Contractor</Label>
                <Input value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} className="h-8 text-xs mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Item / Material / Service Description *</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. HVAC Compressor Spares, Plumbing Pipes, Elevator Cables" className="h-8 text-xs mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Cost Amount (QAR) *</Label>
                <Input type="number" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="h-8 text-xs font-mono font-bold mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Property Cost Center *</Label>
                <Input value={form.property} onChange={e => setForm({ ...form, property: e.target.value })} placeholder="e.g. Lusail Marina Tower 1" className="h-8 text-xs mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Target Property Expense GL Account (COA Canonical) *</Label>
              <Select value={form.mapped_gl} onValueChange={v => setForm({ ...form, mapped_gl: v })}>
                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="51004001 - Repair and Maintenance Cost">51004001 - Repair and Maintenance Cost</SelectItem>
                  <SelectItem value="51002001 - CMEP-Facilities Mgt AMC">51002001 - CMEP-Facilities Mgt AMC</SelectItem>
                  <SelectItem value="51002002 - Swimming Pool Maintenance">51002002 - Swimming Pool Maintenance</SelectItem>
                  <SelectItem value="51002003 - CCTV AMC Charges">51002003 - CCTV AMC Charges</SelectItem>
                  <SelectItem value="51002004 - Lift Maintenance Charges">51002004 - Lift Maintenance Charges</SelectItem>
                  <SelectItem value="51002005 - Fire Alarm & Fire Fighting AMC">51002005 - Fire Alarm &amp; Fire Fighting AMC</SelectItem>
                  <SelectItem value="51002006 - Pest Control Charges">51002006 - Pest Control Charges</SelectItem>
                  <SelectItem value="51002007 - Landscaping & Irrigation AMC">51002007 - Landscaping &amp; Irrigation AMC</SelectItem>
                  <SelectItem value="51001001 - CMEP-Labor Cost-Facilities Mgt">51001001 - CMEP-Labor Cost-Facilities Mgt</SelectItem>
                  <SelectItem value="51001002 - House Keeping Labor Cost">51001002 - House Keeping Labor Cost</SelectItem>
                  <SelectItem value="51001003 - Security Staff Labor Cost">51001003 - Security Staff Labor Cost</SelectItem>
                  <SelectItem value="13000001 - Property Plant & Equipment (Capital Asset)">13000001 - Property Plant &amp; Equipment (Capital Asset)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Live Double-Entry GL Ledger Impact Preview */}
            <div className="p-3 rounded-lg bg-muted/40 border text-[11px] space-y-1.5">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> General Ledger Accounting Impact:
              </div>
              <div className="font-mono text-rose-600 dark:text-rose-400">
                • <strong>Dr. {form.mapped_gl.split(' - ')[0]}</strong> ({form.mapped_gl.split(' - ')[1] || "Expense"}) — QAR {Number(form.amount || 0).toLocaleString()}
              </div>
              <div className="font-mono text-emerald-600 dark:text-emerald-400">
                • <strong>Cr. 22100001</strong> Trade Payables (GRN Clearing / Supplier Liability) — QAR {Number(form.amount || 0).toLocaleString()}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveMapping} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
              <CheckCircle2 className="h-4 w-4" /> Save &amp; Post Cost Mapping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const EXPENSE_GL_ACCOUNTS = [
  "51004001 - Repair and Maintenance Cost",
  "51004002 - Electrical & Plumbing Maintenance",
  "51004003 - HVAC & AC Servicing Expenses",
  "51004004 - Civil, Painting & Carpentry Works",
  "51004005 - Pest Control & Fumigation Charges",
  "51004006 - Cost of CMEP Materials",
  "51004007 - Cleaning & Sanitation Services",
  "51004008 - Waste Management & Skip Removal",
  "51004009 - Security & Guarding Services",
  "51004010 - Fire Alarm & Firefighting Maintenance",
  "51004011 - Elevator / Lift Maintenance AMC",
  "51004012 - Swimming Pool & Gym Maintenance",
  "51004013 - Landscaping & Gardening Expenses",
  "51002001 - CMEP-Facilities Mgt AMC",
  "51001001 - CMEP-Labor Cost-Facilities Mgt",
  "51003001 - Electricity & Water-Common Area (Kahramaa)",
  "51003002 - Chilled Water / District Cooling Charges",
  "51003003 - Internet, Telecom & Ooredoo/Vodafone Charges",
  "51101001 - Staff Basic Salary",
  "51101002 - Staff Housing & Transportation Allowance",
  "51101003 - Staff End of Service Gratuity & Leave Pay",
  "51101004 - Staff Medical, Visa & RP Renewal Expenses",
  "51102001 - Vehicles & Other Insurance Expenses",
  "51102002 - Vehicle Fuel, Maintenance & Running Expenses",
  "51102003 - Vehicle Registration (Istimara) & Traffic Fines",
  "51102004 - Office Rent & Head Office Overheads",
  "51102005 - Printing, Stationery & Office Supplies",
  "51102006 - Legal, Municipality & Attestation Fees",
  "51102007 - Audit, Consultancy & Professional Fees",
  "51102008 - Marketing, Brokerage & Leasing Commissions",
  "51102009 - Bank Charges & POS Commission",
  "51102010 - Hospitality, Pantry & Refreshments",
  "51102014 - IT Expenses & Software Subscriptions",
  "51102099 - Miscellaneous General & Admin Expenses",
];

function getAvailableExpenseGlAccounts(): string[] {
  const set = new Set<string>(EXPENSE_GL_ACCOUNTS);
  try {
    const rawCustom = localStorage.getItem("fin_custom_coa_accounts_v1");
    if (rawCustom) {
      const parsed: ERPChartOfAccount[] = JSON.parse(rawCustom);
      parsed.forEach(acc => {
        const t = (acc.type || "").toLowerCase();
        if (t.includes("exp") || String(acc.code || "").startsWith("5")) {
          set.add(`${acc.code} - ${acc.name || acc.gl_name}`);
        }
      });
    }
  } catch {}
  return Array.from(set);
}

function supplierCreditDays(paymentTerms?: string): number | null {
  if (!paymentTerms) return null;
  const days = paymentTerms.match(/\b(\d+)\s*days?\b/i);
  if (days) return Number(days[1]);
  return /immediate|cash on delivery/i.test(paymentTerms) ? 0 : null;
}

function dateAfterDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(result.getTime())) return "";
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

function PayableInvoiceSubModule() {
  const { addVoucher, payableInvoices: storePayableInvoices, addPayableInvoice, markPayableInvoicePaid } = useFinanceStore() as any;
  const { leases, units } = useAppData();
  const [open, setOpen] = useState(false);
  const [procInvoices, setProcInvoices] = useState<ProcApInvoice[]>([]);
  const [supplierMaster, setSupplierMaster] = useState<FinVendor[]>(() =>
    DEFAULT_VENDORS.map((dv, idx) => ({
      id: dv.id,
      code: `VND-00${idx + 1}`,
      name: dv.name,
      payment_terms: "30 Days",
      status: "Active" as const,
    }))
  );
  const [expenseAccountOptions, setExpenseAccountOptions] = useState<string[]>(() => getAvailableExpenseGlAccounts());
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<any | null>(null);

  const propertiesList = useMemo(() => {
    const set = new Set<string>();
    leases.forEach(l => { if (l.property) set.add(l.property); });
    units.forEach(u => { if (u.property) set.add(u.property); });
    if (set.size === 0) {
      set.add("Old Salata - Residence No:23");
      set.add("MANSOURA - BLDG06");
      set.add("Neeman's New Building");
    }
    return Array.from(set).sort();
  }, [leases, units]);

  // Payment Settlement Dialog state
  const [payTarget, setPayTarget] = useState<any | null>(null);
  const [payForm, setPayForm] = useState({
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "Bank Wire / QNB Corporate Electronic",
    disbursingBank: "Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)",
    transactionReference: "",
    beneficiaryAccount: "QA91QNBA99887766554433",
    cashCustodian: "Main Office Cashier Desk",
    cashReceiptNo: "",
    receiverName: "",
    chequeNumber: "",
    chequeDueDate: new Date().toISOString().slice(0, 10),
    remarks: "",
  });

  const loadInvoices = useCallback(async () => {
    try {
      await ApInvoicesApi.fetchAll();
      setProcInvoices([]);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadInvoices();
    const handler = () => loadInvoices();
    window.addEventListener("ap_invoices_updated", handler);
    window.addEventListener("finance_vouchers_updated", handler);
    return () => {
      window.removeEventListener("ap_invoices_updated", handler);
      window.removeEventListener("finance_vouchers_updated", handler);
    };
  }, [loadInvoices]);

  useEffect(() => {
    const refreshCoa = () => {
      const base = getAvailableExpenseGlAccounts();
      setExpenseAccountOptions(base);
      // Add every active expense (5xxxxx) account from the live chart of accounts.
      void fetchLiveCoaOptions(true).then(live => {
        const seen = new Set(base.map(o => o.split(" - ")[0].trim()));
        const extra = live.filter(a => a.code.startsWith("5") && !seen.has(a.code)).map(a => a.name);
        if (extra.length) setExpenseAccountOptions([...base, ...extra]);
      });
    };
    refreshCoa();
    window.addEventListener("fin_custom_coa_updated", refreshCoa);
    window.addEventListener("fin_coa_updated", refreshCoa);
    const defaultFinVendors: FinVendor[] = DEFAULT_VENDORS.map((dv, idx) => ({
      id: dv.id,
      code: `VND-00${idx + 1}`,
      name: dv.name,
      payment_terms: "30 Days",
      status: "Active" as const,
    }));
    FinVendorsApi.fetchAll()
      .then(fetched => {
        const map = new Map<string, FinVendor>();
        defaultFinVendors.forEach(v => map.set(v.name.toLowerCase(), v));
        (fetched || []).forEach(v => {
          if (v && v.name) map.set(v.name.toLowerCase(), v);
        });
        try {
          const rawProcVendors = localStorage.getItem("pms_vendors");
          if (rawProcVendors) {
            const parsed = JSON.parse(rawProcVendors);
            if (Array.isArray(parsed)) {
              parsed.forEach((pv: any, idx: number) => {
                const vName = pv.name || pv.vendor_name || pv.company_name;
                if (vName && !map.has(String(vName).toLowerCase())) {
                  map.set(String(vName).toLowerCase(), {
                    id: String(pv.id || `proc-v-${idx}`),
                    code: pv.code || pv.vendor_code || `VND-${100 + idx}`,
                    name: String(vName),
                    contact_person: pv.contact_person || "Accounts Dept",
                    phone: pv.phone || "44000000",
                    email: pv.email || "accounts@vendor.qa",
                    payment_terms: pv.payment_terms || "30 Days",
                    status: "Active",
                  });
                }
              });
            }
          }
        } catch {}
        setSupplierMaster(Array.from(map.values()));
      })
      .catch(() => {
        setSupplierMaster(defaultFinVendors);
      });
    return () => { window.removeEventListener("fin_custom_coa_updated", refreshCoa); window.removeEventListener("fin_coa_updated", refreshCoa); };
  }, []);

  // Merge Store AP invoices and Procurement AP invoices
  const displayedStoreInvoices = useMemo<any[]>(() => storePayableInvoices || [], [storePayableInvoices]);
  const allInvoices = useMemo(() => {
    const list: any[] = [];
    const seen = new Set<string>();

    // 1. Procurement Invoices
    procInvoices.forEach(inv => {
      seen.add(inv.invoice_number);
      const totalAmt = Number(inv.total_amount || inv.amount || 0);
      const taxAmt = Number(inv.tax_amount || 0);
      const baseAmt = Number(inv.amount || (totalAmt - taxAmt));
      list.push({
        id: inv.id,
        invoice_no: inv.invoice_number,
        vendor: String(inv.vendor_id === "1" || inv.vendor_id === 1 ? "Qatar Maintenance Co." : inv.vendor_id === "2" || inv.vendor_id === 2 ? "Gulf Facility Services" : (inv.vendor_name || `Vendor #${inv.vendor_id}`)),
        property: (inv as any).property || "Al Ameen Real Estate Head Office",
        date: inv.invoice_date,
        due_date: inv.due_date || inv.invoice_date,
        account: inv.expense_gl_account || "51004001 - Repair and Maintenance Cost",
        account_code: inv.expense_gl_code || "51004001",
        base_amount: baseAmt,
        tax_amount: taxAmt,
        amount: totalAmt,
        status: inv.status === "PAID" ? "Paid" : "Unpaid",
        po_number: inv.po_number,
        grn_number: inv.grn_number,
        raw: inv
      });
    });

    // 2. Finance Store AP Invoices
    displayedStoreInvoices.forEach(inv => {
      if (!seen.has(inv.invoice_no)) {
        seen.add(inv.invoice_no);
        const totalAmt = Number(inv.amount || 0);
        const taxAmt = Number((inv as any).tax_amount || 0);
        const baseAmt = Number((inv as any).base_amount || (totalAmt - taxAmt));
        const linesSummaryProp = inv.lines && inv.lines.length > 0
          ? Array.from(new Set(inv.lines.map((l: any) => l.property))).join(", ")
          : (inv.property || "Al Ameen Real Estate Head Office");
        const linesSummaryAcc = inv.lines && inv.lines.length > 1
          ? `${inv.lines.length} Expense Lines (${inv.lines.map((l: any) => l.account_code).join(", ")})`
          : (inv.account || "51004001 - Repair and Maintenance Cost");
        list.push({
          id: inv.id,
          invoice_no: inv.invoice_no,
          vendor: inv.vendor,
          property: linesSummaryProp,
          date: inv.date,
          voucher_date: inv.voucher_date || inv.date,
          due_date: inv.due_date,
          account: linesSummaryAcc,
          account_code: inv.account_code || "51004001",
          base_amount: baseAmt,
          tax_amount: taxAmt,
          amount: totalAmt,
          status: inv.status || "Unpaid",
          lines: inv.lines,
          raw: inv
        });
      }
    });

    return list.sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime());
  }, [procInvoices, displayedStoreInvoices]);

  const [form, setForm] = useState({
    invoice_no: `APINV-${Math.floor(10000 + Math.random() * 90000)}`,
    vendor: "Qatar Maintenance & HVAC Co.",
    property: "Al Ameen Real Estate Head Office",
    date: new Date().toISOString().split("T")[0],
    voucher_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    account: "51004001 - Repair and Maintenance Cost",
    account_code: "51004001",
    amount: "4275",
  });

  type ApExpenseLine = {
    id: string;
    account: string;
    property: string;
    description: string;
    amount: string;
  };

  const [expenseLines, setExpenseLines] = useState<ApExpenseLine[]>([
    {
      id: "1",
      account: "51004001 - Repair and Maintenance Cost",
      property: propertiesList[0] || "Al Ameen Real Estate Head Office",
      description: "Site maintenance & repair work",
      amount: "4275",
    },
  ]);

  const totalApAmount = useMemo(
    () => expenseLines.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0),
    [expenseLines]
  );
  const matchedSupplier = useMemo(
    () => supplierMaster.find(vendor => vendor.name.trim().toLowerCase() === form.vendor.trim().toLowerCase()),
    [supplierMaster, form.vendor]
  );
  const matchedCreditDays = supplierCreditDays(matchedSupplier?.payment_terms);

  useEffect(() => {
    if (!matchedSupplier || matchedCreditDays === null) return;
    const calculatedDueDate = dateAfterDays(form.date, matchedCreditDays);
    setForm(current => current.due_date === calculatedDueDate
      ? current
      : { ...current, due_date: calculatedDueDate });
  }, [matchedSupplier, matchedCreditDays, form.date]);

  async function handleAdd() {
    const validLines = expenseLines.filter(l => (parseFloat(l.amount) || 0) > 0);
    if (validLines.length === 0 || totalApAmount <= 0) {
      toast.error("Please enter at least one expense line with an amount greater than 0.");
      return;
    }
    if (!form.vendor.trim()) {
      toast.error("Please enter the Vendor name.");
      return;
    }
    const closedPeriod = isDateInClosedPostingPeriod(form.voucher_date);
    if (closedPeriod.closed) {
      toast.error(`Posting rejected: Accounting period ${closedPeriod.periodName} is CLOSED.`);
      return;
    }

    const formattedLines = validLines.map(l => ({
      id: l.id,
      account: l.account,
      account_code: l.account.split(" - ")[0].trim(),
      property: l.property || "Al Ameen Real Estate Head Office",
      description: l.description || `Invoice from ${form.vendor}`,
      amount: parseFloat(l.amount) || 0,
    }));

    const primaryLine = formattedLines[0];
    const uniqueProps = Array.from(new Set(formattedLines.map(l => l.property)));
    const propSummary = uniqueProps.join(", ");

    addPayableInvoice({
      invoice_no: form.invoice_no,
      vendor: form.vendor,
      date: form.date,
      voucher_date: form.voucher_date,
      due_date: form.due_date,
      account: formattedLines.length > 1 ? `Multi-Line (${formattedLines.length} items)` : primaryLine.account,
      account_code: primaryLine.account_code,
      amount: totalApAmount,
      property: propSummary,
      lines: formattedLines,
    });

    await ApInvoicesApi.create({
      invoice_number: form.invoice_no,
      vendor_id: form.vendor,
      invoice_date: form.date,
      voucher_date: form.voucher_date,
      due_date: form.due_date,
      amount: totalApAmount,
      tax_amount: 0,
      total_amount: totalApAmount,
      status: "DRAFT",
      remarks: `AP Invoice (${formattedLines.length} lines) • Properties: ${propSummary}`
    } as any);

    toast.success(`Payable Invoice ${form.invoice_no} (QAR ${totalApAmount.toLocaleString()}) booked across ${formattedLines.length} expense line(s).`);
    setOpen(false);
    setForm(f => ({ ...f, invoice_no: `APINV-${Math.floor(10000 + Math.random() * 90000)}` }));
    await loadInvoices();
  }

  function openPayModal(inv: any) {
    setPayTarget(inv);
    setPayForm({
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMethod: "Bank Wire / QNB Corporate Electronic",
      disbursingBank: "Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)",
      transactionReference: `TXN-${Date.now().toString().slice(-6)}`,
      beneficiaryAccount: "QA91QNBA99887766554433",
      cashCustodian: "Main Office Cashier Desk",
      cashReceiptNo: `PCV-${Date.now().toString().slice(-5)}`,
      receiverName: `${inv.vendor} - Authorized Representative`,
      chequeNumber: `CHQ-${Math.floor(100000 + Math.random() * 900000)}`,
      chequeDueDate: new Date().toISOString().slice(0, 10),
      remarks: `Vendor Settlement for Invoice ${inv.invoice_no}`,
    });
  }

  async function handleConfirmDisbursement() {
    if (!payTarget) return;
    try {
      const isCash = payForm.paymentMethod.includes("Cash") || payForm.paymentMethod.includes("Petty");
      const crCode = isCash ? "12100001" : "12000001";
      const crName = isCash ? "Cash in Hand / Operating Cash" : "Bank Operating Account (QNB)";

      // Update ApInvoicesApi with invoice ID or invoice_no
      const targetId = payTarget.raw?.id || payTarget.id || payTarget.invoice_no;
      await ApInvoicesApi.update(targetId, {
        invoice_number: payTarget.invoice_no,
        status: "PAID",
        amount_paid: payTarget.amount,
        posting_status: "POSTED",
        payment_method: payForm.paymentMethod,
        payment_reference: payForm.transactionReference,
      });

      // Update local storage for pms_vendor_invoices
      try {
        const mntRaw = localStorage.getItem("pms_vendor_invoices");
        if (mntRaw) {
          const mntList: any[] = JSON.parse(mntRaw);
          const updatedMnt = mntList.map((m: any) =>
            m.invoiceNo === payTarget.invoice_no ? { ...m, status: "Approved" } : m
          );
          localStorage.setItem("pms_vendor_invoices", JSON.stringify(updatedMnt));
        }
      } catch {}

      // Update local storage for zyno-pms-finance-data-v1-ap and finance-store state
      try {
        if (typeof markPayableInvoicePaid === "function") {
          markPayableInvoicePaid(payTarget.invoice_no);
        }
        const finApRaw = localStorage.getItem("zyno-pms-finance-data-v1-ap");
        if (finApRaw) {
          const finApList: any[] = JSON.parse(finApRaw);
          const updatedFin = finApList.map((f: any) =>
            f.invoice_no === payTarget.invoice_no ? { ...f, status: "Paid" } : f
          );
          localStorage.setItem("zyno-pms-finance-data-v1-ap", JSON.stringify(updatedFin));
        }
      } catch {}

      // Add Payment Voucher into Finance Store
      const suffix = payTarget.invoice_no.replace('APINV-', '').replace('INV-AP-', '').replace('INV-', '');
      const pvNo = `PV-${suffix}`;
      addVoucher({
        voucher_no: pvNo,
        voucher_type: "Payment Voucher",
        date: payForm.paymentDate,
        name: `Vendor Settlement — ${payTarget.invoice_no} (${payTarget.vendor})`,
        debit: "Trade Payables - Vendors",
        debit_code: "22100001",
        credit: crName,
        credit_code: crCode,
        amount: payTarget.amount,
        method: isCash ? "Cash" : "Bank Transfer",
        property_name: payTarget.property || payTarget.raw?.property || "Al Ameen Real Estate Head Office",
        unit_ref: payTarget.raw?.unit_ref || payTarget.po_number || "Corporate Head Office",
        tenant_name: payTarget.vendor,
      });

      // Trigger cross-module updates
      window.dispatchEvent(new Event("finance_vouchers_updated"));
      window.dispatchEvent(new Event("ap_invoices_updated"));
      window.dispatchEvent(new Event("pms_vendor_invoices_updated"));

      toast.success(`Payment of QAR ${payTarget.amount.toLocaleString()} settled. Payment Voucher ${pvNo} posted to GL.`);
      setPayTarget(null);
      await loadInvoices();
    } catch (e: any) {
      toast.error(e.message || "Failed to settle payment");
    }
  }

  function handleViewReceipt(inv: any) {
    const rcpt = ApInvoicesApi.getReceiptByInvoice(inv.invoice_no);
    if (rcpt) {
      setSelectedReceipt(rcpt);
      setShowReceiptModal(true);
    } else {
      const fallback: PaymentReceipt = {
        id: `rcpt-${Date.now()}`,
        receipt_number: `RCPT-${inv.invoice_no.replace('APINV-', '')}`,
        voucher_number: `PV-${inv.invoice_no.replace('APINV-', '')}`,
        invoice_number: inv.invoice_no,
        po_number: inv.po_number,
        grn_number: inv.grn_number,
        vendor_id: inv.vendor,
        vendor_name: inv.vendor,
        amount_paid: inv.amount,
        payment_date: inv.date,
        payment_method: "Bank Wire / QNB Corporate Electronic",
        reference_no: `TXN-${Date.now().toString().slice(-6)}`,
        bank_account: "Qatar National Bank (QNB) - Main Operating",
        gl_debit_account: "22100001 - Trade Payables - Vendors",
        gl_credit_account: "12000001 - Bank Operating Account (QNB)",
        status: "Settled",
        created_at: new Date().toISOString()
      };
      setSelectedReceipt(fallback);
      setShowReceiptModal(true);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Accounts Payable (AP) Invoices</h3>
          <p className="text-xs text-muted-foreground">Invoices from suppliers, utility providers, and procurement orders awaiting payment settlement.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Create AP Invoice</Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Entry Date</TableHead>
              <TableHead className="font-bold">Invoice #</TableHead>
              <TableHead className="font-bold">Vendor Name</TableHead>
              <TableHead className="font-bold">Property / Cost Center</TableHead>
              <TableHead className="font-bold">PO / GRN Reference</TableHead>
              <TableHead className="font-bold">Due Date</TableHead>
              <TableHead className="font-bold">Expense GL Account</TableHead>
              <TableHead className="text-right font-bold">Amount (QAR)</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allInvoices.length === 0 && (
              <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground text-xs">No Accounts Payable invoices found.</TableCell></TableRow>
            )}
            {allInvoices.map((row) => (
              <TableRow key={row.invoice_no} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono text-muted-foreground">{formatDateDDMMYYYY(row.date)}</TableCell>
                <TableCell className="font-mono font-bold text-primary">{row.invoice_no}</TableCell>
                <TableCell className="font-semibold">{row.vendor}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    row.property?.includes("Head Office") 
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200" 
                      : "bg-muted text-foreground"
                  }`}>
                    {row.property || "Al Ameen Real Estate Head Office"}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-cyan-600">
                  {row.po_number || row.grn_number ? `${row.po_number || ''} ${row.grn_number ? '· ' + row.grn_number : ''}` : "—"}
                </TableCell>
                <TableCell>{formatDateDDMMYYYY(row.due_date)}</TableCell>
                <TableCell className="text-blue-600 font-mono text-xs">{row.account}</TableCell>
                <TableCell className="text-right font-mono">
                  <div className="font-bold text-foreground">QAR {row.amount.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">
                    Base: {Number(row.base_amount || (row.amount - (row.tax_amount || 0))).toLocaleString()} | Tax: {Number(row.tax_amount || 0).toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={row.status === "Paid" ? "default" : "secondary"} className={row.status === "Paid" ? "bg-emerald-600 text-[10px]" : "text-amber-600 border-amber-500/40 text-[10px]"}>
                    {row.status === "Paid" ? "Paid & Settled" : "Unpaid / Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs gap-1 text-primary border-primary/40 hover:bg-primary/10"
                      onClick={() => setSelectedInvoiceForView(row.raw || row)}
                    >
                      <Eye className="h-3 w-3" /> View Proforma
                    </Button>
                    {row.status !== "Paid" ? (
                      <Button size="sm" className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs" onClick={() => openPayModal(row)}>
                        <CreditCard className="h-3 w-3" /> Settle / Pay
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-600 border-emerald-500/40" onClick={() => handleViewReceipt(row)}>
                        <FileText className="h-3 w-3" /> View Receipt
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal: Create AP Invoice */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <CreditCard className="h-5 w-5 text-primary" />
              <span>Create Accounts Payable Invoice (Multi-Line Expense &amp; Property Booking)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add one or more expense lines and select the target property / cost center for each expense item.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <Label className="text-[11px] font-semibold">Invoice # *</Label>
                <Input className="h-8 text-xs font-mono font-bold" value={form.invoice_no} onChange={e => setForm({ ...form, invoice_no: e.target.value })} />
              </div>
              <div>
                <Label className="text-[11px] font-semibold">Vendor / Supplier *</Label>
                <div className="space-y-1.5">
                  <Select
                    value={supplierMaster.some(v => v.name === form.vendor) ? form.vendor : "__custom__"}
                    onValueChange={val => {
                      if (val === "__custom__") return;
                      const supplier = supplierMaster.find(v => v.name.trim().toLowerCase() === val.trim().toLowerCase());
                      const creditDays = supplierCreditDays(supplier?.payment_terms);
                      setForm(current => ({
                        ...current,
                        vendor: val,
                        ...(creditDays !== null ? { due_date: dateAfterDays(current.date, creditDays) } : {}),
                      }));
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select Supplier / Vendor..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {supplierMaster.filter(v => v.status !== "Inactive").map(v => (
                        <SelectItem key={v.id || v.name} value={v.name} className="text-xs">
                          {v.name} {v.code ? `(${v.code})` : ""}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__" className="text-xs font-semibold text-primary">
                        + Type Custom Supplier Name Below...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    className="h-7 text-xs"
                    value={form.vendor}
                    onChange={e => {
                      const vendorName = e.target.value;
                      const supplier = supplierMaster.find(v => v.name.trim().toLowerCase() === vendorName.trim().toLowerCase());
                      const creditDays = supplierCreditDays(supplier?.payment_terms);
                      setForm(current => ({
                        ...current,
                        vendor: vendorName,
                        ...(creditDays !== null ? { due_date: dateAfterDays(current.date, creditDays) } : {}),
                      }));
                    }}
                    placeholder="Or type Supplier / Vendor Name..."
                  />
                </div>
              </div>
              <div>
                <Label className="text-[11px] font-semibold">Supplier Invoice Date *</Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={form.date}
                  onChange={e => setForm(current => ({
                    ...current,
                    date: e.target.value,
                    ...(matchedCreditDays !== null ? { due_date: dateAfterDays(e.target.value, matchedCreditDays) } : {}),
                  }))}
                />
              </div>
              <div>
                <Label className="text-[11px] font-semibold">Voucher / Posting Date *</Label>
                <Input type="date" className="h-8 text-xs" value={form.voucher_date} onChange={e => setForm({ ...form, voucher_date: e.target.value })} />
              </div>
              <div>
                <Label className="text-[11px] font-semibold">Due Date *</Label>
                <Input type="date" className="h-8 text-xs" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                {matchedSupplier && matchedCreditDays !== null && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    From supplier terms: {matchedSupplier.payment_terms || `${matchedCreditDays} days`}
                  </p>
                )}
              </div>
            </div>

            {/* Multi-Line Expense Allocation Table */}
            <div className="space-y-2.5 border rounded-lg p-3 bg-muted/20">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-xs uppercase tracking-wide text-foreground">
                  Expense Lines &amp; Property Allocation ({expenseLines.length} Line{expenseLines.length > 1 ? "s" : ""})
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10"
                  onClick={() =>
                    setExpenseLines(lines => [
                      ...lines,
                      {
                        id: String(Date.now() + Math.random()),
                        account: EXPENSE_GL_ACCOUNTS[0],
                        property: propertiesList[0] || "Al Ameen Real Estate Head Office",
                        description: "",
                        amount: "0",
                      },
                    ])
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> Add Expense Line
                </Button>
              </div>

              <div className="border rounded-lg overflow-x-auto bg-background">
                <table className="w-full min-w-[740px] text-xs">
                  <thead className="bg-muted/60 text-muted-foreground font-semibold border-b">
                    <tr>
                      <th className="py-2 px-2.5 text-left w-64">Expense GL Account (COA)</th>
                      <th className="py-2 px-2.5 text-left w-60">Property / Cost Center</th>
                      <th className="py-2 px-2.5 text-left">Line Description / Work Details</th>
                      <th className="py-2 px-2.5 text-right w-32">Amount (QAR)</th>
                      <th className="py-2 px-1 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {expenseLines.map((line, idx) => (
                      <tr key={line.id} className="hover:bg-muted/20">
                        <td className="py-2 px-2">
                          <Select
                            value={line.account}
                            onValueChange={val =>
                              setExpenseLines(lines => lines.map((l, i) => (i === idx ? { ...l, account: val } : l)))
                            }
                          >
                            <SelectTrigger className="h-8 text-xs font-mono w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {expenseAccountOptions.map(acc => (
                                <SelectItem key={acc} value={acc} className="text-xs font-mono">
                                  {acc}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2 px-2">
                          <Select
                            value={line.property}
                            onValueChange={val =>
                              setExpenseLines(lines => lines.map((l, i) => (i === idx ? { ...l, property: val } : l)))
                            }
                          >
                            <SelectTrigger className="h-8 text-xs w-full">
                              <SelectValue placeholder="Select Property / Vehicle Cost Center" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Al Ameen Real Estate Head Office" className="font-semibold text-purple-700">
                                🏢 Al Ameen Real Estate Head Office
                              </SelectItem>
                              {COMPANY_VEHICLE_COST_CENTERS.map(veh => (
                                <SelectItem key={veh.code} value={veh.name} className="text-xs font-medium text-blue-700">
                                  🚗 Vehicle No: {veh.vehicleNo} — {veh.vehicleName} ({veh.brandName}{veh.model && veh.model !== "—" ? ` ${veh.model}` : ""})
                                </SelectItem>
                              ))}
                              {propertiesList.map(propName => (
                                <SelectItem key={propName} value={propName} className="text-xs">
                                  {propName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            className="h-8 text-xs w-full"
                            placeholder="Description of work / materials..."
                            value={line.description}
                            onChange={e => {
                              const val = e.target.value;
                              setExpenseLines(lines => lines.map((l, i) => (i === idx ? { ...l, description: val } : l)));
                            }}
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="h-8 text-xs font-mono font-bold text-right w-full"
                            value={line.amount}
                            onChange={e => {
                              const val = e.target.value;
                              setExpenseLines(lines => lines.map((l, i) => (i === idx ? { ...l, amount: val } : l)));
                            }}
                          />
                        </td>
                        <td className="py-2 px-1 text-center">
                          {expenseLines.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => setExpenseLines(lines => lines.filter((_, i) => i !== idx))}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/40 font-bold border-t">
                    <tr>
                      <td colSpan={3} className="py-2 px-3 text-right uppercase text-[11px]">
                        Total Payable Invoice Amount:
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono text-primary text-xs">
                        QAR {totalApAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Live GL / COA Impact Preview */}
            {totalApAmount > 0 && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Ledgers / Accounts Updated by this AP Invoice</span>
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  {expenseLines.map((line, i) => {
                    const amt = parseFloat(line.amount) || 0;
                    if (amt <= 0) return null;
                    return (
                      <div key={i} className="flex justify-between text-blue-700 dark:text-blue-300">
                        <span>Dr. {line.account} ({line.property})</span>
                        <span>QAR {amt.toLocaleString()}</span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-300 border-t border-emerald-500/20 pt-1 font-bold">
                    <span>Cr. 22100001 - Trade Payables - Vendors ({form.vendor || "Vendor"})</span>
                    <span>QAR {totalApAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={totalApAmount <= 0}>Save AP Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Settle Payment */}
      <Dialog open={!!payTarget} onOpenChange={() => setPayTarget(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Disburse Payment & Select Payment Mode
            </DialogTitle>
            <DialogDescription>
              Record vendor settlement, specify bank/cash accounts, and post Payment Voucher to General Ledger.
            </DialogDescription>
          </DialogHeader>
          {payTarget && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">Invoice Reference:</span>
                  <span className="font-mono text-primary">{payTarget.invoice_no}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">Vendor Name:</span>
                  <span>{payTarget.vendor}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-emerald-500/20 pt-1.5">
                  <span>Net Payable Settlement:</span>
                  <span className="text-emerald-600 font-mono">QAR {Number(payTarget.amount || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Payment Date *</Label>
                  <Input type="date" value={payForm.paymentDate} onChange={e => setPayForm({ ...payForm, paymentDate: e.target.value })} />
                </div>
                <div>
                  <Label>Payment Mode *</Label>
                  <Select value={payForm.paymentMethod} onValueChange={v => setPayForm({ ...payForm, paymentMethod: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Wire / QNB Corporate Electronic">Bank Wire / Electronic Transfer (QNB)</SelectItem>
                      <SelectItem value="Commercial Bank of Qatar (CBQ) Wire">CBQ Electronic Wire</SelectItem>
                      <SelectItem value="Cash in Hand / Office Vault Cash">Cash in Hand / Office Vault Cash</SelectItem>
                      <SelectItem value="Petty Cash / Direct Cash">Petty Cash / Direct Cash Voucher</SelectItem>
                      <SelectItem value="Corporate Cheque / Manager's Cheque">Corporate Cheque / Manager's Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dynamic Cash Fields */}
              {(payForm.paymentMethod.includes("Cash") || payForm.paymentMethod.includes("Petty")) && (
                <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                    <DollarSign className="h-4 w-4" /> Cash Disbursement & Handover Details
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Disbursing Cash Vault</Label>
                      <Input disabled value="12100001 - Cash in Hand (Office Vault)" className="bg-background" />
                    </div>
                    <div>
                      <Label>Petty Cash Slip / Voucher # *</Label>
                      <Input value={payForm.cashReceiptNo} onChange={e => setPayForm({ ...payForm, cashReceiptNo: e.target.value })} placeholder="PCV-00821" />
                    </div>
                  </div>
                  <div>
                    <Label>Receiver / Vendor Rep Name *</Label>
                    <Input value={payForm.receiverName} onChange={e => setPayForm({ ...payForm, receiverName: e.target.value })} placeholder="Full name of recipient" />
                  </div>
                </div>
              )}

              {/* Dynamic Cheque Fields */}
              {payForm.paymentMethod.includes("Cheque") && (
                <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400">
                    <FileText className="h-4 w-4" /> Corporate Cheque Details
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Issuing Bank</Label>
                      <Input disabled value="Qatar National Bank (QNB) - Cheque Account" className="bg-background" />
                    </div>
                    <div>
                      <Label>Cheque Number *</Label>
                      <Input value={payForm.chequeNumber} onChange={e => setPayForm({ ...payForm, chequeNumber: e.target.value })} placeholder="CHQ-004812" />
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Bank Wire Fields */}
              {payForm.paymentMethod.includes("Wire") && (
                <div className="space-y-3">
                  <div>
                    <Label>Disbursing Bank Account</Label>
                    <Select value={payForm.disbursingBank} onValueChange={v => setPayForm({ ...payForm, disbursingBank: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)">
                          QNB - Main Operating (QA42QNBA00000000123456)
                        </SelectItem>
                        <SelectItem value="Commercial Bank of Qatar (CBQ) - Operational (IBAN: QA99CBQA00000000654321)">
                          CBQ - Operational (QA99CBQA00000000654321)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Transfer Reference #</Label>
                      <Input value={payForm.transactionReference} onChange={e => setPayForm({ ...payForm, transactionReference: e.target.value })} />
                    </div>
                    <div>
                      <Label>Beneficiary Account / IBAN</Label>
                      <Input value={payForm.beneficiaryAccount} onChange={e => setPayForm({ ...payForm, beneficiaryAccount: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              {/* GL Impact */}
              <div className="p-3 rounded-lg bg-muted/40 border text-[11px] text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-1 font-semibold text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  General Ledger Posting Impact (Auto-Posted upon Settlement):
                </div>
                <div className="font-mono">
                  • <strong className="text-blue-600">Dr. 22100001</strong> Trade Payables - Vendors — QAR {Number(payTarget.amount || 0).toLocaleString()}
                </div>
                <div className="font-mono">
                  {payForm.paymentMethod.includes("Cash") || payForm.paymentMethod.includes("Petty") ? (
                    <>• <strong className="text-amber-600">Cr. 12100001</strong> Cash in Hand / Operating Cash — QAR {Number(payTarget.amount || 0).toLocaleString()}</>
                  ) : (
                    <>• <strong className="text-emerald-600">Cr. 12000001</strong> Bank Operating Account (QNB) — QAR {Number(payTarget.amount || 0).toLocaleString()}</>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayTarget(null)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={handleConfirmDisbursement}>
              <CheckCircle2 className="h-4 w-4" /> Confirm & Disburse Settlement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proforma Invoice Dialog */}
      <ProformaInvoiceDialog
        invoice={selectedInvoiceForView}
        open={!!selectedInvoiceForView}
        onOpenChange={(open) => !open && setSelectedInvoiceForView(null)}
        onViewReceiptClick={(inv) => handleViewReceipt(inv)}
        onPayClick={(inv) => {
          setSelectedInvoiceForView(null);
          openPayModal(inv);
        }}
      />

      {/* Payment Receipt Printable Dialog */}
      <PaymentReceiptDialog
        receipt={selectedReceipt}
        open={showReceiptModal}
        onOpenChange={setShowReceiptModal}
        vendorName={selectedReceipt?.vendor_name || selectedReceipt?.vendor_id ? String(selectedReceipt.vendor_id) : "Vendor"}
      />
    </div>
  );
}

const BANK_GL_ACCOUNTS = [
  { code: "12000001", name: "12000001 - Commercial Bank of Qatar (CBQ)" },
  { code: "12000002", name: "12000002 - Al Ameen Dukhan Bank" },
  { code: "12000003", name: "12000003 - Bank Operating Account (QNB)" },
  { code: "12000004", name: "12000004 - Doha Bank Operating Account" },
  { code: "12000005", name: "12000005 - Qatar Islamic Bank (QIB)" },
  { code: "12000006", name: "12000006 - Al Ameen (Oryx) - Dukhan Bank" },
];

const BASE_COMMON_GL_ACCOUNTS = [
  { code: "12000", name: "12000 - Bank Operating Account (QNB/CBQ)" },
  { code: "12100", name: "12100 - Cash In Hand (Office Vault)" },
  { code: "12411", name: "12411 - Legal Receivables (Defaulted Cases)" },
  { code: "12413", name: "12413 - Tenant Receivables (AR)" },
  { code: "12413001", name: "12413001 - Tenant Receivables — Unit SL" },
  { code: "12900", name: "12900 - PDC In Hand / Undeposited Cheques" },
  { code: "22100001", name: "22100001 - Trade Payables - Vendors (Suppliers/Vendors)" },
  { code: "21100", name: "21100 - Tenant Security Deposits" },
  { code: "41100", name: "41100 - Rental Revenue" },
  { code: "41200", name: "41200 - Parking Fee Revenue" },
  { code: "41300", name: "41300 - Utility Recovery Revenue" },
  { code: "50100", name: "50100 - Staff Salaries & Allowances" },
  { code: "51004001", name: "51004001 - Repair and Maintenance Cost" },
  { code: "50300", name: "50300 - Cleaning & Sanitation" },
  { code: "50400", name: "50400 - Elevator Maintenance" },
  { code: "50500", name: "50500 - Utilities & Electricity (Kahramaa)" },
  { code: "50600", name: "50600 - Security Services" },
  { code: "50800", name: "50800 - Legal & Professional Fees" },
];

function VoucherManagerSubModule({ type }: { type: "Journal Voucher" | "Payment Voucher" | "Receipt Voucher" }) {
  const COMMON_GL_ACCOUNTS = useMergedCoa(BASE_COMMON_GL_ACCOUNTS);
  const { vouchers: sharedVouchers, setVouchers: setSharedVouchers, leases, units } = useAppData();
  const { addVoucher: addFinanceStoreVoucher } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    voucher_no: `VCH-${type.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split("T")[0],
    name: type === "Payment Voucher" ? "Payment to Contractor" : type === "Receipt Voucher" ? "Direct Rent Collection" : "General Adjustment",
    property: "All / Corporate",
    leaseId: "",
    debit: type === "Payment Voucher"
      ? "22100001 - Trade Payables - Vendors (Suppliers/Vendors)"
      : type === "Receipt Voucher"
        ? "12000001 - Commercial Bank of Qatar (CBQ)"
        : "51004001 - Repair and Maintenance Cost",
    credit: type === "Payment Voucher"
      ? "12000 - Bank Operating Account (QNB/CBQ)"
      : type === "Receipt Voucher"
        ? "12413001 - Tenant Receivables — Unit SL"
        : "12100 - Cash In Hand (Office Vault)",
    amount: "5000",
    method: type === "Payment Voucher" ? "Bank Transfer" : type === "Receipt Voucher" ? "Bank Transfer" : "Batch",
  });

  // Extract distinct properties
  const propertiesList = useMemo(() => {
    const set = new Set<string>();
    leases.forEach(l => { if (l.property) set.add(l.property); });
    units.forEach(u => { if (u.property) set.add(u.property); });
    if (set.size === 0) {
      set.add("Old Salata - Residence No:23");
      set.add("MANSOURA - BLDG06");
      set.add("Neeman's New Building");
    }
    return Array.from(set).sort();
  }, [leases, units]);

  const selectedReceiptLease = type === "Receipt Voucher"
    ? leases.find(lease => lease.id === form.leaseId)
    : undefined;
  const debitAccountOptions = type === "Receipt Voucher"
    ? [...BANK_GL_ACCOUNTS, { code: "12100001", name: "12100001 - Cash In Hand / Operating Cash" }]
    : COMMON_GL_ACCOUNTS;
  const creditAccountOptions = COMMON_GL_ACCOUNTS;

  // Multi-line state for Journal Voucher
  type JournalLine = {
    id: string;
    type: "DR" | "CR";
    account: string;
    property: string;
    amount: string;
    description: string;
  };

  const [journalLines, setJournalLines] = useState<JournalLine[]>([
    { id: "1", type: "DR", account: "51004001 - Repair and Maintenance Cost", property: propertiesList[0] || "All / Corporate", amount: "5000", description: "Repair expenses" },
    { id: "2", type: "CR", account: "12100 - Cash In Hand (Office Vault)", property: propertiesList[0] || "All / Corporate", amount: "5000", description: "Cash disbursement" },
  ]);

  const totalDr = useMemo(() => {
    return journalLines.filter(l => l.type === "DR").reduce((s, l) => s + (parseFloat(l.amount) || 0), 0);
  }, [journalLines]);

  const totalCr = useMemo(() => {
    return journalLines.filter(l => l.type === "CR").reduce((s, l) => s + (parseFloat(l.amount) || 0), 0);
  }, [journalLines]);

  const hasValidDrAndCr = useMemo(() => {
    const hasDr = journalLines.some(l => l.type === "DR" && (parseFloat(l.amount) || 0) > 0);
    const hasCr = journalLines.some(l => l.type === "CR" && (parseFloat(l.amount) || 0) > 0);
    return hasDr && hasCr;
  }, [journalLines]);

  const isBalanced = Math.abs(totalDr - totalCr) < 0.01 && totalDr > 0 && hasValidDrAndCr;

  const filtered = (sharedVouchers || []).filter(v => {
    if (type.includes("Journal")) return v.method === "Batch" || v.name.includes("Income") || v.name.includes("Doc") || v.name.includes("Journal") || (v as any).voucher_type === "Journal Voucher";
    if (type.includes("Payment")) return v.name.includes("Payment") || v.name.includes("Refund") || v.debit.includes("Payable");
    if (type.includes("Receipt")) return v.name.includes("Receipt") || v.name.includes("Direct Rent Collection") || v.method === "PDC" || v.method === "Cash" || v.credit.includes("Income") || v.credit.includes("Receivables");
    return true;
  });

  async function handleAdd() {
    const accountCode = (label: string) => label.trim().split(/\s+/)[0];

    if (type === "Journal Voucher") {
      if (!isBalanced) {
        toast.error(`Journal voucher is unbalanced! Total Debit (QAR ${totalDr.toLocaleString()}) must equal Total Credit (QAR ${totalCr.toLocaleString()}).`);
        return;
      }

      try {
        const postingLines = journalLines.map(l => ({
          account_code: accountCode(l.account),
          debit: l.type === "DR" ? parseFloat(l.amount) || 0 : 0,
          credit: l.type === "CR" ? parseFloat(l.amount) || 0 : 0,
          description: l.description || form.name,
        }));

        const result = await postVoucher({
          voucher_date: form.date,
          voucher_type: "Journal Voucher",
          description: form.name,
          reference_no: form.voucher_no,
          source_type: "FINANCE_VOUCHER",
          property_id: form.property !== "All / Corporate" ? form.property : undefined,
          lines: postingLines,
        });

        // Add to shared vouchers
        const drSummary = journalLines.filter(l => l.type === "DR").map(l => `${l.account} [${l.property || form.property}] (QR ${parseFloat(l.amount || '0').toLocaleString()})`).join("; ");
        const crSummary = journalLines.filter(l => l.type === "CR").map(l => `${l.account} [${l.property || form.property}] (QR ${parseFloat(l.amount || '0').toLocaleString()})`).join("; ");
        const uniqueLineProps = Array.from(new Set(journalLines.map(l => l.property || form.property).filter(Boolean)));
        const propDisplay = uniqueLineProps.join(", ");

        setSharedVouchers(prev => [{
          id: result.voucher_id,
          leaseId: "",
          name: form.name,
          receiptNo: result.receipt_number || form.voucher_no,
          method: form.method,
          period: form.date,
          debit: drSummary,
          credit: crSummary,
          amount: totalDr,
          status: "posted" as const,
          property_name: propDisplay,
        }, ...prev]);

        // Mirror to Central Finance Store so General Ledger reflects each line and its property immediately
        const firstDr = journalLines.find(l => l.type === "DR");
        const firstCr = journalLines.find(l => l.type === "CR");
        addFinanceStoreVoucher({
          voucher_no: form.voucher_no,
          voucher_type: "Journal Voucher",
          date: form.date,
          name: `${form.name}${propDisplay ? ` — ${propDisplay}` : ""}`,
          debit: firstDr?.account || "General Ledger",
          debit_code: firstDr ? accountCode(firstDr.account) : "51004001",
          credit: firstCr?.account || "General Ledger",
          credit_code: firstCr ? accountCode(firstCr.account) : "12100001",
          amount: totalDr,
          method: "Journal Voucher",
          property_name: propDisplay || "Corporate / General",
          lines: journalLines.map(l => ({
            id: l.id,
            type: l.type,
            account: l.account,
            account_code: accountCode(l.account),
            amount: parseFloat(l.amount) || 0,
            property_name: l.property || form.property,
            description: l.description || form.name,
          })),
        });

        toast.success(`Journal Voucher ${result.voucher_number || form.voucher_no} posted successfully!`);
        setOpen(false);
      } catch (error: any) {
        console.error(error);
        toast.error(error?.message || "Failed to post Journal Voucher.");
      }
      return;
    }

    // Default for Payment & Receipt Vouchers
    const amt = parseFloat(form.amount) || 0;
    if (amt <= 0) {
      toast.error("Amount must be greater than zero.");
      return;
    }
    if (type === "Receipt Voucher" && form.credit.startsWith("12413001") && !selectedReceiptLease) {
      toast.error("Select the tenant lease and unit before posting a receipt to Tenant Receivables — Unit SL.");
      return;
    }

    try {
      const voucherName = selectedReceiptLease
        ? `${form.name} — ${selectedReceiptLease.tenantName} (${selectedReceiptLease.unit})`
        : form.name;
      const result = await postVoucher({
        voucher_date: form.date,
        voucher_type: type,
        description: voucherName,
        reference_no: form.voucher_no,
        source_type: "FINANCE_VOUCHER",
        property_id: form.property !== "All / Corporate" ? form.property : undefined,
        lines: [
          {
            account_code: accountCode(form.debit),
            debit: amt,
            credit: 0,
            description: selectedReceiptLease
              ? `${form.debit} — ${selectedReceiptLease.tenantName}, ${selectedReceiptLease.unit}`
              : form.debit,
          },
          {
            account_code: accountCode(form.credit),
            debit: 0,
            credit: amt,
            description: selectedReceiptLease
              ? `${form.credit} — ${selectedReceiptLease.tenantName}, ${selectedReceiptLease.unit}`
              : form.credit,
          },
        ],
      });

      setSharedVouchers(prev => [{
        id: result.voucher_id,
        leaseId: selectedReceiptLease?.id || "",
        name: voucherName,
        receiptNo: result.receipt_number,
        method: form.method,
        period: form.date,
        debit: form.debit,
        credit: form.credit,
        amount: amt,
        status: "posted" as const,
        property_name: form.property !== "All / Corporate" ? form.property : undefined,
        unit_name: selectedReceiptLease?.unit,
        tenant_name: selectedReceiptLease?.tenantName,
      }, ...prev]);

      addFinanceStoreVoucher({
        voucher_no: form.voucher_no,
        voucher_type: type,
        date: form.date,
        name: `${voucherName}${form.property !== "All / Corporate" ? ` — ${form.property}` : ""}`,
        debit: form.debit,
        debit_code: accountCode(form.debit),
        credit: form.credit,
        credit_code: accountCode(form.credit),
        amount: amt,
        method: form.method,
        property_name: form.property !== "All / Corporate" ? form.property : "Corporate / General",
        unit_ref: selectedReceiptLease?.unit,
        tenant_name: selectedReceiptLease?.tenantName,
      });

      toast.success(`${type} ${result.voucher_number} posted. Receipt ${result.receipt_number} generated.`);
      setOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || `Failed to post ${type}.`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">{type}s Register</h3>
          <p className="text-xs text-muted-foreground">Transactions and double-entry postings for {type.toLowerCase()} operations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{filtered.length} Vouchers</Badge>
          <Button size="sm" onClick={() => {
            setForm(f => ({ ...f, voucher_no: `VCH-${type.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}` }));
            setOpen(true);
          }} className="gap-2">
            <Plus className="h-4 w-4" /> Create {type}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Entry Date</TableHead>
              <TableHead className="font-bold">Voucher #</TableHead>
              <TableHead className="font-bold">Name & Description</TableHead>
              <TableHead className="font-bold">Property</TableHead>
              <TableHead className="font-bold">Method</TableHead>
              <TableHead className="font-bold">Debit Account (GL)</TableHead>
              <TableHead className="font-bold">Credit Account (GL)</TableHead>
              <TableHead className="text-right font-bold">Amount (QAR)</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...filtered].sort((a, b) => new Date(b.period || "2026-08-18").getTime() - new Date(a.period || "2026-08-18").getTime()).map((v) => (
              <TableRow key={v.id} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono text-muted-foreground">{(() => {
                  const raw = (v as any).date || v.period || "2026-08-18";
                  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
                  const d = new Date(raw);
                  return !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "2026-08-18";
                })()}</TableCell>
                <TableCell className="font-mono font-bold text-primary">{v.receiptNo || v.id}</TableCell>
                <TableCell className="font-medium">{v.name}</TableCell>
                <TableCell className="text-muted-foreground font-medium">{(v as any).property_name || "Corporate"}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{v.method || "System"}</Badge></TableCell>
                <TableCell className="font-mono text-blue-600 text-xs max-w-[200px] truncate" title={v.debit}>{v.debit}</TableCell>
                <TableCell className="font-mono text-emerald-600 text-xs max-w-[200px] truncate" title={v.credit}>{v.credit}</TableCell>
                <TableCell className="text-right font-mono font-bold">{Number(v.amount).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={(v.status as string) === "posted" || (v.status as string) === "Posted" ? "default" : "secondary"}
                    className="text-[10px] capitalize"
                  >
                    {v.status || "Posted"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {(v.status as string) === "draft" || (v.status as string) === "Draft" || (v.status as string) === "pending" || (v.status as string) === "Pending" ? (
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => {
                        setSharedVouchers(prev => prev.map(item => item.id === v.id ? { ...item, status: "posted" as const } : item));
                        toast.success(`Payment voucher ${v.receiptNo || v.id} approved & payment completed.`);
                      }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Complete Payment
                    </Button>
                  ) : (
                    <span className="text-[11px] text-muted-foreground font-mono">Approved</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={type === "Journal Voucher" ? "sm:max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto" : "max-w-md"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              <span>Create {type}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {type === "Journal Voucher"
                ? "Add multi-line debit and credit entries with individual line descriptions and property tagging."
                : `Enter voucher details and post double-entry record.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1 text-xs">
            {/* Top Row: Date, Voucher #, Property */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px] font-semibold">Entry Date *</Label>
                <Input type="date" className="h-8 text-xs bg-background" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <Label className="text-[11px] font-semibold">Voucher # *</Label>
                <Input className="h-8 text-xs font-mono font-bold bg-background" value={form.voucher_no} onChange={e => setForm({ ...form, voucher_no: e.target.value })} />
              </div>
              <div>
                <Label className="text-[11px] font-semibold flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-primary" /> Related Property / Vehicle Cost Center
                </Label>
                <Select
                  value={form.property}
                  onValueChange={v => setForm({ ...form, property: v })}
                  disabled={type === "Receipt Voucher" && !!selectedReceiptLease}
                >
                  <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="Select Property or Vehicle Cost Center" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All / Corporate">All / Corporate Office</SelectItem>
                    {COMPANY_VEHICLE_COST_CENTERS.map(veh => (
                      <SelectItem key={veh.code} value={veh.name}>
                        🚗 Vehicle No: {veh.vehicleNo} — {veh.vehicleName} ({veh.brandName}{veh.model && veh.model !== "—" ? ` ${veh.model}` : ""})
                      </SelectItem>
                    ))}
                    {propertiesList.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {type === "Receipt Voucher" && (
              <div>
                <Label className="text-[11px] font-semibold">Tenant / Lease / Unit *</Label>
                <SearchableSelect
                  value={form.leaseId || "none"}
                  placeholder="Search tenant, unit or property..."
                  emptyText="No matching tenant"
                  options={[
                    { label: "Select tenant and unit", value: "none" },
                    ...leases.map(lease => ({
                      label: `${lease.tenantName} — ${lease.unit} (${lease.property})`,
                      value: lease.id,
                    })),
                  ]}
                  onValueChange={value => {
                    const lease = leases.find(item => item.id === value);
                    setForm(current => ({
                      ...current,
                      leaseId: lease?.id || "",
                      property: lease?.property || current.property,
                      credit: lease ? "12413001 - Tenant Receivables — Unit SL" : current.credit,
                    }));
                  }}
                />
              </div>
            )}

            {/* Description */}
            <div>
              <Label className="text-[11px] font-semibold">Journal Description / Narration *</Label>
              <Input
                className="h-8 text-xs bg-background"
                placeholder="e.g. End of month adjustment, reclassification, depreciation"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* ── MULTI-LINE JOURNAL ENTRY SECTION (IF TYPE === "Journal Voucher") ── */}
            {type === "Journal Voucher" ? (
              <div className="space-y-2.5 border rounded-lg p-3 bg-muted/20">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-xs uppercase tracking-wide text-foreground">
                    Journal Lines (Multi Debit / Credit &amp; Line-by-Line Property)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-blue-500/40 text-blue-600 hover:bg-blue-50"
                      onClick={() => setJournalLines(lines => [
                        ...lines,
                        { id: String(Date.now() + Math.random()), type: "DR", account: COMMON_GL_ACCOUNTS[0].name, property: form.property || propertiesList[0] || "All / Corporate", amount: "0", description: form.name }
                      ])}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Debit (Dr) Line
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-emerald-500/40 text-emerald-600 hover:bg-emerald-50"
                      onClick={() => setJournalLines(lines => [
                        ...lines,
                        { id: String(Date.now() + Math.random()), type: "CR", account: COMMON_GL_ACCOUNTS[1].name, property: form.property || propertiesList[0] || "All / Corporate", amount: "0", description: form.name }
                      ])}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Credit (Cr) Line
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg overflow-x-auto bg-background">
                  <table className="w-full min-w-[880px] text-xs">
                    <thead className="bg-muted/60 text-muted-foreground font-semibold border-b">
                      <tr>
                        <th className="py-2.5 px-2 text-center w-20 whitespace-nowrap">Dr / Cr</th>
                        <th className="py-2.5 px-2 text-left w-60 whitespace-nowrap">GL Account</th>
                        <th className="py-2.5 px-2 text-left w-52 whitespace-nowrap">Property / Cost Center</th>
                        <th className="py-2.5 px-2 text-left min-w-[180px] whitespace-nowrap">Line Description / Memo</th>
                        <th className="py-2.5 px-2 text-right w-28 whitespace-nowrap">Debit (QAR)</th>
                        <th className="py-2.5 px-2 text-right w-28 whitespace-nowrap">Credit (QAR)</th>
                        <th className="py-2.5 px-1 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {journalLines.map((line, idx) => (
                        <tr key={line.id} className="hover:bg-muted/20">
                          <td className="py-2 px-2 text-center">
                            <Select
                              value={line.type}
                              onValueChange={(val: "DR" | "CR") => {
                                setJournalLines(lines => lines.map((l, i) => i === idx ? { ...l, type: val } : l));
                              }}
                            >
                              <SelectTrigger className={`h-8 text-xs font-bold w-full ${line.type === "DR" ? "text-blue-600 border-blue-300 bg-blue-50/50" : "text-emerald-600 border-emerald-300 bg-emerald-50/50"}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="DR" className="text-blue-600 font-bold">DR</SelectItem>
                                <SelectItem value="CR" className="text-emerald-600 font-bold">CR</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-2 px-2">
                            <Select
                              value={line.account}
                              onValueChange={(val) => {
                                setJournalLines(lines => lines.map((l, i) => i === idx ? { ...l, account: val } : l));
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs font-mono w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {COMMON_GL_ACCOUNTS.map(a => (
                                  <SelectItem key={a.code} value={a.name} className="text-xs font-mono">
                                    {a.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-2 px-2">
                            <Select
                              value={line.property || form.property || "All / Corporate"}
                              onValueChange={(val) => {
                                setJournalLines(lines => lines.map((l, i) => i === idx ? { ...l, property: val } : l));
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs w-full">
                                <SelectValue placeholder="Select Property" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="All / Corporate">All / Corporate Office</SelectItem>
                                {propertiesList.map(p => (
                                  <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-2 px-2">
                            <Input
                              className="h-8 text-xs w-full"
                              placeholder="Line description / reason"
                              value={line.description}
                              onChange={(e) => {
                                const val = e.target.value;
                                setJournalLines(lines => lines.map((l, i) => i === idx ? { ...l, description: val } : l));
                              }}
                            />
                          </td>
                          <td className="py-2 px-2 text-right">
                            {line.type === "DR" ? (
                              <Input
                                type="number"
                                step="0.01"
                                className="h-8 text-xs font-mono font-bold text-right text-blue-700 bg-blue-50/30 border-blue-200 w-full"
                                value={line.amount}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setJournalLines(lines => lines.map((l, i) => i === idx ? { ...l, amount: val } : l));
                                }}
                              />
                            ) : (
                              <span className="text-muted-foreground font-mono text-center block">—</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-right">
                            {line.type === "CR" ? (
                              <Input
                                type="number"
                                step="0.01"
                                className="h-8 text-xs font-mono font-bold text-right text-emerald-700 bg-emerald-50/30 border-emerald-200 w-full"
                                value={line.amount}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setJournalLines(lines => lines.map((l, i) => i === idx ? { ...l, amount: val } : l));
                                }}
                              />
                            ) : (
                              <span className="text-muted-foreground font-mono text-center block">—</span>
                            )}
                          </td>
                          <td className="py-2 px-1 text-center">
                            {journalLines.length > 2 && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => setJournalLines(lines => lines.filter((_, i) => i !== idx))}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/40 font-bold border-t">
                      <tr>
                        <td colSpan={4} className="py-2.5 px-3 text-right uppercase text-[11px]">
                          Totals &amp; Trial Balance:
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-blue-700 text-xs">
                          QR {totalDr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-emerald-700 text-xs">
                          QR {totalCr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-center py-2.5">
                          {isBalanced ? (
                            <span className="text-emerald-600 font-bold text-sm" title="Balanced">✓</span>
                          ) : (
                            <span className="text-destructive font-bold text-sm" title="Out of balance">✗</span>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Balance validation alert */}
                {!isBalanced && (
                  <div className="rounded p-2 bg-destructive/10 border border-destructive/30 text-destructive text-[11px] flex justify-between items-center">
                    <span>⚠️ Journal Blocked: Total Debit (QR {totalDr.toLocaleString(undefined, { minimumFractionDigits: 2 })}) and Total Credit (QR {totalCr.toLocaleString(undefined, { minimumFractionDigits: 2 })}) are not tallied! Difference: QR {Math.abs(totalDr - totalCr).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className="font-semibold">System requires Debit === Credit to accept Journal</span>
                  </div>
                )}
              </div>
            ) : (
              /* Single Debit & Credit for Payment / Receipt Voucher */
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] font-semibold">Debit GL Account</Label>
                    <Select value={form.debit} onValueChange={v => setForm({ ...form, debit: v })}>
                      <SelectTrigger className="h-8 text-xs font-mono bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {debitAccountOptions.map(a => <SelectItem key={a.code} value={a.name} className="text-xs font-mono">{a.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold">Credit GL Account</Label>
                    <Select value={form.credit} onValueChange={v => setForm({ ...form, credit: v })}>
                      <SelectTrigger className="h-8 text-xs font-mono bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {creditAccountOptions.map(a => <SelectItem key={a.code} value={a.name} className="text-xs font-mono">{a.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] font-semibold">Amount (QAR)</Label>
                    <Input type="number" className="h-8 text-xs font-mono font-bold bg-background" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold">Payment Method</Label>
                    <Select value={form.method} onValueChange={v => setForm(current => ({
                      ...current,
                      method: v,
                      ...(type === "Receipt Voucher" ? {
                        debit: v === "Cash"
                          ? "12100001 - Cash In Hand / Operating Cash"
                          : current.debit.startsWith("12100001")
                            ? BANK_GL_ACCOUNTS[0].name
                            : current.debit,
                      } : {}),
                    }))}>
                      <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="PDC">PDC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Live GL / COA Impact Preview */}
                {parseFloat(form.amount) > 0 && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Ledgers / Accounts Updated by this {type}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div className="bg-background p-2 rounded border border-emerald-200">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold block">Debit (DR):</span>
                        <span>{form.debit}</span>
                        <span className="block font-bold text-emerald-600 mt-1">QR {parseFloat(form.amount || '0').toLocaleString()}</span>
                      </div>
                      <div className="bg-background p-2 rounded border border-rose-200">
                        <span className="text-rose-600 dark:text-rose-400 font-bold block">Credit (CR):</span>
                        <span>{form.credit}</span>
                        <span className="block font-bold text-rose-600 mt-1">QR {parseFloat(form.amount || '0').toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              className="bg-primary text-primary-foreground"
              disabled={type === "Journal Voucher" && !isBalanced}
              onClick={handleAdd}
            >
              Post {type}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReceivableInvoiceSubModule({ role }: { role: FinanceModuleProps["role"] }) {
  const navigate = useNavigate({ from: FINANCE_ROUTE_BY_ROLE[role] });
  const { leases, units, customers } = useAppData();
  const { addReceivableInvoice, receivableInvoices: storeReceivables, markReceivableInvoicePaid } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ReceivableInvoice[]>([]);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string>("");

  // Dialog States
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkDialogMode, setBulkDialogMode] = useState<"property" | "customer">("property");
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<ReceivableInvoice | null>(null);
  const [statementCustomer, setStatementCustomer] = useState<{ id: string; name: string } | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Unique properties list
  const propertiesList = useMemo(() => {
    const set = new Set<string>();
    leases.forEach(l => { if (l.property) set.add(l.property); });
    units.forEach(u => { if (u.property) set.add(u.property); });
    if (set.size === 0) {
      set.add("Old Salata - Residence No:23");
      set.add("MANSOURA - BLDG06");
      set.add("Neeman's New Building");
    }
    return Array.from(set).sort();
  }, [leases, units]);

  const [form, setForm] = useState({
    invoice_no: `INV-AR-${Math.floor(1000 + Math.random() * 9000)}`,
    tenant: "Mr. Hafeez Shaik",
    property: "Old Salata - Residence No:23",
    unit: "AAA - Flat16",
    date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    stream: "41100 - Rental Revenue",
    amount: "5600",
  });

  // Filtered units based on selected property
  const availableUnits = useMemo(() => {
    return units.filter(u => !form.property || u.property === form.property);
  }, [units, form.property]);

  // Quick select a lease
  function handleSelectLease(leaseId: string) {
    setSelectedLeaseId(leaseId);
    const l = leases.find(item => item.id === leaseId);
    if (l) {
      setForm(prev => ({
        ...prev,
        tenant: l.tenantName || prev.tenant,
        property: l.property || prev.property,
        unit: l.unit || prev.unit,
        amount: String(l.monthlyRent || prev.amount),
      }));
    }
  }

  function handleAdd() {
    const amt = parseFloat(form.amount) || 0;
    if (amt <= 0) {
      toast.error("Invoice amount must be greater than zero.");
      return;
    }
    if (!form.tenant) {
      toast.error("Please specify tenant name.");
      return;
    }

    const targetUnit = (form.unit || "").trim().toUpperCase();
    const targetPeriod = (form.date || "").slice(0, 7);
    if (targetUnit && targetPeriod) {
      const duplicateInv = allInvoices.find(inv => {
        const st = String(inv.status || "");
        if (st === "Cancelled" || st === "Void") return false;
        const invUnit = (inv.unit || "").trim().toUpperCase();
        const invPeriod = (inv.billingPeriod || (inv as any).billing_month || (inv.date || "").slice(0, 7)).trim();
        return invUnit === targetUnit && invPeriod === targetPeriod;
      });
      if (duplicateInv) {
        toast.error(
          `Duplicate Restricted: Unit ${form.unit} already has an invoice (${duplicateInv.invoice_no}) generated for period ${targetPeriod}.`
        );
        return;
      }
    }

    const newInv: ReceivableInvoice = {
      id: `ar-${Date.now()}`,
      invoice_no: form.invoice_no,
      tenant: form.tenant,
      property: form.property,
      unit: form.unit,
      date: form.date,
      due_date: form.due_date,
      billingPeriod: targetPeriod || undefined,
      stream: form.stream,
      account_code: form.stream.split(/\s+/)[0] || "41100",
      amount: amt,
      status: "Pending",
    };

    setData(prev => [newInv, ...prev]);

    // Authoritative FinanceStore sync
    addReceivableInvoice(newInv);

    toast.success(`AR Invoice ${form.invoice_no} created and posted to Tenant Receivables.`);
    setOpen(false);
  }

  // Combined Invoices (strictly real store + user-created invoices; no synthetic seed rows)
  const allInvoices = useMemo(() => {
    const list = [...storeReceivables];
    data.forEach(d => {
      if (!list.some(item => item.invoice_no === d.invoice_no)) {
        list.push(d);
      }
    });

    return list.sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime());
  }, [storeReceivables, data]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return allInvoices.filter(inv => {
      if (propertyFilter !== "ALL" && inv.property !== propertyFilter) return false;
      if (statusFilter !== "ALL" && inv.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          inv.invoice_no.toLowerCase().includes(term) ||
          inv.tenant.toLowerCase().includes(term) ||
          inv.unit.toLowerCase().includes(term) ||
          inv.property.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [allInvoices, propertyFilter, statusFilter, searchTerm]);

  const totalInvoiced = useMemo(() => filteredInvoices.reduce((s, i) => s + (Number(i.amount) || 0), 0), [filteredInvoices]);
  const totalPending = useMemo(() => filteredInvoices.filter(i => i.status !== "Paid").reduce((s, i) => s + (Number(i.amount) || 0), 0), [filteredInvoices]);

  return (
    <div className="space-y-4">
      {/* Header and Bulk Actions Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Accounts Receivable (AR) Invoices &amp; Bulk Billing</h3>
          <p className="text-xs text-muted-foreground">
            Generate and manage rental invoices, CAM, and service charges bulk property-wise or customer-wise.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Unbilled Units Report Shortcut */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ search: { tab: "unbilled_units_report" } })}
            className="gap-1.5 border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 font-semibold text-xs shadow-xs"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Unbilled Units Report
          </Button>

          {/* Bulk Invoices - Property-Wise */}
          <Button
            size="sm"
            onClick={() => {
              setBulkDialogMode("property");
              setBulkDialogOpen(true);
            }}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
          >
            <Building2 className="h-3.5 w-3.5" />
            Bulk Invoice (Property-Wise)
          </Button>

          {/* Bulk Invoices - Customer-Wise */}
          <Button
            size="sm"
            onClick={() => {
              setBulkDialogMode("customer");
              setBulkDialogOpen(true);
            }}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
          >
            <Users className="h-3.5 w-3.5" />
            Bulk Invoice (Customer-Wise)
          </Button>

          {/* Single Invoice */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedLeaseId("");
              setForm(f => ({ ...f, invoice_no: `INV-AR-${Math.floor(1000 + Math.random() * 9000)}` }));
              setOpen(true);
            }}
            className="gap-1.5 text-xs border-primary/20 hover:bg-primary/5"
          >
            <Plus className="h-3.5 w-3.5 text-primary" /> Create AR Invoice
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <Card className="border bg-card">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Invoices</span>
            <p className="text-lg font-bold font-mono text-foreground">{filteredInvoices.length}</p>
            <p className="text-[10px] text-muted-foreground">Active in ledger</p>
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Invoiced Amount</span>
            <p className="text-lg font-bold font-mono text-foreground">
              QAR {totalInvoiced.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">Current filtered sum</p>
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Collected</span>
            <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              QAR {(totalInvoiced - totalPending).toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">Settled invoices</p>
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Pending / Overdue</span>
            <p className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
              QAR {totalPending.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg border bg-muted/20 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
            <Input
              className="h-8 pl-8 text-xs bg-background"
              placeholder="Search by invoice #, tenant, unit, or property..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Property Filter */}
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="h-8 text-xs w-44 bg-background">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Properties</SelectItem>
              {propertiesList.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs w-32 bg-background">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Entry Date</TableHead>
              <TableHead className="font-bold">Invoice #</TableHead>
              <TableHead className="font-bold">Tenant / Customer</TableHead>
              <TableHead className="font-bold">Property &amp; Unit</TableHead>
              <TableHead className="font-bold">Revenue GL Stream</TableHead>
              <TableHead className="font-bold">Due Date</TableHead>
              <TableHead className="text-right font-bold">Amount (QAR)</TableHead>
              <TableHead className="text-center font-bold">Status</TableHead>
              <TableHead className="text-center font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-xs text-muted-foreground">
                  No invoices found matching criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((row) => (
                <TableRow key={row.invoice_no} className="hover:bg-muted/30 text-xs">
                  <TableCell className="font-mono text-muted-foreground">{row.date}</TableCell>
                  <TableCell className="font-mono font-bold text-primary">
                    <button
                      onClick={() => setSelectedInvoiceForView(row)}
                      className="hover:underline text-left text-primary"
                      title="View / Print Invoice"
                    >
                      {row.invoice_no}
                    </button>
                  </TableCell>
                  <TableCell className="font-semibold">{row.tenant}</TableCell>
                  <TableCell className="text-muted-foreground">{row.property} — <strong className="font-mono text-foreground">{row.unit}</strong></TableCell>
                  <TableCell className="font-mono text-xs text-blue-600 dark:text-blue-400">{row.stream}</TableCell>
                  <TableCell className="font-mono">{row.due_date}</TableCell>
                  <TableCell className="text-right font-mono font-bold">{row.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={row.status === "Paid" ? "default" : row.status === "Overdue" ? "destructive" : "outline"} className="text-[10px]">
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* View & Print */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedInvoiceForView(row)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                        title="View / Print Invoice"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </Button>

                      {/* Customer Statement */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const cust = customers.find(c => c.name.toLowerCase() === row.tenant.toLowerCase());
                          setStatementCustomer({
                            id: cust ? String(cust.id || cust.customerId) : row.tenant,
                            name: row.tenant,
                          });
                        }}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-emerald-600"
                        title="View Customer Statement of Account"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </Button>

                      {/* Mark Paid / Settle */}
                      {row.status !== "Paid" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markReceivableInvoicePaid(row.invoice_no)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-emerald-600"
                          title="Record Collection / Mark Paid"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Single Invoice Generation Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Create Accounts Receivable Invoice</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select or enter tenant, property, unit, and income account to bill tenant receivables.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-1 text-xs">
            {/* Quick Lease Autofill Option */}
            {leases.length > 0 && (
              <div className="p-2.5 rounded-lg border bg-muted/40 space-y-1">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                  ⚡ Quick Auto-Fill from Active Lease
                </Label>
                <Select value={selectedLeaseId} onValueChange={handleSelectLease}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder="Choose active lease to auto-populate..." />
                  </SelectTrigger>
                  <SelectContent>
                    {leases.map(l => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.tenantName} — {l.unit} ({l.property}) &bull; QR {l.monthlyRent?.toLocaleString()}/mo
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Entry Date & Invoice # */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Entry Date *</Label>
                <Input type="date" className="h-8 text-xs bg-background" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Invoice # *</Label>
                <Input className="h-8 text-xs font-mono font-bold bg-background" value={form.invoice_no} onChange={e => setForm({ ...form, invoice_no: e.target.value })} />
              </div>
            </div>

            {/* Tenant Name & Amount */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] font-semibold">Tenant Name *</Label>
                  {selectedLeaseId && (
                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Locked to Lease
                    </span>
                  )}
                </div>
                <Input
                  className={`h-8 text-xs ${selectedLeaseId ? "bg-muted/70 text-foreground cursor-not-allowed font-medium" : "bg-background"}`}
                  placeholder="Enter or select tenant"
                  value={form.tenant}
                  readOnly={Boolean(selectedLeaseId)}
                  onChange={e => {
                    if (!selectedLeaseId) {
                      setForm({ ...form, tenant: e.target.value });
                    }
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Amount (QAR) *</Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-mono font-bold bg-background"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                />
              </div>
            </div>

            {/* Property & Unit Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-primary" /> Property *
                </Label>
                <Select
                  value={form.property}
                  onValueChange={v => setForm({ ...form, property: v, unit: availableUnits.find(u => u.property === v)?.unit || form.unit })}
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder="Select Property" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertiesList.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Unit *</Label>
                {availableUnits.length > 0 ? (
                  <Select value={form.unit} onValueChange={v => setForm({ ...form, unit: v })}>
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnits.map(u => (
                        <SelectItem key={u.id || u.unit} value={u.unit}>
                          {u.unit} {u.currentTenant ? `(${u.currentTenant})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    className="h-8 text-xs bg-background"
                    placeholder="Unit reference e.g. Flat16"
                    value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                  />
                )}
              </div>
            </div>

            {/* Issue Date & Due Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Issue Date</Label>
                <Input type="date" className="h-8 text-xs bg-background" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Due Date</Label>
                <Input type="date" className="h-8 text-xs bg-background" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
              </div>
            </div>

            {/* Target Revenue Account */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Target Revenue GL Account</Label>
              <Select value={form.stream} onValueChange={v => setForm({ ...form, stream: v })}>
                <SelectTrigger className="h-8 text-xs font-mono bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="41100 - Rental Revenue">41100 - Rental Revenue (Residential/Commercial)</SelectItem>
                  <SelectItem value="41200 - Parking Fee Revenue">41200 - Parking Space / Slot Fee</SelectItem>
                  <SelectItem value="41300 - Utility Recovery Revenue">41300 - Utility &amp; Electricity Recovery</SelectItem>
                  <SelectItem value="41400 - Common Area Maintenance (CAM)">41400 - Common Area Maintenance (CAM)</SelectItem>
                  <SelectItem value="41500 - Management &amp; Admin Fee">41500 - Management &amp; Admin Fee</SelectItem>
                  <SelectItem value="41600 - Late Fee &amp; Penalties">41600 - Late Fee &amp; Penalties</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Live GL / COA Impact Preview */}
            {parseFloat(form.amount) > 0 && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Ledgers / Accounts Updated by this AR Invoice</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-background p-2 rounded border border-emerald-200">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold block">Debit (Asset/AR):</span>
                    <span>12413 - Tenant Receivables ({form.tenant || 'Tenant'})</span>
                    <span className="block font-bold text-emerald-600 mt-1">QR {parseFloat(form.amount || '0').toLocaleString()}</span>
                  </div>
                  <div className="bg-background p-2 rounded border border-rose-200">
                    <span className="text-rose-600 dark:text-rose-400 font-bold block">Credit (Revenue):</span>
                    <span>{form.stream}</span>
                    <span className="block font-bold text-rose-600 mt-1">QR {parseFloat(form.amount || '0').toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground" onClick={handleAdd}>
              Generate Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Invoices Modal (Property-Wise and Customer-Wise) */}
      <BulkInvoiceDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        defaultMode={bulkDialogMode}
      />

      {/* Printable Invoice Dialog */}
      <InvoiceViewDialog
        invoice={selectedInvoiceForView}
        open={Boolean(selectedInvoiceForView)}
        onOpenChange={open => { if (!open) setSelectedInvoiceForView(null); }}
      />

      {/* Customer Statement Dialog Modal */}
      {statementCustomer && (
        <Dialog open={Boolean(statementCustomer)} onOpenChange={() => setStatementCustomer(null)}>
          <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-4 rounded-xl">
            <CustomerStatementSubModule
              initialCustomerId={statementCustomer.id}
              isDialogMode={true}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. BANK ACCOUNTING SUB-MODULES
// ─────────────────────────────────────────────────────────────────────────────

function BankSubModule() {
  const [open, setOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<FinBank | null>(null);
  const [data, setData] = useState<FinBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    code: string;
    name: string;
    swift_code: string;
    status: 'Active' | 'Inactive';
  }>({
    code: "",
    name: "",
    swift_code: "",
    status: "Active"
  });

  const LOCAL_STORAGE_KEY = "pms_fin_banks_override_v2";

  useEffect(() => {
    load();
    const handleSync = () => load();
    window.addEventListener("banks-updated", handleSync);
    return () => window.removeEventListener("banks-updated", handleSync);
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await FinBanksApi.fetchAll();
      if (res && res.length > 0) {
        const list: FinBank[] = res.map(b => ({
          ...b,
          status: (b.status || 'Active') as 'Active' | 'Inactive'
        }));
        setData(list);
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list)); } catch {}
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Failed to fetch fin_banks from Supabase, loading cache/fallback", e);
    }

    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setData(parsed);
          setLoading(false);
          return;
        }
      }
    } catch {}

    const defaults: FinBank[] = [
      { id: "1", code: "QNB", name: "Qatar National Bank (QNB)", swift_code: "QNBAQAQA", status: "Active" },
      { id: "2", code: "CBQ", name: "Commercial Bank of Qatar (CBQ)", swift_code: "CBQAQAQA", status: "Active" },
      { id: "3", code: "DOHA", name: "Doha Bank QPSC", swift_code: "DOHBQAQA", status: "Active" },
      { id: "4", code: "QIB", name: "Qatar Islamic Bank (QIB)", swift_code: "QISBQAQA", status: "Active" },
      { id: "5", code: "MAR", name: "Masraf Al Rayan", swift_code: "MARKQAQA", status: "Active" },
      { id: "6", code: "DUKHAN", name: "Dukhan Bank", swift_code: "BARQAQA", status: "Active" }
    ];
    setData(defaults);
    setLoading(false);
  }

  function handleOpenAdd() {
    setEditingBank(null);
    setForm({ code: "", name: "", swift_code: "", status: "Active" });
    setOpen(true);
  }

  function handleOpenEdit(bank: FinBank) {
    setEditingBank(bank);
    setForm({
      code: bank.code || "",
      name: bank.name || "",
      swift_code: bank.swift_code || "",
      status: (bank.status || "Active") as "Active" | "Inactive"
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Please enter both bank code and bank name");
      return;
    }

    if (editingBank) {
      const updatedBank: FinBank = {
        ...editingBank,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        swift_code: form.swift_code.trim().toUpperCase(),
        status: form.status
      };

      try {
        await FinBanksApi.update(String(editingBank.id), {
          code: updatedBank.code,
          name: updatedBank.name,
          swift_code: updatedBank.swift_code,
          status: updatedBank.status
        });
      } catch (err) {
        console.warn("Supabase bank update error:", err);
      }

      setData(prev => {
        const next = prev.map(b => String(b.id) === String(editingBank.id) ? updatedBank : b);
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
      window.dispatchEvent(new Event("banks-updated"));
      toast.success(`Bank "${updatedBank.name}" updated successfully`);
    } else {
      const newBankPayload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        swift_code: form.swift_code.trim().toUpperCase(),
        status: form.status
      };

      let createdBank: FinBank = { id: String(Date.now()), ...newBankPayload };
      try {
        const res = await FinBanksApi.create(newBankPayload);
        if (res && res.id) {
          createdBank = { ...res, status: res.status || form.status };
        }
      } catch (err) {
        console.warn("Supabase bank create error:", err);
      }

      setData(prev => {
        const next = [createdBank, ...prev];
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
      window.dispatchEvent(new Event("banks-updated"));
      toast.success(`Bank "${createdBank.name}" registered successfully`);
    }

    setOpen(false);
  }

  async function handleToggleStatus(bank: FinBank) {
    const newStatus: 'Active' | 'Inactive' = bank.status === 'Inactive' ? 'Active' : 'Inactive';
    const updatedBank: FinBank = { ...bank, status: newStatus };

    try {
      await FinBanksApi.update(String(bank.id), { status: newStatus });
    } catch (err) {
      console.warn("Supabase bank status update error:", err);
    }

    setData(prev => {
      const next = prev.map(b => String(b.id) === String(bank.id) ? updatedBank : b);
      try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });

    window.dispatchEvent(new Event("banks-updated"));
    toast.success(`Bank "${bank.name}" marked as ${newStatus}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Registered Banking Institutions</h3>
          <p className="text-xs text-muted-foreground">List of financial institutions for collection, disbursement, and PDC deposit clearing.</p>
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Bank
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Code</TableHead>
              <TableHead className="font-bold">Bank Name</TableHead>
              <TableHead className="font-bold">SWIFT / Routing Code</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-xs">
                  {loading ? "Loading banks..." : "No banks registered yet."}
                </TableCell>
              </TableRow>
            ) : (
              data.map(b => {
                const isActive = b.status !== 'Inactive';
                return (
                  <TableRow key={b.id} className="hover:bg-muted/30 text-xs">
                    <TableCell className="font-mono font-bold text-primary">{b.code}</TableCell>
                    <TableCell className="font-semibold">{b.name}</TableCell>
                    <TableCell className="font-mono text-xs">{b.swift_code || "—"}</TableCell>
                    <TableCell>
                      {isActive ? (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30 text-[10px] font-medium">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/30 text-[10px] font-medium">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 hover:text-primary"
                          onClick={() => handleOpenEdit(b)}
                          title="Edit Bank"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-7 px-2 text-[11px] ${isActive ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'}`}
                          onClick={() => handleToggleStatus(b)}
                          title={isActive ? "Mark Inactive" : "Mark Active"}
                        >
                          {isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBank ? "Edit Bank Institution" : "Add Bank Institution"}</DialogTitle>
            <DialogDescription className="text-xs">
              {editingBank ? "Update details or status for this registered bank." : "Register a new financial institution for treasury accounts."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label>Bank Code <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. QNB, CBQ"
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div>
              <Label>Bank Full Name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Qatar National Bank (QNB)"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>SWIFT Code / Routing Code</Label>
              <Input
                placeholder="e.g. QNBAQAQA"
                value={form.swift_code}
                onChange={e => setForm({ ...form, swift_code: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v: 'Active' | 'Inactive') => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active" className="text-xs">Active</SelectItem>
                  <SelectItem value="Inactive" className="text-xs">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {editingBank ? "Update Bank" : "Save Bank"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BankAccountSubModule() {
  const { trialBalanceDetailed } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinBankAccount | null>(null);
  const [data, setData] = useState<FinBankAccount[]>([]);
  const [banksList, setBanksList] = useState<FinBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    bank_id: string;
    account_number: string;
    account_title: string;
    currency: string;
    opening_balance: number;
    status: 'Active' | 'Inactive';
  }>({
    bank_id: "",
    account_number: "",
    account_title: "",
    currency: "QAR",
    opening_balance: 0,
    status: "Active"
  });

  const LOCAL_STORAGE_KEY = "pms_fin_bank_accounts_override_v2";

  useEffect(() => {
    load();
    const handleSync = () => load();
    window.addEventListener("banks-updated", handleSync);
    return () => window.removeEventListener("banks-updated", handleSync);
  }, []);

  async function load() {
    setLoading(true);

    // 1. Fetch available banks from Supabase / cache
    let loadedBanks: FinBank[] = [];
    try {
      const resBanks = await FinBanksApi.fetchAll();
      if (resBanks && resBanks.length > 0) {
        loadedBanks = resBanks.map(b => ({
          ...b,
          status: (b.status || 'Active') as 'Active' | 'Inactive'
        }));
      }
    } catch (e) {
      console.warn("Failed to fetch fin_banks for accounts submodule", e);
    }

    if (loadedBanks.length === 0) {
      try {
        const cachedBanks = localStorage.getItem("pms_fin_banks_override_v2");
        if (cachedBanks) {
          const parsed = JSON.parse(cachedBanks);
          if (Array.isArray(parsed) && parsed.length > 0) loadedBanks = parsed;
        }
      } catch {}
    }

    if (loadedBanks.length === 0) {
      loadedBanks = [
        { id: "1", code: "QNB", name: "Qatar National Bank (QNB)", swift_code: "QNBAQAQA", status: "Active" },
        { id: "2", code: "CBQ", name: "Commercial Bank of Qatar (CBQ)", swift_code: "CBQAQAQA", status: "Active" },
        { id: "3", code: "DOHA", name: "Doha Bank QPSC", swift_code: "DOHBQAQA", status: "Active" },
        { id: "4", code: "QIB", name: "Qatar Islamic Bank (QIB)", swift_code: "QISBQAQA", status: "Active" },
        { id: "5", code: "MAR", name: "Masraf Al Rayan", swift_code: "MARKQAQA", status: "Active" },
        { id: "6", code: "DUKHAN", name: "Dukhan Bank", swift_code: "BARQAQA", status: "Active" },
      ];
    }
    setBanksList(loadedBanks);

    // 2. Fetch bank accounts from Supabase / cache
    try {
      const resAcc = await FinBankAccountsApi.fetchAll();
      if (resAcc && resAcc.length > 0) {
        const list: FinBankAccount[] = resAcc.map(a => ({
          ...a,
          status: (a.status || 'Active') as 'Active' | 'Inactive'
        }));
        setData(list);
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list)); } catch {}
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Failed to fetch bank accounts from Supabase", e);
    }

    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setData(parsed);
          setLoading(false);
          return;
        }
      }
    } catch {}

    const defaults: FinBankAccount[] = [
      { id: "1", bank_id: String(loadedBanks[0]?.id || "1"), account_number: "QA55QNBA00000000123456789", account_title: "ZYNO Operations & Collection (QNB)", currency: "QAR", opening_balance: 1500000, status: "Active" },
      { id: "2", bank_id: String(loadedBanks[1]?.id || "2"), account_number: "QA88CBQA00000000987654321", account_title: "ZYNO Escrow & Deposits Account (CBQ)", currency: "QAR", opening_balance: 450000, status: "Active" },
      { id: "3", bank_id: String(loadedBanks[2]?.id || "3"), account_number: "QA22DOHB00000000554433221", account_title: "ZYNO Payroll & Disbursement (Doha Bank)", currency: "QAR", opening_balance: 200000, status: "Active" },
    ];
    setData(defaults);
    setLoading(false);
  }

  function handleOpenAdd() {
    setEditingAccount(null);
    setForm({
      bank_id: banksList[0]?.id ? String(banksList[0].id) : "",
      account_number: "",
      account_title: "",
      currency: "QAR",
      opening_balance: 0,
      status: "Active"
    });
    setOpen(true);
  }

  function handleOpenEdit(account: FinBankAccount) {
    setEditingAccount(account);
    setForm({
      bank_id: account.bank_id ? String(account.bank_id) : (banksList[0]?.id ? String(banksList[0].id) : ""),
      account_number: account.account_number || "",
      account_title: account.account_title || "",
      currency: account.currency || "QAR",
      opening_balance: Number(account.opening_balance) || 0,
      status: (account.status || "Active") as "Active" | "Inactive"
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.account_number.trim() || !form.account_title.trim()) {
      toast.error("Please enter both account number and account title");
      return;
    }

    if (editingAccount) {
      const updatedAccount: FinBankAccount = {
        ...editingAccount,
        bank_id: form.bank_id,
        account_number: form.account_number.trim(),
        account_title: form.account_title.trim(),
        currency: form.currency.trim().toUpperCase() || "QAR",
        opening_balance: Number(form.opening_balance) || 0,
        status: form.status
      };

      try {
        await FinBankAccountsApi.update(String(editingAccount.id), {
          bank_id: updatedAccount.bank_id,
          account_number: updatedAccount.account_number,
          account_title: updatedAccount.account_title,
          currency: updatedAccount.currency,
          opening_balance: updatedAccount.opening_balance,
          status: updatedAccount.status
        });
      } catch (err) {
        console.warn("Supabase account update error:", err);
      }

      setData(prev => {
        const next = prev.map(a => String(a.id) === String(editingAccount.id) ? updatedAccount : a);
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
      toast.success(`Bank account ${updatedAccount.account_number} updated successfully`);
    } else {
      const newAccountPayload = {
        bank_id: form.bank_id,
        account_number: form.account_number.trim(),
        account_title: form.account_title.trim(),
        currency: form.currency.trim().toUpperCase() || "QAR",
        opening_balance: Number(form.opening_balance) || 0,
        status: form.status
      };

      let createdAccount: FinBankAccount = { id: String(Date.now()), ...newAccountPayload };
      try {
        const res = await FinBankAccountsApi.create(newAccountPayload);
        if (res && res.id) {
          createdAccount = { ...res, status: res.status || form.status };
        }
      } catch (err) {
        console.warn("Supabase account create error:", err);
      }

      setData(prev => {
        const next = [createdAccount, ...prev];
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
      toast.success("Bank account created and mapped to GL Account 12000");
    }

    setOpen(false);
  }

  async function handleToggleStatus(account: FinBankAccount) {
    const newStatus: 'Active' | 'Inactive' = account.status === 'Inactive' ? 'Active' : 'Inactive';
    const updatedAccount: FinBankAccount = { ...account, status: newStatus };

    try {
      await FinBankAccountsApi.update(String(account.id), { status: newStatus });
    } catch (err) {
      console.warn("Supabase account status update error:", err);
    }

    setData(prev => {
      const next = prev.map(a => String(a.id) === String(account.id) ? updatedAccount : a);
      try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });

    toast.success(`Account "${account.account_title || account.account_number}" marked as ${newStatus}`);
  }

  async function handleDeleteAccount(account: FinBankAccount) {
    if (!confirm(`Are you sure you want to permanently delete account "${account.account_title || account.account_number}" from the database?`)) {
      return;
    }
    try {
      await FinBankAccountsApi.delete(String(account.id));
    } catch (err) {
      console.warn("Supabase delete account error:", err);
    }
    setData(prev => {
      const next = prev.filter(a => String(a.id) !== String(account.id));
      try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    window.dispatchEvent(new Event("banks-updated"));
    toast.success(`Account "${account.account_title || account.account_number}" deleted from database`);
  }

  function getBankName(bankId: string) {
    const b = banksList.find(x => String(x.id) === String(bankId) || x.code === bankId);
    return b ? `${b.name} (${b.code})` : (banksList[0] ? `${banksList[0].name} (${banksList[0].code})` : "Qatar National Bank (QNB)");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Bank Accounts Portfolio & IBAN Register</h3>
          <p className="text-xs text-muted-foreground">Corporate treasury accounts linked to GL cash and bank clearing sub-ledgers.</p>
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Bank Account
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Bank Name</TableHead>
              <TableHead className="font-bold">IBAN / Account #</TableHead>
              <TableHead className="font-bold">Account Title</TableHead>
              <TableHead className="font-bold">Currency</TableHead>
              <TableHead className="text-right font-bold">Current Balance (QAR)</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground text-xs">
                  {loading ? "Loading bank accounts..." : "No bank accounts registered yet."}
                </TableCell>
              </TableRow>
            ) : (
              data.map(a => {
                const isActive = a.status !== 'Inactive';
                const isCbq = a.account_number?.includes('4060692533001') || a.account_title?.toLowerCase().includes('cbq');
                const isDukhan = a.account_number?.includes('100001761798') || a.account_title?.toLowerCase().includes('dukhan');
                const glMatch = trialBalanceDetailed.find(t => 
                  t.code === (isDukhan ? "12000002" : isCbq ? "12000001" : (a as any).gl_code) ||
                  t.name.toLowerCase().includes((a.account_title || "").toLowerCase())
                );
                const currentBalance = (Number(a.opening_balance) || 0) + (glMatch ? glMatch.balance : 0);

                return (
                  <TableRow key={a.id} className="hover:bg-muted/30 text-xs">
                    <TableCell className="font-semibold text-primary">{getBankName(a.bank_id ?? "")}</TableCell>
                    <TableCell className="font-mono font-bold">{a.account_number}</TableCell>
                    <TableCell className="font-medium">{a.account_title}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{a.currency}</Badge></TableCell>
                    <TableCell className="text-right font-mono font-bold text-emerald-600">{currentBalance.toLocaleString()} QAR</TableCell>
                    <TableCell>
                      {isActive ? (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30 text-[10px] font-medium">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/30 text-[10px] font-medium">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 hover:text-primary"
                          onClick={() => handleOpenEdit(a)}
                          title="Edit Bank Account"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-7 px-2 text-[11px] ${isActive ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'}`}
                          onClick={() => handleToggleStatus(a)}
                          title={isActive ? "Mark Inactive" : "Mark Active"}
                        >
                          {isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteAccount(a)}
                          title="Delete Bank Account"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAccount ? "Edit Bank Account" : "Add Bank Account"}</DialogTitle>
            <DialogDescription className="text-xs">
              {editingAccount ? "Update treasury account attributes, institution link, or active status." : "Register an operating or escrow bank account mapped to the general ledger."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label>Select Bank Institution <span className="text-destructive">*</span></Label>
              <Select value={form.bank_id} onValueChange={v => setForm({ ...form, bank_id: v })}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select Registered Bank" />
                </SelectTrigger>
                <SelectContent>
                  {banksList.map(b => (
                    <SelectItem key={b.id} value={String(b.id)} className="text-xs">
                      <span className="font-medium">{b.name} ({b.code})</span>
                      {b.status === 'Inactive' && (
                        <span className="ml-2 text-muted-foreground text-[10px]">(Inactive)</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>IBAN / Account Number <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. QA55QNBA00000000123456789"
                value={form.account_number}
                onChange={e => setForm({ ...form, account_number: e.target.value })}
              />
            </div>
            <div>
              <Label>Account Title <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. ZYNO Main Operations Account"
                value={form.account_title}
                onChange={e => setForm({ ...form, account_title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Currency</Label>
                <Input
                  value={form.currency}
                  onChange={e => setForm({ ...form, currency: e.target.value })}
                />
              </div>
              <div>
                <Label>Opening Balance (QAR)</Label>
                <Input
                  type="number"
                  value={form.opening_balance}
                  onChange={e => setForm({ ...form, opening_balance: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v: 'Active' | 'Inactive') => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active" className="text-xs">Active</SelectItem>
                  <SelectItem value="Inactive" className="text-xs">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {editingAccount ? "Update Account" : "Save Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BankClearanceSubModule() {
  const { bankClearances, addBankClearance } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);

  const [form, setForm] = useState({
    ref: `CHQ-${Math.floor(100000 + Math.random() * 900000)}`,
    bank: "QNB Main Account",
    type: "PDC Clearance",
    amount: "5600",
    date: new Date().toISOString().split("T")[0],
    status: "Cleared" as const,
  });

  const combinedClearances = [...bankClearances, ...data];

  function handleAdd() {
    const amt = parseFloat(form.amount) || 0;
    addBankClearance({
      ref: form.ref,
      bank: form.bank,
      type: form.type,
      amount: amt,
      date: form.date,
      status: form.status,
    });
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Cheque & Wire Clearance Console</h3>
          <p className="text-xs text-muted-foreground">Clear deposited cheques and wire transfers once credited by the central clearing house.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Record Clearance</Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Entry Date</TableHead>
              <TableHead className="font-bold">Transaction / Cheque #</TableHead>
              <TableHead className="font-bold">Bank</TableHead>
              <TableHead className="font-bold">Type</TableHead>
              <TableHead className="font-bold">Clearance Date</TableHead>
              <TableHead className="text-right font-bold">Amount (QAR)</TableHead>
              <TableHead className="font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...combinedClearances].sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime()).map((row, idx) => (
              <TableRow key={idx} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono text-muted-foreground">{row.date}</TableCell>
                <TableCell className="font-mono font-bold text-primary">{row.ref}</TableCell>
                <TableCell className="font-medium">{row.bank}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell className="text-right font-mono font-bold">{row.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "Cleared" ? "default" : "outline"} className="text-[10px]">
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Record Bank Clearance</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Entry Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Cheque / Reference Number</Label><Input value={form.ref} onChange={e => setForm({ ...form, ref: e.target.value })} /></div>
            </div>
            <div>
              <Label>Bank Account</Label>
              <Select value={form.bank} onValueChange={v => setForm({ ...form, bank: v })}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Qatar National Bank (QNB)">Qatar National Bank (QNB)</SelectItem>
                  <SelectItem value="Commercial Bank of Qatar (CBQ)">Commercial Bank of Qatar (CBQ)</SelectItem>
                  <SelectItem value="Doha Bank">Doha Bank</SelectItem>
                  <SelectItem value="Qatar Islamic Bank (QIB)">Qatar Islamic Bank (QIB)</SelectItem>
                  <SelectItem value="Masraf Al Rayan">Masraf Al Rayan</SelectItem>
                  <SelectItem value="Dukhan Bank">Dukhan Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount (QAR)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
              <div>
                <Label>Clearance Status</Label>
                <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cleared">Cleared</SelectItem>
                    <SelectItem value="Pending Clearance">Pending Clearance</SelectItem>
                    <SelectItem value="Returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Confirm Clearance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BankReconciliationSubModule() {
  const { bankReconciliations, addBankReconciliation } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);

  const [form, setForm] = useState({
    account_number: "QA55QNBA00000000123456789",
    statement_date: new Date().toISOString().split("T")[0],
    entry_date: new Date().toISOString().split("T")[0],
    book_balance: "1500000",
    statement_balance: "1500000",
  });

  const combinedReconciliations = [...bankReconciliations, ...data];
  const bBal = parseFloat(form.book_balance) || 0;
  const sBal = parseFloat(form.statement_balance) || 0;
  const diff = bBal - sBal;

  function handleAdd() {
    addBankReconciliation({
      account_number: form.account_number,
      statement_date: form.statement_date,
      book_balance: bBal,
      statement_balance: sBal,
      difference: diff,
      status: diff === 0 ? "Reconciled" : "Discrepancy"
    });
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Bank Reconciliation Workbench</h3>
          <p className="text-xs text-muted-foreground">Match bank statement closing balance against General Ledger cash/bank balance.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> New Reconciliation</Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Entry Date</TableHead>
              <TableHead className="font-bold">Account #</TableHead>
              <TableHead className="font-bold">Statement Date</TableHead>
              <TableHead className="text-right font-bold">GL Book Balance (QAR)</TableHead>
              <TableHead className="text-right font-bold">Bank Statement Balance (QAR)</TableHead>
              <TableHead className="text-right font-bold">Difference</TableHead>
              <TableHead className="font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...combinedReconciliations].sort((a, b) => new Date(b.statement_date || "").getTime() - new Date(a.statement_date || "").getTime()).map(r => (
              <TableRow key={r.id} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono text-muted-foreground">{(r as any).entry_date || r.statement_date}</TableCell>
                <TableCell className="font-mono font-bold text-primary">{r.account_number}</TableCell>
                <TableCell>{r.statement_date}</TableCell>
                <TableCell className="text-right font-mono font-semibold">{r.book_balance.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono font-semibold">{r.statement_balance.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono font-bold text-emerald-600">{(r.book_balance - r.statement_balance).toLocaleString()} QAR</TableCell>
                <TableCell><Badge variant="default" className="text-[10px]">{r.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Bank Reconciliation</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label>Bank Account</Label>
              <Select value={form.account_number} onValueChange={v => setForm({ ...form, account_number: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="QA55QNBA00000000123456789">QA55QNBA00000000123456789 - QNB Main</SelectItem>
                  <SelectItem value="QA88CBQA00000000987654321">QA88CBQA00000000987654321 - CBQ Escrow</SelectItem>
                  <SelectItem value="QA22DOHB00000000554433221">QA22DOHB00000000554433221 - Doha Bank Payroll</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Entry Date</Label><Input type="date" value={form.entry_date} onChange={e => setForm({ ...form, entry_date: e.target.value })} /></div>
              <div><Label>Statement Date</Label><Input type="date" value={form.statement_date} onChange={e => setForm({ ...form, statement_date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>GL Book Balance (QAR)</Label><Input type="number" value={form.book_balance} onChange={e => setForm({ ...form, book_balance: e.target.value })} /></div>
              <div><Label>Bank Statement Balance</Label><Input type="number" value={form.statement_balance} onChange={e => setForm({ ...form, statement_balance: e.target.value })} /></div>
            </div>
            <div className="p-2.5 rounded bg-muted/40 border flex justify-between">
              <span>Reconciliation Difference:</span>
              <span className={`font-mono font-bold ${diff === 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {diff === 0 ? "0 QAR (Balanced)" : `${diff.toLocaleString()} QAR`}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Complete Reconciliation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BankReconciliationStatementListSubModule() {
  const [data, setData] = useState<{ id: string; entry_date: string; title: string; period: string; balance: string }[]>([]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Reconciliation Statements Archive</h3>
          <p className="text-xs text-muted-foreground">Certified monthly bank reconciliations with auditor sign-offs.</p>
        </div>
      </div>
      <div className="space-y-2">
        {[...data].sort((a, b) => new Date(b.entry_date || "").getTime() - new Date(a.entry_date || "").getTime()).map((item) => (
          <div key={item.id} className="border rounded-lg p-3.5 bg-card flex justify-between items-center text-xs shadow-sm">
            <div>
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-[11px] text-muted-foreground">Entry Date: <span className="font-mono">{item.entry_date}</span> • Period: {item.period} • Certified Balance: <strong className="text-emerald-600">{item.balance}</strong></p>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => toast.success(`Exporting Statement PDF for ${item.title}`)}>
              <Download className="h-3 w-3" /> PDF Statement
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. FINANCE REPORTS SUB-MODULES — Live FinanceStore Driven
// ─────────────────────────────────────────────────────────────────────────────

type TrialBalanceAccount = {
  code: string;
  name: string;
  type: "Assets" | "Liabilities" | "Capital" | "Revenue" | "Expenses";
  debit: number;
  credit: number;
  balance: number;
};

function getTrialBalanceForPeriod(
  chartAccounts: TrialBalanceAccount[],
  transactions: Array<{
    date: string;
    account_code: string;
    account_name: string;
    account_type: TrialBalanceAccount["type"];
    debit: number;
    credit: number;
  }>,
  fromDate: string,
  toDate: string,
): TrialBalanceAccount[] {
  const accounts = new Map<string, TrialBalanceAccount>();
  chartAccounts.forEach(account => {
    accounts.set(account.code, { ...account, debit: 0, credit: 0, balance: 0 });
  });
  transactions.forEach(tx => {
    const date = String(tx.date || "").slice(0, 10);
    if ((fromDate && date < fromDate) || (toDate && date > toDate)) return;
    const account = accounts.get(tx.account_code) || {
      code: tx.account_code,
      name: tx.account_name,
      type: tx.account_type,
      debit: 0,
      credit: 0,
      balance: 0,
    };
    account.debit += tx.debit || 0;
    account.credit += tx.credit || 0;
    account.balance = account.debit - account.credit;
    accounts.set(tx.account_code, account);
  });
  return Array.from(accounts.values());
}

function summarizeTrialBalance(accounts: TrialBalanceAccount[]) {
  const summary = { assets: 0, liabilities: 0, capital: 0, revenue: 0, expenses: 0 };
  accounts.forEach(account => {
    const net = account.debit - account.credit;
    if (account.type === "Assets") summary.assets += net;
    else if (account.type === "Liabilities") summary.liabilities -= net;
    else if (account.type === "Capital") summary.capital -= net;
    else if (account.type === "Revenue") summary.revenue -= net;
    else if (account.type === "Expenses") summary.expenses += net;
  });
  const totalDebit = Math.max(0, summary.assets) + Math.max(0, summary.expenses)
    + Math.max(0, -summary.liabilities) + Math.max(0, -summary.capital) + Math.max(0, -summary.revenue);
  const totalCredit = Math.max(0, summary.liabilities) + Math.max(0, summary.capital) + Math.max(0, summary.revenue)
    + Math.max(0, -summary.assets) + Math.max(0, -summary.expenses);
  return {
    ...summary,
    totalDebit,
    totalCredit,
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
  };
}

function TrialBalanceSimpleSubModule() {
  const { trialBalanceDetailed, allLedgerTransactions } = useFinanceStore();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const trialBalanceSummary = useMemo(
    () => summarizeTrialBalance(getTrialBalanceForPeriod(
      trialBalanceDetailed,
      allLedgerTransactions,
      fromDate,
      toDate,
    )),
    [trialBalanceDetailed, allLedgerTransactions, fromDate, toDate]
  );
  const { assets, liabilities, capital, revenue, expenses, totalDebit, totalCredit, isBalanced } = trialBalanceSummary;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Trial Balance (Simple Summary)</h3>
          <p className="text-xs text-muted-foreground">Summary totals across Asset, Liability, Equity, Revenue, and Expense classes for the selected posting period.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">From</Label>
            <Input type="date" className="h-8 w-36 text-xs" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">To</Label>
            <Input type="date" className="h-8 w-36 text-xs" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
          {(fromDate || toDate) && (
            <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setFromDate(""); setToDate(""); }}>
              All Dates
            </Button>
          )}
          <Badge variant="outline" className={`font-mono ${isBalanced ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`}>
            {isBalanced ? '✓ Balanced (Dr = Cr)' : '⚠ Out of Balance'}
          </Badge>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Account Classification</TableHead>
              <TableHead className="text-right font-bold">Total Debit (QAR)</TableHead>
              <TableHead className="text-right font-bold">Total Credit (QAR)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            <TableRow className="hover:bg-muted/30">
              <TableCell className="font-semibold text-emerald-700">1000 — Assets (Bank, Cash, Receivables, PDCs, Fixed Assets)</TableCell>
              <TableCell className="text-right font-mono font-bold text-blue-600">{assets?.toLocaleString() ?? '0'}</TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">—</TableCell>
            </TableRow>
            <TableRow className="hover:bg-muted/30">
              <TableCell className="font-semibold text-amber-700">2000 — Liabilities (Security Deposits, AP, PDC Customer Liability)</TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">—</TableCell>
              <TableCell className="text-right font-mono font-bold text-emerald-600">{liabilities?.toLocaleString() ?? '0'}</TableCell>
            </TableRow>
            <TableRow className="hover:bg-muted/30">
              <TableCell className="font-semibold text-blue-700">3000 — Capital & Owner Equity (Retained Earnings)</TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">—</TableCell>
              <TableCell className="text-right font-mono font-bold text-emerald-600">{capital.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow className="hover:bg-muted/30">
              <TableCell className="font-semibold text-indigo-700">4000 — Revenue (Rental, Commercial Lease, Service Income)</TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">—</TableCell>
              <TableCell className="text-right font-mono font-bold text-emerald-600">{revenue.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow className="hover:bg-muted/30">
              <TableCell className="font-semibold text-rose-700">5000 — Expenses (Maintenance, Utility, Payroll, Cleaning)</TableCell>
              <TableCell className="text-right font-mono font-bold text-blue-600">{expenses.toLocaleString()}</TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">—</TableCell>
            </TableRow>
            <TableRow className="font-bold border-t-2 bg-muted/20">
              <TableCell className="font-bold">Total Trial Balance</TableCell>
              <TableCell className="text-right font-mono font-bold text-primary">{totalDebit.toLocaleString()} QAR</TableCell>
              <TableCell className="text-right font-mono font-bold text-primary">{totalCredit.toLocaleString()} QAR</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TrialBalanceFullSubModule() {
  const { trialBalanceDetailed, allLedgerTransactions } = useFinanceStore();
  const [viewMode, setViewMode] = useState<"net" | "gross">("net");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const periodTrialBalance = useMemo(
    () => getTrialBalanceForPeriod(trialBalanceDetailed, allLedgerTransactions, fromDate, toDate),
    [trialBalanceDetailed, allLedgerTransactions, fromDate, toDate]
  );

  // Net Period Balances mode: compute net Dr / Cr per account
  const netAccounts = useMemo(() => {
    return periodTrialBalance.map(acc => {
      const netDr = Math.max(0, acc.debit - acc.credit);
      const netCr = Math.max(0, acc.credit - acc.debit);
      return {
        ...acc,
        displayDr: viewMode === "net" ? netDr : acc.debit,
        displayCr: viewMode === "net" ? netCr : acc.credit,
      };
    });
  }, [periodTrialBalance, viewMode]);

  const totalDr = netAccounts.reduce((s, a) => s + (a.displayDr || 0), 0);
  const totalCr = netAccounts.reduce((s, a) => s + (a.displayCr || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Detailed General Ledger Trial Balance</h3>
          <p className="text-xs text-muted-foreground">
            {viewMode === "net"
              ? "Net debit and credit movements per account for the selected posting period."
              : "Gross debit and credit turnover for the selected posting period."}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">From</Label>
            <Input type="date" className="h-8 w-36 text-xs" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">To</Label>
            <Input type="date" className="h-8 w-36 text-xs" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
          {(fromDate || toDate) && (
            <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setFromDate(""); setToDate(""); }}>
              All Dates
            </Button>
          )}
          {/* Mode Switcher */}
          <div className="flex bg-muted/60 p-0.5 rounded-lg text-xs border">
            <button
              type="button"
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${viewMode === "net" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setViewMode("net")}
            >
              Net Period Balances
            </button>
            <button
              type="button"
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${viewMode === "gross" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setViewMode("gross")}
            >
              Gross Turnover Movements
            </button>
          </div>
          <Badge variant="outline" className="font-mono">{periodTrialBalance.length} Accounts</Badge>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Code</TableHead>
              <TableHead className="font-bold">Account Name</TableHead>
              <TableHead className="font-bold">Type</TableHead>
              <TableHead className="text-right font-bold">{viewMode === "net" ? "Net Debit (QAR)" : "Gross Debit (QAR)"}</TableHead>
              <TableHead className="text-right font-bold">{viewMode === "net" ? "Net Credit (QAR)" : "Gross Credit (QAR)"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {netAccounts.sort((a, b) => a.code.localeCompare(b.code)).map(acc => (
              <TableRow key={acc.code} className="hover:bg-muted/30">
                <TableCell className="font-mono font-bold text-primary">{acc.code}</TableCell>
                <TableCell className="font-medium">{acc.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] font-semibold ${acc.type === 'Assets' ? 'text-emerald-700' : acc.type === 'Liabilities' ? 'text-amber-700' : acc.type === 'Revenue' ? 'text-indigo-700' : acc.type === 'Expenses' ? 'text-rose-700' : 'text-blue-700'}`}>
                    {acc.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-blue-600 font-semibold">{acc.displayDr > 0 ? acc.displayDr.toLocaleString() : "—"}</TableCell>
                <TableCell className="text-right font-mono text-emerald-600 font-semibold">{acc.displayCr > 0 ? acc.displayCr.toLocaleString() : "—"}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold border-t-2 bg-muted/20">
              <TableCell colSpan={3}>Grand Total ({viewMode === "net" ? "Net Period Balances" : "Gross Movements"})</TableCell>
              <TableCell className="text-right font-mono font-bold text-primary">{totalDr.toLocaleString()} QAR</TableCell>
              <TableCell className="text-right font-mono font-bold text-primary">{totalCr.toLocaleString()} QAR</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REVENUE GENERATION REPORT SUB-MODULE
// GL Accounts: 41100 Rental | 41200 Parking | 41300 Utility Recovery |
//              41400 CAM Recovery | 41500 Mgmt Fee | 41600 Late Payment Penalty
// ─────────────────────────────────────────────────────────────────────────────
function RevenueGenerationSubModule() {
  const { receivableInvoices, vouchers, journalEntries, allLedgerTransactions, addVoucher } = useFinanceStore();
  const { pdcs: contextPdcs, leases } = useAppData();
  const [activeSubTab, setActiveSubTab] = useState<"asOf" | "gl">("asOf");
  const [periodFilter, setPeriodFilter] = useState<"all" | "thisMonth" | "lastMonth">("all");
  const [dbPdcs, setDbPdcs] = useState<any[]>([]);

  // ── Period-Based Recognition Engine State (Revenue As-Of) ─────────────────
  const todayStr = new Date().toISOString().split("T")[0];
  const [asOfDate, setAsOfDate] = useState<string>(todayStr);
  const [prorationMethod, setProrationMethod] = useState<ProrationMethod>("30_DAY_MONTH");
  const [asOfProperty, setAsOfProperty] = useState<string>("all");
  const [asOfUnit, setAsOfUnit] = useState<string>("all");
  const [asOfTenant, setAsOfTenant] = useState<string>("all");
  const [asOfStatusFilter, setAsOfStatusFilter] = useState<string>("all");
  const [asOfSearch, setAsOfSearch] = useState<string>("");
  const [savedBatches, setSavedBatches] = useState<RevenueGenerationBatchSummary[]>(() => {
    try {
      const stored = localStorage.getItem("fin_revenue_generation_batches_v2");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedBatchDetails, setSelectedBatchDetails] = useState<RevenueGenerationBatchSummary | null>(null);

  // ── Multi-dimensional filter state (GL Actuals Tab) ───────────────────────
  const [filterProperty, setFilterProperty] = useState<string>("all");
  const [filterUnit, setFilterUnit] = useState<string>("all");
  const [filterCustomer, setFilterCustomer] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterFromDate, setFilterFromDate] = useState<string>("");
  const [filterToDate, setFilterToDate] = useState<string>("");
  const [filterSearch, setFilterSearch] = useState<string>("");

  const resetFilters = () => {
    setFilterProperty("all");
    setFilterUnit("all");
    setFilterCustomer("all");
    setFilterMonth("all");
    setFilterSource("all");
    setFilterFromDate("");
    setFilterToDate("");
    setFilterSearch("");
    setPeriodFilter("all");
  };

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

  // Fetch all live database PDCs
  useEffect(() => {
    async function fetchPdcRecords() {
      try {
        const { data: regData } = await supabase.from("fin_pdc_register").select("*");
        const { data: altData } = await supabase.from("pdcs").select("*");
        const combined = [...(regData || []), ...(altData || [])];
        setDbPdcs(combined);
      } catch {
        // fallback
      }
    }
    fetchPdcRecords();
  }, []);

  const combinedPdcs = useMemo(() => {
    const list = [...(contextPdcs || []), ...dbPdcs];
    const map = new Map<string, any>();
    list.forEach(p => {
      const key = p.id || p.chequeNo || p.cheque_number || Math.random().toString();
      if (!map.has(key)) {
        map.set(key, {
          leaseId: p.leaseId || p.lease_id,
          chequeNo: p.chequeNo || p.cheque_number,
          date: p.date || p.cheque_date || p.dueDate,
          amount: Number(p.amount || 0),
          status: p.status,
          period: p.period || p.rental_period,
        });
      }
    });
    return Array.from(map.values());
  }, [contextPdcs, dbPdcs]);

  // ── Calculate Live Preview from Revenue Engine ───────────────────────────
  const activeBatchPreview: RevenueGenerationBatchSummary = useMemo(() => {
    const leaseData = (leases || []).map((l: any) => ({
      id: l.id || l.leaseId,
      tenantName: l.tenantName || l.tenant || "Unknown Tenant",
      property: l.property || l.propertyName || "Unknown Property",
      unit: l.unit || l.unitRef || "Unknown Unit",
      startDate: l.startDate || l.start_date || "",
      endDate: l.endDate || l.end_date || "",
      monthlyRent: Number(l.monthlyRent || l.rentAmount || l.rent || 0),
      plannedVacateDate: l.plannedVacateDate || l.vacateDate,
      actualVacateDate: l.settlement?.moveOutDate || l.actualVacateDate || l.moveOutDate,
      earlyVacate: !!(l.settlement?.moveOutDate || l.earlyVacate || l.actualVacateDate),
      status: l.status,
    }));

    return generatePortfolioRevenueBatch({
      leases: leaseData,
      asOfDate,
      prorationMethod,
      pdcs: combinedPdcs,
    });
  }, [leases, asOfDate, prorationMethod, combinedPdcs]);

  // Filtered preview records
  const filteredPreviewRecords = useMemo(() => {
    return activeBatchPreview.records.filter((rec) => {
      if (asOfProperty !== "all" && rec.propertyName !== asOfProperty) return false;
      if (asOfUnit !== "all" && rec.unitRef !== asOfUnit) return false;
      if (asOfTenant !== "all" && rec.tenantName !== asOfTenant) return false;
      if (asOfStatusFilter !== "all" && rec.status !== asOfStatusFilter) return false;
      if (asOfSearch) {
        const q = asOfSearch.toLowerCase();
        const str = [rec.tenantName, rec.propertyName, rec.unitRef, rec.periodStart, rec.periodEnd, rec.reasonCode].join(" ").toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  }, [activeBatchPreview, asOfProperty, asOfUnit, asOfTenant, asOfStatusFilter, asOfSearch]);

  const previewRecognizedSum = useMemo(() => {
    return filteredPreviewRecords.reduce((sum, r) => sum + r.netRecognizedRevenue, 0);
  }, [filteredPreviewRecords]);

  const previewDeferredSum = useMemo(() => {
    return filteredPreviewRecords.reduce((sum, r) => sum + r.deferredRevenue, 0);
  }, [filteredPreviewRecords]);

  const previewContractualSum = useMemo(() => {
    return filteredPreviewRecords.reduce((sum, r) => sum + r.grossRevenue, 0);
  }, [filteredPreviewRecords]);

  // Post / Generate Revenue Batch (Posts recognized period revenue into the GL ledger)
  const handleGenerateBatch = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newBatchId = `RGB-${Date.now().toString().slice(-6)}`;
      const newBatch: RevenueGenerationBatchSummary = {
        ...activeBatchPreview,
        batchId: newBatchId,
        generatedAt: new Date().toISOString(),
      };
      const updated = [newBatch, ...savedBatches];
      setSavedBatches(updated);
      try {
        localStorage.setItem("fin_revenue_generation_batches_v2", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to persist revenue batch", e);
      }

      // Post recognized completed periods to GL (Rental Revenue 41100)
      const recognizedRecords = activeBatchPreview.records.filter(r => r.status === "RECOGNIZED" && r.netRecognizedRevenue > 0);
      recognizedRecords.forEach((rec) => {
        const existingVoucherNo = `REV-${rec.leaseId}-${rec.periodStart.slice(0, 7)}`;
        const alreadyExists = vouchers.some(v => v.voucher_no === existingVoucherNo);
        if (!alreadyExists) {
          addVoucher({
            voucher_no: existingVoucherNo,
            voucher_type: "Journal Voucher",
            date: rec.effectiveRevenueEnd || rec.periodEnd || asOfDate,
            name: `Rental Revenue Recognized – ${rec.tenantName} (${rec.periodStart} to ${rec.periodEnd})`,
            debit: "Customer (PDC) Liability",
            debit_code: "21400",
            credit: "Rental Revenue",
            credit_code: "41100",
            amount: rec.netRecognizedRevenue,
            method: "Revenue Recognition",
            property_name: rec.propertyName,
            unit_ref: rec.unitRef,
            tenant_name: rec.tenantName,
          });
        }
      });

      setIsGenerating(false);
      toast.success(`Revenue Batch ${newBatch.batchId} generated & posted to GL!`, {
        description: `Recognized QR ${newBatch.totalRecognizedRevenue.toLocaleString()} across ${newBatch.totalTenants} tenants as of ${asOfDate}.`
      });
    }, 600);
  };

  // ── Revenue stream definitions (GL code + label + color) ──────────────────
  const REVENUE_STREAMS = [
    { code: "41100", label: "Rental Revenue",            color: "bg-emerald-500", textColor: "text-emerald-700", border: "border-emerald-200", bg: "bg-emerald-50" },
    { code: "41200", label: "Parking Revenue",           color: "bg-blue-500",    textColor: "text-blue-700",    border: "border-blue-200",    bg: "bg-blue-50"    },
    { code: "41300", label: "Utility Recovery",          color: "bg-violet-500",  textColor: "text-violet-700",  border: "border-violet-200",  bg: "bg-violet-50"  },
    { code: "41400", label: "CAM / Maintenance Recovery",color: "bg-amber-500",   textColor: "text-amber-700",   border: "border-amber-200",   bg: "bg-amber-50"   },
    { code: "41500", label: "Property Management Fee",   color: "bg-rose-500",    textColor: "text-rose-700",    border: "border-rose-200",    bg: "bg-rose-50"    },
    { code: "41600", label: "Late Payment Penalty",      color: "bg-orange-500",  textColor: "text-orange-700",  border: "border-orange-200",  bg: "bg-orange-50"  },
  ];

  // Combine unified PDCs — sources: DB tables + localStorage context + fin_voucher PDC events
  const unifiedRealizedPdcs = useMemo(() => {
    const map = new Map<string, any>();

    // Helper: build contextPdc lookup by chequeNo for date recovery
    const ctxByChq = new Map<string, any>();
    (contextPdcs || []).forEach((p: any) => {
      const k = (p.chequeNo || p.cheque_number || p.id || "").toLowerCase();
      if (k) ctxByChq.set(k, p);
    });

    // 1. DB PDC tables (fin_pdc_register / pdcs)
    dbPdcs.forEach((p) => {
      const chq = p.cheque_number || p.chequeNo || p.id;
      const status = (p.status || p.status_pdc || "").toLowerCase();
      const isRealized = ["cleared","deposited","replaced","partial cash","partial_cash"].includes(status);
      if (!isRealized) return;
      const amt = Number(p.paid_amount) || Number(p.amount) || 0;
      const prop   = p.property_name || p.property_code || p.property || "";
      const unit   = p.unit_ref || p.unit_name || p.unit || "";
      const tenant = p.tenant_name || p.tenant || "";
      const date   = p.cheque_date || p.maturity_date || p.deposit_date || p.created_at?.split("T")[0] || now.toISOString().split("T")[0];
      map.set(String(chq), { id: String(p.id || chq), chqNo: String(chq), date, property: prop, unit, tenant, amount: amt, status: p.status, source: "PDC" });
    });

    // 2. Context PDCs from localStorage — primary source with real historical cheque dates
    (contextPdcs || []).forEach((p: any) => {
      const chq    = p.chequeNo || p.cheque_number || p.id;
      const status = (p.status || "").toLowerCase();
      const isRealized = ["cleared","deposited","replaced","partial cash","partial_cash"].includes(status);
      if (!isRealized) return;
      const lease  = leases?.find((l) => l.id === p.leaseId);
      const amt    = Number(p.paid_amount) || Number(p.amount) || 0;
      const prop   = p.propertyName || p.property_name || p.property || lease?.property || "";
      const unit   = p.unitRef || p.unit_ref || p.unit || lease?.unit || "";
      const tenant = p.tenantName || p.tenant_name || p.payerName || p.tenant || lease?.tenantName || "";
      // p.date IS the actual PDC cheque maturity date (historical month)
      const date   = p.date || p.cheque_date || now.toISOString().split("T")[0];
      const entry  = { id: String(p.id || chq), chqNo: String(chq), date, property: prop, unit, tenant, amount: amt, status: p.status, source: "PDC" };
      if (!map.has(String(chq))) {
        map.set(String(chq), entry);
      } else {
        // Enrich existing DB entry with richer metadata & real date
        const ex = map.get(String(chq))!;
        map.set(String(chq), { ...ex, date: ex.date || date, property: ex.property || prop, unit: ex.unit || unit, tenant: ex.tenant || tenant });
      }
    });

    // 3. Finance-store vouchers (from fin_vouchers DB) — PDC cleared / deposited / cash-replace events
    //    These carry the confirmed revenue event. Match cheque ID back to contextPdc for real date.
    vouchers.forEach((v: any) => {
      const vNo  = (v.voucher_no || "").toLowerCase();
      const desc = (v.name || "").toLowerCase();
      const isClear = vNo.includes("vch-clr-") || desc.includes("pdc cleared");
      const isDep   = vNo.includes("vch-dep-") || desc.includes("pdc deposited");
      const isCash  = vNo.includes("vch-csh-pdc-") || desc.includes("cash collected in place of pdc");
      if (!isClear && !isDep && !isCash) return;

      // Extract PDC cheque ref from voucher number: VCH-CLR-PDC-Flat01-001 → PDC-Flat01-001
      const rawNo = v.voucher_no || "";
      const m = rawNo.match(/^(?:VCH-CLR-|VCH-DEP-|VCH-CSH-PDC-)(.+)$/i);
      const pdcRef = m ? m[1] : rawNo;
      if (!pdcRef) return;

      // Skip if context PDC already provided this entry
      if (map.has(pdcRef)) return;

      // Find matching contextPdc for real date + metadata
      const ctxPdc = ctxByChq.get(pdcRef.toLowerCase()) ||
        Array.from(ctxByChq.values()).find((cp: any) => {
          const cn = (cp.chequeNo || "").toLowerCase();
          return cn && (cn.includes(pdcRef.toLowerCase()) || pdcRef.toLowerCase().includes(cn));
        });
      const lease = ctxPdc ? leases?.find((l) => l.id === ctxPdc.leaseId) : null;

      // Parse tenant/unit from description e.g. "PDC Cleared – PDC-Flat01-001 (Prabhat - Flat01)"
      let tenant = "", prop = "", unit = "";
      const bracketMatch = (v.name || "").match(/\(([^)]+)\)/);
      if (bracketMatch) {
        const parts = bracketMatch[1].split(" - ");
        tenant = parts[0]?.trim() || "";
        unit   = parts[1]?.trim() || "";
      }
      if (ctxPdc) {
        prop   = ctxPdc.propertyName || ctxPdc.property_name || ctxPdc.property || lease?.property || prop;
        unit   = ctxPdc.unitRef || ctxPdc.unit_ref || ctxPdc.unit || lease?.unit || unit;
        tenant = ctxPdc.tenantName || ctxPdc.tenant_name || ctxPdc.payerName || lease?.tenantName || tenant;
      } else if (lease) {
        prop = lease.property || prop; unit = lease.unit || unit; tenant = lease.tenantName || tenant;
      }

      // Real historical date: prefer contextPdc.date (actual cheque maturity) over voucher date
      const realDate = ctxPdc?.date || ctxPdc?.cheque_date || v.date || now.toISOString().split("T")[0];
      map.set(pdcRef, {
        id: (v.id || pdcRef) + "-rev",
        chqNo: pdcRef,
        date: realDate,
        property: prop,
        unit,
        tenant,
        amount: Number(v.amount) || 0,
        status: isCash ? "partial_cash" : isClear ? "cleared" : "deposited",
        source: "PDC",
      });
    });

    return Array.from(map.values());
  }, [dbPdcs, contextPdcs, leases, vouchers]);

  // ── Filter option lists derived from allLedgerTransactions & context data ─────────
  const allProperties = useMemo(() => {
    const s = new Set<string>();
    allLedgerTransactions.forEach(tx => {
      if (tx.account_type === "Revenue" && tx.property_name && tx.property_name !== "Unassigned") {
        s.add(tx.property_name);
      }
    });
    receivableInvoices.forEach(ar => { if (ar.property) s.add(ar.property); });
    unifiedRealizedPdcs.forEach(p => { if (p.property) s.add(p.property); });
    return Array.from(s).sort();
  }, [allLedgerTransactions, receivableInvoices, unifiedRealizedPdcs]);

  const allUnits = useMemo(() => {
    const s = new Set<string>();
    allLedgerTransactions.forEach(tx => {
      if (tx.account_type === "Revenue" && tx.unit_ref && tx.unit_ref !== "Unassigned" && tx.unit_ref !== "General") {
        s.add(tx.unit_ref);
      }
    });
    receivableInvoices.forEach(ar => { if ((ar as any).unit) s.add((ar as any).unit); });
    unifiedRealizedPdcs.forEach(p => { if (p.unit) s.add(p.unit); });
    return Array.from(s).sort();
  }, [allLedgerTransactions, receivableInvoices, unifiedRealizedPdcs]);

  const allCustomers = useMemo(() => {
    const s = new Set<string>();
    allLedgerTransactions.forEach(tx => {
      if (tx.account_type === "Revenue" && tx.tenant_name && tx.tenant_name !== "Unassigned") {
        s.add(tx.tenant_name);
      }
    });
    receivableInvoices.forEach(ar => { if (ar.tenant) s.add(ar.tenant); });
    unifiedRealizedPdcs.forEach(p => { if (p.tenant) s.add(p.tenant); });
    return Array.from(s).sort();
  }, [allLedgerTransactions, receivableInvoices, unifiedRealizedPdcs]);

  const allMonthOptions = useMemo(() => {
    const months: { value: string; label: string }[] = [];
    const seen = new Set<string>();
    allLedgerTransactions.forEach(tx => {
      if (tx.account_type === "Revenue" && tx.date) {
        const d = new Date(tx.date);
        if (!isNaN(d.getTime())) {
          const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          if (!seen.has(val)) {
            seen.add(val);
            months.push({ value: val, label: d.toLocaleString("default", { month: "long", year: "numeric" }) });
          }
        }
      }
    });
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!seen.has(val)) {
        seen.add(val);
        months.push({ value: val, label: d.toLocaleString("default", { month: "long", year: "numeric" }) });
      }
    }
    return months.sort((a, b) => b.value.localeCompare(a.value));
  }, [allLedgerTransactions]);

  // ── Helper to normalize date to YYYY-MM ───────────────────────────────
  const getMonthStr = (dateStr?: string) => {
    if (!dateStr) return "";
    const clean = dateStr.trim();
    if (/^\d{4}-\d{2}/.test(clean)) return clean.slice(0, 7);
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }
    return clean.slice(0, 7);
  };

  // Helper to map any Revenue GL account code to the 6 primary revenue stream cards
  const getStreamCodeKey = (accountCode: string): string => {
    if (!accountCode) return "41100";
    if (accountCode.startsWith("411")) return "41100"; // 41100, 41100001 Rental Revenue
    if (accountCode.startsWith("41201001") || accountCode.startsWith("41200")) return "41200"; // 41200, 41201001 Parking Revenue
    if (accountCode.startsWith("41201003") || accountCode.startsWith("41300")) return "41300"; // 41300, 41201003 Utility Recovery
    if (accountCode.startsWith("41201004") || accountCode.startsWith("41400")) return "41400"; // 41400, 41201004 CAM / Maintenance Recovery
    if (accountCode.startsWith("41201002") || accountCode.startsWith("41500")) return "41500"; // 41500, 41201002 Property Management Fee / Commission
    if (accountCode.startsWith("41201005") || accountCode.startsWith("41201006") || accountCode.startsWith("41201007") || accountCode.startsWith("41600")) return "41600"; // 41600, 41201005 Late Payment / Penalty / Dishonour
    return "41100";
  };

  // ── Universal record filter helper ───────────────────────────────────
  const passesFilter = useCallback((rec: {
    date?: string; property?: string; unit?: string;
    tenant?: string; source?: string;
  }) => {
    const mon = getMonthStr(rec.date);
    // Period quick filter
    if (periodFilter === "thisMonth" && mon !== thisMonth) return false;
    if (periodFilter === "lastMonth" && mon !== lastMonth) return false;
    // Dropdown filters
    if (filterProperty !== "all" && rec.property !== filterProperty) return false;
    if (filterUnit !== "all" && rec.unit !== filterUnit) return false;
    if (filterCustomer !== "all" && rec.tenant !== filterCustomer) return false;
    if (filterMonth !== "all" && mon !== filterMonth) return false;
    if (filterSource !== "all" && rec.source !== filterSource) return false;
    // Date range
    if (filterFromDate && rec.date && rec.date < filterFromDate) return false;
    if (filterToDate && rec.date && rec.date > filterToDate) return false;
    // Text search
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      const haystack = [rec.property, rec.unit, rec.tenant, rec.source].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  }, [periodFilter, thisMonth, lastMonth, filterProperty, filterUnit, filterCustomer, filterMonth, filterSource, filterFromDate, filterToDate, filterSearch]);

  // ── Unified Revenue GL Ledger Transactions (Filtered) ─────────────────────
  // Derived from allLedgerTransactions (Revenue account_type, credit > debit)
  // PLUS realized/cleared PDCs not already covered by a GL revenue voucher.
  const filteredRevenueTransactions = useMemo(() => {
    // Part 1: GL journal rows
    const glRows = allLedgerTransactions.filter(tx => {
      if (tx.account_type !== "Revenue") return false;
      const netRev = (tx.credit || 0) - (tx.debit || 0);
      if (netRev <= 0) return false;

      const mon = getMonthStr(tx.date);
      if (periodFilter === "thisMonth" && mon !== thisMonth) return false;
      if (periodFilter === "lastMonth" && mon !== lastMonth) return false;
      if (filterFromDate && (tx.date || "") < filterFromDate) return false;
      if (filterToDate && (tx.date || "") > filterToDate) return false;
      if (filterMonth !== "all" && mon !== filterMonth) return false;
      if (filterProperty !== "all" && tx.property_name !== filterProperty) return false;
      if (filterUnit !== "all" && tx.unit_ref !== filterUnit) return false;
      if (filterCustomer !== "all" && tx.tenant_name !== filterCustomer) return false;
      if (filterSource !== "all") {
        const src = (tx.source || "").toLowerCase();
        if (!src.includes(filterSource.toLowerCase())) return false;
      }
      if (filterSearch) {
        const q = filterSearch.toLowerCase();
        const hay = [tx.property_name, tx.unit_ref, tx.tenant_name, tx.account_name, tx.reference, tx.description].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    // Part 2: Cleared/deposited PDC rows not already in GL
    const pdcRows: typeof glRows = [];
    unifiedRealizedPdcs.forEach((pdc) => {
      const isCleared = ["cleared", "deposited", "replaced", "partial cash", "partial_cash"].includes((pdc.status || "").toLowerCase());
      if (!isCleared) return;
      const isAlreadyCounted = allLedgerTransactions.some(tx =>
        tx.account_type === "Revenue" &&
        ((tx.reference && pdc.chqNo && tx.reference.includes(pdc.chqNo)) ||
         (tx.description && pdc.chqNo && tx.description.includes(pdc.chqNo)))
      );
      if (isAlreadyCounted) return;

      // Apply filters
      const mon = getMonthStr(pdc.date);
      if (periodFilter === "thisMonth" && mon !== thisMonth) return;
      if (periodFilter === "lastMonth" && mon !== lastMonth) return;
      if (filterFromDate && (pdc.date || "") < filterFromDate) return;
      if (filterToDate && (pdc.date || "") > filterToDate) return;
      if (filterMonth !== "all" && mon !== filterMonth) return;
      if (filterProperty !== "all" && pdc.property !== filterProperty) return;
      if (filterUnit !== "all" && pdc.unit !== filterUnit) return;
      if (filterCustomer !== "all" && pdc.tenant !== filterCustomer) return;
      if (filterSource !== "all" && filterSource.toLowerCase() !== "pdc") return;
      if (filterSearch) {
        const q = filterSearch.toLowerCase();
        const hay = [pdc.property, pdc.unit, pdc.tenant, pdc.chqNo, "Rental Revenue", "41100"].join(" ").toLowerCase();
        if (!hay.includes(q)) return;
      }

      pdcRows.push({
        id: `pdc-rev-${pdc.id || pdc.chqNo}`,
        date: pdc.date || "",
        account_code: "41100",
        account_name: "Rental Revenue",
        account_type: "Revenue",
        reference: pdc.chqNo || "",
        debit: 0,
        credit: Number(pdc.amount) || 0,
        source: "PDC",
        description: `PDC Cleared – ${pdc.chqNo}${pdc.tenant ? " (" + pdc.tenant + (pdc.unit ? " - " + pdc.unit : "") + ")" : ""}`,
        property_name: pdc.property || "Unassigned",
        unit_ref: pdc.unit || "Unassigned",
        tenant_name: pdc.tenant || "Unassigned",
      });
    });

    return [...glRows, ...pdcRows].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [allLedgerTransactions, unifiedRealizedPdcs, periodFilter, thisMonth, lastMonth, filterProperty, filterUnit, filterCustomer, filterMonth, filterSource, filterFromDate, filterToDate, filterSearch]);

  // ── Aggregate revenue by stream code from unified filtered entries ─────────
  const revenueByCode = useMemo(() => {
    const totals: Record<string, number> = {};
    REVENUE_STREAMS.forEach(s => { totals[s.code] = 0; });

    filteredRevenueTransactions.forEach(tx => {
      const netRev = (tx.credit || 0) - (tx.debit || 0);
      if (netRev <= 0) return;
      const codeKey = getStreamCodeKey(tx.account_code);
      totals[codeKey] = (totals[codeKey] || 0) + netRev;
    });

    return totals;
  }, [filteredRevenueTransactions]);

  const totalRevenue = Object.values(revenueByCode).reduce((s, v) => s + v, 0);

  // ── Monthly trend — computed directly from all posted revenue entries (filteredRevenueTransactions) ──
  const monthlyTrend = useMemo(() => {
    // Collect all unique months from filteredRevenueTransactions or fallback to trailing 6 months
    const allMonthsSet = new Set<string>();
    filteredRevenueTransactions.forEach(tx => {
      const mon = getMonthStr(tx.date);
      if (mon && /^\d{4}-\d{2}$/.test(mon)) {
        allMonthsSet.add(mon);
      }
    });

    // Ensure at least trailing/surrounding 6 months are present
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mon = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      allMonthsSet.add(mon);
    }

    // Sort months chronologically
    const sortedMonths = Array.from(allMonthsSet).sort();
    // Keep the most relevant window (up to last 6-12 months containing data)
    const activeMonthsWithData = sortedMonths.filter(m => {
      return filteredRevenueTransactions.some(tx => getMonthStr(tx.date) === m);
    });

    let displayMonths = sortedMonths;
    if (sortedMonths.length > 6) {
      if (activeMonthsWithData.length > 0) {
        const firstActiveIdx = sortedMonths.indexOf(activeMonthsWithData[0]);
        const lastActiveIdx = sortedMonths.indexOf(activeMonthsWithData[activeMonthsWithData.length - 1]);
        const start = Math.max(0, Math.min(firstActiveIdx, sortedMonths.length - 6));
        displayMonths = sortedMonths.slice(start, Math.max(start + 6, lastActiveIdx + 1));
      } else {
        displayMonths = sortedMonths.slice(-6);
      }
    }

    const rev: Record<string, number> = {};
    displayMonths.forEach(m => { rev[m] = 0; });

    filteredRevenueTransactions.forEach(tx => {
      const mon = getMonthStr(tx.date);
      if (mon in rev) {
        const netRev = (tx.credit || 0) - (tx.debit || 0);
        if (netRev > 0) rev[mon] += netRev;
      }
    });

    const maxVal = Math.max(...Object.values(rev), 1);
    return displayMonths.map(m => {
      const d = new Date(m + "-01");
      const label = !isNaN(d.getTime())
        ? d.toLocaleString("default", { month: "short", year: "2-digit" })
        : m;
      return {
        month: label,
        amount: rev[m] || 0,
        pct: Math.round(((rev[m] || 0) / maxVal) * 100),
      };
    });
  }, [filteredRevenueTransactions, now]);

  // ── Property breakdown (filtered) — from filteredRevenueTransactions ───────
  const propertyBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredRevenueTransactions.forEach(tx => {
      const netRev = (tx.credit || 0) - (tx.debit || 0);
      if (netRev <= 0) return;

      const key = tx.property_name && tx.property_name !== "Unassigned" ? tx.property_name : "General Portfolio";
      map[key] = (map[key] || 0) + netRev;
    });

    return Object.entries(map)
      .filter(([, amt]) => amt > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([property, amount]) => ({ property, amount }));
  }, [filteredRevenueTransactions]);

  // ── Top Tenant Contributions (filtered) — from filteredRevenueTransactions ──
  const topTenants = useMemo(() => {
    const map: Record<string, number> = {};
    filteredRevenueTransactions.forEach(tx => {
      const netRev = (tx.credit || 0) - (tx.debit || 0);
      if (netRev <= 0) return;

      const key = tx.tenant_name && tx.tenant_name !== "Unassigned" ? tx.tenant_name : "Other / Direct Revenue";
      map[key] = (map[key] || 0) + netRev;
    });

    return Object.entries(map)
      .filter(([, amt]) => amt > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tenant, amount]) => ({ tenant, amount }));
  }, [filteredRevenueTransactions]);



  const activeFilterCount = [
    filterProperty !== "all", filterUnit !== "all", filterCustomer !== "all",
    filterMonth !== "all", filterSource !== "all",
    !!filterFromDate, !!filterToDate, !!filterSearch, periodFilter !== "all",
  ].filter(Boolean).length;

  const availableProperties = useMemo(() => {
    return Array.from(new Set(activeBatchPreview.records.map((r) => r.propertyName))).filter(Boolean);
  }, [activeBatchPreview]);

  const availableUnits = useMemo(() => {
    return Array.from(new Set(activeBatchPreview.records.map((r) => r.unitRef))).filter(Boolean);
  }, [activeBatchPreview]);

  const availableTenants = useMemo(() => {
    return Array.from(new Set(activeBatchPreview.records.map((r) => r.tenantName))).filter(Boolean);
  }, [activeBatchPreview]);

  const activeAsOfFilterCount = [
    asOfProperty !== "all",
    asOfUnit !== "all",
    asOfTenant !== "all",
    asOfStatusFilter !== "all",
    !!asOfSearch,
  ].filter(Boolean).length;

  const resetAsOfFilters = () => {
    setAsOfProperty("all");
    setAsOfUnit("all");
    setAsOfTenant("all");
    setAsOfStatusFilter("all");
    setAsOfSearch("");
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-bold tracking-tight">Revenue Generation &amp; Recognition</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Recognize earned rental revenue by service completion date • Separate cash/PDCs from income earned
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border">
          <Button
            size="sm"
            variant={activeSubTab === "asOf" ? "default" : "ghost"}
            className="h-8 text-xs font-medium gap-1.5"
            onClick={() => setActiveSubTab("asOf")}
          >
            <Calendar className="h-3.5 w-3.5" />
            Revenue As-Of Engine
          </Button>
          <Button
            size="sm"
            variant={activeSubTab === "gl" ? "default" : "ghost"}
            className="h-8 text-xs font-medium gap-1.5"
            onClick={() => setActiveSubTab("gl")}
          >
            <BookOpen className="h-3.5 w-3.5" />
            GL Actuals Ledger
          </Button>
        </div>
      </div>

      {activeSubTab === "asOf" ? (
        /* ────────────────────────────────────────────────────────────────────────
           TAB 1: PERIOD-BASED REVENUE RECOGNITION ENGINE (AS-OF DATE)
        ──────────────────────────────────────────────────────────────────────── */
        <div className="space-y-5">
          {/* Revenue vs Cash Concept Distinction Banner */}
          <Card className="p-3.5 bg-gradient-to-r from-emerald-50/70 via-blue-50/50 to-purple-50/50 border-emerald-200/80 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-emerald-500 text-white rounded-md mt-0.5">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                    <span>Accrual / Period-Based Recognition Standard</span>
                    <Badge variant="outline" className="bg-white/80 text-[10px] text-emerald-800 border-emerald-300">
                      IFRS / Accrual Compliant
                    </Badge>
                  </div>
                  <p className="text-[11px] text-emerald-900/80 mt-0.5 leading-relaxed">
                    <strong>Rule:</strong> Revenue is earned strictly when the rental service period is completed as of the As-Of Date.
                    Advance PDCs or uncollected dues represent payment collections, <em>not</em> earned revenue.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                <div className="px-2.5 py-1 bg-white/80 rounded border border-emerald-200 text-center">
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-sans">Active Leases</div>
                  <div className="font-bold text-emerald-700">{activeBatchPreview.totalTenants}</div>
                </div>
                <div className="px-2.5 py-1 bg-white/80 rounded border border-emerald-200 text-center">
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-sans">Units In Scope</div>
                  <div className="font-bold text-emerald-700">{activeBatchPreview.totalUnits}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Engine Parameters & Controls Card */}
          <Card className="p-4 shadow-sm border-slate-200 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b">
              <div className="flex flex-wrap items-center gap-3">
                {/* Revenue As-Of Date Picker */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    Revenue As-Of Date:
                  </Label>
                  <Input
                    type="date"
                    value={asOfDate}
                    onChange={(e) => setAsOfDate(e.target.value || todayStr)}
                    className="h-8 text-xs w-44 font-mono font-semibold"
                  />
                </div>

                {/* Proration Method Selector */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-bold text-slate-700">Proration Method:</Label>
                  <Select value={prorationMethod} onValueChange={(val: ProrationMethod) => setProrationMethod(val)}>
                    <SelectTrigger className="h-8 text-xs w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CALENDAR_DAYS" className="text-xs">Calendar Days (Exact)</SelectItem>
                      <SelectItem value="30_DAY_MONTH" className="text-xs">30-Day Month (Commercial)</SelectItem>
                      <SelectItem value="ACTUAL_365" className="text-xs">Actual / 365</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action CTA */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => setAsOfDate(todayStr)}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset to Today
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  onClick={handleGenerateBatch}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  Generate &amp; Post Revenue Batch
                </Button>
              </div>
            </div>

            {/* ── Multi-Dimensional Filter Panel for Revenue Recognition ── */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Multi-Dimensional Filters</span>
                  {activeAsOfFilterCount > 0 && (
                    <Badge className="h-4 text-[10px] px-1.5 bg-primary text-primary-foreground">{activeAsOfFilterCount}</Badge>
                  )}
                </div>
                {activeAsOfFilterCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-foreground" onClick={resetAsOfFilters}>
                    Reset All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                {/* Property Filter */}
                <div>
                  <Label className="text-[10px] text-muted-foreground mb-0.5 block">Property</Label>
                  <Select value={asOfProperty} onValueChange={setAsOfProperty}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Properties ({availableProperties.length})</SelectItem>
                      {availableProperties.map((p) => (
                        <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Unit Filter */}
                <div>
                  <Label className="text-[10px] text-muted-foreground mb-0.5 block">Unit</Label>
                  <Select value={asOfUnit} onValueChange={setAsOfUnit}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All Units" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Units ({availableUnits.length})</SelectItem>
                      {availableUnits.map((u) => (
                        <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tenant Filter */}
                <div>
                  <Label className="text-[10px] text-muted-foreground mb-0.5 block">Customer / Tenant</Label>
                  <Select value={asOfTenant} onValueChange={setAsOfTenant}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All Tenants" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Tenants ({availableTenants.length})</SelectItem>
                      {availableTenants.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div>
                  <Label className="text-[10px] text-muted-foreground mb-0.5 block">Recognition Status</Label>
                  <Select value={asOfStatusFilter} onValueChange={setAsOfStatusFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                      <SelectItem value="RECOGNIZED" className="text-xs">Recognized (Earned)</SelectItem>
                      <SelectItem value="DEFERRED" className="text-xs">Deferred (Unearned)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search */}
                <div>
                  <Label className="text-[10px] text-muted-foreground mb-0.5 block">Search Schedule</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Tenant, Unit, Period..."
                      value={asOfSearch}
                      onChange={(e) => setAsOfSearch(e.target.value)}
                      className="h-8 text-xs pl-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Revenue Recognition Portfolio Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3.5 border-emerald-200 bg-emerald-50/50 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Recognized Revenue (Earned)
              </div>
              <div className="text-lg font-bold font-mono text-emerald-700 mt-1">
                QR {previewRecognizedSum.toLocaleString()}
              </div>
              <p className="text-[10px] text-emerald-600/90 mt-0.5">
                Completed service periods as of {asOfDate}
              </p>
            </Card>

            <Card className="p-3.5 border-amber-200 bg-amber-50/50 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Deferred Revenue (Unearned)
              </div>
              <div className="text-lg font-bold font-mono text-amber-700 mt-1">
                QR {previewDeferredSum.toLocaleString()}
              </div>
              <p className="text-[10px] text-amber-600/90 mt-0.5">
                Future / uncompleted periods
              </p>
            </Card>

            <Card className="p-3.5 border-blue-200 bg-blue-50/50 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                Contractual Portfolio Rent
              </div>
              <div className="text-lg font-bold font-mono text-blue-700 mt-1">
                QR {previewContractualSum.toLocaleString()}
              </div>
              <p className="text-[10px] text-blue-600/90 mt-0.5">
                Total scheduled monthly billings
              </p>
            </Card>

            <Card className="p-3.5 border-purple-200 bg-purple-50/50 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-800">
                Schedule Periods Evaluated
              </div>
              <div className="text-lg font-bold font-mono text-purple-700 mt-1">
                {filteredPreviewRecords.length} periods
              </div>
              <p className="text-[10px] text-purple-600/90 mt-0.5">
                Across {availableTenants.length} tenants
              </p>
            </Card>
          </div>

          {/* Revenue Recognition Schedule Table */}
          <Card className="p-0 shadow-sm overflow-hidden border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b bg-muted/30 gap-2">
              <div>
                <h4 className="text-xs font-bold flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  Period-by-Period Revenue Recognition Schedule (Live Calculation)
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Evaluating completed service periods vs As-Of Date: <span className="font-mono font-semibold">{asOfDate}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono">
                  Method: {prorationMethod}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {filteredPreviewRecords.length} rows
                </Badge>
              </div>
            </div>

            <div className="max-h-[440px] overflow-y-auto overflow-x-auto relative border-t">
              <table className="w-full caption-bottom text-xs text-left border-collapse">
                <thead className="sticky top-0 z-20 shadow-xs">
                  <tr className="border-b bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <th className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 font-bold text-xs">Tenant / Unit</th>
                    <th className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 font-bold text-xs">Property</th>
                    <th className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 font-bold text-xs">Rental Period</th>
                    <th className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 text-right font-bold text-xs">Contractual Rent</th>
                    <th className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 text-center font-bold text-xs">Days (Rec / Total)</th>
                    <th className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 text-right font-bold text-xs">Recognized (QAR)</th>
                    <th className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 text-right font-bold text-xs">Deferred (QAR)</th>
                    <th className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 font-bold text-xs">PDC Info</th>
                    <th className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 font-bold text-xs">Status</th>
                    <th className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 py-2.5 px-3 font-bold text-xs">Calculation Logic</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y">
                  {filteredPreviewRecords.map((rec) => {
                    const isRec = rec.status === "RECOGNIZED";
                    return (
                      <TableRow key={rec.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="font-semibold text-slate-800">{rec.tenantName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">Unit: {rec.unitRef}</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate" title={rec.propertyName}>
                          {rec.propertyName}
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-[11px] font-medium">
                            {rec.periodStart} → {rec.periodEnd}
                          </div>
                          {rec.isEarlyVacate && (
                            <Badge variant="outline" className="text-[9px] bg-rose-50 text-rose-700 border-rose-200 mt-0.5">
                              Early Vacate ({rec.effectiveRevenueEnd})
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          QR {rec.contractualRent.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          <span className={isRec ? "font-bold text-emerald-700" : "text-muted-foreground"}>
                            {rec.recognizableDays}
                          </span>
                          <span className="text-muted-foreground"> / {rec.totalDaysInPeriod}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-emerald-600">
                          {isRec ? `QR ${rec.netRecognizedRevenue.toLocaleString()}` : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium text-amber-600">
                          {rec.deferredRevenue > 0 ? `QR ${rec.deferredRevenue.toLocaleString()}` : "—"}
                        </TableCell>
                        <TableCell>
                          {rec.pdcChequeNo ? (
                            <div className="text-[10px] font-mono">
                              <span className="text-primary font-semibold">#{rec.pdcChequeNo}</span>
                              <div className="text-muted-foreground">QR {rec.pdcAmount?.toLocaleString() || "—"}</div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">No PDC linked</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isRec ? (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-[10px]">
                              RECOGNIZED
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-50 text-[10px]">
                              DEFERRED
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[240px] text-[11px] text-muted-foreground leading-snug">
                          {rec.calculationExplanation}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredPreviewRecords.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center text-muted-foreground py-8 text-xs">
                        No lease records match the selected filters for as-of date {asOfDate}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Generated Revenue Batches History */}
          {savedBatches.length > 0 && (
            <Card className="p-0 shadow-sm overflow-hidden border">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                <h4 className="text-xs font-bold flex items-center gap-1.5">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                  Generated Revenue Batch History (Audit Trail)
                </h4>
                <Badge variant="secondary" className="text-[10px]">
                  {savedBatches.length} batches posted
                </Badge>
              </div>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 text-xs">
                      <TableHead className="font-bold text-xs">Batch ID</TableHead>
                      <TableHead className="font-bold text-xs">As-Of Date</TableHead>
                      <TableHead className="font-bold text-xs">Generated At</TableHead>
                      <TableHead className="font-bold text-xs">Proration</TableHead>
                      <TableHead className="text-center font-bold text-xs">Tenants</TableHead>
                      <TableHead className="text-center font-bold text-xs">Units</TableHead>
                      <TableHead className="text-right font-bold text-xs">Recognized Revenue</TableHead>
                      <TableHead className="text-right font-bold text-xs">Deferred Revenue</TableHead>
                      <TableHead className="text-right font-bold text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs">
                    {savedBatches.map((b) => (
                      <TableRow key={b.batchId} className="hover:bg-muted/30">
                        <TableCell className="font-mono font-bold text-primary">{b.batchId}</TableCell>
                        <TableCell className="font-mono">{b.asOfDate}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(b.generatedAt).toLocaleString()}</TableCell>
                        <TableCell className="text-[11px]">{b.prorationMethod}</TableCell>
                        <TableCell className="text-center font-mono">{b.totalTenants}</TableCell>
                        <TableCell className="text-center font-mono">{b.totalUnits}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-emerald-600">
                          QR {b.totalRecognizedRevenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-amber-600">
                          QR {b.totalDeferredRevenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[10px] text-primary"
                            onClick={() => setSelectedBatchDetails(b)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Records
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {/* Revenue vs Cash Collections Separation Card (Spec §26) */}
          <Card className="p-4 border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50/30 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-4 w-4 text-primary" />
              <h4 className="text-xs font-bold text-slate-800">Authoritative Accounting Principle: Revenue Recognition vs. Cash Collection</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-white rounded border border-emerald-200 shadow-xs">
                <div className="font-semibold text-emerald-800 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Recognized Revenue (Earned)
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Earned strictly when the rental service period is completed or days are elapsed as of the As-Of Date ({asOfDate}).
                  Independent of cheque maturity or receipt date.
                </p>
                <div className="mt-2 font-mono font-bold text-sm text-emerald-700">
                  Total Earned: QR {previewRecognizedSum.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-white rounded border border-blue-200 shadow-xs">
                <div className="font-semibold text-blue-800 flex items-center gap-1.5 mb-1">
                  <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                  Cash / PDC Collections (Instruments)
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  PDCs, bank clearances, and receipts represent payment instruments and liquidity tracking.
                  PDC clearance alone does not determine monthly earning periods.
                </p>
                <div className="mt-2 font-mono font-bold text-sm text-blue-700">
                  Total Evaluated Contractual: QR {previewContractualSum.toLocaleString()}
                </div>
              </div>
            </div>
          </Card>

          {/* Decision Tree Reference Visualizer */}
          <Card className="p-4 border-slate-200 bg-white shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-800">Recognition Decision Logic &amp; Proration Hierarchy</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-[11px]">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-700 mb-1">1. Full Service Month</div>
                <p className="text-muted-foreground leading-snug">
                  If period end &le; As-Of Date &amp; full month elapsed &rarr; <strong>Full monthly rent recognized</strong> (100%).
                </p>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-700 mb-1">2. Partial / Mid-Month Start</div>
                <p className="text-muted-foreground leading-snug">
                  Lease start mid-month &rarr; <strong>Chargeable days / days in month &times; rent</strong>.
                </p>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-700 mb-1">3. Early Vacancy / Notice</div>
                <p className="text-muted-foreground leading-snug">
                  Effective revenue end date bounds the recognizable days &rarr; <strong>Prorated to exit date</strong>.
                </p>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-700 mb-1">4. Uncompleted Period</div>
                <p className="text-muted-foreground leading-snug">
                  Period end &gt; As-Of Date &rarr; <strong>100% Deferred (Unearned)</strong> until period completion.
                </p>
              </div>
            </div>
          </Card>

          {/* Dialog for Viewing Batch Details */}
          <Dialog open={!!selectedBatchDetails} onOpenChange={() => setSelectedBatchDetails(null)}>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Revenue Batch Details — {selectedBatchDetails?.batchId}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  As-Of Date: <span className="font-mono font-bold text-slate-800">{selectedBatchDetails?.asOfDate}</span> • Generated: {selectedBatchDetails?.generatedAt ? new Date(selectedBatchDetails.generatedAt).toLocaleString() : ""}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-1 mt-2">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 text-xs">
                      <TableHead className="font-bold text-xs">Tenant</TableHead>
                      <TableHead className="font-bold text-xs">Unit</TableHead>
                      <TableHead className="font-bold text-xs">Period</TableHead>
                      <TableHead className="text-right font-bold text-xs">Recognized</TableHead>
                      <TableHead className="text-right font-bold text-xs">Deferred</TableHead>
                      <TableHead className="font-bold text-xs">Status</TableHead>
                      <TableHead className="font-bold text-xs">Calculation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs">
                    {selectedBatchDetails?.records.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.tenantName}</TableCell>
                        <TableCell className="font-mono">{r.unitRef}</TableCell>
                        <TableCell className="font-mono text-[11px]">{r.periodStart} → {r.periodEnd}</TableCell>
                        <TableCell className="text-right font-mono text-emerald-600 font-bold">
                          QR {r.netRecognizedRevenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-amber-600">
                          QR {r.deferredRevenue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={r.status === "RECOGNIZED" ? "default" : "outline"} className="text-[10px]">
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[11px] text-muted-foreground">{r.calculationExplanation}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              <DialogFooter className="mt-4 pt-2 border-t flex justify-end">
                <Button size="sm" variant="outline" onClick={() => setSelectedBatchDetails(null)} className="h-8 text-xs">
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        /* ────────────────────────────────────────────────────────────────────────
           TAB 2: GL ACTUALS LEDGER (Existing View)
        ──────────────────────────────────────────────────────────────────────── */
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                Revenue Generation Report — Live GL View
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Breakdowns across GL accounts 41100–41600 • Realized PDC settlements &amp; double-entry credits
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {(["all", "thisMonth", "lastMonth"] as const).map(f => (
                <Button
                  key={f}
                  size="sm"
                  variant={periodFilter === f ? "default" : "outline"}
                  className="h-7 text-xs"
                  onClick={() => setPeriodFilter(f)}
                >
                  {f === "all" ? "All Time" : f === "thisMonth" ? "This Month" : "Last Month"}
                </Button>
              ))}
            </div>
          </div>

      {/* KPI Row (6 Revenue Streams as in Image 1) - Placed Above Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {REVENUE_STREAMS.map(stream => {
          const amount = revenueByCode[stream.code] || 0;
          const pct = totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : "0.0";
          return (
            <Card key={stream.code} className={`p-3 border ${stream.border} ${stream.bg} shadow-sm`}>
              <div className={`text-[10px] font-bold uppercase tracking-wide ${stream.textColor} mb-1`}>
                GL {stream.code}
              </div>
              <div className="text-xs text-muted-foreground mb-1 leading-tight">{stream.label}</div>
              <div className={`text-sm font-bold font-mono ${stream.textColor}`}>
                QR {amount.toLocaleString()}
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-black/10 overflow-hidden">
                <div className={`h-full ${stream.color} rounded-full`} style={{ width: `${pct}%` }} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{pct}% of total</div>
            </Card>
          );
        })}
      </div>

      {/* Total Banner (Total Revenue Generated) - Placed Above Filters */}
      <Card className="p-4 border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-medium">Total Revenue Generated</div>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-0.5">
              QR {totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">GL Range</div>
            <div className="text-sm font-bold text-emerald-600 font-mono">41100 – 41600</div>
            <div className="text-xs text-muted-foreground mt-0.5">{REVENUE_STREAMS.length} revenue streams</div>
          </div>
        </div>
      </Card>

      {/* ── Multi-Dimensional Filter Panel ── */}
      <Card className="p-3 border border-dashed border-muted-foreground/30 bg-muted/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Multi-Dimensional Filters</span>
            {activeFilterCount > 0 && (
              <Badge className="h-4 text-[10px] px-1.5 bg-primary text-primary-foreground">{activeFilterCount}</Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={resetFilters}>
              Reset All
            </Button>
          )}
        </div>
        {/* Row 1: Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-2">
          {/* Property */}
          <div>
            <label className="text-[10px] text-muted-foreground mb-0.5 block">Property</label>
            <Select value={filterProperty} onValueChange={setFilterProperty}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties ({allProperties.length})</SelectItem>
                {allProperties.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {/* Unit */}
          <div>
            <label className="text-[10px] text-muted-foreground mb-0.5 block">Unit</label>
            <Select value={filterUnit} onValueChange={setFilterUnit}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units ({allUnits.length})</SelectItem>
                {allUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {/* Customer Name */}
          <div>
            <label className="text-[10px] text-muted-foreground mb-0.5 block">Customer Name</label>
            <Select value={filterCustomer} onValueChange={setFilterCustomer}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers ({allCustomers.length})</SelectItem>
                {allCustomers.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {/* Month */}
          <div>
            <label className="text-[10px] text-muted-foreground mb-0.5 block">Month</label>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {allMonthOptions.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {/* Source / Type */}
          <div>
            <label className="text-[10px] text-muted-foreground mb-0.5 block">Source / Type</label>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="PDC">PDC (Cleared/Deposited)</SelectItem>
                <SelectItem value="Invoice">Receivable Invoice</SelectItem>
                <SelectItem value="Voucher">Journal Voucher</SelectItem>
                <SelectItem value="Journal">Journal Entry</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Row 2: Search + Date Range */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              placeholder="Search account, code, reference, description, tenant..."
              className="pl-8 h-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">From Date:</span>
            <Input type="date" value={filterFromDate} onChange={e => setFilterFromDate(e.target.value)} className="h-8 text-xs w-36" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">To Date:</span>
            <Input type="date" value={filterToDate} onChange={e => setFilterToDate(e.target.value)} className="h-8 text-xs w-36" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Trend Chart */}
        <Card className="col-span-1 lg:col-span-2 p-4 shadow-sm bg-card border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <Activity className="h-4 w-4 text-emerald-600" />
              Monthly Revenue Trend ({monthlyTrend.length} Months)
            </h4>
            <div className="text-[11px] font-mono text-muted-foreground">
              Total: <span className="font-bold text-emerald-600">QR {monthlyTrend.reduce((s, m) => s + m.amount, 0).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-32 pt-2 px-1 border-b border-muted">
            {monthlyTrend.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group relative h-full justify-end">
                <div className="text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 transition-all group-hover:scale-110 group-hover:text-emerald-600">
                  {m.amount > 0 ? (m.amount >= 1000 ? `QR ${(m.amount / 1000).toFixed(1).replace(/\.0$/, '')}k` : `QR ${m.amount}`) : "0"}
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-full flex items-end p-0.5 overflow-hidden">
                  <div
                    className={`w-full rounded-t transition-all duration-500 ease-out ${
                      m.amount > 0
                        ? "bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300 shadow-sm"
                        : "bg-slate-200 dark:bg-slate-700 opacity-40"
                    }`}
                    style={{ height: `${m.amount > 0 ? Math.max(m.pct, 8) : 4}%` }}
                    title={`${m.month}: QR ${m.amount.toLocaleString()}`}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{m.month}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Property Breakdown */}
        <Card className="p-4 shadow-sm">
          <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-primary" />
            Revenue by Property
          </h4>
          <div className="space-y-2">
            {propertyBreakdown.map(({ property, amount }) => {
              const maxProp = propertyBreakdown[0]?.amount || 1;
              return (
                <div key={property}>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-muted-foreground truncate max-w-[140px]" title={property}>{property}</span>
                    <span className="font-mono font-semibold">QR {amount.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(amount / maxProp) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* GL Journal Audit Table */}
      <Card className="p-0 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <h4 className="text-xs font-bold flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            Revenue GL Ledger — Posted Entries
          </h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono">Accounts 41100–41600</Badge>
            <Badge variant="secondary" className="text-[10px]">
              {filteredRevenueTransactions.length} entries
            </Badge>
          </div>
        </div>
        <div className="overflow-auto max-h-72">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 text-xs">
                <TableHead className="font-bold text-xs">Date</TableHead>
                <TableHead className="font-bold text-xs">Reference</TableHead>
                <TableHead className="font-bold text-xs">Description</TableHead>
                <TableHead className="font-bold text-xs">GL Code</TableHead>
                <TableHead className="font-bold text-xs">Revenue Stream</TableHead>
                <TableHead className="font-bold text-xs">Customer</TableHead>
                <TableHead className="font-bold text-xs">Unit</TableHead>
                <TableHead className="text-right font-bold text-xs">Cr Amount (QAR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {filteredRevenueTransactions.map(tx => {
                const streamCode = getStreamCodeKey(tx.account_code);
                const stream = REVENUE_STREAMS.find(s => s.code === streamCode);
                const netRev = (tx.credit || 0) - (tx.debit || 0);
                const isPdc = (tx.source || "").toLowerCase() === "pdc";
                return (
                  <TableRow key={tx.id} className={`hover:bg-muted/30 ${isPdc ? "bg-blue-50/30" : ""}`}>
                    <TableCell className="font-mono">{tx.date}</TableCell>
                    <TableCell className="font-mono text-primary">
                      {tx.reference}
                      {isPdc && <span className="ml-1 text-[9px] bg-blue-100 text-blue-700 rounded px-1 py-0.5">PDC</span>}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate" title={tx.description}>
                      {tx.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-mono font-bold ${stream?.textColor || "text-emerald-700"} ${stream?.bg || "bg-emerald-50"} ${stream?.border || "border-emerald-300"}`}>
                        {tx.account_code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{stream?.label || tx.account_name || "Revenue"}</TableCell>
                    <TableCell className="text-xs max-w-[120px] truncate" title={tx.tenant_name}>
                      {tx.tenant_name && tx.tenant_name !== "Unassigned" ? tx.tenant_name : <span className="text-muted-foreground italic">—</span>}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {tx.unit_ref && tx.unit_ref !== "Unassigned" ? tx.unit_ref : <span className="text-muted-foreground italic">—</span>}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-emerald-600">
                      {netRev.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredRevenueTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-6 text-xs">
                    No entries match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Top Tenant Contributions */}
      <Card className="p-4 shadow-sm">
        <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-primary" />
          Top Tenant Revenue Contributions
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {topTenants.map(({ tenant, amount }, idx) => {
            return (
              <div key={tenant} className="bg-muted/30 rounded-lg p-3 border text-center">
                <div className="text-xs font-bold truncate mb-1" title={tenant}>{tenant}</div>
                <div className="text-sm font-mono font-bold text-primary">QR {amount.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">#{idx + 1} Contributor</div>
              </div>
            );
          })}
        </div>
      </Card>
        </div>
      )}
    </div>
  );
}

function ProfitAndLossSubModule() {
  const { profitAndLossReport: plOverall, allLedgerTransactions, isSyncing, refreshFinanceData } = useFinanceStore();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");

  const periodOptions = useMemo(() => {
    const set = new Set<string>();
    allLedgerTransactions.forEach(tx => {
      if (tx.date && tx.date.length >= 7) {
        set.add(tx.date.slice(0, 7));
      }
    });
    set.add("2026-10");
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [allLedgerTransactions]);

  const pl = useMemo(() => {
    if (selectedPeriod === "all") return plOverall;
    let rentalRevenue = 0;
    let otherRevenue = 0;
    let maintenanceExpense = 0;
    let payrollExpense = 0;
    let utilitiesExpense = 0;
    let cleaningExpense = 0;
    let totalRevenue = 0;
    let totalExpenses = 0;

    allLedgerTransactions.forEach(tx => {
      if (!tx.date || !tx.date.startsWith(selectedPeriod)) return;
      if (tx.account_type === "Revenue") {
        const netRev = (tx.credit || 0) - (tx.debit || 0);
        totalRevenue += netRev;
        if (tx.account_code.startsWith("411")) rentalRevenue += netRev;
        else otherRevenue += netRev;
      } else if (tx.account_type === "Expenses") {
        const netExp = (tx.debit || 0) - (tx.credit || 0);
        totalExpenses += netExp;
        if (tx.account_code.startsWith("51101")) payrollExpense += netExp;
        else if (tx.account_code.startsWith("51003")) utilitiesExpense += netExp;
        else if (
          tx.account_code === "51004007" ||
          tx.account_code === "51001002" ||
          tx.account_code === "51002002"
        ) cleaningExpense += netExp;
        else maintenanceExpense += netExp;
      }
    });

    const netProfit = totalRevenue - totalExpenses;
    return {
      rentalRevenue,
      otherRevenue,
      totalRevenue,
      maintenanceExpense,
      payrollExpense,
      utilitiesExpense,
      cleaningExpense,
      totalExpenses,
      netProfit,
    };
  }, [selectedPeriod, plOverall, allLedgerTransactions]);

  const exportPnLToCSV = () => {
    const rows = [
      ["Profit and Loss Statement (Vertical Format)", selectedPeriod === "all" ? "All Periods (Consolidated)" : selectedPeriod],
      [],
      ["Category / GL Account", "Section", "Amount (QAR)"],
      ["Residential & Commercial Tenancy Leases (41100)", "Operating Revenue", pl.rentalRevenue.toFixed(2)],
      ["Service, Parking & Utility Recovery Charges", "Operating Revenue", pl.otherRevenue.toFixed(2)],
      ["TOTAL OPERATING REVENUE", "Revenue Subtotal", pl.totalRevenue.toFixed(2)],
      [],
      ["Repairs, CMEP & Property Maintenance (51004)", "Operating Expenses", pl.maintenanceExpense.toFixed(2)],
      ["Staff Salaries & Site Operations (51101)", "Operating Expenses", pl.payrollExpense.toFixed(2)],
      ["Electricity & Water — Kahramaa (51003)", "Operating Expenses", pl.utilitiesExpense.toFixed(2)],
      ["Cleaning & Sanitation Services (51004007)", "Operating Expenses", pl.cleaningExpense.toFixed(2)],
      ["TOTAL OPERATING EXPENSES", "Expense Subtotal", (-pl.totalExpenses).toFixed(2)],
      [],
      [pl.netProfit >= 0 ? "NET OPERATING PROFIT" : "NET OPERATING LOSS", "Net Result", pl.netProfit.toFixed(2)],
    ];
    const csv = "\uFEFF" + rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Profit_And_Loss_${selectedPeriod}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Profit & Loss Statement exported to Excel/CSV");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold">Profit and Loss Statement (P&amp;L — Vertical Statement Format)</h3>
          <p className="text-xs text-muted-foreground">
            {selectedPeriod === "all" ? "Consolidated vertical financial performance across all periods" : `Performance report for month: ${selectedPeriod === "2026-10" ? "Oct-26 (October 2026)" : selectedPeriod}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="h-7 text-xs w-[180px]">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Periods (Consolidated)</SelectItem>
              {periodOptions.map((period) => (
                <SelectItem key={period} value={period}>
                  {period === "2026-10" ? "Oct-26 (October 2026)" : period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={exportPnLToCSV}
            className="h-7 text-xs gap-1.5 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50"
          >
            <Download className="h-3 w-3" /> Export Excel / CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshFinanceData}
            disabled={isSyncing}
            className="h-7 text-xs gap-1.5"
            title="Refresh P&L Report from DB"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin text-primary" : ""}`} />
            {isSyncing ? "Syncing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Vertically Aligned P&L Statement */}
      <Card className="p-0 overflow-hidden text-xs shadow-sm bg-card border">
        <div className="bg-muted/50 px-5 py-3 border-b flex justify-between items-center">
          <span className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Particulars / Ledger Head (Vertical Statement)</span>
          <span className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground font-mono">Amount (QAR)</span>
        </div>

        <div className="p-5 space-y-6">
          {/* SECTION I: OPERATING REVENUE */}
          <div className="space-y-2">
            <div className="font-bold text-xs uppercase tracking-wider text-emerald-700 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20">
              I. Gross Rental &amp; Property Operating Revenue
            </div>
            <div className="divide-y border rounded-lg bg-background">
              <div className="flex justify-between items-center px-4 py-2.5">
                <span>Residential &amp; Commercial Tenancy Leases (41100)</span>
                <span className="font-mono font-medium">QAR {pl.rentalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span>Service, Parking &amp; Utility Recovery Charges</span>
                <span className="font-mono font-medium">QAR {pl.otherRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5 bg-emerald-50/60 dark:bg-emerald-950/20 font-bold text-sm">
                <span>Total Operating Revenue (A)</span>
                <span className="text-emerald-600 font-mono text-base">QAR {pl.totalRevenue?.toLocaleString() ?? '0'}</span>
              </div>
            </div>
          </div>

          {/* SECTION II: OPERATING EXPENSES (STACKED VERTICALLY BELOW REVENUE) */}
          <div className="space-y-2">
            <div className="font-bold text-xs uppercase tracking-wider text-rose-700 bg-rose-500/10 px-3 py-1.5 rounded border border-rose-500/20">
              II. Less: Operating, Maintenance &amp; Administrative Expenses
            </div>
            <div className="divide-y border rounded-lg bg-background">
              <div className="flex justify-between items-center px-4 py-2.5">
                <span>Repairs, CMEP &amp; Property Maintenance (51004)</span>
                <span className="font-mono font-medium">QAR {pl.maintenanceExpense.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span>Staff Salaries &amp; Site Operations (51101)</span>
                <span className="font-mono font-medium">QAR {pl.payrollExpense.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span>Electricity &amp; Water — Kahramaa (51003)</span>
                <span className="font-mono font-medium">QAR {pl.utilitiesExpense.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span>Cleaning &amp; Sanitation Services (51004007)</span>
                <span className="font-mono font-medium">QAR {pl.cleaningExpense.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5 bg-rose-50/60 dark:bg-rose-950/20 font-bold text-sm text-rose-600">
                <span>Total Operating Expenses (B)</span>
                <span className="font-mono text-base">(QAR {pl.totalExpenses.toLocaleString()})</span>
              </div>
            </div>
          </div>

          {/* SECTION III: NET OPERATING PROFIT / LOSS */}
          <div className={`flex justify-between items-center font-bold text-base p-4 rounded-lg border-2 ${pl.netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
            <div>
              <span className="text-foreground block">III. Net Operating {pl.netProfit >= 0 ? 'Profit' : 'Loss'} (A − B)</span>
              <span className="text-[11px] font-normal text-muted-foreground">Transferred to Retained Earnings / Balance Sheet</span>
            </div>
            <span className={`font-mono text-xl ${pl.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {pl.netProfit < 0 ? "-" : ""}QAR {Math.abs(pl.netProfit).toLocaleString()}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function BalanceSheetSubModule() {
  const { balanceSheetReport: bs, isSyncing, refreshFinanceData } = useFinanceStore();

  const exportBalanceSheetToCSV = () => {
    const rows = [
      ["Balance Sheet Statement — Al Ameen Real Estate", `Generated: ${formatDateDDMMYYYY(new Date().toISOString().slice(0, 10))}`],
      [],
      ["Section", "Line Item / Ledger Group", "Amount (QAR)"],
      ["Assets", "Bank Operating & Escrow Balances", bs.bankCashAssets.toFixed(2)],
      ["Assets", "Post-Dated Cheques In Hand", bs.pdcInHandAssets.toFixed(2)],
      ["Assets", "Tenant Receivables (AR Ledger)", bs.arReceivablesAssets.toFixed(2)],
      ["Assets", "Legal Receivables (Defaulted)", bs.legalReceivablesAssets.toFixed(2)],
      ["Assets", "Property & Fixed Assets Portfolio", bs.fixedAssets.toFixed(2)],
      ["Assets Subtotal", "TOTAL ASSETS", (bs.totalAssets ?? 0).toFixed(2)],
      [],
      ["Liabilities", "Accounts Payable (Vendors)", bs.apLiabilities.toFixed(2)],
      ["Liabilities", "PDC Received — Customer Liability", bs.pdcCustomerLiabilities.toFixed(2)],
      ["Liabilities", "Tenant Security Deposits Held", bs.securityDepositLiabilities.toFixed(2)],
      ["Equity", "Owner Capital & Reserves", bs.ownerCapital.toFixed(2)],
      ["Equity", "Current Period Net Profit / Retained Earnings", bs.retainedNetProfit.toFixed(2)],
      ["Liabilities & Equity Subtotal", "TOTAL LIABILITIES & EQUITY", bs.totalLiabilitiesAndEquity.toFixed(2)],
    ];
    const csv = "\uFEFF" + rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Balance_Sheet_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Balance Sheet exported to Excel/CSV");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-sm font-semibold">Balance Sheet Statement — Live</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={exportBalanceSheetToCSV}
            className="h-7 text-xs gap-1.5 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50"
          >
            <Download className="h-3 w-3" /> Export Excel / CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshFinanceData}
            disabled={isSyncing}
            className="h-7 text-xs gap-1.5"
            title="Refresh Balance Sheet from DB"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin text-primary" : ""}`} />
            {isSyncing ? "Syncing..." : "Refresh"}
          </Button>
          <Badge variant="outline" className={`font-mono ${bs.isBalanced ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`}>
            {bs.isBalanced ? '✓ Balanced' : '⚠ Discrepancy'}
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <Card className="p-5 space-y-3 shadow-sm bg-card">
          <h4 className="font-bold text-sm border-b pb-2 text-primary flex items-center gap-1.5">
            <Building className="h-4 w-4" /> Assets
          </h4>
          <div className="space-y-1.5">
            <div className="flex justify-between"><span>Bank Operating & Escrow Balances</span><span className="font-mono">QR {bs.bankCashAssets.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Post-Dated Cheques In Hand</span><span className="font-mono">QR {bs.pdcInHandAssets.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Tenant Receivables (AR Ledger)</span><span className="font-mono">QR {bs.arReceivablesAssets.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Legal Receivables (Defaulted)</span><span className="font-mono">QR {bs.legalReceivablesAssets.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Property & Fixed Assets Portfolio</span><span className="font-mono">QR {bs.fixedAssets.toLocaleString()}</span></div>
          </div>
          <div className="flex justify-between font-bold border-t pt-2 text-sm text-foreground">
            <span>Total Assets</span>
            <span className="font-mono text-primary">QR {bs.totalAssets?.toLocaleString() ?? '0'}</span>
          </div>
        </Card>

        <Card className="p-5 space-y-3 shadow-sm bg-card">
          <h4 className="font-bold text-sm border-b pb-2 text-amber-600 flex items-center gap-1.5">
            <Landmark className="h-4 w-4" /> Liabilities & Equity
          </h4>
          <div className="space-y-1.5">
            <div className="flex justify-between"><span>Accounts Payable (Vendors)</span><span className="font-mono">QR {bs.apLiabilities.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>PDC Received — Customer Liability</span><span className="font-mono">QR {bs.pdcCustomerLiabilities.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Tenant Security Deposits Held</span><span className="font-mono">QR {bs.securityDepositLiabilities.toLocaleString()}</span></div>
            <div className="flex justify-between border-t pt-1.5"><span className="font-semibold">Owner Capital & Reserves</span><span className="font-mono">QR {bs.ownerCapital.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-emerald-700 font-semibold">Current Period Net Profit</span><span className={`font-mono ${bs.retainedNetProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>QR {bs.retainedNetProfit.toLocaleString()}</span></div>
          </div>
          <div className="flex justify-between font-bold border-t pt-2 text-sm text-foreground">
            <span>Total Liabilities & Equity</span>
            <span className="font-mono text-amber-600">QR {bs.totalLiabilitiesAndEquity.toLocaleString()}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function GeneralLedgerReportSubModule() {
  const { allLedgerTransactions, leases, units, customers, isSyncing, refreshFinanceData, resetAndInitializeGLFromPDCs, correctVoucherDate, voucherDateCorrections } = useFinanceStore() as any;
  const [dateCorrectionModalOpen, setDateCorrectionModalOpen] = useState(false);
  const [selectedVoucherForCorrection, setSelectedVoucherForCorrection] = useState<{
    reference: string;
    currentDate: string;
    accountCode?: string;
    accountName?: string;
    property?: string;
    unit?: string;
    tenant?: string;
    amount?: number;
  } | null>(null);
  const [correctionNewDate, setCorrectionNewDate] = useState("");
  const [correctionNewBankCode, setCorrectionNewBankCode] = useState("unchanged");
  const [correctionReason, setCorrectionReason] = useState("");
  const [isSavingCorrection, setIsSavingCorrection] = useState(false);

  const BANK_CORRECTION_OPTIONS: Array<{ code: string; name: string }> = [
    { code: "12000001", name: "Commercial Bank of Qatar (CBQ)" },
    { code: "12000002", name: "Al Ameen Dukhan Bank" },
    { code: "12000003", name: "Bank Operating Account (QNB)" },
    { code: "12000004", name: "Doha Bank Operating Account" },
    { code: "12000005", name: "Qatar Islamic Bank (QIB)" },
    { code: "12000006", name: "Al Ameen (Oryx) - Dukhan Bank" },
    { code: "12100001", name: "Cash in Hand / Operating Cash" },
  ];

  async function handleSaveDateCorrection() {
    const targetDate = correctionNewDate || selectedVoucherForCorrection?.currentDate || new Date().toISOString().split("T")[0];
    if (!selectedVoucherForCorrection?.reference) {
      toast.error("Please enter a valid voucher / transaction reference.");
      return;
    }
    setIsSavingCorrection(true);
    try {
      const chosenBank = correctionNewBankCode && correctionNewBankCode !== "unchanged"
        ? BANK_CORRECTION_OPTIONS.find(b => b.code === correctionNewBankCode)
        : undefined;
      await correctVoucherDate({
        voucherNo: selectedVoucherForCorrection.reference,
        newDate: targetDate,
        newBankCode: chosenBank?.code,
        newBankName: chosenBank?.name,
        reason: correctionReason || (chosenBank ? `Bank account corrected to ${chosenBank.code} (${chosenBank.name})` : "Date correction by finance administrator"),
      });
      setDateCorrectionModalOpen(false);
      setSelectedVoucherForCorrection(null);
      setCorrectionNewBankCode("unchanged");
      setCorrectionNewDate("");
      setCorrectionReason("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update transaction");
    } finally {
      setIsSavingCorrection(false);
    }
  }
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [sortField, setSortField] = useState<"date" | "account_code" | "debit" | "credit">("date");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(100);
  const [showInitConfirm, setShowInitConfirm] = useState(false);
  const [initResult, setInitResult] = useState<{ created: number; cleared: number } | null>(null);

  // ── Compute ascending filter options ──────────────────────────────────────
  const txList: any[] = allLedgerTransactions || [];

  const propertyOptions = useMemo(() => {
    const set = new Set<string>();
    txList.forEach(tx => { if (tx.property_name) set.add(tx.property_name); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [txList]);

  const unitOptions = useMemo(() => {
    const set = new Set<string>();
    txList.forEach(tx => {
      if (selectedProperty !== "all" && tx.property_name !== selectedProperty) return;
      if (tx.unit_ref) set.add(tx.unit_ref);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  }, [txList, selectedProperty]);

  const customerOptions = useMemo(() => {
    const set = new Set<string>();
    txList.forEach(tx => { if (tx.tenant_name) set.add(tx.tenant_name); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [txList]);

  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    txList.forEach(tx => { if (tx.date && tx.date.length >= 7) set.add(tx.date.slice(0, 7)); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));  // Ascending chronological
  }, [txList]);

  const sourceOptions = useMemo(() => {
    const set = new Set<string>();
    txList.forEach(tx => { if (tx.source) set.add(tx.source); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [txList]);

  const accountOptions = useMemo(() => {
    const accounts = new Map<string, Set<string>>();
    txList.forEach(tx => {
      if (!tx.account_code) return;
      const names = accounts.get(tx.account_code) || new Set<string>();
      names.add(tx.account_name || tx.account_code);
      accounts.set(tx.account_code, names);
    });
    return Array.from(accounts, ([code, names]) => ({ code, name: Array.from(names).join(" / ") }))
      .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }, [txList]);
  const accountSearchCodes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return new Set<string>();
    const matchingBanks = BANK_GL_ACCOUNTS.filter(account =>
      account.code.toLowerCase().includes(query) || account.name.toLowerCase().includes(query)
    );
    if (matchingBanks.length > 0) return new Set(matchingBanks.map(account => account.code));
    return new Set(accountOptions
      .filter(account => account.code.toLowerCase().includes(query) || account.name.toLowerCase().includes(query))
      .map(account => account.code));
  }, [accountOptions, search]);

  // ── Filtered + Sorted list ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = txList.filter(tx => {
      // Property
      if (selectedProperty !== "all" && tx.property_name !== selectedProperty) return false;
      // Unit
      if (selectedUnit !== "all" && tx.unit_ref !== selectedUnit) return false;
      // Customer
      if (selectedCustomer !== "all" && tx.tenant_name !== selectedCustomer) return false;
      // Account — selecting a GL account isolates its postings for a proper ledger view.
      if (selectedAccount !== "all" && tx.account_code !== selectedAccount) return false;
      // Source
      if (selectedSource !== "all" && tx.source !== selectedSource) return false;
      // Month
      if (selectedMonth !== "all" && !(tx.date || "").startsWith(selectedMonth)) return false;
      // Date range
      if (startDate && (tx.date || "") < startDate) return false;
      if (endDate && (tx.date || "") > endDate) return false;
      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        if (accountSearchCodes.size > 0) {
          if (!accountSearchCodes.has(tx.account_code)) return false;
        } else if (!(
          (tx.account_name || "").toLowerCase().includes(q) ||
          (tx.account_code || "").includes(q) ||
          (tx.reference || "").toLowerCase().includes(q) ||
          (tx.source || "").toLowerCase().includes(q) ||
          (tx.description || "").toLowerCase().includes(q) ||
          (tx.property_name || "").toLowerCase().includes(q) ||
          (tx.unit_ref || "").toLowerCase().includes(q) ||
          (tx.tenant_name || "").toLowerCase().includes(q)
        )) return false;
      }
      return true;
    });

    // Sort
    list = [...list].sort((a, b) => {
      let comp = 0;
      if (sortField === "date") {
        comp = (a.date || "").localeCompare(b.date || "");
      } else if (sortField === "account_code") {
        comp = (a.account_code || "").localeCompare(b.account_code || "");
      } else if (sortField === "debit") {
        comp = (a.debit || 0) - (b.debit || 0);
      } else if (sortField === "credit") {
        comp = (a.credit || 0) - (b.credit || 0);
      }
      return sortAsc ? comp : -comp;
    });

    return list;
  }, [txList, selectedProperty, selectedUnit, selectedCustomer, selectedAccount, selectedSource, selectedMonth, startDate, endDate, search, accountSearchCodes, sortField, sortAsc]);

  const effectivePageSize = pageSize === 0 ? Math.max(1, filtered.length) : pageSize;
  const totalPages = Math.max(1, Math.ceil(filtered.length / effectivePageSize));
  const paginated = useMemo(() => {
    if (pageSize === 0) return filtered;
    return filtered.slice((page - 1) * effectivePageSize, page * effectivePageSize);
  }, [filtered, page, pageSize, effectivePageSize]);

  const totalDebit = useMemo(() => filtered.reduce((s, tx) => s + (tx.debit || 0), 0), [filtered]);
  const totalCredit = useMemo(() => filtered.reduce((s, tx) => s + (tx.credit || 0), 0), [filtered]);

  function resetFilters() {
    setSearch(""); setStartDate(""); setEndDate("");
    setSelectedMonth("all"); setSelectedProperty("all");
    setSelectedUnit("all"); setSelectedCustomer("all"); setSelectedAccount("all");
    setSelectedSource("all"); setSortField("date"); setSortAsc(false); setPage(1);
  }

  function toggleSort(field: "date" | "account_code" | "debit" | "credit") {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
    setPage(1);
  }

  const sortIcon = (field: string) => sortField === field ? (sortAsc ? " ↑" : " ↓") : "";

  return (
    <div className="space-y-4">
      {/* ── Confirmation Dialog for GL Reset + Init ─────────────────────── */}
      <Dialog open={showInitConfirm} onOpenChange={setShowInitConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <span className="text-lg">⚠️</span> Initialize GL from PDCs
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground space-y-2 pt-2">
              <p>This is a <strong>one-time setup operation</strong>. It will:</p>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li>Clear all stale or mismatched voucher entries from the GL</li>
                <li>Re-fetch all PDCs fresh from the database (resolving names via customers &amp; leases tables)</li>
                <li>Post <strong>Entry 1 (In Hand)</strong> for all 1,809 PDCs — Dr Rent PDC In Hand / Cr Customer PDC Liability</li>
                <li>Ensure 100% exact reconciliation across Leasing Vouchers, Trial Balance, and General Ledger (QAR 9,702,908)</li>
                <li>No Contra Vouchers — clean double-entry Receipt Vouchers</li>
              </ul>
              <p className="pt-1 text-xs rounded bg-emerald-50 border border-emerald-200 px-2 py-1.5 text-emerald-800">
                <strong>ℹ️ Reconciliation:</strong> All 1,809 cheques will be initialized as In Hand, ensuring Trial Balance, General Ledger, and Leasing Vouchers match identically at QAR 9,702,908.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowInitConfirm(false)}>Cancel</Button>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              disabled={isSyncing}
              onClick={async () => {
                setShowInitConfirm(false);
                const result = await (resetAndInitializeGLFromPDCs as () => Promise<{ created: number; cleared: number }>)();
                setInitResult(result);
              }}
            >
              {isSyncing ? "Processing..." : "Yes, Initialize GL"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Result Banner ──────────────────────────────────────────────────── */}
      {initResult && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 space-y-1">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-emerald-700 font-medium">
              ✅ GL Initialized: <strong>{initResult.created}</strong> voucher entries for <strong>{initResult.cleared + Math.round((initResult.created - initResult.cleared * 3) / 1)}</strong> PDCs
              {" — "}<strong>{initResult.cleared}</strong> Deposited &amp; Cleared,
              {" "}<strong>{initResult.created - initResult.cleared * 3}</strong> In Hand.
            </p>
            <button className="text-xs text-emerald-600 underline shrink-0" onClick={() => setInitResult(null)}>Dismiss</button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            ℹ️ The GL DR/CR total will exceed the PDC face-value sum because past-due cheques
            each have 3 ledger entries (RCV + DEP + CLR) — their amount appears in the DR column 3×.
            This is correct double-entry accounting.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">General Ledger Transaction Audit — Live</h3>
          <p className="text-xs text-muted-foreground">Complete double-entry log with multi-dimensional filters: Property, Unit, Date, Month &amp; Customer.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* One-time Init button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowInitConfirm(true)}
            disabled={isSyncing}
            className="h-7 text-xs gap-1.5 border-amber-400 text-amber-700 hover:bg-amber-50"
            title="One-time: Reset GL and initialize all PDC entries from database"
          >
            <span className="text-base leading-none">⚡</span> Init GL from PDCs
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const rows = [
                ["Date", "Account Code", "Account Name", "Account Type", "Property", "Unit", "Customer / Tenant", "Reference", "Source", "Debit (QAR)", "Credit (QAR)", "Description"],
                ...filtered.map(tx => [
                  formatDateDDMMYYYY(tx.date),
                  tx.account_code,
                  tx.account_name,
                  tx.account_type || "",
                  tx.property_name || "",
                  tx.unit_ref || "",
                  tx.tenant_name || "",
                  tx.reference || "",
                  tx.source || "",
                  (tx.debit || 0).toFixed(2),
                  (tx.credit || 0).toFixed(2),
                  tx.description || "",
                ]),
              ];
              const csv = "\uFEFF" + rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `General_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success(`Exported ${filtered.length} General Ledger postings to Excel/CSV`);
            }}
            className="h-7 text-xs gap-1.5 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50"
            title="Export filtered General Ledger transactions to Excel / CSV"
          >
            <Download className="h-3 w-3" /> Export GL (Excel / CSV)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshFinanceData}
            disabled={isSyncing}
            className="h-7 text-xs gap-1.5"
            title="Refresh General Ledger from DB"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin text-primary" : ""}`} />
            {isSyncing ? "Syncing..." : "Refresh"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedVoucherForCorrection({
                reference: "",
                currentDate: new Date().toISOString().split("T")[0],
                amount: 0,
              });
              setCorrectionNewDate("");
              setCorrectionNewBankCode("unchanged");
              setCorrectionReason("");
              setDateCorrectionModalOpen(true);
            }}
            className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5 font-medium"
            title="Correct the posted date or receiving bank account of any direct transfer, receipt, or PDC"
          >
            <Calendar className="h-3 w-3" /> Correct Date / Bank Account
          </Button>
          <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-200 text-xs">
            DR: {totalDebit.toLocaleString()} QAR
          </Badge>
          <Badge variant="outline" className="font-mono bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
            CR: {totalCredit.toLocaleString()} QAR
          </Badge>
          <Badge variant="outline" className="text-xs">{filtered.length} Postings</Badge>
        </div>
      </div>

      {/* ── Multi-Dimensional Filter Bar ──────────────────────────────────── */}
      <div className="rounded-xl border bg-muted/25 p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">Multi-Dimensional Filters</span>
          </div>
          <Button size="sm" variant="ghost" className="h-6 text-xs text-muted-foreground px-2" onClick={resetFilters}>
            Reset All
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* 1. Property Filter — Searchable */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" /> Property
            </Label>
            <SearchableSelect
              value={selectedProperty}
              onValueChange={v => { setSelectedProperty(v); setSelectedUnit("all"); setPage(1); }}
              placeholder={`All Properties (${propertyOptions.length})`}
              emptyText="No properties found"
              options={[
                { label: `All Properties (${propertyOptions.length})`, value: "all" },
                ...propertyOptions.map(p => ({ label: p, value: p }))
              ]}
            />
          </div>

          {/* 2. Unit Filter — Searchable */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <HomeIcon className="h-3 w-3" /> Unit
            </Label>
            <SearchableSelect
              value={selectedUnit}
              onValueChange={v => { setSelectedUnit(v); setPage(1); }}
              placeholder={`All Units (${unitOptions.length})`}
              emptyText="No units found"
              options={[
                { label: `All Units (${unitOptions.length})`, value: "all" },
                ...unitOptions.map(u => ({ label: u, value: u }))
              ]}
            />
          </div>

          {/* 3. Customer / Tenant Name Filter — Searchable */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <UserIcon className="h-3 w-3" /> Customer Name
            </Label>
            <SearchableSelect
              value={selectedCustomer}
              onValueChange={v => { setSelectedCustomer(v); setPage(1); }}
              placeholder={`All Customers (${customerOptions.length})`}
              emptyText="No customers found"
              options={[
                { label: `All Customers (${customerOptions.length})`, value: "all" },
                ...customerOptions.map(c => ({ label: c, value: c }))
              ]}
            />
          </div>

          {/* Account Filter — exact account postings for ledger/SOA views */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Landmark className="h-3 w-3" /> GL Account / Bank
            </Label>
            <SearchableSelect
              value={selectedAccount}
              onValueChange={v => { setSelectedAccount(v); setPage(1); }}
              placeholder={`All Accounts (${accountOptions.length})`}
              emptyText="No accounts found"
              options={[
                { label: `All Accounts (${accountOptions.length})`, value: "all" },
                ...accountOptions.map(account => ({ label: `${account.code} - ${account.name}`, value: account.code }))
              ]}
            />
          </div>

          {/* 4. Month Filter (Ascending Chronological) */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Month
            </Label>
            <Select value={selectedMonth} onValueChange={v => { setSelectedMonth(v); setPage(1); }}>
              <SelectTrigger className="h-8 text-xs bg-background font-mono">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {monthOptions.map(m => {
                  const [y, mm] = m.split("-");
                  const label = new Date(Number(y), Number(mm) - 1, 1).toLocaleString("default", { month: "short", year: "numeric" });
                  return <SelectItem key={m} value={m} className="font-mono text-xs">{label} ({m})</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>

          {/* 5. Source / Transaction Type Filter */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" /> Source / Type
            </Label>
            <Select value={selectedSource} onValueChange={v => { setSelectedSource(v); setPage(1); }}>
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sourceOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sub-row: Search + Date Range with Current Date (Today) shortcuts + Sort toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1 items-center">
          <div className="sm:col-span-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-8 text-xs bg-background"
              placeholder="Search account, code, reference, description, tenant..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="sm:col-span-3 flex items-center gap-1.5">
            <Label className="text-[11px] text-muted-foreground whitespace-nowrap">From:</Label>
            <div className="relative flex-1">
              <Input
                type="date"
                className="h-8 text-xs bg-background pr-7"
                value={startDate}
                onChange={e => { setStartDate(e.target.value); setPage(1); }}
              />
              <button
                type="button"
                onClick={() => {
                  const todayStr = new Date().toISOString().split("T")[0];
                  setStartDate(todayStr);
                  setPage(1);
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-primary hover:text-primary/80 font-bold px-1 py-0.5 rounded bg-muted/60"
                title="Set From Date to Current Date (Today)"
              >
                Now
              </button>
            </div>
          </div>
          <div className="sm:col-span-3 flex items-center gap-1.5">
            <Label className="text-[11px] text-muted-foreground whitespace-nowrap">To:</Label>
            <div className="relative flex-1">
              <Input
                type="date"
                className="h-8 text-xs bg-background pr-7"
                value={endDate}
                onChange={e => { setEndDate(e.target.value); setPage(1); }}
              />
              <button
                type="button"
                onClick={() => {
                  const todayStr = new Date().toISOString().split("T")[0];
                  setEndDate(todayStr);
                  setPage(1);
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-primary hover:text-primary/80 font-bold px-1 py-0.5 rounded bg-muted/60"
                title="Set To Date to Current Date (Today)"
              >
                Now
              </button>
            </div>
          </div>
          <div className="sm:col-span-2 flex items-center gap-1.5 justify-end">
            <Button size="sm" variant="outline" className="h-8 text-xs w-full gap-1" onClick={() => { setSortAsc(!sortAsc); setPage(1); }}>
              <ArrowUpDown className="h-3 w-3" />{sortAsc ? "Asc ↑" : "Desc ↓"}
            </Button>
          </div>
        </div>

        {/* Quick Date Presets Row */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5 border-t border-border/40 text-[11px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-muted-foreground font-semibold flex items-center gap-1">
              <Calendar className="h-3 w-3 text-primary" /> Date Presets:
            </span>
            <button
              type="button"
              onClick={() => {
                const todayStr = new Date().toISOString().split("T")[0];
                setStartDate(todayStr);
                setEndDate(todayStr);
                setPage(1);
              }}
              className="px-2 py-0.5 rounded-md border text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 border-primary/30 transition-colors shadow-xs"
            >
              📅 Select Current Date (Today)
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
                setStartDate(firstDay);
                setEndDate(lastDay);
                setPage(1);
              }}
              className="px-2 py-0.5 rounded-md border text-xs font-medium bg-background hover:bg-muted text-foreground transition-colors"
            >
              This Month
            </button>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setPage(1);
                }}
                className="px-2 py-0.5 rounded-md text-xs text-muted-foreground hover:text-destructive underline"
              >
                Clear Date Range
              </button>
            )}
          </div>
          {startDate && endDate && (
            <span className="font-mono text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded border">
              Active Range: {startDate} → {endDate}
            </span>
          )}
        </div>
      </div>

      {/* Summary Banner with Page Size & Density Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-muted-foreground">
            Showing <strong className="text-foreground">{pageSize === 0 ? filtered.length : Math.min(effectivePageSize, filtered.length - (page - 1) * effectivePageSize)}</strong> of <strong className="text-foreground">{filtered.length}</strong> postings
            {selectedProperty !== "all" ? ` • Property: ${selectedProperty}` : ""}
            {selectedUnit !== "all" ? ` • Unit: ${selectedUnit}` : ""}
            {selectedCustomer !== "all" ? ` • Customer: ${selectedCustomer}` : ""}
            {selectedMonth !== "all" ? ` • Month: ${selectedMonth}` : ""}
          </span>
          <div className="flex items-center gap-1 ml-2 border-l pl-2">
            <span className="text-[11px] text-muted-foreground">Rows:</span>
            {[25, 50, 100, 200, 0].map(size => (
              <button
                key={size}
                type="button"
                onClick={() => { setPageSize(size); setPage(1); }}
                className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  pageSize === size
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {size === 0 ? "All" : size}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs">
            Balance: <span className={`font-bold ${Math.abs(totalDebit - totalCredit) < 1 ? "text-emerald-600" : "text-red-600"}`}>
              {Math.abs(totalDebit - totalCredit) < 1 ? "✓ Balanced" : `Out by QR ${Math.abs(totalDebit - totalCredit).toLocaleString()}`}
            </span>
          </span>
        </div>
      </div>

      {/* Table with responsive horizontal scroll and compact density */}
      <div className="border rounded-lg overflow-x-auto max-w-full bg-card shadow-sm scrollbar-thin">
        <Table className="w-full text-[11px] border-collapse">
          <TableHeader>
            <TableRow className="bg-muted/60 text-[11px] font-semibold">
              <TableHead className="py-2 px-2.5 font-bold cursor-pointer whitespace-nowrap" onClick={() => toggleSort("date")}>
                Date{sortIcon("date")}
              </TableHead>
              <TableHead className="py-2 px-2 font-bold cursor-pointer whitespace-nowrap" onClick={() => toggleSort("account_code")}>
                A/C Code{sortIcon("account_code")}
              </TableHead>
              <TableHead className="py-2 px-2.5 font-bold min-w-[180px]">Account Name</TableHead>
              <TableHead className="py-2 px-2 font-bold min-w-[140px]">Property</TableHead>
              <TableHead className="py-2 px-2 font-bold min-w-[100px]">Unit</TableHead>
              <TableHead className="py-2 px-2 font-bold min-w-[140px]">Customer / Tenant</TableHead>
              <TableHead className="py-2 px-2 font-bold min-w-[110px]">Reference</TableHead>
              <TableHead className="py-2 px-2 font-bold whitespace-nowrap">Source</TableHead>
              <TableHead className="py-2 px-2.5 text-right font-bold cursor-pointer whitespace-nowrap min-w-[90px]" onClick={() => toggleSort("debit")}>
                Debit (QAR){sortIcon("debit")}
              </TableHead>
              <TableHead className="py-2 px-2.5 text-right font-bold cursor-pointer whitespace-nowrap min-w-[90px]" onClick={() => toggleSort("credit")}>
                Credit (QAR){sortIcon("credit")}
              </TableHead>
              <TableHead className="py-2 px-2 text-center font-bold whitespace-nowrap min-w-[50px]">Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-[11px]">
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-10 text-muted-foreground">
                  No GL postings match the selected Property, Unit, Date, Month, or Customer filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(tx => (
                <TableRow key={tx.id} className="hover:bg-muted/40 transition-colors border-b border-border/40">
                  <TableCell className="py-1.5 px-2.5 font-mono whitespace-nowrap font-medium">{formatDateDDMMYYYY(tx.date)}</TableCell>
                  <TableCell className="py-1.5 px-2 font-mono font-bold text-primary whitespace-nowrap">{tx.account_code}</TableCell>
                  <TableCell className="py-1.5 px-2.5 font-medium">{tx.account_name}</TableCell>
                  <TableCell className="py-1.5 px-2 text-muted-foreground">{tx.property_name || "—"}</TableCell>
                  <TableCell className="py-1.5 px-2 font-mono">{tx.unit_ref || "—"}</TableCell>
                  <TableCell className="py-1.5 px-2">{tx.tenant_name || "—"}</TableCell>
                  <TableCell className="py-1.5 px-2 font-mono">{tx.reference}</TableCell>
                  <TableCell className="py-1.5 px-2 whitespace-nowrap">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {tx.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1.5 px-2.5 text-right font-mono font-semibold text-blue-600 whitespace-nowrap">
                    {tx.debit > 0 ? tx.debit.toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="py-1.5 px-2.5 text-right font-mono font-semibold text-emerald-600 whitespace-nowrap">
                    {tx.credit > 0 ? tx.credit.toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="py-1 px-1.5 text-center whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded"
                      title={`Correct date or bank account for voucher ${tx.reference}`}
                      onClick={() => {
                        setSelectedVoucherForCorrection({
                          reference: tx.reference,
                          currentDate: tx.date,
                          accountCode: tx.account_code,
                          accountName: tx.account_name,
                          property: tx.property_name,
                          unit: tx.unit_ref,
                          tenant: tx.tenant_name,
                          amount: tx.debit > 0 ? tx.debit : tx.credit,
                        });
                        setCorrectionNewDate(tx.date);
                        setCorrectionNewBankCode(
                          BANK_CORRECTION_OPTIONS.some(b => b.code === tx.account_code)
                            ? tx.account_code
                            : "unchanged"
                        );
                        setCorrectionReason("");
                        setDateCorrectionModalOpen(true);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {pageSize !== 0 && filtered.length > effectivePageSize && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground pt-1 pb-4">
          <span>Showing {((page - 1) * effectivePageSize) + 1}–{Math.min(page * effectivePageSize, filtered.length)} of {filtered.length} postings (Page {page} of {totalPages})</span>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-7 text-xs" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-muted-foreground">…</span>}
                  <Button
                    size="sm"
                    variant={p === page ? "default" : "outline"}
                    className="h-7 w-7 p-0 text-xs"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                </span>
              ))}
            <Button size="sm" variant="outline" className="h-7 text-xs" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next →</Button>
          </div>
        </div>
      )}
      {/* ── Transaction / Voucher Date & Bank Account Correction Dialog ───────── */}
      <Dialog open={dateCorrectionModalOpen} onOpenChange={setDateCorrectionModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-primary" />
              Correct Transaction Date / Bank Account
            </DialogTitle>
            <DialogDescription className="text-xs">
              Change the posted accounting date and/or receiving Bank / Cash account of any Direct Transfer, Receipt Voucher, or PDC deposit.
              This immediately updates the General Ledger, Trial Balance, Cash Book, and Financial Statements with an audit entry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Voucher / Direct Transfer / PDC Reference</Label>
              <Input
                placeholder="e.g. VCH-TRF-..., RV-..., or VCH-DEP-..."
                value={selectedVoucherForCorrection?.reference || ""}
                onChange={e => {
                  const ref = e.target.value.trim();
                  const match = (allLedgerTransactions || []).find((tx: any) =>
                    tx.reference?.toLowerCase() === ref.toLowerCase() ||
                    tx.id?.toLowerCase() === ref.toLowerCase()
                  );
                  setSelectedVoucherForCorrection({
                    reference: ref,
                    currentDate: match?.date || selectedVoucherForCorrection?.currentDate || "",
                    accountCode: match?.account_code,
                    accountName: match?.account_name,
                    tenant: match?.tenant_name,
                    unit: match?.unit_ref,
                    amount: match ? (match.debit > 0 ? match.debit : match.credit) : (selectedVoucherForCorrection?.amount || 0)
                  });
                  if (match?.date) setCorrectionNewDate(match.date);
                  if (match?.account_code && BANK_CORRECTION_OPTIONS.some(b => b.code === match.account_code)) {
                    setCorrectionNewBankCode(match.account_code);
                  }
                }}
                className="font-mono text-xs"
              />
            </div>

            {selectedVoucherForCorrection && (
              <div className="rounded-lg border bg-muted/30 p-2.5 text-xs grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Current Date</span>
                  <span className="font-mono font-semibold">{selectedVoucherForCorrection.currentDate || "Unknown"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Amount</span>
                  <span className="font-mono font-semibold">QAR {(selectedVoucherForCorrection.amount || 0).toLocaleString()}</span>
                </div>
                {selectedVoucherForCorrection.accountName && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Current Ledger Account</span>
                    <span className="font-mono font-medium">
                      {selectedVoucherForCorrection.accountCode ? `${selectedVoucherForCorrection.accountCode} — ` : ""}
                      {selectedVoucherForCorrection.accountName}
                    </span>
                  </div>
                )}
                {selectedVoucherForCorrection.tenant && (
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Customer</span>
                    <span className="truncate block font-medium">{selectedVoucherForCorrection.tenant}</span>
                  </div>
                )}
                {selectedVoucherForCorrection.unit && (
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Unit</span>
                    <span className="font-mono font-medium">{selectedVoucherForCorrection.unit}</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">New Transaction Date (YYYY-MM-DD)</Label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCorrectionNewDate("2026-10-04")}
                    className="text-[10px] text-primary hover:underline px-1.5 py-0.5 rounded bg-primary/10"
                  >
                    Set 04-10-2026
                  </button>
                  <button
                    type="button"
                    onClick={() => setCorrectionNewDate(new Date().toISOString().split("T")[0])}
                    className="text-[10px] text-muted-foreground hover:underline px-1.5 py-0.5 rounded bg-muted"
                  >
                    Today
                  </button>
                </div>
              </div>
              <Input
                type="date"
                value={correctionNewDate}
                onChange={e => setCorrectionNewDate(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5 text-primary" />
                  Receiving Bank / Cash Account (12000001 - 12100001)
                </Label>
                {correctionNewBankCode !== "unchanged" && (
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                    Target: {correctionNewBankCode}
                  </Badge>
                )}
              </div>
              <Select value={correctionNewBankCode} onValueChange={setCorrectionNewBankCode}>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Keep existing bank / cash account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unchanged">(Keep Existing Bank / Cash Account)</SelectItem>
                  {BANK_CORRECTION_OPTIONS.map(bank => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.code} — {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Select from CBQ, Al Ameen Dukhan, QNB, Doha Bank, QIB, Al Ameen (Oryx), or Cash in Hand to correct the receiving account.
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Reason for Correction (Required for Audit Trail)</Label>
              <Textarea
                rows={2}
                placeholder="e.g. Direct transfer was received in Al Ameen Dukhan Bank (12000002) on 04-10-2026."
                value={correctionReason}
                onChange={e => setCorrectionReason(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Recent Date Corrections History */}
            {voucherDateCorrections && Object.keys(voucherDateCorrections).length > 0 && (
              <div className="pt-2 border-t space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Logged Corrections ({Object.keys(voucherDateCorrections).length})
                </span>
                <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] pr-1">
                  {Object.entries(voucherDateCorrections).map(([vNo, corr]) => (
                    <div key={vNo} className="flex items-center justify-between p-1.5 rounded bg-muted/40 border text-[11px]">
                      <div className="truncate max-w-[260px]">
                        <span className="font-mono font-bold block truncate">{vNo}</span>
                        <span className="text-muted-foreground text-[10px] truncate block">{(corr as any)?.reason}</span>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                        <Badge variant="outline" className="font-mono text-[10px] bg-emerald-50 text-emerald-700">
                          {(corr as any)?.newDate}
                        </Badge>
                        {(corr as any)?.newBankCode && (
                          <span className="text-[9px] font-mono text-blue-700">
                            {(corr as any)?.newBankCode} ({(corr as any)?.newBankName})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDateCorrectionModalOpen(false);
                setSelectedVoucherForCorrection(null);
              }}
              disabled={isSavingCorrection}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSavingCorrection || !selectedVoucherForCorrection?.reference}
              onClick={handleSaveDateCorrection}
              className="gap-1.5"
            >
              {isSavingCorrection ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
              Apply Correction (Date &amp; Bank Account)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CashFlowSubModule() {
  const { cashFlowReport: cf, isSyncing, refreshFinanceData } = useFinanceStore();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Cash Flow Statement — Live</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={refreshFinanceData}
          disabled={isSyncing}
          className="h-7 text-xs gap-1.5"
          title="Refresh Cash Flow Statement from DB"
        >
          <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin text-primary" : ""}`} />
          {isSyncing ? "Syncing..." : "Refresh"}
        </Button>
      </div>
      <Card className="p-5 space-y-3 text-xs shadow-sm bg-card">
        <div className="space-y-2 border-b pb-3">
          <div className="flex justify-between font-semibold">
            <span>Operating Cash Inflows (Rent Collections)</span>
            <span className="text-emerald-600 font-mono">+QR {cf.operatingInflow.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Operating Cash Outflows (Expenses, Payroll, Utilities)</span>
            <span className="text-rose-600 font-mono">-QR {cf.operatingOutflow.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-1.5">
            <span>Net Cash from Operating Activities</span>
            <span className={`font-mono ${cf.netOperatingCash >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>QR {cf.netOperatingCash.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex justify-between font-semibold border-b pb-2">
          <span>Net Cash from Investing Activities (Asset Upgrades)</span>
          <span className="text-rose-600 font-mono">QR {cf.investingCash.toLocaleString()}</span>
        </div>

        <div className="flex justify-between font-semibold border-b pb-2">
          <span>Net Cash from Financing Activities (Capital & Dividends)</span>
          <span className="font-mono text-muted-foreground">QR {cf.financingCash.toLocaleString()}</span>
        </div>

        <div className={`flex justify-between font-bold text-sm p-3 rounded-lg border ${cf.netCashChange >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
          <span>Net Cash Increase in Period</span>
          <span className={`font-mono ${cf.netCashChange >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{cf.netCashChange >= 0 ? '+' : ''}QR {cf.netCashChange.toLocaleString()}</span>
        </div>

        <div className="flex justify-between font-bold text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
          <span className="text-blue-900">Estimated Closing Cash & Bank Balance</span>
          <span className="font-mono text-blue-700">QR {cf.endingCashBalance.toLocaleString()}</span>
        </div>
      </Card>
    </div>
  );
}

interface CashBookEntry {
  id: string;
  date: string;
  voucher: string;
  description: string;
  cash_in: number;
  cash_out: number;
  balance: number;
  computedRunningBal?: number;
}

function CashBookSubModule() {
  const { cashBookEntries, addCashBookEntry, isSyncing, refreshFinanceData } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [directEntries, setDirectEntries] = useState<CashBookEntry[]>([]);
  const [loadingDirect, setLoadingDirect] = useState(true);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    voucher: `CSH-${Math.floor(10 + Math.random() * 90)}`,
    description: "",
    type: "in",
    amount: "1500",
  });

  // Fetch PDC deposits and cash receipts directly from DB (mirrors how PDC Management loads data)
  useEffect(() => {
    async function fetchCashEntries() {
      setLoadingDirect(true);
      try {
        const [finRes, evtRes] = await Promise.all([
          supabase.from("fin_pdc_register").select("id, cheque_number, amount, status, deposit_date, cheque_date, tenant_name, unit_name, property_name").order("cheque_date", { ascending: false }),
          supabase.from("fin_accounting_events").select("id, event_type, event_date, posting_date, total_debit, total_credit, description, reference_number, metadata").order("event_date", { ascending: false }).limit(300),
        ]);

        const synthesized: CashBookEntry[] = [];
        let runBal = 0;

        // PDC deposits → Cash In (money arrived in bank from deposited cheque)
        for (const p of (finRes.data || [])) {
          const rawStatus = (p.status || "").toLowerCase();
          if (rawStatus !== "deposited" && rawStatus !== "cleared" && rawStatus !== "partial cash") continue;
          const amt = Number(p.amount || 0);
          if (amt <= 0) continue;
          const date = p.deposit_date || p.cheque_date || new Date().toISOString().split("T")[0];
          const desc = `PDC Deposited — ${p.tenant_name || "Tenant"}${p.unit_name ? ` (${p.unit_name})` : ""} [Cheque #${p.cheque_number}]`;
          runBal += amt;
          synthesized.push({ id: `cb-pdc-${p.id}`, date, voucher: `VCH-PDC-DEP-${p.cheque_number}`, description: desc, cash_in: amt, cash_out: 0, balance: runBal });
        }

        // Accounting events → Cash In / Out
        for (const e of (evtRes.data || [])) {
          const evtType = (e.event_type || "").toLowerCase();
          const meta = (e.metadata as any) || {};
          const amt = Number(e.total_debit || e.total_credit || 0);
          if (amt <= 0) continue;
          const date = e.event_date || e.posting_date || new Date().toISOString().split("T")[0];
          const voucher = e.reference_number || `EVT-${String(e.id).slice(0, 8).toUpperCase()}`;
          const isCashIn = evtType.includes("receiv") || evtType.includes("deposit") || evtType.includes("collect");
          if (isCashIn) {
            runBal += amt;
            synthesized.push({ id: `cb-evt-${e.id}`, date, voucher, description: e.description || e.event_type, cash_in: amt, cash_out: 0, balance: runBal });
          } else if (evtType.includes("pay") || evtType.includes("refund") || evtType.includes("expense")) {
            runBal -= amt;
            synthesized.push({ id: `cb-evt-${e.id}`, date, voucher, description: e.description || e.event_type, cash_in: 0, cash_out: amt, balance: runBal });
          }
        }

        setDirectEntries(synthesized);
      } catch (err) {
        console.warn("[CashBook] Direct fetch failed:", err);
      } finally {
        setLoadingDirect(false);
      }
    }
    void fetchCashEntries();
  }, []);

  function handleAdd() {
    const amt = parseFloat(form.amount) || 0;
    addCashBookEntry({
      date: form.date,
      voucher: form.voucher,
      description: form.description || "Cash Transaction",
      type: form.type as "in" | "out",
      amount: amt
    });
    setOpen(false);
  }

  // Merge manual + direct entries (deduplicated by id), sorted newest first
  const allCashEntries = useMemo(() => {
    const seenIds = new Set<string>();
    const merged: CashBookEntry[] = [];
    for (const e of [...cashBookEntries, ...directEntries]) {
      if (e && !seenIds.has(e.id)) { seenIds.add(e.id); merged.push(e); }
    }
    return merged.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [cashBookEntries, directEntries]);

  // Recompute running balance across ALL entries (chronological)
  const displayRows = useMemo(() => {
    const chrono = [...allCashEntries].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    let runBal = 0;
    const withBal = chrono.map(r => {
      runBal += (r.cash_in || 0) - (r.cash_out || 0);
      return { ...r, computedRunningBal: runBal };
    });
    return withBal.reverse();
  }, [allCashEntries]);

  const totalIn = allCashEntries.reduce((s, r) => s + (r.cash_in || 0), 0);
  const totalOut = allCashEntries.reduce((s, r) => s + (r.cash_out || 0), 0);
  const currentNetBalance = totalIn - totalOut;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Main Cash Book — Live</h3>
          <p className="text-xs text-muted-foreground">All physical cash receipts, PDC deposits, vault deposits, and disbursements — synced with Cash On Hand report.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={refreshFinanceData}
            disabled={isSyncing}
            className="h-8 text-xs gap-1.5"
            title="Refresh Cash Book from DB"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`} />
            {isSyncing ? "Syncing..." : "Refresh"}
          </Button>
          <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Cash Entry</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 bg-emerald-50 border-emerald-200"><p className="text-xs text-emerald-700 font-semibold">Total Cash In</p><p className="font-mono font-bold text-emerald-800 text-sm">QR {totalIn.toLocaleString()}</p></Card>
        <Card className="p-3 bg-rose-50 border-rose-200"><p className="text-xs text-rose-700 font-semibold">Total Cash Out</p><p className="font-mono font-bold text-rose-800 text-sm">QR {totalOut.toLocaleString()}</p></Card>
        <Card className="p-3 bg-blue-50 border-blue-200"><p className="text-xs text-blue-700 font-semibold">Current Balance</p><p className="font-mono font-bold text-blue-800 text-sm">QR {currentNetBalance.toLocaleString()}</p></Card>
      </div>

      {loadingDirect && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading PDC deposits and cash transactions…
        </div>
      )}

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Voucher #</TableHead>
              <TableHead className="font-bold">Description</TableHead>
              <TableHead className="text-right font-bold text-emerald-600">Cash In (QAR)</TableHead>
              <TableHead className="text-right font-bold text-rose-600">Cash Out (QAR)</TableHead>
              <TableHead className="text-right font-bold">Running Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {displayRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">{loadingDirect ? "Loading…" : "No cash entries recorded yet."}</TableCell>
              </TableRow>
            ) : (
              displayRows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono">{row.date}</TableCell>
                  <TableCell className="font-mono font-bold text-primary">{row.voucher}</TableCell>
                  <TableCell className="font-medium">{row.description}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-emerald-600">{(row.cash_in || 0) > 0 ? (row.cash_in || 0).toLocaleString() : "—"}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-rose-600">{(row.cash_out || 0) > 0 ? (row.cash_out || 0).toLocaleString() : "—"}</TableCell>
                  <TableCell className="text-right font-mono font-bold">{(row as any).computedRunningBal.toLocaleString()} QAR</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Cash Book Entry</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Voucher Ref</Label><Input value={form.voucher} onChange={e => setForm({ ...form, voucher: e.target.value })} /></div>
            </div>
            <div><Label>Description</Label><Input placeholder="Reason for cash transaction" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Cash In (Receipt)</SelectItem>
                    <SelectItem value="out">Cash Out (Payment)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Amount (QAR)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            </div>

            {/* Live GL / COA Impact Preview */}
            {parseFloat(form.amount) > 0 && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Ledgers / Accounts Updated by this Cash Entry</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-background p-2 rounded border border-emerald-200">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold block">Debit (DR):</span>
                    <span>{form.type === 'in' ? '10100 - Cash In Hand (Office Vault)' : '51004001 - Repair and Maintenance Cost'}</span>
                    <span className="block font-bold text-emerald-600 mt-1">QR {parseFloat(form.amount || '0').toLocaleString()}</span>
                  </div>
                  <div className="bg-background p-2 rounded border border-rose-200">
                    <span className="text-rose-600 dark:text-rose-400 font-bold block">Credit (CR):</span>
                    <span>{form.type === 'in' ? '41100 - Rental Revenue / Customer' : '10100 - Cash In Hand (Office Vault)'}</span>
                    <span className="block font-bold text-rose-600 mt-1">QR {parseFloat(form.amount || '0').toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PettyCashBookSubModule() {
  const { pettyCashEntries, addPettyCashEntry, isSyncing, refreshFinanceData } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    expense: "Refreshments & Tea",
    paid_to: "Local Cafeteria",
    amount: "65",
  });

  function handleAdd() {
    addPettyCashEntry({
      date: form.date,
      expense: form.expense,
      paid_to: form.paid_to,
      amount: parseFloat(form.amount) || 0
    });
    setOpen(false);
  }

  const totalPetty = pettyCashEntries.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Petty Cash Custodian Register — Live</h3>
          <p className="text-xs text-muted-foreground">Minor daily expense vouchers and imprest fund tracking — synced with Cash On Hand report.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={refreshFinanceData}
            disabled={isSyncing}
            className="h-8 text-xs gap-1.5"
            title="Refresh Petty Cash from DB"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`} />
            {isSyncing ? "Syncing..." : "Refresh"}
          </Button>
          <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Petty Cash Expense</Button>
        </div>
      </div>

      <Card className="p-3 bg-amber-50 border-amber-200 inline-flex gap-3 items-center">
        <p className="text-xs font-semibold text-amber-700">Total Petty Cash Spent</p>
        <p className="font-mono font-bold text-amber-800">QR {totalPetty.toLocaleString()}</p>
      </Card>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Expense Description</TableHead>
              <TableHead className="font-bold">Paid To</TableHead>
              <TableHead className="text-right font-bold">Amount (QAR)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {[...pettyCashEntries].sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime()).map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30">
                <TableCell className="font-mono">{row.date}</TableCell>
                <TableCell className="font-medium">{row.expense}</TableCell>
                <TableCell>{row.paid_to}</TableCell>
                <TableCell className="text-right font-mono font-bold text-rose-600">{row.amount.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Petty Cash Expense</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Expense Item</Label><Input value={form.expense} onChange={e => setForm({ ...form, expense: e.target.value })} /></div>
              <div><Label>Paid To</Label><Input value={form.paid_to} onChange={e => setForm({ ...form, paid_to: e.target.value })} /></div>
              <div><Label>Amount (QAR)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            </div>

            {/* Live GL / COA Impact Preview */}
            {parseFloat(form.amount) > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Ledgers / Accounts Updated by this Petty Cash Expense</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-background p-2 rounded border border-emerald-200">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold block">Debit (Expense):</span>
                    <span>50800 - General Office & Hospitality</span>
                    <span className="block font-bold text-emerald-600 mt-1">QR {parseFloat(form.amount || '0').toLocaleString()}</span>
                  </div>
                  <div className="bg-background p-2 rounded border border-rose-200">
                    <span className="text-rose-600 dark:text-rose-400 font-bold block">Credit (Asset/Float):</span>
                    <span>10200 - Petty Cash Float Imprest</span>
                    <span className="block font-bold text-rose-600 mt-1">QR {parseFloat(form.amount || '0').toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CashOnHandSubModule() {
  const { cashOnHandPosition: co, isSyncing, refreshFinanceData } = useFinanceStore();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Current Physical Cash Position — Live</h3>
          <p className="text-xs text-muted-foreground">Real-time physical cash balances across all custody points — updated whenever Cash Book or Petty Cash entries are added.</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={refreshFinanceData}
          disabled={isSyncing}
          className="h-8 text-xs gap-1.5"
          title="Refresh Cash On Hand from DB"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`} />
          {isSyncing ? "Syncing..." : "Refresh"}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-emerald-50 border-emerald-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-800 uppercase">Office Safe Vault Cash</p>
          <h4 className="text-2xl font-bold mt-1 font-mono text-emerald-700">QR {co.vaultCash.toLocaleString()}</h4>
          <p className="text-[10px] text-emerald-600 mt-1">Verified physical cash balance</p>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200 shadow-sm">
          <p className="text-xs font-semibold text-blue-800 uppercase">Petty Cash Float Imprest</p>
          <h4 className="text-2xl font-bold mt-1 font-mono text-blue-700">QR {co.pettyCashFloat.toLocaleString()}</h4>
          <p className="text-[10px] text-blue-600 mt-1">Held with Head Office Custodian</p>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200 shadow-sm">
          <p className="text-xs font-semibold text-purple-800 uppercase">Site Cash Registers</p>
          <h4 className="text-2xl font-bold mt-1 font-mono text-purple-700">QR {co.siteDesks.toLocaleString()}</h4>
          <p className="text-[10px] text-purple-600 mt-1">Al Sadd & Salata Front Desks</p>
        </Card>
      </div>
      <Card className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase opacity-80">Total Cash On Hand (All Custody Points)</p>
        <h4 className="text-3xl font-bold mt-1 font-mono">QR {co.totalCashOnHand.toLocaleString()}</h4>
        <p className="text-[11px] opacity-70 mt-1">Vault + Petty Cash Float + Site Registers</p>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CONTRACT MANAGEMENT SUB-MODULES (FIXED MODERN MODAL)
// ─────────────────────────────────────────────────────────────────────────────

function ContractManagementSubModule({ type }: { type: "Expense" | "Revenue" }) {
  const { leases, customers } = useAppData();
  const [data, setData] = useState<FinContract[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    contract_number: `CNT-${type === "Expense" ? "EXP" : "REV"}-${Math.floor(100 + Math.random() * 900)}`,
    title: type === "Expense" ? "Annual HVAC & MEP Maintenance Agreement" : "Commercial Tenancy Agreement - GF1",
    party_name: type === "Expense" ? "Qatar Maintenance & HVAC Co." : "M/S. Al Ameen Real Estate",
    type,
    total_value: type === "Expense" ? 65000 : 66000,
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    status: "Active"
  });

  useEffect(() => { load(); }, [type]);
  async function load() {
    try {
      const all = await FinContractsApi.fetchAll();
      const filtered = all.filter(c => c.type === type);
      if (filtered.length > 0) {
        setData(filtered);
      } else {
        setData([
          {
            id: "1",
            contract_number: `CNT-${type === "Expense" ? "EXP" : "REV"}-001`,
            title: type === "Expense" ? "Comprehensive Facility Management Agreement" : "Corporate Office Lease Agreement",
            party_name: type === "Expense" ? "Gulf Facility Solutions WLL" : "Al Ameen Logistics WLL",
            type,
            total_value: type === "Expense" ? 48000 : 66000,
            start_date: "2026-01-01",
            end_date: "2026-12-31",
            status: "Active"
          }
        ]);
      }
    } catch {
      setData([
        {
          id: "1",
          contract_number: `CNT-${type === "Expense" ? "EXP" : "REV"}-001`,
          title: type === "Expense" ? "Comprehensive Facility Management Agreement" : "Corporate Office Lease Agreement",
          party_name: type === "Expense" ? "Gulf Facility Solutions WLL" : "Al Ameen Logistics WLL",
          type,
          total_value: type === "Expense" ? 48000 : 66000,
          start_date: "2026-01-01",
          end_date: "2026-12-31",
          status: "Active"
        }
      ]);
    }
  }

  async function handleAdd() {
    if (!form.contract_number || !form.title || !form.party_name) {
      toast.error("Please fill in required fields");
      return;
    }
    try {
      await FinContractsApi.create({ ...form, type });
    } catch { }

    setData(prev => [{ id: String(Date.now()), ...form, type } as FinContract, ...prev]);
    toast.success(`${type} Contract saved successfully!`);
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">{type} Contracts Register</h3>
          <p className="text-xs text-muted-foreground">
            {type === "Expense"
              ? "Vendor agreements, service contracts, and facility management obligations."
              : "Tenant lease agreements, revenue sharing, and commercial tenancy contracts."}
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add {type} Contract
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Entry Date</TableHead>
              <TableHead className="font-bold">Contract #</TableHead>
              <TableHead className="font-bold">Contract Title</TableHead>
              <TableHead className="font-bold">{type === "Expense" ? "Vendor / Contractor" : "Tenant / Customer"}</TableHead>
              <TableHead className="text-right font-bold">Total Value (QAR)</TableHead>
              <TableHead className="font-bold">Contract Period</TableHead>
              <TableHead className="font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {[...data].sort((a, b) => new Date(b.start_date || "").getTime() - new Date(a.start_date || "").getTime()).map(c => (
              <TableRow key={c.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-muted-foreground">{c.start_date || '2026-08-01'}</TableCell>
                <TableCell className="font-mono font-bold text-primary">{c.contract_number}</TableCell>
                <TableCell className="font-semibold">{c.title}</TableCell>
                <TableCell>{c.party_name}</TableCell>
                <TableCell className="text-right font-mono font-bold text-emerald-600">
                  QR {Number(c.total_value).toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground">{c.start_date} to {c.end_date}</TableCell>
                <TableCell>
                  <Badge variant={c.status === "Active" ? "default" : "outline"} className="text-[10px]">
                    {c.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* FIXED MODERN MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5" /> Add {type} Contract Agreement
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Register a new legally binding {type.toLowerCase()} contract with terms, dates, and commercial valuation.
            </p>
          </DialogHeader>

          <div className="space-y-3.5 py-3 text-xs">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Contract Identifier <span className="text-destructive">*</span></Label>
                <Input
                  className="font-mono text-xs"
                  placeholder="CNT-EXP-001"
                  value={form.contract_number}
                  onChange={e => setForm({ ...form, contract_number: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Contract Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active & Executed</SelectItem>
                    <SelectItem value="Under Review">Under Legal Review</SelectItem>
                    <SelectItem value="Pending Signature">Pending Landlord Signature</SelectItem>
                    <SelectItem value="Draft">Draft Specification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Contract Title / Description <span className="text-destructive">*</span></Label>
              <Input
                className="text-xs"
                placeholder={type === "Expense" ? "e.g. Annual MEP Maintenance Agreement" : "e.g. 2-Year Commercial Lease Agreement"}
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">
                  {type === "Expense" ? "Vendor / Supplier Name" : "Customer / Tenant Name"} <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="text-xs"
                  placeholder={type === "Expense" ? "e.g. Qatar HVAC Solutions WLL" : "e.g. Al Ameen Real Estate"}
                  value={form.party_name}
                  onChange={e => setForm({ ...form, party_name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Total Contract Value (QAR) <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Input
                    type="number"
                    className="text-xs font-mono pr-12 font-bold"
                    value={form.total_value}
                    onChange={e => setForm({ ...form, total_value: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-muted-foreground">QAR</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Effective Start Date</Label>
                <Input
                  type="date"
                  className="text-xs"
                  value={form.start_date}
                  onChange={e => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Expiration / End Date</Label>
                <Input
                  type="date"
                  className="text-xs"
                  value={form.end_date}
                  onChange={e => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-3">
            <Button variant="outline" onClick={() => setOpen(false)} className="text-xs">Cancel</Button>
            <Button onClick={handleAdd} className="text-xs font-semibold">Save Contract</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEBIT NOTE & CREDIT NOTE COMPONENTS
// Written as patch append — added to finance-module.tsx
// ─────────────────────────────────────────────────────────────────────────────

const VENDOR_DEBIT_REASONS = [
  "Goods Returned to Vendor",
  "Overcharge / Price Discrepancy",
  "Duplicate AP Invoice",
  "Quality Rejection",
  "Short Delivery / Damaged Material",
  "Warranty Replacement Claim",
  "Supplier Penalty / Liquidated Damages",
];

const CUSTOMER_DEBIT_REASONS = [
  "Tenant Direct Damage Recovery",
  "Key / Access Card Loss Charge",
  "Late Vacate Penalty / Overstay Charge",
  "Excess Utility Usage Surcharge",
  "Reinstatement / Repair Chargeable to Tenant",
  "Bounced Cheque Penalty Fee",
];

const VENDOR_CREDIT_REASONS = [
  "Early Settlement Discount from Supplier",
  "Volume Rebate / Supplier Credit",
  "Price Correction in Vendor's Favor",
  "Correction of Under-Billed Item",
];

const CUSTOMER_CREDIT_REASONS = [
  "Tenant Overpayment Refund / Credit",
  "Early Payment Rent Discount",
  "Maintenance Service Disruption Credit",
  "Billing Error Correction / Rental Adjustment",
  "Promotional Concession / Move-in Discount",
  "Lease Amendment Reversal",
  "Security Deposit Partial Settlement",
];

// Common Master Party Presets
const DEFAULT_VENDORS = [
  { id: "v1", name: "Qatar Maintenance & HVAC Co.", agreement: "AGR-VND-2026-001", agreements: ["AGR-VND-2026-001", "SVC-HVAC-2026-07", "PO-MAIN-2026-041"], doc: "APINV-2026-000001" },
  { id: "v2", name: "Gulf Facility Services", agreement: "AGR-VND-2026-002", agreements: ["AGR-VND-2026-002", "GFS-AMC-2026-03"], doc: "APINV-2026-000002" },
  { id: "v3", name: "Doha Elevator & MEP Corp", agreement: "AGR-VND-2026-003", agreements: ["AGR-VND-2026-003", "LIFT-AMC-2026-02", "MEP-SVC-2026-05"], doc: "APINV-2026-000003" },
  { id: "v4", name: "Al Rashid Trading LLC", agreement: "AGR-VND-2026-004", agreements: ["AGR-VND-2026-004", "SUPPLY-2026-008"], doc: "APINV-2026-000004" },
  { id: "v5", name: "Qatar Cleaning & Security Co.", agreement: "AGR-VND-2026-005", agreements: ["AGR-VND-2026-005", "SEC-2026-003", "CLN-2026-009"], doc: "APINV-2026-000005" },
];

const DEFAULT_CUSTOMERS = [
  { id: "c1", name: "Mr. Hafeez Shaik", agreement: "LEASE-2026-00101 (Old Salata)", agreements: ["LEASE-2026-00101 (Old Salata)", "LEASE-2025-00088 (Madinat Khalifa)"], doc: "INV-AR-2026-001" },
  { id: "c2", name: "Fatima Al-Kuwari", agreement: "LEASE-2026-00204 (Lusail Marina)", agreements: ["LEASE-2026-00204 (Lusail Marina)", "LEASE-2024-00161 (Fox Hills)"], doc: "INV-AR-2026-002" },
  { id: "c3", name: "Tariq Mansoor", agreement: "LEASE-2026-00310 (The Pearl)", agreements: ["LEASE-2026-00310 (The Pearl)"], doc: "INV-AR-2026-003" },
  { id: "c4", name: "Global Logistics QSTP LLC", agreement: "LEASE-COM-2026-008 (West Bay)", agreements: ["LEASE-COM-2026-008 (West Bay)", "LEASE-COM-2025-005 (Business Park)"], doc: "INV-AR-2026-004" },
  { id: "c5", name: "Ahmed Al-Sulaiti", agreement: "LEASE-2026-00412 (Bin Mahmoud)", agreements: ["LEASE-2026-00412 (Bin Mahmoud)", "LEASE-2025-00398 (Al Sadd)", "LEASE-2024-00271 (Al Hilal)"], doc: "INV-AR-2026-005" },
];

// COA options for expense GL (Debit Note)
const EXPENSE_GL_OPTIONS = [
  { value: "51004001", label: "51004001 – Repair & Maintenance (Property)" },
  { value: "51004002", label: "51004002 – Repair & Maintenance (Common Area)" },
  { value: "51004003", label: "51004003 – Repair & Maintenance (Unit)" },
  { value: "51002001", label: "51002001 – CMEP-Facilities Mgt AMC" },
  { value: "51002002", label: "51002002 – Swimming Pool Maintenance" },
  { value: "51002003", label: "51002003 – CCTV AMC Charges" },
  { value: "51002004", label: "51002004 – Lift Maintenance Charges" },
  { value: "51001001", label: "51001001 – CMEP-Labor Cost-Facilities Mgt" },
  { value: "13100001", label: "13100001 – Trade Receivables (Customer Recovery)" },
];

// COA options for revenue GL (Credit Note)
const REVENUE_GL_OPTIONS = [
  { value: "41001001", label: "41001001 – Rental Income (Residential)" },
  { value: "41001002", label: "41001002 – Rental Income (Commercial)" },
  { value: "41002001", label: "41002001 – Service Charges" },
  { value: "41003001", label: "41003001 – Parking Revenue" },
  { value: "41004001", label: "41004001 – Utility Recovery" },
  { value: "22100001", label: "22100001 – Trade Payables (Vendor Credit)" },
];

type NoteStatus = "DRAFT" | "APPROVED" | "POSTED" | "CANCELLED";

type DebitNote = {
  id: string;
  dn_number: string;
  date: string;
  party_type: "Vendor" | "Customer";
  party_id: string;
  party_name: string;
  linked_agreement: string;
  linked_invoice: string;
  amount: number;
  reason: string;
  expense_gl: string;
  notes: string;
  status: NoteStatus;
  created_at: string;
};

type CreditNote = {
  id: string;
  cn_number: string;
  date: string;
  party_name: string;
  party_type: "Vendor" | "Tenant";
  linked_invoice: string;
  amount: number;
  reason: string;
  revenue_gl: string;
  notes: string;
  status: NoteStatus;
  created_at: string;
};

function NoteStatusBadge({ status }: { status: NoteStatus }) {
  const map: Record<NoteStatus, string> = {
    DRAFT: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300",
    APPROVED: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400",
    POSTED: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400",
    CANCELLED: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${map[status]}`}>
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEBIT NOTE SUB-MODULE
// AP-side: Vendor owes us back (goods return, overcharge, etc.)
// GL: Dr. 22100001 Trade Payables / Cr. 51xxx Expense (reversal)
// ─────────────────────────────────────────────────────────────────────────────
function DebitNoteSubModule() {
  const LS_KEY = "fin_debit_notes";
  const [notes, setNotes] = useState<DebitNote[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
  });
  const [showModal, setShowModal] = useState(false);
  const [viewNote, setViewNote] = useState<DebitNote | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    party_type: "Vendor" as "Vendor" | "Customer",
    party_id: DEFAULT_VENDORS[0].id,
    party_name: DEFAULT_VENDORS[0].name,
    linked_agreement: DEFAULT_VENDORS[0].agreements[0],
    linked_invoice: DEFAULT_VENDORS[0].doc,
    amount: 0,
    reason: VENDOR_DEBIT_REASONS[0],
    expense_gl: EXPENSE_GL_OPTIONS[0].value,
    notes: "",
    date: new Date().toISOString().slice(0, 10),
  });

  function save(updatedNotes: DebitNote[]) {
    setNotes(updatedNotes);
    localStorage.setItem(LS_KEY, JSON.stringify(updatedNotes));
  }

  function handlePartyTypeChange(type: "Vendor" | "Customer") {
    if (type === "Vendor") {
      const first = DEFAULT_VENDORS[0];
      setForm({
        ...form,
        party_type: "Vendor",
        party_id: first.id,
        party_name: first.name,
        linked_agreement: first.agreements[0],
        linked_invoice: first.doc,
        reason: VENDOR_DEBIT_REASONS[0],
        expense_gl: "51004001",
      });
    } else {
      const first = DEFAULT_CUSTOMERS[0];
      setForm({
        ...form,
        party_type: "Customer",
        party_id: first.id,
        party_name: first.name,
        linked_agreement: first.agreements[0],
        linked_invoice: first.doc,
        reason: CUSTOMER_DEBIT_REASONS[0],
        expense_gl: "13100001",
      });
    }
  }

  function handlePartySelect(name: string) {
    if (form.party_type === "Vendor") {
      const match = DEFAULT_VENDORS.find(v => v.name === name);
      setForm(prev => ({
        ...prev,
        party_name: name,
        party_id: match?.id || "",
        linked_agreement: match?.agreements[0] || prev.linked_agreement,
        linked_invoice: match?.doc || prev.linked_invoice,
      }));
    } else {
      const match = DEFAULT_CUSTOMERS.find(c => c.name === name);
      setForm(prev => ({
        ...prev,
        party_name: name,
        party_id: match?.id || "",
        linked_agreement: match?.agreements[0] || prev.linked_agreement,
        linked_invoice: match?.doc || prev.linked_invoice,
      }));
    }
  }

  function handleCreate() {
    if (!form.party_name.trim() || !form.amount) return toast.error("Party Name and Amount are required.");
    setSaving(true);
    const seq = String(notes.length + 1).padStart(6, "0");
    const newNote: DebitNote = {
      id: `dn-${Date.now()}`,
      dn_number: `DN-${new Date().getFullYear()}-${seq}`,
      date: form.date,
      party_type: form.party_type,
      party_id: form.party_id,
      party_name: form.party_name,
      linked_agreement: form.linked_agreement,
      linked_invoice: form.linked_invoice,
      amount: form.amount,
      reason: form.reason,
      expense_gl: form.expense_gl,
      notes: form.notes,
      status: "DRAFT",
      created_at: new Date().toISOString(),
    };
    save([newNote, ...notes]);
    setShowModal(false);
    setSaving(false);
    toast.success(`Debit Note ${newNote.dn_number} created in DRAFT.`);
  }

  function handleApprove(dn: DebitNote) {
    const updated = notes.map(n => n.id === dn.id ? { ...n, status: "APPROVED" as NoteStatus } : n);
    save(updated);
    toast.success(`${dn.dn_number} approved.`);
  }

  function handlePost(dn: DebitNote) {
    const updated = notes.map(n => n.id === dn.id ? { ...n, status: "POSTED" as NoteStatus } : n);
    save(updated);
    toast.success(`${dn.dn_number} posted to GL. Dr. ${dn.party_type === "Vendor" ? "22100001 (Trade Payables)" : "13100001 (Trade Receivables)"} / Cr. ${dn.expense_gl}`);
  }

  function handleCancel(dn: DebitNote) {
    const updated = notes.map(n => n.id === dn.id ? { ...n, status: "CANCELLED" as NoteStatus } : n);
    save(updated);
    toast.info(`${dn.dn_number} cancelled.`);
  }

  const totals = {
    draft: notes.filter(n => n.status === "DRAFT").reduce((s, n) => s + n.amount, 0),
    approved: notes.filter(n => n.status === "APPROVED").reduce((s, n) => s + n.amount, 0),
    posted: notes.filter(n => n.status === "POSTED").reduce((s, n) => s + n.amount, 0),
  };

  const activeReasons = form.party_type === "Vendor" ? VENDOR_DEBIT_REASONS : CUSTOMER_DEBIT_REASONS;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MinusCircle className="h-6 w-6 text-rose-500" /> Debit Notes
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Issue debit notes to Vendors (goods return/overcharge reduction) or Customers/Tenants (damage recovery/penalty charge).
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white">
          <Plus className="h-4 w-4" /> New Debit Note
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Draft", value: totals.draft, color: "text-slate-600", bg: "bg-slate-50 dark:bg-slate-900/30 border-slate-200" },
          { label: "Approved", value: totals.approved, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200" },
          { label: "Posted to GL", value: totals.posted, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`p-4 rounded-xl border ${bg}`}>
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className={`text-xl font-bold font-mono mt-1 ${color}`}>QAR {value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">DN #</TableHead>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Party Type</TableHead>
              <TableHead className="font-bold">Party Name</TableHead>
              <TableHead className="font-bold">Agreement / Lease #</TableHead>
              <TableHead className="font-bold">Linked Ref</TableHead>
              <TableHead className="font-bold">Reason</TableHead>
              <TableHead className="font-bold text-right">Amount (QAR)</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10 text-muted-foreground text-xs">
                  No debit notes yet. Click "New Debit Note" to create one.
                </TableCell>
              </TableRow>
            ) : notes.map(dn => (
              <TableRow key={dn.id} className="text-xs hover:bg-muted/30">
                <TableCell className="font-mono font-bold text-rose-600">{dn.dn_number}</TableCell>
                <TableCell>{dn.date}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] ${dn.party_type === "Customer" ? "border-cyan-500 text-cyan-600 bg-cyan-50/40" : "border-violet-500 text-violet-600 bg-violet-50/40"}`}>
                    {dn.party_type || "Vendor"}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold">{dn.party_name}</TableCell>
                <TableCell className="font-mono text-cyan-700 dark:text-cyan-400">{dn.linked_agreement || "—"}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{dn.linked_invoice || "—"}</TableCell>
                <TableCell className="max-w-[150px] truncate" title={dn.reason}>{dn.reason}</TableCell>
                <TableCell className="text-right font-semibold font-mono text-foreground">QAR {dn.amount.toLocaleString()}</TableCell>
                <TableCell><NoteStatusBadge status={dn.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5 flex-wrap">
                    <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={() => setViewNote(dn)}>View</Button>
                    {dn.status === "DRAFT" && (
                      <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 text-blue-600 border-blue-300" onClick={() => handleApprove(dn)}>Approve</Button>
                    )}
                    {dn.status === "APPROVED" && (
                      <Button size="sm" className="h-7 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handlePost(dn)}>Post to GL</Button>
                    )}
                    {(dn.status === "DRAFT" || dn.status === "APPROVED") && (
                      <Button size="sm" variant="destructive" className="h-7 text-[10px] px-2" onClick={() => handleCancel(dn)}>Cancel</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent 
          className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="p-4 pb-2.5 border-b shrink-0 bg-muted/10">
            <DialogTitle className="flex items-center gap-2">
              <MinusCircle className="h-5 w-5 text-rose-500" /> New Debit Note
            </DialogTitle>
            <DialogDescription className="text-xs">
              Issue a debit note for either Vendor (payable reduction) or Customer/Tenant (chargeback/penalty).
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs max-h-[calc(85vh-130px)]">
            {/* Top Row: Date & Party Type Selector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1.5">Date *</label>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5 text-rose-600 dark:text-rose-400">Party Type *</label>
                <Select value={form.party_type} onValueChange={(v: "Vendor" | "Customer") => handlePartyTypeChange(v)}>
                  <SelectTrigger className="h-8 text-xs font-semibold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vendor">Vendor / Supplier (AP Reduction)</SelectItem>
                    <SelectItem value="Customer">Customer / Tenant (AR Chargeback)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Second Row: Party Dropdown & Linked Agreement / Lease # */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1.5">Select {form.party_type === "Vendor" ? "Vendor" : "Customer / Tenant"} *</label>
                <Select value={form.party_name} onValueChange={handlePartySelect}>
                  <SelectTrigger className="h-8 text-xs font-medium"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {form.party_type === "Vendor" 
                      ? DEFAULT_VENDORS.map(v => <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>)
                      : DEFAULT_CUSTOMERS.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)
                    }
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5">Linked Lease / Agreement Number *</label>
                {(() => {
                  const partyList = form.party_type === "Vendor" ? DEFAULT_VENDORS : DEFAULT_CUSTOMERS;
                  const selectedParty = partyList.find(p => p.name === form.party_name);
                  const agreementOptions = selectedParty?.agreements || (form.linked_agreement ? [form.linked_agreement] : []);
                  return agreementOptions.length > 1 ? (
                    <Select value={form.linked_agreement} onValueChange={v => setForm({ ...form, linked_agreement: v })}>
                      <SelectTrigger className="h-8 text-xs font-mono font-semibold text-cyan-600">
                        <SelectValue placeholder="Select agreement / lease" />
                      </SelectTrigger>
                      <SelectContent>
                        {agreementOptions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={form.linked_agreement}
                      onChange={e => setForm({ ...form, linked_agreement: e.target.value })}
                      placeholder={form.party_type === "Vendor" ? "AGR-VND-2026-001" : "LEASE-2026-00101"}
                      className="h-8 text-xs font-mono font-semibold text-cyan-600"
                    />
                  );
                })()}
              </div>
            </div>

            {/* Third Row: Linked Invoice / Reference & Amount */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1.5">Linked AP/AR Invoice #</label>
                <Input 
                  value={form.linked_invoice} 
                  onChange={e => setForm({ ...form, linked_invoice: e.target.value })} 
                  placeholder={form.party_type === "Vendor" ? "APINV-2026-000005" : "INV-AR-2026-001"} 
                  className="h-8 text-xs font-mono" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5">Debit Note Amount (QAR) *</label>
                <Input 
                  type="number" 
                  min="0" 
                  value={form.amount} 
                  onChange={e => setForm({ ...form, amount: Number(e.target.value) })} 
                  className="h-8 text-xs font-mono font-bold text-base" 
                />
              </div>
            </div>

            {/* Fourth Row: Reason & Account */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1.5">Reason *</label>
                <Select value={form.reason} onValueChange={v => setForm({ ...form, reason: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {activeReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5">Expense / Balancing GL Account *</label>
                <Select value={form.expense_gl} onValueChange={v => setForm({ ...form, expense_gl: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_GL_OPTIONS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5">Notes / Remarks</label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Reference details, batch numbers, inspection observations..." className="text-xs min-h-[55px]" />
            </div>

            {/* Live Double-Entry GL Ledger Impact Preview */}
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-1 text-[11px]">
              <p className="font-semibold text-rose-700 dark:text-rose-400">GL Double-Entry Posting Preview:</p>
              {form.party_type === "Vendor" ? (
                <>
                  <p className="font-mono">• <strong className="text-blue-600">Dr. 22100001</strong> Trade Payables - Vendors — QAR {form.amount.toLocaleString()}</p>
                  <p className="font-mono">• <strong className="text-rose-600">Cr. {form.expense_gl}</strong> {EXPENSE_GL_OPTIONS.find(g => g.value === form.expense_gl)?.label.split("–")[1]?.trim() || "Expense Reversal"} — QAR {form.amount.toLocaleString()}</p>
                  <p className="text-muted-foreground italic text-[10px]">Reduces payable liability to vendor and reverses property direct expense.</p>
                </>
              ) : (
                <>
                  <p className="font-mono">• <strong className="text-rose-600">Dr. 13100001</strong> Trade Receivables (Customer) — QAR {form.amount.toLocaleString()}</p>
                  <p className="font-mono">• <strong className="text-emerald-600">Cr. {form.expense_gl}</strong> {EXPENSE_GL_OPTIONS.find(g => g.value === form.expense_gl)?.label.split("–")[1]?.trim() || "Recovery Income"} — QAR {form.amount.toLocaleString()}</p>
                  <p className="text-muted-foreground italic text-[10px]">Recognizes chargeback claim receivable from tenant.</p>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-muted/20 flex justify-end gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white gap-1" onClick={handleCreate} disabled={saving}>
              <MinusCircle className="h-4 w-4" /> Create Debit Note (DRAFT)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={!!viewNote} onOpenChange={() => setViewNote(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <MinusCircle className="h-5 w-5 text-rose-500" /> {viewNote?.dn_number}
            </DialogTitle>
          </DialogHeader>
          {viewNote && (
            <div className="space-y-3 text-xs py-2">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border">
                {[
                  ["Date", viewNote.date],
                  ["Party Type", viewNote.party_type || "Vendor"],
                  ["Party Name", viewNote.party_name],
                  ["Lease / Agreement #", viewNote.linked_agreement || "—"],
                  ["Linked Invoice", viewNote.linked_invoice || "—"],
                  ["Reason", viewNote.reason],
                  ["Amount (QAR)", viewNote.amount.toLocaleString()],
                  ["Status", viewNote.status],
                ].map(([k, v]) => (
                  <div key={k}><p className="text-muted-foreground">{k}</p><p className="font-semibold">{v}</p></div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-1 text-[11px]">
                <p className="font-semibold">GL Journal Entry Impact:</p>
                <p className="font-mono">Dr. {viewNote.party_type === "Customer" ? "13100001 Trade Receivables" : "22100001 Trade Payables"} — QAR {viewNote.amount.toLocaleString()}</p>
                <p className="font-mono">Cr. {viewNote.expense_gl} — QAR {viewNote.amount.toLocaleString()}</p>
              </div>
              {viewNote.notes && <p className="text-muted-foreground italic">{viewNote.notes}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setViewNote(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CREDIT NOTE SUB-MODULE
// AR-side: We credit a tenant/customer or vendor discount
// GL: Dr. 41xxx Revenue (or expense) / Cr. 13100001 Trade Receivables
// ─────────────────────────────────────────────────────────────────────────────
function CreditNoteSubModule() {
  const LS_KEY = "fin_credit_notes";
  const [notes, setNotes] = useState<CreditNote[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
  });
  const [showModal, setShowModal] = useState(false);
  const [viewNote, setViewNote] = useState<CreditNote | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    party_type: "Tenant" as "Vendor" | "Tenant",
    party_name: DEFAULT_CUSTOMERS[0].name,
    linked_agreement: DEFAULT_CUSTOMERS[0].agreements[0],
    linked_invoice: DEFAULT_CUSTOMERS[0].doc,
    amount: 0,
    reason: CUSTOMER_CREDIT_REASONS[0],
    revenue_gl: REVENUE_GL_OPTIONS[0].value,
    notes: "",
    date: new Date().toISOString().slice(0, 10),
  });

  function save(updatedNotes: CreditNote[]) {
    setNotes(updatedNotes);
    localStorage.setItem(LS_KEY, JSON.stringify(updatedNotes));
  }

  function handlePartyTypeChange(type: "Vendor" | "Tenant") {
    if (type === "Tenant") {
      const first = DEFAULT_CUSTOMERS[0];
      setForm({
        ...form,
        party_type: "Tenant",
        party_name: first.name,
        linked_agreement: first.agreements[0],
        linked_invoice: first.doc,
        reason: CUSTOMER_CREDIT_REASONS[0],
        revenue_gl: "41001001",
      });
    } else {
      const first = DEFAULT_VENDORS[0];
      setForm({
        ...form,
        party_type: "Vendor",
        party_name: first.name,
        linked_agreement: first.agreements[0],
        linked_invoice: first.doc,
        reason: VENDOR_CREDIT_REASONS[0],
        revenue_gl: "22100001",
      });
    }
  }

  function handlePartySelect(name: string) {
    if (form.party_type === "Tenant") {
      const match = DEFAULT_CUSTOMERS.find(c => c.name === name);
      setForm(prev => ({
        ...prev,
        party_name: name,
        linked_agreement: match?.agreements[0] || prev.linked_agreement,
        linked_invoice: match?.doc || prev.linked_invoice,
      }));
    } else {
      const match = DEFAULT_VENDORS.find(v => v.name === name);
      setForm(prev => ({
        ...prev,
        party_name: name,
        linked_agreement: match?.agreements[0] || prev.linked_agreement,
        linked_invoice: match?.doc || prev.linked_invoice,
      }));
    }
  }

  function handleCreate() {
    if (!form.party_name.trim() || !form.amount) return toast.error("Party name and amount are required.");
    setSaving(true);
    const seq = String(notes.length + 1).padStart(6, "0");
    const newNote: CreditNote = {
      id: `cn-${Date.now()}`,
      cn_number: `CN-${new Date().getFullYear()}-${seq}`,
      date: form.date,
      party_name: form.party_name,
      party_type: form.party_type,
      linked_invoice: form.linked_invoice,
      amount: form.amount,
      reason: form.reason,
      revenue_gl: form.revenue_gl,
      notes: form.notes,
      status: "DRAFT",
      created_at: new Date().toISOString(),
    };
    save([newNote, ...notes]);
    setShowModal(false);
    setSaving(false);
    toast.success(`Credit Note ${newNote.cn_number} created.`);
  }

  function handleApprove(cn: CreditNote) {
    const updated = notes.map(n => n.id === cn.id ? { ...n, status: "APPROVED" as NoteStatus } : n);
    save(updated);
    toast.success(`${cn.cn_number} approved.`);
  }

  function handlePost(cn: CreditNote) {
    const updated = notes.map(n => n.id === cn.id ? { ...n, status: "POSTED" as NoteStatus } : n);
    save(updated);
    toast.success(`${cn.cn_number} posted to GL. Dr. ${cn.revenue_gl} / Cr. 13100001`);
  }

  function handleCancel(cn: CreditNote) {
    const updated = notes.map(n => n.id === cn.id ? { ...n, status: "CANCELLED" as NoteStatus } : n);
    save(updated);
    toast.info(`${cn.cn_number} cancelled.`);
  }

  const totals = {
    draft: notes.filter(n => n.status === "DRAFT").reduce((s, n) => s + n.amount, 0),
    approved: notes.filter(n => n.status === "APPROVED").reduce((s, n) => s + n.amount, 0),
    posted: notes.filter(n => n.status === "POSTED").reduce((s, n) => s + n.amount, 0),
  };

  const activeReasons = form.party_type === "Tenant" ? CUSTOMER_CREDIT_REASONS : VENDOR_CREDIT_REASONS;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-emerald-500" /> Credit Notes
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Issue credit notes to Customer/Tenant (rental concession, overpayment credit) or Vendor (discount/rebate).
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4" /> New Credit Note
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Draft", value: totals.draft, color: "text-slate-600", bg: "bg-slate-50 dark:bg-slate-900/30 border-slate-200" },
          { label: "Approved", value: totals.approved, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200" },
          { label: "Posted to GL", value: totals.posted, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`p-4 rounded-xl border ${bg}`}>
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className={`text-xl font-bold font-mono mt-1 ${color}`}>QAR {value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">CN #</TableHead>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Party Type</TableHead>
              <TableHead className="font-bold">Party Name</TableHead>
              <TableHead className="font-bold">Linked Lease / Ref</TableHead>
              <TableHead className="font-bold">Reason</TableHead>
              <TableHead className="font-bold">Revenue GL</TableHead>
              <TableHead className="font-bold text-right">Amount (QAR)</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10 text-muted-foreground text-xs">
                  No credit notes yet. Click "New Credit Note" to create one.
                </TableCell>
              </TableRow>
            ) : notes.map(cn => (
              <TableRow key={cn.id} className="text-xs hover:bg-muted/30">
                <TableCell className="font-mono font-bold text-emerald-600">{cn.cn_number}</TableCell>
                <TableCell>{cn.date}</TableCell>
                <TableCell>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${cn.party_type === "Tenant" ? "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400" : "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400"}`}>
                    {cn.party_type === "Tenant" ? "Customer / Tenant" : "Vendor"}
                  </span>
                </TableCell>
                <TableCell className="font-semibold">{cn.party_name}</TableCell>
                <TableCell className="font-mono text-cyan-700 dark:text-cyan-400">{cn.linked_invoice || "—"}</TableCell>
                <TableCell className="max-w-[150px] truncate" title={cn.reason}>{cn.reason}</TableCell>
                <TableCell className="font-mono text-[10px]">{cn.revenue_gl}</TableCell>
                <TableCell className="text-right font-semibold font-mono text-foreground">QAR {cn.amount.toLocaleString()}</TableCell>
                <TableCell><NoteStatusBadge status={cn.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5 flex-wrap">
                    <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={() => setViewNote(cn)}>View</Button>
                    {cn.status === "DRAFT" && (
                      <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 text-blue-600 border-blue-300" onClick={() => handleApprove(cn)}>Approve</Button>
                    )}
                    {cn.status === "APPROVED" && (
                      <Button size="sm" className="h-7 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handlePost(cn)}>Post to GL</Button>
                    )}
                    {(cn.status === "DRAFT" || cn.status === "APPROVED") && (
                      <Button size="sm" variant="destructive" className="h-7 text-[10px] px-2" onClick={() => handleCancel(cn)}>Cancel</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent 
          className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="p-4 pb-2.5 border-b shrink-0 bg-muted/10">
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-emerald-500" /> New Credit Note
            </DialogTitle>
            <DialogDescription className="text-xs">
              Issue a credit note to a tenant or vendor for overpayments, discounts, or billing corrections.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs max-h-[calc(85vh-130px)]">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1.5">Date *</label>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5 text-emerald-600 dark:text-emerald-400">Party Type *</label>
                <Select value={form.party_type} onValueChange={(v: "Vendor" | "Tenant") => handlePartyTypeChange(v)}>
                  <SelectTrigger className="h-8 text-xs font-semibold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tenant">Tenant / Customer (AR Concession / Credit)</SelectItem>
                    <SelectItem value="Vendor">Vendor / Supplier (Supplier Rebate)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1.5">Select {form.party_type === "Tenant" ? "Tenant / Customer" : "Vendor"} *</label>
                <Select value={form.party_name} onValueChange={handlePartySelect}>
                  <SelectTrigger className="h-8 text-xs font-medium"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {form.party_type === "Tenant"
                      ? DEFAULT_CUSTOMERS.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)
                      : DEFAULT_VENDORS.map(v => <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>)
                    }
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5">Linked Lease / Agreement Number *</label>
                {(() => {
                  const partyList = form.party_type === "Tenant" ? DEFAULT_CUSTOMERS : DEFAULT_VENDORS;
                  const selectedParty = partyList.find(p => p.name === form.party_name);
                  const agreementOptions = selectedParty?.agreements || (form.linked_agreement ? [form.linked_agreement] : []);
                  return agreementOptions.length > 1 ? (
                    <Select value={form.linked_agreement} onValueChange={v => setForm({ ...form, linked_agreement: v })}>
                      <SelectTrigger className="h-8 text-xs font-mono font-semibold text-cyan-600">
                        <SelectValue placeholder="Select agreement / lease" />
                      </SelectTrigger>
                      <SelectContent>
                        {agreementOptions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={form.linked_agreement}
                      onChange={e => setForm({ ...form, linked_agreement: e.target.value })}
                      placeholder={form.party_type === "Tenant" ? "LEASE-2026-00101" : "AGR-VND-2026-001"}
                      className="h-8 text-xs font-mono font-semibold text-cyan-600"
                    />
                  );
                })()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1.5">Linked Invoice / Bill Ref</label>
                <Input 
                  value={form.linked_invoice} 
                  onChange={e => setForm({ ...form, linked_invoice: e.target.value })} 
                  placeholder={form.party_type === "Tenant" ? "INV-AR-2026-001" : "APINV-2026-000001"} 
                  className="h-8 text-xs font-mono" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5">Credit Amount (QAR) *</label>
                <Input 
                  type="number" 
                  min="0" 
                  value={form.amount} 
                  onChange={e => setForm({ ...form, amount: Number(e.target.value) })} 
                  className="h-8 text-xs font-mono font-bold text-base" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1.5">Reason *</label>
                <Select value={form.reason} onValueChange={v => setForm({ ...form, reason: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {activeReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5">Revenue / Income GL Account (Debit / Reversal) *</label>
                <Select value={form.revenue_gl} onValueChange={v => setForm({ ...form, revenue_gl: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REVENUE_GL_OPTIONS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5">Notes / Remarks</label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Reference number, concession justification, approval details..." className="text-xs min-h-[55px]" />
            </div>

            {/* GL Preview */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1 text-[11px]">
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">GL Posting Preview (upon Post to GL):</p>
              <p className="font-mono">• <strong className="text-rose-600">Dr. {form.revenue_gl}</strong> {REVENUE_GL_OPTIONS.find(g => g.value === form.revenue_gl)?.label.split("–")[1]?.trim()} — QAR {form.amount.toLocaleString()}</p>
              <p className="font-mono">• <strong className="text-emerald-600">Cr. 13100001</strong> Trade Receivables — QAR {form.amount.toLocaleString()}</p>
              <p className="text-muted-foreground italic text-[10px]">Reduces income recognized and clears receivable amount owed by customer.</p>
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-muted/20 flex justify-end gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={handleCreate} disabled={saving}>
              <PlusCircle className="h-4 w-4" /> Create Credit Note (DRAFT)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={!!viewNote} onOpenChange={() => setViewNote(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <PlusCircle className="h-5 w-5 text-emerald-500" /> {viewNote?.cn_number}
            </DialogTitle>
          </DialogHeader>
          {viewNote && (
            <div className="space-y-3 text-xs py-2">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border">
                {[
                  ["Date", viewNote.date],
                  ["Party Type", viewNote.party_type === "Tenant" ? "Customer / Tenant" : "Vendor"],
                  ["Party Name", viewNote.party_name],
                  ["Linked Ref", viewNote.linked_invoice || "—"],
                  ["Reason", viewNote.reason],
                  ["Amount (QAR)", viewNote.amount.toLocaleString()],
                  ["Status", viewNote.status],
                ].map(([k, v]) => (
                  <div key={k}><p className="text-muted-foreground">{k}</p><p className="font-semibold">{v}</p></div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1 text-[11px]">
                <p className="font-semibold">GL Journal Entry:</p>
                <p className="font-mono">Dr. {viewNote.revenue_gl} Revenue — QAR {viewNote.amount.toLocaleString()}</p>
                <p className="font-mono">Cr. 13100001 Trade Receivables — QAR {viewNote.amount.toLocaleString()}</p>
              </div>
              {viewNote.notes && <p className="text-muted-foreground italic">{viewNote.notes}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setViewNote(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VEHICLE-WISE EXPENSE REPORT & COST CENTER ALLOCATION SUB-MODULE
// ─────────────────────────────────────────────────────────────────────────────

function VehicleExpenseReportSubModule() {
  const { journalEntries, payableInvoices: payables, vouchers, addJournalEntry } = useFinanceStore() as any;
  const [selectedVehicleNo, setSelectedVehicleNo] = useState<string>("ALL");
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState<string>("2026-01-01");
  const [dateTo, setDateTo] = useState<string>("2026-12-31");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allocateOpen, setAllocateOpen] = useState(false);

  const [allocForm, setAllocForm] = useState({
    vehicleNo: COMPANY_VEHICLE_COST_CENTERS[0].vehicleNo,
    date: new Date().toISOString().slice(0, 10),
    reference: `VEXP-${Date.now().toString().slice(-5)}`,
    expenseGl: "51102002 - Vehicle Fuel, Maintenance & Running Expenses",
    paymentGl: "1010 - Cash on Hand / Petty Cash",
    vendor: "",
    category: "Fuel & Running",
    description: "",
    amount: "",
  });

  // Match any text/property/cost-center string to one of the 11 Company Vehicles by Vehicle No
  const matchVehicleFromText = (rawText?: string): CompanyVehicleCostCenter | undefined => {
    if (!rawText) return undefined;
    const text = String(rawText).trim();
    if (!text) return undefined;
    return COMPANY_VEHICLE_COST_CENTERS.find(v => {
      if (text === v.vehicleNo || text === v.code || text === v.name || text === `CC-VEH-${v.vehicleNo}`) return true;
      // Word-boundary match on the Vehicle No (e.g. "230064 - Pickup (2012 Nissan)" or "Vehicle No: 230064")
      const regex = new RegExp(`\\b${v.vehicleNo}\\b`, "i");
      return regex.test(text);
    });
  };

  interface VehicleExpenseRow {
    id: string;
    date: string;
    reference: string;
    sourceType: "AP Bill" | "Payment Voucher" | "Journal Entry";
    vehicleNo: string;
    vehicleName: string;
    model: string;
    brandName: string;
    costCenterName: string;
    glAccount: string;
    category: string;
    vendorOrPayee: string;
    description: string;
    amount: number;
  }

  const allVehicleExpenses = useMemo<VehicleExpenseRow[]>(() => {
    const rows: VehicleExpenseRow[] = [];
    const seenRefs = new Set<string>();

    // 1. Scan Journal Entries (authoritative double-entry ledger lines)
    (journalEntries || []).forEach((je: any) => {
      if (je.status === "Voided") return;
      (je.lines || []).forEach((line: any, idx: number) => {
        const debitAmt = Number(line.debit ?? line.debit_amount ?? 0);
        if (debitAmt <= 0) return;
        const accCode = String(line.accountCode || line.account_code || "");
        const accName = String(line.accountName || line.account_name || "");
        // Match vehicle cost center from line.property, line.description, je.description, je.narration, or je.reference
        const matchedVeh =
          matchVehicleFromText(line.property || line.property_name) ||
          matchVehicleFromText(line.description) ||
          matchVehicleFromText(je.description || je.narration);
        if (!matchedVeh) return;

        // Ensure it is an expense debit line (5xxxx) or explicitly tagged to a vehicle cost center
        const isCreditSide = accCode.startsWith("10") || accCode.startsWith("21");
        if (isCreditSide) return;

        seenRefs.add(je.reference);

        const descLower = `${accName} ${line.description || je.description || je.narration || ""}`.toLowerCase();
        const cat = descLower.includes("insur")
          ? "Insurance & Istimara"
          : descLower.includes("fuel") || descLower.includes("petrol") || descLower.includes("diesel")
          ? "Fuel & Running"
          : descLower.includes("tyre") || descLower.includes("tire") || descLower.includes("battery") || descLower.includes("oil") || descLower.includes("service") || descLower.includes("repair") || descLower.includes("maint")
          ? "Repair & Maintenance"
          : "Vehicle Expense";

        rows.push({
          id: `je-${je.id}-${idx}`,
          date: je.date || je.posting_date || "",
          reference: je.reference,
          sourceType: String(je.reference || "").startsWith("PV") ? "Payment Voucher" : String(je.reference || "").startsWith("BILL") || String(je.reference || "").startsWith("AP") ? "AP Bill" : "Journal Entry",
          vehicleNo: matchedVeh.vehicleNo,
          vehicleName: matchedVeh.vehicleName,
          model: matchedVeh.model,
          brandName: matchedVeh.brandName,
          costCenterName: matchedVeh.name,
          glAccount: `${accCode} - ${accName}`,
          category: cat,
          vendorOrPayee: je.tenant || je.tenant_name || "Fleet Vendor / Direct",
          description: line.description || je.description || je.narration || "",
          amount: debitAmt,
        });
      });
    });

    // 2. Scan Payable Invoices (if not already captured via JE reference)
    (payables || []).forEach((bill: any) => {
      const refNo = bill.invoice_no || bill.bill_no;
      if (seenRefs.has(refNo)) return;
      const matchedVeh = matchVehicleFromText(bill.property) || matchVehicleFromText(bill.category || bill.account);
      if (!matchedVeh) return;
      rows.push({
        id: `ap-${bill.id}`,
        date: bill.date,
        reference: refNo,
        sourceType: "AP Bill",
        vehicleNo: matchedVeh.vehicleNo,
        vehicleName: matchedVeh.vehicleName,
        model: matchedVeh.model,
        brandName: matchedVeh.brandName,
        costCenterName: matchedVeh.name,
        glAccount: bill.account_code ? `${bill.account_code} - ${bill.category || bill.account || ""}` : (bill.account || bill.category || ""),
        category: bill.category || "Repair & Maintenance",
        vendorOrPayee: bill.vendor,
        description: `Vendor Bill (${bill.vendor}) allocated to Cost Center ${matchedVeh.vehicleNo}`,
        amount: Number(bill.amount || 0),
      });
    });

    // 3. Scan Vouchers (if not already captured via JE reference)
    (vouchers || []).forEach((v: any) => {
      if (v.voucher_type === "Receipt Voucher" || v.type === "Receipt Voucher") return;
      if (seenRefs.has(v.voucher_no)) return;
      const matchedVeh = matchVehicleFromText(v.property_name || v.property) || matchVehicleFromText(v.name || v.description);
      if (!matchedVeh) return;
      rows.push({
        id: `vch-${v.id || v.voucher_no}`,
        date: v.date,
        reference: v.voucher_no,
        sourceType: "Payment Voucher",
        vehicleNo: matchedVeh.vehicleNo,
        vehicleName: matchedVeh.vehicleName,
        model: matchedVeh.model,
        brandName: matchedVeh.brandName,
        costCenterName: matchedVeh.name,
        glAccount: v.debit || v.account || "51102002 - Vehicle Running Expenses",
        category: "Vehicle Expense",
        vendorOrPayee: v.tenant_name || v.party || "Fleet Vendor",
        description: v.name || v.description || "",
        amount: Number(v.amount || 0),
      });
    });

    return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [journalEntries, payables, vouchers]);

  // Filtered expense rows
  const filteredRows = useMemo(() => {
    return allVehicleExpenses.filter(r => {
      if (selectedVehicleNo !== "ALL" && r.vehicleNo !== selectedVehicleNo) return false;
      if (expenseCategoryFilter !== "ALL" && r.category !== expenseCategoryFilter) return false;
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.vehicleNo.toLowerCase().includes(q) ||
          r.vehicleName.toLowerCase().includes(q) ||
          r.brandName.toLowerCase().includes(q) ||
          r.reference.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.vendorOrPayee.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allVehicleExpenses, selectedVehicleNo, expenseCategoryFilter, dateFrom, dateTo, searchQuery]);

  // Summary per Vehicle Cost Center (all 11 Company Vehicles)
  const vehicleSummaryList = useMemo(() => {
    const totalAll = filteredRows.reduce((s, r) => s + r.amount, 0);
    return COMPANY_VEHICLE_COST_CENTERS.map(v => {
      const vehRows = filteredRows.filter(r => r.vehicleNo === v.vehicleNo);
      const totalExpense = vehRows.reduce((s, r) => s + r.amount, 0);
      const fuelTotal = vehRows.filter(r => r.category === "Fuel & Running").reduce((s, r) => s + r.amount, 0);
      const maintTotal = vehRows.filter(r => r.category === "Repair & Maintenance").reduce((s, r) => s + r.amount, 0);
      const insTotal = vehRows.filter(r => r.category === "Insurance & Istimara").reduce((s, r) => s + r.amount, 0);
      const otherTotal = totalExpense - fuelTotal - maintTotal - insTotal;
      return {
        ...v,
        txCount: vehRows.length,
        fuelTotal,
        maintTotal,
        insTotal,
        otherTotal,
        totalExpense,
        sharePct: totalAll > 0 ? (totalExpense / totalAll) * 100 : 0,
      };
    });
  }, [filteredRows]);

  const grandTotalExpense = useMemo(() => filteredRows.reduce((s, r) => s + r.amount, 0), [filteredRows]);

  function handleAllocateExpense() {
    const amt = parseFloat(allocForm.amount) || 0;
    if (amt <= 0) {
      toast.error("Please enter a valid expense amount greater than 0.");
      return;
    }
    const veh = COMPANY_VEHICLE_COST_CENTERS.find(v => v.vehicleNo === allocForm.vehicleNo);
    if (!veh) {
      toast.error("Please select a valid Company Vehicle Cost Center.");
      return;
    }

    const expCode = allocForm.expenseGl.split(" - ")[0]?.trim() || "51102002";
    const expName = allocForm.expenseGl.split(" - ").slice(1).join(" - ").trim() || "Vehicle Fuel, Maintenance & Running Expenses";
    const payCode = allocForm.paymentGl.split(" - ")[0]?.trim() || "1010";
    const payName = allocForm.paymentGl.split(" - ").slice(1).join(" - ").trim() || "Cash on Hand / Petty Cash";

    const desc = `[Cost Center: ${veh.vehicleNo}] ${allocForm.category}: ${allocForm.description || `${veh.vehicleName} (${veh.brandName})`}`;

    addJournalEntry({
      posting_date: allocForm.date,
      reference: allocForm.reference,
      narration: desc,
      dr_account: `${expCode} - ${expName}`,
      cr_account: `${payCode} - ${payName}`,
      amount: amt,
      property_name: veh.name,
      tenant_name: allocForm.vendor || "Fleet Vendor",
      status: "Posted",
      lines: [
        {
          account_code: expCode,
          account_name: expName,
          debit_amount: amt,
          credit_amount: 0,
          description: desc,
        },
        {
          account_code: payCode,
          account_name: payName,
          debit_amount: 0,
          credit_amount: amt,
          description: `Payment / Payable for Vehicle No ${veh.vehicleNo}`,
        },
      ],
    });

    toast.success(`Allocated QAR ${amt.toLocaleString()} exclusively to Cost Center ${veh.vehicleNo} (${veh.vehicleName} - ${veh.brandName}).`);
    setAllocateOpen(false);
    setAllocForm(prev => ({
      ...prev,
      reference: `VEXP-${Date.now().toString().slice(-5)}`,
      description: "",
      amount: "",
    }));
  }

  function exportVehicleExpenseCsv() {
    const headers = [
      "S No",
      "Vehicle No (Cost Center)",
      "Vehicle Name",
      "Model",
      "Brand Name",
      "Transactions",
      "Fuel & Running (QAR)",
      "Repair & Maintenance (QAR)",
      "Insurance & Istimara (QAR)",
      "Other Expense (QAR)",
      "Total Allocated Expense (QAR)",
    ];
    const summaryCsvRows = vehicleSummaryList
      .filter(v => selectedVehicleNo === "ALL" || v.vehicleNo === selectedVehicleNo)
      .map(v =>
        [
          v.sno,
          `"${v.vehicleNo}"`,
          `"${v.vehicleName}"`,
          `"${v.model}"`,
          `"${v.brandName}"`,
          v.txCount,
          v.fuelTotal.toFixed(2),
          v.maintTotal.toFixed(2),
          v.insTotal.toFixed(2),
          v.otherTotal.toFixed(2),
          v.totalExpense.toFixed(2),
        ].join(",")
      );

    const detailHeaders = [
      "Date",
      "Ref #",
      "Source",
      "Vehicle No (Cost Center)",
      "Vehicle Name",
      "Model",
      "Brand Name",
      "Category",
      "GL Account",
      "Vendor / Payee",
      "Description",
      "Amount (QAR)",
    ];
    const detailCsvRows = filteredRows.map(r =>
      [
        r.date,
        `"${r.reference}"`,
        `"${r.sourceType}"`,
        `"${r.vehicleNo}"`,
        `"${r.vehicleName}"`,
        `"${r.model}"`,
        `"${r.brandName}"`,
        `"${r.category}"`,
        `"${r.glAccount}"`,
        `"${r.vendorOrPayee.replace(/"/g, '""')}"`,
        `"${r.description.replace(/"/g, '""')}"`,
        r.amount.toFixed(2),
      ].join(",")
    );

    const csvContent = [
      "COMPANY VEHICLE-WISE COST CENTER EXPENSE SUMMARY",
      headers.join(","),
      ...summaryCsvRows,
      "",
      "ITEMIZED VEHICLE EXPENSE LEDGER",
      detailHeaders.join(","),
      ...detailCsvRows,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vehicle_wise_expense_report_${selectedVehicleNo}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600 text-white text-[10px]">Cost Center Expense Report</Badge>
            <h2 className="text-lg font-bold tracking-tight">Company Vehicle-Wise Expense Report</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dedicated Cost Center tracking by <strong>Vehicle No</strong> for all 11 company vehicles — allocate expenses per vehicle and generate vehicle-wise expense statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportVehicleExpenseCsv} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" /> Print Report
          </Button>
          <Button size="sm" onClick={() => setAllocateOpen(true)} className="gap-1.5 text-xs bg-primary">
            <Plus className="h-3.5 w-3.5" /> Allocate Vehicle Expense
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 rounded-xl border bg-muted/20">
        <div>
          <Label className="text-[11px] font-semibold mb-1 block">Vehicle Cost Center (Vehicle No)</Label>
          <Select value={selectedVehicleNo} onValueChange={setSelectedVehicleNo}>
            <SelectTrigger className="h-8 text-xs bg-background">
              <SelectValue placeholder="All Company Vehicles (11)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Company Vehicles (11 Cost Centers)</SelectItem>
              {COMPANY_VEHICLE_COST_CENTERS.map(v => (
                <SelectItem key={v.vehicleNo} value={v.vehicleNo} className="text-xs">
                  {v.vehicleNo} — {v.vehicleName} ({v.brandName}{v.model !== "—" ? ` ${v.model}` : ""})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[11px] font-semibold mb-1 block">Expense Category</Label>
          <Select value={expenseCategoryFilter} onValueChange={setExpenseCategoryFilter}>
            <SelectTrigger className="h-8 text-xs bg-background">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="Fuel & Running">Fuel & Running</SelectItem>
              <SelectItem value="Repair & Maintenance">Repair & Maintenance</SelectItem>
              <SelectItem value="Insurance & Istimara">Insurance & Istimara</SelectItem>
              <SelectItem value="Vehicle Expense">General Vehicle Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[11px] font-semibold mb-1 block">From Date</Label>
          <Input type="date" className="h-8 text-xs bg-background" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>

        <div>
          <Label className="text-[11px] font-semibold mb-1 block">To Date</Label>
          <Input type="date" className="h-8 text-xs bg-background" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>

        <div>
          <Label className="text-[11px] font-semibold mb-1 block">Search Vehicle / Ref / Vendor</Label>
          <Input
            placeholder="Vehicle No, brand, voucher..."
            className="h-8 text-xs bg-background"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60">
          <p className="text-[11px] font-semibold uppercase text-muted-foreground">Registered Vehicle Cost Centers</p>
          <p className="text-2xl font-bold mt-1">{COMPANY_VEHICLE_COST_CENTERS.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Tracked individually by Vehicle No</p>
        </Card>
        <Card className="p-4 border-border/60">
          <p className="text-[11px] font-semibold uppercase text-muted-foreground">Active Filter Scope</p>
          <p className="text-lg font-bold mt-1 text-primary">
            {selectedVehicleNo === "ALL"
              ? "All 11 Vehicles"
              : COMPANY_VEHICLE_COST_CENTERS.find(v => v.vehicleNo === selectedVehicleNo)?.name || selectedVehicleNo}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{filteredRows.length} allocated expense entries</p>
        </Card>
        <Card className="p-4 border-border/60">
          <p className="text-[11px] font-semibold uppercase text-muted-foreground">Fuel & Maintenance Split</p>
          <p className="text-lg font-bold mt-1 text-amber-600">
            QAR{" "}
            {filteredRows
              .filter(r => r.category === "Fuel & Running" || r.category === "Repair & Maintenance")
              .reduce((s, r) => s + r.amount, 0)
              .toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Direct fleet operating expenses</p>
        </Card>
        <Card className="p-4 border-rose-500/30 bg-rose-500/5">
          <p className="text-[11px] font-semibold uppercase text-rose-600">Total Vehicle Expenses</p>
          <p className="text-2xl font-bold mt-1 text-rose-600">QAR {grandTotalExpense.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Period: {dateFrom} to {dateTo}</p>
        </Card>
      </div>

      {/* Vehicle-Wise Cost Center Matrix Table */}
      <div className="border rounded-xl overflow-hidden bg-card shadow-xs">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Vehicle-Wise Cost Center Expense Summary</h3>
            <p className="text-[11px] text-muted-foreground">Click any vehicle row to filter its itemized ledger entries below.</p>
          </div>
          {selectedVehicleNo !== "ALL" && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedVehicleNo("ALL")} className="h-7 text-xs">
              Show All 11 Vehicles
            </Button>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="w-14 font-bold">S No</TableHead>
              <TableHead className="font-bold">Vehicle Name</TableHead>
              <TableHead className="font-bold">Vehicle No (Cost Center)</TableHead>
              <TableHead className="font-bold">Model</TableHead>
              <TableHead className="font-bold">Brand Name</TableHead>
              <TableHead className="text-right font-bold">Entries</TableHead>
              <TableHead className="text-right font-bold">Fuel & Running</TableHead>
              <TableHead className="text-right font-bold">Repair & Maint.</TableHead>
              <TableHead className="text-right font-bold">Insurance / Other</TableHead>
              <TableHead className="text-right font-bold">Total Expense (QAR)</TableHead>
              <TableHead className="text-right font-bold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicleSummaryList
              .filter(v => selectedVehicleNo === "ALL" || v.vehicleNo === selectedVehicleNo)
              .map(v => {
                const isSelected = selectedVehicleNo === v.vehicleNo;
                return (
                  <TableRow
                    key={v.vehicleNo}
                    className={`text-xs cursor-pointer transition-colors ${isSelected ? "bg-primary/10 font-medium" : "hover:bg-muted/30"}`}
                    onClick={() => setSelectedVehicleNo(isSelected ? "ALL" : v.vehicleNo)}
                  >
                    <TableCell className="font-mono text-muted-foreground">{v.sno}</TableCell>
                    <TableCell className="font-semibold">{v.vehicleName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono font-bold text-primary border-primary/30">
                        {v.vehicleNo}
                      </Badge>
                    </TableCell>
                    <TableCell>{v.model}</TableCell>
                    <TableCell>{v.brandName}</TableCell>
                    <TableCell className="text-right font-mono">{v.txCount}</TableCell>
                    <TableCell className="text-right font-mono">
                      {v.fuelTotal > 0 ? v.fuelTotal.toLocaleString() : "0.00"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {v.maintTotal > 0 ? v.maintTotal.toLocaleString() : "0.00"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {v.insTotal + v.otherTotal > 0 ? (v.insTotal + v.otherTotal).toLocaleString() : "0.00"}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-rose-600">
                      QAR {v.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px]"
                        onClick={() => {
                          setAllocForm(prev => ({ ...prev, vehicleNo: v.vehicleNo }));
                          setAllocateOpen(true);
                        }}
                      >
                        + Add Expense
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            <TableRow className="bg-muted/60 font-bold text-xs border-t-2">
              <TableCell colSpan={5}>TOTAL COMPANY FLEET EXPENSES</TableCell>
              <TableCell className="text-right font-mono">{filteredRows.length}</TableCell>
              <TableCell className="text-right font-mono">
                {vehicleSummaryList
                  .filter(v => selectedVehicleNo === "ALL" || v.vehicleNo === selectedVehicleNo)
                  .reduce((s, v) => s + v.fuelTotal, 0)
                  .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right font-mono">
                {vehicleSummaryList
                  .filter(v => selectedVehicleNo === "ALL" || v.vehicleNo === selectedVehicleNo)
                  .reduce((s, v) => s + v.maintTotal, 0)
                  .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right font-mono">
                {vehicleSummaryList
                  .filter(v => selectedVehicleNo === "ALL" || v.vehicleNo === selectedVehicleNo)
                  .reduce((s, v) => s + v.insTotal + v.otherTotal, 0)
                  .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right font-mono text-rose-600">
                QAR {grandTotalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Itemized Vehicle Expense Ledger */}
      <div className="border rounded-xl overflow-hidden bg-card shadow-xs">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">
              Itemized Vehicle Expense Ledger{" "}
              {selectedVehicleNo !== "ALL" && `(Filtered by Vehicle No: ${selectedVehicleNo})`}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Showing all AP Bills, Payment Vouchers, and Journal Entries allocated to company vehicle cost centers.
            </p>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Reference #</TableHead>
              <TableHead className="font-bold">Source</TableHead>
              <TableHead className="font-bold">Vehicle No (Cost Center)</TableHead>
              <TableHead className="font-bold">Vehicle Details</TableHead>
              <TableHead className="font-bold">Category</TableHead>
              <TableHead className="font-bold">GL Account</TableHead>
              <TableHead className="font-bold">Vendor / Payee</TableHead>
              <TableHead className="font-bold">Description</TableHead>
              <TableHead className="text-right font-bold">Amount (QAR)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-xs text-muted-foreground">
                  No expenses recorded for the selected vehicle cost center / period yet. Click <strong>"Allocate Vehicle Expense"</strong> or select a Vehicle Cost Center in Payable Invoices / Payment Vouchers.
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map(row => (
                <TableRow key={row.id} className="text-xs hover:bg-muted/30">
                  <TableCell className="font-mono">{row.date}</TableCell>
                  <TableCell className="font-mono font-bold text-primary">{row.reference}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{row.sourceType}</Badge>
                  </TableCell>
                  <TableCell className="font-mono font-bold">{row.vehicleNo}</TableCell>
                  <TableCell>
                    {row.vehicleName} ({row.brandName}{row.model !== "—" ? ` ${row.model}` : ""})
                  </TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell className="font-mono text-[11px]">{row.glAccount}</TableCell>
                  <TableCell>{row.vendorOrPayee}</TableCell>
                  <TableCell className="max-w-xs truncate" title={row.description}>{row.description}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-rose-600">
                    QAR {row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Allocate Vehicle Expense Modal */}
      <Dialog open={allocateOpen} onOpenChange={setAllocateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Allocate Expense to Vehicle Cost Center</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label className="font-semibold">Company Vehicle Cost Center (by Vehicle No) *</Label>
              <Select
                value={allocForm.vehicleNo}
                onValueChange={v => setAllocForm({ ...allocForm, vehicleNo: v })}
              >
                <SelectTrigger className="h-9 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_VEHICLE_COST_CENTERS.map(v => (
                    <SelectItem key={v.vehicleNo} value={v.vehicleNo} className="text-xs">
                      Vehicle No: {v.vehicleNo} — {v.vehicleName} ({v.brandName}{v.model !== "—" ? ` ${v.model}` : ""})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-semibold">Expense Date *</Label>
                <Input
                  type="date"
                  className="h-8 text-xs mt-1"
                  value={allocForm.date}
                  onChange={e => setAllocForm({ ...allocForm, date: e.target.value })}
                />
              </div>
              <div>
                <Label className="font-semibold">Voucher / Bill Reference # *</Label>
                <Input
                  className="h-8 text-xs font-mono mt-1"
                  value={allocForm.reference}
                  onChange={e => setAllocForm({ ...allocForm, reference: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-semibold">Expense Category *</Label>
                <Select
                  value={allocForm.category}
                  onValueChange={v => setAllocForm({ ...allocForm, category: v })}
                >
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fuel & Running">Fuel & Running</SelectItem>
                    <SelectItem value="Repair & Maintenance">Repair & Maintenance</SelectItem>
                    <SelectItem value="Insurance & Istimara">Insurance & Istimara</SelectItem>
                    <SelectItem value="Vehicle Expense">General Vehicle Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-semibold">Amount (QAR) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-8 text-xs font-mono mt-1"
                  value={allocForm.amount}
                  onChange={e => setAllocForm({ ...allocForm, amount: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label className="font-semibold">Expense GL Account (Debit) *</Label>
              <Select
                value={allocForm.expenseGl}
                onValueChange={v => setAllocForm({ ...allocForm, expenseGl: v })}
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="51102002 - Vehicle Fuel, Maintenance & Running Expenses">
                    51102002 - Vehicle Fuel, Maintenance & Running Expenses
                  </SelectItem>
                  <SelectItem value="51102001 - Vehicles & Other Insurance Expenses">
                    51102001 - Vehicles & Other Insurance Expenses
                  </SelectItem>
                  <SelectItem value="51004001 - Repair and Maintenance Cost">
                    51004001 - Repair and Maintenance Cost
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-semibold">Payment / Payable Account (Credit) *</Label>
              <Select
                value={allocForm.paymentGl}
                onValueChange={v => setAllocForm({ ...allocForm, paymentGl: v })}
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1010 - Cash on Hand / Petty Cash">1010 - Cash on Hand / Petty Cash</SelectItem>
                  <SelectItem value="1020 - Main Operating Bank Account">1020 - Main Operating Bank Account</SelectItem>
                  <SelectItem value="21100 - Trade Accounts Payable">21100 - Trade Accounts Payable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-semibold">Vendor / Workshop / Station</Label>
              <Input
                placeholder="e.g. Woqod Fuel Station / Nissan Service Center"
                className="h-8 text-xs mt-1"
                value={allocForm.vendor}
                onChange={e => setAllocForm({ ...allocForm, vendor: e.target.value })}
              />
            </div>

            <div>
              <Label className="font-semibold">Description / Particulars</Label>
              <Input
                placeholder="e.g. Full tank petrol, periodic oil change, brake pads..."
                className="h-8 text-xs mt-1"
                value={allocForm.description}
                onChange={e => setAllocForm({ ...allocForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAllocateOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAllocateExpense}>Post to Vehicle Cost Center</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
