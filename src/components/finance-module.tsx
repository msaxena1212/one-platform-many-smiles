import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Settings, Calendar, MapPin, Users, UserCheck, Layers, LayoutDashboard,
  Clock, BookOpen, FileText, PlusCircle, ArrowDownLeft, ArrowUpRight, Receipt as ReceiptIcon,
  Building, CreditCard, FileCheck, FileSpreadsheet, PieChart, Landmark, Scale,
  DollarSign, Activity, FileCode, CheckCircle, Search, Plus, Trash2, Pencil,
  ChevronRight, Loader2, Filter, Download, FilePlus
} from "lucide-react";
import {
  fetchJournalEntries, fetchReceipts, fetchARLedgers, fetchGLAccounts,
  createJournalEntry, createReceipt, createAREntry, settleAREntry, createGLAccount,
  type JournalEntry, type Receipt, type ARLedger, type GLAccount
} from "@/lib/supabase";
import {
  FinFinancialYearsApi, FinRegionsApi, FinVendorsApi, FinCustomersApi, FinCostCentersApi,
  FinPostingPeriodsApi, FinBanksApi, FinBankAccountsApi, FinBankReconciliationsApi, FinContractsApi,
  type FinFinancialYear, type FinRegion, type FinVendor, type FinCustomer, type FinCostCenter,
  type FinPostingPeriod, type FinBank, type FinBankAccount, type FinBankReconciliation, type FinContract
} from "@/lib/supabase-finance";
import { toast } from "sonner";

export interface FinanceModuleProps {
  role: "admin" | "prop-mgr" | "finance" | "cashier";
}

const FINANCE_NAV = [
  {
    group: "Setup Configuration",
    icon: Settings,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
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
    group: "Bank Accounting",
    icon: Landmark,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    items: [
      { key: "bank", label: "Bank", icon: Building },
      { key: "bank_account", label: "Bank Account", icon: CreditCard },
      { key: "bank_clearance", label: "Bank Clearance", icon: FileCheck },
      { key: "bank_reconciliation", label: "Bank Reconciliation", icon: Scale },
      { key: "bank_reconciliation_statement_list", label: "Bank Reconciliation Statement List", icon: FileSpreadsheet },
    ],
  },
  {
    group: "Finance Report",
    icon: PieChart,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    items: [
      { key: "trial_balance_simple", label: "Trial Balance(Simple)", icon: Scale },
      { key: "trial_balance", label: "Trial Balance", icon: Scale },
      { key: "profit_and_loss", label: "Profit and Loss", icon: Activity },
      { key: "balance_sheet", label: "Balance Sheet", icon: Landmark },
      { key: "general_ledger", label: "General Ledger", icon: BookOpen },
      { key: "cash_flow_statement", label: "Cash Flow Statement", icon: DollarSign },
      { key: "cash_book", label: "Cash Book", icon: BookOpen },
      { key: "petty_cash_book", label: "Petty Cash Book", icon: BookOpen },
      { key: "cash_on_hand", label: "Cash On Hand", icon: DollarSign },
    ],
  },
  {
    group: "Contract Management",
    icon: FileCode,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    items: [
      { key: "expense_contract", label: "Expense Contract", icon: FileText },
      { key: "revenue_contract", label: "Revenue Contract", icon: FileCheck },
    ],
  },
];

