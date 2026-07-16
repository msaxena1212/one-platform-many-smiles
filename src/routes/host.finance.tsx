import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowUpRight, ArrowDownRight, Loader2, RefreshCw, Plus, CheckCircle2,
  FileText, CreditCard, BookOpen, BarChart3, TrendingUp, AlertCircle
} from "lucide-react";
import {
  supabase,
  fetchJournalEntries, fetchReceipts, fetchARLedgers, fetchGLAccounts,
  fetchProvisions, createProvision,
  createJournalEntry, updateJournalEntry,
  createReceipt, updateReceipt,
  createAREntry, settleAREntry,
  createGLAccount, fetchProperties, fetchUnits, createUnit, fetchLeases, createLease, createRentSchedules,
  type JournalEntry, type Receipt, type ARLedger, type GLAccount,
  type Provision,
} from "@/lib/supabase";
import { accountMasterSeed, accountTransactionsSeed, referenceDropdowns } from "@/lib/reference-data";

export const Route = createFileRoute("/host/finance")({
  component: HostFinance,
});

const PAYMENT_MODES = ["cash", "bank", "cheque", "sadad", "mada", "apple_pay", "stc_pay", "card", "bank_transfer"];
const MOCK_HOST_ID = "00000000-0000-4000-8000-000000000001";
const AR_TYPES = ["invoice", "receipt", "credit_note", "debit_note"];

