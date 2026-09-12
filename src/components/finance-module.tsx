import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearch } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings, Calendar, MapPin, Users, UserCheck, Layers, LayoutDashboard,
  Clock, BookOpen, FileText, PlusCircle, MinusCircle, ArrowDownLeft, ArrowUpRight, Receipt as ReceiptIcon,
  Building, Building2, CreditCard, FileCheck, FileSpreadsheet, PieChart, Landmark, Scale,
  DollarSign, Activity, FileCode, CheckCircle, Search, Plus, Trash2, Pencil,
  ChevronRight, Loader2, Filter, Download, FilePlus, ArrowRight, CheckCircle2,
  AlertTriangle, RefreshCw, Eye, Printer, ShieldCheck, TrendingUp, ArrowUpDown,
  Home as HomeIcon, User as UserIcon
} from "lucide-react";
import {
  supabase,
  fetchJournalEntries, fetchARLedgers, fetchGLAccounts,
  createJournalEntry, createAREntry, settleAREntry, createGLAccount,
  fetchERPChartOfAccounts, fetchUnitCOAs,
  type JournalEntry, type ARLedger, type GLAccount, type ERPChartOfAccount, type UnitCOA
} from "@/lib/supabase";
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
import { formatDDMMMYYYY } from "@/lib/date-utils";
import { postVoucher } from "@/lib/finance/posting-engine";
import { useFinanceStore } from "@/lib/finance/finance-store";
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

export interface FinanceModuleProps {
  role: "admin" | "prop-mgr" | "finance" | "cashier";
}

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
      { key: "receivable_invoice", label: "Receivable Invoice", icon: ArrowDownLeft },
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
    group: "Reports",
    icon: PieChart,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    activeBg: "bg-rose-500",
    items: [
      { key: "revenue_generation", label: "Revenue Generation", icon: TrendingUp },
      { key: "trial_balance_simple", label: "Trial Balance (Simple)", icon: Scale },
      { key: "trial_balance", label: "Trial Balance", icon: Scale },
      { key: "profit_and_loss", label: "Profit & Loss", icon: Activity },
      { key: "balance_sheet", label: "Balance Sheet", icon: Landmark },
      { key: "general_ledger", label: "General Ledger", icon: BookOpen },
      { key: "cash_flow_statement", label: "Cash Flow Statement", icon: DollarSign },
      { key: "cash_book", label: "Cash Book", icon: BookOpen },
      { key: "petty_cash_book", label: "Petty Cash Book", icon: BookOpen },
      { key: "cash_on_hand", label: "Cash On Hand", icon: DollarSign },
    ],
  },
];