export function FinanceModule({ role }: FinanceModuleProps) {
  const [activeKey, setActiveKey] = useState("finance_dashboard");
  const [loading, setLoading] = useState(false);

  // Active item info
  const activeItem = FINANCE_NAV.flatMap(g => g.items).find(i => i.key === activeKey);
  const activeGroup = FINANCE_NAV.find(g => g.items.some(i => i.key === activeKey));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage chart of accounts, setup configuration, vouchers, bank accounting, reports, and contract lifecycle.
        </p>
      </div>

      <div className="flex gap-6 min-h-[680px]">
        {/* Sidebar */}
        <aside className="w-64 shrink-0">
          <ScrollArea className="h-[680px] pr-2">
            <div className="space-y-5">
              {FINANCE_NAV.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div key={group.group}>
                    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md mb-1.5 ${group.bg}`}>
                      <GroupIcon className={`h-4 w-4 ${group.color}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider ${group.color}`}>
                        {group.group}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = item.key === activeKey;
                        return (
                          <button
                            key={item.key}
                            onClick={() => setActiveKey(item.key)}
                            className={`
                              w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-all text-left
                              ${isActive
                                ? "bg-primary text-primary-foreground font-medium shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                              }
                            `}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <ItemIcon className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </span>
                            {isActive && <ChevronRight className="h-3 w-3 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-3">
                {activeItem && (
                  <div className={`p-2 rounded-md ${activeGroup?.bg}`}>
                    <activeItem.icon className={`h-5 w-5 ${activeGroup?.color}`} />
                  </div>
                )}
                <div>
                  <CardTitle className="text-lg">{activeItem?.label}</CardTitle>
                  <CardDescription className="text-xs">{activeGroup?.group}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ScrollArea className="h-[570px] pr-2">
                <FinanceSubModuleRouter subKey={activeKey} />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
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
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "", status: "Active" as const });

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { setData(await FinFinancialYearsApi.fetchAll()); } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  }
  async function handleAdd() {
    try {
      await FinFinancialYearsApi.create(form);
      toast.success("Financial Year added");
      setOpen(false);
      load();
    } catch (e: any) { toast.error(e.message); }
  }
  async function handleDelete(id: number) {
    if (!confirm("Delete this FY?")) return;
    try { await FinFinancialYearsApi.delete(id); load(); } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Financial Years Register</h3>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Financial Year</Button>
      </div>

      <Table>
        <TableHeader><TableRow><TableHead>Year Name</TableHead><TableHead>Start Date</TableHead><TableHead>End Date</TableHead><TableHead>Status</TableHead><TableHead className="w-16"></TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-semibold">{row.name}</TableCell>
              <TableCell>{row.start_date}</TableCell>
              <TableCell>{row.end_date}</TableCell>
              <TableCell><Badge variant={row.status === "Active" ? "default" : "secondary"}>{row.status}</Badge></TableCell>
              <TableCell><Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Financial Year</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>FY Name</Label><Input placeholder="e.g. FY 2027" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} /></div>
            <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleAdd}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RegionSubModule() {
  const [data, setData] = useState<FinRegion[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", currency: "QAR" });

  useEffect(() => { load(); }, []);
  async function load() { try { setData(await FinRegionsApi.fetchAll()); } catch (e: any) {} }
  async function handleAdd() {
    try { await FinRegionsApi.create(form); toast.success("Region created"); setOpen(false); load(); } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Regions Configured</h3>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Region</Button>
      </div>

      <Table>
        <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Region Name</TableHead><TableHead>Currency</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono font-bold">{row.code}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell><Badge variant="outline">{row.currency}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Region</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Code</Label><Input placeholder="DOH" value={form.code} onChange={e => setForm({...form, code: e.target.value})} /></div>
            <div><Label>Name</Label><Input placeholder="Doha West" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleAdd}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VendorListSubModule() {
  const [data, setData] = useState<FinVendor[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", contact_person: "", email: "", phone: "", tax_number: "", status: "Active" as const });

  useEffect(() => { load(); }, []);
  async function load() { try { setData(await FinVendorsApi.fetchAll()); } catch (e: any) {} }
  async function handleAdd() {
    try { await FinVendorsApi.create(form); toast.success("Vendor added"); setOpen(false); load(); } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Vendor Master</h3>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Vendor</Button>
      </div>

      <Table>
        <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Contact</TableHead><TableHead>Phone / Email</TableHead><TableHead>Tax No</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono">{row.code}</TableCell>
              <TableCell className="font-semibold">{row.name}</TableCell>
              <TableCell>{row.contact_person}</TableCell>
              <TableCell className="text-xs">{row.phone} / {row.email}</TableCell>
              <TableCell className="text-xs font-mono">{row.tax_number}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Vendor</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Vendor Code</Label><Input placeholder="VEND-100" value={form.code} onChange={e => setForm({...form, code: e.target.value})} /></div>
            <div><Label>Company Name</Label><Input placeholder="Supplier LLC" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label>Contact Person</Label><Input placeholder="John Doe" value={form.contact_person} onChange={e => setForm({...form, contact_person: e.target.value})} /></div>
            <div><Label>Phone</Label><Input placeholder="+974 5500 0000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleAdd}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CustomerListSubModule() {
  const [data, setData] = useState<FinCustomer[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", type: "Individual", email: "", phone: "", credit_limit: 50000 });

  useEffect(() => { load(); }, []);
  async function load() { try { setData(await FinCustomersApi.fetchAll()); } catch (e: any) {} }
  async function handleAdd() {
    try { await FinCustomersApi.create(form); toast.success("Customer added"); setOpen(false); load(); } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Finance Customer List</h3>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Customer</Button>
      </div>

      <Table>
        <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Credit Limit</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono">{row.code}</TableCell>
              <TableCell className="font-semibold">{row.name}</TableCell>
              <TableCell><Badge variant="outline">{row.type}</Badge></TableCell>
              <TableCell>{row.credit_limit} QAR</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Customer</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Customer Code</Label><Input placeholder="CUST-001" value={form.code} onChange={e => setForm({...form, code: e.target.value})} /></div>
            <div><Label>Full Name</Label><Input placeholder="Tenant / Client Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleAdd}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CostCenterSubModule() {
  const [data, setData] = useState<FinCostCenter[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", manager: "" });

  useEffect(() => { load(); }, []);
  async function load() { try { setData(await FinCostCentersApi.fetchAll()); } catch (e: any) {} }
  async function handleAdd() {
    try { await FinCostCentersApi.create(form); toast.success("Cost center added"); setOpen(false); load(); } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Cost Centers</h3>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Cost Center</Button>
      </div>

      <Table>
        <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Center Name</TableHead><TableHead>Manager</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono font-bold">{row.code}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.manager}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Cost Center</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Code</Label><Input placeholder="CC-300" value={form.code} onChange={e => setForm({...form, code: e.target.value})} /></div>
            <div><Label>Name</Label><Input placeholder="IT Infrastructure" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleAdd}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. FINANCE SUB-MODULES
// ─────────────────────────────────────────────────────────────────────────────

function FinanceDashboardSubModule() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20"><CardContent className="p-4"><p className="text-xs text-muted-foreground">General Ledger Assets</p><h3 className="text-xl font-bold mt-1">2,450,000 QAR</h3></CardContent></Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Monthly Revenue</p><h3 className="text-xl font-bold mt-1 text-emerald-600">385,000 QAR</h3></CardContent></Card>
        <Card className="bg-rose-500/5 border-rose-500/20"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Monthly Expenses</p><h3 className="text-xl font-bold mt-1 text-rose-600">112,400 QAR</h3></CardContent></Card>
        <Card className="bg-amber-500/5 border-amber-500/20"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending Receivables</p><h3 className="text-xl font-bold mt-1 text-amber-600">64,500 QAR</h3></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="flex justify-between border-b pb-1"><span>Posted Rent Receipt REC-094</span><span className="font-bold text-emerald-600">+12,500 QAR</span></div>
            <div className="flex justify-between border-b pb-1"><span>HVAC Vendor Payment VOU-882</span><span className="font-bold text-rose-600">-4,200 QAR</span></div>
            <div className="flex justify-between border-b pb-1"><span>PDC Clearance QNB #9921</span><span className="font-bold text-emerald-600">+8,500 QAR</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => toast.info("Opening Voucher Builder")}>Create Journal Voucher</Button>
            <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => toast.info("Exporting Trial Balance")}>Generate Trial Balance</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PostingPeriodSubModule() {
  const [data, setData] = useState<FinPostingPeriod[]>([]);
  useEffect(() => { load(); }, []);
  async function load() { try { setData(await FinPostingPeriodsApi.fetchAll()); } catch (e: any) {} }
  async function toggle(row: FinPostingPeriod) {
    const nextStatus = row.status === "Open" ? "Closed" : "Open";
    await FinPostingPeriodsApi.update(row.id, { status: nextStatus });
    toast.success(`Period ${row.period_name} is now ${nextStatus}`);
    load();
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Financial Posting Periods Control</h3>
      <Table>
        <TableHeader><TableRow><TableHead>Period</TableHead><TableHead>Year</TableHead><TableHead>Month</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono font-bold">{row.period_name}</TableCell>
              <TableCell>{row.year}</TableCell>
              <TableCell>{row.month}</TableCell>
              <TableCell><Badge variant={row.status === "Open" ? "default" : "secondary"}>{row.status}</Badge></TableCell>
              <TableCell><Button size="sm" variant="outline" onClick={() => toggle(row)}>{row.status === "Open" ? "Close Period" : "Re-Open"}</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ChartOfAccountsSubModule() {
  const [data, setData] = useState<GLAccount[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name_en: "", type: "asset" as const, currency: "QAR", is_postable: true });

  useEffect(() => { load(); }, []);
  async function load() { try { setData(await fetchGLAccounts()); } catch (e: any) {} }
  async function handleCreate() {
    try { await createGLAccount(form); toast.success("Account created"); setOpen(false); load(); } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Chart of Accounts</h3>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add GL Account</Button>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Account Name</TableHead><TableHead>Type</TableHead><TableHead>Postable</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map(acc => (
            <TableRow key={acc.id}>
              <TableCell className="font-mono font-bold">{acc.code}</TableCell>
              <TableCell>{acc.name_en}</TableCell>
              <TableCell className="capitalize"><Badge variant="outline">{acc.type}</Badge></TableCell>
              <TableCell>{acc.is_postable ? "Yes" : "No"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Account</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Code</Label><Input placeholder="1010" value={form.code} onChange={e => setForm({...form, code: e.target.value})} /></div>
            <div><Label>Name</Label><Input placeholder="Petty Cash Fund" value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleCreate}>Save Account</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function JournalLedgerSubModule() {
  const [data, setData] = useState<JournalEntry[]>([]);
  useEffect(() => { load(); }, []);
  async function load() { try { setData(await fetchJournalEntries()); } catch (e: any) {} }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Journal Ledger Entries</h3>
      <Table>
        <TableHeader><TableRow><TableHead>JE No</TableHead><TableHead>Posting Date</TableHead><TableHead>Narration</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map(je => (
            <TableRow key={je.id}>
              <TableCell className="font-mono font-semibold">{je.je_no}</TableCell>
              <TableCell>{je.posting_date}</TableCell>
              <TableCell>{je.narration || "N/A"}</TableCell>
              <TableCell><Badge>{je.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CreditDebitBuilderSubModule() {
  const [lines, setLines] = useState([{ account: "", debit: 0, credit: 0 }]);
  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);

  function addLine() { setLines([...lines, { account: "", debit: 0, credit: 0 }]); }
  function submit() {
    if (totalDebit !== totalCredit || totalDebit === 0) { toast.error("Debits and credits must balance!"); return; }
    toast.success("Journal voucher built & posted successfully!");
    setLines([{ account: "", debit: 0, credit: 0 }]);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Manual Debit / Credit Voucher Builder</h3>
      <div className="space-y-2">
        {lines.map((l, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <Input placeholder="Account Name / Code" className="flex-1" value={l.account} onChange={e => { const next = [...lines]; next[idx].account = e.target.value; setLines(next); }} />
            <Input type="number" placeholder="Debit" className="w-28" value={l.debit || ""} onChange={e => { const next = [...lines]; next[idx].debit = parseFloat(e.target.value) || 0; setLines(next); }} />
            <Input type="number" placeholder="Credit" className="w-28" value={l.credit || ""} onChange={e => { const next = [...lines]; next[idx].credit = parseFloat(e.target.value) || 0; setLines(next); }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center pt-2">
        <Button variant="outline" size="sm" onClick={addLine}>+ Add Line</Button>
        <div className="text-xs space-x-4">
          <span>Total Dr: <strong>{totalDebit} QAR</strong></span>
          <span>Total Cr: <strong>{totalCredit} QAR</strong></span>
          <Button size="sm" onClick={submit}>Post Voucher</Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PAYMENT SUB-MODULES
// ─────────────────────────────────────────────────────────────────────────────

function GrnCostMappingSubModule() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Goods Received Note (GRN) Cost Mapping</h3>
      <Table>
        <TableHeader><TableRow><TableHead>GRN Ref</TableHead><TableHead>Vendor</TableHead><TableHead>GRN Cost</TableHead><TableHead>Mapped GL Account</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow><TableCell className="font-mono">GRN-2026-081</TableCell><TableCell>Qatar Maintenance Co.</TableCell><TableCell>14,500 QAR</TableCell><TableCell>5020 - Repairs & Maintenance</TableCell><TableCell><Badge>Mapped</Badge></TableCell></TableRow>
          <TableRow><TableCell className="font-mono">GRN-2026-082</TableCell><TableCell>Gulf Facility Services</TableCell><TableCell>8,200 QAR</TableCell><TableCell>5030 - Cleaning Services</TableCell><TableCell><Badge variant="outline">Pending</Badge></TableCell></TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function PayableInvoiceSubModule() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="text-sm font-semibold">Accounts Payable Invoices</h3><Button size="sm">+ Create AP Invoice</Button></div>
      <Table>
        <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Vendor</TableHead><TableHead>Due Date</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow><TableCell className="font-mono">INV-AP-9901</TableCell><TableCell>Qatar Maintenance Co.</TableCell><TableCell>2026-08-25</TableCell><TableCell>14,500 QAR</TableCell><TableCell><Badge variant="destructive" className="font-normal">Unpaid</Badge></TableCell></TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function VoucherManagerSubModule({ type }: { type: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="text-sm font-semibold">{type}s Register</h3><Button size="sm">+ New {type}</Button></div>
      <Table>
        <TableHeader><TableRow><TableHead>Voucher #</TableHead><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow><TableCell className="font-mono">VOU-2026-001</TableCell><TableCell>2026-08-01</TableCell><TableCell>Standard {type} Entry</TableCell><TableCell>5,400 QAR</TableCell></TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function ReceivableInvoiceSubModule() {
  const [data, setData] = useState<ARLedger[]>([]);
  useEffect(() => { load(); }, []);
  async function load() { try { setData(await fetchARLedgers()); } catch (e: any) {} }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Accounts Receivable (AR) Invoices</h3>
      <Table>
        <TableHeader><TableRow><TableHead>Reference</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Balance</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map(ar => (
            <TableRow key={ar.id}>
              <TableCell className="font-mono font-semibold">{ar.reference}</TableCell>
              <TableCell className="capitalize">{ar.type}</TableCell>
              <TableCell>{ar.date}</TableCell>
              <TableCell>{ar.amount} QAR</TableCell>
              <TableCell className="font-bold text-emerald-600">{ar.balance} QAR</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. BANK ACCOUNTING SUB-MODULES
// ─────────────────────────────────────────────────────────────────────────────

function BankSubModule() {
  const [data, setData] = useState<FinBank[]>([]);
  useEffect(() => { load(); }, []);
  async function load() { try { setData(await FinBanksApi.fetchAll()); } catch (e: any) {} }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Banks Registered</h3>
      <Table>
        <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Bank Name</TableHead><TableHead>SWIFT Code</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map(b => (
            <TableRow key={b.id}><TableCell className="font-mono">{b.code}</TableCell><TableCell className="font-semibold">{b.name}</TableCell><TableCell className="font-mono text-xs">{b.swift_code}</TableCell></TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function BankAccountSubModule() {
  const [data, setData] = useState<FinBankAccount[]>([]);
  useEffect(() => { load(); }, []);
  async function load() { try { setData(await FinBankAccountsApi.fetchAll()); } catch (e: any) {} }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold font-sans">Bank Accounts Portfolio</h3>
      <Table>
        <TableHeader><TableRow><TableHead>Account Number</TableHead><TableHead>Account Title</TableHead><TableHead>Currency</TableHead><TableHead>Opening Balance</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map(a => (
            <TableRow key={a.id}><TableCell className="font-mono font-bold">{a.account_number}</TableCell><TableCell>{a.account_title}</TableCell><TableCell>{a.currency}</TableCell><TableCell>{a.opening_balance} QAR</TableCell></TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function BankClearanceSubModule() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Cheque & Bank Clearance Console</h3>
      <Table>
        <TableHeader><TableRow><TableHead>Cheque #</TableHead><TableHead>Bank</TableHead><TableHead>Amount</TableHead><TableHead>Clearance Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow><TableCell className="font-mono">CHQ-998811</TableCell><TableCell>QNB</TableCell><TableCell>12,500 QAR</TableCell><TableCell>2026-08-05</TableCell><TableCell><Badge>Cleared</Badge></TableCell></TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function BankReconciliationSubModule() {
  const [data, setData] = useState<FinBankReconciliation[]>([]);
  useEffect(() => { load(); }, []);
  async function load() { try { setData(await FinBankReconciliationsApi.fetchAll()); } catch (e: any) {} }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Bank Reconciliation Workbench</h3>
      <Table>
        <TableHeader><TableRow><TableHead>Account #</TableHead><TableHead>Statement Date</TableHead><TableHead>Book Balance</TableHead><TableHead>Bank Statement Balance</TableHead><TableHead>Diff</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map(r => (
            <TableRow key={r.id}>
              <TableCell className="font-mono">{r.account_number}</TableCell>
              <TableCell>{r.statement_date}</TableCell>
              <TableCell>{r.book_balance} QAR</TableCell>
              <TableCell>{r.statement_balance} QAR</TableCell>
              <TableCell className="font-bold">{r.book_balance - r.statement_balance} QAR</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function BankReconciliationStatementListSubModule() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Reconciliation Statements Archive</h3>
      <div className="border rounded-md p-4 text-xs space-y-2">
        <div className="flex justify-between border-b pb-2"><span>QNB-0001 Reconciled Statement - July 2026</span><Button size="sm" variant="outline"><Download className="h-3 w-3 mr-1" /> PDF</Button></div>
        <div className="flex justify-between border-b pb-2"><span>CBQ-0002 Reconciled Statement - June 2026</span><Button size="sm" variant="outline"><Download className="h-3 w-3 mr-1" /> PDF</Button></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. FINANCE REPORTS SUB-MODULES
// ─────────────────────────────────────────────────────────────────────────────

function TrialBalanceSimpleSubModule() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Trial Balance (Simple Summary)</h3>
      <Table>
        <TableHeader><TableRow><TableHead>Account Type</TableHead><TableHead className="text-right">Total Debit</TableHead><TableHead className="text-right">Total Credit</TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow><TableCell>Assets</TableCell><TableCell className="text-right font-mono">1,850,000 QAR</TableCell><TableCell className="text-right font-mono">0 QAR</TableCell></TableRow>
          <TableRow><TableCell>Liabilities</TableCell><TableCell className="text-right font-mono">0 QAR</TableCell><TableCell className="text-right font-mono">450,000 QAR</TableCell></TableRow>
          <TableRow><TableCell>Income</TableCell><TableCell className="text-right font-mono">0 QAR</TableCell><TableCell className="text-right font-mono">1,600,000 QAR</TableCell></TableRow>
          <TableRow><TableCell>Expenses</TableCell><TableCell className="text-right font-mono">200,000 QAR</TableCell><TableCell className="text-right font-mono">0 QAR</TableCell></TableRow>
          <TableRow className="font-bold border-t"><TableCell>Total</TableCell><TableCell className="text-right">2,050,000 QAR</TableCell><TableCell className="text-right">2,050,000 QAR</TableCell></TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function TrialBalanceFullSubModule() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Detailed Trial Balance Report</h3>
      <Table>
        <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Account Name</TableHead><TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow><TableCell className="font-mono">1010</TableCell><TableCell>Bank Operating Account</TableCell><TableCell className="text-right font-mono">1,250,000 QAR</TableCell><TableCell className="text-right font-mono">0 QAR</TableCell></TableRow>
          <TableRow><TableCell className="font-mono">4010</TableCell><TableCell>Rental Income</TableCell><TableCell className="text-right font-mono">0 QAR</TableCell><TableCell className="text-right font-mono">1,250,000 QAR</TableCell></TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function ProfitAndLossSubModule() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Profit and Loss Statement (P&L)</h3>
      <Card className="p-4 space-y-2 text-sm">
        <div className="flex justify-between font-bold border-b pb-1"><span>Total Rental & Service Revenue</span><span className="text-emerald-600">385,000 QAR</span></div>
        <div className="flex justify-between text-muted-foreground"><span>Maintenance Expenses</span><span>-42,000 QAR</span></div>
        <div className="flex justify-between text-muted-foreground"><span>Administrative & Payroll</span><span>-70,400 QAR</span></div>
        <div className="flex justify-between font-bold text-base border-t pt-2"><span>Net Profit</span><span className="text-emerald-600">272,600 QAR</span></div>
      </Card>
    </div>
  );
}

function BalanceSheetSubModule() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Balance Sheet Statement</h3>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <Card className="p-4 space-y-2">
          <h4 className="font-bold text-sm border-b pb-1">Assets</h4>
          <div className="flex justify-between"><span>Bank & Cash</span><span>1,700,000 QAR</span></div>
          <div className="flex justify-between"><span>Properties & Land</span><span>15,000,000 QAR</span></div>
          <div className="flex justify-between font-bold border-t pt-1"><span>Total Assets</span><span>16,700,000 QAR</span></div>
        </Card>
        <Card className="p-4 space-y-2">
          <h4 className="font-bold text-sm border-b pb-1">Liabilities & Equity</h4>
          <div className="flex justify-between"><span>Tenant Security Deposits</span><span>450,000 QAR</span></div>
          <div className="flex justify-between"><span>Owner Equity</span><span>16,250,000 QAR</span></div>
          <div className="flex justify-between font-bold border-t pt-1"><span>Total Liabilities & Equity</span><span>16,700,000 QAR</span></div>
        </Card>
      </div>
    </div>
  );
}

function GeneralLedgerReportSubModule() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">General Ledger Transaction Audit</h3>
      <Table>
        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Account</TableHead><TableHead>Ref</TableHead><TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow><TableCell>2026-08-01</TableCell><TableCell>1010 - QNB Bank</TableCell><TableCell>REC-001</TableCell><TableCell className="text-right">12,500 QAR</TableCell><TableCell className="text-right">0 QAR</TableCell></TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function CashFlowSubModule() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Cash Flow Statement</h3>
      <Card className="p-4 space-y-2 text-xs">
        <div className="flex justify-between font-semibold"><span>Operating Cash Flow</span><span className="text-emerald-600">+280,000 QAR</span></div>
        <div className="flex justify-between font-semibold"><span>Investing Cash Flow</span><span>-50,000 QAR</span></div>
        <div className="flex justify-between font-bold border-t pt-2"><span>Net Cash Increase</span><span className="text-emerald-600">+230,000 QAR</span></div>
      </Card>
    </div>
  );
}

function CashBookSubModule() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Main Cash Book</h3>
      <Table>
        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Voucher</TableHead><TableHead>Description</TableHead><TableHead className="text-right">In</TableHead><TableHead className="text-right">Out</TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow><TableCell>2026-08-02</TableCell><TableCell>CSH-01</TableCell><TableCell>Cash Rent Collection</TableCell><TableCell className="text-right font-bold text-emerald-600">5,500 QAR</TableCell><TableCell className="text-right">0 QAR</TableCell></TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function PettyCashBookSubModule() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Petty Cash Register</h3>
      <Table>
        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Expense Description</TableHead><TableHead>Paid To</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow><TableCell>2026-08-03</TableCell><TableCell>Office Supplies & Tea</TableCell><TableCell>Supermarket</TableCell><TableCell className="text-right">150 QAR</TableCell></TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function CashOnHandSubModule() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Current Cash Position</h3>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Office Vault Cash</p><h4 className="text-2xl font-bold mt-1">24,500 QAR</h4></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Petty Cash Custodian</p><h4 className="text-2xl font-bold mt-1">1,850 QAR</h4></Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CONTRACT MANAGEMENT SUB-MODULES
// ─────────────────────────────────────────────────────────────────────────────

function ContractManagementSubModule({ type }: { type: "Expense" | "Revenue" }) {
  const [data, setData] = useState<FinContract[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ contract_number: "", title: "", party_name: "", type, total_value: 10000, start_date: "", end_date: "", status: "Active" });

  useEffect(() => { load(); }, [type]);
  async function load() {
    try {
      const all = await FinContractsApi.fetchAll();
      setData(all.filter(c => c.type === type));
    } catch (e: any) {}
  }

  async function handleAdd() {
    try {
      await FinContractsApi.create({ ...form, type });
      toast.success(`${type} Contract saved`);
      setOpen(false);
      load();
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">{type} Contracts Register</h3>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add {type} Contract</Button>
      </div>

      <Table>
        <TableHeader><TableRow><TableHead>Contract #</TableHead><TableHead>Title</TableHead><TableHead>Party Name</TableHead><TableHead>Total Value</TableHead><TableHead>Period</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map(c => (
            <TableRow key={c.id}>
              <TableCell className="font-mono font-bold">{c.contract_number}</TableCell>
              <TableCell>{c.title}</TableCell>
              <TableCell>{c.party_name}</TableCell>
              <TableCell className="font-semibold">{c.total_value} QAR</TableCell>
              <TableCell className="text-xs">{c.start_date} to {c.end_date}</TableCell>
              <TableCell><Badge variant="outline">{c.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add {type} Contract</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Contract Number</Label><Input placeholder="CNT-001" value={form.contract_number} onChange={e => setForm({...form, contract_number: e.target.value})} /></div>
            <div><Label>Contract Title</Label><Input placeholder="Facility Agreement" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div><Label>Party Name</Label><Input placeholder="Vendor or Tenant Name" value={form.party_name} onChange={e => setForm({...form, party_name: e.target.value})} /></div>
            <div><Label>Total Value (QAR)</Label><Input type="number" value={form.total_value} onChange={e => setForm({...form, total_value: parseFloat(e.target.value) || 0})} /></div>
            <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} /></div>
            <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleAdd}>Save Contract</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
