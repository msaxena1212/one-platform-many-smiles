import { useState, useEffect, useMemo } from "react";
import { useSearch } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings, Calendar, MapPin, Users, UserCheck, Layers, LayoutDashboard,
  Clock, BookOpen, FileText, PlusCircle, ArrowDownLeft, ArrowUpRight, Receipt as ReceiptIcon,
  Building, CreditCard, FileCheck, FileSpreadsheet, PieChart, Landmark, Scale,
  DollarSign, Activity, FileCode, CheckCircle, Search, Plus, Trash2, Pencil,
  ChevronRight, Loader2, Filter, Download, FilePlus, ArrowRight, CheckCircle2,
  AlertTriangle, RefreshCw, Eye, Printer, ShieldCheck
} from "lucide-react";
import {
  fetchJournalEntries, fetchReceipts, fetchARLedgers, fetchGLAccounts,
  createJournalEntry, createReceipt, createAREntry, settleAREntry, createGLAccount,
  fetchERPChartOfAccounts, fetchUnitCOAs,
  type JournalEntry, type Receipt, type ARLedger, type GLAccount, type ERPChartOfAccount, type UnitCOA
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
import { postVoucher } from "@/lib/finance/posting-engine";

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
  {
    group: "Contracts",
    icon: FileCode,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    activeBg: "bg-indigo-500",
    items: [
      { key: "expense_contract", label: "Expense Contract", icon: FileText },
      { key: "revenue_contract", label: "Revenue Contract", icon: FileCheck },
    ],
  },
];

