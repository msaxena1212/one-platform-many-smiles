import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Download, AlertTriangle, CheckCircle2, Clock, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { payments, tenantInvoices, pdcCheques, tenantLease, formatQAR, type Payment } from "@/lib/mock-data";

export const Route = createFileRoute("/portal/payments")({
  head: () => ({ meta: [{ title: "Payments — ZYNO Tenant Portal" }] }),
  component: PaymentsPage,
});

const methodColor: Record<Payment["method"], string> = {
  SADAD: "bg-primary/10 text-primary",
  Mada: "bg-gold/15 text-gold-foreground",
  "Apple Pay": "bg-foreground/5 text-foreground",
  "STC Pay": "bg-emerald-100 text-emerald-700",
  "Bank Transfer": "bg-secondary text-secondary-foreground",
  "QNB Online": "bg-sky-100 text-sky-700",
  Cheque: "bg-purple-100 text-purple-700",
};

function PaymentsPage() {
  const overdueInvoices = tenantInvoices.filter(i => i.status === "overdue");
  const outstandingInvoices = tenantInvoices.filter(i => i.status === "outstanding" || i.status === "overdue");
  const paidInvoices = tenantInvoices.filter(i => i.status === "paid");
  const outstandingTotal = outstandingInvoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const upcomingPdc = pdcCheques.filter(p => p.status === "upcoming");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredPayments = filterStatus === "all" ? payments : payments.filter(p => p.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Overdue Alert */}
      {overdueInvoices.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div className="text-sm">
            <p className="font-semibold text-rose-800">Overdue Invoices Require Attention</p>
            <p className="text-rose-700 mt-0.5">
              You have {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? "s" : ""} totalling {formatQAR(overdueInvoices.reduce((s, i) => s + i.amount, 0))}. Late fees may apply.
            </p>
          </div>
          <Button size="sm" className="ml-auto shrink-0 bg-rose-600 hover:bg-rose-700" onClick={() => toast("Redirecting to payment gateway...")}>Pay Now</Button>
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Outstanding Balance" value={formatQAR(outstandingTotal)} tone={overdueInvoices.length > 0 ? "danger" : outstandingTotal > 0 ? "warn" : "success"} hint={`${outstandingInvoices.length} invoices pending`} />
        <Kpi label="Total Paid (This Year)" value={formatQAR(totalPaid)} tone="success" hint={`${paidInvoices.length} receipts issued`} />
        <Kpi label="Annual Rent" value={formatQAR(tenantLease.annualRent)} tone="neutral" hint={`${tenantLease.installments} installments · ${formatQAR(tenantLease.installmentAmount)} each`} />
        <Kpi label="Upcoming PDC Cheques" value={String(upcomingPdc.length)} tone="neutral" hint={upcomingPdc[0] ? `Next: ${upcomingPdc[0].dueDate}` : "All submitted"} />
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="pdc">PDC Cheques</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardContent className="p-0">
              <div className="border-b border-border px-5 py-4">
                <h3 className="font-semibold">Outstanding Invoices</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Tap Pay Now to proceed to payment gateway</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Invoice</th>
                      <th className="px-5 py-3 font-medium">Description</th>
                      <th className="px-5 py-3 font-medium">Due Date</th>
                      <th className="px-5 py-3 font-medium text-right">Amount</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {tenantInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{inv.invoiceNumber}</td>
                        <td className="px-5 py-3 font-medium">{inv.description}</td>
                        <td className="px-5 py-3 text-muted-foreground">{inv.dueDate}</td>
                        <td className="px-5 py-3 text-right font-semibold">{formatQAR(inv.amount)}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                            inv.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                            inv.status === "overdue" ? "bg-rose-100 text-rose-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>{inv.status}</span>
                        </td>
                        <td className="px-5 py-3">
                          {inv.status !== "paid" ? (
                            <Button size="sm" className="h-7 text-xs" onClick={() => toast(`Payment initiated for ${inv.invoiceNumber}`)}>Pay Now</Button>
                          ) : (
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => toast(`Receipt for ${inv.invoiceNumber} downloaded.`)}>
                              <Download className="h-3 w-3" /> Receipt
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

        {/* PDC Tab */}
        <TabsContent value="pdc">
          <Card>
            <CardContent className="p-0">
              <div className="border-b border-border px-5 py-4">
                <h3 className="font-semibold">Post-Dated Cheque (PDC) Schedule</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Cheques submitted to {tenantLease.landlord} for the lease period.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Cheque No.</th>
                      <th className="px-5 py-3 font-medium">Bank</th>
                      <th className="px-5 py-3 font-medium">Installment</th>
                      <th className="px-5 py-3 font-medium">Due Date</th>
                      <th className="px-5 py-3 font-medium text-right">Amount</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {pdcCheques.map(pdc => (
                      <tr key={pdc.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs">{pdc.chequeNumber}</td>
                        <td className="px-5 py-3 text-muted-foreground">{pdc.bank}</td>
                        <td className="px-5 py-3 font-medium">{pdc.installmentLabel}</td>
                        <td className="px-5 py-3 text-muted-foreground">{pdc.dueDate}</td>
                        <td className="px-5 py-3 text-right font-semibold">{formatQAR(pdc.amount)}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                            pdc.status === "cleared" ? "bg-emerald-100 text-emerald-700" :
                            pdc.status === "upcoming" ? "bg-sky-100 text-sky-700" :
                            pdc.status === "bounced" ? "bg-rose-100 text-rose-700" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {pdc.status === "cleared" ? <CheckCircle2 className="h-2.5 w-2.5" /> :
                             pdc.status === "upcoming" ? <Clock className="h-2.5 w-2.5" /> : null}
                            {pdc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-muted/30 text-xs text-muted-foreground border-t border-border">
                Total cheques: {pdcCheques.length} &middot; Cleared: {pdcCheques.filter(p => p.status === "cleared").length} &middot; Upcoming: {pdcCheques.filter(p => p.status === "upcoming").length}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <h3 className="font-semibold">Payment History</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">All receipts on your account</p>
                </div>
                <div className="flex gap-2">
                  {["all", "completed", "pending", "failed"].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize transition-colors ${
                        filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Receipt</th>
                      <th className="px-5 py-3 font-medium">Description</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Method</th>
                      <th className="px-5 py-3 font-medium text-right">Amount</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {filteredPayments.map(p => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.reference}</td>
                        <td className="px-5 py-3 text-muted-foreground text-xs">{p.description ?? "—"}</td>
                        <td className="px-5 py-3 text-muted-foreground">{p.date}</td>
                        <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${methodColor[p.method]}`}>{p.method}</span></td>
                        <td className="px-5 py-3 text-right font-semibold">{formatQAR(p.amount)}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                            p.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                            p.status === "pending" ? "bg-amber-100 text-amber-700" :
                            p.status === "failed" ? "bg-rose-100 text-rose-700" : "bg-muted text-muted-foreground"
                          }`}>{p.status}</span>
                        </td>
                        <td className="px-5 py-3">
                          {p.status === "completed" && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => toast(`Receipt ${p.reference} downloaded.`)}>
                              <Download className="h-3 w-3" /> Receipt
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredPayments.length === 0 && (
                      <tr><td colSpan={7} className="px-5 py-10 text-center text-muted-foreground text-sm">No payments found for this filter.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: "success" | "warn" | "danger" | "neutral" }) {
  const colors = { success: "border-l-emerald-500", warn: "border-l-amber-500", danger: "border-l-rose-500", neutral: "border-l-sky-500" };
  return (
    <Card className={`border-l-4 ${colors[tone]}`}>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-bold">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground truncate">{hint}</p>
      </CardContent>
    </Card>
  );
}
