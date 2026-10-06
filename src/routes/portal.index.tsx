import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Home, CreditCard, Wrench, FileText, CalendarCheck2, Shield,
  ChevronRight, AlertTriangle, CheckCircle2, Clock, Building2,
  ArrowRight, Bell, UserCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { tenantLease, tenantInvoices, tickets, pdcCheques, formatQAR } from "@/lib/mock-data";

export const Route = createFileRoute("/portal/")({
  head: () => ({ meta: [{ title: "My Home — ZYNO Tenant Portal" }] }),
  component: PortalHome,
});

function PortalHome() {
  const openTickets = tickets.filter(t => t.status !== "closed" && t.status !== "resolved");
  const overdueInvoices = tenantInvoices.filter(i => i.status === "overdue");
  const outstandingInvoices = tenantInvoices.filter(i => i.status === "outstanding" || i.status === "overdue");
  const outstandingTotal = outstandingInvoices.reduce((s, i) => s + i.amount, 0);
  const nextDue = outstandingInvoices.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  const upcomingPdc = pdcCheques.filter(p => p.status === "upcoming").sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const daysUntilLeaseEnd = Math.ceil(
    (new Date(tenantLease.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.28_0.06_200)] via-[oklch(0.32_0.08_195)] to-[oklch(0.22_0.05_210)] p-6 text-white sm:p-8">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, oklch(0.8 0.1 195), transparent 60%)" }} />
        <div className="relative">
          <p className="text-xs uppercase tracking-widest opacity-70">
            {tenantLease.property} &middot; {tenantLease.unit}
          </p>
          <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">Hello, Khalid 👋</h2>
          <p className="mt-2 max-w-xl text-sm opacity-80">
            {openTickets.length > 0
              ? `You have ${openTickets.length} open maintenance request${openTickets.length > 1 ? "s" : ""}.`
              : "All maintenance requests are resolved."}{" "}
            {overdueInvoices.length > 0
              ? <span className="font-semibold text-rose-300">⚠ {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? "s" : ""} need attention.</span>
              : "Your account is in good standing."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild size="sm" className="bg-white text-[oklch(0.28_0.06_200)] hover:bg-white/90">
              <Link to="/portal/payments">Pay Now</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link to="/portal/tickets">Report Issue</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link to="/portal/lease">View Lease</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Outstanding Balance"
          value={formatQAR(outstandingTotal)}
          hint={nextDue ? `Next due ${nextDue.dueDate}` : "No outstanding balance"}
          icon={<CreditCard className="h-5 w-5" />}
          tone={overdueInvoices.length > 0 ? "danger" : outstandingTotal > 0 ? "warn" : "success"}
          to="/portal/payments"
        />
        <KpiCard
          label="Open Maintenance"
          value={String(openTickets.length)}
          hint={openTickets[0] ? openTickets[0].subject.slice(0, 36) + "…" : "No open tickets"}
          icon={<Wrench className="h-5 w-5" />}
          tone={openTickets.length > 0 ? "warn" : "success"}
          to="/portal/tickets"
        />
        <KpiCard
          label="Lease Expires In"
          value={`${daysUntilLeaseEnd}d`}
          hint={`${tenantLease.endDate} · ${tenantLease.renewalStatus === "none" ? "No renewal initiated" : tenantLease.renewalStatus}`}
          icon={<Building2 className="h-5 w-5" />}
          tone={daysUntilLeaseEnd < 90 ? "warn" : "neutral"}
          to="/portal/lease"
        />
        <KpiCard
          label="Next PDC Cheque"
          value={upcomingPdc[0] ? formatQAR(upcomingPdc[0].amount) : "—"}
          hint={upcomingPdc[0] ? `${upcomingPdc[0].installmentLabel} · ${upcomingPdc[0].dueDate}` : "All cheques cleared"}
          icon={<Shield className="h-5 w-5" />}
          tone="neutral"
          to="/portal/payments"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="font-semibold">Recent Maintenance Tickets</h3>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/portal/tickets">All tickets <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </div>
            <ul className="divide-y divide-border">
              {tickets.slice(0, 4).map(t => (
                <li key={t.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors">
                  <div className={`flex-shrink-0 h-2 w-2 rounded-full ${
                    t.status === "in_progress" ? "bg-amber-400" :
                    t.status === "resolved" || t.status === "closed" ? "bg-emerald-500" : "bg-sky-400"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.category} · {t.complaintArea} · {t.createdAt}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                    t.status === "in_progress" ? "bg-amber-100 text-amber-700" :
                    t.status === "resolved" ? "bg-emerald-100 text-emerald-700" :
                    t.status === "closed" ? "bg-muted text-muted-foreground" : "bg-sky-100 text-sky-700"
                  }`}>{t.status.replace("_", " ")}</span>
                </li>
              ))}
              {tickets.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                  <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                  No maintenance tickets — great condition!
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Lease Summary */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">My Lease</h3>
                <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <Link to="/portal/lease">Details <ChevronRight className="h-3 w-3" /></Link>
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <Row k="Contract" v={tenantLease.contractNumber} />
                <Row k="Unit" v={`${tenantLease.unit} · ${tenantLease.floor}`} />
                <Row k="Annual Rent" v={formatQAR(tenantLease.annualRent)} />
                <Row k="Lease End" v={tenantLease.endDate} />
                <Row k="Notice Period" v={`${tenantLease.noticePeriodDays} days`} />
              </div>
              <div className="mt-4 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                <Clock className="mb-1 h-3.5 w-3.5" />
                Lease expires in <span className="font-semibold text-foreground">{daysUntilLeaseEnd} days</span>. Contact your property manager to discuss renewal.
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold">Quick Actions</h3>
              <div className="space-y-1">
                {[
                  { to: "/portal/documents", label: "Download Lease Agreement", icon: <FileText className="h-3.5 w-3.5" /> },
                  { to: "/portal/tickets", label: "Report a Maintenance Issue", icon: <Wrench className="h-3.5 w-3.5" /> },
                  { to: "/portal/bookings", label: "Book a Facility", icon: <CalendarCheck2 className="h-3.5 w-3.5" /> },
                ].map(item => (
                  <Button key={item.to} asChild variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
                    <Link to={item.to}>{item.icon}{item.label}</Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, hint, icon, tone, to }: {
  label: string; value: string; hint: string; icon: React.ReactNode;
  tone: "success" | "warn" | "danger" | "neutral"; to: string;
}) {
  const colors = {
    success: "text-emerald-600 bg-emerald-500/10",
    warn: "text-amber-600 bg-amber-500/10",
    danger: "text-rose-600 bg-rose-500/10",
    neutral: "text-sky-600 bg-sky-500/10",
  };
  return (
    <Link to={to}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
            <div className={`rounded-lg p-2 ${colors[tone]}`}>{icon}</div>
          </div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground truncate">{hint}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right">{v}</span>
    </div>
  );
}