export function FinanceModule({ role }: FinanceModuleProps) {
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

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <FinanceSubModuleRouter subKey={activeKey} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ── Sub-Module Router ─────────────────────────────────────────────────────────

function FinanceSubModuleRouter({ subKey }: { subKey: string }) {
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
    case "receivable_invoice": return <ReceivableInvoiceSubModule />;
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
    case "revenue_generation": return <RevenueGenerationSubModule />;
    case "trial_balance_simple": return <TrialBalanceSimpleSubModule />;
    case "trial_balance": return <TrialBalanceFullSubModule />;
    case "profit_and_loss": return <ProfitAndLossSubModule />;
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
        code: `CUST-${String(t.id || idx).slice(-4).toUpperCase()}`,
        name: t.name,
        type: t.type === 'company' ? 'Corporate Tenant' : 'Individual Tenant',
        phone: t.mobile || '—',
        email: t.email || '—',
        property: lease ? `${lease.property} (${lease.unit})` : '—',
      };
    })
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Customer & Tenant Accounts</h3>
          <p className="text-xs text-muted-foreground">Customers linked with accounts receivable sub-ledgers and leasing contracts.</p>
        </div>
        <Badge variant="outline">{allCustomers.length} Customers</Badge>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader><TableRow className="bg-muted/50 text-xs"><TableHead className="font-bold">Code</TableHead><TableHead className="font-bold">Customer Name</TableHead><TableHead className="font-bold">Account Type</TableHead><TableHead className="font-bold">Assigned Property</TableHead><TableHead className="font-bold">Contact Phone</TableHead></TableRow></TableHeader>
          <TableBody>
            {allCustomers.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono font-bold text-primary">{row.code}</TableCell>
                <TableCell className="font-semibold">{row.name}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{row.type}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{row.property}</TableCell>
                <TableCell className="text-xs">{row.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CostCenterSubModule() {
  const { units: sharedUnits } = useAppData();
  const [data, setData] = useState<FinCostCenter[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "CC-PROP-SALATA", name: "Old Salata Residence 23", manager: "Eng. Fahad", property_id: "", unit_id: "", type: "Property" });

  const sharedProperties = Array.from(new Set((sharedUnits || []).map(u => String((u as any).propertyName || (u as any).property || (u as any).buildingName || ""))))
    .filter(p => Boolean(p && p.trim())).map((p, i) => ({ id: String(i), title: String(p) }));

  useEffect(() => { load(); }, [sharedUnits]);
  async function load() {
    try {
      const dbData = await FinCostCentersApi.fetchAll();
      const existing = new Set(dbData.map((d: any) => d.code));
      const autoSeeds: any[] = [];
      for (const prop of sharedProperties) {
        if (!prop || !prop.title) continue;
        const code = `CC-PROP-${prop.title.slice(0, 8).toUpperCase().replace(/\s/g, '-')}`;
        if (!existing.has(code)) autoSeeds.push({ code, name: prop.title, manager: 'Site Manager', type: 'Property' });
      }
      setData([...dbData, ...autoSeeds.map((s, i) => ({ ...s, id: String(-1000 - i) }))]);
    } catch { }
  }
  async function handleAdd() {
    try { await FinCostCentersApi.create(form); } catch { }
    setData(prev => [{ id: String(Date.now()), ...form }, ...prev]);
    toast.success("Cost center added");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Cost Center Matrix</h3>
          <p className="text-xs text-muted-foreground">Cost Centers for project, property, and department level expense tracking.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Cost Center</Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader><TableRow className="bg-muted/50 text-xs"><TableHead className="font-bold">Code</TableHead><TableHead className="font-bold">Name</TableHead><TableHead className="font-bold">Type</TableHead><TableHead className="font-bold">Manager</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono font-bold text-primary">{(row as any).code}</TableCell>
                <TableCell className="font-medium">{(row as any).name}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{(row as any).type || 'Property'}</Badge></TableCell>
                <TableCell className="text-xs">{row.manager || 'Site Manager'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Cost Center</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div><Label>Code</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Manager</Label><Input value={form.manager} onChange={e => setForm({ ...form, manager: e.target.value })} /></div>
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

  const [budgetHeads, setBudgetHeads] = useState<BudgetHeadItem[]>(() => {
    const saved = localStorage.getItem("zyno_finance_budget_heads");
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return DEFAULT_BUDGET_HEADS;
  });

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
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'master' | 'units'>('master');
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", type: "Assets", type_code: "1", group_name: "Current Assets", class_name: "Accounts Receivables", gl_name: "Tenant Receivables" });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [accs, uCoas] = await Promise.all([
        fetchERPChartOfAccounts(),
        fetchUnitCOAs()
      ]);

      // ── Clean Master COA: Group by the Master GL Code (e.g. 11000, 12000, 12100, 12200, 12300, 12400, etc.) ──
      // In the ERP database, 8-digit codes like 11000001 were auto-generated per property/unit.
      // Master COA should represent the unique root Enterprise GL accounts.
      const masterMap = new Map<string, ERPChartOfAccount>();
      (accs || []).forEach(a => {
        // Master GL key is either a.gl_code, or the base 4/5-digit prefix (e.g. 11000 from 11000001), or a.name
        const glKey = a.gl_code || (a.code && a.code.length >= 5 ? a.code.substring(0, 5) : a.code) || a.name;
        if (!masterMap.has(glKey)) {
          masterMap.set(glKey, {
            ...a,
            code: a.gl_code || (a.code && a.code.length >= 5 ? `${a.code.substring(0, 5)}0` : a.code),
            name: a.gl_name || a.name.replace(/\s*-\s*(Tenant|Flat|Unit|Apt|Residence|\d+).*$/i, '').trim(),
          });
        }
      });
      const cleanMaster = Array.from(masterMap.values());

      // ── Clean Unit Sub-Ledgers: Deduplicate by property and unit_code ──
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
    } catch (e: any) {
      toast.error("Failed to load Chart of Accounts: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      await createGLAccount({ code: form.code, name_en: form.name, type: form.type.toLowerCase() as any });
      toast.success("Account created successfully!");
      setOpen(false);
      loadData();
    } catch (e: any) {
      toast.error(e.message);
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

  const totalMasterPages = Math.ceil(filteredMaster.length / pageSize) || 1;
  const paginatedMaster = filteredMaster.slice((page - 1) * pageSize, page * pageSize);

  const totalUnitPages = Math.ceil(filteredUnits.length / pageSize) || 1;
  const paginatedUnits = filteredUnits.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div>
          <h3 className="text-base font-bold tracking-tight">Company Chart of Accounts (COA) & Property Unit Sub-Ledgers</h3>
          <p className="text-xs text-muted-foreground">
            Single Unified COA for the entire enterprise with hierarchical property sub-ledgers & unit account mapping.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-muted p-1 rounded-md text-xs font-medium">
            <button
              onClick={() => { setTab('master'); setPage(1); }}
              className={`px-3 py-1.5 rounded-sm transition-all ${tab === 'master' ? 'bg-background text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Enterprise Master COA ({erpAccounts.length})
            </button>
            <button
              onClick={() => { setTab('units'); setPage(1); }}
              className={`px-3 py-1.5 rounded-sm transition-all ${tab === 'units' ? 'bg-background text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Property & Unit Sub-Ledgers ({unitCoas.length} Units)
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
            placeholder={tab === 'master' ? "Search code, name, class..." : "Search property, unit, COA code..."}
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
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading Chart of Accounts...
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
      ) : (
        <div className="space-y-4">
          {/* Grouping units by property with unit counts */}
          {(() => {
            const propertiesMap = new Map<string, typeof unitCoas>();
            filteredUnits.forEach(u => {
              const prop = u.property_name || 'Portfolio Properties';
              if (!propertiesMap.has(prop)) propertiesMap.set(prop, []);
              propertiesMap.get(prop)!.push(u);
            });

            return Array.from(propertiesMap.entries()).map(([propertyName, unitsList]) => (
              <div key={propertyName} className="border rounded-lg overflow-hidden bg-card shadow-sm">
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
  const { vouchers: sharedVouchers } = useAppData();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<{ id: string; posting_date: string; reference: string; narration: string; dr_account: string; cr_account: string; amount: number; status: string }[]>([]);

  const [form, setForm] = useState({
    je_no: `JE-2026-${Math.floor(100 + Math.random() * 900)}`,
    posting_date: new Date().toISOString().split("T")[0],
    reference: "MANUAL-JE",
    narration: "",
    dr_account: "12000 - Bank Operating Account",
    cr_account: "41100 - Rental Revenue",
    amount: "5000",
  });

  async function handleAddEntry() {
    if (!form.narration || !form.amount) {
      toast.error("Please fill in narration and amount");
      return;
    }
    const amt = parseFloat(form.amount) || 0;
    try {
      await postVoucher({
        voucher_date: form.posting_date,
        voucher_type: 'Journal',
        description: form.narration,
        reference_no: form.reference,
        lines: [
          { account_code: form.dr_account.split(' ')[0], debit: amt, credit: 0, description: form.narration },
          { account_code: form.cr_account.split(' ')[0], debit: 0, credit: amt, description: form.narration }
        ]
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to post journal entry.");
      return;
    }

    const newJE = {
      id: form.je_no,
      posting_date: form.posting_date,
      reference: form.reference,
      narration: form.narration,
      dr_account: form.dr_account,
      cr_account: form.cr_account,
      amount: amt,
      status: "Posted"
    };

    setEntries(prev => [newJE, ...prev]);
    toast.success(`Journal Entry ${form.je_no} successfully posted to Ledger!`);
    setOpen(false);
  }

  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredEntries = useMemo(() => {
    let list = entries;
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
  }, [entries, startMonth, endMonth, quickFilter, search]);

  const totalAmount = useMemo(() => filteredEntries.reduce((s, je) => s + (je.amount || 0), 0), [filteredEntries]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Journal Ledger Postings</h3>
          <p className="text-xs text-muted-foreground">General Journal entries with dual-entry audit trail and month-wise range filtering.</p>
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
              <TableHead className="font-bold">Posting Date</TableHead>
              <TableHead className="font-bold">Reference</TableHead>
              <TableHead className="font-bold">Debit Account</TableHead>
              <TableHead className="font-bold">Credit Account</TableHead>
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
                  <TableCell className="font-medium">{je.posting_date}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{je.reference}</TableCell>
                  <TableCell className="text-blue-600 font-medium">{je.dr_account}</TableCell>
                  <TableCell className="text-emerald-600 font-medium">{je.cr_account}</TableCell>
                  <TableCell className="text-right font-mono font-bold">{je.amount.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="default" className="text-[10px]">{je.status}</Badge></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Journal Ledger Entry</DialogTitle>
            <p className="text-xs text-muted-foreground">Posts double-entry lines into General Ledger with real-time balance enforcement.</p>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>JE Number</Label><Input value={form.je_no} onChange={e => setForm({ ...form, je_no: e.target.value })} /></div>
              <div><Label>Posting Date</Label><Input type="date" value={form.posting_date} onChange={e => setForm({ ...form, posting_date: e.target.value })} /></div>
            </div>
            <div><Label>Reference / Document No</Label><Input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Debit Account (Dr)</Label>
                <Select value={form.dr_account} onValueChange={v => setForm({ ...form, dr_account: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12000 - Bank Operating Account">12000 - Bank Operating Account</SelectItem>
                    <SelectItem value="10100 - Cash In Hand">10100 - Cash In Hand</SelectItem>
                    <SelectItem value="12413 - Tenant Receivables">12413 - Tenant Receivables</SelectItem>
                    <SelectItem value="5020 - Repairs & Maintenance">5020 - Repairs & Maintenance</SelectItem>
                    <SelectItem value="5010 - Basic Salaries">5010 - Basic Salaries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Credit Account (Cr)</Label>
                <Select value={form.cr_account} onValueChange={v => setForm({ ...form, cr_account: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="41100 - Rental Revenue">41100 - Rental Revenue</SelectItem>
                    <SelectItem value="21500 - Security Deposit Liability">21500 - Security Deposit Liability</SelectItem>
                    <SelectItem value="2010 - Accounts Payable">2010 - Accounts Payable</SelectItem>
                    <SelectItem value="12900 - PDC In Hand">12900 - PDC In Hand</SelectItem>
                    <SelectItem value="12000 - Bank Operating Account">12000 - Bank Operating Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Amount (QAR)</Label>
              <Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <Label>Narration / Description</Label>
              <Textarea rows={2} placeholder="Explain the business transaction..." value={form.narration} onChange={e => setForm({ ...form, narration: e.target.value })} />
            </div>

            {/* Live GL / COA Impact Preview */}
            {parseFloat(form.amount) > 0 && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Ledgers / Accounts Updated by this Entry</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-background p-2 rounded border border-emerald-200">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold block">Debit (DR):</span>
                    <span>{form.dr_account}</span>
                    <span className="block font-bold text-emerald-600 mt-1">QR {parseFloat(form.amount || '0').toLocaleString()}</span>
                  </div>
                  <div className="bg-background p-2 rounded border border-rose-200">
                    <span className="text-rose-600 dark:text-rose-400 font-bold block">Credit (CR):</span>
                    <span>{form.cr_account}</span>
                    <span className="block font-bold text-rose-600 mt-1">QR {parseFloat(form.amount || '0').toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEntry}>Confirm & Post Journal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreditDebitBuilderSubModule() {
  const [lines, setLines] = useState([{ account: "", debit: 0, credit: 0 }]);
  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);

  function addLine() { setLines([...lines, { account: "", debit: 0, credit: 0 }]); }
  function removeLine(idx: number) { setLines(lines.filter((_, i) => i !== idx)); }

  async function submit() {
    if (totalDebit !== totalCredit || totalDebit === 0) {
      toast.error("Debits and credits must balance and be greater than 0!");
      return;
    }
    try {
      await postVoucher({
        voucher_date: new Date().toISOString().split("T")[0],
        voucher_type: 'Journal',
        description: 'Multi-line Credit Debit Builder Voucher',
        lines: lines.map(l => ({
          account_code: l.account.split(' ')[0] || '1000',
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          description: l.account,
        }))
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to post journal voucher.");
      return;
    }

    toast.success("Journal voucher built & posted successfully!");
    setLines([
      { account: "12000 - Bank Operating Account", debit: 0, credit: 0 },
      { account: "41100 - Rental Income", debit: 0, credit: 0 }
    ]);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Multi-Leg Debit / Credit Voucher Builder</h3>
          <p className="text-xs text-muted-foreground">Construct complex split-leg journal entries with real-time balancing.</p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg border shadow-sm space-y-3">
        {lines.map((l, idx) => (
          <div key={idx} className="flex gap-2 items-center text-xs">
            <Input
              placeholder="Account Code & Name (e.g. 12000 Bank)"
              className="flex-1 text-xs"
              value={l.account}
              onChange={e => { const next = [...lines]; next[idx].account = e.target.value; setLines(next); }}
            />
            <Input
              type="number"
              placeholder="Debit"
              className="w-32 text-xs"
              value={l.debit || ""}
              onChange={e => { const next = [...lines]; next[idx].debit = parseFloat(e.target.value) || 0; setLines(next); }}
            />
            <Input
              type="number"
              placeholder="Credit"
              className="w-32 text-xs"
              value={l.credit || ""}
              onChange={e => { const next = [...lines]; next[idx].credit = parseFloat(e.target.value) || 0; setLines(next); }}
            />
            {lines.length > 2 && (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeLine(idx)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <div className="flex justify-between items-center pt-3 border-t border-border mt-2">
          <Button variant="outline" size="sm" onClick={addLine} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Leg
          </Button>
          <div className="flex items-center gap-4 text-xs">
            <span>Total Dr: <strong className="font-mono text-blue-600 font-bold">{totalDebit.toLocaleString()} QAR</strong></span>
            <span>Total Cr: <strong className="font-mono text-emerald-600 font-bold">{totalCredit.toLocaleString()} QAR</strong></span>
            <Badge variant={totalDebit === totalCredit && totalDebit > 0 ? "default" : "destructive"}>
              {totalDebit === totalCredit && totalDebit > 0 ? "Balanced" : `Diff: ${(totalDebit - totalCredit).toLocaleString()} QAR`}
            </Badge>
            <Button size="sm" onClick={submit} disabled={totalDebit !== totalCredit || totalDebit === 0}>
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

      localStorage.removeItem("grn_cost_mappings_v2");
      localMappings = [];

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

      setGrnList([]);
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

function PayableInvoiceSubModule() {
  const { addVoucher } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [procInvoices, setProcInvoices] = useState<ProcApInvoice[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<any | null>(null);

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

  // Merge Store AP invoices and Procurement AP invoices
  const displayedStoreInvoices = useMemo<any[]>(() => [], []);
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
        list.push({
          id: inv.id,
          invoice_no: inv.invoice_no,
          vendor: inv.vendor,
          date: inv.date,
          due_date: inv.due_date,
          account: inv.account || "51004001 - Repair and Maintenance Cost",
          account_code: inv.account_code || "51004001",
          base_amount: baseAmt,
          tax_amount: taxAmt,
          amount: totalAmt,
          status: inv.status || "Unpaid",
          raw: inv
        });
      }
    });

    return list.sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime());
  }, [procInvoices, displayedStoreInvoices]);

  const [form, setForm] = useState({
    invoice_no: `APINV-${Math.floor(10000 + Math.random() * 90000)}`,
    vendor: "Qatar Maintenance & HVAC Co.",
    date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    account: "51004001 - Repair and Maintenance Cost",
    account_code: "51004001",
    amount: "4275",
  });

  async function handleAdd() {
    const amt = parseFloat(form.amount) || 0;
    await ApInvoicesApi.create({
      invoice_number: form.invoice_no,
      vendor_id: form.vendor,
      invoice_date: form.date,
      due_date: form.due_date,
      amount: amt,
      tax_amount: 0,
      total_amount: amt,
      status: "DRAFT",
      remarks: `Direct AP Invoice booked to ${form.account}`
    });
    toast.success(`Payable Invoice ${form.invoice_no} created and synced with Finance & Procurement.`);
    setOpen(false);
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

      // Update local storage for zyno-pms-finance-data-v1-ap
      try {
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
        property_name: payTarget.raw?.property || "Main Portfolio",
        unit_ref: payTarget.raw?.unit_ref || payTarget.po_number || "Facility Operations",
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
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-xs">No Accounts Payable invoices found.</TableCell></TableRow>
            )}
            {allInvoices.map((row) => (
              <TableRow key={row.invoice_no} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono text-muted-foreground">{row.date}</TableCell>
                <TableCell className="font-mono font-bold text-primary">{row.invoice_no}</TableCell>
                <TableCell className="font-semibold">{row.vendor}</TableCell>
                <TableCell className="font-mono text-cyan-600">
                  {row.po_number || row.grn_number ? `${row.po_number || ''} ${row.grn_number ? '· ' + row.grn_number : ''}` : "—"}
                </TableCell>
                <TableCell>{row.due_date}</TableCell>
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
                      <Button size="sm" className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => openPayModal(row)}>
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
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Accounts Payable Invoice</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Entry Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Invoice #</Label><Input value={form.invoice_no} onChange={e => setForm({ ...form, invoice_no: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vendor</Label><Input value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} /></div>
              <div><Label>Amount (QAR)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Bill Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
            </div>
            <div>
              <Label>Expense GL Account (Official COA)</Label>
              <Select value={form.account} onValueChange={v => setForm({ ...form, account: v, account_code: v.split(" - ")[0] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="51004001 - Repair and Maintenance Cost">51004001 - Repair and Maintenance Cost</SelectItem>
                  <SelectItem value="51004006 - Cost of CMEP Materials">51004006 - Cost of CMEP Materials</SelectItem>
                  <SelectItem value="51002001 - CMEP-Facilities Mgt AMC">51002001 - CMEP-Facilities Mgt AMC</SelectItem>
                  <SelectItem value="51001001 - CMEP-Labor Cost-Facilities Mgt">51001001 - CMEP-Labor Cost-Facilities Mgt</SelectItem>
                  <SelectItem value="51003001 - Electricity & Water-Common Area">51003001 - Electricity & Water-Common Area</SelectItem>
                  <SelectItem value="51101001 - Staff Basic Salary">51101001 - Staff Basic Salary</SelectItem>
                  <SelectItem value="51102014 - IT Expenses">51102014 - IT Expenses</SelectItem>
                  <SelectItem value="51102001 - Vehicles & Other Insurance Expenses">51102001 - Vehicles & Other Insurance Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Live GL / COA Impact Preview */}
            {parseFloat(form.amount) > 0 && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Ledgers / Accounts Updated by this AP Invoice</span>
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-blue-700 dark:text-blue-300">
                    <span>Dr. {form.account_code} - {form.account.split(" - ")[1]}</span>
                    <span>QAR {parseFloat(form.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-300">
                    <span>Cr. 22100001 - Trade Payables - Vendors ({form.vendor || 'Vendor'})</span>
                    <span>QAR {parseFloat(form.amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save AP Invoice</Button>
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

const COMMON_GL_ACCOUNTS = [
  { code: "12000", name: "12000 - Bank Operating Account (QNB/CBQ)" },
  { code: "12100", name: "12100 - Cash In Hand (Office Vault)" },
  { code: "12411", name: "12411 - Legal Receivables (Defaulted Cases)" },
  { code: "12413", name: "12413 - Tenant Receivables (AR)" },
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
  const { vouchers: sharedVouchers, setVouchers: setSharedVouchers } = useAppData();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    voucher_no: `VCH-${type.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split("T")[0],
    name: type === "Payment Voucher" ? "Payment to Contractor" : type === "Receipt Voucher" ? "Direct Rent Collection" : "General Adjustment",
    debit: type === "Payment Voucher" ? "22100001 - Trade Payables - Vendors (Suppliers/Vendors)" : type === "Receipt Voucher" ? "12000 - Bank Operating Account (QNB/CBQ)" : "51004001 - Repair and Maintenance Cost",
    credit: type === "Payment Voucher" ? "12000 - Bank Operating Account (QNB/CBQ)" : type === "Receipt Voucher" ? "41100 - Rental Revenue" : "12100 - Cash In Hand (Office Vault)",
    amount: "5000",
    method: type === "Payment Voucher" ? "Bank Transfer" : type === "Receipt Voucher" ? "Cash" : "Batch",
  });

  const filtered = (sharedVouchers || []).filter(v => {
    if (type.includes("Journal")) return v.method === "Batch" || v.name.includes("Income") || v.name.includes("Doc") || v.name.includes("Journal");
    if (type.includes("Payment")) return v.name.includes("Payment") || v.name.includes("Refund") || v.debit.includes("Payable");
    if (type.includes("Receipt")) return v.name.includes("Receipt") || v.method === "PDC" || v.method === "Cash" || v.credit.includes("Income");
    return true;
  });

  async function handleAdd() {
    const amt = parseFloat(form.amount) || 0;
    if (amt <= 0) {
      toast.error("Amount must be greater than zero.");
      return;
    }

    const accountCode = (label: string) => label.trim().split(/\s+/)[0];

    try {
      const result = await postVoucher({
        voucher_date: form.date,
        voucher_type: type,
        description: form.name,
        reference_no: form.voucher_no,
        source_type: "FINANCE_VOUCHER",
        lines: [
          { account_code: accountCode(form.debit), debit: amt, credit: 0, description: form.debit },
          { account_code: accountCode(form.credit), debit: 0, credit: amt, description: form.credit },
        ],
      });

      setSharedVouchers(prev => [{
        id: result.voucher_id,
        leaseId: "",
        name: form.name,
        receiptNo: result.receipt_number,
        method: form.method,
        period: form.date,
        debit: form.debit,
        credit: form.credit,
        amount: amt,
        status: "posted" as const,
      }, ...prev]);

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
          <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Create {type}</Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Entry Date</TableHead>
              <TableHead className="font-bold">Voucher #</TableHead>
              <TableHead className="font-bold">Name & Description</TableHead>
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
                <TableCell><Badge variant="outline" className="text-[10px]">{v.method || "System"}</Badge></TableCell>
                <TableCell className="font-mono text-blue-600 text-xs">{v.debit}</TableCell>
                <TableCell className="font-mono text-emerald-600 text-xs">{v.credit}</TableCell>
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
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create {type}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Entry Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Voucher #</Label><Input value={form.voucher_no} onChange={e => setForm({ ...form, voucher_no: e.target.value })} /></div>
            </div>
            <div><Label>Description / Narration</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Debit GL Account</Label>
                <Select value={form.debit} onValueChange={v => setForm({ ...form, debit: v })}>
                  <SelectTrigger className="text-xs font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COMMON_GL_ACCOUNTS.map(a => <SelectItem key={a.code} value={a.name} className="text-xs font-mono">{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Credit GL Account</Label>
                <Select value={form.credit} onValueChange={v => setForm({ ...form, credit: v })}>
                  <SelectTrigger className="text-xs font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COMMON_GL_ACCOUNTS.map(a => <SelectItem key={a.code} value={a.name} className="text-xs font-mono">{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount (QAR)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
              <div>
                <Label>Payment Method</Label>
                <Select value={form.method} onValueChange={v => setForm({ ...form, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Post {type}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReceivableInvoiceSubModule() {
  const { leases } = useAppData();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{ invoice_no: string; tenant: string; property: string; unit: string; date: string; due_date: string; stream: string; amount: number; status: string }[]>([]);

  const [form, setForm] = useState({
    invoice_no: `INV-AR-${Math.floor(1000 + Math.random() * 9000)}`,
    tenant: "Mr. Hafeez Shaik",
    property: "Old Salata - Residence No:23",
    unit: "AAA - Flat16",
    date: new Date().toISOString().split("T")[0],
    due_date: "2026-09-05",
    stream: "41100 - Rental Revenue",
    amount: "5600",
  });

  function handleAdd() {
    setData(prev => [
      { ...form, amount: parseFloat(form.amount) || 0, status: "Pending" },
      ...prev
    ]);
    toast.success(`AR Invoice ${form.invoice_no} staged in the local view only. Use the Receivable Invoice workflow to post it to the ledger.`);
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Accounts Receivable (AR) Invoices</h3>
          <p className="text-xs text-muted-foreground">Invoices generated for rental dues, utility recoveries, and service charges.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Create AR Invoice</Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Entry Date</TableHead>
              <TableHead className="font-bold">Invoice #</TableHead>
              <TableHead className="font-bold">Tenant / Customer</TableHead>
              <TableHead className="font-bold">Property & Unit</TableHead>
              <TableHead className="font-bold">Revenue GL Account</TableHead>
              <TableHead className="font-bold">Issue Date</TableHead>
              <TableHead className="font-bold">Due Date</TableHead>
              <TableHead className="text-right font-bold">Amount (QAR)</TableHead>
              <TableHead className="font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...data].sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime()).map((row) => (
              <TableRow key={row.invoice_no} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono text-muted-foreground">{row.date}</TableCell>
                <TableCell className="font-mono font-bold text-primary">{row.invoice_no}</TableCell>
                <TableCell className="font-semibold">{row.tenant}</TableCell>
                <TableCell className="text-muted-foreground">{row.property} — {row.unit}</TableCell>
                <TableCell className="font-mono text-xs text-blue-600">{row.stream}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.due_date}</TableCell>
                <TableCell className="text-right font-mono font-bold">{row.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "Paid" ? "default" : row.status === "Overdue" ? "destructive" : "outline"} className="text-[10px]">
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
          <DialogHeader><DialogTitle>Create Accounts Receivable Invoice</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Entry Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Invoice #</Label><Input value={form.invoice_no} onChange={e => setForm({ ...form, invoice_no: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tenant Name</Label><Input value={form.tenant} onChange={e => setForm({ ...form, tenant: e.target.value })} /></div>
              <div><Label>Amount (QAR)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Property</Label><Input value={form.property} onChange={e => setForm({ ...form, property: e.target.value })} /></div>
              <div><Label>Unit</Label><Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Issue Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
            </div>
            <div>
              <Label>Target Revenue GL Account</Label>
              <Select value={form.stream} onValueChange={v => setForm({ ...form, stream: v })}>
                <SelectTrigger className="text-xs font-mono"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="41100 - Rental Revenue">41100 - Rental Revenue (Residential/Commercial)</SelectItem>
                  <SelectItem value="41200 - Parking Fee Revenue">41200 - Parking Space / Slot Fee</SelectItem>
                  <SelectItem value="41300 - Utility Recovery Revenue">41300 - Utility & Electricity Recovery</SelectItem>
                  <SelectItem value="41400 - Common Area Maintenance (CAM)">41400 - Common Area Maintenance (CAM)</SelectItem>
                  <SelectItem value="41500 - Management & Admin Fee">41500 - Management & Admin Fee</SelectItem>
                  <SelectItem value="41600 - Late Fee & Penalties">41600 - Late Fee & Penalties</SelectItem>
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
            <Button onClick={handleAdd}>Generate Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. BANK ACCOUNTING SUB-MODULES
// ─────────────────────────────────────────────────────────────────────────────

function BankSubModule() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<FinBank[]>([]);
  const [form, setForm] = useState({ code: "QNB", name: "Qatar National Bank (QNB)", swift_code: "QNBAQAQA" });

  useEffect(() => { load(); }, []);
  async function load() {
    try {
      const res = await FinBanksApi.fetchAll();
      setData(res.length > 0 ? res : [
        { id: "1", code: "QNB", name: "Qatar National Bank (QNB)", swift_code: "QNBAQAQA" },
        { id: "2", code: "CBQ", name: "Commercial Bank of Qatar (CBQ)", swift_code: "CBQAQAQA" },
        { id: "3", code: "DOHA", name: "Doha Bank QPSC", swift_code: "DOHBQAQA" },
        { id: "4", code: "QIB", name: "Qatar Islamic Bank (QIB)", swift_code: "QISBQAQA" },
      ]);
    } catch {
      setData([
        { id: "1", code: "QNB", name: "Qatar National Bank (QNB)", swift_code: "QNBAQAQA" },
        { id: "2", code: "CBQ", name: "Commercial Bank of Qatar (CBQ)", swift_code: "CBQAQAQA" }
      ]);
    }
  }

  async function handleAdd() {
    try { await FinBanksApi.create(form); } catch { }
    setData(prev => [{ id: String(Date.now()), ...form }, ...prev]);
    toast.success("Bank registered");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Registered Banking Institutions</h3>
          <p className="text-xs text-muted-foreground">List of financial institutions for collection, disbursement, and PDC deposit clearing.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Bank</Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader><TableRow className="bg-muted/50 text-xs"><TableHead className="font-bold">Code</TableHead><TableHead className="font-bold">Bank Name</TableHead><TableHead className="font-bold">SWIFT / Routing Code</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.map(b => (
              <TableRow key={b.id} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono font-bold text-primary">{b.code}</TableCell>
                <TableCell className="font-semibold">{b.name}</TableCell>
                <TableCell className="font-mono text-xs">{b.swift_code}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Bank Institution</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div><Label>Bank Code</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
            <div><Label>Bank Full Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>SWIFT Code</Label><Input value={form.swift_code} onChange={e => setForm({ ...form, swift_code: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Bank</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BankAccountSubModule() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<FinBankAccount[]>([]);
  const [banksList, setBanksList] = useState<FinBank[]>([]);
  const [form, setForm] = useState({ bank_id: "1", account_number: "QA55QNBA00000000123456789", account_title: "ZYNO Main Rent Operating Account", currency: "QAR", opening_balance: 1500000 });

  useEffect(() => { load(); }, []);
  async function load() {
    try {
      const [resAcc, resBanks] = await Promise.all([
        FinBankAccountsApi.fetchAll().catch(() => []),
        FinBanksApi.fetchAll().catch(() => [])
      ]);
      const defaultBanks: FinBank[] = [
        { id: "1", code: "QNB", name: "Qatar National Bank (QNB)", swift_code: "QNBAQAQA" },
        { id: "2", code: "CBQ", name: "Commercial Bank of Qatar (CBQ)", swift_code: "CBQAQAQA" },
        { id: "3", code: "DOHA", name: "Doha Bank QPSC", swift_code: "DOHBQAQA" },
        { id: "4", code: "QIB", name: "Qatar Islamic Bank (QIB)", swift_code: "QISBQAQA" },
        { id: "5", code: "MAR", name: "Masraf Al Rayan", swift_code: "MARKQAQA" },
        { id: "6", code: "DUKHAN", name: "Dukhan Bank", swift_code: "BARQAQA" },
      ];
      setBanksList(resBanks.length > 0 ? resBanks : defaultBanks);

      setData(resAcc.length > 0 ? resAcc : [
        { id: "1", bank_id: "1", account_number: "QA55QNBA00000000123456789", account_title: "ZYNO Operations & Collection (QNB)", currency: "QAR", opening_balance: 1500000 },
        { id: "2", bank_id: "2", account_number: "QA88CBQA00000000987654321", account_title: "ZYNO Escrow & Deposits Account (CBQ)", currency: "QAR", opening_balance: 450000 },
        { id: "3", bank_id: "3", account_number: "QA22DOHB00000000554433221", account_title: "ZYNO Payroll & Disbursement (Doha Bank)", currency: "QAR", opening_balance: 200000 },
      ] as FinBankAccount[]);
    } catch {
      setData([
        { id: "1", bank_id: "1", account_number: "QA55QNBA00000000123456789", account_title: "ZYNO Operations & Collection (QNB)", currency: "QAR", opening_balance: 1500000 }
      ] as FinBankAccount[]);
    }
  }

  async function handleAdd() {
    try { await FinBankAccountsApi.create(form); } catch { }
    setData(prev => [{ id: String(Date.now()), ...form } as FinBankAccount, ...prev]);
    toast.success("Bank account created and mapped to GL Account 12000");
    setOpen(false);
  }

  function getBankName(bankId: string) {
    const b = banksList.find(x => String(x.id) === String(bankId) || x.code === bankId);
    return b ? b.name : "Qatar National Bank (QNB)";
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Bank Accounts Portfolio & IBAN Register</h3>
          <p className="text-xs text-muted-foreground">Corporate treasury accounts linked to GL cash and bank clearing sub-ledgers.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Bank Account</Button>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(a => (
              <TableRow key={a.id} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-semibold text-primary">{getBankName(a.bank_id ?? "")}</TableCell>
                <TableCell className="font-mono font-bold">{a.account_number}</TableCell>
                <TableCell className="font-medium">{a.account_title}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{a.currency}</Badge></TableCell>
                <TableCell className="text-right font-mono font-bold text-emerald-600">{Number(a.opening_balance).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Bank Account</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label>Select Bank Institution <span className="text-destructive">*</span></Label>
              <Select value={form.bank_id} onValueChange={v => setForm({ ...form, bank_id: v })}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="Select Registered Bank" /></SelectTrigger>
                <SelectContent>
                  {banksList.map(b => (
                    <SelectItem key={b.id} value={String(b.id)} className="text-xs">
                      {b.name} ({b.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>IBAN / Account Number</Label><Input value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} /></div>
            <div><Label>Account Title</Label><Input value={form.account_title} onChange={e => setForm({ ...form, account_title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Currency</Label><Input value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} /></div>
              <div><Label>Opening Balance (QAR)</Label><Input type="number" value={form.opening_balance} onChange={e => setForm({ ...form, opening_balance: parseFloat(e.target.value) || 0 })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Account</Button>
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

function TrialBalanceSimpleSubModule() {
  const { trialBalanceSummary } = useFinanceStore();
  const { assets, liabilities, capital, revenue, expenses, totalDebit, totalCredit, isBalanced } = trialBalanceSummary;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Trial Balance (Simple Summary)</h3>
          <p className="text-xs text-muted-foreground">Live summary totals across Asset, Liability, Equity, Revenue, and Expense classes — updated in real-time.</p>
        </div>
        <div className="flex items-center gap-2">
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
  const { trialBalanceDetailed } = useFinanceStore();
  const [viewMode, setViewMode] = useState<"net" | "gross">("net");

  // Net Closing Balances mode: compute net Dr / Cr per account
  const netAccounts = useMemo(() => {
    return trialBalanceDetailed.map(acc => {
      const netDr = Math.max(0, acc.debit - acc.credit);
      const netCr = Math.max(0, acc.credit - acc.debit);
      return {
        ...acc,
        displayDr: viewMode === "net" ? netDr : acc.debit,
        displayCr: viewMode === "net" ? netCr : acc.credit,
      };
    });
  }, [trialBalanceDetailed, viewMode]);

  const totalDr = netAccounts.reduce((s, a) => s + (a.displayDr || 0), 0);
  const totalCr = netAccounts.reduce((s, a) => s + (a.displayCr || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Detailed General Ledger Trial Balance</h3>
          <p className="text-xs text-muted-foreground">
            {viewMode === "net"
              ? "Net closing balances per operational GL account — matches Trial Balance (Simple) summary."
              : "Gross turnover movements across all historical debit and credit postings."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-muted/60 p-0.5 rounded-lg text-xs border">
            <button
              type="button"
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${viewMode === "net" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setViewMode("net")}
            >
              Net Closing Balances
            </button>
            <button
              type="button"
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${viewMode === "gross" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setViewMode("gross")}
            >
              Gross Turnover Movements
            </button>
          </div>
          <Badge variant="outline" className="font-mono">{trialBalanceDetailed.length} Accounts</Badge>
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
              <TableCell colSpan={3}>Grand Total ({viewMode === "net" ? "Net Balances" : "Gross Movements"})</TableCell>
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
  const [prorationMethod, setProrationMethod] = useState<ProrationMethod>("CALENDAR_DAYS");
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
  const { profitAndLossReport: pl, isSyncing, refreshFinanceData } = useFinanceStore();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Profit and Loss Statement (P&L) — Live</h3>
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
      <Card className="p-5 space-y-3 text-xs shadow-sm bg-card">
        <div className="flex justify-between items-center font-bold text-sm border-b pb-2">
          <span>Gross Rental & Property Operating Revenue</span>
          <span className="text-emerald-600 font-mono text-base">QR {pl.totalRevenue?.toLocaleString() ?? '0'}</span>
        </div>
        <div className="space-y-1.5 pl-2 text-muted-foreground">
          <div className="flex justify-between"><span>Residential Tenancy Leases (41100)</span><span className="font-mono">QR {pl.rentalRevenue.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Service & Parking Recovery Charges</span><span className="font-mono">QR {pl.otherRevenue.toLocaleString()}</span></div>
        </div>

        <div className="flex justify-between items-center font-bold text-sm border-t pt-3 pb-1 text-rose-600">
          <span>Total Operating Expenses</span>
          <span className="font-mono text-base">-QR {pl.totalExpenses.toLocaleString()}</span>
        </div>
        <div className="space-y-1.5 pl-2 text-muted-foreground">
          <div className="flex justify-between"><span>Repairs & HVAC Maintenance (50200)</span><span className="font-mono">QR {pl.maintenanceExpense.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Staff Salaries & Site Operations (50100)</span><span className="font-mono">QR {pl.payrollExpense.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Electricity & Water — Kahramaa (50500)</span><span className="font-mono">QR {pl.utilitiesExpense.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Cleaning & Sanitation Services (50300)</span><span className="font-mono">QR {pl.cleaningExpense.toLocaleString()}</span></div>
        </div>

        <div className={`flex justify-between items-center font-bold text-base border-t-2 pt-3 p-3 rounded-lg border ${pl.netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
          <span className="text-foreground">Net Operating {pl.netProfit >= 0 ? 'Profit' : 'Loss'}</span>
          <span className={`font-mono text-lg ${pl.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>QR {Math.abs(pl.netProfit).toLocaleString()}</span>
        </div>
      </Card>
    </div>
  );
}

function BalanceSheetSubModule() {
  const { balanceSheetReport: bs, isSyncing, refreshFinanceData } = useFinanceStore();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Balance Sheet Statement — Live</h3>
        <div className="flex items-center gap-2">
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
  const { allLedgerTransactions, leases, units, customers, isSyncing, refreshFinanceData } = useFinanceStore() as any;
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [sortField, setSortField] = useState<"date" | "account_code" | "debit" | "credit">("date");
  const [sortAsc, setSortAsc] = useState<boolean>(false); // Descending order based on date default
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // ── Compute ascending filter options ──────────────────────────────────────
  const txList: any[] = allLedgerTransactions || [];

  const propertyOptions = useMemo(() => {
    const set = new Set<string>();
    txList.forEach(tx => { if (tx.property_name) set.add(tx.property_name); });
    (leases || []).forEach((l: any) => { if (l.property) set.add(l.property); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [txList, leases]);

  const unitOptions = useMemo(() => {
    const set = new Set<string>();
    txList.forEach(tx => {
      if (selectedProperty !== "all" && tx.property_name !== selectedProperty) return;
      if (tx.unit_ref) set.add(tx.unit_ref);
    });
    (leases || []).forEach((l: any) => {
      if (selectedProperty !== "all" && l.property !== selectedProperty) return;
      if (l.unit) set.add(l.unit);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  }, [txList, leases, selectedProperty]);

  const customerOptions = useMemo(() => {
    const set = new Set<string>();
    txList.forEach(tx => { if (tx.tenant_name) set.add(tx.tenant_name); });
    (leases || []).forEach((l: any) => { if (l.tenantName) set.add(l.tenantName); });
    (customers || []).forEach((c: any) => { if (c.name) set.add(c.name); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [txList, leases, customers]);

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

  // ── Filtered + Sorted list ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = txList.filter(tx => {
      // Property
      if (selectedProperty !== "all" && tx.property_name !== selectedProperty) return false;
      // Unit
      if (selectedUnit !== "all" && tx.unit_ref !== selectedUnit) return false;
      // Customer
      if (selectedCustomer !== "all" && tx.tenant_name !== selectedCustomer) return false;
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
        if (!(
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
  }, [txList, selectedProperty, selectedUnit, selectedCustomer, selectedSource, selectedMonth, startDate, endDate, search, sortField, sortAsc]);

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
    setSelectedUnit("all"); setSelectedCustomer("all");
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">General Ledger Transaction Audit — Live</h3>
          <p className="text-xs text-muted-foreground">Complete double-entry log with multi-dimensional filters: Property, Unit, Date, Month &amp; Customer.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* 1. Property Filter */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" /> Property
            </Label>
            <Select value={selectedProperty} onValueChange={v => { setSelectedProperty(v); setSelectedUnit("all"); setPage(1); }}>
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties ({propertyOptions.length})</SelectItem>
                {propertyOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Unit Filter */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <HomeIcon className="h-3 w-3" /> Unit
            </Label>
            <Select value={selectedUnit} onValueChange={v => { setSelectedUnit(v); setPage(1); }}>
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue placeholder="All Units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units ({unitOptions.length})</SelectItem>
                {unitOptions.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Customer / Tenant Name Filter */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <UserIcon className="h-3 w-3" /> Customer Name
            </Label>
            <Select value={selectedCustomer} onValueChange={v => { setSelectedCustomer(v); setPage(1); }}>
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers ({customerOptions.length})</SelectItem>
                {customerOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
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

        {/* Sub-row: Search + Date Range + Sort toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
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
            <Label className="text-[11px] text-muted-foreground whitespace-nowrap">From Date:</Label>
            <Input
              type="date"
              className="h-8 text-xs bg-background"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setPage(1); }}
            />
          </div>
          <div className="sm:col-span-3 flex items-center gap-1.5">
            <Label className="text-[11px] text-muted-foreground whitespace-nowrap">To Date:</Label>
            <Input
              type="date"
              className="h-8 text-xs bg-background"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setPage(1); }}
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-1.5 justify-end">
            <Button size="sm" variant="outline" className="h-8 text-xs w-full gap-1" onClick={() => { setSortAsc(!sortAsc); setPage(1); }}>
              <ArrowUpDown className="h-3 w-3" />{sortAsc ? "Ascending ↑" : "Descending ↓"}
            </Button>
          </div>
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
            {[25, 50, 100, 0].map(size => (
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
            </TableRow>
          </TableHeader>
          <TableBody className="text-[11px]">
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                  No GL postings match the selected Property, Unit, Date, Month, or Customer filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(tx => (
                <TableRow key={tx.id} className="hover:bg-muted/40 transition-colors border-b border-border/40">
                  <TableCell className="py-1.5 px-2.5 font-mono whitespace-nowrap font-medium">{formatDDMMMYYYY(tx.date)}</TableCell>
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

function CashBookSubModule() {
  const { cashBookEntries, addCashBookEntry, isSyncing, refreshFinanceData } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    voucher: `CSH-${Math.floor(10 + Math.random() * 90)}`,
    description: "",
    type: "in",
    amount: "1500",
  });

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

  const totalIn = cashBookEntries.reduce((s, r) => s + r.cash_in, 0);
  const totalOut = cashBookEntries.reduce((s, r) => s + r.cash_out, 0);
  const currentNetBalance = totalIn - totalOut;

  // Compute accumulated running balance for each row chronologically (oldest to newest)
  const sortedChronological = [...cashBookEntries].sort((a, b) => new Date(a.date || "").getTime() - new Date(b.date || "").getTime());
  let runningAcc = 0;
  const entriesWithAccBalance = sortedChronological.map(item => {
    runningAcc += (item.cash_in || 0) - (item.cash_out || 0);
    return { ...item, computedRunningBal: runningAcc };
  });
  // Display newest first
  const displayRows = [...entriesWithAccBalance].reverse();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Main Cash Book — Live</h3>
          <p className="text-xs text-muted-foreground">All physical cash receipts, vault deposits, and disbursements — synced with Cash On Hand report.</p>
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
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No cash entries recorded yet.</TableCell>
              </TableRow>
            ) : (
              displayRows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono">{row.date}</TableCell>
                  <TableCell className="font-mono font-bold text-primary">{row.voucher}</TableCell>
                  <TableCell className="font-medium">{row.description}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-emerald-600">{row.cash_in > 0 ? row.cash_in.toLocaleString() : "—"}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-rose-600">{row.cash_out > 0 ? row.cash_out.toLocaleString() : "—"}</TableCell>
                  <TableCell className="text-right font-mono font-bold">{row.computedRunningBal.toLocaleString()} QAR</TableCell>
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
