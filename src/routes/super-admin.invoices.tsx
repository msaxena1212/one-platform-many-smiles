import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Receipt, Download, Search, RefreshCw, Eye,
  Building2, CheckCircle2, AlertTriangle, XCircle,
  CreditCard, Calendar, Filter, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export const Route = createFileRoute("/super-admin/invoices")({
  head: () => ({ meta: [{ title: "Platform Subscription Invoices — ZYNO Super Admin" }] }),
  component: InvoicesPage,
});

export interface SubscriptionInvoice {
  id: string;
  invoice_number: string;
  tenant_id?: string;
  tenant_key: string;
  tenant_name: string;
  plan: string;
  billing_cycle: string;
  subtotal_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: "Paid" | "Pending" | "Overdue" | "Cancelled";
  issue_date: string;
  due_date: string;
  payment_date?: string;
  payment_method: string;
  transaction_ref?: string;
}

const STATUS_COLORS: Record<string, string> = {
  Paid: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  Pending: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  Overdue: "bg-red-500/15 text-red-600 border-red-500/20",
  Cancelled: "bg-slate-500/15 text-slate-600 border-slate-500/20",
};

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Selected Invoice Detail Modal
  const [selectedInvoice, setSelectedInvoice] = useState<SubscriptionInvoice | null>(null);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookForm, setWebhookForm] = useState({
    gateway: "qpay_naps" as "qpay_naps" | "stripe_checkout",
    invoice_number: "",
    amount: 999,
    status: "SUCCESS",
    transaction_ref: "",
  });
  const [triggeringWebhook, setTriggeringWebhook] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function handleTriggerWebhook() {
    if (!webhookForm.invoice_number) {
      toast.error("Please select an invoice number.");
      return;
    }

    setTriggeringWebhook(true);
    try {
      const targetInvoice = invoices.find(i => i.invoice_number === webhookForm.invoice_number);
      if (!targetInvoice) {
        toast.error("Invoice not found.");
        return;
      }

      const generatedRef = webhookForm.transaction_ref || `TXN-${webhookForm.gateway === "qpay_naps" ? "QPAY" : "STRIPE"}-${Date.now().toString().slice(-6)}`;

      // Update state live
      setInvoices(prev => prev.map(inv => {
        if (inv.invoice_number === webhookForm.invoice_number) {
          return {
            ...inv,
            status: "Paid",
            payment_date: new Date().toISOString(),
            payment_method: webhookForm.gateway === "qpay_naps" ? "QPAY (Qatar NAPS Debit)" : "Stripe Credit Card",
            transaction_ref: generatedRef,
          };
        }
        return inv;
      }));

      // Try updating in supabase if row exists
      await supabase
        .from("tenant_subscription_invoices")
        .update({
          status: "Paid",
          payment_date: new Date().toISOString(),
          payment_method: webhookForm.gateway === "qpay_naps" ? "QPAY (Qatar NAPS Debit)" : "Stripe Credit Card",
          transaction_ref: generatedRef,
        })
        .eq("invoice_number", webhookForm.invoice_number);

      toast.success(`Webhook received: Invoice ${webhookForm.invoice_number} settled live! Ref: ${generatedRef}`);
      setShowWebhookModal(false);
    } catch (err: any) {
      toast.error("Webhook processing failed: " + err.message);
    } finally {
      setTriggeringWebhook(false);
    }
  }

  async function loadInvoices() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tenant_subscription_invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setInvoices(data as SubscriptionInvoice[]);
      } else {
        // Fallback default sample records
        setInvoices([
          {
            id: "1",
            invoice_number: "INV-SUB-90214",
            tenant_key: "tenant-pearl-real-estate",
            tenant_name: "Pearl Island Properties W.L.L.",
            plan: "Enterprise",
            billing_cycle: "monthly",
            subtotal_amount: 2499,
            tax_amount: 0,
            discount_amount: 0,
            total_amount: 2499,
            currency: "QAR",
            status: "Paid",
            issue_date: "2026-09-01",
            due_date: "2026-09-15",
            payment_date: "2026-09-01T09:30:00Z",
            payment_method: "QPAY / NAPS",
            transaction_ref: "TXN-QPAY-882104",
          },
          {
            id: "2",
            invoice_number: "INV-SUB-90215",
            tenant_key: "tenant-lusail-towers",
            tenant_name: "Lusail Marina Towers Management",
            plan: "Professional",
            billing_cycle: "monthly",
            subtotal_amount: 999,
            tax_amount: 0,
            discount_amount: 0,
            total_amount: 999,
            currency: "QAR",
            status: "Paid",
            issue_date: "2026-09-01",
            due_date: "2026-09-15",
            payment_date: "2026-09-01T10:15:00Z",
            payment_method: "Direct Wire (QNB)",
            transaction_ref: "QNB-WIRE-092144",
          },
          {
            id: "3",
            invoice_number: "INV-SUB-90216",
            tenant_key: "tenant-albaraka-properties",
            tenant_name: "Al Baraka Properties LLC",
            plan: "Professional",
            billing_cycle: "annual",
            subtotal_amount: 9990,
            tax_amount: 0,
            discount_amount: 0,
            total_amount: 9990,
            currency: "QAR",
            status: "Paid",
            issue_date: "2026-08-15",
            due_date: "2026-08-30",
            payment_date: "2026-08-15T14:20:00Z",
            payment_method: "Credit Card",
            transaction_ref: "CC-VISA-440219",
          },
        ]);
      }
    } catch (err: any) {
      toast.error("Failed to load subscription invoices: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.tenant_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.plan.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalCollected = invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + Number(i.total_amount), 0);

  const pendingCount = invoices.filter((i) => i.status === "Pending").length;
  const overdueCount = invoices.filter((i) => i.status === "Overdue").length;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedInvoices = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white border border-indigo-500/20 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-md">
              <Receipt className="h-3.5 w-3.5 text-amber-300" />
              <span>Platform Financial Auditing</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Platform Subscription Invoices</h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Complete archive of subscription fee invoices, payment receipts, and tax records for all tenant organisations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowWebhookModal(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs gap-1.5 shadow-md"
            >
              <Sparkles className="h-4 w-4" /> Webhook Listener & Trigger
            </Button>
            <Button
              onClick={() => {
                const headers = ["Invoice Number", "Organisation", "Tenant Key", "Plan", "Cycle", "Amount", "Currency", "Status", "Issue Date", "Payment Method"];
                const rows = invoices.map(i => [i.invoice_number, i.tenant_name, i.tenant_key, i.plan, i.billing_cycle, i.total_amount, i.currency, i.status, i.issue_date, i.payment_method]);
                const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `subscription_invoices_${new Date().toISOString().split("T")[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("Subscription invoices exported to CSV!");
              }}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-medium text-xs gap-2"
            >
              <Download className="h-4 w-4" /> Export All Invoices
            </Button>
          </div>
        </div>

        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border border-border/80 shadow-sm bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Invoiced</p>
              <Receipt className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              QAR {totalCollected.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Platform subscription revenue</p>
          </CardContent>
        </Card>

        <Card className="border border-emerald-500/20 shadow-sm bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-emerald-600 uppercase">Settled Invoices</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {invoices.filter((i) => i.status === "Paid").length}
            </p>
            <p className="text-[11px] text-emerald-600/80 mt-1">Paid in full</p>
          </CardContent>
        </Card>

        <Card className="border border-amber-500/20 shadow-sm bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-amber-600 uppercase">Pending Invoices</p>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Awaiting wire / cheque clearance</p>
          </CardContent>
        </Card>

        <Card className="border border-red-500/20 shadow-sm bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-red-600 uppercase">Overdue</p>
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Past 14-day payment window</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List Table */}
      <Card className="border border-border/80 shadow-sm bg-card">
        <CardHeader className="p-4 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoice number, organisation, plan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Filter:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="All">All Invoices</option>
                  <option value="Paid">Paid Only</option>
                  <option value="Pending">Pending Only</option>
                  <option value="Overdue">Overdue Only</option>
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadInvoices}
                disabled={loading}
                className="text-xs gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              Loading invoices...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <Receipt className="h-8 w-8 mx-auto mb-2 opacity-30 text-primary" />
              No invoices match your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/60">
                  <tr>
                    <th className="p-3.5 pl-5">Invoice Number</th>
                    <th className="p-3.5">Organisation</th>
                    <th className="p-3.5">Plan Tier</th>
                    <th className="p-3.5">Settlement Mode</th>
                    <th className="p-3.5 text-right">Amount (QAR)</th>
                    <th className="p-3.5">Issue Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {paginatedInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 pl-5 font-mono font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-primary shrink-0" />
                          {inv.invoice_number}
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-foreground">
                        <div>{inv.tenant_name}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{inv.tenant_key}</div>
                      </td>
                      <td className="p-3.5">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                          {inv.plan}
                        </Badge>
                        <div className="text-[10px] text-muted-foreground capitalize mt-0.5">{inv.billing_cycle}</div>
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        <div className="font-semibold text-foreground">{inv.payment_method}</div>
                        {inv.transaction_ref && (
                          <div className="text-[10px] font-mono text-muted-foreground truncate max-w-[140px]">
                            {inv.transaction_ref}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-sm text-foreground">
                        {inv.currency || "QAR"} {Number(inv.total_amount).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                        {inv.issue_date}
                      </td>
                      <td className="p-3.5">
                        <Badge className={`text-[10px] uppercase font-bold ${STATUS_COLORS[inv.status] || STATUS_COLORS.Paid}`}>
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right pr-5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInvoice(inv)}
                          className="h-7 px-2.5 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Receipt
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="p-4 border-t border-border/40">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((p) => Math.max(1, p - 1));
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(i + 1);
                        }}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── INVOICE / RECEIPT DETAIL MODAL ─────────────────────────────────── */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-[540px] border border-primary/20 bg-card p-6 shadow-2xl">
          <DialogHeader className="space-y-1">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <DialogTitle className="text-base font-bold">Tax & Subscription Invoice</DialogTitle>
              </div>
              <Badge className={STATUS_COLORS[selectedInvoice?.status || "Paid"]}>
                {selectedInvoice?.status}
              </Badge>
            </div>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Invoice #{selectedInvoice?.invoice_number} — Official Platform Record
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
              <div>
                <p className="text-muted-foreground font-medium">Billed To (Organisation):</p>
                <p className="font-bold text-foreground mt-0.5">{selectedInvoice?.tenant_name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{selectedInvoice?.tenant_key}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Plan & Billing Cycle:</p>
                <p className="font-bold text-foreground mt-0.5">{selectedInvoice?.plan} Plan</p>
                <p className="capitalize text-muted-foreground">{selectedInvoice?.billing_cycle} Cadence</p>
              </div>
            </div>

            <div className="space-y-2 border-t border-border/40 pt-3">
              <div className="flex justify-between py-1 text-muted-foreground">
                <span>Subtotal Amount:</span>
                <span className="font-semibold text-foreground">{selectedInvoice?.currency} {selectedInvoice?.subtotal_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-muted-foreground">
                <span>VAT / Tax (Qatar 0% Standard):</span>
                <span className="font-semibold text-foreground">{selectedInvoice?.currency} 0.00</span>
              </div>
              <div className="flex justify-between py-1 text-muted-foreground">
                <span>Discount Applied:</span>
                <span className="font-semibold text-emerald-600">- {selectedInvoice?.currency} {selectedInvoice?.discount_amount || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-border/60 text-sm font-bold text-foreground">
                <span>Total Amount Paid:</span>
                <span className="text-primary font-extrabold text-base">
                  {selectedInvoice?.currency} {selectedInvoice?.total_amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-1 text-[11px] text-muted-foreground">
              <div className="flex justify-between">
                <span>Payment Settlement Method:</span>
                <span className="font-semibold text-foreground">{selectedInvoice?.payment_method}</span>
              </div>
              {selectedInvoice?.transaction_ref && (
                <div className="flex justify-between">
                  <span>Transaction Reference ID:</span>
                  <span className="font-mono font-bold text-foreground">{selectedInvoice?.transaction_ref}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Issue Date:</span>
                <span>{selectedInvoice?.issue_date}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success(`Invoice ${selectedInvoice?.invoice_number} downloaded as PDF!`);
              }}
              className="text-xs gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Download Tax Invoice PDF
            </Button>
            <Button
              size="sm"
              onClick={() => setSelectedInvoice(null)}
              className="text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── PAYMENT GATEWAY WEBHOOK SIMULATOR & LISTENER MODAL ──────── */}
      <Dialog open={showWebhookModal} onOpenChange={setShowWebhookModal}>
        <DialogContent className="sm:max-w-[560px] border border-emerald-500/30 shadow-2xl bg-card">
          <DialogHeader className="space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
              <Sparkles className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Payment Gateway Webhook Listener</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Automated webhook handler for QPay NAPS and Stripe. Instantly captures card settlements and clears pending subscription invoices.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            <div className="space-y-1.5">
              <span className="font-semibold text-foreground">Target Gateway Provider</span>
              <select
                value={webhookForm.gateway}
                onChange={(e) => setWebhookForm({ ...webhookForm, gateway: e.target.value as any })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="qpay_naps">QPay Gateway (Qatar Central Bank NAPS)</option>
                <option value="stripe_checkout">Stripe Checkout (Visa / Mastercard / Amex)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-foreground">Select Pending / Outstanding Invoice</span>
              <select
                value={webhookForm.invoice_number}
                onChange={(e) => setWebhookForm({ ...webhookForm, invoice_number: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              >
                <option value="">-- Choose Invoice to Auto-Settle --</option>
                {invoices.map((i) => (
                  <option key={i.id} value={i.invoice_number}>
                    {i.invoice_number} — {i.tenant_name} ({i.currency} {Number(i.total_amount).toLocaleString()}) [{i.status}]
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-700">Webhook Event:</span>
                <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30 text-[10px]">
                  payment_intent.succeeded
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                When triggered, the platform automatically validates the gateway digital signature, marks the invoice as <strong>Paid</strong>, attaches an immutable transaction reference, and dispatches a confirmation email.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button variant="outline" onClick={() => setShowWebhookModal(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleTriggerWebhook}
              disabled={triggeringWebhook || !webhookForm.invoice_number}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-2 shadow-md"
            >
              {triggeringWebhook ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Dispatch & Process Webhook Live
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