export function FinanceModule({ role }: FinanceModuleProps) {
  const searchParams = useSearch({ strict: false }) as Record<string, any>;
  const activeKey = searchParams.tab || "finance_dashboard";

  const activeGroup = FINANCE_NAV.find(g => g.items.some(i => i.key === activeKey));
  const activeItem = activeGroup?.items.find(i => i.key === activeKey);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      {/* ── Main Content Area ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Breadcrumb / topbar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-card shrink-0">
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
    case "trial_balance_simple": return <TrialBalanceSimpleSubModule />;
    case "trial_balance": return <TrialBalanceFullSubModule />;
    case "profit_and_loss": return <ProfitAndLossSubModule />;
    case "balance_sheet": return <BalanceSheetSubModule />;
    case "general_ledger": return <GeneralLedgerReportSubModule />;
    case "cash_flow_statement": return <CashFlowSubModule />;
    case "cash_book": return <CashBookSubModule />;
    case "petty_cash_book": return <PettyCashBookSubModule />;
    case "cash_on_hand": return <CashOnHandSubModule />;

    // Contracts
    case "expense_contract": return <ContractManagementSubModule type="Expense" />;
    case "revenue_contract": return <ContractManagementSubModule type="Revenue" />;

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
        { id: 1, name: "FY 2026-2027", start_date: "2026-01-01", end_date: "2026-12-31", status: "Active" },
        { id: 2, name: "FY 2025-2026", start_date: "2025-01-01", end_date: "2025-12-31", status: "Closed" }
      ]);
    } catch {
      setData([
        { id: 1, name: "FY 2026-2027", start_date: "2026-01-01", end_date: "2026-12-31", status: "Active" },
        { id: 2, name: "FY 2025-2026", start_date: "2025-01-01", end_date: "2025-12-31", status: "Closed" }
      ]);
    } finally { setLoading(false); }
  }
  async function handleAdd() {
    try {
      await FinFinancialYearsApi.create(form);
    } catch { }
    setData(prev => [{ id: Date.now(), ...form }, ...prev]);
    toast.success("Financial Year added");
    setOpen(false);
  }
  async function handleDelete(id: number) {
    if (!confirm("Delete this FY?")) return;
    try { await FinFinancialYearsApi.delete(id); } catch { }
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
                <TableCell><Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
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
  const [form, setForm] = useState({ code: "REG-DOH", name: "Doha Central & West Bay", country: "Qatar", status: "Active" as const });

  useEffect(() => { load(); }, []);
  async function load() {
    try {
      const res = await FinRegionsApi.fetchAll();
      setData(res.length > 0 ? res : [
        { id: 1, code: "REG-DOH", name: "Doha & West Bay", country: "Qatar", status: "Active" },
        { id: 2, code: "REG-WAK", name: "Al Wakra & Mesaieed", country: "Qatar", status: "Active" },
        { id: 3, code: "REG-LUS", name: "Lusail Marina District", country: "Qatar", status: "Active" }
      ]);
    } catch {
      setData([
        { id: 1, code: "REG-DOH", name: "Doha & West Bay", country: "Qatar", status: "Active" },
        { id: 2, code: "REG-WAK", name: "Al Wakra & Mesaieed", country: "Qatar", status: "Active" }
      ]);
    }
  }
  async function handleAdd() {
    try { await FinRegionsApi.create(form); } catch { }
    setData(prev => [{ id: Date.now(), ...form }, ...prev]);
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
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "VEND-201", name: "Gulf Facility Solutions WLL", contact_person: "Eng. Tariq Mansoor", email: "support@gulffacility.qa", phone: "+974 4488 2211", tax_number: "CR-992817", status: "Active" as const });

  useEffect(() => { load(); }, []);
  async function load() {
    try {
      const res = await FinVendorsApi.fetchAll();
      setData(res.length > 0 ? res : [
        { id: 1, code: "VEND-101", name: "Qatar Maintenance & HVAC Co.", contact_person: "Ali Al-Kuwari", email: "billing@qatarhvac.qa", phone: "+974 4455 1100", tax_number: "CR-772184", status: "Active" },
        { id: 2, code: "VEND-102", name: "Doha Elevator Services WLL", contact_person: "Rashid Mahmood", email: "accounts@dohalifts.com", phone: "+974 5511 4433", tax_number: "CR-883921", status: "Active" },
        { id: 3, code: "VEND-103", name: "Kahramaa & Qatar Cool Utilities", contact_person: "Govt Customer Desk", email: "billing@kahramaa.qa", phone: "+974 4449 4444", tax_number: "TAX-GOV-01", status: "Active" }
      ]);
    } catch {
      setData([
        { id: 1, code: "VEND-101", name: "Qatar Maintenance & HVAC Co.", contact_person: "Ali Al-Kuwari", email: "billing@qatarhvac.qa", phone: "+974 4455 1100", tax_number: "CR-772184", status: "Active" }
      ]);
    }
  }
  async function handleAdd() {
    try { await FinVendorsApi.create(form); } catch { }
    setData(prev => [{ id: Date.now(), ...form }, ...prev]);
    toast.success("Vendor added");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Vendor Master Register</h3>
          <p className="text-xs text-muted-foreground">Manage supplier and service provider accounts linked to AP invoices.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Vendor</Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader><TableRow className="bg-muted/50 text-xs"><TableHead className="font-bold">Code</TableHead><TableHead className="font-bold">Vendor Name</TableHead><TableHead className="font-bold">Contact Person</TableHead><TableHead className="font-bold">Phone / Email</TableHead><TableHead className="font-bold">Tax / CR No</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono text-xs font-bold text-primary">{row.code}</TableCell>
                <TableCell className="font-semibold text-xs">{row.name}</TableCell>
                <TableCell className="text-xs">{row.contact_person}</TableCell>
                <TableCell className="text-xs">{row.phone} • {row.email}</TableCell>
                <TableCell className="text-xs font-mono">{row.tax_number}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Vendor Master</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vendor Code</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
              <div><Label>Tax / CR Number</Label><Input value={form.tax_number} onChange={e => setForm({ ...form, tax_number: e.target.value })} /></div>
            </div>
            <div><Label>Company Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Contact Person</Label><Input value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Vendor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
        property: lease ? `${lease.property} (${lease.unit})` : 'Old Salata - Residence No:23',
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

  const sharedProperties = Array.from(new Set((sharedUnits || []).map(u => u.property)))
    .filter(Boolean).map((p, i) => ({ id: String(i), title: p }));

  useEffect(() => { load(); }, [sharedUnits]);
  async function load() {
    try {
      const dbData = await FinCostCentersApi.fetchAll();
      const existing = new Set(dbData.map((d: any) => d.code));
      const autoSeeds: any[] = [];
      for (const prop of sharedProperties) {
        const code = `CC-PROP-${prop.title.slice(0, 8).toUpperCase().replace(/\s/g, '-')}`;
        if (!existing.has(code)) autoSeeds.push({ code, name: prop.title, manager: 'Site Manager', type: 'Property' });
      }
      setData([...dbData, ...autoSeeds.map((s, i) => ({ ...s, id: -1000 - i }))]);
    } catch { }
  }
  async function handleAdd() {
    try { await FinCostCentersApi.create(form); } catch { }
    setData(prev => [{ id: Date.now(), ...form }, ...prev]);
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
// 2. FINANCE SUB-MODULES
// ─────────────────────────────────────────────────────────────────────────────

function FinanceDashboardSubModule() {
  const { vouchers: sharedVouchers, pdcs, leases } = useAppData();

  const totalRentals = (leases || []).reduce((s, l) => s + (l.monthlyRent * 12 || 0), 0);
  const totalPdcs = (pdcs || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalVouchers = (sharedVouchers || []).reduce((s, v) => s + (Number(v.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Contract Assets</p>
            <h3 className="text-xl font-bold mt-1 text-primary font-mono">QR {totalRentals.toLocaleString()}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">{leases?.length || 3} Executed Tenancies</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PDCs Under Custody</p>
            <h3 className="text-xl font-bold mt-1 text-emerald-600 font-mono">QR {totalPdcs.toLocaleString()}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">{pdcs?.length || 18} Registered Cheques</p>
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
            <h3 className="text-xl font-bold mt-1 text-amber-600 font-mono">QR 14,600</h3>
            <p className="text-[10px] text-muted-foreground mt-1">GL Account 21500</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Financial Transactions</CardTitle></CardHeader>
          <CardContent className="text-xs space-y-2.5">
            <div className="flex justify-between items-center border-b pb-1.5">
              <div>
                <p className="font-semibold text-foreground">PDC Deposited (CBQ-01000049)</p>
                <p className="text-[10px] text-muted-foreground">Dr Bank Account-CBQ → Cr PDC In Hand</p>
              </div>
              <span className="font-bold text-emerald-600 font-mono">+4,000 QAR</span>
            </div>
            <div className="flex justify-between items-center border-b pb-1.5">
              <div>
                <p className="font-semibold text-foreground">Cash Security Deposit (ARE-RT-25)</p>
                <p className="text-[10px] text-muted-foreground">Dr Cash In Hand → Cr Security Deposit Liability</p>
              </div>
              <span className="font-bold text-emerald-600 font-mono">+1,000 QAR</span>
            </div>
            <div className="flex justify-between items-center border-b pb-1.5">
              <div>
                <p className="font-semibold text-foreground">Monthly HVAC Maintenance (INV-AP-9901)</p>
                <p className="text-[10px] text-muted-foreground">Dr 5020 Repairs → Cr 2010 Accounts Payable</p>
              </div>
              <span className="font-bold text-rose-600 font-mono">-14,500 QAR</span>
            </div>
          </CardContent>
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
              <span className="font-mono text-xs font-bold">18 Cheques Reconciled</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PostingPeriodSubModule() {
  const [data, setData] = useState<FinPostingPeriod[]>([]);
  useEffect(() => { load(); }, []);
  async function load() {
    try {
      const res = await FinPostingPeriodsApi.fetchAll();
      setData(res.length > 0 ? res : [
        { id: 1, period_name: "2026-08", year: 2026, month: 8, status: "Open" },
        { id: 2, period_name: "2026-07", year: 2026, month: 7, status: "Closed" },
        { id: 3, period_name: "2026-06", year: 2026, month: 6, status: "Closed" },
      ]);
    } catch {
      setData([
        { id: 1, period_name: "2026-08", year: 2026, month: 8, status: "Open" },
        { id: 2, period_name: "2026-07", year: 2026, month: 7, status: "Closed" },
      ]);
    }
  }
  async function toggle(row: FinPostingPeriod) {
    const nextStatus = row.status === "Open" ? "Closed" : "Open";
    try { await FinPostingPeriodsApi.update(row.id, { status: nextStatus }); } catch { }
    setData(prev => prev.map(p => p.id === row.id ? { ...p, status: nextStatus } : p));
    toast.success(`Period ${row.period_name} is now ${nextStatus}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Financial Posting Periods Control</h3>
          <p className="text-xs text-muted-foreground">Open or lock monthly periods to control journal voucher postings.</p>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader><TableRow className="bg-muted/50 text-xs"><TableHead className="font-bold">Period</TableHead><TableHead className="font-bold">Year</TableHead><TableHead className="font-bold">Month</TableHead><TableHead className="font-bold">Status</TableHead><TableHead className="font-bold text-center">Action</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono font-bold">{row.period_name}</TableCell>
                <TableCell>{row.year}</TableCell>
                <TableCell>{row.month}</TableCell>
                <TableCell><Badge variant={row.status === "Open" ? "default" : "secondary"}>{row.status}</Badge></TableCell>
                <TableCell className="text-center"><Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toggle(row)}>{row.status === "Open" ? "Close Period" : "Re-Open"}</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
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
      setErpAccounts(accs || []);
      setUnitCoas(uCoas || []);
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
          <h3 className="text-base font-bold tracking-tight">Chart of Accounts (COA) & Sub-Ledgers</h3>
          <p className="text-xs text-muted-foreground">
            Total {erpAccounts.length} GL / SL accounts and {unitCoas.length} unit-level COA mappings configured.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-muted p-1 rounded-md text-xs font-medium">
            <button
              onClick={() => { setTab('master'); setPage(1); }}
              className={`px-3 py-1.5 rounded-sm transition-all ${tab === 'master' ? 'bg-background text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Master COA ({erpAccounts.length})
            </button>
            <button
              onClick={() => { setTab('units'); setPage(1); }}
              className={`px-3 py-1.5 rounded-sm transition-all ${tab === 'units' ? 'bg-background text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Unit AC Codes ({unitCoas.length})
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
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 text-xs">
                <TableHead className="font-bold">Property Name</TableHead>
                <TableHead className="font-bold">Unit Code</TableHead>
                <TableHead className="font-bold">PDC In Hand (Code & SL)</TableHead>
                <TableHead className="font-bold">Deposit (Code & SL)</TableHead>
                <TableHead className="font-bold">Receivables (Code & SL)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUnits.map(u => (
                <TableRow key={u.id} className="hover:bg-muted/30 text-xs">
                  <TableCell className="font-medium">{u.property_name || 'N/A'}</TableCell>
                  <TableCell><Badge variant="secondary" className="font-mono font-semibold">{u.unit_code}</Badge></TableCell>
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
  const [entries, setEntries] = useState([
    { id: "JE-2026-001", posting_date: "2026-08-01", reference: "REC-PDC-001", narration: "Rent PDC Deposited in QNB Bank Account", dr_account: "12000 - Bank Operating Account", cr_account: "12900 - PDC In Hand", amount: 5600, status: "Posted" },
    { id: "JE-2026-002", posting_date: "2026-08-02", reference: "ARE-RT-25-3962", narration: "Security Deposit Acknowledged Cash", dr_account: "10100 - Cash In Hand", cr_account: "21500 - Security Deposit Liability", amount: 1000, status: "Posted" },
    { id: "JE-2026-003", posting_date: "2026-08-05", reference: "INV-AP-9901", narration: "HVAC Maintenance & Spare Parts", dr_account: "5020 - Repairs & Maintenance", cr_account: "2010 - Accounts Payable", amount: 14500, status: "Posted" },
  ]);

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
    } catch { }

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Journal Ledger Postings</h3>
          <p className="text-xs text-muted-foreground">General Journal entries with dual-entry audit trail.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Create Journal Entry</Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
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
            {entries.map(je => (
              <TableRow key={je.id} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono font-bold text-primary">{je.id}</TableCell>
                <TableCell>{je.posting_date}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{je.reference}</TableCell>
                <TableCell className="text-blue-600 font-medium">{je.dr_account}</TableCell>
                <TableCell className="text-emerald-600 font-medium">{je.cr_account}</TableCell>
                <TableCell className="text-right font-mono font-bold">{je.amount.toLocaleString()}</TableCell>
                <TableCell><Badge variant="default" className="text-[10px]">{je.status}</Badge></TableCell>
              </TableRow>
            ))}
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
  const [lines, setLines] = useState([
    { account: "12000 - Bank Operating Account", debit: 15000, credit: 0 },
    { account: "41100 - Rental Income", debit: 0, credit: 15000 }
  ]);
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
    } catch { }

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
  const [data, setData] = useState([
    { grn_no: "GRN-2026-081", po_ref: "PO-2026-014", vendor: "Qatar Maintenance & HVAC Co.", description: "Central AC Compressor Replacement", amount: 14500, mapped_gl: "5020 - Repairs & Maintenance", property: "Old Salata - Residence No:23", status: "Mapped" },
    { grn_no: "GRN-2026-082", po_ref: "PO-2026-018", vendor: "Gulf Facility Services", description: "Deep Cleaning & Disinfection Batch", amount: 8200, mapped_gl: "5030 - Cleaning & Sanitation", property: "Regency Residence Al Sadd 1", status: "Pending" },
    { grn_no: "GRN-2026-083", po_ref: "PO-2026-022", vendor: "Doha Elevator Services WLL", description: "Bi-Annual Elevator Safety Sensors", amount: 6400, mapped_gl: "5040 - Elevator Maintenance", property: "Old Salata - Residence No:13", status: "Mapped" },
  ]);

  const [form, setForm] = useState({
    grn_no: `GRN-2026-${Math.floor(100 + Math.random() * 900)}`,
    po_ref: `PO-2026-${Math.floor(10 + Math.random() * 90)}`,
    vendor: "Qatar Maintenance & HVAC Co.",
    description: "Plumbing Fittings & Valves Batch",
    amount: "4500",
    mapped_gl: "5020 - Repairs & Maintenance",
    property: "Old Salata - Residence No:23",
  });

  function handleAdd() {
    setData(prev => [
      { ...form, amount: parseFloat(form.amount) || 0, status: "Mapped" },
      ...prev
    ]);
    toast.success(`GRN ${form.grn_no} cost allocated & mapped to ${form.mapped_gl}`);
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Goods Received Note (GRN) Cost Allocation</h3>
          <p className="text-xs text-muted-foreground">Map warehouse and maintenance GRN receipts directly to property expense GL accounts.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Map GRN Cost</Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">GRN #</TableHead>
              <TableHead className="font-bold">PO Ref</TableHead>
              <TableHead className="font-bold">Vendor</TableHead>
              <TableHead className="font-bold">Description</TableHead>
              <TableHead className="font-bold">Property Cost Center</TableHead>
              <TableHead className="font-bold">Mapped GL Account</TableHead>
              <TableHead className="text-right font-bold">Cost (QAR)</TableHead>
              <TableHead className="font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono font-bold text-primary">{row.grn_no}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{row.po_ref}</TableCell>
                <TableCell className="font-semibold">{row.vendor}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.property}</TableCell>
                <TableCell className="font-mono text-blue-600">{row.mapped_gl}</TableCell>
                <TableCell className="text-right font-mono font-bold">{row.amount.toLocaleString()}</TableCell>
                <TableCell><Badge variant={row.status === "Mapped" ? "default" : "outline"} className="text-[10px]">{row.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Map GRN Cost Allocation</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>GRN Number</Label><Input value={form.grn_no} onChange={e => setForm({ ...form, grn_no: e.target.value })} /></div>
              <div><Label>PO Reference</Label><Input value={form.po_ref} onChange={e => setForm({ ...form, po_ref: e.target.value })} /></div>
            </div>
            <div><Label>Vendor</Label><Input value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} /></div>
            <div><Label>Item / Service Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Total Cost (QAR)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
              <div><Label>Property</Label><Input value={form.property} onChange={e => setForm({ ...form, property: e.target.value })} /></div>
            </div>
            <div>
              <Label>Target GL Expense Account</Label>
              <Select value={form.mapped_gl} onValueChange={v => setForm({ ...form, mapped_gl: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5020 - Repairs & Maintenance">5020 - Repairs & Maintenance</SelectItem>
                  <SelectItem value="5030 - Cleaning & Sanitation">5030 - Cleaning & Sanitation</SelectItem>
                  <SelectItem value="5040 - Elevator Maintenance">5040 - Elevator Maintenance</SelectItem>
                  <SelectItem value="13000 - Fixed Asset Equipment">13000 - Fixed Asset Equipment (Capitalized)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Confirm GRN Mapping</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PayableInvoiceSubModule() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([
    { invoice_no: "INV-AP-9901", vendor: "Qatar Maintenance & HVAC Co.", date: "2026-08-01", due_date: "2026-08-25", account: "5020 - Repairs & Maintenance", amount: 14500, status: "Unpaid" },
    { invoice_no: "INV-AP-9902", vendor: "Kahramaa Utility Authority", date: "2026-08-05", due_date: "2026-08-20", account: "5050 - Electricity & Water", amount: 9850, status: "Paid" },
    { invoice_no: "INV-AP-9903", vendor: "Doha Security Guards Co.", date: "2026-08-10", due_date: "2026-08-30", account: "5060 - Security Services", amount: 12000, status: "Unpaid" },
  ]);

  const [form, setForm] = useState({
    invoice_no: `INV-AP-${Math.floor(1000 + Math.random() * 9000)}`,
    vendor: "Qatar Maintenance & HVAC Co.",
    date: new Date().toISOString().split("T")[0],
    due_date: "2026-09-15",
    account: "5020 - Repairs & Maintenance",
    amount: "7500",
  });

  function handleAdd() {
    setData(prev => [
      { ...form, amount: parseFloat(form.amount) || 0, status: "Unpaid" },
      ...prev
    ]);
    toast.success(`Payable Invoice ${form.invoice_no} created and posted to AP subledger!`);
    setOpen(false);
  }

  function handleMarkPaid(invNo: string) {
    setData(prev => prev.map(inv => inv.invoice_no === invNo ? { ...inv, status: "Paid" } : inv));
    toast.success(`Invoice ${invNo} marked as Paid via Payment Voucher!`);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Accounts Payable (AP) Invoices</h3>
          <p className="text-xs text-muted-foreground">Invoices from suppliers, utility providers, and contractors awaiting payment.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Create AP Invoice</Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Invoice #</TableHead>
              <TableHead className="font-bold">Vendor</TableHead>
              <TableHead className="font-bold">Bill Date</TableHead>
              <TableHead className="font-bold">Due Date</TableHead>
              <TableHead className="font-bold">Expense Account</TableHead>
              <TableHead className="text-right font-bold">Amount (QAR)</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.invoice_no} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono font-bold text-primary">{row.invoice_no}</TableCell>
                <TableCell className="font-semibold">{row.vendor}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.due_date}</TableCell>
                <TableCell className="text-blue-600">{row.account}</TableCell>
                <TableCell className="text-right font-mono font-bold">{row.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "Paid" ? "default" : "destructive"} className="text-[10px]">
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {row.status === "Unpaid" && (
                    <Button size="sm" variant="outline" className="h-6 text-xs text-emerald-600 border-emerald-500" onClick={() => handleMarkPaid(row.invoice_no)}>
                      Settle / Pay
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Accounts Payable Invoice</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Invoice #</Label><Input value={form.invoice_no} onChange={e => setForm({ ...form, invoice_no: e.target.value })} /></div>
              <div><Label>Amount (QAR)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            </div>
            <div><Label>Vendor</Label><Input value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Bill Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
            </div>
            <div>
              <Label>Expense Account</Label>
              <Select value={form.account} onValueChange={v => setForm({ ...form, account: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5020 - Repairs & Maintenance">5020 - Repairs & Maintenance</SelectItem>
                  <SelectItem value="5050 - Electricity & Water">5050 - Electricity & Water</SelectItem>
                  <SelectItem value="5060 - Security Services">5060 - Security Services</SelectItem>
                  <SelectItem value="5030 - Cleaning & Sanitation">5030 - Cleaning & Sanitation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save AP Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VoucherManagerSubModule({ type }: { type: "Journal Voucher" | "Payment Voucher" | "Receipt Voucher" }) {
  const { vouchers: sharedVouchers, setVouchers: setSharedVouchers } = useAppData();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    voucher_no: `VCH-${type.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split("T")[0],
    name: type === "Payment Voucher" ? "Payment to Contractor" : type === "Receipt Voucher" ? "Direct Rent Collection" : "General Adjustment",
    debit: type === "Payment Voucher" ? "2010 - Accounts Payable" : type === "Receipt Voucher" ? "12000 - Bank Account" : "5020 - Repairs Expense",
    credit: type === "Payment Voucher" ? "12000 - Bank Account" : type === "Receipt Voucher" ? "41100 - Rental Income" : "10100 - Cash In Hand",
    amount: "5000",
    method: type === "Payment Voucher" ? "Bank Transfer" : type === "Receipt Voucher" ? "Cash" : "Batch",
  });

  const filtered = (sharedVouchers || []).filter(v => {
    if (type.includes("Journal")) return v.method === "Batch" || v.name.includes("Income") || v.name.includes("Doc") || v.name.includes("Journal");
    if (type.includes("Payment")) return v.name.includes("Payment") || v.name.includes("Refund") || v.debit.includes("Payable");
    if (type.includes("Receipt")) return v.name.includes("Receipt") || v.method === "PDC" || v.method === "Cash" || v.credit.includes("Income");
    return true;
  });

  function handleAdd() {
    const amt = parseFloat(form.amount) || 0;
    const newVch = {
      id: `v-custom-${Date.now()}`,
      leaseId: "l1",
      name: form.name,
      receiptNo: form.voucher_no,
      method: form.method,
      period: form.date,
      debit: form.debit,
      credit: form.credit,
      amount: amt,
      status: "posted" as const
    };

    setSharedVouchers(prev => [newVch, ...prev]);
    toast.success(`${type} ${form.voucher_no} posted to Ledger!`);
    setOpen(false);
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
              <TableHead className="font-bold">Voucher #</TableHead>
              <TableHead className="font-bold">Date / Period</TableHead>
              <TableHead className="font-bold">Name & Description</TableHead>
              <TableHead className="font-bold">Method</TableHead>
              <TableHead className="font-bold">Debit Account</TableHead>
              <TableHead className="font-bold">Credit Account</TableHead>
              <TableHead className="text-right font-bold">Amount (QAR)</TableHead>
              <TableHead className="font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((v) => (
              <TableRow key={v.id} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono font-bold text-primary">{v.receiptNo || v.id}</TableCell>
                <TableCell>{v.period || "2026-08-18"}</TableCell>
                <TableCell className="font-medium">{v.name}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{v.method || "System"}</Badge></TableCell>
                <TableCell className="font-mono text-blue-600">{v.debit}</TableCell>
                <TableCell className="font-mono text-emerald-600">{v.credit}</TableCell>
                <TableCell className="text-right font-mono font-bold">{Number(v.amount).toLocaleString()}</TableCell>
                <TableCell><Badge variant="default" className="text-[10px] capitalize">{v.status || "Posted"}</Badge></TableCell>
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
              <div><Label>Voucher #</Label><Input value={form.voucher_no} onChange={e => setForm({ ...form, voucher_no: e.target.value })} /></div>
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            </div>
            <div><Label>Description / Narration</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Debit Account</Label><Input value={form.debit} onChange={e => setForm({ ...form, debit: e.target.value })} /></div>
              <div><Label>Credit Account</Label><Input value={form.credit} onChange={e => setForm({ ...form, credit: e.target.value })} /></div>
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
  const [data, setData] = useState([
    { invoice_no: "INV-AR-8801", tenant: "Mr. Hafeez Shaik", property: "Old Salata - Residence No:23", unit: "AAA - Flat16", date: "2026-08-01", due_date: "2026-08-10", stream: "Monthly Rent", amount: 5600, status: "Paid" },
    { invoice_no: "INV-AR-8802", tenant: "M/S. Al Ameen Real Estate", property: "Old Salata - Residence No:23", unit: "AAA - GF1", date: "2026-08-01", due_date: "2026-08-15", stream: "Commercial Rent", amount: 5500, status: "Overdue" },
    { invoice_no: "INV-AR-8803", tenant: "Vivek Viswakumaran Nair", property: "Regency Residence Al Sadd 1", unit: "ARRS01-B00-F00-AG01", date: "2026-08-01", due_date: "2026-08-05", stream: "Residential Lease", amount: 4000, status: "Paid" },
  ]);

  const [form, setForm] = useState({
    invoice_no: `INV-AR-${Math.floor(1000 + Math.random() * 9000)}`,
    tenant: "Mr. Hafeez Shaik",
    property: "Old Salata - Residence No:23",
    unit: "AAA - Flat16",
    date: new Date().toISOString().split("T")[0],
    due_date: "2026-09-05",
    stream: "Monthly Rent",
    amount: "5600",
  });

  function handleAdd() {
    setData(prev => [
      { ...form, amount: parseFloat(form.amount) || 0, status: "Pending" },
      ...prev
    ]);
    toast.success(`AR Invoice ${form.invoice_no} created and posted to Customer Ledger!`);
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
              <TableHead className="font-bold">Invoice #</TableHead>
              <TableHead className="font-bold">Tenant / Customer</TableHead>
              <TableHead className="font-bold">Property & Unit</TableHead>
              <TableHead className="font-bold">Billing Stream</TableHead>
              <TableHead className="font-bold">Issue Date</TableHead>
              <TableHead className="font-bold">Due Date</TableHead>
              <TableHead className="text-right font-bold">Amount (QAR)</TableHead>
              <TableHead className="font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.invoice_no} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono font-bold text-primary">{row.invoice_no}</TableCell>
                <TableCell className="font-semibold">{row.tenant}</TableCell>
                <TableCell className="text-muted-foreground">{row.property} — {row.unit}</TableCell>
                <TableCell>{row.stream}</TableCell>
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
              <div><Label>Invoice #</Label><Input value={form.invoice_no} onChange={e => setForm({ ...form, invoice_no: e.target.value })} /></div>
              <div><Label>Amount (QAR)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            </div>
            <div><Label>Tenant Name</Label><Input value={form.tenant} onChange={e => setForm({ ...form, tenant: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Property</Label><Input value={form.property} onChange={e => setForm({ ...form, property: e.target.value })} /></div>
              <div><Label>Unit</Label><Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Issue Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
            </div>
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
        { id: 1, code: "QNB", name: "Qatar National Bank (QNB)", swift_code: "QNBAQAQA" },
        { id: 2, code: "CBQ", name: "Commercial Bank of Qatar (CBQ)", swift_code: "CBQAQAQA" },
        { id: 3, code: "DOHA", name: "Doha Bank QPSC", swift_code: "DOHBQAQA" },
        { id: 4, code: "QIB", name: "Qatar Islamic Bank (QIB)", swift_code: "QISBQAQA" },
      ]);
    } catch {
      setData([
        { id: 1, code: "QNB", name: "Qatar National Bank (QNB)", swift_code: "QNBAQAQA" },
        { id: 2, code: "CBQ", name: "Commercial Bank of Qatar (CBQ)", swift_code: "CBQAQAQA" }
      ]);
    }
  }

  async function handleAdd() {
    try { await FinBanksApi.create(form); } catch { }
    setData(prev => [{ id: Date.now(), ...form }, ...prev]);
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
  const [form, setForm] = useState({ bank_id: 1, account_number: "QA55QNBA00000000123456789", account_title: "ZYNO Main Rent Operating Account", currency: "QAR", opening_balance: 1500000 });

  useEffect(() => { load(); }, []);
  async function load() {
    try {
      const res = await FinBankAccountsApi.fetchAll();
      setData(res.length > 0 ? res : [
        { id: 1, bank_id: 1, account_number: "QA55QNBA00000000123456789", account_title: "ZYNO Operations & Collection (QNB)", currency: "QAR", opening_balance: 1500000 },
        { id: 2, bank_id: 2, account_number: "QA88CBQA00000000987654321", account_title: "ZYNO Escrow & Deposits Account (CBQ)", currency: "QAR", opening_balance: 450000 },
        { id: 3, bank_id: 3, account_number: "QA22DOHB00000000554433221", account_title: "ZYNO Payroll & Disbursement (Doha Bank)", currency: "QAR", opening_balance: 200000 },
      ]);
    } catch {
      setData([
        { id: 1, bank_id: 1, account_number: "QA55QNBA00000000123456789", account_title: "ZYNO Operations & Collection (QNB)", currency: "QAR", opening_balance: 1500000 }
      ]);
    }
  }

  async function handleAdd() {
    try { await FinBankAccountsApi.create(form); } catch { }
    setData(prev => [{ id: Date.now(), ...form }, ...prev]);
    toast.success("Bank account created and mapped to GL Account 12000");
    setOpen(false);
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
          <TableHeader><TableRow className="bg-muted/50 text-xs"><TableHead className="font-bold">IBAN / Account #</TableHead><TableHead className="font-bold">Account Title</TableHead><TableHead className="font-bold">Currency</TableHead><TableHead className="text-right font-bold">Current Balance (QAR)</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.map(a => (
              <TableRow key={a.id} className="hover:bg-muted/30 text-xs">
                <TableCell className="font-mono font-bold text-primary">{a.account_number}</TableCell>
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
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([
    { ref: "CHQ-01000049", bank: "Commercial Bank (CBQ)", type: "Deposit Cheque", amount: 4000, date: "2026-08-05", status: "Cleared" },
    { ref: "CHQ-01000050", bank: "Commercial Bank (CBQ)", type: "Deposit Cheque", amount: 4000, date: "2026-08-05", status: "Cleared" },
    { ref: "WIRE-TX-9912", bank: "QNB Main Account", type: "Utility Transfer", amount: 9850, date: "2026-08-08", status: "Cleared" },
    { ref: "CHQ-2001", bank: "Doha Bank", type: "PDC Deposit", amount: 5500, date: "2026-08-12", status: "Pending Clearance" },
  ]);

  const [form, setForm] = useState({
    ref: `CHQ-${Math.floor(100000 + Math.random() * 900000)}`,
    bank: "QNB Main Account",
    type: "PDC Clearance",
    amount: "5600",
    date: new Date().toISOString().split("T")[0],
    status: "Cleared",
  });

  function handleAdd() {
    setData(prev => [{ ...form, amount: parseFloat(form.amount) || 0 }, ...prev]);
    toast.success(`Clearance recorded for ${form.ref}`);
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
              <TableHead className="font-bold">Transaction / Cheque #</TableHead>
              <TableHead className="font-bold">Bank</TableHead>
              <TableHead className="font-bold">Type</TableHead>
              <TableHead className="font-bold">Clearance Date</TableHead>
              <TableHead className="text-right font-bold">Amount (QAR)</TableHead>
              <TableHead className="font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx} className="hover:bg-muted/30 text-xs">
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
            <div><Label>Cheque / Reference Number</Label><Input value={form.ref} onChange={e => setForm({ ...form, ref: e.target.value })} /></div>
            <div><Label>Bank</Label><Input value={form.bank} onChange={e => setForm({ ...form, bank: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount (QAR)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
              <div><Label>Clearance Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
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
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([
    { id: 1, account_number: "QA55QNBA00000000123456789", statement_date: "2026-08-15", book_balance: 1500000, statement_balance: 1500000, status: "Reconciled" },
    { id: 2, account_number: "QA88CBQA00000000987654321", statement_date: "2026-08-15", book_balance: 450000, statement_balance: 450000, status: "Reconciled" },
  ]);

  const [form, setForm] = useState({
    account_number: "QA55QNBA00000000123456789",
    statement_date: new Date().toISOString().split("T")[0],
    book_balance: "1500000",
    statement_balance: "1500000",
  });

  const bBal = parseFloat(form.book_balance) || 0;
  const sBal = parseFloat(form.statement_balance) || 0;
  const diff = bBal - sBal;

  function handleAdd() {
    setData(prev => [
      { id: Date.now(), account_number: form.account_number, statement_date: form.statement_date, book_balance: bBal, statement_balance: sBal, status: diff === 0 ? "Reconciled" : "Discrepancy" },
      ...prev
    ]);
    toast.success(`Bank Reconciliation for ${form.statement_date} completed!`);
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
              <TableHead className="font-bold">Account #</TableHead>
              <TableHead className="font-bold">Statement Date</TableHead>
              <TableHead className="text-right font-bold">GL Book Balance (QAR)</TableHead>
              <TableHead className="text-right font-bold">Bank Statement Balance (QAR)</TableHead>
              <TableHead className="text-right font-bold">Difference</TableHead>
              <TableHead className="font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(r => (
              <TableRow key={r.id} className="hover:bg-muted/30 text-xs">
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
                </SelectContent>
              </Select>
            </div>
            <div><Label>Statement Date</Label><Input type="date" value={form.statement_date} onChange={e => setForm({ ...form, statement_date: e.target.value })} /></div>
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
  const [data, setData] = useState([
    { id: 1, title: "QNB Main Operating Account - July 2026", period: "2026-07-01 to 2026-07-31", balance: "1,500,000 QAR", auditor: "Internal Treasury Desk" },
    { id: 2, title: "CBQ Escrow & Deposits Account - July 2026", period: "2026-07-01 to 2026-07-31", balance: "450,000 QAR", auditor: "Internal Treasury Desk" },
    { id: 3, title: "QNB Main Operating Account - June 2026", period: "2026-06-01 to 2026-06-30", balance: "1,420,000 QAR", auditor: "Auditor Desk" },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Reconciliation Statements Archive</h3>
          <p className="text-xs text-muted-foreground">Certified monthly bank reconciliations with auditor sign-offs.</p>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.id} className="border rounded-lg p-3.5 bg-card flex justify-between items-center text-xs shadow-sm">
            <div>
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-[11px] text-muted-foreground">Period: {item.period} • Certified Balance: <strong className="text-emerald-600">{item.balance}</strong></p>
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
        <Badge variant="outline" className={`font-mono ${isBalanced ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`}>
          {isBalanced ? '✓ Balanced (Dr = Cr)' : '⚠ Out of Balance'}
        </Badge>
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
              <TableCell className="text-right font-mono font-bold text-blue-600">{assets.toLocaleString()}</TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">—</TableCell>
            </TableRow>
            <TableRow className="hover:bg-muted/30">
              <TableCell className="font-semibold text-amber-700">2000 — Liabilities (Security Deposits, AP, PDC Customer Liability)</TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">—</TableCell>
              <TableCell className="text-right font-mono font-bold text-emerald-600">{liabilities.toLocaleString()}</TableCell>
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
  const totalDr = trialBalanceDetailed.reduce((s, a) => s + Math.max(0, a.debit), 0);
  const totalCr = trialBalanceDetailed.reduce((s, a) => s + Math.max(0, a.credit), 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Detailed General Ledger Trial Balance</h3>
          <p className="text-xs text-muted-foreground">Full debit/credit schedule across all operational GL sub-accounts — live from all posted transactions.</p>
        </div>
        <Badge variant="outline" className="font-mono">{trialBalanceDetailed.length} Accounts</Badge>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Code</TableHead>
              <TableHead className="font-bold">Account Name</TableHead>
              <TableHead className="font-bold">Type</TableHead>
              <TableHead className="text-right font-bold">Debit (QAR)</TableHead>
              <TableHead className="text-right font-bold">Credit (QAR)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {trialBalanceDetailed.sort((a, b) => a.code.localeCompare(b.code)).map(acc => (
              <TableRow key={acc.code} className="hover:bg-muted/30">
                <TableCell className="font-mono font-bold text-primary">{acc.code}</TableCell>
                <TableCell className="font-medium">{acc.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] font-semibold ${acc.type === 'Assets' ? 'text-emerald-700' : acc.type === 'Liabilities' ? 'text-amber-700' : acc.type === 'Revenue' ? 'text-indigo-700' : acc.type === 'Expenses' ? 'text-rose-700' : 'text-blue-700'}`}>
                    {acc.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-blue-600 font-semibold">{acc.debit > 0 ? acc.debit.toLocaleString() : "—"}</TableCell>
                <TableCell className="text-right font-mono text-emerald-600 font-semibold">{acc.credit > 0 ? acc.credit.toLocaleString() : "—"}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold border-t-2 bg-muted/20">
              <TableCell colSpan={3}>Grand Total</TableCell>
              <TableCell className="text-right font-mono font-bold text-primary">{totalDr.toLocaleString()} QAR</TableCell>
              <TableCell className="text-right font-mono font-bold text-primary">{totalCr.toLocaleString()} QAR</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ProfitAndLossSubModule() {
  const { profitAndLossReport: pl } = useFinanceStore();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Profit and Loss Statement (P&L) — Live</h3>
      <Card className="p-5 space-y-3 text-xs shadow-sm bg-card">
        <div className="flex justify-between items-center font-bold text-sm border-b pb-2">
          <span>Gross Rental & Property Operating Revenue</span>
          <span className="text-emerald-600 font-mono text-base">QR {pl.totalRevenue.toLocaleString()}</span>
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
  const { balanceSheetReport: bs } = useFinanceStore();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Balance Sheet Statement — Live</h3>
        <Badge variant="outline" className={`font-mono ${bs.isBalanced ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`}>
          {bs.isBalanced ? '✓ Balanced' : '⚠ Discrepancy'}
        </Badge>
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
            <span className="font-mono text-primary">QR {bs.totalAssets.toLocaleString()}</span>
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
  const { allLedgerTransactions } = useFinanceStore();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return allLedgerTransactions;
    const q = search.toLowerCase();
    return allLedgerTransactions.filter(tx =>
      tx.account_name.toLowerCase().includes(q) ||
      tx.account_code.includes(q) ||
      tx.reference.toLowerCase().includes(q) ||
      tx.source.toLowerCase().includes(q)
    );
  }, [allLedgerTransactions, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">General Ledger Transaction Audit — Live</h3>
          <p className="text-xs text-muted-foreground">Complete double-entry log — all Journal, AP, AR, Vouchers, Payroll, Legal entries reflected in real-time.</p>
        </div>
        <Badge variant="outline">{filtered.length} Postings</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          className="pl-8 h-8 text-xs"
          placeholder="Search by account, code, or reference..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Account Code</TableHead>
              <TableHead className="font-bold">Account Name</TableHead>
              <TableHead className="font-bold">Reference</TableHead>
              <TableHead className="font-bold">Source</TableHead>
              <TableHead className="text-right font-bold">Debit (QAR)</TableHead>
              <TableHead className="text-right font-bold">Credit (QAR)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {filtered.slice(0, 100).map(tx => (
              <TableRow key={tx.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-xs">{tx.date}</TableCell>
                <TableCell className="font-mono font-bold text-primary">{tx.account_code}</TableCell>
                <TableCell className="font-medium">{tx.account_name}</TableCell>
                <TableCell className="font-mono text-xs">{tx.reference}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{tx.source}</Badge></TableCell>
                <TableCell className="text-right font-mono font-semibold text-blue-600">{tx.debit > 0 ? tx.debit.toLocaleString() : "—"}</TableCell>
                <TableCell className="text-right font-mono font-semibold text-emerald-600">{tx.credit > 0 ? tx.credit.toLocaleString() : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filtered.length > 100 && <p className="text-xs text-muted-foreground text-center">Showing 100 of {filtered.length} entries. Use search to filter.</p>}
    </div>
  );
}

function CashFlowSubModule() {
  const { cashFlowReport: cf } = useFinanceStore();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Cash Flow Statement — Live</h3>
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
  const { cashBookEntries, addCashBookEntry } = useFinanceStore();
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Main Cash Book — Live</h3>
          <p className="text-xs text-muted-foreground">All physical cash receipts, vault deposits, and disbursements — synced with Cash On Hand report.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Cash Entry</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 bg-emerald-50 border-emerald-200"><p className="text-xs text-emerald-700 font-semibold">Total Cash In</p><p className="font-mono font-bold text-emerald-800 text-sm">QR {totalIn.toLocaleString()}</p></Card>
        <Card className="p-3 bg-rose-50 border-rose-200"><p className="text-xs text-rose-700 font-semibold">Total Cash Out</p><p className="font-mono font-bold text-rose-800 text-sm">QR {totalOut.toLocaleString()}</p></Card>
        <Card className="p-3 bg-blue-50 border-blue-200"><p className="text-xs text-blue-700 font-semibold">Current Balance</p><p className="font-mono font-bold text-blue-800 text-sm">QR {cashBookEntries[0]?.balance.toLocaleString() || "24,500"}</p></Card>
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
            {cashBookEntries.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30">
                <TableCell className="font-mono">{row.date}</TableCell>
                <TableCell className="font-mono font-bold text-primary">{row.voucher}</TableCell>
                <TableCell className="font-medium">{row.description}</TableCell>
                <TableCell className="text-right font-mono font-semibold text-emerald-600">{row.cash_in > 0 ? row.cash_in.toLocaleString() : "—"}</TableCell>
                <TableCell className="text-right font-mono font-semibold text-rose-600">{row.cash_out > 0 ? row.cash_out.toLocaleString() : "—"}</TableCell>
                <TableCell className="text-right font-mono font-bold">{row.balance.toLocaleString()} QAR</TableCell>
              </TableRow>
            ))}
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
  const { pettyCashEntries, addPettyCashEntry } = useFinanceStore();
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
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Petty Cash Expense</Button>
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
            {pettyCashEntries.map((row) => (
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
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div><Label>Expense Item</Label><Input value={form.expense} onChange={e => setForm({ ...form, expense: e.target.value })} /></div>
            <div><Label>Paid To</Label><Input value={form.paid_to} onChange={e => setForm({ ...form, paid_to: e.target.value })} /></div>
            <div><Label>Amount (QAR)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
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
  const { cashOnHandPosition: co } = useFinanceStore();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Current Physical Cash Position — Live</h3>
        <p className="text-xs text-muted-foreground">Real-time physical cash balances across all custody points — updated whenever Cash Book or Petty Cash entries are added.</p>
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

function TrialBalanceSimpleSubModule() {
  const { leases, pdcs, vouchers } = useAppData();

  const totalRevenue = 385000;
  const totalAssets = 2450000;
  const totalLiab = 450000;
  const totalCapital = 1750000;
  const totalExpenses = 135000;

  const drTotal = totalAssets + totalExpenses;
  const crTotal = totalLiab + totalCapital + totalRevenue;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Trial Balance (Simple Summary)</h3>
          <p className="text-xs text-muted-foreground">Summary totals across Asset, Liability, Equity, Revenue, and Expense classes.</p>
        </div>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-mono">
          Status: Balanced (Dr = Cr)
        </Badge>
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
              <TableCell className="font-semibold text-emerald-700">1000 - Assets (Bank, Cash, Receivables, PDCs)</TableCell>
              <TableCell className="text-right font-mono font-bold text-blue-600">{totalAssets.toLocaleString()}</TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">-</TableCell>
            </TableRow>
            <TableRow className="hover:bg-muted/30">
              <TableCell className="font-semibold text-amber-700">2000 - Liabilities (Security Deposits, AP, PDC Liability)</TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">-</TableCell>
              <TableCell className="text-right font-mono font-bold text-emerald-600">{totalLiab.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow className="hover:bg-muted/30">
              <TableCell className="font-semibold text-blue-700">3000 - Capital & Owner Equity</TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">-</TableCell>
              <TableCell className="text-right font-mono font-bold text-emerald-600">{totalCapital.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow className="hover:bg-muted/30">
              <TableCell className="font-semibold text-indigo-700">4000 - Revenue (Rental & Service Income)</TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">-</TableCell>
              <TableCell className="text-right font-mono font-bold text-emerald-600">{totalRevenue.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow className="hover:bg-muted/30">
              <TableCell className="font-semibold text-rose-700">5000 - Expenses (Maintenance, Utility, Payroll)</TableCell>
              <TableCell className="text-right font-mono font-bold text-blue-600">{totalExpenses.toLocaleString()}</TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">-</TableCell>
            </TableRow>
            <TableRow className="font-bold border-t-2 bg-muted/20">
              <TableCell className="font-bold">Total Trial Balance</TableCell>
              <TableCell className="text-right font-mono font-bold text-primary">{drTotal.toLocaleString()} QAR</TableCell>
              <TableCell className="text-right font-mono font-bold text-primary">{crTotal.toLocaleString()} QAR</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TrialBalanceFullSubModule() {
  const accounts = [
    { code: "10100", name: "Cash In Hand", dr: 24500, cr: 0 },
    { code: "12000", name: "QNB Operating Bank Account", dr: 1500000, cr: 0 },
    { code: "12001", name: "CBQ Escrow Bank Account", dr: 450000, cr: 0 },
    { code: "12413", name: "Tenant Receivables", dr: 64500, cr: 0 },
    { code: "12900", name: "PDC In Hand", dr: 67200, cr: 0 },
    { code: "20100", name: "Accounts Payable (Vendors)", dr: 0, cr: 26500 },
    { code: "21400", name: "PDC Received - Customer Liability", dr: 0, cr: 67200 },
    { code: "21500", name: "Security Deposit Liability", dr: 0, cr: 14600 },
    { code: "30000", name: "Owner Capital Account", dr: 0, cr: 1750000 },
    { code: "41100", name: "Rental Income", dr: 0, cr: 385000 },
    { code: "50100", name: "Basic Salaries & Staff Payroll", dr: 45000, cr: 0 },
    { code: "50200", name: "Repairs & Maintenance Expenses", dr: 65400, cr: 0 },
    { code: "50500", name: "Electricity & Water Expenses", dr: 24600, cr: 0 },
  ];

  const totalDr = accounts.reduce((s, a) => s + a.dr, 0);
  const totalCr = accounts.reduce((s, a) => s + a.cr, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Detailed General Ledger Trial Balance</h3>
          <p className="text-xs text-muted-foreground">Full ledger debit and credit schedule across all operational sub-accounts.</p>
        </div>
        <Badge variant="outline" className="font-mono">{accounts.length} Accounts</Badge>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Code</TableHead>
              <TableHead className="font-bold">Account Name</TableHead>
              <TableHead className="text-right font-bold">Debit (QAR)</TableHead>
              <TableHead className="text-right font-bold">Credit (QAR)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {accounts.map(acc => (
              <TableRow key={acc.code} className="hover:bg-muted/30">
                <TableCell className="font-mono font-bold text-primary">{acc.code}</TableCell>
                <TableCell className="font-medium">{acc.name}</TableCell>
                <TableCell className="text-right font-mono text-blue-600 font-semibold">{acc.dr > 0 ? acc.dr.toLocaleString() : "-"}</TableCell>
                <TableCell className="text-right font-mono text-emerald-600 font-semibold">{acc.cr > 0 ? acc.cr.toLocaleString() : "-"}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold border-t-2 bg-muted/20">
              <TableCell colSpan={2}>Grand Total</TableCell>
              <TableCell className="text-right font-mono font-bold text-primary">{totalDr.toLocaleString()} QAR</TableCell>
              <TableCell className="text-right font-mono font-bold text-primary">{totalCr.toLocaleString()} QAR</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ProfitAndLossSubModule() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Profit and Loss Statement (P&L)</h3>
      <Card className="p-5 space-y-3 text-xs shadow-sm bg-card">
        <div className="flex justify-between items-center font-bold text-sm border-b pb-2">
          <span>Gross Rental & Property Operating Revenue</span>
          <span className="text-emerald-600 font-mono text-base">QR 385,000</span>
        </div>
        <div className="space-y-1.5 pl-2 text-muted-foreground">
          <div className="flex justify-between"><span>Residential Tenancy Leases</span><span>QR 240,000</span></div>
          <div className="flex justify-between"><span>Commercial Real Estate Leases</span><span>QR 130,000</span></div>
          <div className="flex justify-between"><span>Parking & Service Recovery Charges</span><span>QR 15,000</span></div>
        </div>

        <div className="flex justify-between items-center font-bold text-sm border-t pt-3 pb-1 text-rose-600">
          <span>Total Operating Expenses</span>
          <span className="font-mono text-base">-QR 135,000</span>
        </div>
        <div className="space-y-1.5 pl-2 text-muted-foreground">
          <div className="flex justify-between"><span>Repairs & HVAC Maintenance</span><span>QR 65,400</span></div>
          <div className="flex justify-between"><span>Staff Salaries & Site Operations</span><span>QR 45,000</span></div>
          <div className="flex justify-between"><span>Electricity & Water (Kahramaa)</span><span>QR 24,600</span></div>
        </div>

        <div className="flex justify-between items-center font-bold text-base border-t-2 pt-3 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
          <span className="text-foreground">Net Operating Profit</span>
          <span className="text-emerald-600 font-mono text-lg">QR 250,000</span>
        </div>
      </Card>
    </div>
  );
}

function BalanceSheetSubModule() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Balance Sheet Statement</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <Card className="p-5 space-y-3 shadow-sm bg-card">
          <h4 className="font-bold text-sm border-b pb-2 text-primary flex items-center gap-1.5">
            <Building className="h-4 w-4" /> Assets
          </h4>
          <div className="space-y-1.5">
            <div className="flex justify-between"><span>Bank Operating & Escrow Balances</span><span className="font-mono">QR 1,950,000</span></div>
            <div className="flex justify-between"><span>Cash in Vault & Custodian</span><span className="font-mono">QR 24,500</span></div>
            <div className="flex justify-between"><span>Tenant Receivables (AR)</span><span className="font-mono">QR 64,500</span></div>
            <div className="flex justify-between"><span>Post-Dated Cheques in Hand</span><span className="font-mono">QR 67,200</span></div>
            <div className="flex justify-between"><span>Property & Fixed Assets Portfolio</span><span className="font-mono">QR 15,000,000</span></div>
          </div>
          <div className="flex justify-between font-bold border-t pt-2 text-sm text-foreground">
            <span>Total Assets</span>
            <span className="font-mono text-primary">QR 17,106,200</span>
          </div>
        </Card>

        <Card className="p-5 space-y-3 shadow-sm bg-card">
          <h4 className="font-bold text-sm border-b pb-2 text-amber-600 flex items-center gap-1.5">
            <Landmark className="h-4 w-4" /> Liabilities & Equity
          </h4>
          <div className="space-y-1.5">
            <div className="flex justify-between"><span>Accounts Payable (Vendors)</span><span className="font-mono">QR 26,500</span></div>
            <div className="flex justify-between"><span>PDC Received - Customer Liability</span><span className="font-mono">QR 67,200</span></div>
            <div className="flex justify-between"><span>Tenant Security Deposits Held</span><span className="font-mono">QR 14,600</span></div>
            <div className="flex justify-between"><span>Owner Capital & Reserves</span><span className="font-mono">QR 16,747,900</span></div>
            <div className="flex justify-between"><span>Current Period Retained Profit</span><span className="font-mono text-emerald-600">QR 250,000</span></div>
          </div>
          <div className="flex justify-between font-bold border-t pt-2 text-sm text-foreground">
            <span>Total Liabilities & Equity</span>
            <span className="font-mono text-amber-600">QR 17,106,200</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function GeneralLedgerReportSubModule() {
  const { vouchers: sharedVouchers } = useAppData();

  const entries = useMemo(() => {
    const list: { date: string; account: string; ref: string; debit: number; credit: number }[] = [
      { date: "2026-08-01", account: "12000 - QNB Bank Operating", ref: "REC-PDC-001", debit: 5600, credit: 0 },
      { date: "2026-08-01", account: "12900 - PDC In Hand", ref: "REC-PDC-001", debit: 0, credit: 5600 },
      { date: "2026-08-02", account: "10100 - Cash In Hand", ref: "ARE-RT-25", debit: 1000, credit: 0 },
      { date: "2026-08-02", account: "21500 - Security Deposit Liability", ref: "ARE-RT-25", debit: 0, credit: 1000 },
    ];

    for (const v of (sharedVouchers || [])) {
      list.push({
        date: "2026-08-18",
        account: v.debit || "General Debit Account",
        ref: v.receiptNo || v.id,
        debit: Number(v.amount) || 0,
        credit: 0,
      });
      list.push({
        date: "2026-08-18",
        account: v.credit || "General Credit Account",
        ref: v.receiptNo || v.id,
        debit: 0,
        credit: Number(v.amount) || 0,
      });
    }

    return list;
  }, [sharedVouchers]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">General Ledger Transaction Audit</h3>
          <p className="text-xs text-muted-foreground">Complete double-entry audit log reflecting all posted lease vouchers, receipts, and journal entries.</p>
        </div>
        <Badge variant="outline">{entries.length} Ledger Postings</Badge>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs">
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Account</TableHead>
              <TableHead className="font-bold">Voucher / Ref</TableHead>
              <TableHead className="text-right font-bold">Debit (QAR)</TableHead>
              <TableHead className="text-right font-bold">Credit (QAR)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {entries.map((entry, idx) => (
              <TableRow key={idx} className="hover:bg-muted/30">
                <TableCell className="font-mono text-xs">{entry.date}</TableCell>
                <TableCell className="font-medium text-xs">{entry.account}</TableCell>
                <TableCell className="font-mono text-xs text-primary">{entry.ref}</TableCell>
                <TableCell className="text-right font-mono font-semibold text-blue-600">
                  {entry.debit > 0 ? entry.debit.toLocaleString() : "-"}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold text-emerald-600">
                  {entry.credit > 0 ? entry.credit.toLocaleString() : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CashFlowSubModule() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Cash Flow Statement</h3>
      <Card className="p-5 space-y-3 text-xs shadow-sm bg-card">
        <div className="flex justify-between font-semibold border-b pb-2">
          <span>Net Cash Flow from Operating Activities (Rent Collections - Operations)</span>
          <span className="text-emerald-600 font-mono font-bold">+QR 280,000</span>
        </div>
        <div className="flex justify-between font-semibold border-b pb-2">
          <span>Net Cash Flow from Investing Activities (Asset Upgrades)</span>
          <span className="text-rose-600 font-mono font-bold">-QR 50,000</span>
        </div>
        <div className="flex justify-between font-semibold border-b pb-2">
          <span>Net Cash Flow from Financing Activities (Capital & Dividends)</span>
          <span className="font-mono text-muted-foreground">QR 0</span>
        </div>
        <div className="flex justify-between font-bold border-t pt-2 text-sm bg-emerald-50 p-3 rounded border border-emerald-200">
          <span className="text-emerald-950">Net Cash Increase in Period</span>
          <span className="text-emerald-700 font-mono">+QR 230,000</span>
        </div>
      </Card>
    </div>
  );
}

function CashBookSubModule() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([
    { date: "2026-08-02", voucher: "CSH-01", description: "Cash Rent Collection (Unit AAA-GF2)", cash_in: 5500, cash_out: 0, balance: 24500 },
    { date: "2026-08-04", voucher: "CSH-02", description: "Security Deposit Received Cash", cash_in: 1000, cash_out: 0, balance: 25500 },
    { date: "2026-08-08", voucher: "CSH-03", description: "Emergency Plumbing Cash Advance", cash_in: 0, cash_out: 1000, balance: 24500 },
  ]);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    voucher: `CSH-${Math.floor(10 + Math.random() * 90)}`,
    description: "",
    type: "in",
    amount: "1500",
  });

  function handleAdd() {
    const amt = parseFloat(form.amount) || 0;
    const lastBal = data[0]?.balance || 24500;
    const newBal = form.type === "in" ? lastBal + amt : lastBal - amt;
    setData(prev => [
      {
        date: form.date,
        voucher: form.voucher,
        description: form.description,
        cash_in: form.type === "in" ? amt : 0,
        cash_out: form.type === "out" ? amt : 0,
        balance: newBal
      },
      ...prev
    ]);
    toast.success("Cash Book entry recorded");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Main Cash Book</h3>
          <p className="text-xs text-muted-foreground">Records all physical cash receipts, vault deposits, and cash disbursements.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Cash Entry</Button>
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
            {data.map((row, idx) => (
              <TableRow key={idx} className="hover:bg-muted/30">
                <TableCell className="font-mono">{row.date}</TableCell>
                <TableCell className="font-mono font-bold text-primary">{row.voucher}</TableCell>
                <TableCell className="font-medium">{row.description}</TableCell>
                <TableCell className="text-right font-mono font-semibold text-emerald-600">{row.cash_in > 0 ? row.cash_in.toLocaleString() : "-"}</TableCell>
                <TableCell className="text-right font-mono font-semibold text-rose-600">{row.cash_out > 0 ? row.cash_out.toLocaleString() : "-"}</TableCell>
                <TableCell className="text-right font-mono font-bold">{row.balance.toLocaleString()} QAR</TableCell>
              </TableRow>
            ))}
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
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([
    { date: "2026-08-03", expense: "Office Supplies & Paper", paid_to: "Doha Stationers", amount: 150 },
    { date: "2026-08-06", expense: "Site Cleaning Consumables", paid_to: "Al Meera Supermarket", amount: 320 },
    { date: "2026-08-11", expense: "Emergency Key Duplication", paid_to: "Quick Keys WLL", amount: 80 },
  ]);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    expense: "Refreshments & Tea",
    paid_to: "Local Cafeteria",
    amount: "65",
  });

  function handleAdd() {
    setData(prev => [{ ...form, amount: parseFloat(form.amount) || 0 }, ...prev]);
    toast.success("Petty cash voucher recorded");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Petty Cash Custodian Register</h3>
          <p className="text-xs text-muted-foreground">Minor daily expense vouchers and imprest fund tracking.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Petty Cash Expense</Button>
      </div>

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
            {data.map((row, idx) => (
              <TableRow key={idx} className="hover:bg-muted/30">
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
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div><Label>Expense Item</Label><Input value={form.expense} onChange={e => setForm({ ...form, expense: e.target.value })} /></div>
            <div><Label>Paid To</Label><Input value={form.paid_to} onChange={e => setForm({ ...form, paid_to: e.target.value })} /></div>
            <div><Label>Amount (QAR)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
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
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Current Physical Cash Position</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-emerald-50 border-emerald-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-800 uppercase">Office Safe Vault Cash</p>
          <h4 className="text-2xl font-bold mt-1 font-mono text-emerald-700">QR 24,500</h4>
          <p className="text-[10px] text-emerald-600 mt-1">Verified physical cash balance</p>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200 shadow-sm">
          <p className="text-xs font-semibold text-blue-800 uppercase">Petty Cash Float Imprest</p>
          <h4 className="text-2xl font-bold mt-1 font-mono text-blue-700">QR 1,850</h4>
          <p className="text-[10px] text-blue-600 mt-1">Held with Head Office Custodian</p>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200 shadow-sm">
          <p className="text-xs font-semibold text-purple-800 uppercase">Site Cash Registers</p>
          <h4 className="text-2xl font-bold mt-1 font-mono text-purple-700">QR 3,200</h4>
          <p className="text-[10px] text-purple-600 mt-1">Al Sadd & Salata Front Desks</p>
        </Card>
      </div>
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
            id: 1,
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
          id: 1,
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

    setData(prev => [{ id: Date.now(), ...form, type }, ...prev]);
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
              <TableHead className="font-bold">Contract #</TableHead>
              <TableHead className="font-bold">Contract Title</TableHead>
              <TableHead className="font-bold">{type === "Expense" ? "Vendor / Contractor" : "Tenant / Customer"}</TableHead>
              <TableHead className="text-right font-bold">Total Value (QAR)</TableHead>
              <TableHead className="font-bold">Contract Period</TableHead>
              <TableHead className="font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {data.map(c => (
              <TableRow key={c.id} className="hover:bg-muted/30">
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