function HostFinance() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [arLedgers, setARLedgers] = useState<ARLedger[]>([]);
  const [glAccounts, setGLAccounts] = useState<GLAccount[]>([]);
  const [provisions, setProvisions] = useState<Provision[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Dialogs
  const [showNewReceipt, setShowNewReceipt] = useState(false);
  const [showNewJE, setShowNewJE] = useState(false);
  const [showNewAR, setShowNewAR] = useState(false);
  const [showNewGL, setShowNewGL] = useState(false);
  const [editReceipt, setEditReceipt] = useState<Receipt | null>(null);
  const [editJE, setEditJE] = useState<JournalEntry | null>(null);
  const [saving, setSaving] = useState(false);

  const [receiptForm, setReceiptForm] = useState({
    ref: "", payment_mode: "bank_transfer" as Receipt["payment_mode"],
    amount: "", currency: "USD", status: "pending" as Receipt["status"],
    customer_name: "", settlement_type: "pdc" as string,
  });
  const [jeForm, setJEForm] = useState({
    je_no: "", posting_date: new Date().toISOString().split("T")[0],
    period: new Date().toISOString().slice(0, 7),
    source_module: "manual", narration: "", status: "draft" as JournalEntry["status"],
  });
  const [arForm, setARForm] = useState({
    reference: "", type: "invoice" as ARLedger["type"],
    date: new Date().toISOString().split("T")[0],
    amount: "", balance: "", status: "open" as ARLedger["status"],
  });

  const [glForm, setGLForm] = useState({ code: '', name_en: '', type: 'asset', currency: 'USD', is_postable: true });

  async function handleCreateGL(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createGLAccount({ code: glForm.code, name_en: glForm.name_en, type: glForm.type as any, currency: glForm.currency, is_postable: Boolean(glForm.is_postable) });
      setShowNewGL(false);
      setGLForm({ code: '', name_en: '', type: 'asset', currency: 'USD', is_postable: true });
      await loadData();
    } catch (e: any) { console.error(e.message); }
    finally { setSaving(false); }
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [jes, recs, ars, gls] = await Promise.all([
        fetchJournalEntries(),
        fetchReceipts(),
        fetchARLedgers().catch(() => [] as ARLedger[]),
          fetchGLAccounts().catch(() => [] as GLAccount[]),
          // provisions loaded separately
      ]);
      setJournalEntries(jes);
      setReceipts(recs);
      setARLedgers(ars);
      setGLAccounts(gls);
        const provs = await fetchProvisions().catch(() => [] as Provision[]);
        setProvisions(provs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const channel1 = supabase.channel("je_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "journal_entries" }, loadData)
      .subscribe();
    const channel2 = supabase.channel("receipt_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "receipts" }, loadData)
      .subscribe();
    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
  }, [loadData]);

  // Auto-seed basic finance data (COA, AR, Receipts) when empty
  useEffect(() => {
    (async () => {
      try {
        if (!loading && glAccounts.length === 0) {
          // basic COA seeded from the workbook reference data
          const basicCOA = [
            { code: '1000', name_en: 'Cash', type: 'asset', currency: 'USD', is_postable: true },
            { code: '1100', name_en: 'Accounts Receivable', type: 'asset', currency: 'USD', is_postable: true },
            { code: '1200', name_en: 'PDC In Hand', type: 'asset', currency: 'USD', is_postable: true },
            { code: '2000', name_en: 'Accounts Payable', type: 'liability', currency: 'USD', is_postable: true },
            { code: '3000', name_en: 'Security Deposit Liability', type: 'liability', currency: 'USD', is_postable: true },
            { code: '4000', name_en: 'Rental Income', type: 'income', currency: 'USD', is_postable: true },
            { code: '5000', name_en: 'Repairs & Maintenance', type: 'expense', currency: 'USD', is_postable: true },
          ];
          for (const g of basicCOA) {
            await createGLAccount(g as any);
          }

          // sample AR and receipts
          await createAREntry({ reference: 'INV-1001', type: 'invoice', date: new Date().toISOString().split('T')[0], amount: 2500, balance: 2500, status: 'open' });
          await createAREntry({ reference: 'INV-1002', type: 'invoice', date: new Date().toISOString().split('T')[0], amount: 1800, balance: 1800, status: 'open' });
          await createAREntry({ reference: 'INV-1003', type: 'invoice', date: new Date().toISOString().split('T')[0], amount: 3200, balance: 1600, status: 'partial' });
          await createReceipt({ ref: 'RCPT-2001', payment_mode: 'bank_transfer', amount: 2500, currency: 'USD', received_at: new Date().toISOString(), allocations: { customer_name: 'Mr. Hafeez Shaik', settlement_type: 'pdc' }, status: 'completed' });
          for (const txn of accountTransactionsSeed) {
            await createAREntry({ reference: `${txn.voucher}-${txn.period}`, type: 'invoice', date: new Date().toISOString().split('T')[0], amount: txn.amount, balance: txn.amount, status: 'open' });
          }

          // create units for each property and optional leases
          const properties = await fetchProperties();
          const gls = await fetchGLAccounts();
          for (const p of properties || []) {
            const existingUnits = await fetchUnits({ property_id: p.id });
            if (!existingUnits || existingUnits.length === 0) {
              const count = Math.random() > 0.5 ? 2 : 1;
              for (let i = 0; i < count; i++) {
                const ref = `${(p.title || 'U').split(' ').map(s => s[0]).join('')}-${Math.floor(100 + Math.random()*899)}`;
                await createUnit({ property_id: p.id, unit_ref: ref, room_type: 'FLAT', bedrooms: 2, bathrooms: 2, area: '100 sqm', price: 2500, status: 'AVAILABLE' });
              }
            }
            // create sample lease for some units
            const units = await fetchUnits({ property_id: p.id });
            const existingLeases = await fetchLeases({ property_id: p.id }).catch(() => []);
            for (const u of units) {
              const hasLease = (existingLeases || []).some((ls: any) => ls.unit_ref === u.unit_ref);
              if (!hasLease && Math.random() > 0.4) {
                const start = new Date();
                const end = new Date(start);
                end.setFullYear(end.getFullYear() + 1);
                const monthly = u.price || 2500;
                const lease = await createLease({
                  property_id: p.id,
                  unit_ref: u.unit_ref,
                  tenant_name: `Tenant ${u.unit_ref}`,
                  start_date: start.toISOString().split('T')[0],
                  end_date: end.toISOString().split('T')[0],
                  monthly_rent: Number(monthly),
                  security_deposit: Number(monthly) * 2,
                  status: 'active',
                  host_id: (p as any).host_id || MOCK_HOST_ID,
                });
                // create simple monthly rent schedules for the lease
                const schedules = [];
                const s = new Date(lease.start_date);
                const e = new Date(lease.end_date);
                let c = new Date(s);
                let lineNo = 1;
                while (c <= e) {
                  schedules.push({ lease_id: lease.id, due_date: c.toISOString().split('T')[0], amount: lease.monthly_rent, status: 'unpaid' });
                  c.setMonth(c.getMonth() + 1);
                  lineNo++;
                  if (schedules.length > 60) break;
                }
                if (schedules.length) await createRentSchedules(schedules);
              }
            }
          }

          // create sample journal entries (GL lines)
          // find account ids
          const cash = gls.find(g => g.code === '1000');
          const ar = gls.find(g => g.code === '1100');
          const rent = gls.find(g => g.code === '4000');
          const repairs = gls.find(g => g.code === '5000');
          const firstProperty = properties?.[0];
          const firstUnits = firstProperty ? await fetchUnits({ property_id: firstProperty.id }) : [];
          const sampleUnit = firstUnits?.[0];

          if (cash && ar && rent) {
            // Receipt entry: Debit Cash, Credit AR
            await createJournalEntry({
              je_no: `JE-${Date.now()}-RCT`,
              posting_date: new Date().toISOString().split('T')[0],
              period: new Date().toISOString().slice(0,7),
              source_module: 'receipt',
              narration: 'Sample receipt posted',
              status: 'posted',
              journal_lines: [
                { line_no: 1, account_id: cash.id, debit: 2500, credit: 0, currency: 'USD', fx_rate: 1, property_id: firstProperty?.id, unit_id: sampleUnit?.id },
                { line_no: 2, account_id: ar.id, debit: 0, credit: 2500, currency: 'USD', fx_rate: 1, property_id: firstProperty?.id, unit_id: sampleUnit?.id },
              ]
            });
          }

          if (ar && rent) {
            // Rent invoice: Debit AR, Credit Rental Income
            await createJournalEntry({
              je_no: `JE-${Date.now()}-INV`,
              posting_date: new Date().toISOString().split('T')[0],
              period: new Date().toISOString().slice(0,7),
              source_module: 'lease',
              narration: 'Sample rent invoice',
              status: 'posted',
              journal_lines: [
                { line_no: 1, account_id: ar.id, debit: 1800, credit: 0, currency: 'USD', fx_rate: 1, property_id: firstProperty?.id, unit_id: sampleUnit?.id },
                { line_no: 2, account_id: rent.id, debit: 0, credit: 1800, currency: 'USD', fx_rate: 1, property_id: firstProperty?.id, unit_id: sampleUnit?.id },
              ]
            });
          }

          await loadData();
        }
      } catch (e) { console.error('Finance seed', e); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Totals
  const totalCollected = receipts.filter(r => r.status === "completed").reduce((s, r) => s + Number(r.amount), 0);
  const totalPending = receipts.filter(r => r.status === "pending").reduce((s, r) => s + Number(r.amount), 0);
  const totalDebits = journalEntries.reduce((s, je) => s + (je.journal_lines || []).reduce((ss, l) => ss + Number(l.debit), 0), 0);
  const totalCredits = journalEntries.reduce((s, je) => s + (je.journal_lines || []).reduce((ss, l) => ss + Number(l.credit), 0), 0);
  const openAR = arLedgers.filter(a => a.status !== "closed").reduce((s, a) => s + Number(a.balance), 0);

  async function handleCreateReceipt(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createReceipt({
        ref: receiptForm.ref,
        payment_mode: receiptForm.payment_mode,
        amount: Number(receiptForm.amount),
        currency: receiptForm.currency,
        received_at: new Date().toISOString(),
        allocations: {
          customer_name: receiptForm.customer_name,
          settlement_type: receiptForm.settlement_type,
          source: 'host.finance',
        },
        status: receiptForm.status,
      });
      setShowNewReceipt(false);
      setReceiptForm({ ref: "", payment_mode: "bank_transfer", amount: "", currency: "USD", status: "pending", customer_name: "", settlement_type: "pdc" });
      await loadData();
    } catch (e: any) { console.error(e.message); }
    finally { setSaving(false); }
  }

  async function handleSettleReceipt(id: string) {
    await updateReceipt(id, { status: "completed" });
    await loadData();
  }

  async function handleCreateJE(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createJournalEntry({
        je_no: jeForm.je_no || `JE-${Date.now()}`,
        posting_date: jeForm.posting_date,
        period: jeForm.period,
        source_module: jeForm.source_module,
        narration: jeForm.narration,
        status: jeForm.status,
      });
      setShowNewJE(false);
      setJEForm({ je_no: "", posting_date: new Date().toISOString().split("T")[0], period: new Date().toISOString().slice(0, 7), source_module: "manual", narration: "", status: "draft" });
      await loadData();
    } catch (e: any) { console.error(e.message); }
    finally { setSaving(false); }
  }

  async function handlePostJE(id: string) {
    await updateJournalEntry(id, { status: "posted" });
    await loadData();
  }

  async function handleCreateAR(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createAREntry({
        reference: arForm.reference,
        type: arForm.type,
        date: arForm.date,
        amount: Number(arForm.amount),
        balance: Number(arForm.balance || arForm.amount),
        status: arForm.status,
      });
      setShowNewAR(false);
      setARForm({ reference: "", type: "invoice", date: new Date().toISOString().split("T")[0], amount: "", balance: "", status: "open" });
      await loadData();
    } catch (e: any) { console.error(e.message); }
    finally { setSaving(false); }
  }

  async function handleSettleAR(id: string) {
    await settleAREntry(id);
    await loadData();
  }

  const arStatusColor: Record<string, string> = {
    open: "bg-amber-100 text-amber-700",
    partial: "bg-blue-100 text-blue-700",
    closed: "bg-green-100 text-green-700",
  };
  const jeStatusColor: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    posted: "bg-green-100 text-green-700",
    reversed: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Finance & Accounting</h2>
          <p className="text-muted-foreground">General Ledger · Accounts Receivable · Receipts · Provisions</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Total Collected", value: `$${totalCollected.toLocaleString()}`, icon: <TrendingUp className="h-5 w-5 text-green-500" />, sub: "Completed receipts", color: "text-green-600" },
          { label: "Pending Receipts", value: `$${totalPending.toLocaleString()}`, icon: <AlertCircle className="h-5 w-5 text-amber-500" />, sub: "Awaiting clearance", color: "text-amber-600" },
          { label: "Open AR Balance", value: `$${openAR.toLocaleString()}`, icon: <FileText className="h-5 w-5 text-blue-500" />, sub: "Outstanding invoices", color: "text-blue-600" },
          { label: "Total Debits Posted", value: `$${totalDebits.toLocaleString()}`, icon: <ArrowDownRight className="h-5 w-5 text-red-500" />, sub: "GL debit side", color: "text-red-600" },
          { label: "Total Credits Posted", value: `$${totalCredits.toLocaleString()}`, icon: <ArrowUpRight className="h-5 w-5 text-blue-500" />, sub: "GL credit side", color: "text-blue-600" },
        ].map((k) => (
          <Card key={k.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{k.label}</CardTitle>
                {k.icon}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (
                <>
                  <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{k.sub}</div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview"><BookOpen className="h-4 w-4 mr-1.5" />General Ledger</TabsTrigger>
          <TabsTrigger value="ar"><FileText className="h-4 w-4 mr-1.5" />Accounts Receivable</TabsTrigger>
          <TabsTrigger value="receipts"><CreditCard className="h-4 w-4 mr-1.5" />Receipts</TabsTrigger>
          <TabsTrigger value="coa"><BarChart3 className="h-4 w-4 mr-1.5" />Chart of Accounts</TabsTrigger>
            <TabsTrigger value="provisions"><FileText className="h-4 w-4 mr-1.5" />Provisions</TabsTrigger>
            <TabsTrigger value="pl"><TrendingUp className="h-4 w-4 mr-1.5" />P&L</TabsTrigger>
        </TabsList>

        {/* === GENERAL LEDGER TAB === */}
        <TabsContent value="overview">
          <Card>
            <div className="flex items-center justify-between p-6 pb-4">
              <div>
                <CardTitle>Detailed General Ledger</CardTitle>
                <CardDescription>All journal entries with full debit/credit breakdowns per GL account</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  {totalDebits === totalCredits ? "✓ Balanced" : "⚠ Unbalanced"}
                </span>
                <Button size="sm" onClick={() => setShowNewJE(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Entry
                </Button>
              </div>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-y border-border bg-muted/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">JE No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Memo / Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Account</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Entity</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Debit ($)</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Credit ($)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr><td colSpan={9} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
                    ) : journalEntries.length === 0 ? (
                      <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No journal entries. Click "Add Entry" to create one.</td></tr>
                    ) : journalEntries.flatMap((je) => {
                      const lines = je.journal_lines || [];
                      if (lines.length === 0) {
                        return [(
                          <tr key={je.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs">{je.je_no}</td>
                            <td className="px-6 py-4 font-mono text-xs">{new Date(je.posting_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 font-medium">{je.narration}</td>
                            <td className="px-6 py-4 text-muted-foreground text-xs">—</td>
                            <td className="px-6 py-4 text-muted-foreground text-xs">—</td>
                            <td className="px-6 py-4 text-right text-xs font-mono">—</td>
                            <td className="px-6 py-4 text-right text-xs font-mono">—</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${jeStatusColor[je.status]}`}>{je.status}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {je.status === "draft" && (
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handlePostJE(je.id)}>Post</Button>
                              )}
                            </td>
                          </tr>
                        )];
                      }
                      return lines.map((line: any, idx: number) => {
                        const deb = Number(line.debit);
                        const cred = Number(line.credit);
                        const accountName = line.gl_accounts
                          ? `${line.gl_accounts.code} - ${line.gl_accounts.name_en}`
                          : (line.account_id || "—");
                        const entity = [line.property_id, line.unit_id, line.cost_center_id].filter(Boolean).join(" / ") || "—";
                        return (
                          <tr key={`${je.id}-${idx}`} className="hover:bg-muted/10 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs">{idx === 0 ? je.je_no : ""}</td>
                            <td className="px-6 py-4 font-mono text-xs">{idx === 0 ? new Date(je.posting_date).toLocaleDateString() : ""}</td>
                            <td className="px-6 py-4">
                              <div className={idx === 0 ? "font-medium" : "text-muted-foreground pl-4 text-xs"}>
                                {idx === 0 ? je.narration : "↳ " + (line.description || "Line item")}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground text-xs">{accountName}</td>
                            <td className="px-6 py-4 text-muted-foreground text-xs">{entity}</td>
                            <td className="px-6 py-4 text-right text-xs font-mono">{deb > 0 ? "$" + deb.toLocaleString() : "—"}</td>
                            <td className="px-6 py-4 text-right text-xs font-mono">{cred > 0 ? "$" + cred.toLocaleString() : "—"}</td>
                            <td className="px-6 py-4">
                              {idx === 0 && <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${jeStatusColor[je.status]}`}>{je.status}</span>}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {idx === 0 && je.status === "draft" && (
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handlePostJE(je.id)}>Post</Button>
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-border font-semibold">
                    <tr>
                      <td className="px-6 py-4" colSpan={5}>Totals</td>
                      <td className="px-6 py-4 text-right">${totalDebits.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">${totalCredits.toLocaleString()}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === PROVISIONS TAB === */}
        <TabsContent value="provisions">
          <Card>
            <div className="flex items-center justify-between p-6 pb-4">
              <div>
                <CardTitle>Provisions</CardTitle>
                <CardDescription>Manage provisions and P&L accruals</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowNewAR(true)}>
                <Plus className="h-4 w-4 mr-1" /> New Provision
              </Button>
            </div>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-y border-border bg-muted/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Period</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">GL Account</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
                    ) : provisions.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No provisions yet.</td></tr>
                    ) : provisions.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 font-medium">{p.name}</td>
                        <td className="px-6 py-4 font-mono text-xs">{p.period}</td>
                        <td className="px-6 py-4 text-right font-medium">${Number(p.amount).toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs">{p.gl_account_id || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === P&L TAB === */}
        <TabsContent value="pl">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss (Period)</CardTitle>
              <CardDescription>Basic P&L summary derived from journal entries</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Calculate totals for income and expense from journalEntries */}
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                (() => {
                  const income = journalEntries.flatMap(je => (je.journal_lines || [])).filter((l: any) => l.gl_accounts?.type === 'income');
                  const expense = journalEntries.flatMap(je => (je.journal_lines || [])).filter((l: any) => l.gl_accounts?.type === 'expense');
                  const incomeTotal = income.reduce((s: number, l: any) => s + Number(l.credit || 0) - Number(l.debit || 0), 0);
                  const expenseTotal = expense.reduce((s: number, l: any) => s + Number(l.debit || 0) - Number(l.credit || 0), 0);
                  const net = incomeTotal - expenseTotal;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Income</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl font-bold text-green-600">${incomeTotal.toLocaleString()}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl font-bold text-red-600">${expenseTotal.toLocaleString()}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Net Profit</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className={`text-xl font-bold ${net >= 0 ? 'text-green-700' : 'text-red-700'}`}>${net.toLocaleString()}</div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === AR LEDGER TAB === */}
        <TabsContent value="ar">
          <Card>
            <div className="flex items-center justify-between p-6 pb-4">
              <div>
                <CardTitle>Accounts Receivable Ledger</CardTitle>
                <CardDescription>Track invoices, receipts, credit/debit notes and settle open balances</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowNewAR(true)}>
                <Plus className="h-4 w-4 mr-1" /> New AR Entry
              </Button>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-y border-border bg-muted/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Outstanding Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
                    ) : arLedgers.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No AR entries yet. Click "New AR Entry" to create one.</td></tr>
                    ) : arLedgers.map((ar) => (
                      <tr key={ar.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-medium">{ar.reference}</td>
                        <td className="px-6 py-4 text-xs capitalize">{ar.type.replace("_", " ")}</td>
                        <td className="px-6 py-4 font-mono text-xs">{new Date(ar.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">${Number(ar.amount).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-medium">
                          <span className={Number(ar.balance) > 0 ? "text-amber-600" : "text-green-600"}>
                            ${Number(ar.balance).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${arStatusColor[ar.status]}`}>
                            {ar.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {ar.status !== "closed" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs text-green-600 border-green-200" onClick={() => handleSettleAR(ar.id)}>
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Settle
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {arLedgers.length > 0 && (
                    <tfoot className="border-t-2 border-border font-semibold">
                      <tr>
                        <td className="px-6 py-4" colSpan={3}>Totals</td>
                        <td className="px-6 py-4 text-right">${arLedgers.reduce((s, a) => s + Number(a.amount), 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-amber-600">${arLedgers.filter(a => a.status !== "closed").reduce((s, a) => s + Number(a.balance), 0).toLocaleString()}</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === RECEIPTS TAB === */}
        <TabsContent value="receipts">
          <Card>
            <div className="flex items-center justify-between p-6 pb-4">
              <div>
                <CardTitle>Payment Receipts</CardTitle>
                <CardDescription>Track all incoming payments and mark them as completed</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowNewReceipt(true)}>
                <Plus className="h-4 w-4 mr-1" /> New Receipt
              </Button>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-y border-border bg-muted/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ref</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment Mode</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
                    ) : receipts.length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No receipts yet.</td></tr>
                    ) : receipts.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-medium">{r.ref || "—"}</td>
                        <td className="px-6 py-4 text-xs capitalize">{r.payment_mode.replace(/_/g, " ")}</td>
                        <td className="px-6 py-4 font-mono text-xs">{new Date(r.received_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right font-medium">${Number(r.amount).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${r.status === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {r.status === "pending" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs text-green-600 border-green-200" onClick={() => handleSettleReceipt(r.id)}>
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Received
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === CHART OF ACCOUNTS TAB === */}
        <TabsContent value="coa">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Chart of Accounts</CardTitle>
                <CardDescription>All GL accounts — Assets, Liabilities, Equity, Income, Expenses</CardDescription>
              </div>
              <div>
                <Button size="sm" onClick={() => setShowNewGL(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Account
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-y border-border bg-muted/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Currency</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Postable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
                    ) : glAccounts.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No GL accounts found in Supabase.</td></tr>
                    ) : glAccounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-semibold">{acc.code}</td>
                        <td className="px-6 py-4 font-medium">{acc.name_en}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            acc.type === "asset" ? "bg-blue-100 text-blue-700" :
                            acc.type === "liability" ? "bg-red-100 text-red-700" :
                            acc.type === "equity" ? "bg-purple-100 text-purple-700" :
                            acc.type === "income" ? "bg-green-100 text-green-700" :
                            "bg-orange-100 text-orange-700"
                          }`}>{acc.type}</span>
                        </td>
                        <td className="px-6 py-4 text-xs">{acc.currency}</td>
                        <td className="px-6 py-4 text-center">
                          {acc.is_postable
                            ? <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                            : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* === NEW RECEIPT DIALOG === */}
      <Dialog open={showNewReceipt} onOpenChange={setShowNewReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record New Receipt</DialogTitle>
            <DialogDescription>Log an incoming payment against a lease or invoice, including PDC deposit or cash deposit flow</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateReceipt} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Reference / Cheque # *</Label>
                <Input required value={receiptForm.ref} onChange={e => setReceiptForm(p => ({ ...p, ref: e.target.value }))} placeholder="RCT-00001" />
              </div>
              <div className="space-y-1">
                <Label>Amount ($) *</Label>
                <Input required type="number" value={receiptForm.amount} onChange={e => setReceiptForm(p => ({ ...p, amount: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Payment Mode *</Label>
              <Select value={receiptForm.payment_mode} onValueChange={v => setReceiptForm(p => ({ ...p, payment_mode: v as Receipt["payment_mode"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_MODES.map(m => <SelectItem key={m} value={m}>{m.replace(/_/g, " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Initial Status</Label>
              <Select value={receiptForm.status} onValueChange={v => setReceiptForm(p => ({ ...p, status: v as Receipt["status"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowNewReceipt(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Record Receipt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* === NEW JOURNAL ENTRY DIALOG === */}
      <Dialog open={showNewJE} onOpenChange={setShowNewJE}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Journal Entry</DialogTitle>
            <DialogDescription>Create a manual GL posting. Lines can be added via the ledger detail view.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateJE} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>JE Number</Label>
                <Input value={jeForm.je_no} onChange={e => setJEForm(p => ({ ...p, je_no: e.target.value }))} placeholder="Auto-generated if blank" />
              </div>
              <div className="space-y-1">
                <Label>Posting Date *</Label>
                <Input required type="date" value={jeForm.posting_date} onChange={e => setJEForm(p => ({ ...p, posting_date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Period *</Label>
                <Input required type="month" value={jeForm.period} onChange={e => setJEForm(p => ({ ...p, period: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Source Module</Label>
                <Select value={jeForm.source_module} onValueChange={v => setJEForm(p => ({ ...p, source_module: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["manual", "lease", "maintenance", "receipt", "deposit"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Narration / Memo *</Label>
              <Textarea required value={jeForm.narration} onChange={e => setJEForm(p => ({ ...p, narration: e.target.value }))} placeholder="Describe the transaction..." rows={3} />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={jeForm.status} onValueChange={v => setJEForm(p => ({ ...p, status: v as JournalEntry["status"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="posted">Post immediately</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowNewJE(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Create Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* === NEW GL ACCOUNT DIALOG === */}
      <Dialog open={showNewGL} onOpenChange={setShowNewGL}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New GL Account</DialogTitle>
            <DialogDescription>Create a chart of accounts entry</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGL} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Code *</Label>
                <Input required value={glForm.code} onChange={e => setGLForm(f => ({ ...f, code: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Name *</Label>
                <Input required value={glForm.name_en} onChange={e => setGLForm(f => ({ ...f, name_en: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={glForm.type} onValueChange={v => setGLForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Currency</Label>
                <Input value={glForm.currency} onChange={e => setGLForm(f => ({ ...f, currency: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowNewGL(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* === NEW AR ENTRY DIALOG === */}
      <Dialog open={showNewAR} onOpenChange={setShowNewAR}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New AR Ledger Entry</DialogTitle>
            <DialogDescription>Add an invoice, credit note, or debit note to the receivables ledger</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAR} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Reference *</Label>
                <Input required value={arForm.reference} onChange={e => setARForm(p => ({ ...p, reference: e.target.value }))} placeholder="INV-2026-001" />
              </div>
              <div className="space-y-1">
                <Label>Type *</Label>
                <Select value={arForm.type} onValueChange={v => setARForm(p => ({ ...p, type: v as ARLedger["type"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AR_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Date *</Label>
                <Input required type="date" value={arForm.date} onChange={e => setARForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Amount ($) *</Label>
                <Input required type="number" value={arForm.amount} onChange={e => setARForm(p => ({ ...p, amount: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Outstanding Balance ($)</Label>
                <Input type="number" value={arForm.balance} onChange={e => setARForm(p => ({ ...p, balance: e.target.value }))} placeholder="Default = Amount" />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={arForm.status} onValueChange={v => setARForm(p => ({ ...p, status: v as ARLedger["status"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowNewAR(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Add Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
